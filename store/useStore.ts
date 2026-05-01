'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Habit, Mission, WeightEntry, Transaction,
  BibleReading, PrayerEntry, WorkoutRoutine, WorkoutSession,
  CalendarEvent, UserProfile, PillarScores, Pillar, BiblePlanProgress,
} from './types'
import { getBiblePlan, readingsLabel } from '@/lib/bibleData'

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

  // Access tracking — Constância da Vitória
  accessLog: string[]
  recordAccess: () => void
  getAccessStreak: () => number

  // Bible reading plans (multi-plan progress, single-active)
  biblePlansProgress: Record<string, BiblePlanProgress>
  startBiblePlan: (planId: string) => void
  pauseBiblePlan: (planId: string) => void
  resumeBiblePlan: (planId: string) => void
  markBiblePlanDayRead: (planId: string, day: number) => void
  resetBiblePlan: (planId: string) => void
  isBiblePlanDayCompleted: (planId: string, day: number) => boolean

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
  name: 'Usuário',
  bio: '',
  avatar: null,
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  primaryColor: '#ef4444',
  darkMode: true,
  notifications: true,
  currency: 'BRL',
  language: 'pt',
  createdAt: today(),
}

const defaultHabits: Habit[] = []

const defaultRoutines: WorkoutRoutine[] = []

export const useStore = create<AuraStore>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      habits: defaultHabits,
      missions: [],
      weightLog: [],
      transactions: [],
      bibleReadings: [],
      activePlanId: 'nt1year',
      prayerLog: [],
      accessLog: [],
      routines: defaultRoutines,
      workoutSessions: [],
      calendarEvents: [],
      biblePlansProgress: {},

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

      recordAccess: () => set((s) => {
        const t = today()
        if (s.accessLog.includes(t)) return {}
        return { accessLog: [...s.accessLog, t] }
      }),

      getAccessStreak: () => {
        const log = get().accessLog
        if (log.length === 0) return 0
        const set = new Set(log)
        let streak = 0
        const d = new Date()
        while (true) {
          const ds = d.toISOString().split('T')[0]
          if (set.has(ds)) { streak++; d.setDate(d.getDate() - 1) }
          else break
        }
        return streak
      },

      startBiblePlan: (planId) => set((s) => {
        const plan = getBiblePlan(planId)
        if (!plan) return {}
        const now = new Date().toISOString()
        const existing = s.biblePlansProgress[planId]
        if (existing) {
          // already has progress — just make this the active one (resume)
          return {
            activePlanId: planId,
            biblePlansProgress: {
              ...s.biblePlansProgress,
              [planId]: { ...existing, updatedAt: now },
            },
          }
        }
        return {
          biblePlansProgress: {
            ...s.biblePlansProgress,
            [planId]: {
              planId, currentDay: 1, completedDays: [],
              startedAt: now, updatedAt: now,
            },
          },
          activePlanId: planId,
        }
      }),

      pauseBiblePlan: (planId) => set((s) => {
        if (s.activePlanId !== planId) return {}
        return { activePlanId: '' }
      }),

      resumeBiblePlan: (planId) => set((s) => {
        if (!s.biblePlansProgress[planId]) return {}
        return { activePlanId: planId }
      }),

      markBiblePlanDayRead: (planId, day) => set((s) => {
        const plan = getBiblePlan(planId)
        if (!plan) return {}
        const existing = s.biblePlansProgress[planId]
        const now = new Date().toISOString()
        const base: BiblePlanProgress = existing || {
          planId, currentDay: 1, completedDays: [],
          startedAt: now, updatedAt: now,
        }
        if (base.completedDays.includes(day)) return {} // already done — block double-credit
        if (day < 1 || day > plan.duration) return {}

        const completedDays = [...base.completedDays, day].sort((a, b) => a - b)
        const currentDay = Math.min(plan.duration, Math.max(base.currentDay, day + 1))

        // Side-effects: spiritual habit (existing system) + XP
        const t = today()
        const dayDef = plan.days.find(d => d.day === day)
        const passage = dayDef ? readingsLabel(dayDef.readings) : `Dia ${day}`
        const alreadyToday = s.bibleReadings.some(r => r.date === t && r.planId === planId && r.completed)

        let bibleReadings = s.bibleReadings
        let profile = s.profile
        if (!alreadyToday) {
          bibleReadings = [
            ...s.bibleReadings,
            { id: generateId(), date: t, planId, passage, completed: true },
          ]
          const newXP = s.profile.xp + 15
          const { level, xpToNext } = getLevelFromXP(newXP)
          profile = { ...s.profile, xp: newXP, level, xpToNextLevel: xpToNext }
        }

        return {
          biblePlansProgress: {
            ...s.biblePlansProgress,
            [planId]: { ...base, completedDays, currentDay, updatedAt: now },
          },
          bibleReadings,
          profile,
        }
      }),

      resetBiblePlan: (planId) => set((s) => {
        const next = { ...s.biblePlansProgress }
        delete next[planId]
        const patch: Partial<AuraStore> = { biblePlansProgress: next }
        if (s.activePlanId === planId) patch.activePlanId = ''
        return patch
      }),

      isBiblePlanDayCompleted: (planId, day) => {
        const p = get().biblePlansProgress[planId]
        return !!p && p.completedDays.includes(day)
      },

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
        accessLog:      state.accessLog,
        routines:       state.routines,
        workoutSessions: state.workoutSessions,
        calendarEvents: state.calendarEvents,
        biblePlansProgress: state.biblePlansProgress,
      }),
    }
  )
)
