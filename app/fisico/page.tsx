'use client'
import { useState, useEffect, useRef, useCallback, useMemo, ReactNode, CSSProperties } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { ExerciseSelector } from '@/components/ui/ExerciseSelector'
import {
  Dumbbell, Scale, TrendingDown, TrendingUp, Plus, Play,
  Pencil, Trash2, Check, X, Zap, Activity, BarChart2, Flame,
} from 'lucide-react'
import { today } from '@/lib/utils'
import { WorkoutRoutine, Exercise, WorkoutSet } from '@/store/types'
import { ExerciseTemplate, MUSCLE_COLORS, MUSCLE_GROUP_LABELS } from '@/lib/exercises'
import { NumberDrum } from '@/components/ui/NumberDrum'
import { PEDRO } from '@/lib/pedroProfile'
import { getWeeklyMuscleStats } from '@/lib/muscleVolume'
import { MuscleBody3D } from '@/components/MuscleBody3D'

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

const WEIGHT_VALUES = Array.from({ length: 201 }, (_, i) => i)
const REPS_VALUES = Array.from({ length: 51 }, (_, i) => i)

type Tab = 'dashboard' | 'treinos' | 'estatisticas'

/* ───── count-up hook ───── */
function useCountUp(target: number, duration = 900, delay = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now()
      const tick = () => {
        const p = Math.min(1, (performance.now() - start) / duration)
        const e = 1 - Math.pow(1 - p, 3)
        setVal(Number((target * e).toFixed(target % 1 ? 1 : 0)))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(t)
  }, [target, duration, delay])
  return val
}

/* ───── SpotCard with 3D tilt + spotlight + laser ring ───── */
function SpotCard({ className = '', children, style, glow = false }: {
  className?: string; children: ReactNode; style?: CSSProperties; glow?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', (x * 100).toFixed(1) + '%')
    el.style.setProperty('--my', (y * 100).toFixed(1) + '%')
    el.style.transform = `perspective(900px) rotateX(${((y - .5) * -6).toFixed(2)}deg) rotateY(${((x - .5) * 6).toFixed(2)}deg) scale(1.008)`
  }, [])
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return
    el.style.transform = ''
  }, [])
  return (
    <div ref={ref} className={`fisico-card ${glow ? 'glow' : ''} ${className}`} style={style}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="fisico-laser" />
      <div className="fisico-spot" />
      {children}
    </div>
  )
}

