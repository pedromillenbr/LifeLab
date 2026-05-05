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

// Hard timeout — if Supabase doesn't respond within this window, treat as logged out
const SESSION_TIMEOUT_MS = 5000

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
        try {
          await pullFromSupabase(s.user.id)
        } catch (err) {
          console.error('[auth] pull failed:', err)
          // Don't block UI on sync failures — proceed with local data
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

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Loading splash
  if (session === undefined) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'var(--color-bg-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        zIndex: 9999,
      }}>
        <div style={{
          width: 36, height: 36,
          border: '2.5px solid var(--color-primary-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'll-guard-spin 0.7s linear infinite',
        }} />
        <button
          onClick={() => {
            try {
              localStorage.clear()
              sessionStorage.clear()
            } catch { /* ignore */ }
            location.reload()
          }}
          style={{
            background: 'transparent',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            cursor: 'pointer',
            opacity: 0.5,
          }}
        >
          Carregando há muito tempo? Limpar cache
        </button>
        <style>{`@keyframes ll-guard-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (isAuthPage)  return <>{children}</>
  if (!session)    return null

  return <>{shell}{children}</>
}
