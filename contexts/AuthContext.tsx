'use client'

import { fetchSessionUser } from '@/lib/api'
import { useFetchSessionUser } from '@/lib/queries'
import { User } from '@/lib/types'
import { createContext, useContext, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useFetchSessionUser()

  const loading = isLoading

  const setUser = (user: User | null) => {
    queryClient.setQueryData(['session-user'], user)
  }

  const refreshUser = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['session-user'] })
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }

  if (isError) {
    console.error(error)
  }

  const value = useMemo(
    () => ({
      user: user ?? null,
      loading,
      setUser,
      refreshUser,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}