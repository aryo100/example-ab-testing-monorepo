import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { experimentsApi } from "../api/experiments"
import type { CreateExperimentDto } from "../types"

export function useExperiments() {
  return useQuery({
    queryKey: ["experiments"],
    queryFn: experimentsApi.getExperiments,
  })
}

export function useExperiment(id: string) {
  return useQuery({
    queryKey: ["experiments", id],
    queryFn: () => experimentsApi.getExperiment(id),
    enabled: !!id,
  })
}

export function useCreateExperiment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExperimentDto) => experimentsApi.createExperiment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] })
    },
  })
}

export function useUpdateExperiment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<CreateExperimentDto>) => experimentsApi.updateExperiment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] })
      queryClient.invalidateQueries({ queryKey: ["experiments", id] })
    },
  })
}

export function useDeleteExperiment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => experimentsApi.deleteExperiment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] })
    },
  })
}

export function useStartExperiment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => experimentsApi.startExperiment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] })
      queryClient.invalidateQueries({ queryKey: ["experiments", id] })
    },
  })
}
