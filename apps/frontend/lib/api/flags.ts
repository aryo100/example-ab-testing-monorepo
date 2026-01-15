import { apiClient, extractData } from "./client"
import type {
  FeatureFlag,
  FlagVariant,
  CreateFlagDto,
  UpdateFlagDto,
  CreateVariantDto,
  UpdateVariantDto,
  PaginatedResponse,
} from "../types"

// ============================================
// Query Parameters
// ============================================

export interface FlagsQueryParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// ============================================
// Feature Flags API
// ============================================

export const flagsApi = {
  /**
   * Get all feature flags with pagination
   */
  async getFlags(params?: FlagsQueryParams): Promise<PaginatedResponse<FeatureFlag>> {
    const response = await apiClient.get<PaginatedResponse<FeatureFlag>>("/flags", {
      params,
    })
    return response.data
  },

  /**
   * Get all flags without pagination (for dropdowns, etc.)
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    const response = await apiClient.get<FeatureFlag[]>("/flags/all")
    return response.data
  },

  /**
   * Get a single flag by ID
   */
  async getFlag(id: string): Promise<FeatureFlag> {
    const response = await apiClient.get<FeatureFlag>(`/flags/${id}`)
    return response.data
  },

  /**
   * Get a flag by key
   */
  async getFlagByKey(key: string): Promise<FeatureFlag> {
    const response = await apiClient.get<FeatureFlag>(`/flags/key/${key}`)
    return response.data
  },

  /**
   * Create a new feature flag
   */
  async createFlag(data: CreateFlagDto): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag>("/flags", data)
    return response.data
  },

  /**
   * Update an existing flag
   */
  async updateFlag(id: string, data: UpdateFlagDto): Promise<FeatureFlag> {
    const response = await apiClient.patch<FeatureFlag>(`/flags/${id}`, data)
    return response.data
  },

  /**
   * Toggle flag enabled status
   */
  async toggleFlag(id: string): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag>(`/flags/${id}/toggle`)
    return response.data
  },

  /**
   * Delete a feature flag
   */
  async deleteFlag(id: string): Promise<void> {
    await apiClient.delete(`/flags/${id}`)
  },

  /**
   * Archive a feature flag
   */
  async archiveFlag(id: string): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag>(`/flags/${id}/archive`)
    return response.data
  },

  /**
   * Restore an archived flag
   */
  async restoreFlag(id: string): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag>(`/flags/${id}/restore`)
    return response.data
  },

  // ============================================
  // Variant Management
  // ============================================

  /**
   * Get all variants for a flag
   */
  async getVariants(flagId: string): Promise<FlagVariant[]> {
    const response = await apiClient.get<FlagVariant[]>(`/flags/${flagId}/variants`)
    return response.data
  },

  /**
   * Create a new variant
   */
  async createVariant(flagId: string, data: CreateVariantDto): Promise<FlagVariant> {
    const response = await apiClient.post<FlagVariant>(
      `/flags/${flagId}/variants`,
      data
    )
    return response.data
  },

  /**
   * Update an existing variant
   */
  async updateVariant(
    flagId: string,
    variantId: string,
    data: UpdateVariantDto
  ): Promise<FlagVariant> {
    const response = await apiClient.patch<FlagVariant>(
      `/flags/${flagId}/variants/${variantId}`,
      data
    )
    return response.data
  },

  /**
   * Delete a variant
   */
  async deleteVariant(flagId: string, variantId: string): Promise<void> {
    await apiClient.delete(`/flags/${flagId}/variants/${variantId}`)
  },

  /**
   * Reorder variants (update weights)
   */
  async reorderVariants(
    flagId: string,
    variantWeights: { id: string; weight: number }[]
  ): Promise<FlagVariant[]> {
    const response = await apiClient.post<FlagVariant[]>(
      `/flags/${flagId}/variants/reorder`,
      { variants: variantWeights }
    )
    return response.data
  },
}
