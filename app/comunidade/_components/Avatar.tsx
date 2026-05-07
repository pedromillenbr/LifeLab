'use client'

// Deterministic, premium-looking avatar tile.
// No emoji, no random colors — uses the metallic palette of the user's
// current division to keep the visual language consistent.
//
// avatar_color is a custom override (one of METAL_PALETTE keys); when set,
// it takes precedence over the division's metal color.
// avatar_initials overrides the name-derived initials (up to 3 chars).

import { getDivision, type DivisionKey } from '@/lib/community/divisions'

// ── Metallic palette for user customization ─────────────────────────
// Curated, all dark-luxury. NO rainbow.
export interface MetalOption {
  key:   string  // identifier we persist
  label: string
  hex:   string
  glow:  string
}

export const METAL_PALETTE: MetalOption[] = [
  { key: 'green',  label: 'Verde elite',   hex: '#22c55e', glow: 'rgba(34,197,94,0.45)' },
  { key: 'gold',   label: 'Ouro',          hex: '#eab308', glow: 'rgba(234,179,8,0.45)' },
  { key: 'silver', label: 'Prata',         hex: '#c8c8d0', glow: 'rgba(200,200,208,0.40)' },
  { key: 'cyan',   label: 'Ciano',         hex: '#06b6d4', glow: 'rgba(6,182,212,0.45)' },
  { key: 'bronze', label: 'Bronze',        hex: '#a07845', glow: 'rgba(160,120,69,0.40)' },
  { key: 'crimson',label: 'Carmesim',      hex: '#b91c1c', glow: 'rgba(185,28,28,0.40)' },
  { key: 'steel',  label: 'Aço',           hex: '#7a92a8', glow: 'rgba(122,146,168,0.40)' },
  { key: 'onyx',   label: 'Ônix',          hex: '#5a5a5a', glow: 'rgba(90,90,90,0.40)' },
]

const METAL_BY_HEX = new Map(METAL_PALETTE.map(m => [m.hex.toLowerCase(), m]))
export function metalFromHex(hex?: string | null): MetalOption | null {
  if (!hex) return null
  return METAL_BY_HEX.get(hex.toLowerCase()) ?? null
}

function defaultInitials(name: string): string {
  const parts = name.trim().split(/\s+|[._]/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

interface AvatarProps {
  displayName:      string
  divisionKey?:     DivisionKey
  avatarColor?:     string | null  // hex; takes precedence over division.metal
  avatarInitials?:  string | null  // overrides name-derived initials
  size?:            number
  glow?:            boolean
}

export function Avatar({
  displayName,
  divisionKey = 'ze_bosta',
  avatarColor,
  avatarInitials,
  size = 36,
  glow = false,
}: AvatarProps) {
  const div = getDivision(divisionKey)
  const customMetal = metalFromHex(avatarColor)
  const metal     = customMetal?.hex  ?? div.metal
  const metalGlow = customMetal?.glow ?? div.glow

  const initials = (avatarInitials && avatarInitials.trim().length > 0)
    ? avatarInitials.trim().slice(0, 3).toUpperCase()
    : defaultInitials(displayName)

  const fontSize = Math.round(size * (initials.length === 3 ? 0.34 : 0.42))

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
        background: `radial-gradient(circle at 30% 25%, ${metal}, color-mix(in srgb, ${metal} 30%, #0b0c10))`,
        border: `1px solid color-mix(in srgb, ${metal} 50%, transparent)`,
        color: '#0b0c10',
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize,
        letterSpacing: '-0.04em',
        textShadow: '0 1px 0 rgba(255,255,255,0.25)',
        boxShadow: glow
          ? `inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(0,0,0,0.30), 0 0 18px ${metalGlow}`
          : 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.30)',
        userSelect: 'none',
      }}
      aria-hidden
    >
      {initials}
    </div>
  )
}
