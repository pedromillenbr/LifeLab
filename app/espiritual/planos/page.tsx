'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { BIBLE_PLANS, BiblePlanLevel } from '@/lib/bibleData'
import { ArrowLeft, BookOpen, Play, CheckCircle, Clock, Pause, Trash2, RotateCcw } from 'lucide-react'

const LEVEL_LABEL: Record<BiblePlanLevel, string> = {
  iniciante: 'Iniciante',
  medio: 'Médio',
  intenso: 'Intenso',
}
const LEVEL_COLOR: Record<BiblePlanLevel, string> = {
  iniciante: '#22c55e',
  medio: '#eab308',
  intenso: '#f97316',
}

export default function PlanosPage() {
  const router = useRouter()
  const {
    biblePlansProgress, activePlanId,
    startBiblePlan, pauseBiblePlan, resumeBiblePlan, resetBiblePlan,
  } = useStore()

  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  function handleStart(planId: string) {
    startBiblePlan(planId)
    router.push(`/espiritual/planos/${planId}`)
  }

  function handleResume(planId: string) {
    resumeBiblePlan(planId)
    router.push(`/espiritual/planos/${planId}`)
  }

  function handleCancel(planId: string) {
    resetBiblePlan(planId)
    setConfirmCancelId(null)
  }

  const cancelTarget = confirmCancelId ? BIBLE_PLANS.find(p => p.id === confirmCancelId) : null
  const cancelProgress = confirmCancelId ? biblePlansProgress[confirmCancelId] : null

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto" style={{ animation: 'fadeIn .4s ease both' }}>
      <Link href="/espiritual" className="inline-flex items-center gap-1.5 text-xs mb-4 hover:opacity-80"
        style={{ color: 'var(--color-text-subtle)' }}>
        <ArrowLeft size={12} /> Voltar
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1.2px] mb-1"
          style={{ color: 'var(--color-text-subtle)' }}>
          <BookOpen size={11} /> Espiritual · Planos de Leitura
        </div>
        <h1 className="text-[28px] font-bold tracking-tight">Escolha um plano</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Apenas um plano fica ativo por vez. Pausar mantém seu progresso; cancelar zera tudo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BIBLE_PLANS.map(plan => {
          const progress = biblePlansProgress[plan.id]
          const started = !!progress
          const isActive = started && activePlanId === plan.id
          const isPaused = started && !isActive
          const finished = started && progress.completedDays.length >= plan.duration
          const pct = started ? Math.round((progress.completedDays.length / plan.duration) * 100) : 0
          const levelColor = LEVEL_COLOR[plan.level]

          return (
            <div key={plan.id} className="rounded-2xl p-5 flex flex-col"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: `1px solid ${isActive ? 'rgba(34,197,94,.3)' : 'rgba(255,255,255,.09)'}`,
                backdropFilter: 'blur(20px)',
                boxShadow: isActive ? '0 0 24px rgba(34,197,94,.1)' : 'none',
              }}>

              {/* Card header — clickable area for navigation when started */}
              {started ? (
                <Link href={`/espiritual/planos/${plan.id}`} className="block group">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold tracking-tight group-hover:text-white">
                      {plan.name}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(34,197,94,.12)',
                            color: 'var(--color-primary)',
                            border: '1px solid rgba(34,197,94,.3)',
                          }}>
                          Ativo
                        </span>
                      )}
                      {isPaused && !finished && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(255,255,255,.05)',
                            color: 'var(--color-text-muted)',
                            border: '1px solid rgba(255,255,255,.12)',
                          }}>
                          Pausado
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap"
                        style={{
                          background: `${levelColor}1a`,
                          color: levelColor,
                          border: `1px solid ${levelColor}40`,
                        }}>
                        {LEVEL_LABEL[plan.level]}
                      </span>
                    </div>
                  </div>
                  <p className="text-[12px] mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    {plan.description}
                  </p>
                </Link>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold tracking-tight">{plan.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `${levelColor}1a`,
                        color: levelColor,
                        border: `1px solid ${levelColor}40`,
                      }}>
                      {LEVEL_LABEL[plan.level]}
                    </span>
                  </div>
                  <p className="text-[12px] mb-4 flex-1" style={{ color: 'var(--color-text-muted)' }}>
                    {plan.description}
                  </p>
                </>
              )}

              <div className="flex items-center gap-3 text-[11px] mb-3"
                style={{ color: 'var(--color-text-subtle)' }}>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} /> {plan.duration} dias
                </span>
                {started && (
                  <span className="inline-flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                    <CheckCircle size={11} /> {progress.completedDays.length}/{plan.duration} concluídos
                  </span>
                )}
              </div>

              {started && (
                <div className="h-1 rounded-sm overflow-hidden mb-3"
                  style={{ background: 'rgba(255,255,255,.07)' }}>
                  <div className="h-full"
                    style={{
                      width: `${pct}%`,
                      background: 'var(--color-primary)',
                      boxShadow: '0 0 6px rgba(34,197,94,.5)',
                      transition: 'width .5s ease',
                    }} />
                </div>
              )}

              {/* ── BOTÕES ────────────────────────────────────────── */}
              {!started && (
                <button
                  onClick={() => handleStart(plan.id)}
                  className="w-full py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    background: 'var(--color-primary)',
                    color: '#000',
                    boxShadow: '0 0 18px rgba(34,197,94,.3)',
                  }}>
                  <Play size={13} /> Iniciar plano
                </button>
              )}

              {finished && (
                <Link href={`/espiritual/planos/${plan.id}`}
                  className="w-full py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5"
                  style={{
                    background: 'rgba(34,197,94,.15)',
                    color: 'var(--color-primary)',
                    border: '1px solid rgba(34,197,94,.3)',
                  }}>
                  <CheckCircle size={13} /> Concluído · Ver
                </Link>
              )}

              {started && !finished && (
                <div className="flex gap-2">
                  {isActive ? (
                    <button
                      onClick={() => pauseBiblePlan(plan.id)}
                      className="flex-1 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: 'rgba(255,255,255,.05)',
                        color: 'var(--color-text-main)',
                        border: '1px solid rgba(255,255,255,.12)',
                      }}>
                      <Pause size={12} /> Pausar plano
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResume(plan.id)}
                      className="flex-1 py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: 'var(--color-primary)',
                        color: '#000',
                        boxShadow: '0 0 18px rgba(34,197,94,.3)',
                      }}>
                      <RotateCcw size={12} /> Retomar
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmCancelId(plan.id)}
                    className="flex-1 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: 'rgba(248,113,113,.08)',
                      color: '#f87171',
                      border: '1px solid rgba(248,113,113,.25)',
                    }}>
                    <Trash2 size={12} /> Cancelar plano
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Confirm cancel modal */}
      {cancelTarget && cancelProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setConfirmCancelId(null)}>
          <div className="rounded-xl p-6 w-[420px] max-w-full" onClick={e => e.stopPropagation()}
            style={{ background: '#0f1116', border: '1px solid rgba(255,255,255,.18)' }}>
            <h3 className="text-base font-bold mb-2">Cancelar plano?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Você perderá o progresso de <strong style={{ color: 'var(--color-text-main)' }}>
                {cancelProgress.completedDays.length} dias
              </strong> em <strong style={{ color: 'var(--color-text-main)' }}>{cancelTarget.name}</strong>.
              Para preservar o histórico use <strong style={{ color: 'var(--color-text-main)' }}>Pausar</strong>.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmCancelId(null)}
                className="flex-1 py-2 rounded-md text-sm font-medium"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: 'var(--color-text-main)' }}>
                Voltar
              </button>
              <button onClick={() => handleCancel(cancelTarget.id)}
                className="flex-1 py-2 rounded-md text-sm font-bold"
                style={{ background: '#f87171', color: '#000' }}>
                Cancelar plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
