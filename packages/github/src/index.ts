import { createAppAuth } from "@octokit/auth-app";
import { verify } from "@octokit/webhooks-methods";
import { Octokit } from "octokit";

/**
 * Shared GitHub helpers for OpenVScan. Used by both the web Worker (webhook
 * handling, repo listing, install setup) and the scanner Worker (authenticated
 * clones, posting PR comments). Everything runs on the Cloudflare Workers
 * runtime via native fetch + Web Crypto.
 */

export interface AppCredentials {
  appId: string;
  privateKey: string;
}

export interface InstallationCredentials extends AppCredentials {
  installationId: string;
}

/** Octokit authenticated as the GitHub App itself (JWT) — for app-level calls. */
export function appOctokit(creds: AppCredentials): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: { appId: creds.appId, privateKey: creds.privateKey },
  });
}

/** Octokit authenticated as a specific installation — for repo-scoped calls. */
export function installationOctokit(creds: InstallationCredentials): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: creds.appId,
      privateKey: creds.privateKey,
      installationId: Number(creds.installationId),
    },
  });
}

/** Mint a raw installation access token (used to build an authenticated clone URL). */
export async function getInstallationToken(
  creds: InstallationCredentials,
): Promise<string> {
  const octokit = installationOctokit(creds);
  const auth = (await octokit.auth({ type: "installation" })) as {
    token: string;
  };
  return auth.token;
}

export interface InstallationAccount {
  login: string;
  type: "User" | "Organization";
}

/** Fetch the account (user/org) a given installation belongs to. */
export async function getInstallationAccount(
  octokit: Octokit,
  installationId: string,
): Promise<InstallationAccount> {
  const { data } = await octokit.request(
    "GET /app/installations/{installation_id}",
    { installation_id: Number(installationId) },
  );
  const account = data.account as { login: string; type?: string } | null;
  return {
    login: account?.login ?? "unknown",
    type: account?.type === "Organization" ? "Organization" : "User",
  };
}

export interface InstallationRepo {
  githubRepoId: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
}

/** List every repository the installation can access. */
export async function listInstallationRepos(
  octokit: Octokit,
): Promise<InstallationRepo[]> {
  const repos = await octokit.paginate("GET /installation/repositories");
  return repos.map((r) => ({
    githubRepoId: String(r.id),
    owner: r.owner.login,
    name: r.name,
    fullName: r.full_name,
    defaultBranch: r.default_branch ?? "main",
    private: r.private,
  }));
}

/** Return the number of an open PR whose head is `branch`, or null. */
export async function findOpenPrForBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
): Promise<number | null> {
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    state: "open",
    head: `${owner}:${branch}`,
    per_page: 1,
  });
  return data[0]?.number ?? null;
}

/** Post a top-level comment on a pull request (PRs are issues to this API). */
export async function postPrComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
): Promise<void> {
  await octokit.request(
    "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
    { owner, repo, issue_number: prNumber, body },
  );
}

/** Verify a GitHub webhook's `X-Hub-Signature-256` against the shared secret. */
export function verifyWebhookSignature(
  secret: string,
  payload: string,
  signature: string,
): Promise<boolean> {
  return verify(secret, payload, signature);
}

/** Clone URL with an installation token embedded (for private repos). */
export function authenticatedCloneUrl(
  owner: string,
  repo: string,
  token: string,
): string {
  return `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
}

export interface CommentFinding {
  title: string;
  severity: string;
  tool: string;
  location?: string | null;
}

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"] as const;
const SEVERITY_EMOJI: Record<string, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🔵",
  info: "⚪",
};

/** Build the markdown body posted as the PR findings summary. */
export function buildFindingsComment(opts: {
  scanId: string;
  repoFullName: string;
  branch: string;
  commitSha: string;
  findings: CommentFinding[];
  appUrl: string;
}): string {
  const { scanId, repoFullName, branch, commitSha, findings, appUrl } = opts;
  const counts = new Map<string, number>();
  for (const f of findings) {
    const s = f.severity.toLowerCase();
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  const shortSha = commitSha.slice(0, 7);
  const scanUrl = `${appUrl.replace(/\/$/, "")}/dashboard/scans/${scanId}`;

  if (findings.length === 0) {
    return [
      "## 🛡️ OpenVScan — no vulnerabilities found",
      "",
      `Scanned \`${repoFullName}\` @ \`${shortSha}\` (\`${branch}\`).`,
      "",
      `[View scan →](${scanUrl})`,
    ].join("\n");
  }

  const summaryLine = SEVERITY_ORDER.filter((s) => counts.get(s))
    .map((s) => `${SEVERITY_EMOJI[s]} **${counts.get(s)}** ${s}`)
    .join(" · ");

  const top = [...findings]
    .sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity.toLowerCase() as never) -
        SEVERITY_ORDER.indexOf(b.severity.toLowerCase() as never),
    )
    .slice(0, 10);

  const rows = top
    .map((f) => {
      const sev = f.severity.toLowerCase();
      const loc = f.location ? `\`${f.location}\`` : "—";
      return `| ${SEVERITY_EMOJI[sev] ?? ""} ${sev} | ${f.title.replace(/\|/g, "\\|")} | ${f.tool} | ${loc} |`;
    })
    .join("\n");

  return [
    `## 🛡️ OpenVScan — ${findings.length} finding${findings.length === 1 ? "" : "s"}`,
    "",
    `Scanned \`${repoFullName}\` @ \`${shortSha}\` (\`${branch}\`).`,
    "",
    summaryLine,
    "",
    "| Severity | Finding | Tool | Location |",
    "| --- | --- | --- | --- |",
    rows,
    "",
    findings.length > top.length
      ? `_…and ${findings.length - top.length} more._\n`
      : "",
    `[View full scan →](${scanUrl})`,
  ].join("\n");
}
