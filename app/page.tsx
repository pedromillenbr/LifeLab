'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { CyberInput } from '@/components/ui/CyberInput'
import { FuturisticButton } from '@/components/ui/FuturisticButton'
import { SpotCard } from '@/components/dashboard/SpotCard'
import { AnimatedRadar } from '@/components/dashboard/AnimatedRadar'
import { BibleIllustration } from '@/components/dashboard/BibleIllustration'
import { CreditCard } from '@/components/dashboard/CreditCard'
import { GoalsWidget } from '@/components/metas/GoalsWidget'
import {
  Dumbbell, Wallet, Brain, Activity, BookOpen, CheckSquare,
  ArrowUpRight, Eye, EyeOff, TrendingUp, TrendingDown, Flame,
  Plus, BookMarked, ExternalLink,
  X,
} from 'lucide-react'
import { getGreeting, formatCurrency, today } from '@/lib/utils'
import { getTodayReading, getReadingForDay, getBiblePlan } from '@/lib/bibleData'
import { PEDRO, getTodayMotivation } from '@/lib/pedroProfile'
import {
  divisionForUser, nextDivision, divisionProgress, xpToNextDivision,
} from '@/lib/community/divisions'

export default function DashboardPage() {
  const router = useRouter()
  const {
    profile, habits, weightLog, transactions,
    bibleReadings, activePlanId,
    toggleHabitCompletion, addWeight, getPillarScores,
    getOverallScore, getBalance, getBibleStreak, completeBibleReading,
    getAccessStreak,
  } = useStore()
  const accessStreak = getAccessStreak()

  const [hideBalance, setHideBalance] = useState(false)
  const [radarTab, setRadarTab] = useState<'hoje' | 'mes'>('hoje')
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')

  const scores = getPillarScores()
  const overallScore = getOverallScore()
  const balance = getBalance()

  const totalReceita = transactions.filter(t => t.type === 'receita').reduce((a, t) => a + t.amount, 0)
  const totalDespesa = Math.abs(transactions.filter(t => t.type === 'despesa').reduce((a, t) => a + t.amount, 0))

  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : PEDRO.currentWeight
  const weightProgress = Math.min(100, Math.max(0, Math.round(((currentWeight - 60) / (PEDRO.targetWeight - 60)) * 100)))
  const weightToGoal = +(PEDRO.targetWeight - currentWeight).toFixed(1)

  const bibleStreak = getBibleStreak()
  const todayBibleDone = bibleReadings.some(r => r.date === today() && r.completed && r.planId === activePlanId)
  const userCompletedCount = bibleReadings.filter(r => r.planId === activePlanId && r.completed).length
  const planDuration = getBiblePlan(activePlanId)?.duration ?? 365
  // Day shown reflects the user's real progress: if today is already done,
  // show the day they just completed; otherwise show the next day to read.
  const userPlanDay = Math.max(1, Math.min(planDuration, todayBibleDone ? userCompletedCount : userCompletedCount + 1))
  const todayReading = getReadingForDay(activePlanId, userPlanDay) ?? getTodayReading(activePlanId)
  const yearProgress = Math.min(100, Math.round((userCompletedCount / planDuration) * 100))

  const todayHabitsDone = habits.filter(h => h.completions.includes(today())).length
  const mentalHabits = habits.filter(h => h.pillar === 'mental')
  const mentalCompleted = mentalHabits.filter(h => h.completions.includes(today())).length

  const radarLabels = ['Foco', 'Mental', 'Finanças', 'Disciplina', 'Saúde']
  const radarValues = [scores.produtividade, scores.mental, scores.financeiro, scores.disciplina, scores.fisico]

  function handleAddWeight() {
    const w = parseFloat(newWeight)
    if (!isNaN(w) && w > 0) { addWeight(w); setNewWeight(''); setShowWeightModal(false) }
  }

  const xpPercent = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100))

  // Community division (mirrors what the Comunidade tab shows). Uses
  // accessStreak as a proxy for `days_active` so the day-gate behaves
  // consistently between dashboard and community.
  const totalXP = profile.xp ?? 0
  const division = divisionForUser(totalXP, accessStreak ?? 999)
  const nextDiv = nextDivision(totalXP, accessStreak ?? 999)
  const divPct = Math.round(divisionProgress(totalXP, accessStreak ?? 999) * 100)
  const divToGo = xpToNextDivision(totalXP, accessStreak ?? 999)

  // Mental arc: 0..100 mapped to dasharray (circumference ≈ 175.93 for r=28)
  const arcLen = 2 * Math.PI * 28
  const arcDash = (scores.mental / 100) * arcLen

  // Mental arc full background (the rotating arc shows progress visually)

  return (
    <div className="dash-root" style={{ maxWidth: 1500, margin: '0 auto' }}>
      {/* HEADER */}
      <header className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div className="greeting-v2">
          <h1>{getGreeting()}, <span>{profile.name}</span></h1>
          <p>"{getTodayMotivation()}"</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="streak-pill"
            title="Dias vencendo a si mesmo"
            style={{ cursor: 'help' }}
          >
            <div className="dot" />
            <span className="fire-icon"><Flame size={12} style={{ color: '#f97316' }} /></span>
            {accessStreak} {accessStreak === 1 ? 'dia' : 'dias'}
          </div>
          <div
            className="xp-widget"
            title={nextDiv ? `${divToGo.toLocaleString('pt-BR')} XP para ${nextDiv.short}` : 'Última divisão alcançada'}
            onClick={() => router.push('/comunidade')}
            style={{
              ['--metal' as string]: division.metal,
              ['--metal-glow' as string]: division.glow,
              cursor: 'pointer',
            }}
          >
            <div>
              <div className="xp-label-h">{division.name}</div>
              <div className="xp-nums">
                {totalXP.toLocaleString('pt-BR')}
                {nextDiv ? <span> / {nextDiv.min.toLocaleString('pt-BR')} XP</span> : <span> XP</span>}
              </div>
            </div>
            <div className="xp-bar-wrap-h">
              <div
                className="xp-bar-fill-h"
                style={{
                  width: `${divPct}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${division.metal} 60%, transparent), ${division.metal})`,
                  boxShadow: `0 0 6px ${division.glow}`,
                }}
              />
            </div>
            <div
              className="level-badge"
              style={{
                color: division.metal,
                background: `color-mix(in srgb, ${division.metal} 12%, transparent)`,
                borderColor: `color-mix(in srgb, ${division.metal} 35%, transparent)`,
              }}
            >
              #{division.rank} {division.short}
            </div>
          </div>
        </div>
      </header>

      {/* ROW 1 — KPIs */}
      <div className="grid-3">
        {/* Evolução do Físico */}
        <SpotCard className="green-glow-card fade-up" style={{ animationDelay: '.08s' }} onClick={() => router.push('/fisico')}>
          <div className="card-header">
            <div className="card-title"><Dumbbell size={13} />Evolução do Físico</div>
            <button className="card-action" onClick={(e) => { e.stopPropagation(); router.push('/fisico') }}><ArrowUpRight size={13} /></button>
          </div>
          <div className="big-num">{scores.fisico}<span className="unit">/100</span></div>
          <div className="sub-label">Score de performance</div>
          <div className="prog-row">
            <span className="prog-label">{currentWeight}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-3)', fontFamily: 'Inter' }}>kg</span></span>
            <span className="prog-target">Meta {PEDRO.targetWeight}kg</span>
          </div>
          <div className="prog-wrap"><div className="prog-fill liquid" style={{ width: `${weightProgress}%` }} /></div>
          <div className="prog-caption">{weightToGoal > 0 ? `${weightToGoal}kg para a meta` : 'Meta atingida!'}</div>
        </SpotCard>

        {/* Saldo Atual */}
        <SpotCard className="fade-up" style={{ animationDelay: '.13s' }} onClick={() => router.push('/financeiro')}>
          <div className="card-header">
            <div className="card-title"><Wallet size={13} />Saldo Atual</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="card-action" onClick={(e) => { e.stopPropagation(); setHideBalance(v => !v) }}>
                {hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button className="card-action" onClick={(e) => { e.stopPropagation(); router.push('/financeiro') }}><ArrowUpRight size={13} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <div className="fin-amount" style={{ wordBreak: 'break-word' }}>{hideBalance ? 'R$ ••••••' : formatCurrency(balance)}</div>
              <div className="fin-sub">Receita − Despesas</div>
              <div className="fin-row">
                <div className="fin-item">
                  <label><TrendingUp size={10} />Receita</label>
                  <div className="val pos">{hideBalance ? '••••' : `+${formatCurrency(totalReceita)}`}</div>
                </div>
                <div className="fin-item">
                  <label><TrendingDown size={10} />Despesas</label>
                  <div className="val neg">{hideBalance ? '••••' : `−${formatCurrency(totalDespesa)}`}</div>
                </div>
              </div>
            </div>
            <CreditCard name={profile.name} />
          </div>
        </SpotCard>

        {/* Foco Mental */}
        <SpotCard className="green-glow-card fade-up" style={{ animationDelay: '.18s' }} onClick={() => router.push('/habitos')}>
          <div className="card-header">
            <div className="card-title"><Brain size={13} />Foco Mental</div>
            <button className="card-action" onClick={(e) => { e.stopPropagation(); router.push('/habitos') }}><ArrowUpRight size={13} /></button>
          </div>
          <div className="mental-wrap">
            <div className="arc-wrap">
              <svg width="86" height="86" viewBox="-8 -8 86 86">
                <circle className="arc-bg" cx="35" cy="35" r="28" />
                <g className="arc-group">
                  <circle
                    className="arc-fill"
                    cx="35" cy="35" r="28"
                    style={{ strokeDasharray: `${arcDash} ${arcLen}` }}
                  />
                </g>
              </svg>
            </div>
            <div>
              <div className="mental-num">{scores.mental}<span className="unit">/100</span></div>
              <div className="sub-label">Score atual</div>
            </div>
          </div>
          <div className="habit-row">
            <span className="habit-label">Hábitos Mentais hoje</span>
            <span className="habit-val">{mentalCompleted}/{Math.max(mentalHabits.length, 1)}</span>
          </div>
        </SpotCard>
      </div>

      {/* ROW 2 — Radar + Bible */}
      <div className="grid-2">
        <SpotCard className="fade-up" style={{ animationDelay: '.22s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="card-title" style={{ fontSize: 13, textTransform: 'none', letterSpacing: 0, color: 'var(--text-1)' }}>
              <Activity size={14} style={{ color: 'var(--green)' }} />Radar de Performance
            </div>
            <div className="tab-group">
              <button className={`tab-btn ${radarTab === 'hoje' ? 'active' : ''}`} onClick={() => setRadarTab('hoje')}>Hoje</button>
              <button className={`tab-btn ${radarTab === 'mes' ? 'active' : ''}`} onClick={() => setRadarTab('mes')}>Mês</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}>
            <AnimatedRadar values={radarValues} labels={radarLabels} score={overallScore} />
          </div>
        </SpotCard>

        <SpotCard className="gold-glow-card fade-up" style={{ animationDelay: '.27s', minHeight: 240 }} onClick={() => router.push('/espiritual')}>
          <div className="card-header">
            <div className="card-title"><BookOpen size={13} />Leitura do Dia</div>
            <div className="streak-chip"><Flame size={10} />{bibleStreak} dias</div>
          </div>
          <div className="bible-card-inner">
            <div className="bible-card-left">
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.5px' }}>{todayReading?.label ?? '—'}</div>
                  {todayReading && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>Dia {todayReading.day}</div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>Plano NT 1 Ano</div>
                <div style={{ marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Progresso anual</span>
                  <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, fontFamily: 'var(--mono)' }}>{yearProgress}%</span>
                </div>
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <div className="prog-wrap" style={{ marginBottom: 0 }}>
                    <div className="prog-fill gold-liquid" style={{ width: `${yearProgress}%` }} />
                  </div>
                </div>
              </div>
              <button
                className="primary-btn"
                style={{ width: 'auto', paddingLeft: 20, paddingRight: 20 }}
                disabled={todayBibleDone}
                onClick={(e) => {
                  e.stopPropagation()
                  if (todayReading && !todayBibleDone) completeBibleReading(today(), activePlanId, todayReading.label)
                }}
              >
                <BookMarked size={14} />{todayBibleDone ? 'Leitura Concluída' : 'Marcar como lido'}
              </button>
            </div>
            <div className="bible-card-right">
              <div
                style={{ cursor: 'pointer', transition: 'transform .2s', display: 'inline-flex', position: 'relative' }}
                title="Abrir leitura"
                onClick={(e) => { e.stopPropagation(); router.push('/espiritual') }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <BibleIllustration />
                <div style={{
                  position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(var(--color-accent-rgb), 0.15)', border: '1px solid rgba(var(--color-accent-rgb), 0.3)',
                  borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 600,
                  color: 'var(--gold)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <ExternalLink size={9} />Abrir
                </div>
              </div>
            </div>
          </div>
        </SpotCard>
      </div>

      {/* ROW 3 — Goals + Habits */}
      <div className="grid-2">
        {/* Metas (long-term) */}
        <SpotCard className="fade-up" style={{ animationDelay: '.31s' }}>
          <GoalsWidget />
        </SpotCard>

        {/* Habits */}
        <SpotCard className="fade-up" style={{ animationDelay: '.36s' }} id="habits-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div
              className="card-title"
              style={{ fontSize: 13, textTransform: 'none', letterSpacing: 0, color: 'var(--text-1)', cursor: 'pointer' }}
              onClick={() => router.push('/habitos')}
            >
              <CheckSquare size={14} style={{ color: 'var(--green)' }} />Hábitos de Hoje
              <ArrowUpRight size={12} style={{ color: 'var(--text-3)', marginLeft: 2 }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
              {todayHabitsDone}/{habits.length}
            </span>
          </div>
          {habits.length === 0 && (
            <div className="empty-state">
              <p>Nenhum hábito cadastrado</p>
              <a onClick={() => router.push('/habitos')}>+ Adicionar hábito</a>
            </div>
          )}
          {habits.slice(0, 6).map(h => {
            const done = h.completions.includes(today())
            return (
              <div key={h.id} className={`habit-item ${done ? 'done' : ''}`} onClick={() => toggleHabitCompletion(h.id)}>
                <span className="habit-name">{h.name}</span>
                <div className="habit-toggle">
                  <div className="habit-toggle-knob" />
                </div>
              </div>
            )
          })}
        </SpotCard>
      </div>

      {/* Weight Modal */}
      <Modal open={showWeightModal} onClose={() => setShowWeightModal(false)} title="Registrar Peso">
        <div className="space-y-4">
          <CyberInput
            type="number" step="0.1" variant="mono" placeholder="63.5"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddWeight()}
          />
          <p className="text-xs text-gray-600 text-center">Meta: {PEDRO.targetWeight}kg • Atual: {currentWeight}kg</p>
          <FuturisticButton variant="primary" fullWidth onClick={handleAddWeight}>
            Salvar Peso
          </FuturisticButton>
        </div>
      </Modal>
    </div>
  )
}
