'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { getBiblePlan, localizeReference } from '@/lib/bibleData'
import { imageForReadings } from '@/lib/bibleImages'
import { fetchPassage, type Passage, BibleAPIError } from '@/services/bibleService'
import { ArrowLeft, ArrowRight, Check, CheckCircle, AlertTriangle, Loader2, BookOpen } from 'lucide-react'

interface PassageState {
  reference: string
  loading: boolean
  data: Passage | null
  error: string | null
}

function PassageBlock({ state, onRetry }: { state: PassageState; onRetry: () => void }) {
  return (
    <article className="rounded-2xl p-6 mb-4"
      style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.09)' }}>
      <header className="flex items-center justify-between mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <h2 className="text-lg font-bold tracking-tight">
          {localizeReference(state.reference)}
        </h2>
        {state.loading && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-text-subtle)' }} />}
      </header>

      {state.error && (
        <div className="flex flex-col items-start gap-2 py-4 text-sm" style={{ color: '#f87171' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} /> {state.error}
          </div>
          <button onClick={onRetry}
            className="text-xs px-3 py-1.5 rounded-md font-medium"
            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: 'var(--color-text-main)' }}>
            Tentar novamente
          </button>
        </div>
      )}

      {state.loading && !state.data && !state.error && (
        <div className="space-y-2 py-2">
          {[60, 90, 75, 85, 70].map((w, i) => (
            <div key={i} className="h-4 rounded animate-pulse"
              style={{ background: 'rgba(255,255,255,.05)', width: `${w}%` }} />
          ))}
        </div>
      )}

      {state.data && (
        <div className="reading-prose">
          {state.data.verses.map((v, i) => {
            const startsChapter = i === 0 || v.chapter !== state.data!.verses[i - 1].chapter
            return (
              <span key={`${v.chapter}-${v.verse}`}>
                {startsChapter && i > 0 && (
                  <span className="block mt-5 mb-2 text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--color-primary)' }}>
                    Capítulo {v.chapter}
                  </span>
                )}
                <sup className="text-[10px] mr-1 font-mono"
                  style={{ color: 'var(--color-text-subtle)' }}>{v.verse}</sup>
                <span>{v.text.trim()} </span>
              </span>
            )
          })}
        </div>
      )}
    </article>
  )
}

