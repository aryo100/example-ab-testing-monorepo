import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "../api/analytics"

export function useFlagAnalytics(flagId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["analytics", "flags", flagId, startDate, endDate],
    queryFn: () => analyticsApi.getFlagAnalytics(flagId, startDate, endDate),
    enabled: !!flagId,
  })
}

export function useExperimentAnalytics(experimentId: string) {
  return useQuery({
    queryKey: ["analytics", "experiments", experimentId],
    queryFn: () => analyticsApi.getExperimentAnalytics(experimentId),
    enabled: !!experimentId,
  })
}
