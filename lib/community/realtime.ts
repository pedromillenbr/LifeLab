// ════════════════════════════════════════════════════════════════════
//  LifeLab — Realtime ranking subscription
//  Hybrid: Supabase Realtime (websockets) + 30s polling fallback.
// ════════════════════════════════════════════════════════════════════

import { supabase } from '@/lib/supabase'

export type RankingMode = 'monthly' | 'global'

interface SubscribeOptions {
  /** Called whenever the ranking should be refetched. */
  onChange: () => void
  /** Polling interval as fallback (ms). 0 = no polling. */
  pollMs?:  number
}

// Default lighter polling: 60s. Realtime subscription does the heavy
// lifting when available; the poll is just a safety net.

/**
 * Subscribes to changes on profiles_public via Supabase Realtime.
 * Always returns a cleanup function. If realtime isn't available
 * (e.g. publication missing), the polling fallback alone keeps the
 * UI fresh.
 */
export function subscribeRanking(opts: SubscribeOptions): () => void {
  const { onChange, pollMs = 60_000 } = opts

  let disposed = false
  let scheduled: ReturnType<typeof setTimeout> | null = null

  // Coalesce bursty events into one refetch every 800ms.
  const trigger = () => {
    if (disposed) return
    if (scheduled) return
    scheduled = setTimeout(() => {
      scheduled = null
      if (!disposed) onChange()
    }, 800)
  }

  // ── Realtime channel ────────────────────────────────────────────
  let channel: ReturnType<typeof supabase.channel> | null = null
  try {
    channel = supabase.channel('ranking-profiles_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles_public' },
        () => trigger(),
      )
      .subscribe()
  } catch {
    channel = null
  }

  // ── Polling fallback ────────────────────────────────────────────
  // Skip the tick entirely when the tab is hidden to save bandwidth
  // and CPU. Visibility events below will refetch on resume.
  let pollTimer: ReturnType<typeof setInterval> | null = null
  if (pollMs > 0) {
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') trigger()
    }, pollMs)
  }

  // ── Refetch on tab visibility / focus ──────────────────────────
  const onVisible = () => {
    if (document.visibilityState === 'visible') trigger()
  }
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('focus', trigger)

  return () => {
    disposed = true
    if (scheduled) clearTimeout(scheduled)
    if (pollTimer) clearInterval(pollTimer)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('focus', trigger)
    if (channel) {
      try { supabase.removeChannel(channel) } catch { /* ignore */ }
    }
  }
}
