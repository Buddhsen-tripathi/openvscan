import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { getDb, requireUserId, schema } from "@/lib/db";
import { accessibleRepos, installUrl, isGithubConfigured } from "@/lib/github";

/* ------------------------- Connection / install ------------------------- */

export const getGithubConnection = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const db = getDb();
    const installations = await db.query.githubInstallation.findMany({
      where: eq(schema.githubInstallation.userId, userId),
    });
    return {
      configured: isGithubConfigured(),
      installUrl: installUrl(),
      installations,
    };
  },
);

/** Repos the user's installation(s) can access that aren't connected yet. */
export const listConnectableRepos = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const db = getDb();
    const installations = await db.query.githubInstallation.findMany({
      where: eq(schema.githubInstallation.userId, userId),
    });
    if (installations.length === 0) return [];

    const connected = await db.query.repository.findMany({
      where: eq(schema.repository.userId, userId),
      columns: { githubRepoId: true },
    });
    const connectedIds = new Set(connected.map((r) => r.githubRepoId));

    const results: Array<{
      githubRepoId: string;
      fullName: string;
      owner: string;
      name: string;
      defaultBranch: string;
      private: boolean;
      installationRowId: string;
    }> = [];
    for (const inst of installations) {
      try {
        const repos = await accessibleRepos(inst.installationId);
        for (const r of repos) {
          if (connectedIds.has(r.githubRepoId)) continue;
          results.push({ ...r, installationRowId: inst.id });
        }
      } catch {
        /* skip installations we can't reach */
      }
    }
    return results;
  },
);

/* ------------------------------ Repositories ----------------------------- */

export const connectRepository = createServerFn({ method: "POST" })
  .validator((githubRepoId: string) => githubRepoId)
  .handler(async ({ data: githubRepoId }) => {
    const userId = await requireUserId();
    const db = getDb();

    const installations = await db.query.githubInstallation.findMany({
      where: eq(schema.githubInstallation.userId, userId),
    });

    // Find the repo + its installation among everything the user can access.
    for (const inst of installations) {
      const repos = await accessibleRepos(inst.installationId);
      const match = repos.find((r) => r.githubRepoId === githubRepoId);
      if (!match) continue;

      const existing = await db.query.repository.findFirst({
        where: and(
          eq(schema.repository.userId, userId),
          eq(schema.repository.githubRepoId, githubRepoId),
        ),
      });
      if (existing) return existing;

      const id = crypto.randomUUID();
      await db.insert(schema.repository).values({
        id,
        userId,
        installationId: inst.id,
        githubRepoId: match.githubRepoId,
        owner: match.owner,
        name: match.name,
        fullName: match.fullName,
        defaultBranch: match.defaultBranch,
        private: match.private,
        scanMode: "manual",
        branchFilter: match.defaultBranch,
        enabledScanners: ["dependency_audit"],
      });
      const row = await db.query.repository.findFirst({
        where: eq(schema.repository.id, id),
      });
      return row!;
    }
    throw new Error("Repository not accessible by the GitHub App");
  });

export const listRepositories = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const db = getDb();
    return db.query.repository.findMany({
      where: eq(schema.repository.userId, userId),
      orderBy: [desc(schema.repository.createdAt)],
    });
  },
);

export const getRepository = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    const db = getDb();
    const repo = await db.query.repository.findFirst({
      where: and(
        eq(schema.repository.id, id),
        eq(schema.repository.userId, userId),
      ),
      with: {
        scans: { orderBy: [desc(schema.scan.createdAt)], limit: 20 },
      },
    });
    if (!repo) throw new Error("Repository not found");
    return repo;
  });

export const updateRepositoryConfig = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      scanMode: "manual" | "automatic";
      branchFilter: string | null;
      enabledScanners: string[];
    }) => data,
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const db = getDb();

    const repo = await db.query.repository.findFirst({
      where: and(
        eq(schema.repository.id, data.id),
        eq(schema.repository.userId, userId),
      ),
    });
    if (!repo) throw new Error("Repository not found");

    if (data.scanMode !== "manual" && data.scanMode !== "automatic") {
      throw new Error("Invalid scan mode");
    }
    if (!data.enabledScanners?.length) {
      throw new Error("Select at least one scanner");
    }

    const branchFilter = data.branchFilter?.trim() || null;
    await db
      .update(schema.repository)
      .set({
        scanMode: data.scanMode,
        branchFilter,
        enabledScanners: data.enabledScanners,
      })
      .where(eq(schema.repository.id, data.id));

    const updated = await db.query.repository.findFirst({
      where: eq(schema.repository.id, data.id),
    });
    return updated!;
  });

/** Manually trigger a scan of a connected repo's default branch. */
export const startRepositoryScan = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    const db = getDb();
    const repo = await db.query.repository.findFirst({
      where: and(
        eq(schema.repository.id, id),
        eq(schema.repository.userId, userId),
      ),
      with: { installation: true },
    });
    if (!repo) throw new Error("Repository not found");

    const branch = repo.defaultBranch;
    const scanners =
      repo.enabledScanners.length > 0
        ? repo.enabledScanners
        : ["dependency_audit"];
    const config = {
      target: `https://github.com/${repo.owner}/${repo.name}.git`,
      scanners,
      // No prNumber on a manual run — results land in the dashboard.
      github: {
        installationId: repo.installation.installationId,
        owner: repo.owner,
        repo: repo.name,
        branch,
        commitSha: "",
      },
    };
    const scanId = crypto.randomUUID();
    await db.insert(schema.scan).values({
      id: scanId,
      repositoryId: repo.id,
      status: "pending",
      config,
      trigger: "manual",
      branch,
    });
    await env.SCAN_QUEUE.send({ scanId, config });
    return { scanId, status: "pending", message: "Scan started" };
  });

export const disconnectRepository = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    const db = getDb();
    const repo = await db.query.repository.findFirst({
      where: and(
        eq(schema.repository.id, id),
        eq(schema.repository.userId, userId),
      ),
    });
    if (!repo) throw new Error("Repository not found");
    await db.delete(schema.repository).where(eq(schema.repository.id, id));
    return { message: "Repository disconnected" };
  });
