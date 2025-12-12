import type { AnalyticsSummary } from "../types"

const generateMockAnalytics = (flagId: string): AnalyticsSummary => {
  const days = 30
  const timeSeriesData = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    timeSeriesData.push({
      date: date.toISOString().split("T")[0],
      impressions: Math.floor(Math.random() * 5000) + 2000,
      conversions: Math.floor(Math.random() * 500) + 100,
    })
  }

  const totalImpressions = timeSeriesData.reduce((sum, d) => sum + d.impressions, 0)
  const totalConversions = timeSeriesData.reduce((sum, d) => sum + d.conversions, 0)

  return {
    total_impressions: totalImpressions,
    total_conversions: totalConversions,
    conversion_rate: (totalConversions / totalImpressions) * 100,
    time_series: timeSeriesData,
    variant_distribution: [
      { variant: "Control", impressions: Math.floor(totalImpressions * 0.5), percentage: 50 },
      { variant: "Variant A", impressions: Math.floor(totalImpressions * 0.3), percentage: 30 },
      { variant: "Variant B", impressions: Math.floor(totalImpressions * 0.2), percentage: 20 },
    ],
  }
}

export const analyticsApi = {
  async getFlagAnalytics(flagId: string, startDate?: string, endDate?: string): Promise<AnalyticsSummary> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return generateMockAnalytics(flagId)
  },

  async getExperimentAnalytics(experimentId: string): Promise<AnalyticsSummary> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return generateMockAnalytics(experimentId)
  },
}
