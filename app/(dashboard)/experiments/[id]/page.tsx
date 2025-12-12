"use client"

import { useExperiment } from "@/lib/hooks/use-experiments"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EditExperimentForm } from "@/components/experiments/edit-experiment-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EditExperimentPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: experiment, isLoading } = useExperiment(id)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/experiments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Experiment</h1>
            <p className="text-muted-foreground">Update experiment configuration and status</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading experiment...</div>
        ) : experiment ? (
          <EditExperimentForm experiment={experiment} />
        ) : (
          <div className="text-center text-muted-foreground">Experiment not found</div>
        )}
      </div>
    </DashboardLayout>
  )
}
