"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import type { TimeSeriesData } from "@/lib/types"

interface AnalyticsChartProps {
  data: TimeSeriesData[]
  title: string
  description?: string
}

export function AnalyticsChart({ data, title, description }: AnalyticsChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    exposures: item.exposures,
    users: item.unique_users,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" className="text-xs text-muted-foreground" />
            <YAxis className="text-xs text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line type="monotone" dataKey="exposures" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Exposures" />
            <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Unique Users" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
