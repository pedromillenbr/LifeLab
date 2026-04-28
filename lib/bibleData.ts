/**
 * Bible reading plans — single source of truth.
 * References use bible-api.com English format: "John 3", "Psalm 23", "John 3:16-21".
 */

export type BiblePlanLevel = 'iniciante' | 'medio' | 'intenso'

export interface BiblePlanDay {
  day: number
  readings: string[] // ["John 3", "Psalm 1"]
}

export interface BiblePlan {
  id: string
  name: string
  description: string
  duration: number // total days
  level: BiblePlanLevel
  days: BiblePlanDay[]
}

/* ─────────────────────────────────────────────────────────────────
   BOOK CATALOG — used to generate programmatic plans
   ───────────────────────────────────────────────────────────────── */

const OT: { name: string; chapters: number }[] = [
  { name: 'Genesis', chapters: 50 },         { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },       { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },     { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },          { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },        { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },         { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },    { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },            { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },          { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 },         { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },    { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },          { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },     { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },          { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },             { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },          { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },            { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },         { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },           { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
]

const NT: { name: string; chapters: number }[] = [
  { name: 'Matthew', chapters: 28 },         { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },            { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },            { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },   { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },        { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },      { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },        { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },            { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },         { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },          { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },           { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },           { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
]

/* ─────────────────────────────────────────────────────────────────
   GENERATORS
   ───────────────────────────────────────────────────────────────── */

function expandBookList(books: { name: string; chapters: number }[]): string[] {
  const refs: string[] = []
  for (const b of books) {
    const label = b.name === 'Psalms' ? 'Psalm' : b.name
    for (let c = 1; c <= b.chapters; c++) refs.push(`${label} ${c}`)
  }
  return refs
}

/** Distribute a flat chapter list across N days, ~equal chunks. */
function chunkIntoDays(refs: string[], totalDays: number): BiblePlanDay[] {
  const days: BiblePlanDay[] = []
  const total = refs.length
  for (let d = 0; d < totalDays; d++) {
    const start = Math.floor((d * total) / totalDays)
    const end = Math.floor(((d + 1) * total) / totalDays)
    days.push({ day: d + 1, readings: refs.slice(start, end) })
  }
  return days
}

/** Bíblia em 1 ano — OT + NT canonical order, ~3.3 chapters/day. */
function buildOneYear(): BiblePlanDay[] {
  return chunkIntoDays(expandBookList([...OT, ...NT]), 365)
}

/** Cronológico — approximate chronological order of biblical events. */
function buildChronological(): BiblePlanDay[] {
  const order: { name: string; chapters: number }[] = [
    { name: 'Genesis', chapters: 50 }, { name: 'Job', chapters: 42 },
    { name: 'Exodus', chapters: 40 }, { name: 'Leviticus', chapters: 27 },
    { name: 'Numbers', chapters: 36 }, { name: 'Deuteronomy', chapters: 34 },
    { name: 'Joshua', chapters: 24 }, { name: 'Judges', chapters: 21 },
    { name: 'Ruth', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
    { name: 'Psalms', chapters: 150 }, { name: '2 Samuel', chapters: 24 },
    { name: '1 Chronicles', chapters: 29 }, { name: 'Proverbs', chapters: 31 },
    { name: 'Ecclesiastes', chapters: 12 }, { name: 'Song of Solomon', chapters: 8 },
    { name: '1 Kings', chapters: 22 }, { name: '2 Chronicles', chapters: 36 },
    { name: 'Obadiah', chapters: 1 }, { name: 'Joel', chapters: 3 },
    { name: 'Jonah', chapters: 4 }, { name: 'Amos', chapters: 9 },
    { name: 'Hosea', chapters: 14 }, { name: 'Isaiah', chapters: 66 },
    { name: 'Micah', chapters: 7 }, { name: 'Nahum', chapters: 3 },
    { name: '2 Kings', chapters: 25 }, { name: 'Zephaniah', chapters: 3 },
    { name: 'Habakkuk', chapters: 3 }, { name: 'Jeremiah', chapters: 52 },
    { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 },
    { name: 'Daniel', chapters: 12 }, { name: 'Ezra', chapters: 10 },
    { name: 'Esther', chapters: 10 }, { name: 'Nehemiah', chapters: 13 },
    { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 },
    { name: 'Malachi', chapters: 4 },
    // NT chronological-ish
    { name: 'Luke', chapters: 24 }, { name: 'Mark', chapters: 16 },
    { name: 'Matthew', chapters: 28 }, { name: 'John', chapters: 21 },
    { name: 'Acts', chapters: 28 },
    { name: 'James', chapters: 5 }, { name: 'Galatians', chapters: 6 },
    { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 },
    { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 },
    { name: 'Romans', chapters: 16 }, { name: 'Ephesians', chapters: 6 },
    { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
    { name: 'Philemon', chapters: 1 }, { name: '1 Timothy', chapters: 6 },
    { name: 'Titus', chapters: 3 }, { name: '1 Peter', chapters: 5 },
    { name: 'Hebrews', chapters: 13 }, { name: '2 Timothy', chapters: 4 },
    { name: '2 Peter', chapters: 3 }, { name: 'Jude', chapters: 1 },
    { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
    { name: '3 John', chapters: 1 }, { name: 'Revelation', chapters: 22 },
  ]
  return chunkIntoDays(expandBookList(order), 365)
}

/** Novo Testamento em 90 dias. */
function buildNewTestament(): BiblePlanDay[] {
  return chunkIntoDays(expandBookList(NT), 90)
}

/** Evangelhos em 30 dias — Mateus, Marcos, Lucas, João. */
function buildGospels(): BiblePlanDay[] {
  const gospels = NT.filter(b => ['Matthew', 'Mark', 'Luke', 'John'].includes(b.name))
  return chunkIntoDays(expandBookList(gospels), 30)
}

/* ─────────────────────────────────────────────────────────────────
   CURATED PLANS
   ───────────────────────────────────────────────────────────────── */

/** Salmos + Provérbios — 30 dias com mistura diária. */
function buildSalmosProverbios(): BiblePlanDay[] {
  const days: BiblePlanDay[] = []
  // 30 days: 5 psalms + 1 proverbs each day → 150 psalms + 30 proverbs (1 leftover)
  for (let d = 0; d < 30; d++) {
    const readings: string[] = []
    for (let i = 0; i < 5; i++) readings.push(`Psalm ${d * 5 + i + 1}`)
    readings.push(`Proverbs ${(d % 31) + 1}`)
    days.push({ day: d + 1, readings })
  }
  return days
}

/** Provérbios — 31 dias, um capítulo por dia. */
function buildProverbs(): BiblePlanDay[] {
  return Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    readings: [`Proverbs ${i + 1}`],
  }))
}

const VIDA_DE_JESUS: BiblePlanDay[] = [
  { day: 1,  readings: ['Luke 1', 'Luke 2'] },
  { day: 2,  readings: ['Matthew 1', 'Matthew 2'] },
  { day: 3,  readings: ['Matthew 3', 'Matthew 4'] },
  { day: 4,  readings: ['John 1'] },
  { day: 5,  readings: ['John 2', 'John 3'] },
  { day: 6,  readings: ['Matthew 5'] },
  { day: 7,  readings: ['Matthew 6', 'Matthew 7'] },
  { day: 8,  readings: ['Mark 1', 'Mark 2'] },
  { day: 9,  readings: ['Luke 5', 'Luke 6'] },
  { day: 10, readings: ['John 4'] },
  { day: 11, readings: ['Mark 4', 'Mark 5'] },
  { day: 12, readings: ['Matthew 13'] },
  { day: 13, readings: ['John 6'] },
  { day: 14, readings: ['Luke 10', 'Luke 11'] },
  { day: 15, readings: ['Luke 15'] },
  { day: 16, readings: ['John 11'] },
  { day: 17, readings: ['Matthew 21', 'Matthew 22'] },
  { day: 18, readings: ['John 13', 'John 14'] },
  { day: 19, readings: ['John 17'] },
  { day: 20, readings: ['Matthew 27', 'Mark 15'] },
  { day: 21, readings: ['Luke 24', 'John 20', 'John 21'] },
]

const FE_DISCIPLINA: BiblePlanDay[] = [
  { day: 1,  readings: ['Hebrews 11'] },
  { day: 2,  readings: ['James 1'] },
  { day: 3,  readings: ['Romans 5'] },
  { day: 4,  readings: ['Romans 8'] },
  { day: 5,  readings: ['1 Corinthians 9:24-27', '1 Corinthians 10:1-13'] },
  { day: 6,  readings: ['Galatians 5'] },
  { day: 7,  readings: ['Ephesians 6'] },
  { day: 8,  readings: ['Philippians 3', 'Philippians 4'] },
  { day: 9,  readings: ['Colossians 3'] },
  { day: 10, readings: ['1 Timothy 4', '1 Timothy 6'] },
  { day: 11, readings: ['2 Timothy 1', '2 Timothy 2'] },
  { day: 12, readings: ['2 Timothy 3', '2 Timothy 4'] },
  { day: 13, readings: ['Hebrews 12'] },
  { day: 14, readings: ['Hebrews 13'] },
  { day: 15, readings: ['James 2', 'James 3'] },
  { day: 16, readings: ['James 4', 'James 5'] },
  { day: 17, readings: ['1 Peter 1'] },
  { day: 18, readings: ['1 Peter 4', '1 Peter 5'] },
  { day: 19, readings: ['2 Peter 1'] },
  { day: 20, readings: ['1 John 2'] },
  { day: 21, readings: ['Proverbs 3'] },
  { day: 22, readings: ['Proverbs 4'] },
  { day: 23, readings: ['Proverbs 16'] },
  { day: 24, readings: ['Psalm 1', 'Psalm 15'] },
  { day: 25, readings: ['Psalm 23', 'Psalm 27'] },
  { day: 26, readings: ['Psalm 37'] },
  { day: 27, readings: ['Psalm 119:1-48'] },
  { day: 28, readings: ['Psalm 119:49-104'] },
  { day: 29, readings: ['Psalm 119:105-176'] },
  { day: 30, readings: ['Joshua 1', 'Romans 12'] },
]

const PROPOSITO: BiblePlanDay[] = [
  { day: 1,  readings: ['Genesis 1', 'Genesis 2'] },
  { day: 2,  readings: ['Jeremiah 29'] },
  { day: 3,  readings: ['Jeremiah 1'] },
  { day: 4,  readings: ['Psalm 139'] },
  { day: 5,  readings: ['Ephesians 1'] },
  { day: 6,  readings: ['Ephesians 2'] },
  { day: 7,  readings: ['Romans 8'] },
  { day: 8,  readings: ['Romans 12'] },
  { day: 9,  readings: ['Matthew 6'] },
  { day: 10, readings: ['Matthew 25'] },
  { day: 11, readings: ['Luke 9'] },
  { day: 12, readings: ['John 15'] },
  { day: 13, readings: ['1 Corinthians 12'] },
  { day: 14, readings: ['1 Corinthians 13'] },
  { day: 15, readings: ['Galatians 2', 'Galatians 5'] },
  { day: 16, readings: ['Philippians 1', 'Philippians 2'] },
  { day: 17, readings: ['Philippians 3', 'Philippians 4'] },
  { day: 18, readings: ['Colossians 3'] },
  { day: 19, readings: ['2 Timothy 1'] },
  { day: 20, readings: ['Hebrews 12'] },
  { day: 21, readings: ['Revelation 21', 'Revelation 22'] },
]

const INTENSIVO: BiblePlanDay[] = [
  { day: 1, readings: ['John 1', 'John 2', 'John 3', 'Psalm 1'] },
  { day: 2, readings: ['John 4', 'John 5', 'John 6', 'Psalm 23'] },
  { day: 3, readings: ['John 7', 'John 8', 'John 9', 'Psalm 27'] },
  { day: 4, readings: ['John 10', 'John 11', 'John 12', 'Psalm 37'] },
  { day: 5, readings: ['John 13', 'John 14', 'John 15', 'Proverbs 3'] },
  { day: 6, readings: ['John 16', 'John 17', 'John 18', 'Proverbs 4'] },
  { day: 7, readings: ['John 19', 'John 20', 'John 21', 'Romans 8'] },
]

/* ─────────────────────────────────────────────────────────────────
   PLANS — single source of truth
   ───────────────────────────────────────────────────────────────── */

export const BIBLE_PLANS: BiblePlan[] = [
  {
    id: 'biblia-1-ano',
    name: 'Bíblia Completa em 1 Ano',
    description: 'Leia toda a Bíblia em 365 dias, na ordem canônica.',
    duration: 365, level: 'medio',
    days: buildOneYear(),
  },
  {
    id: 'cronologico',
    name: 'Ordem Cronológica',
    description: 'A Bíblia inteira na ordem aproximada dos eventos.',
    duration: 365, level: 'intenso',
    days: buildChronological(),
  },
  {
    id: 'novo-testamento-90',
    name: 'Novo Testamento (90 dias)',
    description: 'Os 27 livros do Novo Testamento em 90 dias.',
    duration: 90, level: 'medio',
    days: buildNewTestament(),
  },
  {
    id: 'salmos-proverbios-30',
    name: 'Salmos + Provérbios (30 dias)',
    description: 'Cinco salmos + um provérbio por dia.',
    duration: 30, level: 'iniciante',
    days: buildSalmosProverbios(),
  },
  {
    id: 'evangelhos-30',
    name: 'Evangelhos (30 dias)',
    description: 'Mateus, Marcos, Lucas e João em 30 dias.',
    duration: 30, level: 'medio',
    days: buildGospels(),
  },
  {
    id: 'vida-de-jesus-21',
    name: 'Vida de Jesus (21 dias)',
    description: 'Os principais momentos da vida de Cristo, dos evangelhos.',
    duration: 21, level: 'iniciante',
    days: VIDA_DE_JESUS,
  },
  {
    id: 'fe-disciplina-30',
    name: 'Fé e Disciplina (30 dias)',
    description: 'Passagens sobre fé, perseverança e crescimento espiritual.',
    duration: 30, level: 'medio',
    days: FE_DISCIPLINA,
  },
  {
    id: 'proposito-21',
    name: 'Propósito (21 dias)',
    description: 'Descobrindo o propósito de Deus para sua vida.',
    duration: 21, level: 'iniciante',
    days: PROPOSITO,
  },
  {
    id: 'proverbios-31',
    name: 'Provérbios (31 dias)',
    description: 'Um capítulo de Provérbios por dia, durante um mês.',
    duration: 31, level: 'iniciante',
    days: buildProverbs(),
  },
  {
    id: 'intensivo-7',
    name: 'Plano Intensivo (7 dias)',
    description: 'João completo + salmos selecionados em uma semana.',
    duration: 7, level: 'intenso',
    days: INTENSIVO,
  },
]

export function getBiblePlan(planId: string): BiblePlan | undefined {
  return BIBLE_PLANS.find(p => p.id === planId)
}

/* ─────────────────────────────────────────────────────────────────
   DISPLAY HELPERS — English (API) ↔ Portuguese (UI)
   ───────────────────────────────────────────────────────────────── */

const BOOK_PT: Record<string, string> = {
  'Genesis': 'Gênesis', 'Exodus': 'Êxodo', 'Leviticus': 'Levítico',
  'Numbers': 'Números', 'Deuteronomy': 'Deuteronômio',
  'Joshua': 'Josué', 'Judges': 'Juízes', 'Ruth': 'Rute',
  '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
  '1 Kings': '1 Reis', '2 Kings': '2 Reis',
  '1 Chronicles': '1 Crônicas', '2 Chronicles': '2 Crônicas',
  'Ezra': 'Esdras', 'Nehemiah': 'Neemias', 'Esther': 'Ester',
  'Job': 'Jó', 'Psalm': 'Salmo', 'Psalms': 'Salmo',
  'Proverbs': 'Provérbios', 'Ecclesiastes': 'Eclesiastes',
  'Song of Solomon': 'Cânticos',
  'Isaiah': 'Isaías', 'Jeremiah': 'Jeremias', 'Lamentations': 'Lamentações',
  'Ezekiel': 'Ezequiel', 'Daniel': 'Daniel',
  'Hosea': 'Oseias', 'Joel': 'Joel', 'Amos': 'Amós',
  'Obadiah': 'Obadias', 'Jonah': 'Jonas', 'Micah': 'Miqueias',
  'Nahum': 'Naum', 'Habakkuk': 'Habacuque', 'Zephaniah': 'Sofonias',
  'Haggai': 'Ageu', 'Zechariah': 'Zacarias', 'Malachi': 'Malaquias',
  'Matthew': 'Mateus', 'Mark': 'Marcos', 'Luke': 'Lucas', 'John': 'João',
  'Acts': 'Atos', 'Romans': 'Romanos',
  '1 Corinthians': '1 Coríntios', '2 Corinthians': '2 Coríntios',
  'Galatians': 'Gálatas', 'Ephesians': 'Efésios',
  'Philippians': 'Filipenses', 'Colossians': 'Colossenses',
  '1 Thessalonians': '1 Tessalonicenses', '2 Thessalonians': '2 Tessalonicenses',
  '1 Timothy': '1 Timóteo', '2 Timothy': '2 Timóteo',
  'Titus': 'Tito', 'Philemon': 'Filemom',
  'Hebrews': 'Hebreus', 'James': 'Tiago',
  '1 Peter': '1 Pedro', '2 Peter': '2 Pedro',
  '1 John': '1 João', '2 John': '2 João', '3 John': '3 João',
  'Jude': 'Judas', 'Revelation': 'Apocalipse',
}

/** "John 3" → "João 3" · "Psalm 119:1-48" → "Salmo 119:1-48" */
export function localizeReference(ref: string): string {
  // Match "<book name> <chapter>[:verses]"
  const match = ref.match(/^(\d?\s?[A-Za-z][A-Za-z ]+?)\s(\d.*)$/)
  if (!match) return ref
  const [, book, rest] = match
  const pt = BOOK_PT[book.trim()]
  return pt ? `${pt} ${rest}` : ref
}

/** Short label combining all of a day's readings for a list view. */
export function readingsLabel(readings: string[]): string {
  return readings.map(localizeReference).join(' · ')
}

/* ─────────────────────────────────────────────────────────────────
   LEGACY BRIDGE — for the existing /espiritual dashboard.
   Returns "today's" reading using a fixed start date (cycles).
   ───────────────────────────────────────────────────────────────── */

export function getTodayReading(planId: string): { day: number; readings: string[]; label: string } | null {
  const plan = getBiblePlan(planId)
  if (!plan) return null
  const startDate = new Date('2026-01-01')
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / 86400000)
  const dayInPlan = ((diffDays % plan.duration) + plan.duration) % plan.duration + 1
  const reading = plan.days.find(d => d.day === dayInPlan) || plan.days[0]
  return { day: dayInPlan, readings: reading.readings, label: readingsLabel(reading.readings) }
}

export function getPlanProgress(planId: string, completedDays: number[] | string[]): number {
  const plan = getBiblePlan(planId)
  if (!plan) return 0
  return Math.round((completedDays.length / plan.duration) * 100)
}
