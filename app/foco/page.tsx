'use client'

import { useEffect, useRef, useState } from 'react'
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react'

type Mode = 'config' | 'running'

function formatMMSS(totalMs: number) {
  const total = Math.max(0, Math.ceil(totalMs / 1000))
  const mm = Math.floor(total / 60)
  const ss = total % 60
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

export default function FocoPage() {
  const [mode, setMode] = useState<Mode>('config')
  const [minutes, setMinutes] = useState<number>(25)
  const [endAt, setEndAt] = useState<number | null>(null)
  const [pausedRemaining, setPausedRemaining] = useState<number | null>(null)
  const [now, setNow] = useState<number>(() => Date.now())
  const rafRef = useRef<number | null>(null)

  // Tick driven by Date.now() to avoid drift; updated ~once per second.
  useEffect(() => {
    if (mode !== 'running' || endAt === null || pausedRemaining !== null) return
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      setNow(Date.now())
      rafRef.current = window.setTimeout(tick, 250) as unknown as number
    }
    tick()
    return () => {
      cancelled = true
      if (rafRef.current !== null) {
        clearTimeout(rafRef.current)
        rafRef.current = null
      }
    }
  }, [mode, endAt, pausedRemaining])

  const remaining = pausedRemaining !== null
    ? pausedRemaining
    : endAt !== null
      ? Math.max(0, endAt - now)
      : minutes * 60_000

  const finished = mode === 'running' && remaining <= 0

  function startSession() {
    const m = Math.max(1, Math.min(180, Math.floor(minutes || 0)))
    setMinutes(m)
    setEndAt(Date.now() + m * 60_000)
    setPausedRemaining(null)
    setMode('running')
  }

  function pauseSession() {
    if (endAt === null) return
    setPausedRemaining(Math.max(0, endAt - Date.now()))
    setEndAt(null)
  }

  function resumeSession() {
    if (pausedRemaining === null) return
    setEndAt(Date.now() + pausedRemaining)
    setPausedRemaining(null)
  }

  function exitSession() {
    setMode('config')
    setEndAt(null)
    setPausedRemaining(null)
  }

  function resetSession() {
    setEndAt(Date.now() + minutes * 60_000)
    setPausedRemaining(null)
  }

  // ── CONFIG ───────────────────────────────────────────────────
  if (mode === 'config') {
    const presets = [15, 25, 45, 60]
    return (
      <div
        className="p-4 md:p-6 max-w-[640px] mx-auto"
        style={{ animation: 'fadeIn 0.4s ease both' }}
      >
        <div className="mb-8 mt-4">
          <div
            className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1.2px] mb-1"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            <Timer size={11} /> Foco · Pomodoro
          </div>
          <h1
            className="text-[28px] font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-main)' }}
          >
            Sessão de Foco
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Defina o tempo, entre em fullscreen e elimine distrações.
          </p>
        </div>

        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <label
            className="block text-[12px] font-medium uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Tempo de foco (minutos)
          </label>

          <div className="flex items-center gap-3 mb-5">
            <input
              type="number"
              min={1}
              max={180}
              value={Number.isFinite(minutes) ? minutes : ''}
              onChange={e => {
                const v = parseInt(e.target.value, 10)
                setMinutes(Number.isNaN(v) ? 0 : v)
              }}
              className="flex-1 outline-none"
              style={{
                fontSize: 48,
                fontWeight: 800,
                fontFamily: 'var(--font-jetbrains)',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                textShadow: '0 0 24px rgba(34,197,94,0.4)',
                width: '100%',
              }}
            />
            <span
              style={{
                fontSize: 14,
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-jetbrains)',
              }}
            >
              min
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-7">
            {presets.map(p => {
              const sel = minutes === p
              return (
                <button
                  key={p}
                  onClick={() => setMinutes(p)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: sel ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${sel ? 'var(--color-primary)' : 'rgba(255,255,255,0.09)'}`,
                    color: sel ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {p} min
                </button>
              )
            })}
          </div>

          <button
            onClick={startSession}
            disabled={!minutes || minutes < 1}
            className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'var(--color-primary)',
              color: '#000',
              opacity: !minutes || minutes < 1 ? 0.4 : 1,
              cursor: !minutes || minutes < 1 ? 'not-allowed' : 'pointer',
              boxShadow: !minutes || minutes < 1 ? 'none' : '0 0 24px rgba(34,197,94,0.35)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <Play size={15} fill="currentColor" /> Focar
          </button>
        </div>
      </div>
    )
  }

  // ── RUNNING (fullscreen, sem distrações) ─────────────────────
  const paused = pausedRemaining !== null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        animation: 'fadeIn 0.3s ease both',
      }}
    >
      {/* Topo: rótulo FOCO */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.5em',
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
        }}
      >
        Foco
      </div>

      {/* Botão sair (canto superior direito) */}
      <button
        onClick={exitSession}
        aria-label="Sair"
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 36,
          height: 36,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={16} />
      </button>

      {/* Tempo grande no centro */}
      <div
        style={{
          fontFamily: 'var(--font-jetbrains)',
          fontSize: 'clamp(96px, 22vw, 240px)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: finished ? 'var(--color-primary)' : '#ffffff',
          textShadow: finished
            ? '0 0 60px rgba(34,197,94,0.5)'
            : '0 0 40px rgba(255,255,255,0.08)',
          fontVariantNumeric: 'tabular-nums',
          transition: 'color 0.4s, text-shadow 0.4s',
        }}
      >
        {formatMMSS(remaining)}
      </div>

      {/* Estado / dica */}
      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          letterSpacing: '0.3em',
          color: paused
            ? 'rgba(234,179,8,0.7)'
            : finished
              ? 'var(--color-primary)'
              : 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {finished ? 'Sessão concluída' : paused ? 'Pausado' : 'Em foco'}
      </div>

      {/* Controles inferiores */}
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
        }}
      >
        {!finished && (
          <button
            onClick={paused ? resumeSession : pauseSession}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 22px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {paused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
            {paused ? 'Retomar' : 'Pausar'}
          </button>
        )}
        <button
          onClick={resetSession}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 22px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} /> Reiniciar
        </button>
        {finished && (
          <button
            onClick={exitSession}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 999,
              background: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              color: '#000',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(34,197,94,0.35)',
            }}
          >
            Concluir
          </button>
        )}
      </div>
    </div>
  )
}
