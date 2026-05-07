'use client'

import { memo } from 'react'
import { ChevronUp, ChevronDown, Flame, Minus } from 'lucide-react'
import { Avatar } from './Avatar'
import { DivisionBadge } from './DivisionBadge'
import type { RankingRow } from '@/lib/community/api'

interface RankRowProps {
  row:    RankingRow
  isYou:  boolean
  showXP: 'total' | 'monthly'
}

function RankRowImpl({ row, isYou, showXP }: RankRowProps) {
  const xp = showXP === 'total' ? row.total_xp ?? 0 : row.xp ?? 0

  return (
    <div className={`com-rank-row ${isYou ? 'is-you' : ''}`}>
      <div className="com-rank-pos">
        <span className="com-rank-pos-num">{row.position}</span>
        <span className="com-rank-movement">
          {row.movement == null || row.movement === 0 ? (
            <Minus size={10} aria-hidden />
          ) : row.movement > 0 ? (
            <ChevronUp size={11} className="up" />
          ) : (
            <ChevronDown size={11} className="down" />
          )}
        </span>
      </div>

      <Avatar
        displayName={row.display_name}
        divisionKey={row.division_key}
        avatarColor={row.avatar_color}
        avatarInitials={row.avatar_initials}
        size={36}
        glow={isYou}
      />

      <div className="com-rank-name">
        <div className="com-rank-name-text">{row.display_name}</div>
        <DivisionBadge divisionKey={row.division_key} />
      </div>

      <div className="com-rank-meta">
        <div className="com-rank-xp">{xp.toLocaleString('pt-BR')}<span className="com-rank-xp-unit"> XP</span></div>
        <div className="com-rank-streak">
          <Flame size={11} aria-hidden />
          {row.streak}
        </div>
      </div>
    </div>
  )
}

// Memoize so the list doesn't re-render every row when sibling rows
// or unrelated parent state changes.
export const RankRow = memo(RankRowImpl, (prev, next) => (
  prev.isYou === next.isYou &&
  prev.showXP === next.showXP &&
  prev.row.id === next.row.id &&
  prev.row.position === next.row.position &&
  prev.row.display_name === next.row.display_name &&
  prev.row.streak === next.row.streak &&
  prev.row.division_key === next.row.division_key &&
  prev.row.movement === next.row.movement &&
  prev.row.avatar_color === next.row.avatar_color &&
  prev.row.avatar_initials === next.row.avatar_initials &&
  (prev.row.total_xp ?? 0) === (next.row.total_xp ?? 0) &&
  (prev.row.xp ?? 0) === (next.row.xp ?? 0)
))
