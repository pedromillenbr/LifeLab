// ════════════════════════════════════════════════════════════════════
//  LifeLab — XP sync bridge
//  Watches the local zustand store for XP/streak changes and forwards
//  them to the public ranking via SECURITY DEFINER RPCs.
//  This avoids touching the zustand reducers directly.
// ════════════════════════════════════════════════════════════════════

import { useStore } from '@/store/useStore'
import { awardXP, syncStreak, bumpDaysActive } from './api'

let started = false
let unsubscribe: (() => void) | null = null
let lastXP:     number | null = null
let lastStreak: number | null = null
let pendingDelta = 0
let flushTimer: ReturnType<typeof setTimeout> | null = null
let lastStreakSyncMs = 0
let lastBumpedDay: string | null = null

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Begin syncing XP/streak deltas to the public profile.
 * Idempotent. Call once per session, e.g. from AuthGuard after the
 * user has completed community onboarding.
 */
export function startXPSync() {
  if (started) return
  started = true

  // Seed from current state so the first delta isn't bogus.
  const { profile, getAccessStreak } = useStore.getState()
  lastXP = profile.xp ?? 0
  try { lastStreak = getAccessStreak() } catch { lastStreak = 0 }

  // Mark today as an active day immediately on startup. The RPC is
  // idempotent per (user, day) so re-calls are cheap.
  const day = todayUTC()
  if (lastBumpedDay !== day) {
    lastBumpedDay = day
    bumpDaysActive(day).catch(() => {})
  }

  unsubscribe = useStore.subscribe((state) => {
    const xp = state.profile.xp ?? 0
    if (lastXP == null) { lastXP = xp; return }
    const delta = xp - lastXP
    if (delta > 0) {
      pendingDelta += delta
      lastXP = xp
      // If the day rolled over while the app was open, bump again.
      const day = todayUTC()
      if (lastBumpedDay !== day) {
        lastBumpedDay = day
        bumpDaysActive(day).catch(() => {})
      }
      scheduleFlush()
    } else if (delta < 0) {
      // XP can decrease (e.g. unchecking a habit). Don't push negative
      // amounts to the server; just resync the baseline.
      lastXP = xp
    }

    // Streak sync, throttled to once per minute.
    let s = 0
    try { s = state.getAccessStreak() } catch { /* noop */ }
    if (s !== lastStreak) {
      lastStreak = s
      const now = Date.now()
      if (now - lastStreakSyncMs > 60_000) {
        lastStreakSyncMs = now
        syncStreak(s).catch(() => {})
      }
    }
  })
}

export function stopXPSync() {
  if (unsubscribe) { unsubscribe(); unsubscribe = null }
  if (flushTimer)  { clearTimeout(flushTimer); flushTimer = null }
  started = false
  lastXP = null
  lastStreak = null
  pendingDelta = 0
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(flush, 1500)
}

async function flush() {
  flushTimer = null
  const amount = pendingDelta
  if (amount <= 0) return
  pendingDelta = 0

  const streak = lastStreak ?? undefined
  // Single bundled award — granular source breakdown is in the audit log
  // when each individual reducer eventually calls awardXPDirect.
  await awardXP(amount, 'bundle', streak)
}

// ── Direct call (used by future reducers that want fine-grained source) ──

export async function awardXPDirect(amount: number, source: string, streak?: number) {
  return awardXP(amount, source, streak)
}
