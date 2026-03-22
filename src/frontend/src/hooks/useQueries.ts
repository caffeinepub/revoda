import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ArchiveEntry, ReformItem, Report } from "../backend.d";
import { useActor } from "./useActor";

export function useReports() {
  const { actor, isFetching } = useActor();
  return useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getReports() as Promise<Report[]>;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useReportCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["report-count"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return (actor as any).getReportCount() as Promise<bigint>;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isCallerAdmin() as Promise<boolean>;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSubmitReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      category: string;
      description: string;
      gpsLat: number;
      gpsLon: number;
      clientTimestamp: string;
      deviceId: string;
      mediaKeys: string[];
      anonymous: boolean;
      signatureData: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).submitReport(
        data.category,
        data.description,
        data.gpsLat,
        data.gpsLon,
        data.clientTimestamp,
        data.deviceId,
        data.mediaKeys,
        data.anonymous,
        data.signatureData,
      ) as Promise<string>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-count"] });
    },
  });
}

// ── Reform Lobby ────────────────────────────────────────────
export function useReformItems() {
  const { actor, isFetching } = useActor();
  return useQuery<ReformItem[]>({
    queryKey: ["reform-items"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getReformItems() as Promise<ReformItem[]>;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSignPetition() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).signPetition(id) as Promise<boolean>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reform-items"] });
    },
  });
}

export function useSubmitReformItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      summary: string;
      category: string;
      evidenceNote: string;
      submittedBy: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).submitReformItem(
        data.title,
        data.summary,
        data.category,
        data.evidenceNote,
        data.submittedBy,
      ) as Promise<string>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reform-items"] });
    },
  });
}

export function useUpdateReformStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateReformItemStatus(
        id,
        status,
      ) as Promise<boolean>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reform-items"] });
    },
  });
}

// ── Disenfranchisement Archive ──────────────────────────────
export function useArchiveEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<ArchiveEntry[]>({
    queryKey: ["archive-entries"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getArchiveEntries() as Promise<ArchiveEntry[]>;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function usePublicStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{ totalReports: bigint; byCategory: [string, bigint][] }>({
    queryKey: ["public-stats"],
    queryFn: async () => {
      if (!actor) return { totalReports: BigInt(0), byCategory: [] };
      return (actor as any).getPublicStats() as Promise<{
        totalReports: bigint;
        byCategory: [string, bigint][];
      }>;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSubmitArchiveEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      caseTitle: string;
      state: string;
      lga: string;
      category: string;
      description: string;
      source: string;
      incidentDate: string;
      submittedBy: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).submitArchiveEntry(
        data.caseTitle,
        data.state,
        data.lga,
        data.category,
        data.description,
        data.source,
        data.incidentDate,
        data.submittedBy,
      ) as Promise<string>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archive-entries"] });
      queryClient.invalidateQueries({ queryKey: ["public-stats"] });
    },
  });
}
