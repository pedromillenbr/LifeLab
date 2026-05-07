'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, ensureValidSession } from '@/lib/auth'

// ── Design tokens ────────────────────────────────────────────────────
const P      = 'var(--color-primary)'
const PM     = 'var(--color-primary-muted)'
const PB     = 'var(--color-primary-border)'
const BORDER = 'var(--color-border)'
const TT     = 'var(--color-text-muted)'

// ── Particles (decorative, CSS-only) ─────────────────────────────────
const PARTICLE_COUNT = 28

function Particles() {
  const items = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${1 + Math.random() * 2.5}px`,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 14}s`,
    opacity: 0.15 + Math.random() * 0.35,
  }))

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-10px',
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            opacity: p.opacity,
            animation: `ll-fall ${p.duration} ${p.delay} linear infinite`,
            boxShadow: `0 0 ${parseFloat(p.size) * 3}px var(--color-primary-glow)`,
          }}
        />
      ))}
      <style>{`
        @keyframes ll-fall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 0;   }
          5%   { opacity: 1; }
          95%  { opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
//  AUTH PAGE
// ════════════════════════════════════════════════════════════════════
export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode]   = useState<'login' | 'register'>('login')
  const [name, setName]   = useState('')
  const [pass, setPass]   = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)
  const [ready, setReady] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // If a valid session already exists locally → go straight to the app.
  useEffect(() => {
    let cancelled = false
    ensureValidSession().then((session) => {
      if (cancelled) return
      if (session) router.replace('/')
      else setReady(true)
    }).catch(() => {
      if (!cancelled) setReady(true)
    })
    return () => { cancelled = true }
  }, [router])

  // Focus the username input when the form is ready or the mode changes.
  useEffect(() => {
    if (ready) setTimeout(() => inputRef.current?.focus(), 60)
  }, [mode, ready])

  function switchMode(next: 'login' | 'register') {
    if (busy) return
    setMode(next)
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    const u = name.trim()
    const p = pass

    setError('')

    if (!u || !p) {
      setError('Preencha todos os campos')
      return
    }
    if (p.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres')
      return
    }

    setBusy(true)

    const result = mode === 'login'
      ? await signIn(u, p)
      : await signUp(u, p)

    if (!result.ok) {
      setBusy(false)
      setError(result.error ?? 'Erro desconhecido')
      return
    }

    // signUp/signIn already persisted the session — go to the app.
    router.replace('/')
  }

  // Splash while we check for an existing session — never a black screen.
  if (!ready) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'var(--color-bg-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '2.5px solid var(--color-primary-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'll-auth-spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes ll-auth-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg-1)', position: 'relative' }}
    >
      <Particles />

      <div
        className="relative z-10 w-full max-w-[400px]"
        style={{ animation: 'fadeIn 0.45s var(--ease-out) both' }}
      >
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: PM,
              border: `1px solid ${PB}`,
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
              <path
                d="M5 2.2 V12 H11.4"
                stroke="var(--color-primary)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(17,19,24,0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${BORDER}`,
            boxShadow: 'var(--shadow-modal)',
          }}
        >
          {/* Title */}
          <div className="mb-6 text-center">
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: '-1px',
                lineHeight: 1.1,
                marginBottom: 8,
                color: 'var(--color-primary)',
                animation: 'nameGlow 3s ease-in-out infinite',
              }}
            >
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p style={{ fontSize: 13, color: TT, lineHeight: 1.6 }}>
              {mode === 'login' ? 'Entre para continuar evoluindo' : 'Comece sua jornada agora'}
            </p>
          </div>

          {/* Toggle login / register */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: 'var(--color-bg-3)', border: `1px solid ${BORDER}` }}
          >
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                disabled={busy}
                className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200"
                style={{
                  background: mode === m ? P : 'transparent',
                  color:      mode === m ? '#000' : TT,
                  boxShadow:  mode === m ? '0 0 14px var(--color-primary-glow)' : 'none',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  border: 'none',
                  opacity: busy && mode !== m ? 0.5 : 1,
                }}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="ll-username"
                style={{ fontSize: 11, color: TT, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
              >
                Nome
              </label>
              <input
                id="ll-username"
                ref={inputRef}
                className="input"
                type="text"
                autoComplete="username"
                placeholder="seu_nome"
                value={name}
                onChange={e => { setName(e.target.value); if (error) setError('') }}
                disabled={busy}
                style={{ fontSize: 14 }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            <div>
              <label
                htmlFor="ll-password"
                style={{ fontSize: 11, color: TT, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
              >
                Senha
              </label>
              <input
                id="ll-password"
                className="input"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={pass}
                onChange={e => { setPass(e.target.value); if (error) setError('') }}
                disabled={busy}
                style={{ fontSize: 14 }}
              />
            </div>

            {error && (
              <div
                className="rounded-lg px-3 py-2.5 text-[12px]"
                style={{
                  background: 'var(--error-muted)',
                  border: '1px solid var(--error-border)',
                  color: 'var(--error)',
                  animation: 'fadeIn 0.2s ease both',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 mt-2"
              style={{
                background: busy ? 'rgba(34,197,94,0.35)' : P,
                color: '#000',
                boxShadow: busy
                  ? 'none'
                  : '0 0 18px var(--color-primary-glow), 0 0 40px rgba(var(--color-primary-rgb), 0.20)',
                cursor: busy ? 'not-allowed' : 'pointer',
                border: busy ? `1px solid ${PB}` : '1px solid transparent',
                fontSize: 15,
                letterSpacing: '-0.3px',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
              }}
            >
              {busy ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.85 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'll-spin 0.7s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                </span>
              ) : (
                <span style={{ animation: 'ctaGlow 2.5s ease-in-out infinite' }}>
                  {mode === 'login' ? 'Entrar' : 'Evolua sua vida!'}
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6" style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
          LifeLab · Seu sistema de alta performance
        </p>
      </div>

      <style>{`
        @keyframes ll-spin { to { transform: rotate(360deg); } }
        @keyframes nameGlow {
          0%, 100% { text-shadow: 0 0 18px rgba(var(--color-primary-rgb), 0.35), 0 0 40px rgba(var(--color-primary-rgb), 0.15); }
          50%      { text-shadow: 0 0 28px rgba(var(--color-primary-rgb), 0.65), 0 0 60px rgba(var(--color-primary-rgb), 0.30); }
        }
        @keyframes ctaGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(0,0,0,0.4); }
          50%      { text-shadow: 0 0 14px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.25); }
        }
      `}</style>
    </div>
  )
}
