import { Container } from "@cloudflare/containers";

/**
 * Stateless scanner container. Runs Trivy and returns findings over HTTP.
 * All persistence (D1, R2) is owned by this Worker, not the container.
 */
export class ScannerContainer extends Container {
  defaultPort = 8080;
  requiredPorts = [8080];
  sleepAfter = "5m";
  enableInternet = true; // Trivy downloads its vuln DB and clones repos
  pingEndpoint = "/health";
}

interface Env {
  DB: D1Database;
  ARTIFACTS: R2Bucket;
  SCANNER: DurableObjectNamespace<ScannerContainer>;
}

type ScanJob = {
  scanId: string;
  config: { target: string; scanners: string[] };
};

type RawFinding = {
  title: string;
  description: string;
  severity: string;
  location?: string;
  remediation?: string;
  tool: string;
};

// Drizzle stores `integer({ mode: "timestamp" })` as Unix epoch *seconds*.
const nowSec = () => Math.floor(Date.now() / 1000);
const uuid = () => crypto.randomUUID();

async function logLine(
  db: D1Database,
  scanId: string,
  level: "info" | "warn" | "error",
  message: string,
) {
  await db
    .prepare(
      "INSERT INTO scan_log (id, scan_id, level, message, timestamp) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(uuid(), scanId, level, message, nowSec())
    .run()
    .catch(() => {});
}

async function setStatus(
  db: D1Database,
  scanId: string,
  status: string,
  extra: { startedAt?: number; completedAt?: number; artifactKey?: string } = {},
) {
  await db
    .prepare(
      "UPDATE scan SET status = ?, updated_at = ?, started_at = COALESCE(?, started_at), completed_at = COALESCE(?, completed_at), artifact_key = COALESCE(?, artifact_key) WHERE id = ?",
    )
    .bind(
      status,
      nowSec(),
      extra.startedAt ?? null,
      extra.completedAt ?? null,
      extra.artifactKey ?? null,
      scanId,
    )
    .run();
}

async function isCancelled(db: D1Database, scanId: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT cancel_requested FROM scan WHERE id = ?")
    .bind(scanId)
    .first<{ cancel_requested: number }>();
  return Boolean(row?.cancel_requested);
}

async function process(job: ScanJob, env: Env) {
  const db = env.DB;
  const { scanId, config } = job;

  const scanRow = await db
    .prepare("SELECT status, cancel_requested FROM scan WHERE id = ?")
    .bind(scanId)
    .first<{ status: string; cancel_requested: number }>();
  if (!scanRow) return; // scan deleted; nothing to do
  if (scanRow.cancel_requested || scanRow.status === "cancelled") {
    await setStatus(db, scanId, "cancelled", { completedAt: nowSec() });
    return;
  }

  await setStatus(db, scanId, "running", { startedAt: nowSec() });
  await logLine(db, scanId, "info", `Scanning ${config.target} with Trivy`);

  // Run the scan in a per-scan container instance.
  const container = env.SCANNER.getByName(scanId);
  await container.startAndWaitForPorts();
  const res = await container.fetch(
    new Request("http://scanner/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }),
  );
  if (!res.ok) {
    throw new Error(`Scanner returned ${res.status}: ${await res.text()}`);
  }
  const { findings, rawOutput } = (await res.json()) as {
    findings: RawFinding[];
    rawOutput: string;
  };

  // Persist the raw scanner output to R2.
  const artifactKey = `scans/${scanId}/trivy.json`;
  await env.ARTIFACTS.put(artifactKey, rawOutput);

  // Honour a cancel requested while the scan was running.
  if (await isCancelled(db, scanId)) {
    await setStatus(db, scanId, "cancelled", {
      completedAt: nowSec(),
      artifactKey,
    });
    await logLine(db, scanId, "warn", "Scan cancelled");
    return;
  }

  // Persist findings via a batched D1 transaction.
  if (findings.length) {
    const created = nowSec();
    const stmt = db.prepare(
      "INSERT INTO finding (id, scan_id, title, description, severity, location, remediation, tool, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    await db.batch(
      findings.map((f) =>
        stmt.bind(
          uuid(),
          scanId,
          f.title,
          f.description,
          f.severity,
          f.location ?? null,
          f.remediation ?? null,
          f.tool,
          created,
        ),
      ),
    );
  }

  await setStatus(db, scanId, "completed", {
    completedAt: nowSec(),
    artifactKey,
  });
  await logLine(db, scanId, "info", `Completed with ${findings.length} finding(s)`);
}

export default {
  async queue(batch: MessageBatch<ScanJob>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      try {
        await process(msg.body, env);
        msg.ack();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Mark failed + ack: scanner/target errors aren't fixed by retrying.
        try {
          await setStatus(env.DB, msg.body.scanId, "failed", {
            completedAt: nowSec(),
          });
          await logLine(env.DB, msg.body.scanId, "error", `Scan failed: ${message}`);
        } catch {
          /* ignore */
        }
        msg.ack();
      }
    }
  },
} satisfies ExportedHandler<Env, ScanJob>;
