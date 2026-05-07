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
  const isAuthPage = pathname === '/auth'

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const s = await ensureValidSession().catch(() => null)
      if (cancelled) return

      if (!s) {
        setSession(null)
        if (!isAuthPage) router.replace('/auth')
        return
      }

      // Tell supabase-js about the session — runs in the background.
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

      if (cancelled) return
      setSession(s)
      if (isAuthPage) router.replace('/')
    }

    bootstrap()

    // Subscribe to supabase-js auth events so SIGNED_OUT propagates.
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
      }
    })

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

  if (session === undefined) return <LoadingSplash />
  if (isAuthPage) return <>{children}</>
  if (!session)   return null

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
