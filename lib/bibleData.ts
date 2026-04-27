export interface BiblePlanEntry {
  id: string
  name: string
  description: string
  totalDays: number
  readings: { day: number; passage: string; book: string }[]
}

export const BIBLE_PLANS: BiblePlanEntry[] = [
  {
    id: 'nt1year',
    name: 'Bíblia em 1 Ano',
    description: 'Leia a Bíblia completa em 365 dias',
    totalDays: 365,
    readings: [
      { day: 1, passage: 'Gênesis 1-3', book: 'Gênesis' },
      { day: 2, passage: 'Gênesis 4-6', book: 'Gênesis' },
      { day: 3, passage: 'Gênesis 7-9', book: 'Gênesis' },
      { day: 4, passage: 'Gênesis 10-12', book: 'Gênesis' },
      { day: 5, passage: 'Gênesis 13-15', book: 'Gênesis' },
      { day: 6, passage: 'Gênesis 16-18', book: 'Gênesis' },
      { day: 7, passage: 'Gênesis 19-21', book: 'Gênesis' },
      { day: 8, passage: 'Gênesis 22-24', book: 'Gênesis' },
      { day: 9, passage: 'Gênesis 25-27', book: 'Gênesis' },
      { day: 10, passage: 'Gênesis 28-30', book: 'Gênesis' },
      { day: 11, passage: 'Êxodo 1-3', book: 'Êxodo' },
      { day: 12, passage: 'Êxodo 4-6', book: 'Êxodo' },
      { day: 13, passage: 'Êxodo 7-9', book: 'Êxodo' },
      { day: 14, passage: 'Êxodo 10-12', book: 'Êxodo' },
      { day: 15, passage: 'Salmos 1-5', book: 'Salmos' },
      { day: 16, passage: 'Salmos 6-10', book: 'Salmos' },
      { day: 17, passage: 'Provérbios 1-3', book: 'Provérbios' },
      { day: 18, passage: 'Provérbios 4-6', book: 'Provérbios' },
      { day: 19, passage: 'Mateus 1-4', book: 'Mateus' },
      { day: 20, passage: 'Mateus 5-7', book: 'Mateus' },
      { day: 21, passage: 'Mateus 8-10', book: 'Mateus' },
      { day: 22, passage: 'Mateus 11-13', book: 'Mateus' },
      { day: 23, passage: 'Mateus 14-16', book: 'Mateus' },
      { day: 24, passage: 'Mateus 17-19', book: 'Mateus' },
      { day: 25, passage: 'Mateus 20-22', book: 'Mateus' },
      { day: 26, passage: 'Mateus 23-25', book: 'Mateus' },
      { day: 27, passage: 'Mateus 26-28', book: 'Mateus' },
      { day: 28, passage: 'Marcos 1-3', book: 'Marcos' },
      { day: 29, passage: 'Marcos 4-6', book: 'Marcos' },
      { day: 30, passage: 'Marcos 7-9', book: 'Marcos' },
      ...Array.from({ length: 335 }, (_, i) => ({
        day: i + 31,
        passage: `Leitura dia ${i + 31}`,
        book: ['Lucas', 'João', 'Atos', 'Romanos', 'Gálatas', 'Efésios', 'Hebreus', 'Apocalipse'][i % 8]
      }))
    ]
  },
  {
    id: 'novo_testamento',
    name: 'Novo Testamento',
    description: 'Novo Testamento completo em 90 dias',
    totalDays: 90,
    readings: [
      { day: 1, passage: 'Mateus 1-4', book: 'Mateus' },
      { day: 2, passage: 'Mateus 5-7', book: 'Mateus' },
      { day: 3, passage: 'Mateus 8-10', book: 'Mateus' },
      { day: 4, passage: 'Mateus 11-13', book: 'Mateus' },
      { day: 5, passage: 'Mateus 14-16', book: 'Mateus' },
      { day: 6, passage: 'Mateus 17-19', book: 'Mateus' },
      { day: 7, passage: 'Mateus 20-22', book: 'Mateus' },
      { day: 8, passage: 'Mateus 23-25', book: 'Mateus' },
      { day: 9, passage: 'Mateus 26-28', book: 'Mateus' },
      { day: 10, passage: 'Marcos 1-4', book: 'Marcos' },
      { day: 11, passage: 'Marcos 5-8', book: 'Marcos' },
      { day: 12, passage: 'Marcos 9-12', book: 'Marcos' },
      { day: 13, passage: 'Marcos 13-16', book: 'Marcos' },
      { day: 14, passage: 'Lucas 1-3', book: 'Lucas' },
      { day: 15, passage: 'Lucas 4-6', book: 'Lucas' },
      { day: 16, passage: 'Lucas 7-9', book: 'Lucas' },
      { day: 17, passage: 'Lucas 10-12', book: 'Lucas' },
      { day: 18, passage: 'Lucas 13-15', book: 'Lucas' },
      { day: 19, passage: 'Lucas 16-18', book: 'Lucas' },
      { day: 20, passage: 'Lucas 19-21', book: 'Lucas' },
      { day: 21, passage: 'Lucas 22-24', book: 'Lucas' },
      { day: 22, passage: 'João 1-3', book: 'João' },
      { day: 23, passage: 'João 4-6', book: 'João' },
      { day: 24, passage: 'João 7-9', book: 'João' },
      { day: 25, passage: 'João 10-12', book: 'João' },
      { day: 26, passage: 'João 13-15', book: 'João' },
      { day: 27, passage: 'João 16-18', book: 'João' },
      { day: 28, passage: 'João 19-21', book: 'João' },
      { day: 29, passage: 'Atos 1-3', book: 'Atos' },
      { day: 30, passage: 'Atos 4-6', book: 'Atos' },
      ...Array.from({ length: 60 }, (_, i) => ({
        day: i + 31,
        passage: `Leitura NT dia ${i + 31}`,
        book: ['Atos', 'Romanos', '1 Coríntios', 'Gálatas', 'Efésios', 'Filipenses', 'Hebreus', 'Apocalipse'][i % 8]
      }))
    ]
  },
  {
    id: 'salmos_proverbios',
    name: 'Salmos + Provérbios',
    description: 'Salmos e Provérbios em 60 dias',
    totalDays: 60,
    readings: [
      { day: 1, passage: 'Salmos 1-3', book: 'Salmos' },
      { day: 2, passage: 'Salmos 4-6', book: 'Salmos' },
      { day: 3, passage: 'Provérbios 1-2', book: 'Provérbios' },
      { day: 4, passage: 'Salmos 7-9', book: 'Salmos' },
      { day: 5, passage: 'Salmos 10-12', book: 'Salmos' },
      { day: 6, passage: 'Provérbios 3-4', book: 'Provérbios' },
      { day: 7, passage: 'Salmos 13-16', book: 'Salmos' },
      { day: 8, passage: 'Salmos 17-19', book: 'Salmos' },
      { day: 9, passage: 'Provérbios 5-6', book: 'Provérbios' },
      { day: 10, passage: 'Salmos 20-23', book: 'Salmos' },
      ...Array.from({ length: 50 }, (_, i) => ({
        day: i + 11,
        passage: i % 3 === 2 ? `Provérbios ${(i % 15) + 7}-${(i % 15) + 8}` : `Salmos ${i * 3 + 24}-${i * 3 + 26}`,
        book: i % 3 === 2 ? 'Provérbios' : 'Salmos'
      }))
    ]
  }
]

export function getTodayReading(planId: string): { passage: string; book: string; day: number } | null {
  const plan = BIBLE_PLANS.find((p) => p.id === planId)
  if (!plan) return null
  const startDate = new Date('2026-01-01')
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const dayInPlan = (diffDays % plan.totalDays) + 1
  const reading = plan.readings.find((r) => r.day === dayInPlan) || plan.readings[0]
  return { ...reading, day: dayInPlan }
}

export function getPlanProgress(planId: string, completedDates: string[]): number {
  const plan = BIBLE_PLANS.find((p) => p.id === planId)
  if (!plan) return 0
  return Math.round((completedDates.length / plan.totalDays) * 100)
}
