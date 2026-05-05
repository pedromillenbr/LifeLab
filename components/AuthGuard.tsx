'use client'

import { useEffect, useState, useCallback } from 'react'
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

  const isAuthPage = pathname === '/auth'

  const handleSession = useCallback(async (s: Session | null, isNew = false) => {
    setSession(s)

    if (!s) {
      // Logged out — stop syncing
      stopAutoSync()
      if (!isAuthPage) router.replace('/auth')
      return
    }

    if (isAuthPage) {
      router.replace('/')
    }

    // Pull remote data → merge into Zustand (always on session start)
    if (isNew) {
      await pullFromSupabase(s.user.id)
      // Re-apply theme after remote data loaded (may differ from local)
      const state = useStore.getState()
      applyTheme(state.profile.primaryColor || DEFAULT_THEME_KEY)
    }

    // Start auto-push watcher
    startAutoSync(s.user.id)
  }, [router, isAuthPage])

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session, true)
    })

    // Real-time auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      // SIGNED_IN = fresh login; TOKEN_REFRESHED = silent refresh (no re-pull needed)
      const isNewLogin = event === 'SIGNED_IN'
      handleSession(s, isNewLogin)
    })

    return () => subscription.unsubscribe()
  }, [handleSession])

  // Loading splash — short, no content flash
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
