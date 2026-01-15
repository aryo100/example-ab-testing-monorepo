import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { flagsApi, FlagsQueryParams } from "../api/flags"
import type { CreateFlagDto, UpdateFlagDto, CreateVariantDto, UpdateVariantDto } from "../types"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "../api/client"

// ============================================
// Query Keys
// ============================================

export const flagKeys = {
  all: ["flags"] as const,
  lists: () => [...flagKeys.all, "list"] as const,
  list: (params?: FlagsQueryParams) => [...flagKeys.lists(), params] as const,
  details: () => [...flagKeys.all, "detail"] as const,
  detail: (id: string) => [...flagKeys.details(), id] as const,
  variants: (flagId: string) => [...flagKeys.all, "variants", flagId] as const,
}

// ============================================
// Flags Queries
// ============================================

export function useFlags(params?: FlagsQueryParams) {
  return useQuery({
    queryKey: flagKeys.list(params),
    queryFn: () => flagsApi.getFlags(params),
  })
}

export function useAllFlags() {
  return useQuery({
    queryKey: [...flagKeys.all, "all"],
    queryFn: flagsApi.getAllFlags,
  })
}

export function useFlag(id: string) {
  return useQuery({
    queryKey: flagKeys.detail(id),
    queryFn: () => flagsApi.getFlag(id),
    enabled: !!id,
  })
}

export function useFlagByKey(key: string) {
  return useQuery({
    queryKey: [...flagKeys.all, "key", key],
    queryFn: () => flagsApi.getFlagByKey(key),
    enabled: !!key,
  })
}

// ============================================
// Flags Mutations
// ============================================

export function useCreateFlag() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateFlagDto) => flagsApi.createFlag(data),
    onSuccess: (flag) => {
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() })
      toast({
        title: "Flag created",
        description: `Feature flag "${flag.name}" has been created successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error creating flag",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useUpdateFlag(id: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: UpdateFlagDto) => flagsApi.updateFlag(id, data),
    onSuccess: (flag) => {
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: flagKeys.detail(id) })
      toast({
        title: "Flag updated",
        description: `Feature flag "${flag.name}" has been updated successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error updating flag",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useToggleFlag() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => flagsApi.toggleFlag(id),
    onSuccess: (flag) => {
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: flagKeys.detail(flag.id) })
      toast({
        title: flag.enabled ? "Flag enabled" : "Flag disabled",
        description: `Feature flag "${flag.name}" is now ${flag.enabled ? "enabled" : "disabled"}.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error toggling flag",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useDeleteFlag() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => flagsApi.deleteFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() })
      toast({
        title: "Flag deleted",
        description: "Feature flag has been deleted successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting flag",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useArchiveFlag() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => flagsApi.archiveFlag(id),
    onSuccess: (flag) => {
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: flagKeys.detail(flag.id) })
      toast({
        title: "Flag archived",
        description: `Feature flag "${flag.name}" has been archived.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error archiving flag",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

// ============================================
// Variants Queries & Mutations
// ============================================

export function useVariants(flagId: string) {
  return useQuery({
    queryKey: flagKeys.variants(flagId),
    queryFn: () => flagsApi.getVariants(flagId),
    enabled: !!flagId,
  })
}

export function useCreateVariant(flagId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateVariantDto) => flagsApi.createVariant(flagId, data),
    onSuccess: (variant) => {
      queryClient.invalidateQueries({ queryKey: flagKeys.variants(flagId) })
      toast({
        title: "Variant created",
        description: `Variant "${variant.name || variant.key}" has been created successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error creating variant",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useUpdateVariant(flagId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: UpdateVariantDto }) =>
      flagsApi.updateVariant(flagId, variantId, data),
    onSuccess: (variant) => {
      queryClient.invalidateQueries({ queryKey: flagKeys.variants(flagId) })
      toast({
        title: "Variant updated",
        description: `Variant "${variant.name || variant.key}" has been updated successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error updating variant",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}

export function useDeleteVariant(flagId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (variantId: string) => flagsApi.deleteVariant(flagId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flagKeys.variants(flagId) })
      toast({
        title: "Variant deleted",
        description: "Variant has been deleted successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting variant",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })
}
