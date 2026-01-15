"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import type { TimeSeriesData } from "@/lib/types"

interface AnalyticsChartProps {
  data: TimeSeriesData[]
  title: string
  description?: string
}

export function AnalyticsChart({ data, title, description }: AnalyticsChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    impressions: item.impressions,
    conversions: item.conversions,
    uniqueUsers: item.uniqueUsers,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="impressions"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Impressions"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Conversions"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="uniqueUsers"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              name="Unique Users"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
