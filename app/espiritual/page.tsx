'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import {
  BookOpen, Flame, CheckCircle, Circle, Clock,
  TrendingUp, Layers, Activity, Calendar, Feather,
  ArrowUpRight, Sparkles, X, Check, Edit3, Save, Sunrise,
} from 'lucide-react'
import { today } from '@/lib/utils'
import { BIBLE_PLANS, getTodayReading, getPlanProgress } from '@/lib/bibleData'
import Link from 'next/link'

type Quality = 'distracted' | 'neutral' | 'deep'
type ActionState = 'idle' | 'in-progress' | 'completed'

const GOLD = 'var(--gold)'
const GOLD_HI = 'var(--gold)'
const ORANGE = '#f97316'
const XP_LEVELS = [0, 100, 250, 520, 1000, 2000, 4000, 8000, 16000, 32000]

function parseReflection(text?: string): { quality: Quality | null; note: string } {
  if (!text) return { quality: null, note: '' }
  const m = text.match(/^\[(deep|neutral|distracted)\]\s*([\s\S]*)$/)
  if (m) return { quality: m[1] as Quality, note: m[2] }
  return { quality: null, note: text }
}

function MiniSparkline({ values, color = 'green' }: { values: number[]; color?: 'green' | 'gold' }) {
  const max = Math.max(...values, 1)
  const fill = color === 'gold' ? GOLD : 'var(--color-primary)'
  const glow = color === 'gold' ? 'rgba(var(--color-accent-rgb), .5)' : 'rgba(var(--color-primary-rgb), .4)'
  return (
    <div className="flex items-end gap-[2.5px] mt-3.5">
      {values.map((v, i) => (
        <div key={i} className="rounded-t-[2px]" style={{
          width: 10, height: `${Math.max(6, (v / max) * 32)}px`,
          background: v > 0 ? fill : 'rgba(255,255,255,.06)',
          boxShadow: v > 0 ? `0 0 6px ${glow}` : 'none',
        }} />
      ))}
    </div>
  )
}

function CircularArc({ percent }: { percent: number }) {
  const r = 28, c = 2 * Math.PI * r, p = Math.max(0.01, percent / 100)
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={GOLD} strokeWidth="5"
        strokeLinecap="round" strokeDasharray={`${c * p} ${c * (1 - p)}`}
        transform="rotate(-90 36 36)"
        style={{ filter: 'drop-shadow(0 0 6px rgba(var(--color-accent-rgb), .6))', transition: 'stroke-dasharray .8s ease' }} />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="JetBrains Mono,monospace">{percent}%</text>
    </svg>
  )
}

