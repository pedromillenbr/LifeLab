// ════════════════════════════════════════════════════════════════════
//  LifeLab — Community API wrappers
//  Thin layer over Supabase REST. All public reads bypass RLS via
//  the anon key; writes go through SECURITY DEFINER RPCs.
// ════════════════════════════════════════════════════════════════════

import { restFetch, getLocalSession } from '@/lib/auth'
import type { DivisionKey } from './divisions'

// ── Types ────────────────────────────────────────────────────────────

export interface PublicProfile {
  id:                string
  display_name:      string
  avatar_seed:       string
  total_xp:          number
  monthly_xp:        number
  streak:            number
  best_streak:       number
  last_active_at:    string | null
  prev_position:     number | null
  prev_position_at:  string | null
  created_at:        string
  updated_at:        string
}

export interface RankingRow {
  id:           string
  display_name: string
  avatar_seed:  string
  total_xp?:    number
  xp?:          number       // monthly_xp returns as `xp` from the view
  streak:       number
  division_key: DivisionKey
  position:     number
  movement?:    number       // global view only
}

export interface SeasonRow {
  id:         number
  label:      string
  started_at: string
  ended_at:   string | null
}

export interface SeasonHistoryRow {
  id:              number
  user_id:         string
  season_id:       number
  final_xp:        number
  final_position:  number
  division_key:    DivisionKey
  ended_at:        string
  acknowledged_at: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function publicFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const session = getLocalSession()
  const headers: Record<string, string> = {
    'apikey': SUPABASE_KEY,
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  } else {
    headers['Authorization'] = `Bearer ${SUPABASE_KEY}`
  }
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, { ...opts, headers })
}

// ── Profile ─────────────────────────────────────────────────────────

export async function fetchMyPublicProfile(userId: string): Promise<PublicProfile | null> {
  const res = await publicFetch(
    `/profiles_public?id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
  )
  if (!res.ok) return null
  const rows = (await res.json().catch(() => [])) as PublicProfile[]
  return rows[0] ?? null
}

export async function checkDisplayNameAvailable(name: string, selfId: string): Promise<boolean> {
  const trimmed = name.trim()
  if (!trimmed) return false
  const res = await publicFetch(
    `/profiles_public?display_name=ilike.${encodeURIComponent(trimmed)}&select=id&limit=1`,
  )
  if (!res.ok) return false
  const rows = (await res.json().catch(() => [])) as { id: string }[]
  if (rows.length === 0) return true
  return rows[0].id === selfId
}

export async function claimDisplayName(name: string, avatarSeed = ''): Promise<{ ok: true; profile: PublicProfile } | { ok: false; error: string }> {
  try {
    const res = await restFetch('/rpc/claim_display_name', {
      method: 'POST',
      body: JSON.stringify({ p_name: name, p_avatar_seed: avatarSeed }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const code = (() => {
        try { return (JSON.parse(text) as { message?: string }).message ?? text } catch { return text }
      })()
      return { ok: false, error: code || 'erro desconhecido' }
    }
    const profile = await res.json() as PublicProfile
    return { ok: true, profile }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network' }
  }
}

export async function awardXP(amount: number, source: string, streak?: number): Promise<PublicProfile | null> {
  if (amount <= 0) return null
  try {
    const res = await restFetch('/rpc/award_xp', {
      method: 'POST',
      body: JSON.stringify({
        p_amount: amount,
        p_source: source,
        p_streak: streak ?? null,
      }),
    })
    if (!res.ok) return null
    return await res.json() as PublicProfile
  } catch {
    return null
  }
}

export async function syncStreak(streak: number): Promise<void> {
  try {
    await restFetch('/rpc/sync_streak', {
      method: 'POST',
      body: JSON.stringify({ p_streak: streak }),
    })
  } catch { /* non-fatal */ }
}

// ── Ranking ─────────────────────────────────────────────────────────

export async function fetchRankingMonthly(limit = 100, offset = 0): Promise<RankingRow[]> {
  const res = await publicFetch(
    `/ranking_monthly?select=*&order=position.asc&limit=${limit}&offset=${offset}`,
  )
  if (!res.ok) return []
  return (await res.json().catch(() => [])) as RankingRow[]
}

export async function fetchRankingGlobal(limit = 100, offset = 0): Promise<RankingRow[]> {
  const res = await publicFetch(
    `/ranking_global?select=*&order=position.asc&limit=${limit}&offset=${offset}`,
  )
  if (!res.ok) return []
  return (await res.json().catch(() => [])) as RankingRow[]
}

export async function fetchTopByStreak(limit = 10): Promise<PublicProfile[]> {
  const res = await publicFetch(
    `/profiles_public?select=*&order=streak.desc&limit=${limit}`,
  )
  if (!res.ok) return []
  return (await res.json().catch(() => [])) as PublicProfile[]
}

export async function fetchTopByBestStreak(limit = 10): Promise<PublicProfile[]> {
  const res = await publicFetch(
    `/profiles_public?select=*&order=best_streak.desc&limit=${limit}`,
  )
  if (!res.ok) return []
  return (await res.json().catch(() => [])) as PublicProfile[]
}

// ── Season ──────────────────────────────────────────────────────────

export async function fetchCurrentSeason(): Promise<SeasonRow | null> {
  const res = await publicFetch('/seasons?ended_at=is.null&select=*&limit=1')
  if (!res.ok) return null
  const rows = (await res.json().catch(() => [])) as SeasonRow[]
  return rows[0] ?? null
}

export async function fetchUnacknowledgedSeasonHistory(userId: string): Promise<SeasonHistoryRow | null> {
  const res = await publicFetch(
    `/season_history?user_id=eq.${encodeURIComponent(userId)}&acknowledged_at=is.null&select=*&order=ended_at.desc&limit=1`,
  )
  if (!res.ok) return null
  const rows = (await res.json().catch(() => [])) as SeasonHistoryRow[]
  return rows[0] ?? null
}

export async function acknowledgeSeasonHistory(historyId: number): Promise<void> {
  try {
    await restFetch(`/season_history?id=eq.${historyId}`, {
      method: 'PATCH',
      body: JSON.stringify({ acknowledged_at: new Date().toISOString() }),
    })
  } catch { /* non-fatal */ }
}

export async function fetchSeasonChampions(limit = 12): Promise<Array<SeasonHistoryRow & { display_name: string; avatar_seed: string; season_label: string }>> {
  // PostgREST embed: pull joined display_name + season label
  const res = await publicFetch(
    `/season_history?final_position=eq.1&select=*,profile:profiles_public!season_history_user_id_fkey(display_name,avatar_seed),season:seasons(label)&order=ended_at.desc&limit=${limit}`,
  )
  if (!res.ok) return []
  const rows = (await res.json().catch(() => [])) as Array<SeasonHistoryRow & {
    profile: { display_name: string; avatar_seed: string } | null
    season:  { label: string } | null
  }>
  return rows.map(r => ({
    ...r,
    display_name: r.profile?.display_name ?? '—',
    avatar_seed:  r.profile?.avatar_seed  ?? '',
    season_label: r.season?.label         ?? '',
  }))
}

// ── Helpers used by UI to derive nearby milestones ──────────────────

export function nextMilestone(position: number): { label: string; target: number } | null {
  if (position > 50) return { label: 'Top 50', target: 50 }
  if (position > 10) return { label: 'Top 10', target: 10 }
  if (position > 3)  return { label: 'Top 3',  target: 3 }
  if (position > 1)  return { label: 'Topo',   target: 1 }
  return null
}
