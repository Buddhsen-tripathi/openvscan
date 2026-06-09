"use client";

import { ScanType } from "@openvscan/types";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useStartScanMutation } from "@/lib/api";

interface CreateScanFormProps {
  projectId: string;
  onScanStarted?: (scanId: string) => void;
}

export function CreateScanForm({
  projectId,
  onScanStarted,
}: CreateScanFormProps) {
  const [target, setTarget] = useState("");
  const [scanners, setScanners] = useState<ScanType[]>([
    ScanType.STATIC_ANALYSIS,
  ]);
  const navigate = useNavigate();
  const startScan = useStartScanMutation();

  const availableScanners = [
    { type: ScanType.STATIC_ANALYSIS, label: "Static Analysis (Semgrep)" },
    { type: ScanType.DEPENDENCY_AUDIT, label: "Dependency Audit (Trivy)" },
    { type: ScanType.CONTAINER, label: "Container Scan (Trivy)" },
    { type: ScanType.DAST, label: "DAST (OWASP ZAP)" },
  ];

  const handleScannerToggle = (type: ScanType) => {
    setScanners((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!target) return;
    if (scanners.length === 0) {
      alert("Please select at least one scanner");
      return;
    }

    try {
      const data = await startScan.mutateAsync({ projectId, target, scanners });
      if (onScanStarted) {
        onScanStarted(data.scanId);
      } else {
        navigate({ to: "/dashboard/scans/$id", params: { id: data.scanId } });
      }
    } catch (error) {
      alert("Failed to start scan");
      console.error(error);
    }
  };

  return (
    <div className="rounded-xl p-5 border border-border/60 bg-card">
      <h3 className="text-lg font-bold text-card-foreground mb-4">
        Start New Scan
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="scan-target"
            className="block text-sm font-medium text-muted-foreground mb-1.5"
          >
            Target URL / Repository / Image
          </label>
          <input
            id="scan-target"
            type="text"
            required
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50 transition-all"
            placeholder="e.g., https://github.com/expressjs/express or nginx:latest"
          />
        </div>

        <fieldset className="mb-6">
          <legend className="block text-sm font-medium text-muted-foreground mb-2">
            Scanners
          </legend>
          <div className="space-y-2.5">
            {availableScanners.map(({ type, label }) => (
              <label
                key={type}
                className="flex items-center space-x-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={scanners.includes(type)}
                  onChange={() => handleScannerToggle(type)}
                  className="rounded border-input accent-primary focus:ring-ring"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={startScan.isPending || !target || scanners.length === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {startScan.isPending ? "Starting Scan..." : "Start Scan"}
        </button>
      </form>
    </div>
  );
}
