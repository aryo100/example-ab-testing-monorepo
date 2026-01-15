"use client"

import { useExperiments } from "@/lib/hooks/use-experiments"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ExperimentTable } from "@/components/experiments/experiment-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ExperimentsPage() {
  const { data, isLoading } = useExperiments()
  const experiments = Array.isArray(data) ? data : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
            <p className="text-muted-foreground">Run A/B tests and track experiment performance</p>
          </div>
          <Button asChild>
            <Link href="/experiments/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Experiment
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading experiments...</div>
        ) : (
          <ExperimentTable experiments={experiments} />
        )}
      </div>
    </DashboardLayout>
  )
}