function QualityBadge({ quality }: { quality: Quality | null }) {
  if (!quality) return null
  const s = {
    deep:       { label: 'Profundo',  bg: 'rgba(var(--color-primary-rgb), .12)',   fg: 'var(--color-primary)',    border: 'rgba(var(--color-primary-rgb), .20)' },
    neutral:    { label: 'Neutro',    bg: 'rgba(255,255,255,.05)', fg: 'var(--color-text-subtle)', border: 'rgba(255,255,255,.08)' },
    distracted: { label: 'Distraído', bg: 'rgba(248,113,113,.10)', fg: '#f87171',                  border: 'rgba(248,113,113,.20)' },
  }[quality]
  return <span style={{ padding: '1px 6px', borderRadius: 20, fontSize: 10, background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}>{s.label}</span>
}

function PracticeCard({ type, state, title, subtitle, onClick }: {
  type: 'orar' | 'ler'; state: ActionState; title: string; subtitle: string; onClick: () => void
}) {
  const Icon = type === 'ler' ? BookOpen : Sunrise
  const iconColor = state === 'completed' ? 'var(--color-primary)' : state === 'in-progress' ? GOLD : 'var(--color-text-muted)'
  const iconBg    = state === 'completed' ? 'rgba(var(--color-primary-rgb), .15)' : state === 'in-progress' ? 'rgba(var(--color-accent-rgb), .15)' : 'rgba(255,255,255,.07)'
  const iconBorder = state === 'completed' ? 'rgba(var(--color-primary-rgb), .30)' : state === 'in-progress' ? 'rgba(var(--color-accent-rgb), .35)' : 'rgba(255,255,255,.12)'
  const cardBg    = state === 'completed' ? 'rgba(var(--color-primary-rgb), .05)' : state === 'in-progress' ? 'rgba(var(--color-accent-rgb), .03)' : 'rgba(255,255,255,.04)'
  const cardBorder = state === 'completed' ? 'rgba(var(--color-primary-rgb), .20)' : state === 'in-progress' ? 'rgba(var(--color-accent-rgb), .28)' : 'rgba(255,255,255,.09)'

  return (
    <div onClick={onClick} className="relative rounded-2xl p-6 cursor-pointer select-none overflow-hidden transition-all"
      style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(24px)', minHeight: 200 }}>

      {state === 'completed' && (
        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(var(--color-primary-rgb), .20)', border: '1.5px solid var(--color-primary)' }}>
          <Check size={11} style={{ color: 'var(--color-primary)' }} />
        </div>
      )}

      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-all"
        style={{
          background: iconBg, border: `1.5px solid ${iconBorder}`,
          boxShadow: state === 'in-progress' ? `0 0 20px ${type === 'ler' ? 'rgba(var(--color-accent-rgb), .3)' : 'rgba(var(--color-primary-rgb), .25)'}` : 'none',
        }}>
        <Icon size={26} style={{ color: iconColor }} />
      </div>

      <div className="text-[22px] font-bold tracking-tight mb-0.5" style={{ color: state === 'completed' ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}>{title}</div>
      <div className="text-xs mb-4" style={{ color: 'var(--color-text-subtle)' }}>{subtitle}</div>

      {state === 'in-progress' && (
        <div className="mb-3">
          <div className="h-[3px] rounded-sm overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,.07)' }}>
            <div className="h-full rounded-sm" style={{ width: '55%', background: `linear-gradient(90deg,${GOLD},${GOLD_HI})`, boxShadow: '0 0 6px rgba(var(--color-accent-rgb), .5)' }} />
          </div>
          <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>Em andamento…</div>
        </div>
      )}

      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={
        state === 'idle'        ? { background: 'rgba(255,255,255,.06)', color: 'var(--color-text-subtle)', border: '1px solid transparent' }
        : state === 'in-progress' ? { background: 'rgba(var(--color-accent-rgb), .12)', color: GOLD, border: '1px solid rgba(var(--color-accent-rgb), .20)' }
        :                           { background: 'rgba(var(--color-primary-rgb), .12)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb), .22)' }
      }>
        {state === 'idle'         && <><Circle size={9} /> Iniciar</>}
        {state === 'in-progress'  && <><Clock size={9} /> Em andamento</>}
        {state === 'completed'    && <><CheckCircle size={9} /> Concluído</>}
      </div>
    </div>
  )
}

function FeedbackModal({ type, onClose, onSave }: {
  type: 'ler' | 'orar'; onClose: () => void; onSave: (q: Quality, note: string) => void
}) {
  const [quality, setQuality] = useState<Quality | null>(null)
  const [note, setNote] = useState('')
  const options: { key: Quality; label: string; emoji: string }[] = [
    { key: 'distracted', label: 'Distraído', emoji: '😶' },
    { key: 'neutral',    label: 'Neutro',    emoji: '🙂' },
    { key: 'deep',       label: 'Profundo',  emoji: '✨' },
  ]
  const title    = type === 'ler' ? 'Ler concluído' : 'Orar concluído'
  const Icon     = type === 'ler' ? BookOpen : Sunrise
  const iconBg   = type === 'ler' ? 'rgba(var(--color-accent-rgb), .15)' : 'rgba(var(--color-primary-rgb), .12)'
  const iconBorder = type === 'ler' ? 'rgba(var(--color-accent-rgb), .35)' : 'rgba(var(--color-primary-rgb), .25)'
  const iconColor  = type === 'ler' ? GOLD : 'var(--color-primary)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative p-8 w-[420px] max-w-[calc(100vw-32px)]"
        style={{ background: '#0f1116', border: '1px solid rgba(255,255,255,.18)', borderRadius: 18, boxShadow: '0 32px 80px rgba(0,0,0,.8)', animation: 'fadeIn 0.25s ease' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={16} /></button>

        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: iconBg, border: `2px solid ${iconBorder}`, boxShadow: `0 0 18px ${type === 'ler' ? 'rgba(var(--color-accent-rgb), .3)' : 'rgba(var(--color-primary-rgb), .2)'}` }}>
            <Icon size={24} style={{ color: iconColor }} />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">{title}</div>
            <div className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Como foi sua conexão?</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {options.map(q => {
            const sel = quality === q.key
            const isDeep = q.key === 'deep' && sel
            return (
              <button key={q.key} onClick={() => setQuality(q.key)}
                className="px-2 py-3.5 rounded-md text-center transition-all"
                style={{
                  background: sel ? (isDeep ? 'rgba(var(--color-accent-rgb), .10)' : 'rgba(var(--color-primary-rgb), .12)') : 'rgba(255,255,255,.05)',
                  border: `1.5px solid ${sel ? (isDeep ? GOLD : 'var(--color-primary)') : 'rgba(255,255,255,.09)'}`,
                  color: sel ? (isDeep ? GOLD : 'var(--color-primary)') : 'var(--color-text-muted)',
                }}>
                <div className="text-[22px] mb-1.5">{q.emoji}</div>
                <div className="text-xs font-semibold">{q.label}</div>
              </button>
            )
          })}
        </div>

        <textarea rows={3} placeholder="O que se destacou? (opcional)" value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3.5 py-3 mb-5 text-[13px] resize-none outline-none"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 9, color: 'var(--color-text-main)' }}
        />
        <button disabled={!quality} onClick={() => quality && onSave(quality, note)}
          className="w-full py-3 rounded-md font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
          style={{ background: 'var(--color-primary)', color: '#000', opacity: quality ? 1 : 0.35, cursor: quality ? 'pointer' : 'not-allowed', boxShadow: quality ? '0 0 24px rgba(var(--color-primary-rgb), .30)' : 'none' }}>
          <Check size={15} /> Salvar reflexão
        </button>
      </div>
    </div>
  )
}

export default function EspiritualPage() {
  const {
    bibleReadings, activePlanId, completeBibleReading, updateReflection, getBibleStreak,
    profile, prayerLog, completePrayer, updatePrayerReflection,
  } = useStore()

  const [tab, setTab] = useState<'hoje' | 'historico'>('hoje')
  const [readingModal, setReadingModal] = useState(false)
  const [prayerModal, setPrayerModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editType, setEditType] = useState<'reading' | 'prayer'>('reading')

  const streak = getBibleStreak()
  const todayReading = getTodayReading(activePlanId)
  const todayRecord  = bibleReadings.find(r => r.date === today() && r.planId === activePlanId)
  const todayDone    = !!todayRecord?.completed
  const todayParsed  = parseReflection(todayRecord?.reflection)
  const readingState: ActionState = !todayDone ? 'idle' : (todayParsed.note || todayParsed.quality) ? 'completed' : 'in-progress'

  const todayPrayer   = prayerLog.find(p => p.date === today())
  const prayerDone    = !!todayPrayer?.completed
  const prayerParsed  = parseReflection(todayPrayer?.reflection)
  const prayerState: ActionState = !prayerDone ? 'idle' : (prayerParsed.note || prayerParsed.quality) ? 'completed' : 'in-progress'

  const completedDates = bibleReadings.filter(r => r.completed && r.planId === activePlanId).map(r => r.date)
  const progress   = getPlanProgress(activePlanId, completedDates)
  const currentPlan = BIBLE_PLANS.find(p => p.id === activePlanId)

  const last30 = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toISOString().split('T')[0]
  }), [])
  const last7 = last30.slice(-7)

  const consistency7 = Math.round((last7.filter(d => bibleReadings.some(r => r.date === d && r.completed && r.planId === activePlanId)).length / 7) * 100)
  const consistencyBars = last7.map(d => bibleReadings.some(r => r.date === d && r.completed && r.planId === activePlanId) ? 100 : 0)

  const allReflections = bibleReadings.filter(r => r.planId === activePlanId && r.reflection).map(r => ({ ...r, parsed: parseReflection(r.reflection) }))
  const depthScore = allReflections.length === 0 ? 0 : allReflections.reduce((acc, r) => acc + (r.parsed.quality === 'deep' ? 5 : r.parsed.quality === 'neutral' ? 3 : 1), 0) / allReflections.length
  const depthBars: number[] = allReflections.slice(-7).map(r => r.parsed.quality === 'deep' ? 5 : r.parsed.quality === 'neutral' ? 3 : 1)
  while (depthBars.length < 7) depthBars.unshift(0)

  const monthStart = new Date(); monthStart.setDate(1)
  const freqThisMonth = bibleReadings.filter(r => r.planId === activePlanId && r.completed && new Date(r.date) >= monthStart).length
  const freqBars = last7.map(d => bibleReadings.some(r => r.date === d && r.completed && r.planId === activePlanId) ? 60 : 0)

  const xpStart  = XP_LEVELS[profile.level - 1] || 0
  const xpEnd    = XP_LEVELS[profile.level] || XP_LEVELS[XP_LEVELS.length - 1] * 2
  const levelPct = xpEnd > xpStart ? Math.min(100, Math.round(((profile.xp - xpStart) / (xpEnd - xpStart)) * 100)) : 100

  const sortedReadings = [...bibleReadings].filter(r => r.planId === activePlanId).sort((a, b) => b.date.localeCompare(a.date))

  const recentEntries = useMemo(() => {
    const readings = sortedReadings.filter(r => r.reflection).slice(0, 3).map(r => ({ type: 'leitura' as const, id: r.id, reflection: r.reflection!, date: r.date }))
    const prayers  = [...prayerLog].filter(p => p.reflection).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(p => ({ type: 'oracao' as const, id: p.id, reflection: p.reflection!, date: p.date }))
    return [...readings, ...prayers].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  }, [sortedReadings, prayerLog])

  function handleReadingClick() {
    if (!todayReading) return
    if (readingState === 'idle') { completeBibleReading(today(), activePlanId, todayReading.label, ''); setReadingModal(true) }
    else if (readingState === 'in-progress') setReadingModal(true)
  }

  function handlePrayerClick() {
    if (prayerState === 'idle') { completePrayer(today()); setPrayerModal(true) }
    else if (prayerState === 'in-progress') setPrayerModal(true)
  }

  function handleReadingSave(q: Quality, note: string) {
    const r = bibleReadings.find(x => x.date === today() && x.planId === activePlanId)
    if (r) updateReflection(r.id, `[${q}] ${note}`)
    setReadingModal(false)
  }

  function handlePrayerSave(q: Quality, note: string) {
    if (todayPrayer) updatePrayerReflection(todayPrayer.id, `[${q}] ${note}`)
    setPrayerModal(false)
  }

  function relativeTime(date: string) {
    const days = Math.floor((Date.now() - new Date(date + 'T12:00:00').getTime()) / 86400000)
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Ontem'
    if (days < 7) return `Há ${days} dias`
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')
  }

  const greetingTitle = readingState === 'completed' && prayerState === 'completed'
    ? <>Dia completo, <span style={{ color: 'var(--color-primary)', textShadow: '0 0 24px rgba(var(--color-primary-rgb), .5)' }}>{profile.name}</span> ✦</>
    : <>Bom dia, <span style={{ color: 'var(--color-primary)', textShadow: '0 0 24px rgba(var(--color-primary-rgb), .5)' }}>{profile.name}</span></>

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto" style={{ animation: 'fadeIn 0.4s ease both' }}>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1.2px] mb-1" style={{ color: 'var(--color-text-subtle)' }}>
            <BookOpen size={11} /> Crescimento · Espiritual
          </div>
          <h1 className="text-[28px] font-bold tracking-tight leading-tight">{greetingTitle}</h1>
          <p className="text-[13px] italic font-light mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            &ldquo;O silêncio é onde Deus fala mais alto.&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(var(--color-accent-rgb), .25)', color: GOLD, backdropFilter: 'blur(12px)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
            <Flame size={12} style={{ color: ORANGE }} />
            {streak} dias
          </div>
          {/* Level widget */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(12px)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Nível {profile.level}</span>
            <span className="font-mono font-bold" style={{ color: 'var(--color-text-main)' }}>{profile.xp}</span>
            <span style={{ color: 'var(--color-text-subtle)' }}>XP</span>
            <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
              <div className="h-full rounded-full" style={{ width: `${levelPct}%`, background: 'var(--color-primary)', boxShadow: '0 0 6px rgba(var(--color-primary-rgb), .6)' }} />
            </div>
            <div className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{ background: 'rgba(var(--color-primary-rgb), .15)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb), .25)' }}>
              Lv.{profile.level}
            </div>
          </div>
        </div>
      </header>

      {/* ── STATS ROW ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {/* CONSISTÊNCIA */}
        <div className="rounded-2xl px-5 py-4" style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', border: '1px solid rgba(255,255,255,.09)' }}>
          <div className="flex items-center gap-1.5 mb-3 text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            <TrendingUp size={12} /> CONSISTÊNCIA
            <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>7 DIAS</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold font-mono leading-none" style={{ fontSize: 36, color: 'var(--color-primary)', textShadow: '0 0 16px rgba(var(--color-primary-rgb), .4)' }}>{consistency7}</span>
            <span className="ml-1 text-lg" style={{ color: 'var(--color-text-muted)' }}>%</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-subtle)' }}>dos dias com prática</p>
          <MiniSparkline values={consistencyBars} color="green" />
        </div>

        {/* PROFUNDIDADE */}
        <div className="rounded-2xl px-5 py-4" style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', border: '1px solid rgba(255,255,255,.09)' }}>
          <div className="flex items-center gap-1.5 mb-3 text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            <Layers size={12} /> PROFUNDIDADE
            <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>MÉDIA</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold font-mono leading-none" style={{ fontSize: 36, color: GOLD, textShadow: '0 0 16px rgba(var(--color-accent-rgb), .5)' }}>{depthScore.toFixed(1)}</span>
            <span className="ml-1 text-lg" style={{ color: 'var(--color-text-muted)' }}>/5</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-subtle)' }}>qualidade de reflexão</p>
          <MiniSparkline values={depthBars} color="gold" />
        </div>

        {/* FREQUÊNCIA */}
        <div className="rounded-2xl px-5 py-4" style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', border: '1px solid rgba(255,255,255,.09)' }}>
          <div className="flex items-center gap-1.5 mb-3 text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            <Activity size={12} /> FREQUÊNCIA
            <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>SESSÕES</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold font-mono leading-none" style={{ fontSize: 36, color: 'var(--color-primary)', textShadow: '0 0 16px rgba(var(--color-primary-rgb), .4)' }}>{freqThisMonth}</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-subtle)' }}>este mês</p>
          <MiniSparkline values={freqBars} color="green" />
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────── */}
      <div className="flex p-0.5 mb-5 rounded-md w-fit" style={{ background: 'rgba(255,255,255,.05)' }}>
        {([['hoje', '📖 Hoje'], ['historico', '📊 Histórico']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-1.5 text-xs font-medium rounded-[4px] transition-all"
            style={tab === key
              ? { background: 'rgba(var(--color-primary-rgb), .15)', color: 'var(--color-primary)' }
              : { color: 'var(--color-text-muted)', background: 'transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ HOJE TAB ════════════════════════════════════════════════ */}
      {tab === 'hoje' && (
        <>
          {/* Motivational banner */}
          {consistency7 < 40 && (
            <div className="flex items-center gap-2.5 mb-4 px-4 py-3 rounded-md text-[13px]"
              style={{ background: 'rgba(var(--color-accent-rgb), .07)', border: '1px solid rgba(var(--color-accent-rgb), .18)', color: 'var(--color-text-muted)' }}>
              <Sparkles size={14} style={{ color: GOLD, flexShrink: 0 }} />
              Comece com apenas <strong style={{ color: 'var(--color-text-main)', margin: '0 3px' }}>uma prática</strong> hoje. Consistência supera intensidade.
            </div>
          )}

          {/* Practice cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <PracticeCard type="orar" state={prayerState}   title="Orar" subtitle="Comunhão diária"            onClick={handlePrayerClick} />
            <PracticeCard type="ler"  state={readingState}  title="Ler"  subtitle={currentPlan?.name || 'Bíblia em 1 Ano'} onClick={handleReadingClick} />
          </div>

          {/* Plan progress */}
          <div className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', backdropFilter: 'blur(24px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: 'var(--color-text-main)' }}>
                <BookOpen size={14} style={{ color: GOLD }} /> Progresso do Plano
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold" style={{ color: GOLD }}>
                <Flame size={11} style={{ color: ORANGE }} /> {streak} dias de streak
              </div>
            </div>
            <div className="flex items-center gap-5">
              <CircularArc percent={progress} />
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold tracking-tight mb-0.5 truncate">{currentPlan?.name}</div>
                <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  {todayReading ? `Dia ${todayReading.day} · ${todayReading.label}` : '—'}
                </div>
                <div className="h-1 rounded-sm overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,.07)' }}>
                  <div className="h-full rounded-sm transition-all duration-700"
                    style={{ width: `${progress}%`, background: GOLD, boxShadow: '0 0 8px rgba(var(--color-accent-rgb), .6)' }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>{completedDates.length} / {currentPlan?.duration} dias concluídos</span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>{(currentPlan?.duration || 0) - completedDates.length} restantes</span>
                </div>
                <div className="mt-3">
                  <Link href="/espiritual/planos"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md hover:opacity-90"
                    style={{ background: 'rgba(var(--color-primary-rgb), .12)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb), .25)' }}>
                    <BookOpen size={11} /> Ver todos os planos
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent reflections */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', backdropFilter: 'blur(24px)' }}>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5 text-[13px] font-medium">
                <Feather size={14} style={{ color: 'var(--color-primary)' }} /> Reflexões Recentes
              </div>
              <button onClick={() => setTab('historico')} className="flex items-center gap-1 text-[11px] hover:text-white transition-colors" style={{ color: 'var(--color-text-subtle)' }}>
                Ver tudo <ArrowUpRight size={11} />
              </button>
            </div>
            {recentEntries.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>Nenhuma reflexão ainda. Conclua a leitura de hoje para começar.</p>
            ) : recentEntries.map(r => {
              const p = parseReflection(r.reflection)
              const dotColor = p.quality === 'deep' ? 'var(--color-primary)' : p.quality === 'distracted' ? 'rgba(248,113,113,.6)' : 'rgba(255,255,255,.3)'
              const typeLabel = r.type === 'oracao' ? 'Oração' : 'Leitura'
              return (
                <div key={r.id} className="flex items-start gap-3 px-3.5 py-3 mb-2 rounded-md"
                  style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.09)' }}>
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: dotColor, boxShadow: p.quality === 'deep' ? '0 0 8px rgba(var(--color-primary-rgb), .5)' : 'none' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold" style={{ color: 'var(--color-text-subtle)' }}>
                      {typeLabel} <QualityBadge quality={p.quality} />
                    </div>
                    <div className="text-[13px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>{p.note || '—'}</div>
                  </div>
                  <div className="text-[10px] font-mono whitespace-nowrap mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{relativeTime(r.date)}</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ══ HISTÓRICO TAB ═══════════════════════════════════════════ */}
      {tab === 'historico' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Streak calendar */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', backdropFilter: 'blur(24px)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-[13px] font-medium">
                  <Calendar size={14} style={{ color: 'var(--color-primary)' }} /> Consistência — 30 Dias
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono font-semibold" style={{ color: GOLD }}>
                  <Flame size={11} style={{ color: ORANGE }} /> {streak} dias
                </div>
              </div>
              <div className="flex flex-wrap gap-[5px]">
                {last30.map(date => {
                  const done    = bibleReadings.some(r => r.date === date && r.completed && r.planId === activePlanId)
                  const isToday = date === today()
                  return (
                    <div key={date} title={date} className="rounded-md" style={{
                      width: 22, height: 22,
                      background: done ? 'var(--color-primary)' : isToday ? 'rgba(var(--color-accent-rgb), .10)' : 'rgba(255,255,255,.05)',
                      border: `1px solid ${done ? 'var(--color-primary)' : isToday ? GOLD : 'rgba(255,255,255,.07)'}`,
                      boxShadow: done ? '0 0 6px rgba(var(--color-primary-rgb), .4)' : isToday ? '0 0 8px rgba(var(--color-accent-rgb), .4)' : 'none',
                    }} />
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-3.5">
                {[
                  { bg: 'var(--color-primary)',                                      label: 'Concluído' },
                  { bg: 'rgba(var(--color-accent-rgb), .2)', border: `1px solid ${GOLD}`,           label: 'Hoje' },
                  { bg: 'rgba(255,255,255,.05)',                                      label: 'Sem atividade' },
                ].map(({ bg, border, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: bg, border }} /> {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Plan progress */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', backdropFilter: 'blur(24px)' }}>
              <div className="flex items-center gap-1.5 text-[12px] uppercase tracking-wider mb-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                <BookOpen size={12} /> Progresso do Plano
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">{currentPlan?.name}</span>
                  <span className="text-xs font-bold font-mono" style={{ color: GOLD }}>{progress}%</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }} />
                </div>
                <div className="h-1 rounded-sm overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,.07)' }}>
                  <div className="h-full rounded-sm transition-all duration-700"
                    style={{ width: `${progress}%`, background: GOLD, boxShadow: '0 0 8px rgba(var(--color-accent-rgb), .6)' }} />
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
                  {completedDates.length} / {currentPlan?.duration} dias concluídos
                </div>
              </div>
              <div className="border-t pt-3.5" style={{ borderColor: 'rgba(255,255,255,.09)' }}>
                <div className="text-xs mb-2.5" style={{ color: 'var(--color-text-muted)' }}>Leituras recentes</div>
                {sortedReadings.filter(r => r.completed).slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center gap-2 mb-2">
                    <CheckCircle size={13} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{r.passage}</span>
                    <span className="ml-auto text-[10px] font-mono whitespace-nowrap" style={{ color: 'var(--color-text-subtle)' }}>
                      {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
                {sortedReadings.filter(r => r.completed).length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Nenhuma leitura ainda.</p>
                )}
              </div>
            </div>
          </div>

          {/* Full journal */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', backdropFilter: 'blur(24px)' }}>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5 text-[13px] font-medium">
                <Feather size={14} style={{ color: 'var(--color-primary)' }} /> Diário de Reflexões
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>{sortedReadings.filter(r => r.reflection).length + prayerLog.filter(p => p.reflection).length} entradas</div>
            </div>
            {sortedReadings.length === 0 && prayerLog.length === 0 && (
              <div className="py-12 text-center">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--color-text-subtle)' }} />
                <p style={{ color: 'var(--color-text-subtle)' }}>Nenhuma leitura registrada ainda</p>
                <button onClick={() => setTab('hoje')} className="text-sm mt-2 hover:underline" style={{ color: 'var(--color-primary)' }}>Começar agora →</button>
              </div>
            )}
            {sortedReadings.map(r => {
              const p = parseReflection(r.reflection)
              const dotColor = p.quality === 'deep' ? 'var(--color-primary)' : p.quality === 'distracted' ? 'rgba(248,113,113,.6)' : 'rgba(255,255,255,.3)'
              return (
                <div key={r.id} className="flex items-start gap-3 px-3.5 py-3 mb-2 rounded-md hover:bg-white/[0.03] transition-colors"
                  style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.09)', opacity: r.completed ? 1 : 0.5 }}>
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: dotColor, boxShadow: p.quality === 'deep' ? '0 0 8px rgba(var(--color-primary-rgb), .5)' : 'none' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold" style={{ color: 'var(--color-text-subtle)' }}>
                      Leitura <QualityBadge quality={p.quality} />
                      {r.completed && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(var(--color-primary-rgb), .12)', color: 'var(--color-primary)' }}>+15 XP</span>}
                    </div>
                    {editingId === r.id && editType === 'reading' ? (
                      <div className="mt-1.5">
                        <textarea rows={3} value={editText} onChange={e => setEditText(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md outline-none resize-none"
                          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', color: 'var(--color-text-main)' }} />
                        <button onClick={() => {
                          const ex = parseReflection(r.reflection)
                          updateReflection(r.id, ex.quality ? `[${ex.quality}] ${editText}` : editText)
                          setEditingId(null)
                        }} className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5" style={{ background: 'var(--color-primary)', color: '#000' }}>
                          <Save size={11} /> Salvar
                        </button>
                      </div>
                    ) : p.note ? (
                      <>
                        <div className="text-[13px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>{p.note}</div>
                        <button onClick={() => { setEditingId(r.id); setEditType('reading'); setEditText(p.note) }}
                          className="text-[10px] mt-1 flex items-center gap-1 hover:underline" style={{ color: 'var(--color-primary)' }}>
                          <Edit3 size={9} /> Editar reflexão
                        </button>
                      </>
                    ) : r.completed ? (
                      <button onClick={() => { setEditingId(r.id); setEditType('reading'); setEditText('') }}
                        className="text-xs flex items-center gap-1 transition-colors" style={{ color: 'var(--color-text-subtle)' }}>
                        <Edit3 size={10} /> Adicionar reflexão
                      </button>
                    ) : null}
                  </div>
                  <div className="text-[10px] font-mono whitespace-nowrap mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
                    {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )
            })}
            {[...prayerLog].sort((a, b) => b.date.localeCompare(a.date)).map(p => {
              const parsed = parseReflection(p.reflection)
              const dotColor = parsed.quality === 'deep' ? 'var(--color-primary)' : parsed.quality === 'distracted' ? 'rgba(248,113,113,.6)' : 'rgba(255,255,255,.3)'
              return (
                <div key={p.id} className="flex items-start gap-3 px-3.5 py-3 mb-2 rounded-md hover:bg-white/[0.03] transition-colors"
                  style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.09)' }}>
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: dotColor, boxShadow: parsed.quality === 'deep' ? '0 0 8px rgba(var(--color-primary-rgb), .5)' : 'none' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold" style={{ color: 'var(--color-text-subtle)' }}>
                      Oração <QualityBadge quality={parsed.quality} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(var(--color-primary-rgb), .12)', color: 'var(--color-primary)' }}>+10 XP</span>
                    </div>
                    {editingId === p.id && editType === 'prayer' ? (
                      <div className="mt-1.5">
                        <textarea rows={3} value={editText} onChange={e => setEditText(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md outline-none resize-none"
                          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', color: 'var(--color-text-main)' }} />
                        <button onClick={() => {
                          const ex = parseReflection(p.reflection)
                          updatePrayerReflection(p.id, ex.quality ? `[${ex.quality}] ${editText}` : editText)
                          setEditingId(null)
                        }} className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5" style={{ background: 'var(--color-primary)', color: '#000' }}>
                          <Save size={11} /> Salvar
                        </button>
                      </div>
                    ) : parsed.note ? (
                      <>
                        <div className="text-[13px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>{parsed.note}</div>
                        <button onClick={() => { setEditingId(p.id); setEditType('prayer'); setEditText(parsed.note) }}
                          className="text-[10px] mt-1 flex items-center gap-1 hover:underline" style={{ color: 'var(--color-primary)' }}>
                          <Edit3 size={9} /> Editar reflexão
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setEditingId(p.id); setEditType('prayer'); setEditText('') }}
                        className="text-xs flex items-center gap-1 transition-colors" style={{ color: 'var(--color-text-subtle)' }}>
                        <Edit3 size={10} /> Adicionar reflexão
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] font-mono whitespace-nowrap mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
                    {new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── MODALS ──────────────────────────────────────────────────── */}
      {readingModal && <FeedbackModal type="ler"  onClose={() => setReadingModal(false)} onSave={handleReadingSave} />}
      {prayerModal  && <FeedbackModal type="orar" onClose={() => setPrayerModal(false)}  onSave={handlePrayerSave} />}
    </div>
  )
}
