"use client"

import { useFlags } from "@/lib/hooks/use-flags"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FlagTable } from "@/components/flags/flag-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function FlagsPage() {
  const { data, isLoading } = useFlags()
  const flags = Array.isArray(data) ? data : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
            <p className="text-muted-foreground">Manage and control your application features</p>
          </div>
          <Button asChild>
            <Link href="/flags/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Flag
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading flags...</div>
        ) : (
          <FlagTable flags={flags} />
        )}
      </div>
    </DashboardLayout>
  )
}
