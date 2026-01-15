import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiKeysApi } from "../api/api-keys"

export function useApiKeys() {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: apiKeysApi.getApiKeys,
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => apiKeysApi.createApiKey(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
    },
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
    },
  })
}
