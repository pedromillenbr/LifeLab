'use client'
import Link from 'next/link'
import { useStore } from '@/store/useStore'
import { BIBLE_PLANS, BiblePlanLevel } from '@/lib/bibleData'
import { ArrowLeft, BookOpen, Play, CheckCircle, Clock } from 'lucide-react'

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
  const { biblePlansProgress, startBiblePlan } = useStore()

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
          Inicie quantos planos quiser. Seu progresso é salvo automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BIBLE_PLANS.map(plan => {
          const progress = biblePlansProgress[plan.id]
          const pct = progress ? Math.round((progress.completedDays.length / plan.duration) * 100) : 0
          const started = !!progress
          const finished = started && progress.completedDays.length >= plan.duration
          const levelColor = LEVEL_COLOR[plan.level]
          return (
            <div key={plan.id} className="rounded-2xl p-5 flex flex-col"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.09)',
                backdropFilter: 'blur(20px)',
              }}>
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

              <div className="flex gap-2">
                {!started && (
                  <button
                    onClick={() => startBiblePlan(plan.id)}
                    className="flex-1 py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: 'var(--color-primary)',
                      color: '#000',
                      boxShadow: '0 0 18px rgba(34,197,94,.3)',
                    }}>
                    <Play size={13} /> Iniciar
                  </button>
                )}
                {started && (
                  <Link href={`/espiritual/planos/${plan.id}`}
                    className="flex-1 py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: finished ? 'rgba(34,197,94,.15)' : 'var(--color-primary)',
                      color: finished ? 'var(--color-primary)' : '#000',
                      border: finished ? '1px solid rgba(34,197,94,.3)' : 'none',
                      boxShadow: finished ? 'none' : '0 0 18px rgba(34,197,94,.3)',
                    }}>
                    {finished ? <><CheckCircle size={13} /> Concluído</> : <><Play size={13} /> Continuar</>}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
