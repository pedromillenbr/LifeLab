'use client'
import Link from 'next/link'
import { Flame, ChevronRight, Calendar } from 'lucide-react'
import type { Goal } from '@/store/types'
import {
  getGoalProgress, getGoalRemaining, getGoalStreak,
  getNextMilestone, getCoverPreset, getPresetForCategory,
  formatGoalValue, formatRelativeDate, daysUntil,
} from '@/lib/goals'
import { GoalCover } from './GoalCover'

interface GoalCardProps {
  goal: Goal
  index?: number
}

/**
 * Card premium da listagem. Cover ocupa o topo, conteúdo abaixo.
 * Hover: leve elevação + brilho na cor do preset.
 */
export function GoalCard({ goal, index = 0 }: GoalCardProps) {
  const preset = goal.coverPreset ? getCoverPreset(goal.coverPreset) : getPresetForCategory(goal.category)
  const pct = getGoalProgress(goal)
  const remaining = getGoalRemaining(goal)
  const streak = getGoalStreak(goal.logs)
  const nextMs = getNextMilestone(goal)
  const dDeadline = daysUntil(goal.targetDate)

  return (
    <Link
      href={`/metas/${goal.id}`}
      className="goal-card"
      style={{
        display: 'block',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(255,255,255,.025)',
        border: `1px solid ${preset.accent}22`,
        boxShadow: '0 4px 20px rgba(0,0,0,.4)',
        textDecoration: 'none',
        color: 'inherit',
        animation: `goalCardRise .5s cubic-bezier(.22,1,.36,1) ${index * 60}ms both`,
        transition: 'transform .25s ease, border-color .25s ease, box-shadow .25s ease',
      }}
    >
      {/* Cover com badge de categoria */}
      <GoalCover goal={goal} variant="card" height={150} rounded={0}>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 9px', borderRadius: 999,
            background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
            border: `1px solid ${preset.accent}55`,
            fontSize: 10, fontWeight: 700, color: preset.accent,
            letterSpacing: 0.5, textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <preset.icon size={11} />
            {preset.label}
          </span>
          {goal.archived && (
            <span style={{
              padding: '3px 8px', borderRadius: 999,
              background: 'rgba(0,0,0,.6)', fontSize: 9, color: 'rgba(255,255,255,.55)',
              letterSpacing: .5, textTransform: 'uppercase',
            }}>arquivada</span>
          )}
        </div>
        {streak > 0 && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 9px', borderRadius: 999,
            background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(251,191,36,.4)',
            fontSize: 11, fontWeight: 700, color: '#fbbf24',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <Flame size={12} style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,.7))' }} />
            {streak}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
          <h3 style={{
            fontSize: 18, fontWeight: 800, color: '#fff',
            lineHeight: 1.2, margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,.6)',
            display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>{goal.title}</h3>
          {goal.subtitle && (
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,.7)',
              marginTop: 4, marginBottom: 0,
              textShadow: '0 1px 4px rgba(0,0,0,.6)',
              display: '-webkit-box',
              WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}>{goal.subtitle}</p>
          )}
        </div>
      </GoalCover>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Métrica principal */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Atual</div>
            <div style={{
              fontSize: 18, fontWeight: 800, color: '#fff',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{formatGoalValue(goal.currentValue, goal.unit)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Meta</div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.7)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{formatGoalValue(goal.targetValue, goal.unit)}</div>
          </div>
        </div>

        {/* Barra com gradient */}
        <div style={{
          height: 8, borderRadius: 999, overflow: 'hidden',
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.05)',
          marginBottom: 10, position: 'relative',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: `linear-gradient(90deg, ${preset.accent}99 0%, ${preset.accent} 100%)`,
            boxShadow: `0 0 10px ${preset.accent}80`,
            transition: 'width .8s cubic-bezier(.22,1,.36,1)',
          }} />
        </div>

        {/* Footer linhas finas */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, color: 'rgba(255,255,255,.55)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: preset.accent, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
              {pct.toFixed(0)}%
            </span>
            {remaining > 0 && (
              <span>faltam <strong style={{ color: 'rgba(255,255,255,.85)' }}>{formatGoalValue(remaining, goal.unit)}</strong></span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.45)' }}>
            {dDeadline !== null && dDeadline >= 0 && goal.targetDate && (
              <>
                <Calendar size={11} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {dDeadline === 0 ? 'hoje' : `${dDeadline}d`}
                </span>
              </>
            )}
            <ChevronRight size={14} style={{ color: preset.accent, opacity: 0.7 }} />
          </div>
        </div>

        {nextMs && (
          <div style={{
            marginTop: 10, paddingTop: 10,
            borderTop: '1px dashed rgba(255,255,255,.06)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, color: 'rgba(255,255,255,.6)',
          }}>
            <span style={{ opacity: .7 }}>{nextMs.emoji ?? '✦'}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              próximo marco: <strong style={{ color: '#fff' }}>{nextMs.label}</strong>
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes goalCardRise {
          0% { opacity: 0; transform: translateY(14px) scale(.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .goal-card:hover {
          transform: translateY(-3px);
          border-color: ${preset.accent}66 !important;
          box-shadow: 0 12px 32px rgba(0,0,0,.55), 0 0 24px ${preset.accent}22 !important;
        }
      `}</style>
    </Link>
  )
}
