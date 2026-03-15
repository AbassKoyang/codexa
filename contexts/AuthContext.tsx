'use client'

import { fetchSessionUser } from '@/lib/api'
import { useFetchSessionUser } from '@/lib/queries'
import { User } from '@/lib/types'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext<{
  user: User | null
  loading: boolean,
  setUser: (user: User | null) => void,
  refreshUser: () => Promise<void>
}>({
  user: null,
  loading: true,
  setUser: () => {},
  refreshUser: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const {data, isLoading, isError, error} = useFetchSessionUser()

  const refreshUser = async () => {
    setLoading(true)
    try {
      const updatedUser = await fetchSessionUser()
      setUser(updatedUser)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    const getUser = async () => {
      if(isLoading) setLoading(true)
      if(data) {
        setUser(data)
        setLoading(false)
      }
      if(isError) console.error(error)
    }
    getUser();
  }, [data])

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)