'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  authApi,
  setTokens,
  clearTokens,
  getTokens,
  TOKEN_EXPIRED_EVENT,
  ApiError,
} from '@/lib/api'

export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  isEmailVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname?.startsWith('/reset-password/') || pathname?.startsWith('/verify-email/')
  )

  const refreshUser = useCallback(async () => {
    const { accessToken } = getTokens()
    if (!accessToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const profile = await authApi.getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setUser(null)
      clearTokens()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial auth check
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      setUser(null)
      clearTokens()
      if (!isPublicRoute) {
        router.push('/login')
      }
    }

    window.addEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired)
    return () => window.removeEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired)
  }, [router, isPublicRoute])

  // Redirect logic
  useEffect(() => {
    if (isLoading) return

    if (!user && !isPublicRoute) {
      router.push('/login')
    } else if (user && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
      router.push('/dashboard')
    }
  }, [user, isLoading, pathname, router, isPublicRoute])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      setTokens(response.accessToken, response.refreshToken)
      setUser(response.user)
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message)
      }
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register(name, email, password)
      setTokens(response.accessToken, response.refreshToken)
      setUser(response.user)
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message)
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      clearTokens()
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return safe defaults during SSR
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      refreshUser: async () => {},
    }
  }
  return context
}
