'use client'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

export function StoreHydration() {
  useEffect(() => {
    const result = useStore.persist.rehydrate()
    const onReady = () => useStore.getState().recordAccess()
    if (result instanceof Promise) result.then(onReady)
    else onReady()
  }, [])
  return null
}
