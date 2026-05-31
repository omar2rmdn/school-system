"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: "admin" | "parent" | "teacher" | "supervisor"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = user !== null

  // On mount, try to refresh the session and restore user data
  useEffect(() => {
    fetch("/api/auth/refresh", { method: "POST" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          }
        } else {
          setUser(null)
        }
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message ?? "Login failed")
    }

    // Store user data from response
    if (data.user) {
      setUser(data.user)
    }

    router.push("/")
    router.refresh()
  }, [router])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/login")
    router.refresh()
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
