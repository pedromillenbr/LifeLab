'use client'

// Deterministic, premium-looking avatar tile.
// No emoji, no random colors — uses the metallic palette of the user's
// current division to keep the visual language consistent.
//
// avatar_seed is an optional override (hex color); when empty we derive
// a stable seed from the user id.

import { getDivision, type DivisionKey } from '@/lib/community/divisions'

function initials(name: string): string {
  const parts = name.trim().split(/\s+|[._]/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

interface AvatarProps {
  displayName: string
  divisionKey?: DivisionKey
  size?: number
  glow?: boolean
}

export function Avatar({ displayName, divisionKey = 'ze_bosta', size = 36, glow = false }: AvatarProps) {
  const div = getDivision(divisionKey)
  const fontSize = Math.round(size * 0.42)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 30% 25%, ${div.metal}, color-mix(in srgb, ${div.metal} 30%, #0b0c10))`,
        border: `1px solid color-mix(in srgb, ${div.metal} 50%, transparent)`,
        color: '#0b0c10',
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize,
        letterSpacing: '-0.04em',
        textShadow: '0 1px 0 rgba(255,255,255,0.25)',
        boxShadow: glow
          ? `inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(0,0,0,0.30), 0 0 18px ${div.glow}`
          : 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.30)',
        userSelect: 'none',
      }}
      aria-hidden
    >
      {initials(displayName)}
    </div>
  )
}
