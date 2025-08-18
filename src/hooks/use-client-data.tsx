'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseClientDataOptions<T> {
  fetchFn: () => Promise<T>
  dependencies?: unknown[]
  initialData?: T | null
  enabled?: boolean
}

interface UseClientDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useClientData<T>({
  fetchFn,
  dependencies = [],
  initialData = null,
  enabled = true
}: UseClientDataOptions<T>): UseClientDataReturn<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      console.error('Data fetching error:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Specialized hook for Supabase queries
export function useSupabaseQuery<T>({
  query,
  dependencies = [],
  enabled = true
}: {
  query: () => Promise<{ data: T | null; error: unknown }>
  dependencies?: unknown[]
  enabled?: boolean
}) {
  return useClientData({
    fetchFn: async () => {
      const { data, error } = await query()
      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'Database query failed'
        throw new Error(errorMessage)
      }
      return data
    },
    dependencies,
    enabled
  })
}