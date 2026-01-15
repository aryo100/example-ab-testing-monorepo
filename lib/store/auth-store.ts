import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "../types"
import { tokenManager } from "../api/client"

// ============================================
// Auth State Interface
// ============================================

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  clearAuth: () => void
  
  // Hydration check for SSR
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

// ============================================
// Auth Store
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      _hasHydrated: false,
      
      setUser: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false,
        })
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized, isLoading: false })
      },
      
      clearAuth: () => {
        tokenManager.clearTokens()
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false,
        })
      },
      
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        // Use localStorage only on client side
        if (typeof window !== "undefined") {
          return localStorage
        }
        // Return a dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// ============================================
// Auth Selectors
// ============================================

export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectIsInitialized = (state: AuthState) => state.isInitialized
export const selectHasHydrated = (state: AuthState) => state._hasHydrated

// ============================================
// Auth Hooks
// ============================================

export const useUser = () => useAuthStore(selectUser)
export const useIsAuthenticated = () => useAuthStore(selectIsAuthenticated)
export const useIsAuthLoading = () => useAuthStore(selectIsLoading)
