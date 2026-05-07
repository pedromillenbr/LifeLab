'use client'

import { Crown, Flame, Trophy } from 'lucide-react'
import { Avatar } from './Avatar'
import { getDivision, type DivisionKey } from '@/lib/community/divisions'

interface EliteCardProps {
  rank:        number
  displayName: string
  divisionKey: DivisionKey
  xp:          number
  streak?:     number
  /** Free-form badge text shown at the top, e.g. "MAIOR STREAK", "CAMPEÃO MAR/2026". */
  caption?:    string
  variant?:    'tall' | 'wide'
}

export function EliteCard({
  rank, displayName, divisionKey, xp, streak,
  caption, variant = 'tall',
}: EliteCardProps) {
  const div = getDivision(divisionKey)
  const isTopOne = rank === 1

  return (
    <div
      className={`com-elite-card ${isTopOne ? 'is-top1' : ''} ${div.mythic ? 'is-mythic' : ''} ${variant}`}
      style={{
        ['--metal' as string]: div.metal,
        ['--metal-glow' as string]: div.glow,
      }}
    >
      <div className="com-elite-frame" />
      <div className="com-elite-inner">
        <div className="com-elite-top">
          <span className="com-elite-rank">
            {isTopOne ? <Crown size={11} aria-hidden /> : <Trophy size={10} aria-hidden />}
            #{rank}
          </span>
          {caption ? <span className="com-elite-caption">{caption}</span> : null}
        </div>

        <div className="com-elite-portrait">
          <Avatar displayName={displayName} divisionKey={divisionKey} size={64} glow />
          {div.mythic ? <div className="com-elite-aura" aria-hidden /> : null}
        </div>

        <div className="com-elite-name">{displayName}</div>
        <div className="com-elite-division">{div.name}</div>

        <div className="com-elite-stats">
          <div className="com-elite-stat">
            <span className="com-elite-stat-label">XP</span>
            <span className="com-elite-stat-val">{xp.toLocaleString('pt-BR')}</span>
          </div>
          {streak != null && (
            <div className="com-elite-stat">
              <span className="com-elite-stat-label">Streak</span>
              <span className="com-elite-stat-val">
                <Flame size={10} aria-hidden /> {streak}
              </span>
            </div>
          )}
        </div>

        <div className="com-elite-tagline">{div.tagline}</div>
      </div>
    </div>
  )
}
