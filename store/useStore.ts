'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Habit, Mission, WeightEntry, Transaction,
  BibleReading, PrayerEntry, WorkoutRoutine, WorkoutSession,
  CalendarEvent, UserProfile, PillarScores, Pillar
} from './types'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function today() {
  return new Date().toISOString().split('T')[0]
}

const XP_PER_LEVEL = [0, 100, 250, 520, 1000, 2000, 4000, 8000, 16000, 32000]

function getLevelFromXP(xp: number): { level: number; xpToNext: number; xpInLevel: number } {
  let level = 1
  for (let i = 1; i < XP_PER_LEVEL.length; i++) {
    if (xp >= XP_PER_LEVEL[i]) level = i + 1
    else break
  }
  const xpStart = XP_PER_LEVEL[level - 1] || 0
  const xpEnd = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1] * 2
  return { level, xpToNext: xpEnd, xpInLevel: xp - xpStart }
}

interface AuraStore {
  // Profile
  profile: UserProfile
  updateProfile: (p: Partial<UserProfile>) => void
  addXP: (amount: number) => void

  // Habits
  habits: Habit[]
  addHabit: (h: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => void
  removeHabit: (id: string) => void
  toggleHabitCompletion: (id: string, date?: string) => void
  updateHabit: (id: string, h: Partial<Habit>) => void

  // Missions
  missions: Mission[]
  addMission: (m: Omit<Mission, 'id'>) => void
  removeMission: (id: string) => void
  toggleMission: (id: string) => void

  // Weight
  weightLog: WeightEntry[]
  addWeight: (weight: number) => void
  removeWeight: (id: string) => void

  // Transactions
  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void

  // Bible
  bibleReadings: BibleReading[]
  activePlanId: string
  setActivePlan: (id: string) => void
  completeBibleReading: (date: string, planId: string, passage: string, reflection?: string) => void
  updateReflection: (id: string, reflection: string) => void

  // Prayer
  prayerLog: PrayerEntry[]
  completePrayer: (date: string) => void
  updatePrayerReflection: (id: string, reflection: string) => void

  // Workout
  routines: WorkoutRoutine[]
  addRoutine: (r: Omit<WorkoutRoutine, 'id' | 'createdAt'>) => void
  removeRoutine: (id: string) => void
  updateRoutine: (id: string, r: Partial<WorkoutRoutine>) => void
  workoutSessions: WorkoutSession[]
  addWorkoutSession: (s: Omit<WorkoutSession, 'id'>) => void

  // Calendar
  calendarEvents: CalendarEvent[]
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => void
  removeCalendarEvent: (id: string) => void

  // Computed
  getPillarScores: () => PillarScores
  getOverallScore: () => number
  getHabitStreak: (habitId: string) => number
  getBibleStreak: () => number
  getBalance: () => number
  getTodayMissions: () => Mission[]
  getCompletedHabitsToday: () => Habit[]
}

const defaultProfile: UserProfile = {
  name: 'Pedro',
  bio: 'Hunt or be hunted...',
  avatar: null,
  level: 3,
  xp: 512,
  xpToNextLevel: 520,
  primaryColor: '#ef4444',
  darkMode: true,
  notifications: true,
  currency: 'BRL',
  language: 'pt',
}

const defaultHabits: Habit[] = [
  { id: 'h1', name: 'Treino', pillar: 'fisico', frequency: 'daily', completions: [], xpReward: 20, createdAt: '2024-01-01', icon: '★' },
  { id: 'h2', name: 'Meditação', pillar: 'mental', frequency: 'daily', completions: [], xpReward: 15, createdAt: '2024-01-01', icon: '◉' },
  { id: 'h3', name: 'Leitura', pillar: 'produtividade', frequency: 'daily', completions: [], xpReward: 15, createdAt: '2024-01-01', icon: '▣' },
  { id: 'h4', name: 'Água 2L', pillar: 'fisico', frequency: 'daily', completions: [], xpReward: 10, createdAt: '2024-01-01', icon: '💧' },
  { id: 'h5', name: 'Sem redes sociais', pillar: 'disciplina', frequency: 'daily', completions: [], xpReward: 20, createdAt: '2024-01-01', icon: '📵' },
]

const defaultRoutines: WorkoutRoutine[] = [
  {
    id: 'r1', name: 'Legday', createdAt: '2026-03-18',
    exercises: [
      { id: 'e1', name: 'Agachamento livre', muscleGroup: 'quadriceps', sets: [{ id: 's1', reps: 10, weight: 40, completed: false }, { id: 's2', reps: 8, weight: 40, completed: false }, { id: 's3', reps: 7, weight: 40, completed: false }] },
      { id: 'e2', name: 'Leg press', muscleGroup: 'quadriceps', sets: [{ id: 's4', reps: 12, weight: 80, completed: false }, { id: 's5', reps: 11, weight: 80, completed: false }, { id: 's6', reps: 9, weight: 80, completed: false }] },
      { id: 'e3', name: 'Cadeira extensora', muscleGroup: 'quadriceps', sets: [{ id: 's7', reps: 12, weight: 54, completed: false }, { id: 's8', reps: 12, weight: 54, completed: false }, { id: 's9', reps: 12, weight: 54, completed: false }] },
      { id: 'e4', name: 'Cadeira flexora', muscleGroup: 'biceps_femoral', sets: [{ id: 's10', reps: 12, weight: 42, completed: false }, { id: 's11', reps: 7, weight: 30, completed: false }, { id: 's12', reps: 6, weight: 30, completed: false }] },
      { id: 'e5', name: 'Adutora', muscleGroup: 'adutores', sets: [{ id: 's13', reps: 12, weight: 54, completed: false }, { id: 's14', reps: 12, weight: 54, completed: false }, { id: 's15', reps: 0, weight: 54, completed: false }] },
      { id: 'e6', name: 'Agachamento sumô', muscleGroup: 'gluteos', sets: [{ id: 's16', reps: 0, weight: 30, completed: false }, { id: 's17', reps: 0, weight: 30, completed: false }, { id: 's18', reps: 0, weight: 30, completed: false }] },
    ]
  },
  {
    id: 'r2', name: 'Pull', createdAt: '2026-03-18',
    exercises: [
      { id: 'e7', name: 'Puxada frontal', muscleGroup: 'costas', sets: [{ id: 's19', reps: 10, weight: 50, completed: false }, { id: 's20', reps: 10, weight: 50, completed: false }, { id: 's21', reps: 10, weight: 50, completed: false }] },
      { id: 'e8', name: 'Remada curvada', muscleGroup: 'costas', sets: [{ id: 's22', reps: 10, weight: 40, completed: false }, { id: 's23', reps: 10, weight: 40, completed: false }, { id: 's24', reps: 10, weight: 40, completed: false }] },
      { id: 'e9', name: 'Rosca direta', muscleGroup: 'biceps', sets: [{ id: 's25', reps: 12, weight: 20, completed: false }, { id: 's26', reps: 12, weight: 20, completed: false }, { id: 's27', reps: 10, weight: 20, completed: false }] },
    ]
  },
  {
    id: 'r3', name: 'Push - Peito Ombro Tríceps', createdAt: '2026-03-18',
    exercises: [
      { id: 'e10', name: 'Supino reto', muscleGroup: 'peitoral', sets: [{ id: 's28', reps: 10, weight: 60, completed: false }, { id: 's29', reps: 10, weight: 60, completed: false }, { id: 's30', reps: 8, weight: 60, completed: false }] },
      { id: 'e11', name: 'Desenvolvimento', muscleGroup: 'deltoides', sets: [{ id: 's31', reps: 10, weight: 30, completed: false }, { id: 's32', reps: 10, weight: 30, completed: false }, { id: 's33', reps: 10, weight: 30, completed: false }] },
      { id: 'e12', name: 'Tríceps corda', muscleGroup: 'triceps', sets: [{ id: 's34', reps: 15, weight: 25, completed: false }, { id: 's35', reps: 15, weight: 25, completed: false }, { id: 's36', reps: 12, weight: 25, completed: false }] },
    ]
  },
]

export const useStore = create<AuraStore>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      habits: defaultHabits,
      missions: [
        { id: 'm1', title: 'Fazer treino', date: today(), completed: false, xpReward: 20, pillar: 'fisico' },
        { id: 'm2', title: 'Ler a Bíblia', date: today(), completed: false, xpReward: 15, pillar: 'espiritual' },
        { id: 'm3', title: 'Revisar finanças', date: today(), completed: false, xpReward: 10, pillar: 'financeiro' },
      ],
      weightLog: [
        { id: 'w1', date: '2026-04-15', weight: 66 },
        { id: 'w2', date: '2026-04-17', weight: 65 },
        { id: 'w3', date: '2026-04-18', weight: 64 },
        { id: 'w4', date: '2026-04-19', weight: 63 },
        { id: 'w5', date: today(), weight: 63 },
      ],
      transactions: [
        { id: 't1', date: '2026-04-01', description: 'Salário', amount: 600, category: 'receita', type: 'receita' },
        { id: 't2', date: '2026-04-03', description: 'Aluguel', amount: -150, category: 'outros', type: 'despesa' },
        { id: 't3', date: '2026-04-05', description: 'Supermercado', amount: -45, category: 'alimentacao', type: 'despesa' },
        { id: 't4', date: '2026-04-08', description: 'Academia', amount: -50, category: 'saude', type: 'despesa' },
        { id: 't5', date: '2026-04-10', description: 'Transporte', amount: -20, category: 'transporte', type: 'despesa' },
        { id: 't6', date: '2026-04-12', description: 'Farmácia', amount: -15, category: 'saude', type: 'despesa' },
        { id: 't7', date: '2026-04-15', description: 'Restaurante', amount: -30, category: 'alimentacao', type: 'despesa' },
        { id: 't8', date: '2026-04-18', description: 'Livro', amount: -25, category: 'educacao', type: 'despesa' },
      ],
      bibleReadings: [],
      activePlanId: 'nt1year',
      prayerLog: [],
      routines: defaultRoutines,
      workoutSessions: [
        { id: 'ws1', routineId: 'r3', routineName: 'Push - Peito Ombro Tríceps', date: '2026-04-13', duration: 58, exercises: [], volume: 2800 },
        { id: 'ws2', routineId: 'r2', routineName: 'Pull', date: '2026-04-07', duration: 52, exercises: [], volume: 1800 },
        { id: 'ws3', routineId: 'r1', routineName: 'Legday', date: '2026-04-08', duration: 65, exercises: [], volume: 4200 },
        { id: 'ws4', routineId: 'r3', routineName: 'Push - Peito Ombro Tríceps', date: '2026-04-01', duration: 60, exercises: [], volume: 2700 },
      ],
      calendarEvents: [
        { id: 'ce1', title: 'Push - Peito Ombro Tríceps', date: '2026-04-01', type: 'treino' },
        { id: 'ce2', title: 'Pull', date: '2026-04-07', type: 'treino' },
        { id: 'ce3', title: 'Legday', date: '2026-04-08', type: 'treino' },
        { id: 'ce4', title: 'Legday', date: '2026-04-10', type: 'treino' },
        { id: 'ce5', title: 'Push - Peito Ombro Tríceps', date: '2026-04-13', type: 'treino' },
      ],

      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      addXP: (amount) => set((s) => {
        const newXP = s.profile.xp + amount
        const { level, xpToNext } = getLevelFromXP(newXP)
        return { profile: { ...s.profile, xp: newXP, level, xpToNextLevel: xpToNext } }
      }),

