'use client'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ExerciseSelector } from '@/components/ui/ExerciseSelector'
import dynamic from 'next/dynamic'
import {
  Dumbbell, Scale, TrendingDown, TrendingUp, Plus, Play,
  Pencil, Trash2, Check, X, ChevronRight, Zap, Timer
} from 'lucide-react'
import { cn, today } from '@/lib/utils'
import { WorkoutRoutine, Exercise, WorkoutSet } from '@/store/types'
import { ExerciseTemplate, MUSCLE_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/exercises'
import { NumberDrum } from '@/components/ui/NumberDrum'
import { PEDRO } from '@/lib/pedroProfile'

const FisicoCharts = dynamic(() => import('./FisicoCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl h-[248px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="rounded-2xl h-[248px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  ),
})

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

const WEIGHT_VALUES = Array.from({ length: 201 }, (_, i) => i)
const REPS_VALUES = Array.from({ length: 51 }, (_, i) => i)

type Tab = 'dashboard' | 'rotinas' | 'estatisticas'

export default function FisicoPage() {
  const {
    weightLog, addWeight, routines, addRoutine, removeRoutine,
    updateRoutine, workoutSessions, addWorkoutSession, getPillarScores
  } = useStore()

  const [tab, setTab] = useState<Tab>('dashboard')
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [newRoutineName, setNewRoutineName] = useState('')
  const [draftExercises, setDraftExercises] = useState<Exercise[]>([])
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null)
  const [workoutSets, setWorkoutSets] = useState<Record<string, WorkoutSet[]>>({})
  const [workoutTime, setWorkoutTime] = useState(0)
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null)
  const [showEditSelector, setShowEditSelector] = useState(false)

  const scores = getPillarScores()
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : PEDRO.currentWeight
  const prevWeight = weightLog.length > 1 ? weightLog[weightLog.length - 2].weight : currentWeight
  const weightDiff = parseFloat((currentWeight - prevWeight).toFixed(1))
  const weightToGoal = parseFloat((PEDRO.targetWeight - currentWeight).toFixed(1))

  const weekSessions = workoutSessions.filter(s => {
    const d = new Date(s.date)
    return (Date.now() - d.getTime()) < 7 * 86400000
  })
  const weeklyVolume = weekSessions.reduce((a, s) => a + s.volume, 0)

  const volumeChartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().split('T')[0]
    const vol = workoutSessions.filter(s => s.date === ds).reduce((a, s) => a + s.volume, 0)
    return { day: d.toLocaleDateString('pt-BR', { weekday: 'short' }), vol: Math.round(vol / 100) / 10 }
  })

  const weightChartData = weightLog.slice(-14).map(w => ({ date: w.date.slice(5), peso: w.weight }))

  const frequencyDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (27 - i))
    const ds = d.toISOString().split('T')[0]
    return { date: ds, trained: workoutSessions.some(s => s.date === ds) }
  })

  // Muscle volume heatmap
  const muscleVol: Record<string, number> = {}
  workoutSessions.slice(0, 10).forEach(s =>
    s.exercises?.forEach(e => {
      const v = e.sets.filter(x => x.completed).reduce((a, x) => a + x.reps * x.weight, 0)
      muscleVol[e.muscleGroup] = (muscleVol[e.muscleGroup] || 0) + v
    })
  )
  const maxMuscleVol = Math.max(...Object.values(muscleVol), 1)

  function handleAddWeight() {
    const w = parseFloat(newWeight)
    if (!isNaN(w) && w > 0) { addWeight(w); setNewWeight(''); setShowWeightModal(false) }
  }

  function handleSelectExercise(ex: ExerciseTemplate) {
    const newEx: Exercise = {
      id: genId(), name: ex.name, muscleGroup: ex.muscle,
      sets: Array.from({ length: ex.defaultSets }, () => ({
        id: genId(), reps: ex.defaultReps, weight: ex.defaultWeight, completed: false
      }))
    }
    setDraftExercises(prev => [...prev, newEx])
  }

  function handleEditSelectExercise(ex: ExerciseTemplate) {
    if (!editingRoutine) return
    const newEx: Exercise = {
      id: genId(), name: ex.name, muscleGroup: ex.muscle,
      sets: Array.from({ length: ex.defaultSets }, () => ({
        id: genId(), reps: ex.defaultReps, weight: ex.defaultWeight, completed: false
      }))
    }
    const updated = { ...editingRoutine, exercises: [...editingRoutine.exercises, newEx] }
    setEditingRoutine(updated)
    updateRoutine(editingRoutine.id, updated)
  }

  function removeDraftExercise(id: string) { setDraftExercises(prev => prev.filter(e => e.id !== id)) }

  function handleAddRoutine() {
    if (!newRoutineName.trim()) return
    addRoutine({ name: newRoutineName, exercises: draftExercises })
    setNewRoutineName(''); setDraftExercises([]); setShowRoutineModal(false)
  }

  function startWorkout(routine: WorkoutRoutine) {
    setActiveWorkout(routine)
    const sets: Record<string, WorkoutSet[]> = {}
    routine.exercises.forEach(e => { sets[e.id] = e.sets.map(s => ({ ...s, completed: false })) })
    setWorkoutSets(sets)
    setWorkoutTime(0)
  }

  function toggleSet(exerciseId: string, setId: string) {
    setWorkoutSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
    }))
  }

  function updateSetValue(exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) {
    setWorkoutSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(s => s.id === setId ? { ...s, [field]: value } : s)
    }))
  }

  function finishWorkout() {
    if (!activeWorkout) return
    const exercises = activeWorkout.exercises.map(e => ({ ...e, sets: workoutSets[e.id] || e.sets }))
    const volume = exercises.reduce((a, e) =>
      a + e.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0)
    addWorkoutSession({ routineId: activeWorkout.id, routineName: activeWorkout.name, date: today(), duration: 60, exercises, volume })
    setActiveWorkout(null); setWorkoutSets({})
  }

  const totalSeries = activeWorkout
    ? Object.values(workoutSets).reduce((a, sets) => a + sets.length, 0)
    : 0
  const completedSeries = activeWorkout
    ? Object.values(workoutSets).reduce((a, sets) => a + sets.filter(s => s.completed).length, 0)
    : 0

  return (
    <div className="p-6 max-w-[1400px] mx-auto" style={{ animation: 'fadeIn 0.4s ease both' }}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between animate-fade-in">
        <div>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--fg3)' }}>Pilar</p>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.025em', color: 'var(--color-primary)', textShadow: '0 0 24px var(--color-primary-border)' }}>
              Pilar Físico
            </h1>
            <div className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--color-primary)15', color: 'var(--color-primary)', border: '1px solid var(--color-primary)30', fontFamily: "'JetBrains Mono', monospace" }}>
              +{weightToGoal}kg
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--fg3)' }}>Treino e performance · {PEDRO.trainingDaysPerWeek}x por semana</p>
        </div>
        <button onClick={() => setShowWeightModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{ background: 'var(--bg2)', border: '1px solid var(--color-primary-border)', color: 'var(--color-primary)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-3)'; e.currentTarget.style.borderColor = 'var(--color-primary-border)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.borderColor = 'var(--color-primary-border)' }}
        >
          <Plus size={14} /> Registrar Peso
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Score */}
        <div className="card-glow-hover animate-fade-in rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid var(--color-primary-border)', animationDelay: '60ms' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 120, height: 120, background: 'var(--color-bg-3)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div className="slabel">Score Físico</div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="score-num" style={{ fontSize: 42, color: 'var(--color-primary)', textShadow: '0 0 20px var(--color-primary-border)' }}>{scores.fisico}</span>
                <span style={{ fontSize: 18, color: 'var(--fg3)', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>/100</span>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--fg3)' }}>{weekSessions.length} treinos esta semana</p>
              <div className="slabel" style={{ marginBottom: 4 }}>Meta do pilar</div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${Math.min(100, (scores.fisico / PEDRO.pillarsTarget.fisico) * 100)}%`, background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary))', boxShadow: '0 0 8px var(--color-primary-border)' }} />
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'var(--fg3)' }}>{scores.fisico}</span>
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'var(--fg3)' }}>{PEDRO.pillarsTarget.fisico}</span>
              </div>
            </div>
            {/* Large circular ring */}
            <div style={{ position: 'relative', width: 112, height: 112, flexShrink: 0 }}>
              <svg width="112" height="112" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                <circle cx="56" cy="56" r="46" fill="none" stroke="var(--color-primary)" strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - scores.fisico / 100)}`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', filter: 'drop-shadow(0 0 6px var(--color-primary-border))', transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', textShadow: '0 0 12px var(--color-primary-border)' }}>{scores.fisico}</span>
                <span style={{ fontSize: 10, color: 'var(--fg3)', fontFamily: "'JetBrains Mono',monospace" }}>/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Peso */}
        <div className="card-glow-hover animate-fade-in rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid var(--color-primary-border)', animationDelay: '120ms' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'var(--color-bg-3)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div className="slabel">Peso Atual</div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="score-num" style={{ fontSize: 42, color: 'var(--color-primary)', textShadow: '0 0 20px var(--color-primary-border)' }}>{currentWeight}</span>
              <span style={{ fontSize: 16, color: 'var(--fg2)' }}>KG</span>
            </div>
            <div className="text-right">
              <p style={{ fontSize: 12, color: 'var(--fg3)' }}>Meta: {PEDRO.targetWeight}kg</p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>+{weightToGoal}kg</p>
              <p style={{ fontSize: 11, color: 'var(--fg3)' }}>para o objetivo</p>
            </div>
          </div>
          <div className={cn('flex items-center gap-1.5 text-sm mb-3', weightDiff > 0 ? 'text-green-400' : 'text-red-400')} style={{ fontSize: 12 }}>
            {weightDiff > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {weightDiff > 0 ? '+' : ''}{weightDiff} kg esta semana
          </div>
          <div className="xp-bar mb-3">
            <div className="xp-fill" style={{ width: `${Math.min(100, ((currentWeight - 60) / (PEDRO.targetWeight - 60)) * 100)}%`, background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary))', boxShadow: '0 0 8px var(--color-primary-border)' }} />
          </div>
          <button onClick={() => setShowWeightModal(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition-all duration-200"
            style={{ background: 'var(--color-primary-muted)', border: '1px solid var(--color-primary-border)', color: 'var(--color-primary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary-muted)'; e.currentTarget.style.filter = 'none' }}
          >
            <Plus size={13} /> Registrar peso hoje
          </button>
        </div>

        {/* Volume */}
        <div className="card-glow-hover animate-fade-in rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid var(--color-primary-border)', animationDelay: '180ms' }}>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 120, height: 120, background: 'var(--color-bg-3)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div className="slabel">Volume Semanal</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="score-num" style={{ fontSize: 42, color: 'var(--color-primary)', textShadow: '0 0 20px var(--color-primary-border)' }}>{(weeklyVolume / 1000).toFixed(1)}</span>
            <span style={{ fontSize: 16, color: 'var(--fg2)' }}>ton</span>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--fg3)' }}>{weekSessions.length} sessões esta semana</p>
          {/* Inline volume mini-bars */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 48 }}>
            {volumeChartData.map((d, i) => {
              const maxVol = Math.max(...volumeChartData.map(x => x.vol), 0.1)
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: d.vol > 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', height: `${Math.max((d.vol / maxVol) * 100, 8)}%`, boxShadow: d.vol > 0 ? '0 0 6px var(--color-primary-border)' : 'none', transition: `height 800ms cubic-bezier(.16,1,.3,1) ${i * 60}ms` }} />
                  </div>
                  <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'var(--fg3)' }}>{d.day.slice(0, 3)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 mb-5 rounded-xl overflow-hidden animate-fade-in"
        style={{ background: 'var(--bg2)', border: '1px solid var(--color-primary-border)', animationDelay: '200ms' }}>
        {(['dashboard', 'rotinas', 'estatisticas'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="py-2.5 text-sm font-semibold transition-all duration-200"
            style={tab === t
              ? { background: 'rgba(239,68,68,0.18)', color: 'var(--color-primary)', boxShadow: 'inset 0 0 0 1px var(--color-primary-border)' }
              : { color: 'var(--fg3)', background: 'transparent' }
            }
            onMouseEnter={e => { if (tab !== t) e.currentTarget.style.background = 'var(--color-bg-3)' }}
            onMouseLeave={e => { if (tab !== t) e.currentTarget.style.background = 'transparent' }}
          >
            {t === 'dashboard' ? 'Dashboard' : t === 'rotinas' ? 'Rotinas' : 'Estatísticas'}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* Frequency — circular dots */}
          <div className="rounded-2xl p-5 animate-fade-in"
            style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(239,68,68,0.18)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="slabel" style={{ marginBottom: 0 }}>Frequência Mensal — {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</div>
              <span style={{ fontSize: 11, color: 'var(--fg3)', fontFamily: "'JetBrains Mono',monospace" }}>{workoutSessions.length} treinos</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {frequencyDays.map((day, i) => {
                const isToday = day.date === today()
                return (
                  <div key={i} title={day.date} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: isToday ? 'var(--color-primary)' : day.trained ? 'var(--color-primary-border)' : 'rgba(255,255,255,0.06)',
                    boxShadow: isToday ? '0 0 8px var(--color-primary-border)' : day.trained ? '0 0 5px var(--color-primary-border)' : 'none',
                    transform: isToday ? 'scale(1.3)' : 'scale(1)',
                    transition: 'all 200ms',
                  }} />
                )
              })}
            </div>
          </div>

          {/* Weekly row */}
          <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '80ms' }}>
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); const offset = (d.getDay() + 6) % 7; d.setDate(d.getDate() - offset + i)
              const ds = d.toISOString().split('T')[0]
              const session = workoutSessions.find(s => s.date === ds)
              const isToday = ds === today()
              const dayLabels = ['SEG','TER','QUA','QUI','SEX','SÁB','DOM']
              return (
                <div key={i} className="flex-1 rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all duration-200"
                  style={{
                    background: isToday ? 'var(--color-primary-muted)' : session ? 'var(--color-bg-3)' : 'var(--bg2)',
                    border: `1px solid ${isToday ? 'var(--color-primary-border)' : session ? 'var(--color-primary-border)' : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: isToday ? '0 0 16px var(--color-primary-muted)' : 'none',
                  }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg3)', letterSpacing: '0.06em' }}>{dayLabels[i]}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: isToday ? 'var(--color-primary)' : session ? 'var(--fg1)' : 'var(--fg3)' }}>{d.getDate()}</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: isToday ? 'var(--color-primary)' : session ? 'var(--color-primary-border)' : 'rgba(255,255,255,0.06)', boxShadow: isToday ? '0 0 6px var(--color-primary-border)' : 'none' }} />
                  {session && <span style={{ fontSize: 9, color: 'var(--color-primary)', fontWeight: 600, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{session.routineName}</span>}
                </div>
              )
            })}
          </div>

          {/* Muscle volume */}
          {Object.keys(muscleVol).length > 0 && (
            <div className="rounded-2xl p-5 animate-fade-in"
              style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(239,68,68,0.18)', animationDelay: '160ms' }}>
              <p className="slabel flex items-center gap-2 mb-4" style={{ marginBottom: 16 }}>
                <Dumbbell size={13} style={{ color: 'var(--color-primary)' }} /> Grupos Musculares Treinados
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(muscleVol).map(([muscle, vol]) => {
                  const color = MUSCLE_COLORS[muscle as keyof typeof MUSCLE_COLORS] || 'var(--color-primary)'
                  const pct = Math.min(100, (vol / maxMuscleVol) * 100)
                  return (
                    <div key={muscle} className="rounded-xl p-3 transition-all duration-200"
                      style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${color}35` }}
                      onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex justify-between mb-2">
                        <p className="slabel" style={{ marginBottom: 0 }}>{MUSCLE_GROUP_LABELS[muscle as keyof typeof MUSCLE_GROUP_LABELS] || muscle}</p>
                        <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: 'var(--fg1)' }}>{vol.toLocaleString('pt-BR')}kg</p>
                      </div>
                      <div className="xp-bar" style={{ height: 4 }}>
                        <div className="xp-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}50` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROTINAS TAB */}
      {tab === 'rotinas' && (
        <div className="space-y-3" style={{ animation: 'fadeIn 0.35s ease both' }}>
          {routines.map((routine, idx) => (
            <div key={routine.id} className="card-glow-hover rounded-2xl p-5"
              style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(239,68,68,0.18)', animation: `slideUp 0.3s ease ${idx * 60}ms both` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base" style={{ fontFamily: "'Syne',sans-serif", color: 'var(--color-primary)' }}>{routine.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--fg3)' }}>{routine.exercises.length} exercícios</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--fg3)', opacity: 0.6 }}>Criada em {new Date(routine.createdAt + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingRoutine(routine); setShowEditSelector(true) }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--fg3)' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--fg1)'; el.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--fg3)'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => removeRoutine(routine.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--fg3)' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#f87171'; el.style.borderColor = 'var(--color-primary-border)' }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--fg3)'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => startWorkout(routine)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: '#fff', boxShadow: '0 0 16px var(--color-primary-border)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px var(--color-primary-border)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px var(--color-primary-border)'; e.currentTarget.style.transform = 'none' }}>
                    <Play size={14} /> Iniciar
                  </button>
                </div>
              </div>

              {routine.exercises.length > 0 && (
                <div className="mt-3 pt-3 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid var(--color-primary-muted)' }}>
                  {routine.exercises.map(ex => {
                    const color = MUSCLE_COLORS[ex.muscleGroup as keyof typeof MUSCLE_COLORS] || '#666'
                    return (
                      <span key={ex.id} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: `${color}12`, color: `${color}cc`, border: `1px solid ${color}25` }}>
                        {ex.name}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => setShowRoutineModal(true)}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200"
            style={{ border: '2px dashed var(--color-primary-border)', color: 'var(--fg3)', background: 'transparent' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--color-primary-border)'; el.style.color = 'var(--color-primary)'; el.style.background = 'var(--color-bg-3)' }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--color-primary-border)'; el.style.color = 'var(--fg3)'; el.style.background = 'transparent' }}
          >
            <Plus size={16} /> Nova Rotina
          </button>
        </div>
      )}

      {/* ESTATÍSTICAS TAB */}
      {tab === 'estatisticas' && (
        <div className="space-y-4" style={{ animation: 'fadeIn 0.35s ease both' }}>
          <FisicoCharts volumeChartData={volumeChartData} weightChartData={weightChartData} />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {workoutSessions.slice(0, 6).map((s, i) => (
              <div key={s.id} className="card-glow-hover rounded-2xl p-4"
                style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid var(--color-primary-muted)', animationDelay: `${i * 60}ms` }}>
                <p className="font-bold text-sm truncate" style={{ fontFamily: "'Syne',sans-serif", color: 'var(--color-primary)' }}>{s.routineName}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--fg3)' }}>{new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                <div className="mt-3 flex items-end justify-between">
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: 'var(--fg1)' }}>{(s.volume / 1000).toFixed(1)}<span style={{ fontSize: 13, color: 'var(--fg3)' }}>t</span></p>
                  <p style={{ fontSize: 11, color: 'var(--fg3)', fontFamily: "'JetBrains Mono',monospace" }}>{s.duration}min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTIVE WORKOUT ─────────────────────────────────────────── */}
      {activeWorkout && (
        <div className="fixed inset-0 z-[150] overflow-auto" style={{ background: 'var(--bg0)' }}>
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 800px 600px at 50% 0%, var(--color-bg-3), transparent 60%)' }} />
          <div className="max-w-2xl mx-auto p-6 relative" style={{ animation: 'slideUp 0.35s ease both' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Syne',sans-serif", color: 'var(--color-primary)', textShadow: '0 0 20px var(--color-primary-border)' }}>
                  {activeWorkout.name}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--fg3)', fontFamily: "'JetBrains Mono',monospace" }}>{completedSeries}/{totalSeries} séries</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setActiveWorkout(null)}
                  className="flex items-center justify-center px-3 py-2 rounded-xl transition-all duration-200"
                  style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--fg3)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                  <X size={16} />
                </button>
                <button onClick={finishWorkout}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: '#fff', boxShadow: '0 0 20px var(--color-primary-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px var(--color-primary-border)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px var(--color-primary-border)' }}>
                  Finalizar
                </button>
              </div>
            </div>

            <div className="xp-bar mb-6" style={{ height: 6 }}>
              <div className="xp-fill" style={{ width: `${totalSeries > 0 ? (completedSeries / totalSeries) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary))', transition: 'width 500ms ease', boxShadow: '0 0 8px var(--color-primary-border)' }} />
            </div>

            <div className="space-y-4">
              {activeWorkout.exercises.map(exercise => {
                const sets = workoutSets[exercise.id] || exercise.sets
                const doneCount = sets.filter(s => s.completed).length
                const color = MUSCLE_COLORS[exercise.muscleGroup as keyof typeof MUSCLE_COLORS] || 'var(--color-primary)'
                return (
                  <div key={exercise.id} className="rounded-2xl p-5"
                    style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(239,68,68,0.18)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-base" style={{ color: 'var(--fg1)' }}>{exercise.name}</h3>
                        <p className="text-xs mt-0.5" style={{ color }}>{MUSCLE_GROUP_LABELS[exercise.muscleGroup as keyof typeof MUSCLE_GROUP_LABELS] || exercise.muscleGroup}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${color}15`, color, border: `1px solid ${color}30`, fontFamily: "'JetBrains Mono',monospace" }}>
                        {doneCount}/{sets.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {sets.map((set, idx) => (
                        <div key={set.id} className="rounded-2xl p-3 transition-all duration-300"
                          style={{
                            background: set.completed ? `${color}0d` : 'var(--bg2)',
                            border: `1px solid ${set.completed ? color + '35' : 'rgba(255,255,255,0.06)'}`,
                            boxShadow: set.completed ? `0 0 20px ${color}18` : 'none',
                          }}>
                          <div className="flex items-center justify-between mb-2 px-1">
                            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: 'var(--fg3)', fontWeight: 700, letterSpacing: '0.06em' }}>SÉRIE {idx + 1}</span>
                            <button onClick={() => toggleSet(exercise.id, set.id)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
                              style={set.completed
                                ? { background: color, color: '#fff', boxShadow: `0 0 12px ${color}50` }
                                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--fg3)' }
                              }>
                              <Check size={12} />
                              {set.completed ? 'Feita' : 'Marcar'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <NumberDrum
                              value={set.weight}
                              onChange={v => updateSetValue(exercise.id, set.id, 'weight', v)}
                              values={WEIGHT_VALUES}
                              label="KG"
                              color={color}
                              unit="kg"
                            />
                            <NumberDrum
                              value={set.reps}
                              onChange={v => updateSetValue(exercise.id, set.id, 'reps', v)}
                              values={REPS_VALUES}
                              label="REPS"
                              color={color}
                              unit="rep"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      {/* Weight */}
      <Modal open={showWeightModal} onClose={() => setShowWeightModal(false)} title="Registrar Peso">
        <div className="space-y-4">
          <input type="number" step="0.1" className="input text-2xl font-black text-center" placeholder="63.5"
            value={newWeight} onChange={e => setNewWeight(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddWeight()} />
          <p className="text-xs text-gray-600 text-center">Meta: {PEDRO.targetWeight}kg • Atual: {currentWeight}kg</p>
          <button onClick={handleAddWeight} className="btn-primary btn-glow w-full justify-center py-3">Salvar Peso</button>
        </div>
      </Modal>

      {/* New Routine */}
      <Modal open={showRoutineModal} onClose={() => { setShowRoutineModal(false); setDraftExercises([]) }}
        title="Nova Rotina" className="max-w-lg">
        <div className="space-y-4">
          <input className="input" placeholder="Nome da rotina (ex: Push, Pull, Legs...)"
            value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} />

          {/* Draft exercises */}
          {draftExercises.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {draftExercises.map(ex => {
                const color = MUSCLE_COLORS[ex.muscleGroup as keyof typeof MUSCLE_COLORS] || 'var(--color-primary)'
                return (
                  <div key={ex.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                      <Dumbbell size={12} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{ex.name}</p>
                      <p className="text-xs" style={{ color }}>{MUSCLE_GROUP_LABELS[ex.muscleGroup as keyof typeof MUSCLE_GROUP_LABELS]}</p>
                    </div>
                    <button onClick={() => removeDraftExercise(ex.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={() => setShowExerciseSelector(true)}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200"
            style={{ borderColor: 'var(--color-primary)40', color: 'var(--color-primary)', background: 'var(--color-primary)0a' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)1a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)0a' }}
          >
            <Plus size={16} /> Adicionar Exercício
          </button>

          <button
            onClick={handleAddRoutine}
            disabled={!newRoutineName.trim()}
            className="btn-primary btn-glow w-full justify-center py-3"
          >
            Criar Rotina ({draftExercises.length} exercícios)
          </button>
        </div>
      </Modal>

      {/* Edit Routine exercises */}
      {editingRoutine && (
        <Modal open={!!editingRoutine && !showEditSelector} onClose={() => setEditingRoutine(null)}
          title={`Editar: ${editingRoutine.name}`} className="max-w-lg">
          <div className="space-y-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {editingRoutine.exercises.map(ex => {
                const color = MUSCLE_COLORS[ex.muscleGroup as keyof typeof MUSCLE_COLORS] || 'var(--color-primary)'
                return (
                  <div key={ex.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                      <Dumbbell size={12} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{ex.name}</p>
                      <p className="text-xs" style={{ color }}>{ex.muscleGroup}</p>
                    </div>
                    <button onClick={() => {
                      const updated = { ...editingRoutine, exercises: editingRoutine.exercises.filter(e => e.id !== ex.id) }
                      setEditingRoutine(updated)
                      updateRoutine(editingRoutine.id, updated)
                    }} className="text-gray-600 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setShowEditSelector(true)}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200"
              style={{ borderColor: 'var(--color-primary)40', color: 'var(--color-primary)', background: 'var(--color-primary)0a' }}>
              <Plus size={16} /> Adicionar Exercício
            </button>
          </div>
        </Modal>
      )}

      {/* Exercise Selectors */}
      <ExerciseSelector
        open={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onSelect={(ex) => { handleSelectExercise(ex) }}
      />
      <ExerciseSelector
        open={showEditSelector}
        onClose={() => setShowEditSelector(false)}
        onSelect={(ex) => { handleEditSelectExercise(ex) }}
      />
    </div>
  )
}
