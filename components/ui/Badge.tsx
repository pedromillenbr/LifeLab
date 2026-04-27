import { cn } from '@/lib/utils'

type BadgeVariant = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'gold' | 'muted'
type BadgeSize    = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  className?: string
}

const variantMap: Record<BadgeVariant, { bg: string; border: string; color: string }> = {
  primary: {
    bg:     'var(--accent-muted)',
    border: 'var(--accent-border)',
    color:  'var(--accent)',
  },
  success: {
    bg:     'var(--success-muted)',
    border: 'var(--success-border)',
    color:  'var(--success)',
  },
  error: {
    bg:     'var(--error-muted)',
    border: 'var(--error-border)',
    color:  'var(--error)',
  },
  warning: {
    bg:     'var(--warning-muted)',
    border: 'var(--warning-border)',
    color:  'var(--warning)',
  },
  info: {
    bg:     'var(--info-muted)',
    border: 'var(--info-border)',
    color:  'var(--info)',
  },
  gold: {
    bg:     'var(--gold-muted)',
    border: 'rgba(245,166,35,0.28)',
    color:  'var(--gold)',
  },
  muted: {
    bg:     'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.10)',
    color:  'var(--color-text-muted)',
  },
}

export function Badge({ children, variant = 'primary', size = 'md', dot = false, className }: BadgeProps) {
  const v = variantMap[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
      style={{ background: v.bg, borderColor: v.border, color: v.color }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: v.color }}
        />
      )}
      {children}
    </span>
  )
}

/** Badge de pilar — usa cor do sistema (unificada) */
export function PillarBadge({ pillar, label }: { pillar: string; label: string }) {
  return (
    <Badge variant="primary" size="sm">
      {label}
    </Badge>
  )
}

/** Badge de XP — gold */
export function XpBadge({ xp }: { xp: number }) {
  return (
    <Badge variant="gold">
      +{xp} XP
    </Badge>
  )
}
