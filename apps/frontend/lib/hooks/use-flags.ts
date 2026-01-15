import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { flagsApi } from "../api/flags"
import type { CreateFlagDto, UpdateFlagDto } from "../types"

export function useFlags() {
  return useQuery({
    queryKey: ["flags"],
    queryFn: flagsApi.getFlags,
  })
}

export function useFlag(id: string) {
  return useQuery({
    queryKey: ["flags", id],
    queryFn: () => flagsApi.getFlag(id),
    enabled: !!id,
  })
}

export function useCreateFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFlagDto) => flagsApi.createFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] })
    },
  })
}

export function useUpdateFlag(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateFlagDto) => flagsApi.updateFlag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] })
      queryClient.invalidateQueries({ queryKey: ["flags", id] })
    },
  })
}

export function useDeleteFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => flagsApi.deleteFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] })
    },
  })
}
