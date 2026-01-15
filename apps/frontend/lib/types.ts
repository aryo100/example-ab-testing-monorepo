// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T
  message?: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  error?: string
  statusCode: number
  errors?: Record<string, string[]>
}

// ============================================
// Auth Types
// ============================================

export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
  updatedAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name?: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

// ============================================
// Feature Flag Types
// ============================================

export type FlagType = "boolean" | "percentage" | "variant"
export type FlagStatus = "active" | "inactive" | "archived"

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description?: string
  type: FlagType
  enabled: boolean
  percentage?: number
  status: FlagStatus
  tags?: string[]
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface FlagVariant {
  id: string
  flagId: string
  key: string
  name?: string
  description?: string
  weight: number
  payload?: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

export interface CreateFlagDto {
  key: string
  name: string
  description?: string
  type: FlagType
  enabled?: boolean
  percentage?: number
  tags?: string[]
}

export interface UpdateFlagDto {
  name?: string
  description?: string
  enabled?: boolean
  percentage?: number
  status?: FlagStatus
  tags?: string[]
}

export interface CreateVariantDto {
  key: string
  name?: string
  description?: string
  weight: number
  payload?: Record<string, unknown>
}

export interface UpdateVariantDto {
  name?: string
  description?: string
  weight?: number
  payload?: Record<string, unknown>
}

// ============================================
// Experiment Types
// ============================================

export type ExperimentStatus = "draft" | "running" | "paused" | "completed"

export interface Experiment {
  id: string
  flagId: string
  name: string
  description?: string
  hypothesis?: string
  startDate?: string
  endDate?: string
  status: ExperimentStatus
  targetSampleSize?: number
  currentSampleSize?: number
  createdBy?: string
  createdAt: string
  updatedAt: string
  flag?: FeatureFlag
}

export interface CreateExperimentDto {
  flagId: string
  name: string
  description?: string
  hypothesis?: string
  startDate?: string
  endDate?: string
  targetSampleSize?: number
}

export interface UpdateExperimentDto {
  name?: string
  description?: string
  hypothesis?: string
  startDate?: string
  endDate?: string
  targetSampleSize?: number
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsSummary {
  flagId: string
  totalImpressions: number
  totalConversions: number
  conversionRate: number
  uniqueUsers: number
  timeSeries: TimeSeriesData[]
  variantDistribution: VariantDistribution[]
}

export interface TimeSeriesData {
  date: string
  impressions: number
  conversions: number
  uniqueUsers: number
}

export interface VariantDistribution {
  variant: string
  impressions: number
  conversions: number
  conversionRate: number
  percentage: number
}

export interface AnalyticsQuery {
  startDate?: string
  endDate?: string
  granularity?: "hour" | "day" | "week" | "month"
}

// ============================================
// API Key Types
// ============================================

export type ApiKeyEnvironment = "production" | "staging" | "development"

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  environment: ApiKeyEnvironment
  permissions: string[]
  createdAt: string
  lastUsedAt?: string
  expiresAt?: string
}

export interface CreateApiKeyDto {
  name: string
  environment: ApiKeyEnvironment
  permissions?: string[]
  expiresAt?: string
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey
  secretKey: string // Only returned once on creation
}

// ============================================
// Event Types (for SDK)
// ============================================

export interface ExposureEvent {
  flagKey: string
  variantKey?: string
  userId: string
  timestamp: string
  context?: Record<string, unknown>
}

export interface ConversionEvent {
  flagKey: string
  eventName: string
  userId: string
  timestamp: string
  value?: number
  context?: Record<string, unknown>
}

// ============================================
// Client SDK Types
// ============================================

export interface DecideRequest {
  flagKey: string
  userId: string
  context?: Record<string, unknown>
}

export interface DecideResponse {
  flagKey: string
  enabled: boolean
  variant?: string
  payload?: Record<string, unknown>
}