      addHabit: (h) => set((s) => ({
        habits: [...s.habits, { ...h, id: generateId(), completions: [], createdAt: today() }]
      })),
      removeHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      toggleHabitCompletion: (id, date = today()) => set((s) => {
        const habits = s.habits.map((h) => {
          if (h.id !== id) return h
          const already = h.completions.includes(date)
          const completions = already ? h.completions.filter((d) => d !== date) : [...h.completions, date]
          return { ...h, completions }
        })
        const habit = s.habits.find((h) => h.id === id)
        const wasCompleted = habit?.completions.includes(date)
        if (!wasCompleted && habit) {
          const newXP = s.profile.xp + habit.xpReward
          const { level, xpToNext } = getLevelFromXP(newXP)
          return { habits, profile: { ...s.profile, xp: newXP, level, xpToNextLevel: xpToNext } }
        }
        return { habits }
      }),
      updateHabit: (id, h) => set((s) => ({
        habits: s.habits.map((hab) => hab.id === id ? { ...hab, ...h } : hab)
      })),

      addMission: (m) => set((s) => ({ missions: [...s.missions, { ...m, id: generateId() }] })),
      removeMission: (id) => set((s) => ({ missions: s.missions.filter((m) => m.id !== id) })),
      toggleMission: (id) => set((s) => {
        const missions = s.missions.map((m) => {
          if (m.id !== id) return m
          const completed = !m.completed
          return { ...m, completed }
        })
        const mission = s.missions.find((m) => m.id === id)
        if (mission && !mission.completed) {
          const newXP = s.profile.xp + mission.xpReward
          const { level, xpToNext } = getLevelFromXP(newXP)
          return { missions, profile: { ...s.profile, xp: newXP, level, xpToNextLevel: xpToNext } }
        }
        return { missions }
      }),

