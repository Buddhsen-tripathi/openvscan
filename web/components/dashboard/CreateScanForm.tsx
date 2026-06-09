import { ScanType } from "@openvscan/types";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useStartScanMutation } from "@/lib/api";

interface CreateScanFormProps {
  projectId: string;
  onScanStarted?: (scanId: string) => void;
}

const availableScanners = [
  { type: ScanType.STATIC_ANALYSIS, label: "Static Analysis", tool: "Semgrep" },
  { type: ScanType.DEPENDENCY_AUDIT, label: "Dependency Audit", tool: "Trivy" },
  { type: ScanType.CONTAINER, label: "Container Scan", tool: "Trivy" },
  { type: ScanType.DAST, label: "DAST", tool: "OWASP ZAP" },
];

export function CreateScanForm({
  projectId,
  onScanStarted,
}: CreateScanFormProps) {
  const [target, setTarget] = useState("");
  const [scanners, setScanners] = useState<ScanType[]>([
    ScanType.STATIC_ANALYSIS,
  ]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const startScan = useStartScanMutation();

  const toggle = (type: ScanType) =>
    setScanners((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!target || scanners.length === 0) return;
    try {
      const data = await startScan.mutateAsync({ projectId, target, scanners });
      if (onScanStarted) onScanStarted(data.scanId);
      else navigate({ to: "/dashboard/scans/$id", params: { id: data.scanId } });
    } catch {
      setError("Failed to start scan. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Start a scan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="scan-target">Target URL / repository / image</Label>
            <Input
              id="scan-target"
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="github.com/expressjs/express or nginx:latest"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-foreground">
              Scanners
            </legend>
            <div className="grid gap-2">
              {availableScanners.map(({ type, label, tool }) => {
                const active = scanners.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggle(type)}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "border-primary/50 bg-accent text-accent-foreground"
                        : "border-border hover:bg-accent/50",
                    )}
                  >
                    <span className="font-medium">{label}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {tool}
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-[4px] border",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {active && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Button
            type="submit"
            className="w-full"
            disabled={startScan.isPending || !target || scanners.length === 0}
          >
            {startScan.isPending ? "Starting scan…" : "Start scan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
