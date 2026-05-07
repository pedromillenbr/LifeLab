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

export function AuthGuard({ children, shell }: AuthGuardProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<StoredSession | null | undefined>(undefined)

  const initializedRef = useRef(false)
  const bootstrapRunningRef = useRef(false)
  const isAuthPage = pathname === '/auth'

  // Bootstrap runs:
  //   1) On mount
  //   2) Whenever pathname changes (e.g. /auth → / after a successful signIn/signUp)
  //
  // The trick is step 2: when AuthPage calls router.replace('/'), this
  // component re-renders with the new pathname. Without this re-run, session
  // would still be `null` from the initial mount and we'd render `null` →
  // black screen. Re-running ensureValidSession() picks up the session that
  // signIn/signUp just persisted.
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (bootstrapRunningRef.current) return
      bootstrapRunningRef.current = true

      let s: StoredSession | null = null
      try {
        s = await ensureValidSession()
      } catch {
        s = null
      }

      if (cancelled) {
        bootstrapRunningRef.current = false
        return
      }

      if (!s) {
        setSession(null)
        bootstrapRunningRef.current = false
        if (!isAuthPage) router.replace('/auth')
        return
      }

      // Tell supabase-js about the session — runs in the background, never
      // blocks render.
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
          } catch { /* non-fatal */ }
        }

        // 3. Pull from Supabase.
        await pullFromSupabase(s.user.id).catch(() => {})

        try {
          applyTheme(useStore.getState().profile.primaryColor || DEFAULT_THEME_KEY)
        } catch { /* non-fatal */ }

        try { startAutoSync(s.user.id) } catch { /* non-fatal */ }
      }

      if (cancelled) {
        bootstrapRunningRef.current = false
        return
      }
      setSession(s)
      bootstrapRunningRef.current = false
      if (isAuthPage) router.replace('/')
    }

    bootstrap()

    return () => { cancelled = true }
  }, [pathname, router, isAuthPage])

  // One-time setup: auth event subscription + unload flush.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sb) => {
      if (event === 'INITIAL_SESSION') return

      if (event === 'SIGNED_OUT' || !sb) {
        initializedRef.current = false
        stopAutoSync()
        clearLastUser()
        try { localStorage.removeItem('lifelab-storage') } catch { /* ignore */ }
        setSession(null)
        router.replace('/auth')
      }
    })

    const handleBeforeUnload = () => { flushSync() }
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (session === undefined) return <LoadingSplash />
  if (isAuthPage) return <>{children}</>
  if (!session)   return <LoadingSplash />

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
