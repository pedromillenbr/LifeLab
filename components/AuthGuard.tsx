'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
  /** Layout UI (Sidebar, MobileNav, main wrapper) shown only when authenticated */
  shell: React.ReactNode
}

export function AuthGuard({ children, shell }: AuthGuardProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  const isAuthPage = pathname === '/auth'

  const handleSession = useCallback((s: Session | null) => {
    setSession(s)
    if (!s && !isAuthPage) {
      router.replace('/auth')
    }
    if (s && isAuthPage) {
      router.replace('/')
    }
  }, [router, isAuthPage])

  useEffect(() => {
    // Lê sessão atual
    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session)
    })

    // Escuta mudanças (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      handleSession(s)
    })

    return () => subscription.unsubscribe()
  }, [handleSession])

  // Carregando — tela em branco curta, sem flash de conteúdo
  if (session === undefined) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'var(--color-bg-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <div style={{
          width: 36, height: 36,
          border: '2.5px solid var(--color-primary-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'll-guard-spin 0.7s linear infinite',
        }} />
        <style>{`
          @keyframes ll-guard-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  // Página de auth — renderiza sem shell (sem sidebar)
  if (isAuthPage) {
    return <>{children}</>
  }

  // Não autenticado em rota protegida — não renderiza nada (redirect em curso)
  if (!session) return null

  // Autenticado — renderiza shell + página
  return <>{shell}{children}</>
}