/* ───── Score Ring (large circular) ───── */
function ScoreRing({ score, target, weekCount }: { score: number; target: number; weekCount: number }) {
  const display = useCountUp(score, 900, 200)
  const r = 31
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(score, 100) / 100) * c
  const targetPct = target > 0 ? Math.min(100, (score / target) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div className="score-num">{display}<span className="score-denom">/100</span></div>
        <div className="score-week">{weekCount} treinos esta semana</div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div className="goal-label">Meta da Evolução</div>
          <div className="prog-wrap" style={{ marginBottom: 4 }}>
            <div className="prog-fill" style={{ width: `${targetPct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: "'JetBrains Mono',monospace" }}>
            <span>{score}</span><span>{target}</span>
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', flexShrink: 0, width: 86, height: 86 }}>
        <svg width="86" height="86" viewBox="-8 -8 86 86" style={{ overflow: 'visible' }}>
          <circle className="ring-bg" cx="35" cy="35" r={r} />
          <circle className="ring-arc" cx="35" cy="35" r={r}
            strokeDasharray={`${c - offset} ${c}`}
            transform="rotate(-90 35 35)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: 'var(--green)', lineHeight: 1 }}>{display}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: "'JetBrains Mono',monospace" }}>/ 100</span>
        </div>
      </div>
    </div>
  )
}

/* ───── Volume mini-bars ───── */
function VolBars({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, .1)
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 36 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{
              flex: 1, borderRadius: '3px 3px 0 0', minHeight: 3,
              background: v > 0 ? 'var(--green)' : 'rgba(255,255,255,.06)',
              boxShadow: v > 0 ? '0 0 6px rgba(var(--color-primary-rgb), .4)' : undefined,
              height: `${Math.max(4, (v / max) * 36)}px`,
              transformBox: 'fill-box', transformOrigin: 'bottom center',
              animation: v > 0 ? `barRise .5s cubic-bezier(.22,.68,0,1.2) ${i * .06}s both` : undefined,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,.3)' }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

/* ───── Weight line chart (SVG) ───── */
function WeightLine({ points }: { points: { date: string; val: number }[] }) {
  if (points.length < 2) {
    return <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
      Registre 2+ pesos para ver evolução
    </div>
  }
  const vals = points.map(p => p.val)
  const minV = Math.min(...vals) - .5, maxV = Math.max(...vals) + .5
  const W = 260, H = 80
  const coords = points.map((p, i) => ({
    x: i / (points.length - 1) * W,
    y: H - ((p.val - minV) / (maxV - minV)) * H,
  }))
  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = d + ` L${W},${H} L0,${H} Z`
  const last = coords[coords.length - 1]
  const lastP = points[points.length - 1]
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(var(--color-primary-rgb), .15)" />
          <stop offset="100%" stopColor="rgba(var(--color-primary-rgb), 0)" />
        </linearGradient>
      </defs>
      {[.25, .5, .75].map(f => (
        <line key={f} x1={0} y1={H * f} x2={W} y2={H * f} stroke="rgba(255,255,255,.04)" strokeWidth={1} />
      ))}
      <path d={area} fill="url(#wg)" />
      <path d={d} fill="none" stroke="var(--green)" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 3px rgba(var(--color-primary-rgb), .6))' }} />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 2.5}
          fill="var(--green)" style={{ filter: 'drop-shadow(0 0 4px rgba(var(--color-primary-rgb), .8))' }} />
      ))}
      <g>
        <rect x={last.x - 32} y={last.y - 32} width={66} height={22} rx={4}
          fill="rgba(15,16,22,.95)" stroke="rgba(255,255,255,.15)" strokeWidth={.8} />
        <text x={last.x + 1} y={last.y - 17} textAnchor="middle" fontSize={8}
          fill="rgba(255,255,255,.7)" fontFamily="JetBrains Mono,monospace">{lastP.date} · {lastP.val}kg</text>
      </g>
      {[0, Math.floor(points.length / 2), points.length - 1].map(i => (
        <text key={i} x={coords[i].x} y={H + 16} textAnchor="middle" fontSize={8}
          fill="rgba(255,255,255,.3)" fontFamily="Inter">{points[i].date}</text>
      ))}
    </svg>
  )
}

/* ───── Volume bar chart (SVG) ───── */
function VolBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, .1)
  const H = 80, bw = 24, gap = 14
  return (
    <svg width="100%" viewBox={`0 0 ${data.length * (bw + gap) - gap} ${H + 24}`} preserveAspectRatio="xMidYMax meet">
      {[.25, .5, .75, 1].map(f => (
        <line key={f} x1={0} y1={H * (1 - f)} x2={data.length * (bw + gap)} y2={H * (1 - f)}
          stroke="rgba(255,255,255,.04)" strokeWidth={1} />
      ))}
      {data.map((v, i) => {
        const bh = Math.max(v > 0 ? 4 : 3, (v / max) * H)
        const x = i * (bw + gap)
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={bw} height={bh} rx={3}
              fill={v > 0 ? 'var(--green)' : 'rgba(255,255,255,.06)'}
              style={{
                filter: v > 0 ? 'drop-shadow(0 0 5px rgba(var(--color-primary-rgb), .55))' : undefined,
                transformBox: 'fill-box', transformOrigin: 'bottom center',
                animation: v > 0 ? `barRise .5s cubic-bezier(.22,.68,0,1.2) ${i * .07}s both` : undefined,
              }} />
            {v > 0 && <text x={x + bw / 2} y={H - bh - 5} textAnchor="middle" fontSize={8} fill="rgba(var(--color-primary-rgb), .7)" fontFamily="JetBrains Mono,monospace">{v}t</text>}
            <text x={x + bw / 2} y={H + 16} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,.3)" fontFamily="Inter">{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function FisicoPage() {
  const {
    weightLog, addWeight, routines, addRoutine, removeRoutine,
    updateRoutine, workoutSessions, addWorkoutSession, getPillarScores, addXP,
  } = useStore()

  const [recordCelebration, setRecordCelebration] = useState<null | {
    todayT: number; prevT: number; deltaT: number; xpBonus: number
  }>(null)

  const [tab, setTab] = useState<Tab>('dashboard')
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<HTMLDivElement>(null)
  const tabKeys: Tab[] = ['dashboard', 'treinos', 'estatisticas']

  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [newRoutineName, setNewRoutineName] = useState('')
  const [draftExercises, setDraftExercises] = useState<Exercise[]>([])
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null)
  const [workoutSets, setWorkoutSets] = useState<Record<string, WorkoutSet[]>>({})
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null)
  const [showEditSelector, setShowEditSelector] = useState(false)

  const scores = getPillarScores()
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : 0
  const prevWeight = weightLog.length > 1 ? weightLog[weightLog.length - 2].weight : currentWeight
  const weightDiff = parseFloat((currentWeight - prevWeight).toFixed(1))
  const weightToGoal = PEDRO.targetWeight > 0 && currentWeight > 0
    ? parseFloat((PEDRO.targetWeight - currentWeight).toFixed(1)) : 0

  const weekSessions = workoutSessions.filter(s => {
    const d = new Date(s.date)
    return (Date.now() - d.getTime()) < 7 * 86400000
  })
  const weeklyVolume = weekSessions.reduce((a, s) => a + s.volume, 0)
  const weeklyVolumeT = +(weeklyVolume / 1000).toFixed(1)

  const muscleStats = useMemo(() => getWeeklyMuscleStats(workoutSessions), [workoutSessions])
  const trainedMuscleCount = useMemo(
    () => Object.values(muscleStats.intensityByMuscle).filter(i => i !== 'none').length,
    [muscleStats]
  )

  const volWeekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); const offset = (d.getDay() + 6) % 7; d.setDate(d.getDate() - offset + i)
    const ds = d.toISOString().split('T')[0]
    const vol = workoutSessions.filter(s => s.date === ds).reduce((a, s) => a + s.volume, 0)
    return +(vol / 1000).toFixed(1)
  })
  const volWeekLabels = ['seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.', 'dom.']

  const weightPoints = weightLog.slice(-8).map(w => {
    const d = new Date(w.date + 'T12:00:00')
    return { date: d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }), val: w.weight }
  })

  /* monthly frequency dots — current calendar month */
  const monthDots = (() => {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => {
      const ds = new Date(y, m, i + 1).toISOString().split('T')[0]
      const trained = workoutSessions.some(s => s.date === ds)
      const isToday = ds === today()
      return { date: ds, trained, isToday }
    })
  })()
  const trainedThisMonth = monthDots.filter(d => d.trained).length

  /* week calendar */
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); const offset = (d.getDay() + 6) % 7; d.setDate(d.getDate() - offset + i)
    const ds = d.toISOString().split('T')[0]
    const session = workoutSessions.find(s => s.date === ds)
    const isToday = ds === today()
    const dayLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
    return { abbr: dayLabels[i], num: d.getDate(), session, isToday, ds }
  })

  /* sliding tab pill */
  useEffect(() => {
    if (!tabsRef.current) return
    const btns = tabsRef.current.querySelectorAll<HTMLButtonElement>('.tab-btn')
    const idx = tabKeys.indexOf(tab)
    if (btns[idx]) setPillStyle({ left: btns[idx].offsetLeft, width: btns[idx].offsetWidth })
  }, [tab])

  function handleAddWeight() {
    const w = parseFloat(newWeight)
    if (!isNaN(w) && w > 0) { addWeight(w); setNewWeight(''); setShowWeightModal(false) }
  }

  function handleSelectExercise(ex: ExerciseTemplate) {
    setDraftExercises(prev => [...prev, {
      id: genId(), name: ex.name, muscleGroup: ex.muscle,
      sets: Array.from({ length: 3 }, () => ({
        id: genId(), reps: ex.defaultReps, weight: ex.defaultWeight, completed: false,
      })),
    }])
  }

  function handleEditSelectExercise(ex: ExerciseTemplate) {
    if (!editingRoutine) return
    const newEx: Exercise = {
      id: genId(), name: ex.name, muscleGroup: ex.muscle,
      sets: Array.from({ length: 3 }, () => ({
        id: genId(), reps: ex.defaultReps, weight: ex.defaultWeight, completed: false,
      })),
    }
    const updated = { ...editingRoutine, exercises: [...editingRoutine.exercises, newEx] }
    setEditingRoutine(updated)
    updateRoutine(editingRoutine.id, updated)
  }

  function addSetToExercise(exerciseId: string) {
    setWorkoutSets(prev => {
      const sets = prev[exerciseId] || []
      const last = sets[sets.length - 1]
      const newSet: WorkoutSet = {
        id: genId(),
        reps: last?.reps ?? 10,
        weight: last?.weight ?? 0,
        completed: false,
      }
      return { ...prev, [exerciseId]: [...sets, newSet] }
    })
  }

  function removeSetFromExercise(exerciseId: string, setId: string) {
    setWorkoutSets(prev => {
      const sets = prev[exerciseId] || []
      if (sets.length <= 1) return prev
      return { ...prev, [exerciseId]: sets.filter(s => s.id !== setId) }
    })
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
  }

  function toggleSet(exerciseId: string, setId: string) {
    setWorkoutSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(s => s.id === setId ? { ...s, completed: !s.completed } : s),
    }))
  }

  function updateSetValue(exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) {
    setWorkoutSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(s => s.id === setId ? { ...s, [field]: value } : s),
    }))
  }

  function finishWorkout() {
    if (!activeWorkout) return
    const exercises = activeWorkout.exercises.map(e => ({ ...e, sets: workoutSets[e.id] || e.sets }))
    const volume = exercises.reduce((a, e) =>
      a + e.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0)
    const t = today()

    // Today's existing volume (in case multiple sessions in a day)
    const todayPriorVolume = workoutSessions
      .filter(s => s.date === t)
      .reduce((a, s) => a + s.volume, 0)

    // Most recent previous training day (any day before today with a session)
    const prevDayVolume = (() => {
      const byDate = new Map<string, number>()
      workoutSessions.forEach(s => {
        if (s.date >= t) return
        byDate.set(s.date, (byDate.get(s.date) || 0) + s.volume)
      })
      const dates = Array.from(byDate.keys()).sort()
      if (dates.length === 0) return 0
      return byDate.get(dates[dates.length - 1]) || 0
    })()

    addWorkoutSession({ routineId: activeWorkout.id, routineName: activeWorkout.name, date: t, duration: 60, exercises, volume })

    const todayTotal = todayPriorVolume + volume
    if (prevDayVolume > 0 && todayTotal > prevDayVolume) {
      const deltaKg = todayTotal - prevDayVolume
      const xpBonus = Math.min(200, 50 + Math.round(deltaKg / 50))
      addXP(xpBonus)
      setRecordCelebration({
        todayT: +(todayTotal / 1000).toFixed(1),
        prevT: +(prevDayVolume / 1000).toFixed(1),
        deltaT: +(deltaKg / 1000).toFixed(2),
        xpBonus,
      })
    }

    setActiveWorkout(null); setWorkoutSets({})
  }

  const totalSeries = activeWorkout
    ? Object.values(workoutSets).reduce((a, sets) => a + sets.length, 0) : 0
  const completedSeries = activeWorkout
    ? Object.values(workoutSets).reduce((a, sets) => a + sets.filter(s => s.completed).length, 0) : 0

  return (
    <>
      <style>{fisicoCSS}</style>

      <div className="fisico-page">

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="page-header fade-up">
          <div>
            <div className="pillar-label">Evolução</div>
            <div className="pillar-title">
              <span className="pillar-title-text">Evolução do Físico</span>
              {weightToGoal !== 0 && (
                <span className="pillar-badge">
                  {weightToGoal > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {weightToGoal > 0 ? '+' : ''}{weightToGoal}kg
                </span>
              )}
            </div>
            <div className="pillar-sub">Treino e performance{PEDRO.trainingDaysPerWeek > 0 ? ` · ${PEDRO.trainingDaysPerWeek}× por semana` : ''}</div>
          </div>
          <button className="reg-btn" onClick={() => setShowWeightModal(true)}>
            <Plus size={14} /> Registrar Peso
          </button>
        </div>

        {/* ── STAT CARDS ────────────────────────────────────────── */}
        <div className="stat-grid">
          <SpotCard glow className="fade-up" style={{ animationDelay: '.07s' }}>
            <div className="card-label"><Zap size={10} /> Score Físico</div>
            <ScoreRing score={scores.fisico} target={PEDRO.pillarsTarget.fisico} weekCount={weekSessions.length} />
          </SpotCard>

          <SpotCard className="fade-up" style={{ animationDelay: '.13s' }}>
            <div className="card-label"><Scale size={10} /> Peso Atual</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div className="peso-num">
                  {currentWeight || 0}
                  <span style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-2)', fontFamily: 'Inter' }}> KG</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>
                <div style={{ fontSize: 10 }}>Meta: {PEDRO.targetWeight || '—'}{PEDRO.targetWeight > 0 && 'kg'}</div>
                {weightToGoal !== 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: 'var(--green)', marginTop: 2 }}>
                      {weightToGoal > 0 ? '+' : ''}{weightToGoal}kg
                    </div>
                    <div style={{ fontSize: 10 }}>para o objetivo</div>
                  </>
                )}
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, margin: '10px 0', fontSize: 11,
              color: weightDiff > 0 ? 'var(--green)' : weightDiff < 0 ? '#f87171' : 'var(--text-3)',
            }}>
              {weightDiff > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {weightDiff > 0 ? '+' : ''}{weightDiff} kg esta semana
            </div>
            <div className="prog-wrap" style={{ marginBottom: 8 }}>
              <div className="prog-fill" style={{
                width: `${PEDRO.targetWeight > 0 && currentWeight > 0
                  ? Math.min(100, Math.max(0, ((currentWeight - 60) / Math.max(1, PEDRO.targetWeight - 60)) * 100))
                  : 0}%`,
              }} />
            </div>
            <button className="primary-btn" style={{ fontSize: 12, padding: 10 }} onClick={() => setShowWeightModal(true)}>
              <Plus size={13} /> Registrar peso hoje
            </button>
          </SpotCard>

          <SpotCard glow className="fade-up" style={{ animationDelay: '.19s' }}>
            <div className="card-label"><Activity size={10} /> Volume Semanal</div>
            <div className="vol-num">
              {weeklyVolumeT}
              <span style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-2)', fontFamily: 'Inter' }}> ton</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>{weekSessions.length} sessões esta semana</div>
            <VolBars data={volWeekData} labels={volWeekLabels} />
          </SpotCard>
        </div>

        {/* ── TABS ──────────────────────────────────────────────── */}
        <div ref={tabsRef} className="tabs-track fade-up" style={{ animationDelay: '.24s' }}>
          <div className="tab-pill" style={{ left: pillStyle.left, width: pillStyle.width }} />
          {(['Dashboard', 'Treinos', 'Estatísticas'] as const).map((t, i) => (
            <button key={t} className={`tab-btn ${tab === tabKeys[i] ? 'active' : ''}`}
              onClick={() => setTab(tabKeys[i])}>{t}</button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ─────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="tab-content">

            {/* ─── BONECO 3D — músculos treinados na semana ─── */}
            <div
              className="muscle-3d-card"
              style={{
                position: 'relative',
                marginBottom: 16,
                padding: '14px 14px 22px',
                borderRadius: 18,
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.09)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 6, gap: 8, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: 1.2,
                    textTransform: 'uppercase', color: 'var(--text-2)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Dumbbell size={11} /> Músculos da semana
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                    Arraste para girar · toque num músculo para ver detalhes
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, padding: '5px 10px',
                  borderRadius: 999,
                  background: trainedMuscleCount > 0 ? 'rgba(59,130,246,.12)' : 'rgba(255,255,255,.05)',
                  color: trainedMuscleCount > 0 ? '#60a5fa' : 'var(--text-3)',
                  border: `1px solid ${trainedMuscleCount > 0 ? 'rgba(59,130,246,.25)' : 'rgba(255,255,255,.09)'}`,
                }}>
                  {trainedMuscleCount}/8 grupos
                </div>
              </div>
              <MuscleBody3D stats={muscleStats} height={380} />
            </div>

            <div className="freq-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-2)' }}>
                  Frequência Mensal — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Flame size={11} style={{ color: 'var(--gold)' }} />
                  {trainedThisMonth} treinos
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {monthDots.map((d, i) => (
                  <div key={i} className={`freq-dot ${d.isToday ? 'today' : d.trained ? 'done' : 'empty'}`}
                    style={{ animationDelay: `${i * .025}s` }}
                    title={d.isToday ? 'Hoje' : d.trained ? `${d.date} — treino` : d.date} />
                ))}
              </div>
            </div>

            <div className="week-grid">
              {weekDays.map((d, i) => (
                <div key={i} className={`day-card ${d.isToday ? 'active' : ''}`}
                  style={{ animationDelay: `${i * .05 + .05}s` }}>
                  <div className="day-name">{d.abbr}</div>
                  <div className="day-num">{d.num}</div>
                  {(d.session || d.isToday) && <div className="day-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TREINOS TAB ───────────────────────────────────────── */}
        {tab === 'treinos' && (
          <div className="tab-content">
            {routines.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                Você ainda não tem treinos. Crie o primeiro abaixo.
              </div>
            )}
            {routines.map((r, i) => {
              const exNames = r.exercises.map(e => e.name)
              return (
                <div key={r.id} className="routine-card" style={{ animationDelay: `${i * .07}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.3px' }}>{r.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button className="icon-btn" onClick={() => { setEditingRoutine(r); setShowEditSelector(false) }} aria-label="Editar">
                        <Pencil size={12} />
                      </button>
                      <button className="icon-btn danger" onClick={() => removeRoutine(r.id)} aria-label="Remover">
                        <Trash2 size={12} />
                      </button>
                      <button className="start-btn" onClick={() => startWorkout(r)}>
                        <Play size={12} /> Iniciar
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>
                    {r.exercises.length} exercícios · Criado em: {new Date(r.createdAt + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </div>
                  {exNames.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {exNames.map((c, j) => <span key={j} className="chip">{c}</span>)}
                    </div>
                  )}
                </div>
              )
            })}
            <button className="new-routine" onClick={() => setShowRoutineModal(true)}>
              <Plus size={14} /> Novo Treino
            </button>
          </div>
        )}

        {/* ── ESTATÍSTICAS TAB ──────────────────────────────────── */}
        {tab === 'estatisticas' && (
          <div className="tab-content">
            <div className="stats-grid">
              <SpotCard className="fade-up" style={{ animationDelay: '.05s' }}>
                <div className="card-label"><BarChart2 size={10} /> Volume Semanal (toneladas)</div>
                <VolBarChart data={volWeekData} labels={volWeekLabels} />
              </SpotCard>
              <SpotCard className="fade-up" style={{ animationDelay: '.1s' }}>
                <div className="card-label"><TrendingDown size={10} /> Evolução do Peso (kg)</div>
                <WeightLine points={weightPoints} />
              </SpotCard>
            </div>
            {workoutSessions.length === 0 && (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                Nenhuma sessão registrada ainda.
              </div>
            )}
            {workoutSessions.slice().reverse().slice(0, 8).map((h, i) => (
              <div key={h.id} className="history-card" style={{ animationDelay: `${i * .07}s` }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{h.routineName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 10 }}>
                  {new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: 'var(--green)' }}>
                    {(h.volume / 1000).toFixed(1)}
                    <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-3)', fontFamily: 'Inter' }}> t</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{h.duration}min</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ACTIVE WORKOUT (full overlay) ─────────────────────── */}
        {activeWorkout && (
          <div className="workout-overlay">
            <div className="workout-inner">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>
                    Treino em andamento
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--green)', textShadow: '0 0 20px rgba(var(--color-primary-rgb), .4)' }}>
                    {activeWorkout.name}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>
                    {completedSeries}/{totalSeries} séries
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="icon-btn" onClick={() => setActiveWorkout(null)} aria-label="Fechar">
                    <X size={14} />
                  </button>
                  <button className="primary-btn" style={{ width: 'auto', padding: '10px 18px' }} onClick={finishWorkout}>
                    <Check size={14} /> Finalizar
                  </button>
                </div>
              </div>

              <div className="prog-wrap" style={{ marginBottom: 18 }}>
                <div className="prog-fill" style={{ width: `${totalSeries > 0 ? (completedSeries / totalSeries) * 100 : 0}%` }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeWorkout.exercises.map(exercise => {
                  const sets = workoutSets[exercise.id] || exercise.sets
                  const doneCount = sets.filter(s => s.completed).length
                  const color = MUSCLE_COLORS[exercise.muscleGroup as keyof typeof MUSCLE_COLORS] || 'var(--green)'
                  return (
                    <div key={exercise.id} className="ex-block">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{exercise.name}</div>
                          <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>
                            {MUSCLE_GROUP_LABELS[exercise.muscleGroup as keyof typeof MUSCLE_GROUP_LABELS] || exercise.muscleGroup}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                          padding: '4px 10px', borderRadius: 20,
                          background: `${color}15`, color, border: `1px solid ${color}30`,
                        }}>
                          {doneCount}/{sets.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {sets.map((s, idx) => (
                          <div key={s.id} className={`series-block ${s.completed ? 'done' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)' }}>
                                Série {idx + 1}
                              </span>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <button className={`mark-btn ${s.completed ? 'done' : ''}`} onClick={() => toggleSet(exercise.id, s.id)}>
                                  <Check size={11} />
                                  {s.completed ? 'Marcado' : 'Marcar'}
                                </button>
                                {sets.length > 1 && (
                                  <button
                                    className="icon-btn danger"
                                    style={{ width: 26, height: 26 }}
                                    onClick={() => removeSetFromExercise(exercise.id, s.id)}
                                    aria-label="Remover série"
                                    title="Remover série"
                                  >
                                    <X size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                              <NumberDrum
                                value={s.weight}
                                onChange={v => updateSetValue(exercise.id, s.id, 'weight', v)}
                                values={WEIGHT_VALUES}
                                label="KG" color={color} unit="kg"
                              />
                              <NumberDrum
                                value={s.reps}
                                onChange={v => updateSetValue(exercise.id, s.id, 'reps', v)}
                                values={REPS_VALUES}
                                label="REPS" color={color} unit="rep"
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => addSetToExercise(exercise.id)}
                          className="add-set-btn"
                          style={{ ['--c' as any]: color }}
                        >
                          <Plus size={13} /> Adicionar série
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TONNAGE RECORD CELEBRATION ────────────────────────── */}
        {recordCelebration && (
          <div className="record-overlay" onClick={() => setRecordCelebration(null)}>
            <div className="record-burst" aria-hidden>
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="confetti" style={{ ['--i' as any]: i }} />
              ))}
            </div>
            <div className="record-card" onClick={e => e.stopPropagation()}>
              <div className="record-trophy">
                <Flame size={42} />
              </div>
              <div className="record-title">RECORDE QUEBRADO!</div>
              <p className="record-sub">Você superou seu último treino 💪</p>
              <div className="record-stats">
                <div>
                  <div className="rs-label">Hoje</div>
                  <div className="rs-val rs-up">{recordCelebration.todayT}t</div>
                </div>
                <div className="rs-arrow">→</div>
                <div>
                  <div className="rs-label">Anterior</div>
                  <div className="rs-val">{recordCelebration.prevT}t</div>
                </div>
              </div>
              <div className="record-delta">
                <TrendingUp size={14} /> +{recordCelebration.deltaT}t levantadas
              </div>
              <div className="record-xp">
                <Zap size={16} /> +{recordCelebration.xpBonus} XP de boost!
              </div>
              <button className="record-close" onClick={() => setRecordCelebration(null)}>
                Continuar a caçada
              </button>
            </div>
          </div>
        )}

        {/* ── WEIGHT MODAL ──────────────────────────────────────── */}
        {showWeightModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowWeightModal(false)}>
            <div className="modal-box">
              <button className="modal-close" onClick={() => setShowWeightModal(false)}><X size={16} /></button>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>
                  Evolução do Físico
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.5px' }}>Registrar Peso</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>
                  {currentWeight > 0 ? `Último registro: ${currentWeight} kg` : 'Nenhum registro ainda'}
                </div>
              </div>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  autoFocus type="number" step="0.1"
                  className="w-input" value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddWeight()}
                  placeholder="0"
                />
                <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", pointerEvents: 'none' }}>
                  kg
                </span>
              </div>
              {currentWeight > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[currentWeight - 1, currentWeight - 0.5, currentWeight, currentWeight + 0.5, currentWeight + 1].map((v, i) => {
                    const val = +v.toFixed(1)
                    const sel = parseFloat(newWeight) === val
                    return (
                      <button key={i} onClick={() => setNewWeight(String(val))} style={{
                        flex: 1, padding: '7px 4px', borderRadius: 8,
                        border: '1px solid', fontSize: 12, fontWeight: 600,
                        fontFamily: "'JetBrains Mono',monospace", cursor: 'pointer',
                        transition: 'all .15s',
                        background: sel ? 'rgba(var(--color-primary-rgb), .15)' : 'rgba(255,255,255,.05)',
                        borderColor: sel ? 'rgba(var(--color-primary-rgb), .3)' : 'var(--border)',
                        color: sel ? 'var(--green)' : 'var(--text-2)',
                      }}>{val}</button>
                    )
                  })}
                </div>
              )}
              <button className="primary-btn" onClick={handleAddWeight} disabled={!newWeight || parseFloat(newWeight) <= 0}>
                <Check size={15} /> Salvar registro
              </button>
            </div>
          </div>
        )}

        {/* ── NEW ROUTINE MODAL ─────────────────────────────────── */}
        <Modal open={showRoutineModal} onClose={() => { setShowRoutineModal(false); setDraftExercises([]) }}
          title="Novo Treino" className="max-w-lg">
          <div className="space-y-4">
            <input className="input" placeholder="Nome do treino (ex: Push, Pull, Legs...)"
              value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} />
            {draftExercises.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {draftExercises.map(ex => {
                  const color = MUSCLE_COLORS[ex.muscleGroup as keyof typeof MUSCLE_COLORS] || 'var(--green)'
                  return (
                    <div key={ex.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
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
            <button onClick={() => setShowExerciseSelector(true)} className="new-routine">
              <Plus size={16} /> Adicionar Exercício
            </button>
            <button className="primary-btn" disabled={!newRoutineName.trim()} onClick={handleAddRoutine}>
              Criar Treino ({draftExercises.length} exercícios)
            </button>
          </div>
        </Modal>

        {/* ── EDIT ROUTINE MODAL ────────────────────────────────── */}
        {editingRoutine && (
          <Modal open={!!editingRoutine && !showEditSelector} onClose={() => setEditingRoutine(null)}
            title={`Editar: ${editingRoutine.name}`} className="max-w-lg">
            <div className="space-y-3">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {editingRoutine.exercises.map(ex => {
                  const color = MUSCLE_COLORS[ex.muscleGroup as keyof typeof MUSCLE_COLORS] || 'var(--green)'
                  return (
                    <div key={ex.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
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
                        setEditingRoutine(updated); updateRoutine(editingRoutine.id, updated)
                      }} className="text-gray-600 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => setShowEditSelector(true)} className="new-routine">
                <Plus size={16} /> Adicionar Exercício
              </button>
            </div>
          </Modal>
        )}

        <ExerciseSelector open={showExerciseSelector} onClose={() => setShowExerciseSelector(false)} onSelect={handleSelectExercise} />
        <ExerciseSelector open={showEditSelector} onClose={() => setShowEditSelector(false)} onSelect={handleEditSelectExercise} />
      </div>
    </>
  )
}

const fisicoCSS = `
.fisico-page { padding: 16px; max-width: 1000px; margin: 0 auto; position: relative; z-index: 3; --green: var(--color-primary); --green-subtle: var(--color-primary-light); --gold: var(--gold); --text-1: rgba(255,255,255,.93); --text-2: rgba(255,255,255,.55); --text-3: rgba(255,255,255,.3); --border: rgba(255,255,255,.09); --border-h: rgba(255,255,255,.18); }
@media (min-width: 768px) { .fisico-page { padding: 24px 28px 40px; } }

@keyframes fadeUp { from { opacity:0; transform: translateY(16px);} to { opacity:1; transform: translateY(0);} }
@keyframes countUp { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
@keyframes progFill { from { width:0 !important;} }
@keyframes shimmer { 0% { left:-70%;} 100% { left:120%;} }
@keyframes laserSpinF { to { --laser-angle: 360deg;} }
@keyframes ringDraw { from { stroke-dashoffset: 339;} }
@keyframes ringGlow { 0%,100% { filter: drop-shadow(0 0 5px rgba(var(--color-primary-rgb), .7));} 50% { filter: drop-shadow(0 0 16px rgba(var(--color-primary-rgb), 1)) drop-shadow(0 0 32px rgba(var(--color-primary-rgb), .45));} }
@keyframes dotIn { from { opacity:0; transform: scale(.3);} to { opacity:1; transform: scale(1);} }
@keyframes dotBreath { 0%,100% { box-shadow: 0 0 8px rgba(var(--color-primary-rgb), .5), 0 0 18px rgba(var(--color-primary-rgb), .25);} 50% { box-shadow: 0 0 20px rgba(var(--color-primary-rgb), .6), 0 0 40px rgba(var(--color-primary-rgb), .4);} }
@keyframes nameGlow { 0%,100% { text-shadow: 0 0 14px rgba(var(--color-primary-rgb), .55), 0 0 32px rgba(var(--color-primary-rgb), .2);} 50% { text-shadow: 0 0 26px rgba(var(--color-primary-rgb), .9), 0 0 64px rgba(var(--color-primary-rgb), .4);} }
@keyframes badgePop { from { opacity:0; transform: scale(.7) translateX(-6px);} to { opacity:1; transform: scale(1) translateX(0);} }
@keyframes barRise { from { transform: scaleY(0);} to { transform: scaleY(1);} }
@keyframes tabFade { from { opacity:0; transform: translateY(6px);} to { opacity:1; transform: translateY(0);} }
@keyframes overlayInF { from { opacity:0;} to { opacity:1;} }
@keyframes modalInF { from { opacity:0; transform: translateY(28px) scale(.95);} to { opacity:1; transform: translateY(0) scale(1);} }
@keyframes seriesInF { from { opacity:0; transform: translateX(-10px);} to { opacity:1; transform: translateX(0);} }

.fisico-page .fade-up { animation: fadeUp .5s cubic-bezier(.22,.68,0,1.2) both; }

/* SpotCard */
.fisico-card { background: rgba(255,255,255,.05); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; position: relative; overflow: hidden; transition: transform .3s cubic-bezier(.22,.68,0,1.2), box-shadow .3s, border-color .3s; --mx: 50%; --my: 50%; --laser-angle: 0deg; }
.fisico-card:hover { box-shadow: 0 12px 44px rgba(0,0,0,.6), 0 0 0 1px var(--border-h); border-color: var(--border-h); }
.fisico-card.glow:hover { box-shadow: 0 12px 44px rgba(0,0,0,.6), 0 0 30px rgba(var(--color-primary-rgb), .12); }
.fisico-laser { position: absolute; inset: -1px; border-radius: 15px; background: conic-gradient(from var(--laser-angle), transparent 0deg, var(--green) 12deg, var(--green-subtle) 22deg, transparent 38deg); padding: 1px; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity .4s; animation: laserSpinF 5s linear infinite; pointer-events: none; z-index: 3; }
.fisico-card:hover .fisico-laser { opacity: 1; }
.fisico-spot { position: absolute; inset: 0; border-radius: 14px; background: radial-gradient(280px circle at var(--mx) var(--my), rgba(255,255,255,.055) 0%, transparent 70%); opacity: 0; transition: opacity .25s; pointer-events: none; z-index: 2; }
.fisico-card:hover .fisico-spot { opacity: 1; }
.fisico-page .card-label { font-size: 10px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-3); margin-bottom: 10px; display: flex; align-items: center; gap: 5px; }

/* Progress bar */
.fisico-page .prog-wrap { height: 4px; background: rgba(255,255,255,.07); border-radius: 2px; overflow: hidden; position: relative; }
.fisico-page .prog-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--green), var(--green-subtle)); box-shadow: 0 0 8px rgba(var(--color-primary-rgb), .5), 0 0 16px rgba(var(--color-primary-rgb), .3); position: relative; overflow: hidden; animation: progFill .9s cubic-bezier(.22,.68,0,1.2) .4s both; }
.fisico-page .prog-fill::after { content: ''; position: absolute; top: 0; left: -70%; height: 100%; width: 45%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent); animation: shimmer 2.5s ease-in-out 1.4s infinite; }

/* Header */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.pillar-label { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-3); margin-bottom: 4px; }
.pillar-title { font-size: 24px; font-weight: 800; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; line-height: 1.1; flex-wrap: wrap; }
@media (min-width: 768px) { .pillar-title { font-size: 30px; } }
.pillar-title-text { color: var(--green); animation: nameGlow 3s ease-in-out infinite; }
.pillar-badge { font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--green); background: rgba(var(--color-primary-rgb), .12); border: 1px solid rgba(var(--color-primary-rgb), .22); border-radius: 20px; padding: 3px 10px; display: inline-flex; align-items: center; gap: 4px; animation: badgePop .5s cubic-bezier(.22,.68,0,1.2) .5s both; }
.pillar-sub { font-size: 12px; color: var(--text-3); margin-top: 4px; }

/* Register button */
.reg-btn { display: flex; align-items: center; gap: 7px; background: rgba(255,255,255,.06); border: 1px solid var(--border-h); color: var(--text-1); font-size: 13px; font-weight: 600; border-radius: 10px; padding: 9px 16px; cursor: pointer; transition: background .2s, border-color .2s, box-shadow .2s, transform .15s; }
.reg-btn:hover { background: rgba(var(--color-primary-rgb), .12); border-color: rgba(var(--color-primary-rgb), .3); box-shadow: 0 0 24px rgba(var(--color-primary-rgb), .2); }
.reg-btn:active { transform: scale(.96); }

/* Stat grid — mobile first */
.stat-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 14px; }
@media (min-width: 880px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
.score-num { font-size: 52px; font-weight: 800; letter-spacing: -2.5px; line-height: 1; font-family: 'JetBrains Mono', monospace; color: var(--green); text-shadow: 0 0 24px rgba(var(--color-primary-rgb), .4); animation: countUp .6s ease both; }
.score-denom { font-size: 18px; font-weight: 400; color: var(--text-3); font-family: 'Inter', sans-serif; }
.score-week { font-size: 11px; color: var(--text-2); margin-top: 4px; }
.ring-arc { fill: none; stroke: var(--green); stroke-width: 7; stroke-linecap: round; animation: ringDraw .9s cubic-bezier(.22,.68,0,1.2) .3s both, ringGlow 2.5s ease-in-out 1.2s infinite; transform-origin: center; }
.ring-bg { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 7; }
.goal-label { font-size: 9px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-3); margin-bottom: 6px; }
.peso-num { font-size: 46px; font-weight: 800; letter-spacing: -2px; font-family: 'JetBrains Mono', monospace; animation: countUp .6s ease .1s both; }
.vol-num { font-size: 46px; font-weight: 800; letter-spacing: -2px; font-family: 'JetBrains Mono', monospace; color: var(--green); text-shadow: 0 0 20px rgba(var(--color-primary-rgb), .4); animation: countUp .6s ease .2s both; }

/* Tabs */
.tabs-track { display: grid; grid-template-columns: repeat(3, 1fr); background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 9px; padding: 3px; position: relative; margin-bottom: 14px; }
.tab-pill { position: absolute; top: 3px; height: calc(100% - 6px); background: linear-gradient(135deg, rgba(var(--color-primary-rgb), .2), rgba(var(--color-primary-rgb), .12)); border: 1px solid rgba(var(--color-primary-rgb), .22); border-radius: 7px; transition: left .3s cubic-bezier(.22,.68,0,1.2), width .3s cubic-bezier(.22,.68,0,1.2); box-shadow: 0 0 20px rgba(var(--color-primary-rgb), .15); pointer-events: none; z-index: 1; }
.tab-btn { position: relative; z-index: 2; padding: 9px; font-size: 12px; font-weight: 500; border: none; border-radius: 7px; cursor: pointer; background: transparent; color: var(--text-2); transition: color .2s; }
.tab-btn.active { color: var(--green); font-weight: 600; }
.tab-btn:not(.active):hover { color: var(--text-1); }
.tab-content { animation: tabFade .3s ease both; }

/* Frequency dots */
.freq-section { background: rgba(255,255,255,.03); border: 1px solid var(--border); border-radius: 14px; padding: 14px 18px; margin-bottom: 14px; }
.freq-dot { width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); opacity: 0; animation: dotIn .3s ease both; cursor: default; transition: transform .2s, box-shadow .2s; }
.freq-dot:hover { transform: scale(1.35); }
.freq-dot.done { background: var(--green); border-color: var(--green); box-shadow: 0 0 7px rgba(var(--color-primary-rgb), .5); }
.freq-dot.today { background: var(--green); border-color: var(--green-subtle); animation: dotIn .3s ease both, dotBreath 2.2s ease-in-out .6s infinite; }
.freq-dot.empty { background: rgba(255,255,255,.05); }

/* Week grid */
.week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.day-card { background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 9px; padding: 14px 10px; text-align: center; cursor: pointer; transition: transform .2s cubic-bezier(.22,.68,0,1.2), box-shadow .2s, border-color .2s, background .2s; animation: fadeUp .4s ease both; position: relative; overflow: hidden; }
.day-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.5); border-color: var(--border-h); }
.day-card.active { background: rgba(var(--color-primary-rgb), .1); border-color: rgba(var(--color-primary-rgb), .3); box-shadow: 0 0 24px rgba(var(--color-primary-rgb), .12); }
.day-name { font-size: 9px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-3); margin-bottom: 8px; }
.day-num { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; line-height: 1; }
.day-card.active .day-num { color: var(--green); text-shadow: 0 0 12px rgba(var(--color-primary-rgb), .5); }
.day-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); margin: 8px auto 0; box-shadow: 0 0 8px rgba(var(--color-primary-rgb), .6); animation: dotBreath 2s ease-in-out infinite; }

