// Stateless scanner HTTP server. No npm deps — Node built-ins + the Trivy CLI.
// POST /scan { target, scanners } -> { findings, rawOutput }
// GET  /health -> 200
import { createServer } from "node:http";
import { execFile } from "node:child_process";

const PORT = Number(process.env.PORT) || 8080;
const SCAN_TIMEOUT_MS = Number(process.env.SCAN_TIMEOUT_MS) || 10 * 60 * 1000;

function run(cmd, args, timeout) {
  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      args,
      { timeout, maxBuffer: 64 * 1024 * 1024 },
      (err, stdout, stderr) => {
        // Trivy exits non-zero on some findings configs; tolerate if we got JSON.
        if (err && !stdout) return reject(new Error(stderr || err.message));
        resolve(stdout);
      },
    );
  });
}

function mapSeverity(sev) {
  switch (String(sev || "").toUpperCase()) {
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "MEDIUM":
      return "medium";
    case "LOW":
      return "low";
    default:
      return "info";
  }
}

// Choose the Trivy subcommand from the target shape.
function trivySubcommand(target) {
  if (/^https?:\/\//i.test(target) || target.endsWith(".git")) return "repo";
  if (target.includes("/") && !target.startsWith("/")) return "image";
  return "fs";
}

function parseFindings(raw) {
  const findings = [];
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return findings;
  }
  if (!data.Results) return findings;
  for (const result of data.Results) {
    if (!result.Vulnerabilities) continue;
    for (const v of result.Vulnerabilities) {
      findings.push({
        title: v.Title || v.VulnerabilityID,
        description: v.Description || v.VulnerabilityID,
        severity: mapSeverity(v.Severity),
        location: result.Target,
        remediation: `Upgrade to ${v.FixedVersion || "latest version"}`,
        tool: "trivy",
      });
    }
  }
  return findings;
}

async function scan(target) {
  const sub = trivySubcommand(target);
  const args = [sub, "--format", "json", "--quiet", "--no-progress"];
  if (sub !== "image") args.push("--scanners", "vuln");
  args.push(target);
  const raw = await run("trivy", args, SCAN_TIMEOUT_MS);
  return { findings: parseFindings(raw), rawOutput: raw };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 1_000_000) reject(new Error("Body too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const json = (status, obj) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(obj));
  };

  if (req.method === "GET" && req.url === "/health") return json(200, { ok: true });

  if (req.method === "POST" && req.url === "/scan") {
    try {
      const { target } = JSON.parse((await readBody(req)) || "{}");
      if (!target) return json(400, { error: "target is required" });
      const result = await scan(target);
      return json(200, result);
    } catch (e) {
      return json(500, { error: e?.message || "scan failed" });
    }
  }

  return json(404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`scanner listening on :${PORT}`);
});
