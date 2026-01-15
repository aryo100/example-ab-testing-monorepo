import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "../api/analytics"
import type { AnalyticsQuery } from "../types"

// ============================================
// Query Keys
// ============================================

export const analyticsKeys = {
  all: ["analytics"] as const,
  dashboard: () => [...analyticsKeys.all, "dashboard"] as const,
  flag: (flagId: string, query?: AnalyticsQuery) => [...analyticsKeys.all, "flag", flagId, query] as const,
  experiment: (experimentId: string, query?: AnalyticsQuery) => 
    [...analyticsKeys.all, "experiment", experimentId, query] as const,
  timeSeries: (flagId: string, query?: AnalyticsQuery) => 
    [...analyticsKeys.all, "timeseries", flagId, query] as const,
  variants: (flagId: string, query?: AnalyticsQuery) => 
    [...analyticsKeys.all, "variants", flagId, query] as const,
  topFlags: (limit?: number) => [...analyticsKeys.all, "top-flags", limit] as const,
  realtime: () => [...analyticsKeys.all, "realtime"] as const,
}

// ============================================
// Dashboard Analytics
// ============================================

export function useDashboardSummary() {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: analyticsApi.getDashboardSummary,
    refetchInterval: 60000, // Refetch every minute
  })
}

// ============================================
// Flag Analytics
// ============================================

export function useFlagAnalytics(flagId: string, query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.flag(flagId, query),
    queryFn: () => analyticsApi.getFlagAnalytics(flagId, query),
    enabled: !!flagId,
  })
}

export function useFlagTimeSeries(flagId: string, query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.timeSeries(flagId, query),
    queryFn: () => analyticsApi.getFlagTimeSeries(flagId, query),
    enabled: !!flagId,
  })
}

export function useFlagVariantDistribution(flagId: string, query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.variants(flagId, query),
    queryFn: () => analyticsApi.getFlagVariantDistribution(flagId, query),
    enabled: !!flagId,
  })
}

// ============================================
// Experiment Analytics
// ============================================

export function useExperimentAnalytics(experimentId: string, query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.experiment(experimentId, query),
    queryFn: () => analyticsApi.getExperimentAnalytics(experimentId, query),
    enabled: !!experimentId,
  })
}

// ============================================
// Top Flags & Real-time
// ============================================

export function useTopFlags(limit?: number) {
  return useQuery({
    queryKey: analyticsKeys.topFlags(limit),
    queryFn: () => analyticsApi.getTopFlags(limit),
  })
}

export function useRealTimeMetrics() {
  return useQuery({
    queryKey: analyticsKeys.realtime(),
    queryFn: analyticsApi.getRealTimeMetrics,
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}
