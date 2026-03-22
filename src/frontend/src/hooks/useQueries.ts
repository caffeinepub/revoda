import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Report } from "../backend.d";
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
