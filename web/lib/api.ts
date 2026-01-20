import { createFetch } from '@better-fetch/fetch';
import type { Project, Scan, Finding } from '@openvscan/types';

const client = createFetch({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add credential handling here if using tokens, otherwise cookies should be sent automatically if same domain/CORS allows
  // For better-auth, if we are proxying or CORS is set up, cookies might work.
  // We might need to manually pass headers if using a token approach.
});

export const api = {
  projects: {
    list: () => client<Project[]>('/projects'),
    create: (data: { name: string; description?: string }) =>
      client<Project>('/projects', { method: 'POST', body: data }),
    get: (id: string) => client<Project>(`/projects/${id}`),
    delete: (id: string) => client(`/projects/${id}`, { method: 'DELETE' }),
  },
  scans: {
    start: (projectId: string, target: string, scanners: string[]) =>
      client<{ scanId: string; status: string; target: string; timestamp: string }>('/scan', {
        method: 'POST',
        body: { projectId, target, scanners },
      }),
    get: (id: string) =>
      client<
        Scan & { findings: Finding[]; logs?: { level: string; message: string; timestamp: Date }[] }
      >(`/scan/${id}`),
  },
};
