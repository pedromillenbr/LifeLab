'use client'

import { getDivision, type DivisionKey } from '@/lib/community/divisions'

interface DivisionBadgeProps {
  divisionKey: DivisionKey
  size?: 'sm' | 'md'
  showName?: boolean
}

export function DivisionBadge({ divisionKey, size = 'sm', showName = true }: DivisionBadgeProps) {
  const div = getDivision(divisionKey)
  const padding = size === 'sm' ? '3px 8px' : '5px 12px'
  const fontSize = size === 'sm' ? 10 : 12

  return (
    <span
      title={div.name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding,
        borderRadius: 9999,
        fontFamily: 'var(--font-body)',
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: div.metal,
        background: `color-mix(in srgb, ${div.metal} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${div.metal} 32%, transparent)`,
        boxShadow: div.mythic
          ? `inset 0 1px 0 rgba(255,255,255,0.10), 0 0 18px ${div.glow}`
          : `inset 0 1px 0 rgba(255,255,255,0.06)`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: div.metal,
          boxShadow: `0 0 8px ${div.glow}`,
          flexShrink: 0,
        }}
      />
      {showName ? div.short : null}
    </span>
  )
}
