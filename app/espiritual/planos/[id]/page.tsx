'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { getBiblePlan, readingsLabel } from '@/lib/bibleData'
import { ArrowLeft, BookOpen, Play, CheckCircle, RotateCcw, Circle } from 'lucide-react'
import { useState } from 'react'

export default function PlanoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const plan = getBiblePlan(params.id)
  const { biblePlansProgress, resetBiblePlan, startBiblePlan } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)

  if (!plan) {
    return (
      <div className="p-6 max-w-[800px] mx-auto">
        <Link href="/espiritual/planos" className="inline-flex items-center gap-1.5 text-xs mb-4 hover:opacity-80"
          style={{ color: 'var(--color-text-subtle)' }}>
          <ArrowLeft size={12} /> Voltar
        </Link>
        <p style={{ color: 'var(--color-text-muted)' }}>Plano não encontrado.</p>
      </div>
    )
  }

  const progress = biblePlansProgress[plan.id]
  const completed = progress?.completedDays || []
  const pct = Math.round((completed.length / plan.duration) * 100)
  const finished = completed.length >= plan.duration
  const nextDay = progress
    ? Math.max(1, Math.min(plan.duration, progress.currentDay))
    : 1

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto" style={{ animation: 'fadeIn .4s ease both' }}>
      <Link href="/espiritual/planos" className="inline-flex items-center gap-1.5 text-xs mb-4 hover:opacity-80"
        style={{ color: 'var(--color-text-subtle)' }}>
        <ArrowLeft size={12} /> Todos os planos
      </Link>

      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1.2px] mb-1"
          style={{ color: 'var(--color-text-subtle)' }}>
          <BookOpen size={11} /> Plano de leitura
        </div>
        <h1 className="text-[26px] md:text-[30px] font-bold tracking-tight">{plan.name}</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{plan.description}</p>
      </div>

      {/* Progress card */}
      <div className="rounded-2xl p-5 mb-5"
        style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider font-medium"
            style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
          <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-primary)' }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-sm overflow-hidden mb-2"
          style={{ background: 'rgba(255,255,255,.07)' }}>
          <div className="h-full" style={{
            width: `${pct}%`, background: 'var(--color-primary)',
            boxShadow: '0 0 8px rgba(34,197,94,.5)', transition: 'width .6s ease',
          }} />
        </div>
        <div className="flex justify-between text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
          <span>{completed.length} / {plan.duration} dias concluídos</span>
          <span>{plan.duration - completed.length} restantes</span>
        </div>

        <div className="flex gap-2 mt-4">
          {!progress && (
            <button onClick={() => { startBiblePlan(plan.id); router.push(`/espiritual/planos/${plan.id}/ler/1`) }}
              className="flex-1 py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5"
              style={{ background: 'var(--color-primary)', color: '#000', boxShadow: '0 0 18px rgba(34,197,94,.3)' }}>
              <Play size={13} /> Iniciar leitura
            </button>
          )}
          {progress && !finished && (
            <Link href={`/espiritual/planos/${plan.id}/ler/${nextDay}`}
              className="flex-1 py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5"
              style={{ background: 'var(--color-primary)', color: '#000', boxShadow: '0 0 18px rgba(34,197,94,.3)' }}>
              <Play size={13} /> Continuar leitura · Dia {nextDay}
            </Link>
          )}
          {finished && (
            <div className="flex-1 py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(34,197,94,.15)', color: 'var(--color-primary)', border: '1px solid rgba(34,197,94,.3)' }}>
              <CheckCircle size={13} /> Plano concluído
            </div>
          )}
          {progress && (
            <button onClick={() => setConfirmReset(true)}
              className="px-3 rounded-md text-xs font-medium flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', color: 'var(--color-text-muted)' }}>
              <RotateCcw size={11} /> Resetar
            </button>
          )}
        </div>
      </div>

      {/* Day list */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
        <div className="text-[11px] uppercase tracking-wider font-medium mb-3"
          style={{ color: 'var(--color-text-muted)' }}>
          Cronograma · {plan.duration} dias
        </div>
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {plan.days.map(d => {
            const done = completed.includes(d.day)
            const isNext = !done && d.day === nextDay
            return (
              <Link key={d.day} href={`/espiritual/planos/${plan.id}/ler/${d.day}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-white/[.04]"
                style={{
                  background: isNext ? 'rgba(34,197,94,.06)' : 'rgba(255,255,255,.02)',
                  border: `1px solid ${isNext ? 'rgba(34,197,94,.3)' : 'rgba(255,255,255,.06)'}`,
                }}>
                {done
                  ? <CheckCircle size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  : <Circle size={14} style={{ color: isNext ? 'var(--color-primary)' : 'var(--color-text-subtle)', flexShrink: 0 }} />}
                <span className="text-[11px] font-mono w-12 flex-shrink-0"
                  style={{ color: 'var(--color-text-subtle)' }}>Dia {d.day}</span>
                <span className="text-[13px] truncate flex-1"
                  style={{ color: done ? 'var(--color-text-subtle)' : 'var(--color-text-main)' }}>
                  {readingsLabel(d.readings)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Reset confirm */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setConfirmReset(false)}>
          <div className="rounded-xl p-6 w-[400px] max-w-full" onClick={e => e.stopPropagation()}
            style={{ background: '#0f1116', border: '1px solid rgba(255,255,255,.18)' }}>
            <h3 className="text-base font-bold mb-2">Resetar plano?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Você perderá o progresso de <strong>{completed.length} dias</strong> neste plano. Outros planos não são afetados.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 rounded-md text-sm font-medium"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)' }}>
                Cancelar
              </button>
              <button onClick={() => { resetBiblePlan(plan.id); setConfirmReset(false) }}
                className="flex-1 py-2 rounded-md text-sm font-bold"
                style={{ background: '#f87171', color: '#000' }}>
                Resetar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
