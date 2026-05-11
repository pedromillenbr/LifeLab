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

/* ─────────────────────  METAS DE LONGO PRAZO  ───────────────────── */

export type GoalCategory =
  | 'fisico' | 'financeiro' | 'estudo' | 'carreira'
  | 'pessoal' | 'lifestyle' | 'criativo' | 'outro'

export type GoalDirection = 'increase' | 'decrease'

/** Snapshot do valor da meta numa data (para a timeline). */
export interface GoalLog {
  id: string
  date: string         // ISO YYYY-MM-DD
  value: number        // valor *absoluto* na data
  note?: string
  createdAt: number    // epoch ms
}

export interface GoalMilestone {
  id: string
  label: string
  /** Valor que destrava o marco (ex: 1000 reais para meta 10k). */
  targetValue: number
  /** ISO date quando bateu — undefined enquanto não atingido. */
  achievedAt?: string
  /** Marco gerado automaticamente em 25/50/75/100% — não editável. */
  auto?: boolean
  emoji?: string
}

export interface Goal {
  id: string
  title: string
  subtitle?: string                // frase motivacional
  category: GoalCategory
  /** URL pública opcional para imagem de capa. Se vazio, usa preset por categoria. */
  coverImage?: string
  /** ID do preset visual (gradient + ícone). */
  coverPreset?: string

  startValue: number
  currentValue: number
  targetValue: number
  unit: string                     // 'kg' | 'R$' | 'h' | 'dias' | livre
  direction: GoalDirection         // 'increase' (subir até alvo) | 'decrease' (descer até alvo)

  startDate: string                // ISO YYYY-MM-DD
  targetDate?: string              // ISO opcional (deadline)

  logs: GoalLog[]
  milestones: GoalMilestone[]

  createdAt: number
  updatedAt: number
  archived?: boolean
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
