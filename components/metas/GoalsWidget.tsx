'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { Target, Plus, ArrowUpRight, ChevronRight, Flame } from 'lucide-react'
import {
  getCoverPreset, getPresetForCategory,
  getGoalProgress, getNextMilestone, getGoalStreak,
  formatGoalValue,
} from '@/lib/goals'
import { AddGoalModal } from './AddGoalModal'

/**
 * Widget compacto para o dashboard. Mostra até 3 metas ativas
 * ordenadas pela atualização mais recente. Cada item linka pro
 * detalhe da meta. Botão + abre o modal de criação.
 */
export function GoalsWidget() {
  const router = useRouter()
  const goals = useStore(s => s.goals)
  const addGoal = useStore(s => s.addGoal)
  const [showAdd, setShowAdd] = useState(false)

  const top = useMemo(() => {
    return [...goals]
      .filter(g => !g.archived)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3)
  }, [goals])

  const totalActive = goals.filter(g => !g.archived).length

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div
          className="card-title"
          style={{ fontSize: 13, textTransform: 'none', letterSpacing: 0, color: 'var(--text-1)', cursor: 'pointer' }}
          onClick={() => router.push('/metas')}
        >
          <Target size={14} style={{ color: 'var(--green)' }} />
          Metas
          <ArrowUpRight size={12} style={{ color: 'var(--text-3)', marginLeft: 2 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {totalActive > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: '3px 8px', borderRadius: 999,
              background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.3)',
              color: 'var(--gold)', letterSpacing: 1, textTransform: 'uppercase',
              fontFamily: 'var(--mono)',
            }}>{totalActive} ativa{totalActive === 1 ? '' : 's'}</span>
          )}
          <button className="add-btn" onClick={() => setShowAdd(true)} aria-label="Nova meta">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {top.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Target size={32} /></div>
          <p>Nenhuma meta ainda</p>
          <a onClick={() => setShowAdd(true)}>+ Definir minha primeira meta</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {top.map(g => <GoalRow key={g.id} goalId={g.id} />)}
        </div>
      )}

      <button
        onClick={() => router.push('/metas')}
        className="add-mission-row"
        style={{ marginTop: 8 }}
      >
        <Target size={13} /> Ver todas as metas
      </button>

      <AddGoalModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(g) => { addGoal(g); setShowAdd(false) }}
      />
    </>
  )
}

/** Linha compacta de meta — cover mini + progresso + chevron. */
function GoalRow({ goalId }: { goalId: string }) {
  const goal = useStore(s => s.goals.find(gg => gg.id === goalId))
  if (!goal) return null

  const preset = goal.coverPreset ? getCoverPreset(goal.coverPreset) : getPresetForCategory(goal.category)
  const pct = getGoalProgress(goal)
  const nextMs = getNextMilestone(goal)
  const streak = getGoalStreak(goal.logs)
  const Icon = preset.icon

  return (
    <Link
      href={`/metas/${goal.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        background: 'rgba(255,255,255,.025)',
        border: `1px solid ${preset.accent}22`,
        borderRadius: 10,
        textDecoration: 'none', color: 'inherit',
        transition: 'all .2s', cursor: 'pointer',
      }}
      className="goal-widget-row"
    >
      {/* Mini cover */}
      <div style={{
        width: 38, height: 38, borderRadius: 8,
        background: preset.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `inset 0 -8px 12px rgba(0,0,0,.4)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <Icon size={18} style={{ color: preset.accent, filter: `drop-shadow(0 0 4px ${preset.accent}88)` }} />
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
        }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, minWidth: 0,
          }}>{goal.title}</span>
          {streak > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              fontSize: 10, color: '#fbbf24', fontWeight: 700,
              fontFamily: 'var(--mono)', flexShrink: 0,
            }}>
              <Flame size={9} />{streak}
            </span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 700, color: preset.accent,
            fontFamily: 'var(--mono)', flexShrink: 0,
          }}>{pct.toFixed(0)}%</span>
        </div>
        {/* Barra fina */}
        <div style={{
          height: 4, borderRadius: 999, overflow: 'hidden',
          background: 'rgba(255,255,255,.05)',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: `linear-gradient(90deg, ${preset.accent}99, ${preset.accent})`,
            boxShadow: `0 0 6px ${preset.accent}aa`,
            transition: 'width .8s cubic-bezier(.22,1,.36,1)',
          }} />
        </div>
        {nextMs && (
          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            próximo: <span style={{ color: 'rgba(255,255,255,.7)' }}>{formatGoalValue(nextMs.targetValue, goal.unit)}</span>
          </div>
        )}
      </div>

      <ChevronRight size={14} style={{ color: preset.accent, opacity: 0.7, flexShrink: 0 }} />

      <style jsx>{`
        .goal-widget-row:hover {
          background: rgba(255,255,255,.05) !important;
          border-color: ${preset.accent}55 !important;
          transform: translateX(2px);
        }
      `}</style>
    </Link>
  )
}
