'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ScanStatus, type Scan, type Finding, Severity } from '@openvscan/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ScanDetails extends Scan {
  findings: Finding[];
  logs?: { level: string; message: string; timestamp: Date }[];
}

export default function ScanResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [scan, setScan] = useState<ScanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Poll for updates if scan is running
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchScan() {
      try {
        const { data } = await api.scans.get(id);
        if (data) {
          setScan(data);
          // Stop polling if completed or failed
          if (data.status === ScanStatus.COMPLETED || data.status === ScanStatus.FAILED) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Failed to fetch scan', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScan();

    // Poll every 5 seconds if running
    interval = setInterval(() => {
      if (scan?.status === ScanStatus.RUNNING || scan?.status === ScanStatus.PENDING) {
        fetchScan();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, scan?.status]);

  if (isLoading && !scan) return <div className="p-6">Loading scan results...</div>;
  if (!scan) return <div className="p-6">Scan not found</div>;

  return (
    <>
      <header className="flex justify-between items-center bg-white p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Scan Results</h2>
          <p className="text-sm text-gray-500">{scan.config.target}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-bold
          ${
            scan.status === ScanStatus.COMPLETED
              ? 'bg-green-100 text-green-800'
              : scan.status === ScanStatus.FAILED
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {scan.status.toUpperCase()}
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        {/* Findings Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
            const count = scan.findings.filter((f) => f.severity.toUpperCase() === sev).length;
            const colors = {
              CRITICAL: 'bg-red-600',
              HIGH: 'bg-orange-500',
              MEDIUM: 'bg-yellow-500',
              LOW: 'bg-blue-500',
            };
            return (
              <div key={sev} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-xs font-bold mb-1">{sev}</div>
                <div
                  className={`text-2xl font-bold ${colors[sev as keyof typeof colors].replace('bg-', 'text-')}`}
                >
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Findings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-700">Findings</h3>
          </div>
          {scan.findings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No vulnerabilities found.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {scan.findings.map((finding) => (
                <div key={finding.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{finding.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold text-white
                      ${
                        finding.severity === Severity.CRITICAL
                          ? 'bg-red-600'
                          : finding.severity === Severity.HIGH
                            ? 'bg-orange-500'
                            : finding.severity === Severity.MEDIUM
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                      }`}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{finding.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Tool: {finding.tool}</span>
                    <span>Location: {finding.location || 'N/A'}</span>
                  </div>
                  {finding.remediation && (
                    <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <span className="font-bold text-blue-800 text-xs block mb-1">
                        Remediation:
                      </span>
                      <p className="text-blue-900 text-sm">{finding.remediation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs Section */}
        {scan.logs && scan.logs.length > 0 && (
          <div className="bg-gray-900 rounded-xl shadow-sm overflow-hidden text-gray-300 font-mono text-sm">
            <div className="px-6 py-3 border-b border-gray-800 bg-gray-800 text-gray-400 font-bold text-xs uppercase">
              Scan Logs
            </div>
            <div className="p-4 max-h-64 overflow-y-auto space-y-1">
              {scan.logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-600 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={
                      log.level === 'error'
                        ? 'text-red-400'
                        : log.level === 'warn'
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
