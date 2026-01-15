"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateFlag } from "@/lib/hooks/use-flags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

const flagSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[a-z0-9_-]+$/, "Key must be lowercase alphanumeric with hyphens or underscores"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["boolean", "percentage", "variant"]),
  enabled: z.boolean().default(false),
})

type FlagFormData = z.infer<typeof flagSchema>

export function CreateFlagForm() {
  const router = useRouter()
  const createFlag = useCreateFlag()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlagFormData>({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      type: "boolean",
      enabled: false,
    },
  })

  const flagType = watch("type")
  const enabled = watch("enabled")

  const onSubmit = async (data: FlagFormData) => {
    try {
      const flag = await createFlag.mutateAsync(data)
      router.push(`/flags/${flag.id}`)
    } catch (error) {
      console.error("Failed to create flag:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Feature Flag</CardTitle>
        <CardDescription>Define a new feature flag for your application</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="key">
              Flag Key <span className="text-destructive">*</span>
            </Label>
            <Input id="key" placeholder="new-feature-flag" className="font-mono" {...register("key")} />
            {errors.key && <p className="text-sm text-destructive">{errors.key.message}</p>}
            <p className="text-sm text-muted-foreground">
              Unique identifier used in your code. Use lowercase with hyphens or underscores.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="New Feature Flag" {...register("name")} />
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
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Flag Type <span className="text-destructive">*</span>
            </Label>
            <Select value={flagType} onValueChange={(value) => setValue("type", value as any)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Boolean (On/Off)</SelectItem>
                <SelectItem value="percentage">Percentage Rollout</SelectItem>
                <SelectItem value="variant">Variant (A/B Testing)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {flagType === "boolean" && "Simple on/off toggle for feature control"}
              {flagType === "percentage" && "Gradually roll out to a percentage of users"}
              {flagType === "variant" && "Serve different variants for A/B testing"}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base">
                Enable Flag
              </Label>
              <p className="text-sm text-muted-foreground">Start with the flag enabled for immediate use</p>
            </div>
            <Switch id="enabled" checked={enabled} onCheckedChange={(checked) => setValue("enabled", checked)} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createFlag.isPending}>
              {createFlag.isPending ? "Creating..." : "Create Flag"}
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
