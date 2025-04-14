"use client"

import type React from "react"
import { createContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id?: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  loading: false,
  error: null,
  clearError: () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken")
      const storedUser = localStorage.getItem("user")

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        } catch (err) {
          // Invalid stored user data
          localStorage.removeItem("authToken")
          localStorage.removeItem("user")
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const clearError = () => {
    setError(null)
  }

  // Update the login function to better handle errors
  const login = async (email: string, password: string) => {
    setLoading(true)
    clearError()

    try {
      const response = await fetch("http://172.203.229.218:8082/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password")
      }

      // Store auth data
      localStorage.setItem("authToken", data.token || "dummy-token")

      // Create user object from response
      const userData = {
        id: data.id || data.userId || "user-id",
        username: data.username || email.split("@")[0],
        email: email,
      }

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (username: string, email: string, password: string) => {
    setLoading(true)
    clearError()

    try {
      const response = await fetch("http://172.203.229.218:8082/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Don't authenticate user after signup - they need to login
      return data
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
