'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ensureValidSession, warmSupabaseClient, type StoredSession } from '@/lib/auth'
import {
  pullFromSupabase,
  startAutoSync,
  stopAutoSync,
  flushSync,
  ensureUserMatch,
  clearLastUser,
} from '@/store/syncService'
import { applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'
import { useStore } from '@/store/useStore'

interface AuthGuardProps {
  children: React.ReactNode
  shell: React.ReactNode
}

// If the bootstrap doesn't finish in time we still show the auth page so the
// app never hangs on a black/loading screen.
const BOOTSTRAP_TIMEOUT_MS = 5000

export function AuthGuard({ children, shell }: AuthGuardProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<StoredSession | null | undefined>(undefined)

  const initializedRef = useRef(false)
  const isAuthPage = pathname === '/auth'

  useEffect(() => {
    let cancelled = false

    // Hard ceiling — if bootstrap takes longer than this, drop to /auth.
    const failsafe = setTimeout(() => {
      if (cancelled) return
      if (session === undefined) {
        console.warn('[auth] bootstrap timeout — falling back to /auth')
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
      }
    }, BOOTSTRAP_TIMEOUT_MS)

    async function bootstrap() {
      let s: StoredSession | null = null
      try {
        s = await ensureValidSession()
      } catch (err) {
        console.error('[auth] ensureValidSession failed:', err)
      }

      if (cancelled) return

      if (!s) {
        clearTimeout(failsafe)
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
        return
      }

      // Tell supabase-js about the session in the background — best effort,
      // never blocks the redirect.
      warmSupabaseClient(s).catch(() => {})

      if (!initializedRef.current) {
        initializedRef.current = true

        // 1. Wipe local data if a different user logged in on this device.
        const sameUser = ensureUserMatch(s.user.id)

        // 2. Hydrate localStorage → Zustand if same user.
        if (sameUser) {
          try {
            const r = useStore.persist.rehydrate()
            if (r instanceof Promise) await r
          } catch (err) {
            console.error('[auth] rehydrate failed:', err)
          }
        }

        // 3. Pull from Supabase (REST direct).
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
      clearTimeout(failsafe)
      setSession(s)
      if (isAuthPage) router.replace('/')
    }

    bootstrap().catch((err) => {
      console.error('[auth] bootstrap fatal error:', err)
      if (!cancelled) {
        clearTimeout(failsafe)
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
      }
    })

    // We still subscribe to supabase-js auth events so SIGNED_OUT from the
    // sidebar (or token refresh) is reflected in the UI. Anything that comes
    // through here is a nice-to-have; the source of truth is localStorage.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sb) => {
      if (cancelled) return
      if (event === 'INITIAL_SESSION') return

      if (event === 'SIGNED_OUT' || !sb) {
        initializedRef.current = false
        stopAutoSync()
        clearLastUser()
        try { localStorage.removeItem('lifelab-storage') } catch { /* ignore */ }
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
        return
      }
    })

    // Flush pending sync before page unload
    const handleBeforeUnload = () => { flushSync() }
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      cancelled = true
      clearTimeout(failsafe)
      subscription.unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (session === undefined) {
    return <LoadingSplash />
  }

  if (isAuthPage)  return <>{children}</>
  if (!session)    return null

  return <>{shell}{children}</>
}

function LoadingSplash() {
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
