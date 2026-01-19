'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to handle Zustand hydration with localStorage persistence
 * Returns true only after client-side hydration is complete
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}

/**
 * Hook to safely get a value that may differ between server and client
 * Returns serverValue on server, clientValue on client after hydration
 */
export function useHydratedValue<T>(serverValue: T, clientValue: T): T {
  const hydrated = useHydration()
  return hydrated ? clientValue : serverValue
}
