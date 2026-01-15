"use client"

import { useFlag } from "@/lib/hooks/use-flags"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EditFlagForm } from "@/components/flags/edit-flag-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EditFlagPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: flag, isLoading } = useFlag(id)

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
            <h1 className="text-3xl font-bold tracking-tight">Edit Feature Flag</h1>
            <p className="text-muted-foreground">Update flag configuration and settings</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading flag...</div>
        ) : flag ? (
          <EditFlagForm flag={flag} />
        ) : (
          <div className="text-center text-muted-foreground">Flag not found</div>
        )}
      </div>
    </DashboardLayout>
  )
}
