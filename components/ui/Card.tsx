import { cn } from '@/lib/utils'
import { CSSProperties } from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: CSSProperties
  /** Adiciona efeito de hover com glow verde */
  interactive?: boolean
  /** Borda com tom da cor primária */
  accent?: boolean
}

export function Card({ children, className, onClick, style, interactive = false, accent = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg p-5',
        interactive && 'cursor-pointer transition-all duration-250 hover:-translate-y-0.5',
        className
      )}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${accent ? 'var(--color-primary-border)' : 'var(--color-border)'}`,
        boxShadow: 'var(--shadow-card)',
        ...(interactive && {
          transition: 'transform 250ms var(--ease-out), box-shadow 250ms var(--ease-out), border-color 250ms',
        }),
        ...style,
      }}
      onMouseEnter={interactive ? e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = 'var(--shadow-glow), var(--shadow-card)'
        el.style.borderColor = 'var(--color-primary-border)'
      } : undefined}
      onMouseLeave={interactive ? e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = ''
        el.style.boxShadow = 'var(--shadow-card)'
        el.style.borderColor = accent ? 'var(--color-primary-border)' : 'var(--color-border)'
      } : undefined}
    >
      {children}
    </div>
  )
}
