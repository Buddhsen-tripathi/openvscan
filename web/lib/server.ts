import { env } from "cloudflare:workers";
import { ScanStatus } from "@openvscan/types";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray } from "drizzle-orm";
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
  const userProjects = await db.query.project.findMany({
    where: eq(schema.project.userId, userId),
    columns: { id: true },
  });
  if (userProjects.length === 0) return [];
  const projectIds = userProjects.map((p) => p.id);
  return db.query.scan.findMany({
    where: inArray(schema.scan.projectId, projectIds),
    with: { project: { columns: { id: true, name: true } } },
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
        findings: true,
        logs: { orderBy: (logs, { asc }) => [asc(logs.timestamp)] },
      },
    });
    if (!scan) throw new Error("Scan not found");
    if (scan.project.userId !== userId) throw new Error("Access denied");
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
      with: { project: { columns: { userId: true } } },
    });
    if (!scan) throw new Error("Scan not found");
    if (scan.project.userId !== userId) throw new Error("Access denied");

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
