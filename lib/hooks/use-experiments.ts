import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { experimentsApi, ExperimentsQueryParams } from "../api/experiments"
import type { CreateExperimentDto, UpdateExperimentDto } from "../types"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "../api/client"

// ============================================
// Query Keys
// ============================================

export const experimentKeys = {
  all: ["experiments"] as const,
  lists: () => [...experimentKeys.all, "list"] as const,
  list: (params?: ExperimentsQueryParams) => [...experimentKeys.lists(), params] as const,
  details: () => [...experimentKeys.all, "detail"] as const,
  detail: (id: string) => [...experimentKeys.details(), id] as const,
  byFlag: (flagId: string) => [...experimentKeys.all, "flag", flagId] as const,
}

// ============================================
// Experiments Queries
// ============================================

export function useExperiments(params?: ExperimentsQueryParams) {
  return useQuery({
    queryKey: experimentKeys.list(params),
    queryFn: () => experimentsApi.getExperiments(params),
  })
}

export function useExperiment(id: string) {
  return useQuery({
    queryKey: experimentKeys.detail(id),
    queryFn: () => experimentsApi.getExperiment(id),
    enabled: !!id,
  })
}

export function useExperimentsByFlag(flagId: string) {
  return useQuery({
    queryKey: experimentKeys.byFlag(flagId),
    queryFn: () => experimentsApi.getExperimentsByFlag(flagId),
    enabled: !!flagId,
  })
}

// ============================================
// Experiments Mutations
// ============================================

export function useCreateExperiment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateExperimentDto) => experimentsApi.createExperiment(data),
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() })
      toast({
        title: "Experiment created",
        description: `Experiment "${experiment.name}" has been created successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error creating experiment",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useUpdateExperiment(id: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: UpdateExperimentDto) => experimentsApi.updateExperiment(id, data),
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: experimentKeys.detail(id) })
      toast({
        title: "Experiment updated",
        description: `Experiment "${experiment.name}" has been updated successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error updating experiment",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useDeleteExperiment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => experimentsApi.deleteExperiment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() })
      toast({
        title: "Experiment deleted",
        description: "Experiment has been deleted successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting experiment",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

// ============================================
// Experiment Lifecycle Mutations
// ============================================

export function useStartExperiment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => experimentsApi.startExperiment(id),
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: experimentKeys.detail(experiment.id) })
      toast({
        title: "Experiment started",
        description: `Experiment "${experiment.name}" is now running.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error starting experiment",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function usePauseExperiment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => experimentsApi.pauseExperiment(id),
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: experimentKeys.detail(experiment.id) })
      toast({
        title: "Experiment paused",
        description: `Experiment "${experiment.name}" has been paused.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error pausing experiment",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useResumeExperiment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => experimentsApi.resumeExperiment(id),
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: experimentKeys.detail(experiment.id) })
      toast({
        title: "Experiment resumed",
        description: `Experiment "${experiment.name}" is now running again.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error resuming experiment",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useCompleteExperiment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => experimentsApi.completeExperiment(id),
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: experimentKeys.detail(experiment.id) })
      toast({
        title: "Experiment completed",
        description: `Experiment "${experiment.name}" has been completed.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error completing experiment",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}
