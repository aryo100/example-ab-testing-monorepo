import { apiClient } from "./client"
import type { ApiKey, CreateApiKeyDto, CreateApiKeyResponse } from "../types"

// ============================================
// API Keys API
// ============================================

export const apiKeysApi = {
  /**
   * Get all API keys for the current user
   */
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await apiClient.get<ApiKey[]>("/api-keys")
    return response.data
  },

  /**
   * Get a single API key by ID
   */
  async getApiKey(id: string): Promise<ApiKey> {
    const response = await apiClient.get<ApiKey>(`/api-keys/${id}`)
    return response.data
  },

  /**
   * Create a new API key
   * Note: The secret key is only returned once during creation
   */
  async createApiKey(data: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post<CreateApiKeyResponse>("/api-keys", data)
    return response.data
  },

  /**
   * Update API key name or permissions
   */
  async updateApiKey(
    id: string,
    data: Partial<Pick<CreateApiKeyDto, "name" | "permissions">>
  ): Promise<ApiKey> {
    const response = await apiClient.patch<ApiKey>(`/api-keys/${id}`, data)
    return response.data
  },

  /**
   * Revoke/Delete an API key
   */
  async deleteApiKey(id: string): Promise<void> {
    await apiClient.delete(`/api-keys/${id}`)
  },

  /**
   * Regenerate an API key (creates new secret, keeps same ID)
   */
  async regenerateApiKey(id: string): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post<CreateApiKeyResponse>(`/api-keys/${id}/regenerate`)
    return response.data
  },

  /**
   * Validate an API key
   */
  async validateApiKey(key: string): Promise<{ valid: boolean; apiKey?: ApiKey }> {
    const response = await apiClient.post<{ valid: boolean; apiKey?: ApiKey }>(
      "/api-keys/validate",
      { key }
    )
    return response.data
  },
}
