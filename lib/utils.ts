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

export function today(): string {
  return new Date().toISOString().split('T')[0]
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
