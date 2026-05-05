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

  // No remote row → this account has never synced. Push local data now.
  if (!data?.payload) {
    console.log('[sync] no remote row — pushing local data')
    const { error: pushErr } = await supabase
      .from('user_data')
      .upsert(
        { id: userId, payload: getPayload(), updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
    if (pushErr) console.error('[sync] initial push error:', pushErr.message)
    return 'pushed'
  }

  // Remote row exists — apply it to the store.
  // Block the subscribe handler so setState doesn't trigger a redundant push.
  _isPulling = true
  const remote = data.payload as ReturnType<typeof getPayload>
  useStore.setState({
    profile:            remote.profile            ?? useStore.getState().profile,
    habits:             remote.habits             ?? [],
    missions:           remote.missions           ?? [],
    weightLog:          remote.weightLog          ?? [],
    transactions:       remote.transactions       ?? [],
    bibleReadings:      remote.bibleReadings      ?? [],
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
    if (_currentUserId === userId) return   // already running for this user
    _unsubscribe()                          // switch user — tear down old subscription
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
