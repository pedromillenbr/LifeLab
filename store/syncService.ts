'use client'

import { supabase } from '@/lib/supabase'
import { useStore } from './useStore'

// ── helpers ───────────────────────────────────────────────────────────

function getPayload() {
  const s = useStore.getState()
  return {
    profile:            s.profile,
    habits:             s.habits,
    missions:           s.missions,
    weightLog:          s.weightLog,
    transactions:       s.transactions,
    bibleReadings:      s.bibleReadings,
    activePlanId:       s.activePlanId,
    prayerLog:          s.prayerLog,
    accessLog:          s.accessLog,
    routines:           s.routines,
    workoutSessions:    s.workoutSessions,
    calendarEvents:     s.calendarEvents,
    biblePlansProgress: s.biblePlansProgress,
    foodEntries:        s.foodEntries,
    dietGoals:          s.dietGoals,
    customMeals:        s.customMeals,
    waterLog:           s.waterLog,
  }
}

function isDefaultState(): boolean {
  const s = useStore.getState()
  // If local data has any real content, it's not default
  return (
    s.weightLog.length === 0 &&
    s.habits.length === 0 &&
    s.workoutSessions.length === 0 &&
    s.profile.name === 'Usuário' &&
    s.profile.xp === 0
  )
}

// Guards against the subscribe callback firing during setState (pull)
let _isPulling = false

// Tracks current user for push operations
let _currentUserId: string | null = null
let _pushTimer: ReturnType<typeof setTimeout> | null = null
let _unsubscribe: (() => void) | null = null

// ── push: Zustand → Supabase (debounced) ─────────────────────────────

function schedulePush() {
  if (!_currentUserId || _isPulling) return
  if (_pushTimer) clearTimeout(_pushTimer)
  _pushTimer = setTimeout(async () => {
    if (!_currentUserId) return
    const { error } = await supabase
      .from('user_data')
      .upsert(
        { id: _currentUserId, payload: getPayload(), updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
    if (error) console.error('[sync] push error:', error.message)
    else console.log('[sync] pushed')
  }, 1200)
}

async function pushNow(userId: string) {
  const { error } = await supabase
    .from('user_data')
    .upsert(
      { id: userId, payload: getPayload(), updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
  if (error) console.error('[sync] pushNow error:', error.message)
  else console.log('[sync] pushed (immediate)')
}

// ── pull: Supabase → Zustand ──────────────────────────────────────────

export async function pullFromSupabase(userId: string): Promise<'pulled' | 'pushed' | 'no-op'> {
  const { data, error } = await supabase
    .from('user_data')
    .select('payload, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[sync] pull error:', error.message)
    return 'no-op'
  }

  // No remote row → push local data only if it has real content
  if (!data?.payload) {
    if (!isDefaultState()) {
      console.log('[sync] no remote row, local has data — pushing up')
      await pushNow(userId)
      return 'pushed'
    }
    console.log('[sync] no remote row and local is empty — nothing to do')
    return 'no-op'
  }

  // Remote row exists — check if local has more data than remote
  // (e.g. device that already had data before sync was enabled)
  const remote = data.payload as ReturnType<typeof getPayload>
  const localWeight = useStore.getState().weightLog.length
  const remoteWeight = (remote.weightLog ?? []).length
  const localHabits  = useStore.getState().habits.length
  const remoteHabits = (remote.habits ?? []).length
  const localSessions = useStore.getState().workoutSessions.length
  const remoteSessions = (remote.workoutSessions ?? []).length

  // If local clearly has more data across multiple fields, push local up instead
  const localScore  = localWeight + localHabits + localSessions
  const remoteScore = remoteWeight + remoteHabits + remoteSessions

  if (localScore > remoteScore && !isDefaultState()) {
    console.log('[sync] local has more data than remote — pushing local up')
    await pushNow(userId)
    return 'pushed'
  }

  // Remote wins — apply to store, blocking the subscribe handler
  _isPulling = true
  useStore.setState({
    profile:            remote.profile            ?? useStore.getState().profile,
    habits:             remote.habits             ?? [],
    missions:           remote.missions           ?? [],
    weightLog:          remote.weightLog          ?? [],
    transactions:       remote.transactions       ?? [],
    bibleReadings:      remote.bibleReadings       ?? [],
    activePlanId:       remote.activePlanId       ?? 'nt1year',
    prayerLog:          remote.prayerLog          ?? [],
    accessLog:          remote.accessLog          ?? [],
    routines:           remote.routines           ?? [],
    workoutSessions:    remote.workoutSessions    ?? [],
    calendarEvents:     remote.calendarEvents     ?? [],
    biblePlansProgress: remote.biblePlansProgress ?? {},
    foodEntries:        remote.foodEntries        ?? [],
    dietGoals:          remote.dietGoals          ?? { calories: 2000, protein: 120, waterGoal: 2 },
    customMeals:        remote.customMeals        ?? useStore.getState().customMeals,
    waterLog:           remote.waterLog           ?? [],
  })
  _isPulling = false

  console.log('[sync] pulled from supabase')
  return 'pulled'
}

// ── auto-sync: subscribe to store mutations ───────────────────────────

export function startAutoSync(userId: string) {
  // Prevent double-subscription if called twice for the same user
  if (_unsubscribe) {
    if (_currentUserId === userId) return
    _unsubscribe()
    _unsubscribe = null
  }

  _currentUserId = userId
  _unsubscribe = useStore.subscribe(() => {
    schedulePush()
  })
  console.log('[sync] auto-sync started for', userId)
}

export function stopAutoSync() {
  _currentUserId = null
  if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null }
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null }
  console.log('[sync] auto-sync stopped')
}
