"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  useUpdateExperiment,
  useStartExperiment,
  usePauseExperiment,
  useCompleteExperiment,
  useResumeExperiment,
} from "@/lib/hooks/use-experiments"
import type { Experiment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, CheckCircle, Loader2 } from "lucide-react"

const experimentUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  hypothesis: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type ExperimentUpdateData = z.infer<typeof experimentUpdateSchema>

interface EditExperimentFormProps {
  experiment: Experiment
}

export function EditExperimentForm({ experiment }: EditExperimentFormProps) {
  const router = useRouter()
  const updateExperiment = useUpdateExperiment(experiment.id)
  const startExperiment = useStartExperiment()
  const pauseExperiment = usePauseExperiment()
  const resumeExperiment = useResumeExperiment()
  const completeExperiment = useCompleteExperiment()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExperimentUpdateData>({
    resolver: zodResolver(experimentUpdateSchema),
    defaultValues: {
      name: experiment.name,
      description: experiment.description || "",
      hypothesis: experiment.hypothesis || "",
      startDate: experiment.startDate ? experiment.startDate.split("T")[0] : "",
      endDate: experiment.endDate ? experiment.endDate.split("T")[0] : "",
    },
  })

  const onSubmit = async (data: ExperimentUpdateData) => {
    try {
      await updateExperiment.mutateAsync(data)
      router.push("/experiments")
    } catch (error) {
      console.error("Failed to update experiment:", error)
    }
  }

  const handleStart = () => {
    startExperiment.mutate(experiment.id)
  }

  const handlePause = () => {
    pauseExperiment.mutate(experiment.id)
  }

  const handleResume = () => {
    resumeExperiment.mutate(experiment.id)
  }

  const handleComplete = () => {
    completeExperiment.mutate(experiment.id)
  }

  const getStatusBadge = () => {
    switch (experiment.status) {
      case "running":
        return (
          <Badge className="bg-green-500 text-white">
            <Play className="mr-1 h-3 w-3" />
            Running
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="outline">
            <Pause className="mr-1 h-3 w-3" />
            Paused
          </Badge>
        )
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  const isActionPending =
    startExperiment.isPending ||
    pauseExperiment.isPending ||
    resumeExperiment.isPending ||
    completeExperiment.isPending

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Edit Experiment</CardTitle>
              <CardDescription>Update experiment configuration</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Associated Flag</Label>
              <Input value={experiment.flagId} disabled className="font-mono bg-muted" />
              <p className="text-sm text-muted-foreground">Flag association cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Experiment Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} />
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
              <Button type="submit" disabled={updateExperiment.isPending}>
                {updateExperiment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experiment Controls</CardTitle>
          <CardDescription>Manage the experiment lifecycle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {experiment.status === "draft" && (
              <Button onClick={handleStart} disabled={isActionPending}>
                {startExperiment.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Start Experiment
              </Button>
            )}

            {experiment.status === "running" && (
              <>
                <Button onClick={handlePause} variant="outline" disabled={isActionPending}>
                  {pauseExperiment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Pause className="mr-2 h-4 w-4" />
                  )}
                  Pause
                </Button>
                <Button onClick={handleComplete} disabled={isActionPending}>
                  {completeExperiment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Complete
                </Button>
              </>
            )}

            {experiment.status === "paused" && (
              <>
                <Button onClick={handleResume} disabled={isActionPending}>
                  {resumeExperiment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Resume
                </Button>
                <Button onClick={handleComplete} variant="outline" disabled={isActionPending}>
                  {completeExperiment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Complete
                </Button>
              </>
            )}

            {experiment.status === "completed" && (
              <p className="text-sm text-muted-foreground">
                This experiment has been completed. Results are available in the analytics dashboard.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
