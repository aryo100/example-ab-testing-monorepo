import { apiClient } from "./client"
import type { AnalyticsSummary, AnalyticsQuery, TimeSeriesData, VariantDistribution } from "../types"

// ============================================
// Analytics Response Types
// ============================================

export interface DashboardSummary {
  totalFlags: number
  activeFlags: number
  totalExperiments: number
  runningExperiments: number
  totalImpressions: number
  totalConversions: number
  conversionRate: number
}

export interface FlagPerformance {
  flagId: string
  flagKey: string
  flagName: string
  impressions: number
  conversions: number
  conversionRate: number
  trend: number // percentage change from previous period
}

// ============================================
// Analytics API
// ============================================

export const analyticsApi = {
  /**
   * Get dashboard summary statistics
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>("/analytics/dashboard")
    return response.data
  },

  /**
   * Get analytics for a specific flag
   */
  async getFlagAnalytics(flagId: string, query?: AnalyticsQuery): Promise<AnalyticsSummary> {
    const response = await apiClient.get<AnalyticsSummary>(`/analytics/flags/${flagId}`, {
      params: query,
    })
    return response.data
  },

  /**
   * Get analytics for a specific experiment
   */
  async getExperimentAnalytics(experimentId: string, query?: AnalyticsQuery): Promise<AnalyticsSummary> {
    const response = await apiClient.get<AnalyticsSummary>(`/analytics/experiments/${experimentId}`, {
      params: query,
    })
    return response.data
  },

  /**
   * Get time series data for a flag
   */
  async getFlagTimeSeries(
    flagId: string,
    query?: AnalyticsQuery
  ): Promise<TimeSeriesData[]> {
    const response = await apiClient.get<TimeSeriesData[]>(`/analytics/flags/${flagId}/timeseries`, {
      params: query,
    })
    return response.data
  },

  /**
   * Get variant distribution for a flag
   */
  async getFlagVariantDistribution(
    flagId: string,
    query?: AnalyticsQuery
  ): Promise<VariantDistribution[]> {
    const response = await apiClient.get<VariantDistribution[]>(
      `/analytics/flags/${flagId}/variants`,
      { params: query }
    )
    return response.data
  },

  /**
   * Get top performing flags
   */
  async getTopFlags(limit?: number): Promise<FlagPerformance[]> {
    const response = await apiClient.get<FlagPerformance[]>("/analytics/top-flags", {
      params: { limit },
    })
    return response.data
  },

  /**
   * Export analytics data as CSV
   */
  async exportAnalytics(
    flagId: string,
    query?: AnalyticsQuery
  ): Promise<Blob> {
    const response = await apiClient.get(`/analytics/flags/${flagId}/export`, {
      params: query,
      responseType: "blob",
    })
    return response.data
  },

  /**
   * Get real-time metrics (for live dashboard)
   */
  async getRealTimeMetrics(): Promise<{
    impressionsPerMinute: number
    conversionsPerMinute: number
    activeUsers: number
  }> {
    const response = await apiClient.get("/analytics/realtime")
    return response.data
  },
}
