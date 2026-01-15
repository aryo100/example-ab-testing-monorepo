"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useUpdateFlag } from "@/lib/hooks/use-flags"
import type { FeatureFlag } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const flagUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  enabled: z.boolean(),
})

type FlagUpdateData = z.infer<typeof flagUpdateSchema>

interface EditFlagFormProps {
  flag: FeatureFlag
}

export function EditFlagForm({ flag }: EditFlagFormProps) {
  const router = useRouter()
  const updateFlag = useUpdateFlag(flag.id)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlagUpdateData>({
    resolver: zodResolver(flagUpdateSchema),
    defaultValues: {
      name: flag.name,
      description: flag.description || "",
      enabled: flag.enabled,
    },
  })

  const enabled = watch("enabled")

  const onSubmit = async (data: FlagUpdateData) => {
    try {
      await updateFlag.mutateAsync(data)
      router.push("/flags")
    } catch (error) {
      console.error("Failed to update flag:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Edit Feature Flag</CardTitle>
            <CardDescription>Update flag configuration</CardDescription>
          </div>
          <Badge>{flag.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Flag Key</Label>
            <Input value={flag.key} disabled className="font-mono bg-muted" />
            <p className="text-sm text-muted-foreground">Flag key cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this flag controls..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base">
                Enable Flag
              </Label>
              <p className="text-sm text-muted-foreground">Control whether this flag is active</p>
            </div>
            <Switch id="enabled" checked={enabled} onCheckedChange={(checked) => setValue("enabled", checked)} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={updateFlag.isPending}>
              {updateFlag.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
