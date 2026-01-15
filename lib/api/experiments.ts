import { apiClient } from "./client"
import type {
  Experiment,
  CreateExperimentDto,
  UpdateExperimentDto,
  PaginatedResponse,
} from "../types"

// ============================================
// Query Parameters
// ============================================

export interface ExperimentsQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  flagId?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// ============================================
// Experiments API
// ============================================

export const experimentsApi = {
  /**
   * Get all experiments with pagination
   */
  async getExperiments(params?: ExperimentsQueryParams): Promise<PaginatedResponse<Experiment>> {
    const response = await apiClient.get<PaginatedResponse<Experiment>>("/experiments", {
      params,
    })
    return response.data
  },

  /**
   * Get all experiments for a specific flag
   */
  async getExperimentsByFlag(flagId: string): Promise<Experiment[]> {
    const response = await apiClient.get<Experiment[]>(`/experiments/flag/${flagId}`)
    return response.data
  },

  /**
   * Get a single experiment by ID
   */
  async getExperiment(id: string): Promise<Experiment> {
    const response = await apiClient.get<Experiment>(`/experiments/${id}`)
    return response.data
  },

  /**
   * Create a new experiment
   */
  async createExperiment(data: CreateExperimentDto): Promise<Experiment> {
    const response = await apiClient.post<Experiment>("/experiments", data)
    return response.data
  },

  /**
   * Update an existing experiment
   */
  async updateExperiment(id: string, data: UpdateExperimentDto): Promise<Experiment> {
    const response = await apiClient.patch<Experiment>(`/experiments/${id}`, data)
    return response.data
  },

  /**
   * Delete an experiment
   */
  async deleteExperiment(id: string): Promise<void> {
    await apiClient.delete(`/experiments/${id}`)
  },

  // ============================================
  // Experiment Lifecycle
  // ============================================

  /**
   * Start an experiment (change status to running)
   */
  async startExperiment(id: string): Promise<Experiment> {
    const response = await apiClient.post<Experiment>(`/experiments/${id}/start`)
    return response.data
  },

  /**
   * Pause a running experiment
   */
  async pauseExperiment(id: string): Promise<Experiment> {
    const response = await apiClient.post<Experiment>(`/experiments/${id}/pause`)
    return response.data
  },

  /**
   * Resume a paused experiment
   */
  async resumeExperiment(id: string): Promise<Experiment> {
    const response = await apiClient.post<Experiment>(`/experiments/${id}/resume`)
    return response.data
  },

  /**
   * Complete/Stop an experiment
   */
  async completeExperiment(id: string): Promise<Experiment> {
    const response = await apiClient.post<Experiment>(`/experiments/${id}/complete`)
    return response.data
  },

  /**
   * Reset experiment (back to draft)
   */
  async resetExperiment(id: string): Promise<Experiment> {
    const response = await apiClient.post<Experiment>(`/experiments/${id}/reset`)
    return response.data
  },
}
