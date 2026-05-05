'use client'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'
import { fireDailyReminderIfDue } from '@/lib/notifications'

export function StoreHydration() {
  useEffect(() => {
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
