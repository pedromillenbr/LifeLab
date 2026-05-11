'use client'
import { Trash2 } from 'lucide-react'
import type { Goal, GoalLog } from '@/store/types'
import { formatGoalValue } from '@/lib/goals'

interface GoalTimelineProps {
  goal: Goal
  accent: string
  onRemove?: (logId: string) => void
}

/**
 * Timeline de registros estilo "feed da jornada".
 * Cada log mostra valor + delta vs anterior + nota + data.
 */
export function GoalTimeline({ goal, accent, onRemove }: GoalTimelineProps) {
  // Mais recente em cima
  const sorted = [...goal.logs].sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length === 0) {
    return (
      <div style={{
        padding: '24px 16px', textAlign: 'center',
        color: 'rgba(255,255,255,.4)', fontSize: 13,
        border: '1px dashed rgba(255,255,255,.08)',
        borderRadius: 12,
      }}>
        Nenhum registro ainda. Adicione o primeiro update e veja sua jornada começar.
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', paddingLeft: 22 }}>
      {/* Linha vertical de fundo */}
      <div style={{
        position: 'absolute', left: 9, top: 6, bottom: 6,
        width: 1.5, background: `linear-gradient(180deg, ${accent}55, transparent)`,
        borderRadius: 2,
      }} />
      {sorted.map((log, i) => {
        const next = sorted[i + 1]
        const delta = next ? log.value - next.value : null
        const isUp = (delta ?? 0) > 0
        const goingRight = goal.direction === 'increase' ? isUp : !isUp
        return (
          <TimelineItem
            key={log.id}
            log={log}
            unit={goal.unit}
            accent={accent}
            delta={delta}
            goingRight={goingRight}
            onRemove={onRemove}
          />
        )
      })}
    </div>
  )
}

function TimelineItem({
  log, unit, accent, delta, goingRight, onRemove,
}: {
  log: GoalLog
  unit: string
  accent: string
  delta: number | null
  goingRight: boolean
  onRemove?: (logId: string) => void
}) {
  const date = new Date(log.date + 'T12:00:00')
  return (
    <div className="timeline-item" style={{
      position: 'relative', marginBottom: 14,
      padding: '12px 14px',
      background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(255,255,255,.06)',
      borderRadius: 10,
    }}>
      {/* Bolinha na linha */}
      <div style={{
        position: 'absolute', left: -19, top: 16,
        width: 11, height: 11, borderRadius: 999,
        background: accent,
        border: '2px solid #0a0d14',
        boxShadow: `0 0 8px ${accent}cc`,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 16, fontWeight: 800, color: '#fff',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{formatGoalValue(log.value, unit)}</span>
            {delta !== null && delta !== 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: goingRight ? '#4ade80' : '#f87171',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {delta > 0 ? '+' : ''}{formatGoalValue(delta, unit)}
              </span>
            )}
          </div>
          {log.note && (
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 4,
              lineHeight: 1.4,
            }}>{log.note}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,.45)',
            fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap',
          }}>
            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
          {onRemove && (
            <button
              onClick={() => onRemove(log.id)}
              className="tl-trash"
              aria-label="Remover registro"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,.3)', padding: 4, borderRadius: 6,
                opacity: 0, transition: 'opacity .2s, color .2s, background .2s',
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <style jsx>{`
        .timeline-item:hover .tl-trash { opacity: 1; }
        .tl-trash:hover { color: #f87171 !important; background: rgba(248,113,113,.1) !important; }
      `}</style>
    </div>
  )
}
