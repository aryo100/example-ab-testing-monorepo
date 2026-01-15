"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateExperiment } from "@/lib/hooks/use-experiments"
import { useAllFlags } from "@/lib/hooks/use-flags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const experimentSchema = z.object({
  flagId: z.string().min(1, "Flag is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  hypothesis: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetSampleSize: z.number().optional(),
})

type ExperimentFormData = z.infer<typeof experimentSchema>

export function CreateExperimentForm() {
  const router = useRouter()
  const createExperiment = useCreateExperiment()
  const { data: flags = [], isLoading: flagsLoading } = useAllFlags()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperimentFormData>({
    resolver: zodResolver(experimentSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
    },
  })

  const selectedFlag = watch("flagId")

  const onSubmit = async (data: ExperimentFormData) => {
    try {
      const experiment = await createExperiment.mutateAsync({
        flagId: data.flagId,
        name: data.name,
        description: data.description,
        hypothesis: data.hypothesis,
        startDate: data.startDate,
        endDate: data.endDate,
        targetSampleSize: data.targetSampleSize,
      })
      router.push(`/experiments/${experiment.id}`)
    } catch (error) {
      console.error("Failed to create experiment:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Experiment</CardTitle>
        <CardDescription>Set up a new A/B test or feature experiment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="flagId">
              Feature Flag <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedFlag}
              onValueChange={(value) => setValue("flagId", value)}
              disabled={flagsLoading}
            >
              <SelectTrigger id="flagId">
                <SelectValue placeholder={flagsLoading ? "Loading flags..." : "Select a flag"} />
              </SelectTrigger>
              <SelectContent>
                {flags.map((flag) => (
                  <SelectItem key={flag.id} value={flag.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{flag.key}</span>
                      <span className="text-muted-foreground">- {flag.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.flagId && <p className="text-sm text-destructive">{errors.flagId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Experiment Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="New Button Color Test" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the experiment goals and methodology..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hypothesis">Hypothesis</Label>
            <Textarea
              id="hypothesis"
              placeholder="We believe that changing X will result in Y because..."
              rows={2}
              {...register("hypothesis")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createExperiment.isPending}>
              {createExperiment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Experiment"
              )}
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
