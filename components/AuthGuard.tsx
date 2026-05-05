'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { pullFromSupabase, startAutoSync, stopAutoSync } from '@/store/syncService'
import { applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'
import { useStore } from '@/store/useStore'
import type { Session } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
  shell: React.ReactNode
}

export function AuthGuard({ children, shell }: AuthGuardProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  // Prevent double-initialisation: getSession fires first, then onAuthStateChange
  // fires INITIAL_SESSION immediately after. We only want one pull per session start.
  const initializedRef = useRef(false)

  const isAuthPage = pathname === '/auth'

  useEffect(() => {
    // ── 1. Get current session synchronously ──────────────────────────
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session

      if (!s) {
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
        return
      }

      // First valid session: hydrate localStorage FIRST, then pull remote
      if (!initializedRef.current) {
        initializedRef.current = true

        // Hydrate localStorage → Zustand before comparing with Supabase
        const rehydrateResult = useStore.persist.rehydrate()
        if (rehydrateResult instanceof Promise) await rehydrateResult

        await pullFromSupabase(s.user.id)
        const state = useStore.getState()
        applyTheme(state.profile.primaryColor || DEFAULT_THEME_KEY)
        startAutoSync(s.user.id)
      }

      setSession(s)
      if (isAuthPage) router.replace('/')
    })

    // ── 2. Listen for auth state changes (login / logout / refresh) ───
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === 'INITIAL_SESSION') {
        // Already handled by getSession above — skip to avoid double pull
        return
      }

      if (event === 'SIGNED_OUT' || !s) {
        initializedRef.current = false
        stopAutoSync()
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
        return
      }

      if (event === 'SIGNED_IN') {
        // Fresh login (not token refresh) — hydrate localStorage then pull remote
        if (!initializedRef.current) {
          initializedRef.current = true

          const rehydrateResult = useStore.persist.rehydrate()
          if (rehydrateResult instanceof Promise) await rehydrateResult

          await pullFromSupabase(s.user.id)
          const state = useStore.getState()
          applyTheme(state.profile.primaryColor || DEFAULT_THEME_KEY)
          startAutoSync(s.user.id)
        }
        setSession(s)
        if (isAuthPage) router.replace('/')
        return
      }

      if (event === 'TOKEN_REFRESHED') {
        // Silent token refresh — just update session, no re-pull needed
        setSession(s)
        // Ensure auto-sync is still running (e.g. after page reload)
        startAutoSync(s.user.id)
        return
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Loading splash
  if (session === undefined) {
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

  if (isAuthPage)  return <>{children}</>
  if (!session)    return null

  return <>{shell}{children}</>
}
