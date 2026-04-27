'use client'

import { useRef, useCallback, type ReactNode, type CSSProperties, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface SpotCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  id?: string
  onClick?: () => void
}

export function SpotCard({ children, className, style, id, onClick }: SpotCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--mx', (x * 100).toFixed(1) + '%')
    el.style.setProperty('--my', (y * 100).toFixed(1) + '%')
    const rx = (y - 0.5) * -9
    const ry = (x - 0.5) * 9
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.015)`
    const glowEl = el.querySelector('.card-cursor-glow') as HTMLElement | null
    if (glowEl) {
      glowEl.style.background = `radial-gradient(280px circle at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(34,197,94,0.09) 0%, transparent 70%)`
      glowEl.style.opacity = '1'
    }
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    const glowEl = el.querySelector('.card-cursor-glow') as HTMLElement | null
    if (glowEl) glowEl.style.opacity = '0'
  }, [])

  return (
    <div
      ref={ref}
      id={id}
      className={cn('spot-card', className)}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div className="laser-ring" aria-hidden="true" />
      <div
        className="card-cursor-glow"
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, borderRadius: 'var(--radius-card)',
          opacity: 0, transition: 'opacity .2s', pointerEvents: 'none', zIndex: 2,
        }}
      />
      <div style={{ position: 'relative', zIndex: 4 }}>{children}</div>
    </div>
  )
}
