'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ListTree } from 'lucide-react'
import { DIVISIONS } from '@/lib/community/divisions'

interface DivisionsGuideProps {
  /** Optional: highlight the current user's division. */
  currentKey?: string
}

export function DivisionsGuide({ currentKey }: DivisionsGuideProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="com-guide">
      <button
        type="button"
        className="com-guide-toggle"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <ListTree size={11} />
        <span>Hierarquia das divisões</span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {open && (
        <ol className="com-guide-list">
          {DIVISIONS.map(d => {
            const isCurrent = d.key === currentKey
            return (
              <li
                key={d.key}
                className={`com-guide-item ${isCurrent ? 'is-current' : ''} ${d.mythic ? 'is-mythic' : ''}`}
                style={{
                  ['--metal' as string]: d.metal,
                  ['--metal-glow' as string]: d.glow,
                }}
              >
                <div className="com-guide-rank">#{d.rank}</div>
                <div className="com-guide-info">
                  <div className="com-guide-name">
                    {d.name}
                    {isCurrent && <span className="com-guide-you">VOCÊ</span>}
                  </div>
                  <div className="com-guide-tagline">{d.tagline}</div>
                </div>
                <div className="com-guide-meta">
                  {d.min === 0
                    ? <span className="com-guide-min">início</span>
                    : <span className="com-guide-min">{d.min.toLocaleString('pt-BR')} XP</span>}
                  {d.minDaysActive ? (
                    <span className="com-guide-days">+ {d.minDaysActive} dias</span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
