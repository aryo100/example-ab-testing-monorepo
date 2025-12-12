import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreateExperimentForm } from "@/components/experiments/create-experiment-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CreateExperimentPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">New Experiment</h1>
            <p className="text-muted-foreground">Set up a new A/B test or feature experiment</p>
          </div>
        </div>

        <CreateExperimentForm />
      </div>
    </DashboardLayout>
  )
}
