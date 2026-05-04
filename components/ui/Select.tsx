'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * Dropdown customizado, alinhado ao design system (escuro / glass / verde).
 * Substitui o `<select>` nativo cujas opções são renderizadas pelo SO
 * (no Windows, branco/azul claro — ilegível no tema escuro).
 *
 * Posicionado via `position: fixed` baseado no boundingRect do trigger,
 * o que escapa de overflows e funciona dentro de modais.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  disabled = false,
  className,
  ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const selected = options.find(o => o.value === value)

  // Posiciona o painel a cada abertura / scroll / resize.
  useLayoutEffect(() => {
    if (!open) return
    const compute = () => {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const panelMaxH = 280
      const spaceBelow = window.innerHeight - r.bottom
      const openUp = spaceBelow < panelMaxH + 16 && r.top > spaceBelow
      setPos({
        top: openUp ? r.top - 6 : r.bottom + 6,
        left: r.left,
        width: r.width,
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

  // Fecha ao clicar fora / Escape.
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
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
        <span
          style={{
            color: selected ? 'var(--color-text-main)' : 'var(--color-text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: 'var(--color-text-muted)',
            transition: 'transform .18s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            flexShrink: 0,
            marginLeft: 8,
          }}
        />
      </button>

      {mounted && open && pos &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp ? window.innerHeight - pos.top : undefined,
              left: pos.left,
              width: pos.width,
              maxHeight: 280,
              overflowY: 'auto',
              zIndex: 200,
              padding: 4,
              borderRadius: 12,
              background: 'rgba(15,17,22,0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(var(--color-primary-rgb), 0.28)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 24px rgba(var(--color-primary-rgb), 0.12)',
              animation: 'fadeIn 0.14s ease both',
            }}
          >
            {options.map(opt => {
              const isSel = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className="w-full flex items-center justify-between text-left transition-colors"
                  style={{
                    minHeight: 40,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isSel ? 'rgba(var(--color-primary-rgb), 0.14)' : 'transparent',
                    color: isSel ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontSize: 13,
                    fontWeight: isSel ? 600 : 500,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isSel) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseLeave={e => {
                    if (!isSel) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <span>{opt.label}</span>
                  {isSel && <Check size={14} style={{ color: 'var(--color-primary)' }} />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
