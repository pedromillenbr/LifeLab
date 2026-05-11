'use client'
import { useMemo, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Plus, Target, Trophy, Flame, TrendingUp, Sparkles, Filter } from 'lucide-react'
import { GoalCard } from '@/components/metas/GoalCard'
import { AddGoalModal } from '@/components/metas/AddGoalModal'
import { COVER_PRESETS, getGoalProgress } from '@/lib/goals'
import type { GoalCategory } from '@/store/types'

type FilterOpt = 'todas' | 'ativas' | 'arquivadas' | GoalCategory

export default function MetasPage() {
  const goals = useStore(s => s.goals)
  const addGoal = useStore(s => s.addGoal)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<FilterOpt>('ativas')

  const filtered = useMemo(() => {
    let list = [...goals]
    if (filter === 'ativas') list = list.filter(g => !g.archived)
    else if (filter === 'arquivadas') list = list.filter(g => g.archived)
    else if (filter !== 'todas') list = list.filter(g => g.category === filter)
    // Ordena: ativas primeiro, depois por progresso desc
    return list.sort((a, b) => {
      if (!!a.archived !== !!b.archived) return a.archived ? 1 : -1
      return getGoalProgress(b) - getGoalProgress(a)
    })
  }, [goals, filter])

  const stats = useMemo(() => {
    const active = goals.filter(g => !g.archived)
    const totalProgress = active.length > 0
      ? Math.round(active.reduce((acc, g) => acc + getGoalProgress(g), 0) / active.length)
      : 0
    const completed = goals.filter(g => getGoalProgress(g) >= 100).length
    const totalMilestones = goals.reduce((acc, g) => acc + g.milestones.filter(m => m.achievedAt).length, 0)
    return { active: active.length, totalProgress, completed, totalMilestones }
  }, [goals])

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <p className="slabel" style={{ marginBottom: 4 }}>Long Term</p>
          <h1 className="page-title">
            Metas
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
              background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.3)',
              color: 'var(--gold)', letterSpacing: 1, textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{stats.active} ativas</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
            O painel da vida que você está construindo.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={16} /> Nova meta
        </button>
      </div>

      {/* Stats hero — 4 mini-cards */}
      {goals.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10,
          marginBottom: 20,
        }}>
          {[
            { icon: Target,    label: 'Ativas',           value: stats.active,         color: '#60a5fa' },
            { icon: TrendingUp, label: 'Progresso médio', value: `${stats.totalProgress}%`, color: '#10b981' },
            { icon: Trophy,    label: 'Conquistadas',     value: stats.completed,      color: '#fbbf24' },
            { icon: Sparkles,  label: 'Marcos cumpridos', value: stats.totalMilestones, color: '#a78bfa' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: '14px 16px', borderRadius: 14,
                background: 'rgba(255,255,255,.025)',
                border: `1px solid ${s.color}22`,
                animation: `metasStatRise .5s cubic-bezier(.22,1,.36,1) ${i * 60}ms both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <s.icon size={13} style={{ color: s.color }} />
                <span style={{
                  fontSize: 10, color: 'rgba(255,255,255,.5)',
                  letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600,
                }}>{s.label}</span>
              </div>
              <div style={{
                fontSize: 22, fontWeight: 800, color: '#fff',
                fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
              }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      {goals.length > 0 && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 16,
          overflowX: 'auto', paddingBottom: 4,
        }}>
          <FilterPill icon={<Filter size={11} />} label="Ativas" active={filter === 'ativas'} onClick={() => setFilter('ativas')} />
          <FilterPill label="Todas" active={filter === 'todas'} onClick={() => setFilter('todas')} />
          {COVER_PRESETS.map(p => (
            <FilterPill
              key={p.id}
              icon={<p.icon size={11} />}
              label={p.label}
              active={filter === p.category}
              accent={p.accent}
              onClick={() => setFilter(p.category)}
            />
          ))}
          <FilterPill label="Arquivadas" active={filter === 'arquivadas'} onClick={() => setFilter('arquivadas')} />
        </div>
      )}

      {/* Grid de metas */}
      {filtered.length === 0
        ? <EmptyState onAdd={() => setShowAdd(true)} hasGoals={goals.length > 0} />
        : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 14,
          }}>
            {filtered.map((g, i) => <GoalCard key={g.id} goal={g} index={i} />)}
          </div>
        )
      }

      <AddGoalModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(g) => { addGoal(g); setShowAdd(false) }}
      />

      <style jsx>{`
        @keyframes metasStatRise {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function FilterPill({
  label, active, onClick, icon, accent,
}: {
  label: string; active: boolean; onClick: () => void
  icon?: React.ReactNode; accent?: string
}) {
  const color = accent ?? '#fbbf24'
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 999,
        background: active ? `${color}18` : 'rgba(255,255,255,.025)',
        border: `1px solid ${active ? color + '55' : 'rgba(255,255,255,.06)'}`,
        color: active ? color : 'rgba(255,255,255,.6)',
        fontSize: 11, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all .2s', flexShrink: 0,
        fontFamily: 'inherit',
      }}
    >
      {icon} {label}
    </button>
  )
}

function EmptyState({ onAdd, hasGoals }: { onAdd: () => void; hasGoals: boolean }) {
  return (
    <div style={{
      padding: '48px 24px', textAlign: 'center',
      background: 'rgba(255,255,255,.025)',
      border: '1px dashed rgba(255,255,255,.1)',
      borderRadius: 16,
    }}>
      <div style={{
        display: 'inline-flex', width: 72, height: 72, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(251,191,36,.1), rgba(251,191,36,.02))',
        border: '1px solid rgba(251,191,36,.3)',
        marginBottom: 18,
      }}>
        <Target size={32} style={{ color: 'var(--gold)' }} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
        {hasGoals ? 'Nada por aqui no filtro' : 'Comece sua primeira meta'}
      </h3>
      <p style={{
        fontSize: 13, color: 'rgba(255,255,255,.55)',
        maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.5,
      }}>
        {hasGoals
          ? 'Mude o filtro acima ou crie uma nova meta.'
          : 'Defina o que você quer construir nos próximos meses. O app cuida do resto: progresso, marcos, previsão de chegada.'}
      </p>
      <button
        onClick={onAdd}
        className="btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <Plus size={16} /> Criar meta
      </button>
    </div>
  )
}
