"use client"

import { useState } from "react"
import { useFlag } from "@/lib/hooks/use-flags"
import { useFlagAnalytics } from "@/lib/hooks/use-analytics"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { VariantDistributionChart } from "@/components/analytics/variant-distribution-chart"
import { MetricCard } from "@/components/analytics/metric-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Eye, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FlagAnalyticsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: flag } = useFlag(id)
  const [dateRange, setDateRange] = useState("7d")

  // Calculate date range
  const getDateRange = () => {
    const end = new Date()
    const start = new Date()
    switch (dateRange) {
      case "24h":
        start.setDate(start.getDate() - 1)
        break
      case "7d":
        start.setDate(start.getDate() - 7)
        break
      case "30d":
        start.setDate(start.getDate() - 30)
        break
      case "90d":
        start.setDate(start.getDate() - 90)
        break
    }
    return { start: start.toISOString(), end: end.toISOString() }
  }

  const { start, end } = getDateRange()
  const { data: analytics, isLoading } = useFlagAnalytics(id, start, end)

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
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading analytics...</div>
        ) : analytics ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Total Exposures"
                value={analytics.total_exposures.toLocaleString()}
                description="Total number of flag evaluations"
                icon={Eye}
              />
              <MetricCard
                title="Unique Users"
                value={analytics.unique_users.toLocaleString()}
                description="Users who saw this flag"
                icon={Users}
              />
              <MetricCard
                title="Avg. Exposures/User"
                value={(analytics.total_exposures / Math.max(analytics.unique_users, 1)).toFixed(2)}
                description="Average exposures per user"
                icon={TrendingUp}
              />
            </div>

            <AnalyticsChart
              data={analytics.time_series}
              title="Exposure Timeline"
              description="Track flag exposures and unique users over time"
            />

            {Object.keys(analytics.variant_distribution).length > 0 && (
              <VariantDistributionChart distribution={analytics.variant_distribution} />
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
