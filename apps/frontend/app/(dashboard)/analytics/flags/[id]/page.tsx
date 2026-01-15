"use client"

import { useState } from "react"
import { useFlag } from "@/lib/hooks/use-flags"
import { useFlagAnalytics } from "@/lib/hooks/use-analytics"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { VariantDistributionChart } from "@/components/analytics/variant-distribution-chart"
import { MetricCard } from "@/components/analytics/metric-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Eye, TrendingUp, Percent } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AnalyticsQuery } from "@/lib/types"

export default function FlagAnalyticsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: flag } = useFlag(id)
  const [dateRange, setDateRange] = useState("7d")

  // Calculate date range
  const getAnalyticsQuery = (): AnalyticsQuery => {
    const end = new Date()
    const start = new Date()
    let granularity: AnalyticsQuery["granularity"] = "day"

    switch (dateRange) {
      case "24h":
        start.setDate(start.getDate() - 1)
        granularity = "hour"
        break
      case "7d":
        start.setDate(start.getDate() - 7)
        granularity = "day"
        break
      case "30d":
        start.setDate(start.getDate() - 30)
        granularity = "day"
        break
      case "90d":
        start.setDate(start.getDate() - 90)
        granularity = "week"
        break
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      granularity,
    }
  }

  const query = getAnalyticsQuery()
  const { data: analytics, isLoading } = useFlagAnalytics(id, query)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/flags">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Flag Analytics</h1>
              <p className="text-muted-foreground">{flag?.name || "Loading..."}</p>
            </div>
          </div>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading analytics...
          </div>
        ) : analytics ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="Total Impressions"
                value={analytics.totalImpressions.toLocaleString()}
                description="Total number of flag evaluations"
                icon={Eye}
              />
              <MetricCard
                title="Unique Users"
                value={analytics.uniqueUsers.toLocaleString()}
                description="Unique users exposed"
                icon={Users}
              />
              <MetricCard
                title="Total Conversions"
                value={analytics.totalConversions.toLocaleString()}
                description="Successful conversions"
                icon={TrendingUp}
              />
              <MetricCard
                title="Conversion Rate"
                value={`${analytics.conversionRate.toFixed(2)}%`}
                description="Overall conversion rate"
                icon={Percent}
              />
            </div>

            <AnalyticsChart
              data={analytics.timeSeries}
              title="Performance Timeline"
              description="Track impressions and conversions over time"
            />

            {analytics.variantDistribution.length > 0 && (
              <VariantDistributionChart distribution={analytics.variantDistribution} />
            )}
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card">
            <div className="text-center">
              <p className="text-muted-foreground">No analytics data available for this flag</p>
              <p className="text-sm text-muted-foreground mt-2">
                Data will appear once the flag starts receiving exposures
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
