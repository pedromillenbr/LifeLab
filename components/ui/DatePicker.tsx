'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DatePickerProps {
  /** Valor ISO YYYY-MM-DD ou string vazia. */
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  min?: string
  max?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * DatePicker custom alinhado ao design system (escuro / verde).
 * Substitui `<input type="date">` cujo popup é renderizado pelo SO
 * (claro, fora da paleta).
 */
export function DatePicker({
  value, onChange, placeholder = 'dd/mm/aaaa',
  min, max, disabled, className, ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  // Mês visível no painel
  const initial = parseISO(value) ?? new Date()
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const [viewYear, setViewYear] = useState(initial.getFullYear())

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) {
      const d = parseISO(value) ?? new Date()
      setViewMonth(d.getMonth())
      setViewYear(d.getFullYear())
    }
  }, [open, value])

  useLayoutEffect(() => {
    if (!open) return
    const compute = () => {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const panelMaxH = 340
      const spaceBelow = window.innerHeight - r.bottom
      const openUp = spaceBelow < panelMaxH + 16 && r.top > spaceBelow
      setPos({
        top: openUp ? r.top - 6 : r.bottom + 6,
        left: r.left,
        width: Math.max(r.width, 280),
        openUp,
      })
    }
    compute()
    window.addEventListener('scroll', compute, true)
    window.addEventListener('resize', compute)
    return () => {
      window.removeEventListener('scroll', compute, true)
      window.removeEventListener('resize', compute)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = parseISO(value)
  const display = selected
    ? selected.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  const minDate = min ? parseISO(min) : null
  const maxDate = max ? parseISO(max) : null

  function pick(d: Date) {
    const iso = toISO(d)
    onChange(iso)
    setOpen(false)
  }

  function clear() {
    onChange('')
    setOpen(false)
  }

  function goToday() {
    const t = new Date()
    pick(new Date(t.getFullYear(), t.getMonth(), t.getDate()))
  }

  function shiftMonth(delta: number) {
    let m = viewMonth + delta
    let y = viewYear
    while (m < 0) { m += 12; y-- }
    while (m > 11) { m -= 12; y++ }
    setViewMonth(m); setViewYear(y)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`input flex items-center justify-between text-left ${className ?? ''}`}
        style={{
          minHeight: 44,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{
          color: display ? 'var(--color-text-main)' : 'var(--color-text-muted)',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {display || placeholder}
        </span>
        {display && !disabled ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); clear() }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); clear() } }}
            style={{
              color: 'var(--color-text-muted)', cursor: 'pointer',
              padding: 4, borderRadius: 6, marginLeft: 4,
              display: 'inline-flex',
            }}
            aria-label="Limpar data"
          >
            <X size={14} />
          </span>
        ) : (
          <Calendar size={15} style={{ color: 'var(--color-text-muted)', marginLeft: 8, flexShrink: 0 }} />
        )}
      </button>

      {mounted && open && pos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            style={{
              position: 'fixed',
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp ? window.innerHeight - pos.top : undefined,
              left: pos.left,
              width: pos.width,
              zIndex: 200,
              padding: 12,
              borderRadius: 14,
              background: 'rgba(15,17,22,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(var(--color-primary-rgb), 0.28)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 24px rgba(var(--color-primary-rgb), 0.12)',
              animation: 'fadeIn 0.14s ease both',
              fontFamily: 'var(--font-body)',
            }}
          >
            <DatePanel
              year={viewYear} month={viewMonth}
              selected={selected}
              minDate={minDate} maxDate={maxDate}
              onPick={pick}
              onShift={shiftMonth}
              onToday={goToday}
              onClear={clear}
            />
          </div>,
          document.body,
        )}
    </>
  )
}

const WEEKDAYS_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTH_LABELS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function DatePanel({
  year, month, selected, minDate, maxDate,
  onPick, onShift, onToday, onClear,
}: {
  year: number; month: number
  selected: Date | null
  minDate: Date | null; maxDate: Date | null
  onPick: (d: Date) => void
  onShift: (delta: number) => void
  onToday: () => void
  onClear: () => void
}) {
  const today = new Date()
  const todayKey = isoKey(today)
  const selectedKey = selected ? isoKey(selected) : null
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<{ day: number; date: Date } | null> = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, date: new Date(year, month, d) })
  // Completa para múltiplos de 7
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      {/* Header com mês + navegação */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, padding: '0 4px',
      }}>
        <button
          type="button" onClick={() => onShift(-1)}
          aria-label="Mês anterior"
          style={navBtn}
        ><ChevronLeft size={16} /></button>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--color-text-main)',
          textTransform: 'capitalize', letterSpacing: 0.3,
        }}>
          {MONTH_LABELS[month]} <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{year}</span>
        </div>
        <button
          type="button" onClick={() => onShift(1)}
          aria-label="Próximo mês"
          style={navBtn}
        ><ChevronRight size={16} /></button>
      </div>

      {/* Weekdays header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {WEEKDAYS_PT.map((w, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 10, color: 'var(--color-text-muted)',
            fontWeight: 700, padding: '4px 0',
            fontFamily: "'JetBrains Mono', monospace",
          }}>{w}</div>
        ))}
      </div>

      {/* Grid de dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />
          const key = isoKey(cell.date)
          const isToday = key === todayKey
          const isSel = key === selectedKey
          const beforeMin = minDate && cell.date < stripTime(minDate)
          const afterMax = maxDate && cell.date > stripTime(maxDate)
          const disabled = beforeMin || afterMax
          return (
            <button
              key={i}
              type="button"
              disabled={!!disabled}
              onClick={() => onPick(cell.date)}
              style={{
                aspectRatio: '1', borderRadius: 8,
                background: isSel
                  ? 'var(--color-primary)'
                  : isToday
                    ? 'rgba(var(--color-primary-rgb), 0.12)'
                    : 'transparent',
                color: isSel
                  ? '#0a0d14'
                  : isToday
                    ? 'var(--color-primary)'
                    : disabled
                      ? 'rgba(255,255,255,.18)'
                      : 'var(--color-text-main)',
                border: isToday && !isSel ? '1px solid rgba(var(--color-primary-rgb), 0.4)' : '1px solid transparent',
                fontSize: 12, fontWeight: isSel ? 700 : isToday ? 700 : 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transition: 'background .15s, color .15s, transform .1s',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onMouseEnter={e => {
                if (!isSel && !disabled) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'
              }}
              onMouseLeave={e => {
                if (!isSel && !disabled) (e.currentTarget as HTMLElement).style.background = isToday ? 'rgba(var(--color-primary-rgb), 0.12)' : 'transparent'
              }}
            >{cell.day}</button>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 10, paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,.06)',
        display: 'flex', justifyContent: 'space-between', gap: 8,
      }}>
        <button type="button" onClick={onClear} style={footBtn}>Limpar</button>
        <button type="button" onClick={onToday} style={{
          ...footBtn, color: 'var(--color-primary)', fontWeight: 700,
        }}>Hoje</button>
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8,
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.06)',
  color: 'var(--color-text-main)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
}

const footBtn: React.CSSProperties = {
  background: 'transparent', border: 'none',
  color: 'var(--color-text-muted)', cursor: 'pointer',
  fontSize: 11, padding: '4px 8px', borderRadius: 6,
  fontFamily: 'inherit',
}

function parseISO(iso?: string): Date | null {
  if (!iso) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function isoKey(d: Date): string {
  return toISO(d)
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
