'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CreateScanForm } from '@/components/dashboard/CreateScanForm';
import { ScanStatus, type Project, type Scan } from '@openvscan/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<(Project & { scans?: Scan[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data } = await api.projects.get(id);
        if (data) {
          setProject(data);
        }
      } catch (error) {
        console.error('Failed to fetch project', error);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchProject();
  }, [id]);

  if (isLoading) return <div className="p-6">Loading project...</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <>
      <header className="flex justify-between items-center bg-white p-4 border-b">
        <h2 className="text-xl font-semibold">{project.name}</h2>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Recent Scans</h3>
              {!project.scans || project.scans.length === 0 ? (
                <p className="text-gray-500">No scans performed yet.</p>
              ) : (
                <div className="space-y-4">
                  {project.scans.map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/dashboard/scans/${scan.id}`}
                      className="block border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{scan.config.target}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(scan.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold
                          ${
                            scan.status === ScanStatus.COMPLETED
                              ? 'bg-green-100 text-green-800'
                              : scan.status === ScanStatus.FAILED
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {scan.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <CreateScanForm
              projectId={project.id}
              onScanStarted={(scanId) => (window.location.href = `/dashboard/scans/${scanId}`)}
            />

            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-2">About</h3>
              <p className="text-gray-600 text-sm">
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
