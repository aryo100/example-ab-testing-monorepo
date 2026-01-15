"use client"

import { useFlag } from "@/lib/hooks/use-flags"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { VariantEditor } from "@/components/flags/variant-editor"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function VariantsPage({ params }: { params: { id: string } }) {
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
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Manage Variants</h1>
              {flag && <Badge>{flag.type}</Badge>}
            </div>
            <p className="text-muted-foreground">{flag ? `Configure variants for ${flag.name}` : "Loading..."}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading...</div>
        ) : flag?.type !== "variant" ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
            This flag is not a variant type. Variants are only available for variant flags.
          </div>
        ) : (
          <VariantEditor flagId={id} />
        )}
      </div>
    </DashboardLayout>
  )
}
