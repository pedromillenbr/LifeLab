'use client'

import { ChevronUp, ChevronDown, Flame, Minus } from 'lucide-react'
import { Avatar } from './Avatar'
import { DivisionBadge } from './DivisionBadge'
import type { RankingRow } from '@/lib/community/api'

interface RankRowProps {
  row:    RankingRow
  isYou:  boolean
  showXP: 'total' | 'monthly'
}

export function RankRow({ row, isYou, showXP }: RankRowProps) {
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

      <Avatar displayName={row.display_name} divisionKey={row.division_key} size={36} glow={isYou} />

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
