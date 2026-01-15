import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreateFlagForm } from "@/components/flags/create-flag-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CreateFlagPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/flags">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Feature Flag</h1>
            <p className="text-muted-foreground">Create a new flag to control features in your app</p>
          </div>
        </div>

        <CreateFlagForm />
      </div>
    </DashboardLayout>
  )
}
