import type { Finding, Project, Scan } from "@openvscan/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export type ProjectWithScans = Project & { scans?: Scan[] };
export type ScanWithProject = Scan & { project: { id: string; name: string } };
export type ScanDetails = Scan & {
  findings: Finding[];
  logs?: { level: string; message: string; timestamp: string | Date }[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiRateLimitError extends ApiError {
  constructor(message: string, body?: ApiErrorBody) {
    super(message, 429, body);
    this.name = "ApiRateLimitError";
  }
}

export const queryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  scans: ["scans"] as const,
  scan: (id: string) => ["scans", id] as const,
};

function normalizeMessage(body: ApiErrorBody | undefined, fallback: string) {
  if (!body?.message) return body?.error ?? fallback;
  return Array.isArray(body.message) ? body.message.join(", ") : body.message;
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      | ApiErrorBody
      | undefined;
    const message = normalizeMessage(
      body,
      response.statusText || "Request failed",
    );
    if (response.status === 429) {
      throw new ApiRateLimitError(message, body);
    }
    throw new ApiError(message, response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  projects: {
    list: () => apiRequest<ProjectWithScans[]>("/projects"),
    create: (data: { name: string; description?: string }) =>
      apiRequest<Project>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    get: (id: string) => apiRequest<ProjectWithScans>(`/projects/${id}`),
    delete: (id: string) => apiRequest(`/projects/${id}`, { method: "DELETE" }),
  },
  scans: {
    list: () => apiRequest<ScanWithProject[]>("/scan"),
    start: (projectId: string, target: string, scanners: string[]) =>
      apiRequest<{
        scanId: string;
        status: string;
        target: string;
        timestamp: string;
        message?: string;
      }>("/scan", {
        method: "POST",
        body: JSON.stringify({ projectId, target, scanners }),
      }),
    get: (id: string) => apiRequest<ScanDetails>(`/scan/${id}`),
    cancel: (id: string) =>
      apiRequest<{ message: string; status: string }>(`/scan/${id}/cancel`, {
        method: "POST",
      }),
    exportUrl: (id: string, format: "json" | "sarif") =>
      `${apiBaseUrl}/scan/${id}/export?format=${format}`,
  },
};

export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: api.projects.list,
  });
}

export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => api.projects.get(id),
    enabled: Boolean(id),
  });
}

export function useScansQuery() {
  return useQuery({
    queryKey: queryKeys.scans,
    queryFn: api.scans.list,
  });
}

export function useScanQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.scan(id),
    queryFn: () => api.scans.get(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "running" || status === "pending" ? 5000 : false;
    },
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.projects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useStartScanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      target,
      scanners,
    }: {
      projectId: string;
      target: string;
      scanners: string[];
    }) => api.scans.start(projectId, target, scanners),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scans });
      queryClient.invalidateQueries({
        queryKey: queryKeys.project(variables.projectId),
      });
    },
  });
}

export function useCancelScanMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.scans.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scan(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scans });
    },
  });
}