/* Routines */
.routine-card { background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; margin-bottom: 10px; transition: border-color .2s, background .2s, transform .2s; animation: fadeUp .4s ease both; }
.routine-card:hover { border-color: var(--border-h); background: rgba(255,255,255,.06); transform: translateX(2px); }
.chip { font-size: 10px; font-weight: 500; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.09); color: var(--text-2); }
.chip.red { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.25); color: #f87171; }
.start-btn { display: flex; align-items: center; gap: 6px; background: var(--green); border: none; color: #000; font-size: 12px; font-weight: 700; border-radius: 8px; padding: 8px 16px; cursor: pointer; transition: background .15s, box-shadow .15s, transform .1s; box-shadow: 0 0 20px rgba(var(--color-primary-rgb), .3); white-space: nowrap; }
.start-btn:hover { background: var(--green-subtle); box-shadow: 0 0 28px rgba(var(--color-primary-rgb), .5); }
.start-btn:active { transform: scale(.95); }
.icon-btn { width: 30px; height: 30px; border-radius: 8px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); color: var(--text-3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color .15s, border-color .15s, background .15s; }
.icon-btn:hover { color: var(--text-1); border-color: var(--border-h); background: rgba(255,255,255,.08); }
.icon-btn.danger:hover { color: #f87171; border-color: rgba(248,113,113,.35); background: rgba(248,113,113,.08); }
.new-routine { width: 100%; padding: 14px; border-radius: 14px; background: transparent; border: 1px dashed rgba(255,255,255,.12); color: var(--text-3); font-size: 13px; font-weight: 500; cursor: pointer; transition: border-color .2s, color .2s, background .2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.new-routine:hover { border-color: rgba(var(--color-primary-rgb), .3); color: var(--green); background: rgba(var(--color-primary-rgb), .08); }

/* Stats */
.stats-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 12px; }
@media (min-width: 880px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
.history-card { background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 9px; padding: 14px 16px; margin-bottom: 8px; cursor: pointer; transition: border-color .15s, background .15s, transform .2s; animation: fadeUp .4s ease both; }
.history-card:hover { border-color: var(--border-h); background: rgba(255,255,255,.06); transform: translateX(2px); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,.82); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; animation: overlayInF .2s ease both; }
.modal-box { background: #0e1014; border: 1px solid var(--border-h); border-radius: 18px; padding: 28px; width: 440px; max-width: calc(100vw - 32px); box-shadow: 0 32px 80px rgba(0,0,0,.9), 0 0 40px rgba(var(--color-primary-rgb), .08); animation: modalInF .3s cubic-bezier(.22,.68,0,1.2) both; max-height: 85vh; overflow-y: auto; position: relative; }
.modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-3); cursor: pointer; transition: color .15s; }
.modal-close:hover { color: var(--text-1); }
.w-input { width: 100%; font-size: 52px; font-weight: 800; font-family: 'JetBrains Mono', monospace; text-align: center; background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 9px; color: var(--green); padding: 16px; outline: none; transition: border-color .15s, box-shadow .15s; text-shadow: 0 0 24px rgba(var(--color-primary-rgb), .4); -moz-appearance: textfield; }
.w-input::-webkit-outer-spin-button, .w-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.w-input:focus { border-color: rgba(var(--color-primary-rgb), .3); box-shadow: 0 0 20px rgba(var(--color-primary-rgb), .12); }

/* Primary button */
.fisico-page .primary-btn { width: 100%; padding: 13px; border-radius: 9px; background: var(--green); border: none; color: #000; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background .15s, box-shadow .15s, transform .1s, opacity .15s; box-shadow: 0 0 24px rgba(var(--color-primary-rgb), .3), 0 0 48px rgba(var(--color-primary-rgb), .15); }
.fisico-page .primary-btn:hover:not(:disabled) { background: var(--green-subtle); box-shadow: 0 0 32px rgba(var(--color-primary-rgb), .5); }
.fisico-page .primary-btn:active:not(:disabled) { transform: scale(.97); }
.fisico-page .primary-btn:disabled { opacity: .4; cursor: not-allowed; }

/* Active workout overlay */
.workout-overlay { position: fixed; inset: 0; z-index: 60; background: #0b0c10; overflow: auto; animation: overlayInF .2s ease both; }
.workout-inner { max-width: 720px; margin: 0 auto; padding: 28px 24px 60px; animation: fadeUp .35s cubic-bezier(.22,.68,0,1.2) both; }
.ex-block { background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; }
.series-block { background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 9px; padding: 16px; transition: border-color .2s, background .2s; animation: seriesInF .3s ease both; }
.series-block.done { background: rgba(var(--color-primary-rgb), .08); border-color: rgba(var(--color-primary-rgb), .2); }
.mark-btn { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,.07); border: 1px solid var(--border-h); color: var(--text-2); font-size: 11px; font-weight: 600; border-radius: 6px; padding: 5px 12px; cursor: pointer; transition: all .2s; }
.mark-btn:hover { background: rgba(var(--color-primary-rgb), .12); border-color: rgba(var(--color-primary-rgb), .22); color: var(--green); }
.mark-btn.done { background: rgba(var(--color-primary-rgb), .15); border-color: rgba(var(--color-primary-rgb), .3); color: var(--green); }

/* Add set button */
.add-set-btn { width: 100%; padding: 10px; border-radius: 9px; background: transparent; border: 1px dashed rgba(255,255,255,.14); color: var(--text-3); font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: border-color .2s, color .2s, background .2s; }
.add-set-btn:hover { border-color: color-mix(in srgb, var(--c) 35%, transparent); color: var(--c); background: color-mix(in srgb, var(--c) 6%, transparent); }

/* Tonnage record celebration */
@keyframes recordIn {
  0% { opacity: 0; transform: translateY(40px) scale(.8); }
  60% { transform: translateY(-6px) scale(1.04); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes trophyPulse {
  0%, 100% { transform: scale(1) rotate(-4deg); filter: drop-shadow(0 0 16px rgba(var(--color-accent-rgb), .7)); }
  50% { transform: scale(1.12) rotate(4deg); filter: drop-shadow(0 0 28px rgba(var(--color-accent-rgb), 1)) drop-shadow(0 0 56px rgba(var(--color-accent-rgb), .5)); }
}
@keyframes confettiFall {
  0% { opacity: 0; transform: translate(var(--xs, 0), -40vh) rotate(0deg); }
  10% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--xe, 0), 60vh) rotate(720deg); }
}
@keyframes shimmerText {
  0% { background-position: -200% 50%; }
  100% { background-position: 200% 50%; }
}
.record-overlay {
  position: fixed; inset: 0; z-index: 80;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at center, rgba(var(--color-primary-rgb), .2), rgba(0,0,0,.85) 60%);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  animation: overlayInF .25s ease both;
  cursor: pointer;
}
.record-burst { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.confetti {
  position: absolute; top: 50%; left: 50%; width: 10px; height: 14px; border-radius: 2px;
  --xs: calc((var(--i) - 12) * 6px);
  --xe: calc((var(--i) - 12) * 22px);
  background: hsl(calc(var(--i) * 30), 90%, 60%);
  animation: confettiFall 1.6s cubic-bezier(.22,.68,0,1.2) calc(var(--i) * 0.04s) forwards;
  box-shadow: 0 0 8px currentColor;
}
.record-card {
  position: relative; cursor: default;
  background: linear-gradient(140deg, rgba(var(--color-primary-rgb), .18), rgba(15,16,22,.96) 50%, rgba(var(--color-accent-rgb), .12));
  border: 1px solid rgba(var(--color-primary-rgb), .4);
  border-radius: 22px;
  padding: 36px 30px 28px;
  width: 420px; max-width: calc(100vw - 32px);
  text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,.85), 0 0 64px rgba(var(--color-primary-rgb), .3), 0 0 120px rgba(var(--color-accent-rgb), .15);
  animation: recordIn .55s cubic-bezier(.22,.68,0,1.2) both;
}
.record-trophy {
  width: 78px; height: 78px; border-radius: 50%;
  margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, rgba(var(--color-accent-rgb), .35), rgba(var(--color-accent-rgb), .05) 70%);
  border: 2px solid rgba(var(--color-accent-rgb), .55);
  color: var(--gold);
  animation: trophyPulse 1.6s ease-in-out infinite;
}
.record-title {
  font-size: 26px; font-weight: 900; letter-spacing: -.5px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--gold) 50%, var(--color-primary) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  animation: shimmerText 2.8s linear infinite;
  margin-bottom: 6px;
}
.record-sub { font-size: 13px; color: var(--text-2); margin-bottom: 18px; }
.record-stats {
  display: flex; align-items: center; justify-content: center; gap: 18px;
  margin-bottom: 14px;
  background: rgba(0,0,0,.3); border: 1px solid var(--border);
  border-radius: 14px; padding: 12px 16px;
}
.rs-label { font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-3); margin-bottom: 4px; }
.rs-val { font-size: 22px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--text-2); line-height: 1; }
.rs-val.rs-up { color: var(--green); text-shadow: 0 0 16px rgba(var(--color-primary-rgb), .6); }
.rs-arrow { font-size: 22px; color: var(--green); font-weight: 700; }
.record-delta {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 700; color: var(--green);
  background: rgba(var(--color-primary-rgb), .12); border: 1px solid rgba(var(--color-primary-rgb), .3);
  padding: 6px 14px; border-radius: 20px;
  margin-bottom: 12px;
}
.record-xp {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 800; color: var(--gold);
  background: rgba(var(--color-accent-rgb), .12); border: 1px solid rgba(var(--color-accent-rgb), .4);
  padding: 8px 16px; border-radius: 20px;
  margin-bottom: 22px;
  box-shadow: 0 0 24px rgba(var(--color-accent-rgb), .25);
}
.record-close {
  width: 100%; padding: 12px;
  background: var(--green); border: none; color: #000;
  font-size: 14px; font-weight: 800; border-radius: 10px;
  cursor: pointer; transition: filter .15s, transform .1s;
  box-shadow: 0 0 28px rgba(var(--color-primary-rgb), .45);
}
.record-close:hover { filter: brightness(1.1); }
.record-close:active { transform: scale(.97); }
`
