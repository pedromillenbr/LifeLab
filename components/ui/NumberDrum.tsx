'use client'
import { useRef } from 'react'

const ITEM_H = 48
const VISIBLE = 5
const HALF = Math.floor(VISIBLE / 2)

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
  const dragRef = useRef<{ startY: number; startIdx: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function moveTo(newIdx: number) {
    const clamped = Math.max(0, Math.min(values.length - 1, newIdx))
    if (values[clamped] !== value) onChange(values[clamped])
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    moveTo(idx + (e.deltaY > 0 ? 1 : -1))
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragRef.current = { startY: e.clientY, startIdx: idx }
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const delta = dragRef.current.startY - e.clientY
    const steps = Math.round(delta / (ITEM_H * 0.55))
    moveTo(dragRef.current.startIdx + steps)
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  const translateY = (HALF - idx) * ITEM_H

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {label && (
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </p>
      )}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: ITEM_H * VISIBLE,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'ns-resize',
          userSelect: 'none',
          touchAction: 'none',
          borderRadius: 14,
          background: 'rgba(8,18,40,0.6)',
          border: `1px solid rgba(255,255,255,0.07)`,
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Fade top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 4, pointerEvents: 'none',
          height: ITEM_H * HALF,
          background: `linear-gradient(to bottom, rgba(8,18,40,0.96) 0%, rgba(8,18,40,0.5) 60%, transparent 100%)`,
        }} />

        {/* Fade bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4, pointerEvents: 'none',
          height: ITEM_H * HALF,
          background: `linear-gradient(to top, rgba(8,18,40,0.96) 0%, rgba(8,18,40,0.5) 60%, transparent 100%)`,
        }} />

        {/* Selected highlight */}
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: 10, right: 10, height: ITEM_H - 4,
          background: `${color}14`,
          border: `1px solid ${color}40`,
          borderRadius: 10,
          zIndex: 2, pointerEvents: 'none',
          boxShadow: `0 0 18px ${color}15`,
        }} />

        {/* Scrolling list */}
        <div style={{
          transform: `translateY(${translateY}px)`,
          transition: dragRef.current ? 'none' : 'transform 180ms cubic-bezier(0.16,1,0.3,1)',
          position: 'relative', zIndex: 3,
        }}>
          {values.map((v, i) => {
            const dist = Math.abs(i - idx)
            const isSelected = dist === 0
            return (
              <div
                key={v}
                style={{
                  height: ITEM_H,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: isSelected ? 26 : dist === 1 ? 18 : 14,
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? color : 'var(--fg1)',
                  opacity: isSelected ? 1 : dist === 1 ? 0.32 : 0.1,
                  transition: 'all 180ms cubic-bezier(0.16,1,0.3,1)',
                  letterSpacing: isSelected ? '-0.02em' : '0',
                  cursor: dist > 0 ? 'pointer' : 'default',
                }}
                onClick={() => dist > 0 && moveTo(i)}
              >
                {v}
                {isSelected && unit && (
                  <span style={{ fontSize: 12, fontWeight: 400, color: `${color}90`, marginLeft: 1 }}>{unit}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
