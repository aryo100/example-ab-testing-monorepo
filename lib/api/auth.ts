import { apiClient, tokenManager, getErrorMessage } from "./client"
import type { 
  User, 
  AuthResponse, 
  LoginDto, 
  RegisterDto 
} from "../types"

// ============================================
// Auth API Endpoints
// ============================================

export const authApi = {
  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data)
    
    // Store tokens
    tokenManager.setTokens(response.data.tokens)
    
    return response.data
  },

  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data)
    
    // Store tokens
    tokenManager.setTokens(response.data.tokens)
    
    return response.data
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me")
    return response.data
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    const currentRefreshToken = tokenManager.getRefreshToken()
    
    if (!currentRefreshToken) {
      throw new Error("No refresh token available")
    }
    
    const response = await apiClient.post<{ tokens: AuthResponse["tokens"] }>(
      "/auth/refresh",
      { refreshToken: currentRefreshToken }
    )
    
    tokenManager.setTokens(response.data.tokens)
  },

  /**
   * Logout and invalidate tokens
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = tokenManager.getRefreshToken()
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken })
      }
    } catch {
      // Ignore errors on logout
    } finally {
      tokenManager.clearTokens()
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    })
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email })
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    })
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken()
  },

  /**
   * Get error message from auth error
   */
  getErrorMessage,
}
