import { env } from "cloudflare:workers";
import { findOpenPrForBranch, verifyWebhookSignature } from "@openvscan/github";
import { createFileRoute } from "@tanstack/react-router";
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { octokitForInstallation } from "@/lib/github";
import { getEnv } from "@/src/lib/env";

const ok = () => new Response("ok", { status: 200 });

/** A branch passes when the filter is empty (all) or lists it explicitly. */
function branchMatches(filter: string | null | undefined, branch: string) {
  if (!filter || !filter.trim()) return true;
  return filter
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean)
    .includes(branch);
}

type PushPayload = {
  ref: string;
  after: string;
  deleted?: boolean;
  repository: { id: number; name: string; owner: { login: string } };
  installation?: { id: number };
};

async function handlePush(payload: PushPayload) {
  if (payload.deleted) return; // branch deletion, nothing to scan
  if (!payload.ref.startsWith("refs/heads/")) return; // ignore tags
  const branch = payload.ref.slice("refs/heads/".length);
  const commitSha = payload.after;
  const githubRepoId = String(payload.repository.id);

  const db = getDb();
  const repo = await db.query.repository.findFirst({
    where: eq(schema.repository.githubRepoId, githubRepoId),
    with: { installation: true },
  });
  if (!repo) return; // repo not connected in OpenVScan
  if (repo.scanMode !== "automatic") return; // manual-only repo
  if (!branchMatches(repo.branchFilter, branch)) return;

  const owner = repo.owner;
  const name = repo.name;
  const installationId = repo.installation.installationId;

  // Best-effort: find the open PR for this branch so we can comment on it.
  let prNumber: number | undefined;
  try {
    const found = await findOpenPrForBranch(
      octokitForInstallation(installationId),
      owner,
      name,
      branch,
    );
    prNumber = found ?? undefined;
  } catch {
    /* leave prNumber undefined; findings still land in the dashboard */
  }

  const scanners =
    repo.enabledScanners.length > 0
      ? repo.enabledScanners
      : ["dependency_audit"];
  const github = {
    installationId,
    owner,
    repo: name,
    branch,
    commitSha,
    prNumber,
  };
  const config = {
    target: `https://github.com/${owner}/${name}.git`,
    scanners,
    github,
  };
  const scanId = crypto.randomUUID();

  await db.insert(schema.scan).values({
    id: scanId,
    repositoryId: repo.id,
    status: "pending",
    config,
    trigger: "push",
    branch,
    commitSha,
    prNumber: prNumber ?? null,
  });

  await env.SCAN_QUEUE.send({ scanId, config });
}

type InstallationRepoChange = {
  installation: { id: number };
  repositories_removed?: { id: number }[];
};

/** Drop repository rows GitHub tells us are no longer accessible. */
async function handleInstallationRepos(payload: InstallationRepoChange) {
  const removed = payload.repositories_removed ?? [];
  if (removed.length === 0) return;
  const db = getDb();
  await db.delete(schema.repository).where(
    inArray(
      schema.repository.githubRepoId,
      removed.map((r) => String(r.id)),
    ),
  );
}

async function handleInstallationDeleted(payload: {
  installation: { id: number };
}) {
  const db = getDb();
  // Cascades to the installation's repositories (and their scans).
  await db
    .delete(schema.githubInstallation)
    .where(
      eq(
        schema.githubInstallation.installationId,
        String(payload.installation.id),
      ),
    );
}

export const Route = createFileRoute("/api/github/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = getEnv("GITHUB_WEBHOOK_SECRET");
        const signature = request.headers.get("x-hub-signature-256");
        const event = request.headers.get("x-github-event");
        const raw = await request.text();

        if (!secret || !signature) {
          return new Response("webhook not configured", { status: 401 });
        }
        const valid = await verifyWebhookSignature(secret, raw, signature);
        if (!valid) return new Response("invalid signature", { status: 401 });

        const payload = JSON.parse(raw);

        try {
          switch (event) {
            case "push":
              await handlePush(payload as PushPayload);
              break;
            case "installation_repositories":
              await handleInstallationRepos(payload as InstallationRepoChange);
              break;
            case "installation":
              if (payload.action === "deleted") {
                await handleInstallationDeleted(payload);
              }
              break;
            default:
              break; // ignore other events
          }
        } catch (e) {
          // Never make GitHub retry on our own bug; log and ack.
          console.error("webhook handler error", event, e);
        }

        return ok();
      },
    },
  },
});
