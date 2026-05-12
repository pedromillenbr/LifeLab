import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Math.abs(value))
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR')
}

export function getDayName(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'short' })
}

export function toLocalDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today(): string {
  return toLocalDateString(new Date())
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export const MOTIVATIONAL_PHRASES = [
  'Your only limit is your mind.',
  'Hunt or be hunted.',
  'Every day is a new chance.',
  'Discipline is freedom.',
  'Small steps, massive results.',
  'Be obsessed or be average.',
  'Suffer now, live like a champion.',
  'No days off from becoming.',
]

export function getMotivationalPhrase(): string {
  const day = new Date().getDay()
  return MOTIVATIONAL_PHRASES[day % MOTIVATIONAL_PHRASES.length]
}

export const PILLAR_LABELS: Record<string, string> = {
  fisico: 'Físico',
  mental: 'Mental',
  financeiro: 'Financeiro',
  produtividade: 'Produtividade',
  disciplina: 'Disciplina',
  espiritual: 'Espiritual',
}

// "Pilar" foi substituído por "Evolução do/da" — concorda com o gênero
// do nome do pilar em português.
const PILLAR_GENDER: Record<string, 'm' | 'f'> = {
  fisico: 'm',
  mental: 'm',
  financeiro: 'm',
  produtividade: 'f',
  disciplina: 'f',
  espiritual: 'm',
}

export function evolucaoPrefix(pillar: string): string {
  return PILLAR_GENDER[pillar] === 'f' ? 'Evolução da' : 'Evolução do'
}

export function evolucaoLabel(pillar: string): string {
  const name = PILLAR_LABELS[pillar] ?? pillar
  return `${evolucaoPrefix(pillar)} ${name}`
}

/**
 * Auto-XP a partir do nome / pilar / frequência do hábito.
 * Heurística simples: baseline por pilar, ajustes por palavras-chave
 * de dificuldade, modulação por frequência. Resultado arredondado ao
 * múltiplo de 5 e clamped em [5, 50].
 */
export function computeHabitXP(
  name: string,
  pillar: string,
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily',
): number {
  const baseByPillar: Record<string, number> = {
    disciplina: 22,
    fisico: 20,
    produtividade: 17,
    mental: 15,
    financeiro: 14,
    espiritual: 14,
  }
  let xp = baseByPillar[pillar] ?? 15

  const n = (name || '').toLowerCase()

  // Esforço alto
  if (/academia|musculaç|musculac|treino|crossfit|hiit|maratona/.test(n)) xp += 8
  if (/corrida|correr|run/.test(n)) xp += 6
  if (/acordar cedo|madrugar|levantar cedo|5h|5:|6h/.test(n)) xp += 8
  if (/jejum|fast/.test(n)) xp += 6
  if (/estudar|estudo|study/.test(n)) xp += 3
  if (/futebol|esporte|sport/.test(n)) xp += 3

  // Esforço baixo
  if (/beber|água|agua|hidrata/.test(n)) xp -= 8
  if (/escov|brush/.test(n)) xp -= 6
  if (/dormir|sleep/.test(n)) xp -= 2

  // Frequência: weekly e monthly valem mais por ocorrência, mas como
  // são menos frequentes não inflam tanto. Mantemos diário como base.
  if (frequency === 'weekly') xp = Math.round(xp * 0.85)
  if (frequency === 'monthly') xp = Math.round(xp * 0.6)

  xp = Math.round(xp / 5) * 5
  return Math.max(5, Math.min(50, xp))
}

export const PILLAR_COLORS: Record<string, string> = {
  fisico: '#ef4444',
  mental: '#3b82f6',
  financeiro: '#22c55e',
  produtividade: '#f59e0b',
  disciplina: '#a855f7',
  espiritual: '#06b6d4',
}

export const CATEGORY_LABELS: Record<string, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  lazer: 'Lazer',
  saude: 'Saúde',
  educacao: 'Educação',
  outros: 'Outros',
  receita: 'Receita',
}

export const CATEGORY_COLORS: Record<string, string> = {
  alimentacao: '#ef4444',
  transporte: '#3b82f6',
  lazer: '#f59e0b',
  saude: '#22c55e',
  educacao: '#a855f7',
  outros: '#6b7280',
  receita: '#10b981',
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}
