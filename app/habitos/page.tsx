'use client'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Badge, PillarBadge } from '@/components/ui/Badge'
import dynamic from 'next/dynamic'
import { Plus, CheckCircle2, Circle, Trash2, Flame, TrendingUp } from 'lucide-react'
import { cn, PILLAR_LABELS, PILLAR_COLORS, today, computeHabitXP } from '@/lib/utils'
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
  const [form, setForm] = useState({ name: '', pillar: 'fisico' as Pillar, frequency: 'daily' as const, icon: '★' })
  const autoXP = computeHabitXP(form.name, form.pillar, form.frequency)


  // --- NOVA LÓGICA: datas relativas ao onboarding ---
  const onboardingDate = useStore((s) => s.profile?.createdAt || new Date().toISOString().split('T')[0]);
  const onboarding = new Date(onboardingDate);
  const todayDate = new Date();
  const daysSinceOnboarding = Math.max(0, Math.floor((todayDate.getTime() - onboarding.getTime()) / (1000 * 60 * 60 * 24)));

  // Gera lista de datas desde o onboarding até hoje (máx 30 dias) — usada nos cards "este mês"
  const lastNDays = Array.from({ length: Math.min(daysSinceOnboarding + 1, 30) }, (_, i) => {
    const d = new Date(onboarding);
    d.setDate(onboarding.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Janela fixa de 30 dias para o gráfico — garante que as ondas
  // sempre rendam mesmo quando o onboarding é recente.
  const CHART_WINDOW = 30;
  const chartDates = Array.from({ length: CHART_WINDOW }, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - (CHART_WINDOW - 1 - i));
    return d.toISOString().split('T')[0];
  });

  // Progresso geral (sempre 30 pontos)
  const progressData = chartDates.map((date, idx) => ({
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
    const xp = computeHabitXP(form.name, form.pillar, form.frequency)
    addHabit({ name: form.name, pillar: form.pillar, frequency: form.frequency, xpReward: xp, icon: form.icon })
    setForm({ name: '', pillar: 'fisico', frequency: 'daily', icon: '★' })
    setShowModal(false)
  }

  // Sugestões pré-definidas (apenas para novos usuários — sem hábitos).
  // Usa imagens Apple (emoji-datasource-apple via jsdelivr) para evitar
  // o pacote de emojis do Windows (Segoe UI Emoji).
  const HABIT_SUGGESTIONS: { name: string; emoji: string; pillar: Pillar }[] = [
    { name: 'Academia',     emoji: '🏋️', pillar: 'fisico' },
    { name: 'Acordar cedo', emoji: '🌅', pillar: 'disciplina' },
    { name: 'Estudar',      emoji: '📚', pillar: 'produtividade' },
    { name: 'Ler',          emoji: '📖', pillar: 'mental' },
    { name: 'Meditar',      emoji: '🧘', pillar: 'mental' },
    { name: 'Corrida',      emoji: '🏃', pillar: 'fisico' },
    { name: 'Futebol',      emoji: '⚽', pillar: 'fisico' },
    { name: 'Beber água',   emoji: '💧', pillar: 'fisico' },
    { name: 'Dormir bem',   emoji: '😴', pillar: 'disciplina' },
    { name: 'Orar',         emoji: '🙏', pillar: 'espiritual' },
  ]
  const isOnboarding = habits.length === 0

  function appleEmojiUrl(emoji: string) {
    const codes: string[] = []
    for (const ch of emoji) codes.push(ch.codePointAt(0)!.toString(16))
    return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/${codes.join('-')}.png`
  }

  function handleAddSuggestion(s: { name: string; emoji: string; pillar: Pillar }) {
    const xp = computeHabitXP(s.name, s.pillar, 'daily')
    addHabit({ name: s.name, pillar: s.pillar, frequency: 'daily', xpReward: xp, icon: '★' })
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto" style={{ animation: 'fadeIn 0.4s ease both' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8 animate-fade-in">
        <div>
          <p className="slabel" style={{ marginBottom: 4 }}>Consistência</p>
          <h1 className="page-title">Hábitos Diários</h1>
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
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th className="text-left py-3 pr-4" style={{ fontSize: 11, color: TT, fontWeight: 500, width: '140px' }}>Hábito</th>
                  {weekDates.map((date, i) => {
                    const d = new Date(date);
                    const dayNum = d.getDate();
                    return (
                      <th key={date} className="text-center py-3 px-2" style={{ fontSize: 11, color: TT, fontWeight: 500 }}>
                        <div style={{ fontWeight: 600, fontSize: 10 }}>{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][i]}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{dayNum}</div>
                      </th>
                    );
                  })}
                  <th className="text-right py-3 pl-4" style={{ fontSize: 11, color: TT, fontWeight: 500 }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => {
                  const pillarColor = PILLAR_COLORS[habit.pillar];
                  return (
                    <tr key={habit.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 14 }}>{habit.icon || '★'}</span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }} className="truncate max-w-[100px]">{habit.name}</span>
                        </div>
                      </td>
                      {weekDates.map(date => {
                        const done    = habit.completions.includes(date);
                        const isToday = date === today();
                        return (
                          <td key={date} className="py-3 px-2 text-center">
                            <button
                              onClick={() => toggleHabitCompletion(habit.id, date)}
                              className="mx-auto block w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                              style={{
                                background: done ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' : 'transparent',
                                border: done ? '2px solid rgba(250,204,21,0.7)' : isToday ? `2px solid ${pillarColor}` : `1px solid rgba(255,255,255,0.1)`,
                                boxShadow: done ? '0 0 12px rgba(var(--color-accent-rgb), 0.5), 0 0 8px rgba(var(--color-primary-rgb), 0.4)' : isToday ? `0 0 8px ${pillarColor}40` : 'none',
                                color: done ? '#fff' : 'rgba(255,255,255,0.4)',
                                fontWeight: 800,
                                fontSize: '16px',
                                cursor: 'pointer'
                              }}
                              title={date}
                            >
                              {done ? (
                                <span className="animate-check-pop">✓</span>
                              ) : (
                                <span>●</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-3 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Flame size={13} style={{ color: P }} />
                          <span style={{ fontSize: 12, color: TM, fontWeight: 700 }}>{getHabitStreak(habit.id)}</span>
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
          const monthCmpl    = habit.completions.filter(d => lastNDays.includes(d)).length
          const pct          = lastNDays.length > 0 ? Math.round((monthCmpl / lastNDays.length) * 100) : 0
          return (
            <div key={habit.id}
              className="rounded-lg p-4 animate-fade-in card-hover transition-all duration-300"
              style={{
                background: BG2,
                border: `1px solid ${done ? 'rgba(var(--color-accent-rgb), 0.4)' : BORDER}`,
                boxShadow: done ? '0 0 20px rgba(var(--color-accent-rgb), 0.2), var(--shadow-glow-sm)' : 'var(--shadow-card)',
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{ 
                      background: done ? 'rgba(var(--color-accent-rgb), 0.15)' : PM, 
                      border: `1px solid ${done ? 'rgba(var(--color-accent-rgb), 0.5)' : PB}`, 
                      fontSize: 18,
                      boxShadow: done ? '0 0 12px rgba(var(--color-accent-rgb), 0.3)' : 'none'
                    }}>
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
    background: done ? 'rgba(var(--color-accent-rgb), 0.2)' : 'transparent',
    border: `1px solid ${done ? 'var(--gold)' : TT}`,
    boxShadow: done ? '0 0 12px 2px rgba(var(--color-accent-rgb), 0.5), 0 0 8px var(--color-primary)' : 'none',
  }}
>
  {done && (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-check-pop"
      style={{ filter: 'drop-shadow(0 0 6px var(--gold))' }}
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="var(--gold)"
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
          {isOnboarding && (
            <div>
              <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 8 }}>
                Sugestões rápidas
              </label>
              <div className="flex flex-wrap gap-2">
                {HABIT_SUGGESTIONS.map(s => (
                  <button
                    key={s.name}
                    onClick={() => handleAddSuggestion(s)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 hover:scale-105"
                    style={{
                      background: BG3,
                      border: `1px solid ${PB}`,
                      color: TM,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.background = PM
                      el.style.borderColor = P
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.background = BG3
                      el.style.borderColor = PB
                    }}
                  >
                    <img
                      src={appleEmojiUrl(s.emoji)}
                      alt=""
                      width={16}
                      height={16}
                      style={{ display: 'inline-block', verticalAlign: 'middle' }}
                    />
                    <span>{s.name}</span>
                    <Plus size={11} style={{ color: P }} />
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: TT, marginTop: 8 }}>
                Toque para adicionar ou crie um personalizado abaixo.
              </p>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '14px 0 4px' }} />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Nome</label>
            <input className="input" placeholder="Ex: Meditação 10 min" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Evolução</label>
            <Select
              value={form.pillar}
              onChange={(v) => setForm(p => ({ ...p, pillar: v as Pillar }))}
              options={Object.entries(PILLAR_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
          </div>

          <div
            className="flex items-center justify-between rounded-lg px-3 py-2.5"
            style={{
              background: BG3,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={13} style={{ color: P }} />
              <span style={{ fontSize: 12, color: TT }}>XP automático</span>
            </div>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 13, fontWeight: 700, color: P, fontFamily: 'var(--font-jetbrains)' }}>
                +{autoXP}
              </span>
              <span style={{ fontSize: 10, color: TT, fontFamily: 'var(--font-jetbrains)' }}>
                XP / {form.frequency === 'daily' ? 'dia' : form.frequency === 'weekly' ? 'sem' : 'mês'}
              </span>
            </div>
          </div>

          <button onClick={handleAdd} className="btn-primary w-full justify-center py-3">Criar Hábito</button>
        </div>
      </Modal>
    </div>
  )
}
