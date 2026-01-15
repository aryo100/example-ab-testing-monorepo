import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios"
import type { ApiError, AuthTokens } from "../types"

// ============================================
// Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1"

// ============================================
// Token Management
// ============================================

let accessToken: string | null = null
let refreshToken: string | null = null
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

export const tokenManager = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  
  setTokens: (tokens: AuthTokens) => {
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
    
    // Store refresh token in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", tokens.refreshToken)
      localStorage.setItem("access_token", tokens.accessToken)
    }
  },
  
  clearTokens: () => {
    accessToken = null
    refreshToken = null
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("access_token")
    }
  },
  
  loadTokensFromStorage: () => {
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("access_token")
      refreshToken = localStorage.getItem("refresh_token")
    }
  }
}

// Initialize tokens from storage
if (typeof window !== "undefined") {
  tokenManager.loadTokensFromStorage()
}

// ============================================
// Axios Instance
// ============================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// ============================================
// Request Interceptor
// ============================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken()
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================
// Response Interceptor with Token Refresh
// ============================================

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      const currentRefreshToken = tokenManager.getRefreshToken()
      
      if (!currentRefreshToken) {
        // No refresh token, redirect to login
        tokenManager.clearTokens()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }
      
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        // Call refresh endpoint
        const response = await axios.post<{ tokens: AuthTokens }>(
          `${API_BASE_URL}/api/${API_VERSION}/auth/refresh`,
          { refreshToken: currentRefreshToken },
          { headers: { "Content-Type": "application/json" } }
        )
        
        const { tokens } = response.data
        tokenManager.setTokens(tokens)
        
        onTokenRefreshed(tokens.accessToken)
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
        }
        
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        tokenManager.clearTokens()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // Handle other errors
    return Promise.reject(error)
  }
)

// ============================================
// Error Handler Utility
// ============================================

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined
    
    if (apiError?.message) {
      return apiError.message
    }
    
    if (apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0]
      if (firstError && firstError.length > 0) {
        return firstError[0]
      }
    }
    
    // Network errors
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again."
    }
    
    if (!error.response) {
      return "Network error. Please check your connection."
    }
    
    // HTTP status code errors
    switch (error.response.status) {
      case 400:
        return "Invalid request. Please check your input."
      case 401:
        return "Session expired. Please login again."
      case 403:
        return "You don't have permission to perform this action."
      case 404:
        return "Resource not found."
      case 409:
        return "Resource already exists."
      case 422:
        return "Validation error. Please check your input."
      case 429:
        return "Too many requests. Please try again later."
      case 500:
        return "Server error. Please try again later."
      default:
        return "An unexpected error occurred."
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return "An unexpected error occurred."
}

// ============================================
// API Response Helpers
// ============================================

export const extractData = <T>(response: { data: T }): T => {
  return response.data
}
