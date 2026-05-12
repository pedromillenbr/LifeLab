'use client'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { fireDailyReminderIfDue } from '@/lib/notifications'
import { today } from '@/lib/utils'

// Note: localStorage hydration is now handled by AuthGuard so it can
// coordinate with user-switch detection. This component only runs
// post-auth side-effects (access tracking, notifications).
export function StoreHydration() {
  useEffect(() => {
    try {
      const state = useStore.getState()
      state.recordAccess()
      if (state.profile.notifications) {
        const pendingHabits = state.habits.filter(
          h => !h.completions.includes(today()),
        ).length
        if (pendingHabits > 0) {
          fireDailyReminderIfDue(
            'LifeLab — lembrete do dia',
            `Você ainda tem ${pendingHabits} ${pendingHabits === 1 ? 'hábito' : 'hábitos'} para concluir hoje.`,
          )
        }
      }
    } catch (err) {
      console.error('[storage] post-auth side-effects failed:', err)
    }
  }, [])
  return null
}
