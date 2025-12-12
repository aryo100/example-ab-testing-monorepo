import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types"

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token)
        }
        set({ user, token })
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
        }
        set({ user: null, token: null })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