      addWeight: (weight) => set((s) => ({
        weightLog: [...s.weightLog, { id: generateId(), date: today(), weight }]
      })),
      removeWeight: (id) => set((s) => ({ weightLog: s.weightLog.filter((w) => w.id !== id) })),

      addTransaction: (t) => set((s) => ({
        transactions: [...s.transactions, { ...t, id: generateId() }]
      })),
      removeTransaction: (id) => set((s) => ({
        transactions: s.transactions.filter((t) => t.id !== id)
      })),

      setActivePlan: (id) => set({ activePlanId: id }),
      completeBibleReading: (date, planId, passage, reflection) => set((s) => {
        const existing = s.bibleReadings.find((r) => r.date === date && r.planId === planId)
        if (existing) {
          return {
            bibleReadings: s.bibleReadings.map((r) =>
              r.id === existing.id ? { ...r, completed: true, reflection } : r
            )
          }
        }
        const newXP = s.profile.xp + 15
        const { level, xpToNext } = getLevelFromXP(newXP)
        return {
          bibleReadings: [...s.bibleReadings, { id: generateId(), date, planId, passage, completed: true, reflection }],
          profile: { ...s.profile, xp: newXP, level, xpToNextLevel: xpToNext },
        }
      }),
      updateReflection: (id, reflection) => set((s) => ({
        bibleReadings: s.bibleReadings.map((r) => r.id === id ? { ...r, reflection } : r)
      })),

