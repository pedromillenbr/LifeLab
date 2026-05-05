export type Pillar = 'fisico' | 'mental' | 'financeiro' | 'produtividade' | 'disciplina' | 'espiritual'

export interface Habit {
  id: string
  name: string
  pillar: Pillar
  frequency: 'daily' | 'weekly' | 'monthly'
  completions: string[] // ISO date strings
  xpReward: number
  createdAt: string
  color?: string
  icon?: string
}

export interface Mission {
  id: string
  title: string
  date: string // ISO date
  completed: boolean
  xpReward: number
  pillar?: Pillar
}

export interface WeightEntry {
  id: string
  date: string
  weight: number // kg
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number // positive = receita, negative = despesa
  category: 'alimentacao' | 'transporte' | 'lazer' | 'saude' | 'educacao' | 'outros' | 'receita'
  type: 'receita' | 'despesa'
}

export interface PrayerEntry {
  id: string
  date: string
  completed: boolean
  reflection?: string
}

export interface BibleReading {
  id: string
  date: string
  planId: string
  passage: string
  completed: boolean
  reflection?: string
}

export interface BiblePlanProgress {
  planId: string
  currentDay: number
  completedDays: number[]
  startedAt: string
  updatedAt: string
}

export interface WorkoutRoutine {
  id: string
  name: string
  exercises: Exercise[]
  createdAt: string
}

export interface Exercise {
  id: string
  name: string
  sets: WorkoutSet[]
  muscleGroup: string
}

export interface WorkoutSet {
  id: string
  reps: number
  weight: number
  completed: boolean
}

export interface WorkoutSession {
  id: string
  routineId: string
  routineName: string
  date: string
  duration: number // minutes
  exercises: Exercise[]
  volume: number // total kg
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'treino' | 'custom'
  color?: string
}

export interface UserProfile {
  name: string
  bio: string
  avatar: string | null
  level: number
  xp: number
  xpToNextLevel: number
  primaryColor: string
  darkMode: boolean
  notifications: boolean
  currency: string
  language: string
  createdAt: string
}

export interface PillarScores {
  fisico: number
  mental: number
  financeiro: number
  produtividade: number
  disciplina: number
  espiritual: number
}

export type Meal = string

export interface CustomMeal {
  id: string
  label: string
  icon: string  // chave do MEAL_ICONS map
}

export interface FoodEntry {
  id: string
  name: string
  quantity: string      // free-form: "100g", "1 unidade"
  calories: number
  protein?: number      // g
  carbs?: number        // g
  fat?: number          // g
  meal: Meal
  date: string          // YYYY-MM-DD
  createdAt: string
}

export interface DietGoals {
  calories: number      // kcal
  protein?: number      // g
  carbs?: number        // g
  fat?: number          // g
  waterGoal?: number    // litros/dia
}

export interface WaterLog {
  date: string   // YYYY-MM-DD
  ml: number     // total consumido no dia em ml
}
