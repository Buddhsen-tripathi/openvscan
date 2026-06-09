import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelScan,
  createProject,
  getProject,
  getScan,
  listProjects,
  listScans,
  startScan,
} from "@/lib/server";

export const queryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  scans: ["scans"] as const,
  scan: (id: string) => ["scans", id] as const,
};

/** Server-function-backed data layer (D1 via the web Worker). */
export const api = {
  scans: {
    exportUrl: (id: string, format: "json" | "sarif") =>
      `/api/scans/${id}/export?format=${format}`,
  },
};

export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => listProjects(),
  });
}

export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => getProject({ data: id }),
    enabled: Boolean(id),
  });
}

export function useScansQuery() {
  return useQuery({
    queryKey: queryKeys.scans,
    queryFn: () => listScans(),
  });
}

export function useScanQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.scan(id),
    queryFn: () => getScan({ data: id }),
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
    mutationFn: (data: { name: string; description?: string }) =>
      createProject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useStartScanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      projectId: string;
      target: string;
      scanners: string[];
    }) => startScan({ data }),
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
    mutationFn: () => cancelScan({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scan(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scans });
    },
  });
}
