'use client'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Badge, PillarBadge } from '@/components/ui/Badge'
import dynamic from 'next/dynamic'
import { Plus, CheckCircle2, Circle, Trash2, Flame, TrendingUp } from 'lucide-react'
import { cn, PILLAR_LABELS, PILLAR_COLORS, today } from '@/lib/utils'
import { Pillar } from '@/store/types'

const HabitosChart = dynamic(() => import('./HabitosChart'), {
  ssr: false,
  loading: () => <div className="rounded-lg h-[228px] mb-5 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />,
})

function generateId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

const P = 'var(--color-primary)'
const PM = 'var(--color-primary-muted)'
const PB = 'var(--color-primary-border)'
const BG2 = 'var(--color-bg-2)'
const BG3 = 'var(--color-bg-3)'
const BG4 = 'var(--color-bg-4)'
const BORDER = 'var(--color-border)'
const TM = 'var(--color-text-main)'
const TT = 'var(--color-text-muted)'

export default function HabitosPage() {
  const { habits, addHabit, removeHabit, toggleHabitCompletion, getHabitStreak } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', pillar: 'fisico' as Pillar, frequency: 'daily' as const, xpReward: 15, icon: '★' })


  // --- NOVA LÓGICA: datas relativas ao onboarding ---
  const onboardingDate = useStore((s) => s.profile?.createdAt || new Date().toISOString().split('T')[0]);
  const onboarding = new Date(onboardingDate);
  const todayDate = new Date();
  const daysSinceOnboarding = Math.max(0, Math.floor((todayDate.getTime() - onboarding.getTime()) / (1000 * 60 * 60 * 24)));

  // Gera lista de datas desde o onboarding até hoje (máx 30 dias)
  const lastNDays = Array.from({ length: Math.min(daysSinceOnboarding + 1, 30) }, (_, i) => {
    const d = new Date(onboarding);
    d.setDate(onboarding.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Progresso geral
  const progressData = lastNDays.map((date, idx) => ({
    day: idx + 1,
    pct: habits.length > 0
      ? Math.round((habits.filter(h => h.completions.includes(date)).length / habits.length) * 100)
      : 0,
  }));

  const todayCompleted = habits.filter(h => h.completions.includes(today())).length;
  const completionPct  = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;

  // --- NOVA VISUALIZAÇÃO SEMANAL ---
  // Apenas semana atual em foco
  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() - todayDate.getDay()); // domingo
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  function handleAdd() {
    if (!form.name.trim()) return
    addHabit({ name: form.name, pillar: form.pillar, frequency: form.frequency, xpReward: form.xpReward, icon: form.icon })
    setForm({ name: '', pillar: 'fisico', frequency: 'daily', xpReward: 15, icon: '★' })
    setShowModal(false)
  }

  const ICONS = ['★', '◆', '●', '▲', '■', '◉', '✦', '✚', '▣', '◈', '⬡', '✸']

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto" style={{ animation: 'fadeIn 0.4s ease both' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8 animate-fade-in">
        <div>
          <p className="slabel" style={{ marginBottom: 4 }}>Consistência</p>
          <h1 className="text-2xl md:text-[30px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: P, letterSpacing: '-0.02em', textShadow: '0 0 24px var(--color-primary-glow)' }}>
            Hábitos Diários
          </h1>
          <p style={{ color: TT, fontSize: 13, marginTop: 4 }}>Controle de execução — hábitos, consistência e progresso</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary btn-glow w-full md:w-auto justify-center min-h-[48px]">
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Hoje',         value: `${todayCompleted}/${habits.length}`, sub: 'concluídos' },
          { label: 'Taxa Hoje',    value: `${completionPct}%`,                  sub: 'de conclusão' },
          { label: 'Total Hábitos',value: habits.length,                        sub: 'ativos' },
        ].map((stat, i) => (
          <div key={i} className="rounded-lg p-4 animate-fade-in"
            style={{ background: BG2, border: `1px solid ${PB}`, boxShadow: 'var(--shadow-card)', animationDelay: `${i * 60}ms` }}>
            <p className="slabel" style={{ marginBottom: 4 }}>{stat.label}</p>
            <p className="score-num" style={{ fontSize: 32, fontWeight: 800, color: P, textShadow: '0 0 20px var(--color-primary-glow)' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 11, color: TT, marginTop: 2 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress chart */}
      <HabitosChart progressData={progressData} completionPct={completionPct} />


      {/* Grade de Consistência — NOVA VISUALIZAÇÃO SEMANAL */}
      <div className="rounded-lg p-5 mb-5 animate-fade-in"
        style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)', animationDelay: '240ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: TM, fontWeight: 600, fontSize: 14 }}>Grade de Consistência (Semana Atual)</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs py-1.5">
            <Plus size={13} /> Adicionar
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12" style={{ color: TT }}>
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum hábito criado ainda</p>
            <button onClick={() => setShowModal(true)} className="text-sm mt-2 hover:underline" style={{ color: P }}>
              + Criar primeiro hábito
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-1.5 pr-4 w-32" style={{ fontSize: 10, color: TT, fontWeight: 400 }}>Hábito</th>
                  {weekDates.map((date, i) => (
                    <th key={date} className="text-center py-1.5 px-1" style={{ fontSize: 10, color: TT, fontWeight: 400 }}>
                      {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][i]}
                    </th>
                  ))}
                  <th className="text-right py-1.5 pl-4" style={{ fontSize: 10, color: TT, fontWeight: 400 }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => {
                  const pillarColor = PILLAR_COLORS[habit.pillar];
                  return (
                    <tr key={habit.id} className="group">
                      <td className="py-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 13 }}>{habit.icon || '★'}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af' }} className="truncate max-w-[72px]">{habit.name}</span>
                        </div>
                      </td>
                      {weekDates.map(date => {
                        const done    = habit.completions.includes(date);
                        const isToday = date === today();
                        return (
                          <td key={date} className="py-1 px-0.5">
                            <button
                              onClick={() => toggleHabitCompletion(habit.id, date)}
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                                done ? "bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg" : "bg-transparent",
                                isToday && !done ? "ring-2 ring-emerald-400/60" : ""
                              )}
                              style={{
                                border: done ? '2px solid gold' : `1px solid ${isToday ? pillarColor : BORDER}`,
                                boxShadow: done ? '0 0 12px 2px gold, 0 0 10px #10b981' : 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                color: done ? '#fff' : pillarColor,
                                fontWeight: 700,
                                fontSize: 13,
                                transition: 'all 0.3s cubic-bezier(.4,0,.2,1)'
                              }}
                              title={date}
                            >
                              {done ? (
                                <span className="animate-glow-in">
                                  ✓
                                </span>
                              ) : (
                                <span className="opacity-60">●</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-1 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Flame size={11} style={{ color: P }} />
                          <span style={{ fontSize: 11, color: TM, fontWeight: 700 }}>{getHabitStreak(habit.id)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cards de hábitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {habits.map((habit, i) => {
          const done         = habit.completions.includes(today())
          const streak       = getHabitStreak(habit.id)
          const monthCmpl    = habit.completions.filter(d => last30.includes(d)).length
          const pct          = Math.round((monthCmpl / 30) * 100)
          return (
            <div key={habit.id}
              className="rounded-lg p-4 animate-fade-in card-hover"
              style={{
                background: BG2,
                border: `1px solid ${done ? PB : BORDER}`,
                boxShadow: done ? 'var(--shadow-glow-sm)' : 'var(--shadow-card)',
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: PM, border: `1px solid ${PB}`, fontSize: 18 }}>
                    {habit.icon || '★'}
                  </div>
                  <div>
                    <p style={{ color: TM, fontWeight: 600, fontSize: 14 }}>{habit.name}</p>
                    <PillarBadge pillar={habit.pillar} label={PILLAR_LABELS[habit.pillar]} />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleHabitCompletion(habit.id)} className="transition-all hover:scale-110">
                    <div
  className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300"
  style={{
    background: done ? 'rgba(16,185,129,0.15)' : 'transparent',
    border: `1px solid ${done ? '#10b981' : TT}`,
    boxShadow: done ? '0 0 10px rgba(16,185,129,0.6)' : 'none',
  }}
>
  {done && (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-[checkPop_0.25s_ease-out]"
      style={{ filter: 'drop-shadow(0 0 6px #10b981)' }}
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )}
</div>
                  </button>
                  <button onClick={() => removeHabit(habit.id)}
                    className="transition-colors ml-0.5"
                    style={{ color: TT }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2" style={{ fontSize: 11, color: TT }}>
                <span className="flex items-center gap-1">
                  <Flame size={11} style={{ color: P }} />
                  {streak} dias seguidos
                </span>
                <span>{pct}% este mês</span>
              </div>

              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}

        {/* CTA novo hábito */}
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg p-5 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-all duration-200 hover:scale-[1.02]"
          style={{ border: `1px dashed ${PB}`, color: TT, background: 'transparent' }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--color-primary)'; el.style.color = P; el.style.background = PM }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = PB; el.style.color = TT; el.style.background = 'transparent' }}
        >
          <Plus size={22} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Novo Hábito</span>
        </button>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Hábito">
        <div className="space-y-4">
          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))}
                  className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={form.icon === ic
                    ? { background: P, boxShadow: '0 0 12px var(--color-primary-glow)', transform: 'scale(1.12)' }
                    : { background: BG3, border: `1px solid ${BORDER}` }
                  }
                >{ic}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Nome</label>
            <input className="input" placeholder="Ex: Meditação 10 min" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Pilar</label>
              <select className="input" value={form.pillar} onChange={e => setForm(p => ({ ...p, pillar: e.target.value as Pillar }))}>
                {Object.entries(PILLAR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>XP por dia</label>
              <input type="number" className="input" value={form.xpReward}
                onChange={e => setForm(p => ({ ...p, xpReward: parseInt(e.target.value) || 10 }))} />
            </div>
          </div>

          <button onClick={handleAdd} className="btn-primary w-full justify-center py-3">Criar Hábito</button>
        </div>
      </Modal>
    </div>
  )
}
