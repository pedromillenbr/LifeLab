import type { Goal, GoalCategory, GoalLog, GoalMilestone } from '@/store/types'
import {
  Dumbbell, DollarSign, BookOpen, Briefcase,
  Heart, Sparkles, Palette, Target,
  type LucideIcon,
} from 'lucide-react'

/* ───────────────────────── PRESETS DE CAPA ───────────────────────── */

export interface CoverPreset {
  id: string
  label: string
  category: GoalCategory
  icon: LucideIcon
  /** Gradient CSS para fundo da cover quando não há imagem. */
  gradient: string
  /** Cor de destaque (usada em ring de progresso, glow, etc). */
  accent: string
}

export const COVER_PRESETS: CoverPreset[] = [
  {
    id: 'fisico',
    label: 'Físico',
    category: 'fisico',
    icon: Dumbbell,
    gradient: 'linear-gradient(135deg, #1a2e4a 0%, #0f1f3a 50%, #0a1628 100%)',
    accent: '#60a5fa',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    category: 'financeiro',
    icon: DollarSign,
    gradient: 'linear-gradient(135deg, #1a3a2e 0%, #0f2a1f 50%, #0a1f15 100%)',
    accent: '#10b981',
  },
  {
    id: 'estudo',
    label: 'Estudo',
    category: 'estudo',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, #2e1a4a 0%, #1f0f3a 50%, #150a28 100%)',
    accent: '#a78bfa',
  },
  {
    id: 'carreira',
    label: 'Carreira',
    category: 'carreira',
    icon: Briefcase,
    gradient: 'linear-gradient(135deg, #4a2e1a 0%, #3a1f0f 50%, #28150a 100%)',
    accent: '#f59e0b',
  },
  {
    id: 'pessoal',
    label: 'Pessoal',
    category: 'pessoal',
    icon: Heart,
    gradient: 'linear-gradient(135deg, #4a1a3a 0%, #3a0f2e 50%, #28051f 100%)',
    accent: '#ec4899',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    category: 'lifestyle',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #4a3a1a 0%, #3a2e0f 50%, #28200a 100%)',
    accent: '#fbbf24',
  },
  {
    id: 'criativo',
    label: 'Criativo',
    category: 'criativo',
    icon: Palette,
    gradient: 'linear-gradient(135deg, #1a4a3a 0%, #0f3a2e 50%, #0a2820 100%)',
    accent: '#14b8a6',
  },
  {
    id: 'outro',
    label: 'Outro',
    category: 'outro',
    icon: Target,
    gradient: 'linear-gradient(135deg, #2a2e3a 0%, #1f222e 50%, #15181f 100%)',
    accent: '#94a3b8',
  },
]

export function getCoverPreset(id?: string): CoverPreset {
  return COVER_PRESETS.find(p => p.id === id) ?? COVER_PRESETS[COVER_PRESETS.length - 1]
}

export function getPresetForCategory(cat: GoalCategory): CoverPreset {
  return COVER_PRESETS.find(p => p.category === cat) ?? COVER_PRESETS[COVER_PRESETS.length - 1]
}

/* ───────────────────────── CÁLCULOS DE PROGRESSO ───────────────────────── */

/** Retorna percentual 0–100 considerando direção (subir até alvo OU descer até alvo). */
export function getGoalProgress(g: Pick<Goal, 'startValue' | 'currentValue' | 'targetValue' | 'direction'>): number {
  const range = g.targetValue - g.startValue
  if (range === 0) return g.currentValue === g.targetValue ? 100 : 0
  const delta = g.currentValue - g.startValue
  const pct = (delta / range) * 100
  // Para 'decrease' o range é negativo, então pct fica naturalmente correto.
  return Math.max(0, Math.min(100, pct))
}

export function getGoalRemaining(g: Pick<Goal, 'currentValue' | 'targetValue' | 'direction'>): number {
  const diff = g.targetValue - g.currentValue
  return g.direction === 'increase' ? Math.max(0, diff) : Math.max(0, -diff)
}

export function getNextMilestone(g: Pick<Goal, 'milestones'>): GoalMilestone | null {
  return g.milestones.find(m => !m.achievedAt) ?? null
}

export function getAchievedMilestonesCount(g: Pick<Goal, 'milestones'>): number {
  return g.milestones.filter(m => !!m.achievedAt).length
}

/* ───────────────────────── STREAK + ETA ───────────────────────── */

