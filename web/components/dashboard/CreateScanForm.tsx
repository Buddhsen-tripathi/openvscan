'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { ScanType } from '@openvscan/types';
import { useRouter } from 'next/navigation';

interface CreateScanFormProps {
  projectId: string;
  onScanStarted?: (scanId: string) => void;
}

export function CreateScanForm({ projectId, onScanStarted }: CreateScanFormProps) {
  const [target, setTarget] = useState('');
  const [scanners, setScanners] = useState<ScanType[]>([ScanType.STATIC_ANALYSIS]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const availableScanners = [
    { type: ScanType.STATIC_ANALYSIS, label: 'Static Analysis (Trivy)' },
    { type: ScanType.DEPENDENCY_AUDIT, label: 'Dependency Audit' },
    { type: ScanType.CONTAINER, label: 'Container Scan' },
    // DAST not yet implemented in worker map, but let's keep it consistent with types if needed
  ];

  const handleScannerToggle = (type: ScanType) => {
    setScanners((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    if (scanners.length === 0) {
      alert('Please select at least one scanner');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await api.scans.start(projectId, target, scanners);

      if (error) {
        alert('Failed to start scan');
        console.error(error);
        return;
      }

      if (data) {
        if (onScanStarted) {
          onScanStarted(data.scanId);
        } else {
          router.push(`/dashboard/scans/${data.scanId}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Start New Scan</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target URL / Repository / Image
          </label>
          <input
            type="text"
            required
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., https://github.com/expressjs/express or nginx:latest"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Scanners</label>
          <div className="space-y-2">
            {availableScanners.map(({ type, label }) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scanners.includes(type)}
                  onChange={() => handleScannerToggle(type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !target || scanners.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Starting Scan...' : 'Start Scan'}
        </button>
      </form>
    </div>
  );
}
