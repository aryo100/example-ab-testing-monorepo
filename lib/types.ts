// Core Feature Flag Types
export type FlagType = "boolean" | "percentage" | "variant"

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description?: string
  type: FlagType
  enabled: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface FlagVariant {
  id: string
  flag_id: string
  key: string
  weight: number
}

// Experiment Types
export interface Experiment {
  id: string
  flag_id: string
  name: string
  description?: string
  hypothesis?: string
  start_date: string
  end_date?: string
  status: "draft" | "running" | "completed" | "paused"
  created_by: string
  created_at: string
  updated_at: string
}

export interface ExposureEvent {
  id: string
  flag_id: string
  experiment_id?: string
  user_id: string
  variant_key?: string
  context?: Record<string, any>
  timestamp: string
}

// Analytics Types
export interface AnalyticsSummary {
  flag_id: string
  total_exposures: number
  unique_users: number
  variant_distribution: Record<string, number>
  time_series: TimeSeriesData[]
}

export interface TimeSeriesData {
  timestamp: string
  exposures: number
  unique_users: number
}

// API Key Types
export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used?: string
}

// User/Auth Types
export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Form DTOs
export interface CreateFlagDto {
  key: string
  name: string
  description?: string
  type: FlagType
  enabled?: boolean
}

export interface UpdateFlagDto {
  name?: string
  description?: string
  enabled?: boolean
}

export interface CreateExperimentDto {
  flag_id: string
  name: string
  description?: string
  hypothesis?: string
  start_date: string
  end_date?: string
}

export interface CreateVariantDto {
  key: string
  weight: number
}
