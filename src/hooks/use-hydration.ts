import { useEffect, useState } from 'react'

/**
 * Hook to detect when client-side hydration is complete.
 * Prevents hydration mismatch between server and client when using persisted stores.
 * 
 * Usage:
 * const hydrated = useHydration()
 * {hydrated ? actualValue : '-'}
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    setHydrated(true)
  }, [])
  
  return hydrated
}

/**
 * Alternative hook with callback for when hydration is complete
 */
export function useOnHydration(callback: () => void): void {
  useEffect(() => {
    callback()
  }, [callback])
}
