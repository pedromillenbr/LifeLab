'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { pullFromSupabase, startAutoSync, stopAutoSync, flushSync } from '@/store/syncService'
import { applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'
import { useStore } from '@/store/useStore'
import type { Session } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
  shell: React.ReactNode
}

// Hard timeout — if Supabase doesn't respond within this window, treat as logged out
const SESSION_TIMEOUT_MS = 4000
// If splash is still visible after this long, auto-recover by clearing storage
const AUTO_RECOVER_MS = 8000

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let settled = false
    const timer = setTimeout(() => {
      if (!settled) { settled = true; resolve(fallback) }
    }, ms)
    promise.then(
      (val) => { if (!settled) { settled = true; clearTimeout(timer); resolve(val) } },
      ()    => { if (!settled) { settled = true; clearTimeout(timer); resolve(fallback) } },
    )
  })
}

export function AuthGuard({ children, shell }: AuthGuardProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  const initializedRef = useRef(false)
  const isAuthPage = pathname === '/auth'

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      // Wrap getSession in a hard timeout so the splash never hangs forever.
      const result = await withTimeout(
        supabase.auth.getSession().catch(() => ({ data: { session: null } })),
        SESSION_TIMEOUT_MS,
        { data: { session: null } },
      )

      if (cancelled) return
      const s = result.data.session

      if (!s) {
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
        return
      }

      if (!initializedRef.current) {
        initializedRef.current = true

        // 1. Hydrate localStorage → Zustand FIRST so sync compares against
        //    real local data, not empty defaults.
        try {
          const r = useStore.persist.rehydrate()
          if (r instanceof Promise) await r
        } catch (err) {
          console.error('[auth] rehydrate failed:', err)
        }

        // 2. Pull from Supabase (which will compare local vs remote and
        //    keep whichever has more data).
        try {
          await pullFromSupabase(s.user.id)
        } catch (err) {
          console.error('[auth] pull failed:', err)
        }

        try {
          const state = useStore.getState()
          applyTheme(state.profile.primaryColor || DEFAULT_THEME_KEY)
        } catch (err) {
          console.error('[auth] applyTheme failed:', err)
        }
        try {
          startAutoSync(s.user.id)
        } catch (err) {
          console.error('[auth] startAutoSync failed:', err)
        }
      }

      if (cancelled) return
      setSession(s)
      if (isAuthPage) router.replace('/')
    }

    bootstrap().catch((err) => {
      console.error('[auth] bootstrap fatal error:', err)
      if (!cancelled) {
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (cancelled) return
      if (event === 'INITIAL_SESSION') return

      if (event === 'SIGNED_OUT' || !s) {
        initializedRef.current = false
        stopAutoSync()
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
        return
      }

      if (event === 'SIGNED_IN') {
        if (!initializedRef.current) {
          initializedRef.current = true
          try {
            const r = useStore.persist.rehydrate()
            if (r instanceof Promise) await r
          } catch (err) { console.error('[auth] rehydrate failed:', err) }
          try { await pullFromSupabase(s.user.id) } catch (err) { console.error('[auth] pull failed:', err) }
          try {
            const state = useStore.getState()
            applyTheme(state.profile.primaryColor || DEFAULT_THEME_KEY)
          } catch (err) { console.error('[auth] applyTheme failed:', err) }
          try { startAutoSync(s.user.id) } catch (err) { console.error('[auth] startAutoSync failed:', err) }
        }
        setSession(s)
        if (isAuthPage) router.replace('/')
        return
      }

      if (event === 'TOKEN_REFRESHED') {
        setSession(s)
        try { startAutoSync(s.user.id) } catch (err) { console.error('[auth] startAutoSync failed:', err) }
        return
      }
    })

    // Flush pending sync before page unload (closing tab, navigating away)
    const handleBeforeUnload = () => { flushSync() }
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Loading splash with automatic self-recovery
  if (session === undefined) {
    return <LoadingSplash />
  }

  if (isAuthPage)  return <>{children}</>
  if (!session)    return null

  return <>{shell}{children}</>
}

// ──────────────────────────────────────────────────────────────────────
//  LoadingSplash — auto-recovers if the bootstrap takes too long.
//  After AUTO_RECOVER_MS, silently wipes auth tokens and reloads.
// ──────────────────────────────────────────────────────────────────────
function LoadingSplash() {
  useEffect(() => {
    // Track recovery attempts in sessionStorage so we don't loop forever
    const RECOVERY_KEY = 'lifelab-recovery-attempts'
    const attempts = parseInt(sessionStorage.getItem(RECOVERY_KEY) || '0', 10)

    // After 2 failed auto-recoveries, give up and just send to /auth
    if (attempts >= 2) {
      sessionStorage.removeItem(RECOVERY_KEY)
      const timer = setTimeout(() => {
        location.href = '/auth'
      }, AUTO_RECOVER_MS)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      try {
        // Clear only auth-related keys to avoid losing sync data
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('sb-') || key === 'lifelab-auth')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
        sessionStorage.setItem(RECOVERY_KEY, String(attempts + 1))
      } catch {
        /* ignore storage errors */
      }
      location.reload()
    }, AUTO_RECOVER_MS)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--color-bg-1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        width: 36, height: 36,
        border: '2.5px solid var(--color-primary-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'll-guard-spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes ll-guard-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Clear the recovery counter once we successfully reach the app
if (typeof window !== 'undefined') {
  // After hydration with a real session, the counter resets naturally on next visit
  setTimeout(() => {
    try { sessionStorage.removeItem('lifelab-recovery-attempts') } catch { /* ignore */ }
  }, 10000)
}
