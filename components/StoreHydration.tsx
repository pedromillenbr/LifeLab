'use client'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'
import { fireDailyReminderIfDue } from '@/lib/notifications'

// Bumped when a bad deploy corrupts localStorage — forces a clean wipe on all clients
const STORAGE_VERSION = '3'
const STORAGE_VERSION_KEY = 'lifelab-storage-version'

function sanitizeStorage() {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY)
    if (version === STORAGE_VERSION) return

    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      // Wipe app data — keep new auth token (lifelab-auth) intact since
      // the storage version is bumped on bad deploys, not on auth changes.
      if (key && key.startsWith('lifelab-') && key !== 'lifelab-auth' && key !== STORAGE_VERSION_KEY) {
        keysToRemove.push(key)
      }
      // Also remove old default-name supabase auth tokens (pre-rename)
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
    console.log('[storage] wiped stale storage, version', STORAGE_VERSION)
  } catch {
    // localStorage not available
  }
}

export function StoreHydration() {
  useEffect(() => {
    try {
      sanitizeStorage()
    } catch (err) {
      console.error('[storage] sanitize failed:', err)
    }

    let result: void | Promise<void>
    try {
      result = useStore.persist.rehydrate()
    } catch (err) {
      console.error('[storage] rehydrate failed:', err)
      return
    }

    const onReady = () => {
      try {
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
      } catch (err) {
        console.error('[storage] onReady failed:', err)
      }
    }

    if (result instanceof Promise) result.then(onReady).catch(err => console.error('[storage] hydration error:', err))
    else onReady()
  }, [])
  return null
}
