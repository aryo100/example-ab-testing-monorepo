"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">View metrics and insights for your feature flags</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Flag-Specific Analytics</CardTitle>
                <CardDescription>Select a flag from the flags page to view detailed analytics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Navigate to the feature flags page and select a flag to view its exposure data, user metrics, and time
              series analysis. You can also access analytics for individual experiments from the experiments page.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