/** Dias consecutivos (terminando hoje ou ontem) com pelo menos 1 log. */
export function getGoalStreak(logs: GoalLog[]): number {
  if (logs.length === 0) return 0
  const dates = new Set(logs.map(l => l.date))
  let streak = 0
  const cursor = new Date()
  // Se não tem log hoje, começa de ontem
  const todayStr = cursor.toISOString().slice(0, 10)
  if (!dates.has(todayStr)) cursor.setDate(cursor.getDate() - 1)
  for (;;) {
    const ds = cursor.toISOString().slice(0, 10)
    if (dates.has(ds)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else break
  }
  return streak
}

/**
 * Estimativa de dias até atingir a meta, baseada no ritmo dos últimos 14 dias.
 * Retorna null se não há dados suficientes ou se já bateu / regressão errada.
 */
export function getEstimatedDaysToFinish(g: Pick<Goal, 'logs' | 'currentValue' | 'targetValue' | 'direction'>): number | null {
  if (g.currentValue === g.targetValue) return 0
  if (g.logs.length < 2) return null

  const cutoff = Date.now() - 14 * 86400000
  const recent = g.logs.filter(l => new Date(l.date + 'T12:00:00').getTime() >= cutoff)
  const window = recent.length >= 2 ? recent : g.logs.slice(-Math.max(2, Math.min(g.logs.length, 5)))
  if (window.length < 2) return null

  const first = window[0]
  const last = window[window.length - 1]
  const dayDiff = Math.max(
    1,
    Math.round((new Date(last.date + 'T12:00:00').getTime() - new Date(first.date + 'T12:00:00').getTime()) / 86400000),
  )
  const valueDiff = last.value - first.value
  const ratePerDay = valueDiff / dayDiff
  if (ratePerDay === 0) return null

  const remaining = g.targetValue - g.currentValue
  // Se a direção do ritmo é contrária à direção da meta, retorna null
  if (g.direction === 'increase' && ratePerDay <= 0) return null
  if (g.direction === 'decrease' && ratePerDay >= 0) return null

  const days = Math.ceil(remaining / ratePerDay)
  return days > 0 ? days : null
}

/* ───────────────────────── FORMATAÇÃO ───────────────────────── */

export function formatGoalValue(value: number, unit: string): string {
  if (unit === 'R$' || unit === 'reais') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }
  if (unit === '%') return `${value.toFixed(0)}%`
  const formatted = Number.isInteger(value)
    ? value.toLocaleString('pt-BR')
    : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return `${formatted} ${unit}`.trim()
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  const now = new Date()
  const diffDays = Math.round((d.getTime() - now.getTime()) / 86400000)
  if (diffDays === 0) return 'hoje'
  if (diffDays === -1) return 'ontem'
  if (diffDays === 1) return 'amanhã'
  if (diffDays < 0 && diffDays >= -7) return `${-diffDays} dias atrás`
  if (diffDays > 0 && diffDays <= 7) return `em ${diffDays} dias`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/* ───────────────────────── FRASES MOTIVACIONAIS ───────────────────────── */

const PHRASES_START = [
  'Toda jornada começa com uma decisão.',
  'O primeiro passo é o mais importante.',
  'Você acabou de plantar a semente.',
  'Comece. Aperfeiçoe no caminho.',
]
const PHRASES_EARLY = [
  'O começo é construção silenciosa.',
  'Consistência hoje, resultado amanhã.',
  'Você está no terreno onde poucos chegam.',
  'A versão futura sua agradece.',
]
const PHRASES_HALF = [
  'Metade do caminho. Sem freio agora.',
  'Você passou da fronteira do desconforto.',
  'Mais perto do que estava ontem.',
  'Continue — o ritmo virou identidade.',
]
const PHRASES_NEAR = [
  'Quase lá. Não desacelera.',
  'A chegada é uma questão de tempo.',
  'Os últimos passos definem o resto.',
  'Você está construindo o desfecho.',
]
const PHRASES_DONE = [
  'Meta cumprida. Quem você se tornou?',
  'Conquista desbloqueada.',
  'O processo virou prova.',
  'Próximo nível.',
]

export function getMotivationalPhrase(pct: number): string {
  let pool: string[]
  if (pct >= 100) pool = PHRASES_DONE
  else if (pct >= 75) pool = PHRASES_NEAR
  else if (pct >= 40) pool = PHRASES_HALF
  else if (pct >= 10) pool = PHRASES_EARLY
  else pool = PHRASES_START
  // Determinístico por pct (mesmo pct → mesma frase) para não trocar a cada render
  const idx = Math.floor(pct * 13) % pool.length
  return pool[idx]
}

/* ───────────────────────── MILESTONES AUTOMÁTICOS ───────────────────────── */

/** Cria 4 marcos automáticos em 25/50/75/100% para uma meta nova. */
export function buildAutoMilestones(
  startValue: number,
  targetValue: number,
  unit: string,
): Omit<GoalMilestone, 'id'>[] {
  const range = targetValue - startValue
  return [25, 50, 75, 100].map(pct => {
    const v = startValue + (range * pct) / 100
    return {
      label: `${pct}% — ${formatGoalValue(v, unit)}`,
      targetValue: v,
      auto: true,
      emoji: pct === 100 ? '🏆' : pct === 75 ? '🔥' : pct === 50 ? '⚡' : '✨',
    }
  })
}

/* ───────────────────────── HELPERS DE SEMANA ───────────────────────── */

export function daysSince(iso: string): number {
  const d = new Date(iso + 'T12:00:00').getTime()
  return Math.floor((Date.now() - d) / 86400000)
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null
  const d = new Date(iso + 'T12:00:00').getTime()
  return Math.ceil((d - Date.now()) / 86400000)
}
