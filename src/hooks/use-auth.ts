/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/auth"

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setAuthState({ user: data.user, loading: false, error: null })
      } else {
        setAuthState({ user: null, loading: false, error: null })
      }
    } catch (error) {
      setAuthState({ user: null, loading: false, error: "Failed to check authentication" })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setAuthState({ user: data.user, loading: false, error: null })
        return { success: true }
      } else {
        setAuthState((prev) => ({ ...prev, loading: false, error: data.error }))
        return { success: false, error: data.error }
      }
    } catch (error) {
      const errorMessage = "Login failed"
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // After successful registration, log the user in
        return await login(email, password)
      } else {
        setAuthState((prev) => ({ ...prev, loading: false, error: data.error }))
        return { success: false, error: data.error }
      }
    } catch (error) {
      const errorMessage = "Registration failed"
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setAuthState({ user: null, loading: false, error: null })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    checkAuth,
  }
}