export default function LeituraPage({ params }: { params: { id: string; day: string } }) {
  const router = useRouter()
  const plan = getBiblePlan(params.id)
  const day = parseInt(params.day, 10)
  const dayDef = plan?.days.find(d => d.day === day)

  const { biblePlansProgress, markBiblePlanDayRead, isBiblePlanDayCompleted, startBiblePlan } = useStore()
  const progress = plan ? biblePlansProgress[plan.id] : undefined
  const alreadyDone = plan ? isBiblePlanDayCompleted(plan.id, day) : false

  const [passages, setPassages] = useState<PassageState[]>([])
  const [marking, setMarking] = useState(false)

  // Auto-start plan if user lands on a reading page directly
  useEffect(() => {
    if (plan && !progress) startBiblePlan(plan.id)
  }, [plan, progress, startBiblePlan])

  useEffect(() => {
    if (!dayDef) return
    setPassages(dayDef.readings.map(r => ({ reference: r, loading: true, data: null, error: null })))
    let cancelled = false
    dayDef.readings.forEach((ref, idx) => {
      fetchPassage(ref)
        .then(data => {
          if (cancelled) return
          setPassages(prev => prev.map((p, i) =>
            i === idx ? { ...p, loading: false, data, error: null } : p
          ))
        })
        .catch((e: unknown) => {
          if (cancelled) return
          const msg = e instanceof BibleAPIError ? e.message : 'Erro ao carregar passagem'
          setPassages(prev => prev.map((p, i) =>
            i === idx ? { ...p, loading: false, error: msg } : p
          ))
        })
    })
    return () => { cancelled = true }
  }, [params.id, params.day, dayDef])

  if (!plan || !dayDef) {
    return (
      <div className="p-6 max-w-[800px] mx-auto">
        <Link href="/espiritual/planos" className="inline-flex items-center gap-1.5 text-xs mb-4"
          style={{ color: 'var(--color-text-subtle)' }}>
          <ArrowLeft size={12} /> Voltar
        </Link>
        <p style={{ color: 'var(--color-text-muted)' }}>Leitura não encontrada.</p>
      </div>
    )
  }

  function retry(idx: number) {
    if (!dayDef) return
    setPassages(prev => prev.map((p, i) =>
      i === idx ? { ...p, loading: true, error: null } : p
    ))
    fetchPassage(dayDef.readings[idx])
      .then(data => setPassages(prev => prev.map((p, i) =>
        i === idx ? { ...p, loading: false, data, error: null } : p
      )))
      .catch((e: unknown) => {
        const msg = e instanceof BibleAPIError ? e.message : 'Erro ao carregar passagem'
        setPassages(prev => prev.map((p, i) =>
          i === idx ? { ...p, loading: false, error: msg } : p
        ))
      })
  }

  function handleMarkRead() {
    if (alreadyDone || marking) return
    setMarking(true)
    markBiblePlanDayRead(plan!.id, day)
    setTimeout(() => {
      setMarking(false)
      if (day < plan!.duration) router.push(`/espiritual/planos/${plan!.id}/ler/${day + 1}`)
      else router.push(`/espiritual/planos/${plan!.id}`)
    }, 600)
  }

  const prevDay = day > 1 ? day - 1 : null
  const nextDay = day < plan.duration ? day + 1 : null

  const dayImage = useMemo(
    () => (dayDef ? imageForReadings(dayDef.readings) : null),
    [dayDef]
  )
  const imageKey = `${params.id}-${params.day}`

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto" style={{ animation: 'fadeIn .4s ease both' }}>
      <Link href={`/espiritual/planos/${plan.id}`}
        className="inline-flex items-center gap-1.5 text-xs mb-4 hover:opacity-80"
        style={{ color: 'var(--color-text-subtle)' }}>
        <ArrowLeft size={12} /> {plan.name}
      </Link>

      <header className="mb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1.2px] mb-1"
          style={{ color: 'var(--color-text-subtle)' }}>
          <BookOpen size={11} /> Dia {day} de {plan.duration}
        </div>
        <h1 className="page-title">Leitura do dia</h1>
      </header>

      <div className="md:grid md:grid-cols-[minmax(0,1fr)_320px] md:gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        {/* TEXT COLUMN */}
        <div className="min-w-0">
          {passages.map((state, i) => (
            <PassageBlock key={`${state.reference}-${i}`} state={state} onRetry={() => retry(i)} />
          ))}

          <div className="sticky bottom-4 z-10 mt-6">
            <button
              onClick={handleMarkRead}
              disabled={alreadyDone || marking}
              className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background: alreadyDone ? 'rgba(var(--color-primary-rgb), .15)' : 'var(--color-primary)',
                color: alreadyDone ? 'var(--color-primary)' : '#000',
                border: alreadyDone ? '1px solid rgba(var(--color-primary-rgb), .3)' : 'none',
                boxShadow: alreadyDone ? 'none' : '0 0 28px rgba(var(--color-primary-rgb), .4)',
                cursor: alreadyDone ? 'default' : 'pointer',
                opacity: marking ? 0.7 : 1,
              }}>
              {alreadyDone
                ? <><CheckCircle size={16} /> Já concluído · +15 XP</>
                : <><Check size={16} /> {marking ? 'Salvando...' : 'Marcar como lido'}</>}
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs">
            {prevDay
              ? <Link href={`/espiritual/planos/${plan.id}/ler/${prevDay}`}
                  className="inline-flex items-center gap-1.5 hover:opacity-80"
                  style={{ color: 'var(--color-text-muted)' }}>
                  <ArrowLeft size={12} /> Dia {prevDay}
                </Link>
              : <span />}
            {nextDay
              ? <Link href={`/espiritual/planos/${plan.id}/ler/${nextDay}`}
                  className="inline-flex items-center gap-1.5 hover:opacity-80"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Dia {nextDay} <ArrowRight size={12} />
                </Link>
              : <span />}
          </div>
        </div>

        {/* IMAGE COLUMN — desktop only (md+) */}
        {dayImage && (
          <aside className="hidden md:block">
            <div className="sticky top-6">
              <motion.div
                key={imageKey}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 0.68, 0, 1.2] }}
                className="rounded-2xl overflow-hidden"
                style={{
                  border: '1px solid rgba(255,255,255,.09)',
                  background: 'rgba(255,255,255,.03)',
                  boxShadow: '0 12px 40px rgba(0,0,0,.4), 0 0 24px rgba(var(--color-primary-rgb), .06)',
                }}>
                <div className="relative aspect-square">
                  <Image
                    src={dayImage.src}
                    alt={dayImage.alt}
                    fill
                    sizes="(max-width: 768px) 0px, (max-width: 1024px) 320px, 360px"
                    priority
                    className="object-cover"
                  />
                </div>
              </motion.div>
              <motion.p
                key={imageKey + '-cap'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-[11px] mt-3 text-center font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-subtle)' }}>
                {dayImage.alt}
              </motion.p>
            </div>
          </aside>
        )}
      </div>

      <style jsx>{`
        :global(.reading-prose) {
          font-size: 16px;
          line-height: 1.78;
          color: rgba(255,255,255,.86);
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: 0.01em;
        }
      `}</style>
    </div>
  )
}
