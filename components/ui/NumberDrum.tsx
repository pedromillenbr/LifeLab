'use client'
import { useRef, useState, useEffect } from 'react'

interface Props {
  value: number
  onChange: (v: number) => void
  values: number[]
  label?: string
  color?: string
  unit?: string
}

export function NumberDrum({ value, onChange, values, label, color = 'var(--color-primary)', unit }: Props) {
  const idx = Math.max(0, values.findIndex(v => v === Math.round(value)))
  const idxRef = useRef(idx)
  idxRef.current = idx

  const holdRef = useRef<number | null>(null)
  const dragRef = useRef<{ startX: number; startIdx: number; moved: boolean } | null>(null)
  const popKeyRef = useRef(0)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function moveTo(newIdx: number) {
    const clamped = Math.max(0, Math.min(values.length - 1, newIdx))
    if (values[clamped] !== value) {
      popKeyRef.current++
      onChange(values[clamped])
    }
  }

  function startHold(dir: 1 | -1) {
    moveTo(idxRef.current + dir)
    holdRef.current = window.setTimeout(function loop() {
      moveTo(idxRef.current + dir)
      holdRef.current = window.setTimeout(loop, 60)
    }, 320)
  }
  function endHold() {
    if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null }
  }
  useEffect(() => () => endHold(), [])

  function handlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('button, input')) return
    dragRef.current = { startX: e.clientX, startIdx: idx, moved: false }
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const delta = dragRef.current.startX - e.clientX
    if (Math.abs(delta) > 6) dragRef.current.moved = true
    const steps = Math.round(delta / 26)
    if (steps !== 0) moveTo(dragRef.current.startIdx + steps)
  }
  function handlePointerUp() { dragRef.current = null }

  function commitDraft() {
    const n = parseInt(draft, 10)
    if (!isNaN(n)) {
      const clamped = Math.max(values[0], Math.min(values[values.length - 1], n))
      onChange(clamped)
    }
    setEditing(false)
    setDraft('')
  }

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const atMin = idx === 0
  const atMax = idx === values.length - 1

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8,
        padding: '10px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, ${color}10 0%, transparent 70%)`,
          pointerEvents: 'none', opacity: 0.8,
        }}
      />

      {label && (
        <p style={{
          fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono',monospace",
          textAlign: 'center', position: 'relative', zIndex: 1,
        }}>{label}</p>
      )}

      {/* Single value row — no scroll capture, click to type */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          if (dragRef.current?.moved) return
          if (!editing && !(e.target as HTMLElement).closest('button')) {
            setDraft(String(values[idx]))
            setEditing(true)
          }
        }}
        style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'center',
          height: 48, position: 'relative', zIndex: 1,
          cursor: editing ? 'text' : 'ew-resize',
          touchAction: 'pan-y', userSelect: 'none',
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={e => {
              if (e.key === 'Enter') commitDraft()
              if (e.key === 'Escape') { setEditing(false); setDraft('') }
            }}
            style={{
              width: 88, height: 42,
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
              color, background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${color}55`,
              borderRadius: 8, textAlign: 'center', outline: 'none',
              MozAppearance: 'textfield' as any,
            }}
          />
        ) : (
          <span
            key={popKeyRef.current}
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em',
              color, textShadow: `0 0 16px ${color}90, 0 0 32px ${color}30`,
              lineHeight: 1,
              display: 'inline-flex', alignItems: 'baseline', gap: 3,
              animation: 'numTick 200ms cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            {values[idx]}
            {unit && (
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: `${color}b8`, fontFamily: 'Inter, sans-serif',
                textShadow: 'none', letterSpacing: 0,
              }}>{unit}</span>
            )}
          </span>
        )}
      </div>

      {/* ± buttons */}
      <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
        <button
          onPointerDown={(e) => { e.preventDefault(); startHold(-1) }}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
          disabled={atMin}
          aria-label="Diminuir"
          className="num-btn"
          style={{
            flex: 1, height: 34, borderRadius: 10,
            background: atMin ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${atMin ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.09)'}`,
            color: atMin ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)',
            fontSize: 18, fontWeight: 700,
            cursor: atMin ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 120ms, border-color 120ms, color 120ms, transform 80ms',
            userSelect: 'none', touchAction: 'manipulation',
            ['--c' as any]: color,
          }}
        >−</button>
        <button
          onPointerDown={(e) => { e.preventDefault(); startHold(1) }}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
          disabled={atMax}
          aria-label="Aumentar"
          className="num-btn"
          style={{
            flex: 1, height: 34, borderRadius: 10,
            background: atMax ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${atMax ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.09)'}`,
            color: atMax ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)',
            fontSize: 18, fontWeight: 700,
            cursor: atMax ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 120ms, border-color 120ms, color 120ms, transform 80ms',
            userSelect: 'none', touchAction: 'manipulation',
            ['--c' as any]: color,
          }}
        >+</button>
      </div>

      <style>{`
        @keyframes numTick {
          0%   { transform: scale(0.85); opacity: 0.4; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        .num-btn:not(:disabled):hover {
          background: color-mix(in srgb, var(--c) 10%, transparent) !important;
          border-color: color-mix(in srgb, var(--c) 30%, transparent) !important;
          color: var(--c) !important;
        }
        .num-btn:not(:disabled):active { transform: scale(0.94); }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  )
}