      completePrayer: (date) => set((s) => {
        if (s.prayerLog.find(p => p.date === date)) return {}
        const newXP = s.profile.xp + 10
        const { level, xpToNext } = getLevelFromXP(newXP)
        return {
          prayerLog: [...s.prayerLog, { id: generateId(), date, completed: true }],
          profile: { ...s.profile, xp: newXP, level, xpToNextLevel: xpToNext },
        }
      }),
      updatePrayerReflection: (id, reflection) => set((s) => ({
        prayerLog: s.prayerLog.map(p => p.id === id ? { ...p, reflection } : p)
      })),

      addRoutine: (r) => set((s) => ({
        routines: [...s.routines, { ...r, id: generateId(), createdAt: today() }]
      })),
      removeRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),
      updateRoutine: (id, r) => set((s) => ({
        routines: s.routines.map((ro) => ro.id === id ? { ...ro, ...r } : ro)
      })),
      addWorkoutSession: (s) => set((st) => ({
        workoutSessions: [...st.workoutSessions, { ...s, id: generateId() }]
      })),

      addCalendarEvent: (e) => set((s) => ({
        calendarEvents: [...s.calendarEvents, { ...e, id: generateId() }]
      })),
      removeCalendarEvent: (id) => set((s) => ({
        calendarEvents: s.calendarEvents.filter((e) => e.id !== id)
      })),

      getPillarScores: () => {
        const { habits, bibleReadings, workoutSessions } = get()
        const t = today()
        const last30 = Array.from({ length: 30 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]
        })

        const calcScore = (pillarHabits: Habit[]) => {
          if (pillarHabits.length === 0) return 0
          const possible = pillarHabits.length * 30
          const done = pillarHabits.reduce((acc, h) => acc + h.completions.filter((d) => last30.includes(d)).length, 0)
          return Math.min(100, Math.round((done / possible) * 100))
        }

        const fisicoHabits = habits.filter((h) => h.pillar === 'fisico')
        const mentalHabits = habits.filter((h) => h.pillar === 'mental')
        const financeiroHabits = habits.filter((h) => h.pillar === 'financeiro')
        const prodHabits = habits.filter((h) => h.pillar === 'produtividade')
        const discHabits = habits.filter((h) => h.pillar === 'disciplina')

        const bibleScore = Math.min(100, bibleReadings.filter((r) => r.completed && last30.includes(r.date)).length * (100 / 30))
        const workoutBonus = Math.min(40, workoutSessions.filter((s) => last30.includes(s.date)).length * 10)

        return {
          fisico: Math.min(100, calcScore(fisicoHabits) + workoutBonus),
          mental: Math.max(calcScore(mentalHabits), mentalHabits.length === 0 ? 70 : 0),
          financeiro: Math.max(calcScore(financeiroHabits), financeiroHabits.length === 0 ? 61 : 0),
          produtividade: Math.max(calcScore(prodHabits), prodHabits.length === 0 ? 94 : 0),
          disciplina: Math.max(calcScore(discHabits), discHabits.length === 0 ? 93 : 0),
          espiritual: Math.round(bibleScore),
        }
      },

      getOverallScore: () => {
        const scores = get().getPillarScores()
        const vals = Object.values(scores)
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      },

      getHabitStreak: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId)
        if (!habit) return 0
        let streak = 0
        const d = new Date()
        while (true) {
          const dateStr = d.toISOString().split('T')[0]
          if (habit.completions.includes(dateStr)) { streak++; d.setDate(d.getDate() - 1) }
          else break
        }
        return streak
      },

      getBibleStreak: () => {
        const { bibleReadings } = get()
        let streak = 0
        const d = new Date()
        while (true) {
          const dateStr = d.toISOString().split('T')[0]
          if (bibleReadings.some((r) => r.date === dateStr && r.completed)) { streak++; d.setDate(d.getDate() - 1) }
          else break
        }
        return streak
      },

      getBalance: () => get().transactions.reduce((acc, t) => acc + t.amount, 0),

      getTodayMissions: () => get().missions.filter((m) => m.date === today()),

      getCompletedHabitsToday: () => {
        const t = today()
        return get().habits.filter((h) => h.completions.includes(t))
      },
    }),
    {
      name: 'lifelab-storage',
      skipHydration: true,
      partialize: (state) => ({
        profile:        state.profile,
        habits:         state.habits,
        missions:       state.missions,
        weightLog:      state.weightLog,
        transactions:   state.transactions,
        bibleReadings:  state.bibleReadings,
        activePlanId:   state.activePlanId,
        prayerLog:      state.prayerLog,
        routines:       state.routines,
        workoutSessions: state.workoutSessions,
        calendarEvents: state.calendarEvents,
      }),
    }
  )
)
