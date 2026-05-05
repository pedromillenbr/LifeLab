'use client'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'
import { fireDailyReminderIfDue } from '@/lib/notifications'

// Bumped when a bad deploy corrupts localStorage — forces a clean wipe on all clients
const STORAGE_VERSION = '2'
const STORAGE_VERSION_KEY = 'lifelab-storage-version'

function sanitizeStorage() {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY)
    if (version === STORAGE_VERSION) return // already clean

    // Version mismatch or missing → wipe corrupted data
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('lifelab-')) keysToRemove.push(key)
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
    console.log('[storage] wiped stale/corrupted storage, version', STORAGE_VERSION)
  } catch {
    // localStorage not available (SSR / private mode with blocked storage)
  }
}

export function StoreHydration() {
  useEffect(() => {
    // Wipe storage if version stamp is missing or outdated
    sanitizeStorage()

    // Hydrate localStorage → Zustand (offline cache)
    const result = useStore.persist.rehydrate()
    const onReady = () => {
      const state = useStore.getState()
      state.recordAccess()
      applyTheme(state.profile.primaryColor || DEFAULT_THEME_KEY)
      if (state.profile.notifications) {
        const pendingHabits = state.habits.filter(
          h => !h.completions.includes(new Date().toISOString().split('T')[0]),
        ).length
        if (pendingHabits > 0) {
          fireDailyReminderIfDue(
            'LifeLab — lembrete do dia',
            `Você ainda tem ${pendingHabits} ${pendingHabits === 1 ? 'hábito' : 'hábitos'} para concluir hoje.`,
          )
        }
      }
    }
    if (result instanceof Promise) result.then(onReady)
    else onReady()
  }, [])
  return null
}
