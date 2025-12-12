"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateExperiment } from "@/lib/hooks/use-experiments"
import { useFlags } from "@/lib/hooks/use-flags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const experimentSchema = z.object({
  flag_id: z.string().min(1, "Flag is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  hypothesis: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
})

type ExperimentFormData = z.infer<typeof experimentSchema>

export function CreateExperimentForm() {
  const router = useRouter()
  const createExperiment = useCreateExperiment()
  const { data: flags = [] } = useFlags()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperimentFormData>({
    resolver: zodResolver(experimentSchema),
    defaultValues: {
      start_date: new Date().toISOString().split("T")[0],
    },
  })

  const selectedFlag = watch("flag_id")

  const onSubmit = async (data: ExperimentFormData) => {
    try {
      const experiment = await createExperiment.mutateAsync(data)
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
            <Label htmlFor="flag_id">
              Feature Flag <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedFlag} onValueChange={(value) => setValue("flag_id", value)}>
              <SelectTrigger id="flag_id">
                <SelectValue placeholder="Select a flag" />
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
            {errors.flag_id && <p className="text-sm text-destructive">{errors.flag_id.message}</p>}
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
            {errors.hypothesis && <p className="text-sm text-destructive">{errors.hypothesis.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input id="start_date" type="date" {...register("start_date")} />
              {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
              {errors.end_date && <p className="text-sm text-destructive">{errors.end_date.message}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createExperiment.isPending}>
              {createExperiment.isPending ? "Creating..." : "Create Experiment"}
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
