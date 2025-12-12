import type { User, AuthResponse } from "../types"

const DEMO_USER: User = {
  id: "demo-user-1",
  email: "demo@admin.com",
  name: "Demo Admin",
  createdAt: new Date().toISOString(),
}

const DEMO_TOKEN = "demo-token-12345"

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Demo credentials
    if (email === "demo@admin.com" && password === "demo123") {
      return {
        user: DEMO_USER,
        token: DEMO_TOKEN,
      }
    }

    // Allow any email/password for testing
    return {
      user: {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email: email,
        name: email.split("@")[0],
        createdAt: new Date().toISOString(),
      },
      token: "token-" + Math.random().toString(36).substr(2, 20),
    }
  },

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      user: {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email: email,
        name: name || email.split("@")[0],
        createdAt: new Date().toISOString(),
      },
      token: "token-" + Math.random().toString(36).substr(2, 20),
    }
  },

  async getCurrentUser(): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { ...DEMO_USER }
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
  },
}
