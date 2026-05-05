'use client'

/**
 * Supabase ↔ Zustand sync
 *
 * Strategy: one row per user in `user_data` table (JSONB column `payload`).
 * - On login  → pull row from Supabase, merge into Zustand (Supabase wins for new devices)
 * - On change → debounced upsert of the full Zustand partialised state
 *
 * Table DDL (run once in Supabase SQL editor):
 *
 *   create table if not exists public.user_data (
 *     id         uuid primary key references auth.users(id) on delete cascade,
 *     payload    jsonb not null default '{}'::jsonb,
 *     updated_at timestamptz not null default now()
 *   );
 *   alter table public.user_data enable row level security;
 *   create policy "owner" on public.user_data
 *     using  (auth.uid() = id)
 *     with check (auth.uid() = id);
 */

import { supabase } from '@/lib/supabase'
import { useStore } from './useStore'

// ── helpers ──────────────────────────────────────────────────────────

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

// ── pull: Supabase → Zustand ──────────────────────────────────────────

export async function pullFromSupabase(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_data')
    .select('payload')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[sync] pull error:', error.message)
    return false
  }
  if (!data?.payload) return false   // first login on this account — nothing to pull

  // Merge remote payload into store (remote wins over empty defaults)
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

  return true
}

// ── push: Zustand → Supabase (debounced) ─────────────────────────────

let _pushTimer: ReturnType<typeof setTimeout> | null = null
let _currentUserId: string | null = null

export function setCurrentUserId(id: string | null) {
  _currentUserId = id
}

export function pushToSupabase() {
  if (!_currentUserId) return
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
  }, 1200)   // 1.2s debounce — agrega múltiplas ações rápidas
}

// ── subscribe: auto-push on every store mutation ─────────────────────

let _unsubscribe: (() => void) | null = null

export function startAutoSync(userId: string) {
  setCurrentUserId(userId)
  // Subscribe to any store change → push
  _unsubscribe = useStore.subscribe(() => {
    pushToSupabase()
  })
}

export function stopAutoSync() {
  setCurrentUserId(null)
  if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null }
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null }
}
