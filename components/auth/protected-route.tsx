"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { authApi } from "@/lib/api/auth"
import { Loader2 } from "lucide-react"

// ============================================
// Public Routes Configuration
// ============================================

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"]

// ============================================
// Loading Component
// ============================================

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

// ============================================
// Protected Route Component
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, setUser, clearAuth, setInitialized, _hasHydrated } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for hydration
    if (!_hasHydrated) return

    const checkAuth = async () => {
      const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route))

      // If on public route and authenticated, redirect to dashboard
      if (isPublicRoute && isAuthenticated) {
        router.replace("/flags")
        return
      }

      // If on public route and not authenticated, allow access
      if (isPublicRoute) {
        setIsChecking(false)
        setInitialized(true)
        return
      }

      // For protected routes, verify authentication
      if (!authApi.isAuthenticated()) {
        clearAuth()
        router.replace("/login")
        return
      }

      // If we have token but no user data, fetch user
      if (!user && authApi.isAuthenticated()) {
        try {
          const currentUser = await authApi.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          // Token invalid, clear auth and redirect
          clearAuth()
          router.replace("/login")
          return
        }
      }

      setIsChecking(false)
      setInitialized(true)
    }

    checkAuth()
  }, [_hasHydrated, pathname, isAuthenticated, user, router, setUser, clearAuth, setInitialized])

  // Show loading while checking auth or waiting for hydration
  if (!_hasHydrated || isChecking) {
    return <AuthLoading />
  }

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route))

  // For protected routes, ensure user is authenticated
  if (!isPublicRoute && !isAuthenticated) {
    return <AuthLoading />
  }

  return <>{children}</>
}

// ============================================
// Auth Guard HOC (Alternative)
// ============================================

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    )
  }
}

// ============================================
// useRequireAuth Hook
// ============================================

export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [_hasHydrated, isAuthenticated, router, redirectTo])

  return { isAuthenticated, isLoading: !_hasHydrated }
}
