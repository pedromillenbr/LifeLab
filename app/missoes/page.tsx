'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckCircle2, Circle, Plus, Trash2, Zap, Target, ChevronLeft, ChevronRight, Flame, Trophy } from 'lucide-react'
import { cn, PILLAR_LABELS, PILLAR_COLORS, today } from '@/lib/utils'
import { Pillar } from '@/store/types'
import { motion, AnimatePresence } from 'framer-motion'

const P = 'var(--color-primary)'
const PM = 'var(--color-primary-muted)'
const PB = 'var(--color-primary-border)'
const BG1 = 'var(--color-bg-1)'
const BG2 = 'var(--color-bg-2)'
const BORDER = 'var(--color-border)'
const TM = 'var(--color-text-main)'
const TT = 'var(--color-text-muted)'

export default function MissoesPage() {
  const { missions, addMission, removeMission, toggleMission, profile } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(today())
  const [form, setForm] = useState({ title: '', xpReward: 10, pillar: 'fisico' as Pillar })

  const dayMissions = missions.filter(m => m.date === selectedDate)
  const completed = dayMissions.filter(m => m.completed).length
  const totalXP = dayMissions.filter(m => m.completed).reduce((a, m) => a + m.xpReward, 0)
  const pct = dayMissions.length > 0 ? Math.round((completed / dayMissions.length) * 100) : 0

  function navigateDay(dir: number) {
    const d = new Date(selectedDate); d.setDate(d.getDate() + dir)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  function formatDay(ds: string) {
    const d = new Date(ds + 'T12:00:00')
    const t = today()
    if (ds === t) return 'Hoje'
    const y = new Date(); y.setDate(y.getDate() - 1)
    if (ds === y.toISOString().split('T')[0]) return 'Ontem'
    const tm = new Date(); tm.setDate(tm.getDate() + 1)
    if (ds === tm.toISOString().split('T')[0]) return 'Amanhã'
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })
  }

  function handleAdd() {
    if (!form.title.trim()) return
    addMission({ title: form.title, date: selectedDate, completed: false, xpReward: form.xpReward, pillar: form.pillar })
    setForm({ title: '', xpReward: 10, pillar: 'fisico' })
    setShowModal(false)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 3 + i)
    const ds = d.toISOString().split('T')[0]
    const dayMs = missions.filter(m => m.date === ds)
    const done = dayMs.filter(m => m.completed).length
    return { date: ds, total: dayMs.length, done, pct: dayMs.length > 0 ? Math.round((done / dayMs.length) * 100) : 0 }
  })

  const byPillar = Object.entries(PILLAR_LABELS).map(([key, label]) => {
    const ms = missions.filter(m => m.pillar === key)
    const done = ms.filter(m => m.completed).length
    return { key, label, total: ms.length, done }
  }).filter(p => p.total > 0)

  const totalMissionsAllTime = missions.length
  const totalCompleted = missions.filter(m => m.completed).length
  const totalXPAllTime = missions.filter(m => m.completed).reduce((a, m) => a + m.xpReward, 0)

  return (
    <motion.div
      className="p-4 md:p-6 max-w-[1400px] mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <p className="slabel" style={{ marginBottom: 4 }}>Objetivos</p>
          <motion.h1
            className="text-2xl md:text-[30px] flex flex-wrap items-baseline gap-x-3"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: TM, letterSpacing: '-0.02em', textShadow: '0 0 24px var(--color-primary-glow)' }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            Missões
            <span className="text-sm font-normal px-2 py-1 rounded-lg" style={{ background: `${P}15`, border: `1px solid ${P}30`, color: P }}>
              Nível {profile.level}
            </span>
          </motion.h1>
          <p style={{ color: TT, fontSize: 13, marginTop: 4 }}>Suas tarefas e objetivos diários</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: `${P}10`, border: `1px solid ${P}25` }}>
            <Flame size={15} style={{ color: P, filter: `drop-shadow(0 0 6px ${P}60)` }} />
            <span className="text-sm font-bold score-num" style={{ color: TM }}>{profile.xp}</span>
            <span className="text-xs" style={{ color: TT }}>XP total</span>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nova Missão
          </Button>
        </div>
      </div>

      {/* All-time stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Missões', value: totalMissionsAllTime, color: 'var(--color-primary)', icon: Target },
          { label: 'Concluídas', value: totalCompleted, color: 'var(--color-primary)', icon: CheckCircle2 },
          { label: 'XP Ganho', value: `${totalXPAllTime}`, color: 'var(--color-primary)', icon: Zap, suffix: ' XP' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 animate-fade-in"
            style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: `1px solid ${s.color}20`, animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: s.color }} />
              <p className="text-xs text-gray-600">{s.label}</p>
            </div>
            <p className="text-3xl font-black score-num" style={{ color: s.color }}>{s.value}{s.suffix || ''}</p>
          </div>
        ))}
      </div>

      {/* Weekly overview */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-5 animate-fade-in" style={{ animationDelay: '180ms' }}>
        {weekDays.map(day => {
          const isSelected = day.date === selectedDate
          const isToday = day.date === today()
          return (
            <button key={day.date} onClick={() => setSelectedDate(day.date)}
              className="rounded-xl md:rounded-2xl p-2 md:p-3 text-center transition-all duration-200 active:scale-95"
              style={{
                background: isSelected ? 'var(--color-primary)12' : 'linear-gradient(145deg, #141414, #0e0e0e)',
                border: isSelected ? '1px solid var(--color-primary)40' : '1px solid #1e1e1e',
                boxShadow: isSelected ? '0 0 16px var(--color-primary)15' : 'none',
              }}
            >
              <p className="text-[10px] text-gray-600 mb-1 capitalize">
                {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
              </p>
              <p className="text-lg font-black" style={{ color: isToday ? 'var(--color-primary)' : isSelected ? '#fff' : '#9ca3af' }}>
                {new Date(day.date + 'T12:00:00').getDate()}
              </p>
              <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${day.pct}%`, background: 'var(--color-primary)', boxShadow: day.pct > 0 ? '0 0 6px var(--color-primary)60' : 'none' }} />
              </div>
              {day.total > 0 && <p className="text-[10px] text-gray-600 mt-1">{day.done}/{day.total}</p>}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main list */}
        <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '240ms' }}>
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => navigateDay(-1)} className="text-gray-600 hover:text-white transition-colors w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                  <ChevronLeft size={16} />
                </button>
                <h3 className="text-white font-semibold capitalize">{formatDay(selectedDate)}</h3>
                <button onClick={() => navigateDay(1)} className="text-gray-600 hover:text-white transition-colors w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                {totalXP > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: 'var(--color-primary)15', border: '1px solid var(--color-primary)30', color: 'var(--color-primary)' }}>
                    <Zap size={11} /> +{totalXP} XP
                  </div>
                )}
                <span className="text-xs text-gray-600">{completed}/{dayMissions.length}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="progress-bar h-1.5 mb-5">
              <div className="progress-fill h-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'var(--color-primary)', boxShadow: '0 0 8px var(--color-primary)50' }} />
            </div>

            <div className="space-y-2">
              {dayMissions.length === 0 && (
                <div className="text-center py-14">
                  <Target size={40} className="mx-auto mb-3 opacity-20 text-gray-600" />
                  <p className="text-gray-600 text-sm">Nenhuma missão para {formatDay(selectedDate)}</p>
                  <button onClick={() => setShowModal(true)} className="text-primary text-sm mt-2 hover:underline">+ Adicionar missão</button>
                </div>
              )}
              {dayMissions.map(mission => {
                const pillarColor = mission.pillar ? PILLAR_COLORS[mission.pillar] : 'var(--color-primary)'
                return (
                  <div key={mission.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group"
                    style={{
                      background: mission.completed ? 'var(--color-primary)08' : '#111',
                      border: mission.completed ? '1px solid var(--color-primary)28' : '1px solid #1a1a1a',
                    }}
                    onMouseEnter={e => { if (!mission.completed) e.currentTarget.style.background = '#ffffff04' }}
                    onMouseLeave={e => { if (!mission.completed) e.currentTarget.style.background = '#111' }}
                  >
                    <button onClick={() => toggleMission(mission.id)} className="flex-shrink-0 transition-transform hover:scale-110">
                      {mission.completed
                        ? <CheckCircle2 size={20} style={{ color: 'var(--color-primary)', filter: 'drop-shadow(0 0 5px var(--color-primary)60)' }} />
                        : <Circle size={20} className="text-gray-600 hover:text-gray-400 transition-colors" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium text-sm', mission.completed ? 'line-through text-gray-600' : 'text-white')}>
                        {mission.title}
                      </p>
                      {mission.pillar && (
                        <span className="text-[10px] mt-0.5" style={{ color: `${pillarColor}bb` }}>
                          {PILLAR_LABELS[mission.pillar]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                        <Zap size={9} className="text-yellow-500" /> {mission.xpReward}
                      </span>
                      <button onClick={() => removeMission(mission.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all ml-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={() => setShowModal(true)}
              className="w-full mt-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-all duration-200"
              style={{ border: '1px dashed #2a2a2a' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)40')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
            >
              <Plus size={15} /> Adicionar Missão
            </button>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          {/* Circular progress */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Trophy size={15} className="text-yellow-400" /> Progresso de Hoje
            </h3>
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
                <circle cx="56" cy="56" r="46" fill="none" stroke="#1e1e1e" strokeWidth="8" />
                <circle cx="56" cy="56" r="46" fill="none" stroke="var(--color-primary)" strokeWidth="8"
                  strokeDasharray={`${(pct / 100) * 289} 289`} strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 6px var(--color-primary)60)', transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white score-num">{pct}%</span>
                <span className="text-[10px] text-gray-600">{completed}/{dayMissions.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-primary)0a', border: '1px solid var(--color-primary)20' }}>
                <p className="text-2xl font-black score-num text-green-400">{completed}</p>
                <p className="text-[10px] text-gray-600">Concluídas</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-primary)0a', border: '1px solid var(--color-primary)20' }}>
                <p className="text-2xl font-black score-num text-yellow-400">{totalXP}</p>
                <p className="text-[10px] text-gray-600">XP ganho</p>
              </div>
            </div>
          </div>

          {/* By pillar */}
          {byPillar.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-semibold mb-4">Por Pilar</h3>
              <div className="space-y-3">
                {byPillar.map(({ key, label, total, done }) => {
                  const color = PILLAR_COLORS[key]
                  const p = total > 0 ? Math.round((done / total) * 100) : 0
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: `${color}cc` }}>{label}</span>
                        <span className="text-gray-600">{done}/{total}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${p}%`, background: color, boxShadow: `0 0 6px ${color}50` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nova Missão">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Título</label>
            <input className="input" placeholder="Descreva sua missão..." value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Pilar</label>
              <select className="input" value={form.pillar} onChange={e => setForm(p => ({ ...p, pillar: e.target.value as Pillar }))}>
                {Object.entries(PILLAR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">XP Reward</label>
              <input type="number" className="input" value={form.xpReward}
                onChange={e => setForm(p => ({ ...p, xpReward: parseInt(e.target.value) || 10 }))} />
            </div>
          </div>
          <button onClick={handleAdd} className="btn-primary w-full justify-center py-3">Criar Missão</button>
        </div>
      </Modal>
    </motion.div>
  )
}
