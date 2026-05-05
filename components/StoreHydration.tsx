'use client'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'
import { fireDailyReminderIfDue } from '@/lib/notifications'

export function StoreHydration() {
  useEffect(() => {
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
