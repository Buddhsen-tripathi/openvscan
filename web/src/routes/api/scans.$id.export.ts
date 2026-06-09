import { createFileRoute } from "@tanstack/react-router";
import { getScan } from "@/lib/server";

type Finding = {
  id: string;
  title: string;
  description: string;
  severity: string;
  location?: string | null;
  remediation?: string | null;
};

function sarifLevel(severity: string) {
  return severity === "critical" || severity === "high"
    ? "error"
    : severity === "medium"
      ? "warning"
      : "note";
}

function toSarif(scan: { id: string; findings: Finding[] }) {
  return {
    $schema:
      "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "OpenVScan",
            version: "1.0.0",
            informationUri: "https://github.com/Buddhsen-tripathi/openvscan",
            rules: scan.findings.map((f) => ({
              id: f.id,
              shortDescription: { text: f.title },
              fullDescription: { text: f.description },
              defaultConfiguration: { level: sarifLevel(f.severity) },
            })),
          },
        },
        results: scan.findings.map((f) => ({
          ruleId: f.id,
          level: sarifLevel(f.severity),
          message: { text: f.description },
          locations: f.location
            ? [{ physicalLocation: { artifactLocation: { uri: f.location } } }]
            : [],
          fixes: f.remediation
            ? [{ description: { text: f.remediation } }]
            : [],
        })),
      },
    ],
  };
}

export const Route = createFileRoute("/api/scans/$id/export")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const format = url.searchParams.get("format") === "sarif"
          ? "sarif"
          : "json";

        let scan: Awaited<ReturnType<typeof getScan>>;
        try {
          scan = await getScan({ data: params.id });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Not found";
          const status = message === "Access denied" ? 403 : 404;
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const body =
          format === "sarif"
            ? toSarif(scan as { id: string; findings: Finding[] })
            : {
                scan: {
                  id: scan.id,
                  status: scan.status,
                  target: scan.config,
                  startedAt: scan.startedAt,
                  completedAt: scan.completedAt,
                },
                findings: scan.findings,
                exportedAt: new Date().toISOString(),
              };

        const ext = format === "sarif" ? "sarif" : "json";
        return new Response(JSON.stringify(body, null, 2), {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="openvscan-${scan.id}.${ext}"`,
          },
        });
      },
    },
  },
});
