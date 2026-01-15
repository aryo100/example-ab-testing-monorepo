import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiKeysApi } from "../api/api-keys"
import type { CreateApiKeyDto } from "../types"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "../api/client"

// ============================================
// Query Keys
// ============================================

export const apiKeyKeys = {
  all: ["api-keys"] as const,
  list: () => [...apiKeyKeys.all, "list"] as const,
  detail: (id: string) => [...apiKeyKeys.all, "detail", id] as const,
}

// ============================================
// API Keys Queries
// ============================================

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.list(),
    queryFn: apiKeysApi.getApiKeys,
  })
}

export function useApiKey(id: string) {
  return useQuery({
    queryKey: apiKeyKeys.detail(id),
    queryFn: () => apiKeysApi.getApiKey(id),
    enabled: !!id,
  })
}

// ============================================
// API Keys Mutations
// ============================================

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateApiKeyDto) => apiKeysApi.createApiKey(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() })
      toast({
        title: "API key created",
        description: `API key "${response.apiKey.name}" has been created. Make sure to copy the secret key now!`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error creating API key",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<CreateApiKeyDto, "name" | "permissions">> }) =>
      apiKeysApi.updateApiKey(id, data),
    onSuccess: (apiKey) => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() })
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.detail(apiKey.id) })
      toast({
        title: "API key updated",
        description: `API key "${apiKey.name}" has been updated successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error updating API key",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() })
      toast({
        title: "API key deleted",
        description: "API key has been revoked successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting API key",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useRegenerateApiKey() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.regenerateApiKey(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() })
      toast({
        title: "API key regenerated",
        description: "A new secret key has been generated. Make sure to copy it now!",
      })
    },
    onError: (error) => {
      toast({
        title: "Error regenerating API key",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}
