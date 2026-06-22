import { env } from "cloudflare:workers";
import { ScanStatus } from "@openvscan/types";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb, requireUserId, schema } from "@/lib/db";

/* ----------------------------- Projects ----------------------------- */

export const listProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const db = getDb();
    return db.query.project.findMany({
      where: eq(schema.project.userId, userId),
      orderBy: [desc(schema.project.createdAt)],
    });
  },
);

export const getProject = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    const db = getDb();
    const project = await db.query.project.findFirst({
      where: and(
        eq(schema.project.id, id),
        eq(schema.project.userId, userId),
      ),
      with: {
        scans: { orderBy: [desc(schema.scan.createdAt)] },
      },
    });
    if (!project) throw new Error("Project not found");
    return project;
  });

export const createProject = createServerFn({ method: "POST" })
  .validator((data: { name: string; description?: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(schema.project).values({
      id,
      name: data.name,
      description: data.description || null,
      userId,
    });
    const project = await db.query.project.findFirst({
      where: eq(schema.project.id, id),
    });
    return project!;
  });

/* ------------------------------- Scans ------------------------------ */

export const listScans = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  const db = getDb();
  const [userProjects, userRepos] = await Promise.all([
    db.query.project.findMany({
      where: eq(schema.project.userId, userId),
      columns: { id: true },
    }),
    db.query.repository.findMany({
      where: eq(schema.repository.userId, userId),
      columns: { id: true },
    }),
  ]);
  const projectIds = userProjects.map((p) => p.id);
  const repoIds = userRepos.map((r) => r.id);
  if (projectIds.length === 0 && repoIds.length === 0) return [];

  const conditions = [];
  if (projectIds.length) conditions.push(inArray(schema.scan.projectId, projectIds));
  if (repoIds.length) conditions.push(inArray(schema.scan.repositoryId, repoIds));

  return db.query.scan.findMany({
    where: conditions.length === 1 ? conditions[0] : or(...conditions),
    with: {
      project: { columns: { id: true, name: true } },
      repository: { columns: { id: true, fullName: true } },
    },
    orderBy: [desc(schema.scan.createdAt)],
  });
});

export const getScan = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    const db = getDb();
    const scan = await db.query.scan.findFirst({
      where: eq(schema.scan.id, id),
      with: {
        project: true,
        repository: true,
        findings: true,
        logs: { orderBy: (logs, { asc }) => [asc(logs.timestamp)] },
      },
    });
    if (!scan) throw new Error("Scan not found");
    const ownerId = scan.project?.userId ?? scan.repository?.userId;
    if (ownerId !== userId) throw new Error("Access denied");
    return scan;
  });

export const startScan = createServerFn({ method: "POST" })
  .validator(
    (data: { projectId: string; target: string; scanners: string[] }) => data,
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const db = getDb();

    const project = await db.query.project.findFirst({
      where: and(
        eq(schema.project.id, data.projectId),
        eq(schema.project.userId, userId),
      ),
    });
    if (!project) throw new Error("Project not found");

    if (!data.target) throw new Error("Target is required");
    if (!data.scanners?.length) throw new Error("Select at least one scanner");

    const scanId = crypto.randomUUID();
    const config = { target: data.target, scanners: data.scanners };

    await db.insert(schema.scan).values({
      id: scanId,
      projectId: data.projectId,
      status: ScanStatus.PENDING,
      config,
    });

    // Dispatch to the Cloudflare Queue (consumer Worker runs the scanners).
    await env.SCAN_QUEUE.send({ scanId, config });

    return {
      scanId,
      status: ScanStatus.PENDING,
      target: data.target,
      timestamp: new Date().toISOString(),
      message: "Scan started successfully",
    };
  });

export const cancelScan = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    const db = getDb();

    const scan = await db.query.scan.findFirst({
      where: eq(schema.scan.id, id),
      with: {
        project: { columns: { userId: true } },
        repository: { columns: { userId: true } },
      },
    });
    if (!scan) throw new Error("Scan not found");
    const ownerId = scan.project?.userId ?? scan.repository?.userId;
    if (ownerId !== userId) throw new Error("Access denied");

    if (
      scan.status !== ScanStatus.PENDING &&
      scan.status !== ScanStatus.RUNNING
    ) {
      throw new Error(`Cannot cancel scan with status: ${scan.status}`);
    }

    // Cancel-via-flag: Cloudflare Queues has no random-access job removal, so
    // we set a flag the consumer checks. A still-pending scan is cancelled now.
    if (scan.status === ScanStatus.PENDING) {
      await db
        .update(schema.scan)
        .set({
          status: ScanStatus.CANCELLED,
          cancelRequested: true,
          completedAt: new Date(),
        })
        .where(eq(schema.scan.id, id));
      return { message: "Scan cancelled", status: ScanStatus.CANCELLED };
    }

    await db
      .update(schema.scan)
      .set({ cancelRequested: true })
      .where(eq(schema.scan.id, id));
    return {
      message: "Cancellation requested",
      status: scan.status,
    };
  });

/* ------------------------------ Profile ----------------------------- */

export const getProfile = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  const db = getDb();
  const [u, credential] = await Promise.all([
    db.query.user.findFirst({ where: eq(schema.user.id, userId) }),
    // A "credential" account means the user has a password (vs GitHub-only).
    db.query.account.findFirst({
      where: and(
        eq(schema.account.userId, userId),
        eq(schema.account.providerId, "credential"),
      ),
      columns: { id: true },
    }),
  ]);
  if (!u) throw new Error("User not found");
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    hasPassword: Boolean(credential),
  };
});

export const updateProfile = createServerFn({ method: "POST" })
  .validator((data: { name: string; image?: string | null }) => data)
  .handler(async ({ data }) => {
    // requireUserId both authorizes and ensures a session exists for the
    // Better-auth call below.
    await requireUserId();
    const name = data.name?.trim();
    if (!name) throw new Error("Name is required");
    const image = data.image?.trim() || null;
    await getAuth().api.updateUser({
      body: { name, image },
      headers: getRequestHeaders(),
    });
    return { success: true };
  });

export const changePassword = createServerFn({ method: "POST" })
  .validator(
    (data: { currentPassword: string; newPassword: string }) => data,
  )
  .handler(async ({ data }) => {
    await requireUserId();
    if (!data.currentPassword) throw new Error("Current password is required");
    if (!data.newPassword || data.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    await getAuth().api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      },
      headers: getRequestHeaders(),
    });
    return { success: true };
  });
