'use client'

import { restFetch } from '@/lib/auth'
import { useStore } from './useStore'
import { getBiblePlan } from '@/lib/bibleData'

const LAST_USER_KEY = 'lifelab-last-user-id'
const STORAGE_KEY   = 'lifelab-storage'

// Reset store to defaults — used when a different user logs in
export function resetStoreToDefaults() {
  useStore.setState({
    profile: {
      name: 'Usuário',
      bio: '',
      avatar: null,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      primaryColor: 'verde',
      darkMode: true,
      notifications: false,
      currency: 'BRL',
      language: 'pt',
      createdAt: (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}` })(),
    },
    habits: [],
    missions: [],
    weightLog: [],
    transactions: [],
    bibleReadings: [],
    activePlanId: 'biblia-1-ano',
    prayerLog: [],
    accessLog: [],
    routines: [],
    workoutSessions: [],
    calendarEvents: [],
    biblePlansProgress: {},
    foodEntries: [],
    dietGoals: { calories: 2000, protein: 120, waterGoal: 2 },
    customMeals: [
      { id: 'cafe',   label: 'Café da manhã', icon: 'sun'    },
      { id: 'almoco', label: 'Almoço',        icon: 'soup'   },
      { id: 'jantar', label: 'Jantar',        icon: 'moon'   },
      { id: 'lanche', label: 'Lanches',       icon: 'cookie' },
    ],
    waterLog: [],
  })
  // Wipe persisted blob so old user's data doesn't leak back via rehydrate
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

// Check if the current user differs from the last logged-in user
// If yes (or if there's stale data with no owner), wipe local data
// to prevent cross-account leakage
export function ensureUserMatch(userId: string): boolean {
  try {
    const lastUser = localStorage.getItem(LAST_USER_KEY)

    if (lastUser === userId) {
      return true // same user — keep local data
    }

    // Either user changed, or no lastUser pointer exists.
    // In both cases, any data in lifelab-storage is suspect — wipe it.
    resetStoreToDefaults()
    localStorage.setItem(LAST_USER_KEY, userId)
    return false // treat as new user
  } catch {
    return true
  }
}

export function clearLastUser() {
  try { localStorage.removeItem(LAST_USER_KEY) } catch { /* ignore */ }
}

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

// Score-based comparison — count "real" data items (not defaults)
function dataScore(payload: ReturnType<typeof getPayload>): number {
  return (
    (payload.weightLog?.length || 0) +
    (payload.habits?.length || 0) +
    (payload.workoutSessions?.length || 0) +
    (payload.routines?.length || 0) +
    (payload.foodEntries?.length || 0) +
    (payload.transactions?.length || 0) +
    (payload.missions?.length || 0) +
    (payload.calendarEvents?.length || 0) +
    (payload.bibleReadings?.length || 0) +
    (payload.prayerLog?.length || 0) +
    (payload.accessLog?.length || 0) +
    (payload.profile?.avatar ? 5 : 0) +
    (payload.profile?.xp || 0) / 100
  )
}

// Guard: skip auto-push during pull-induced setState
let _isPulling = false

let _currentUserId: string | null = null
let _pushTimer: ReturnType<typeof setTimeout> | null = null
let _unsubscribe: (() => void) | null = null

// ── push ──────────────────────────────────────────────────────────────

async function pushNow(userId: string): Promise<boolean> {
  try {
    const res = await restFetch('/user_data', {
      method: 'POST',
      headers: {
        // PostgREST upsert: merge on conflict via primary key
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: userId,
        payload: getPayload(),
        updated_at: new Date().toISOString(),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

function schedulePush() {
  if (!_currentUserId || _isPulling) return
  if (_pushTimer) clearTimeout(_pushTimer)
  _pushTimer = setTimeout(() => {
    if (_currentUserId) pushNow(_currentUserId)
  }, 1200)
}

// ── pull ──────────────────────────────────────────────────────────────

export async function pullFromSupabase(userId: string): Promise<'pulled' | 'pushed' | 'merged' | 'no-op'> {
  let data: { payload: unknown; updated_at: string } | null = null
  try {
    const res = await restFetch(
      `/user_data?id=eq.${encodeURIComponent(userId)}&select=payload,updated_at&limit=1`,
      { method: 'GET' },
    )
    if (!res.ok) return 'no-op'
    const rows = (await res.json().catch(() => [])) as Array<{ payload: unknown; updated_at: string }>
    data = rows[0] ?? null
  } catch {
    return 'no-op'
  }

  // No remote row yet — ALWAYS create one so future devices have something to pull.
  if (!data?.payload) {
    await pushNow(userId)
    return 'pushed'
  }

  const remote = data.payload as ReturnType<typeof getPayload>
  const local = getPayload()
  const remoteScore = dataScore(remote)
  const localScore  = dataScore(local)

  // If local has more data than remote, push local up (don't lose data)
  if (localScore > remoteScore + 0.5) {
    await pushNow(userId)
    return 'pushed'
  }

  // Otherwise apply remote to store
  _isPulling = true
  try {
    useStore.setState({
      profile:            remote.profile            ?? useStore.getState().profile,
      habits:             remote.habits             ?? [],
      missions:           remote.missions           ?? [],
      weightLog:          remote.weightLog          ?? [],
      transactions:       remote.transactions       ?? [],
      bibleReadings:      remote.bibleReadings      ?? [],
      activePlanId:       (remote.activePlanId && getBiblePlan(remote.activePlanId)) ? remote.activePlanId : 'biblia-1-ano',
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
  } finally {
    // Always unset, even on error
    setTimeout(() => { _isPulling = false }, 100)
  }

  return 'pulled'
}

// ── auto-sync ─────────────────────────────────────────────────────────

export function startAutoSync(userId: string) {
  if (_unsubscribe) {
    if (_currentUserId === userId) return
    _unsubscribe()
    _unsubscribe = null
  }

  _currentUserId = userId
  _unsubscribe = useStore.subscribe(() => {
    schedulePush()
  })
}

export function stopAutoSync() {
  _currentUserId = null
  if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null }
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null }
}

// Force an immediate push — useful before logout or critical actions
export async function flushSync(): Promise<void> {
  if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null }
  if (_currentUserId) await pushNow(_currentUserId)
}
