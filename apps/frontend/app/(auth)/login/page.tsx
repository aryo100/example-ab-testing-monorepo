"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api/auth"
import { useAuthStore } from "@/lib/store/auth-store"
import { Flag } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await authApi.login(email, password)
      setAuth(response.user, response.token)
      router.push("/flags")
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError("")
    setLoading(true)
    try {
      const response = await authApi.login("demo@admin.com", "demo123")
      setAuth(response.user, response.token)
      router.push("/flags")
    } catch (err: any) {
      setError(err.response?.data?.message || "Demo login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Flag className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your FeatureFlag account</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted"
                />
              </div>

              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or try demo</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Demo Login
            </Button>

            <div className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <div className="font-medium mb-1">Demo Credentials:</div>
              <div>Email: demo@admin.com</div>
              <div>Password: demo123</div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
