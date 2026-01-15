"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Cell } from "recharts"
import type { VariantDistribution } from "@/lib/types"

interface VariantDistributionChartProps {
  distribution: VariantDistribution[]
  title?: string
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function VariantDistributionChart({
  distribution,
  title = "Variant Distribution",
}: VariantDistributionChartProps) {
  const chartData = distribution.map((item, index) => ({
    variant: item.variant,
    impressions: item.impressions,
    conversions: item.conversions,
    conversionRate: item.conversionRate,
    percentage: item.percentage,
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Performance comparison across variants</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Impressions Chart */}
          <div>
            <h4 className="text-sm font-medium mb-4">Impressions by Variant</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="variant"
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
                  formatter={(value: number) => [value.toLocaleString(), "Impressions"]}
                />
                <Bar dataKey="impressions" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Rate Chart */}
          <div>
            <h4 className="text-sm font-medium mb-4">Conversion Rate by Variant</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="variant"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, "Conversion Rate"]}
                />
                <Bar dataKey="conversionRate" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 px-4 text-left font-medium">Variant</th>
                <th className="py-2 px-4 text-right font-medium">Impressions</th>
                <th className="py-2 px-4 text-right font-medium">Conversions</th>
                <th className="py-2 px-4 text-right font-medium">Conv. Rate</th>
                <th className="py-2 px-4 text-right font-medium">Traffic %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {chartData.map((item) => (
                <tr key={item.variant}>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      {item.variant}
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right text-muted-foreground">
                    {item.impressions.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right text-muted-foreground">
                    {item.conversions.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right text-muted-foreground">
                    {item.conversionRate.toFixed(2)}%
                  </td>
                  <td className="py-2 px-4 text-right text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
