'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { COVER_PRESETS, buildAutoMilestones } from '@/lib/goals'
import type { GoalCategory, GoalDirection, GoalMilestone } from '@/store/types'

interface AddGoalModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (g: {
    title: string
    subtitle?: string
    category: GoalCategory
    coverImage?: string
    coverPreset: string
    startValue: number
    currentValue: number
    targetValue: number
    unit: string
    direction: GoalDirection
    startDate: string
    targetDate?: string
    milestones: Omit<GoalMilestone, 'id'>[]
  }) => void
}

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'R$', label: 'R$ (reais)' },
  { value: 'h', label: 'horas' },
  { value: 'dias', label: 'dias' },
  { value: 'unidades', label: 'unidades' },
  { value: 'páginas', label: 'páginas' },
  { value: '%', label: '%' },
]

export function AddGoalModal({ open, onClose, onSubmit }: AddGoalModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>('fisico')
  const [coverPreset, setCoverPreset] = useState('fisico')
  const [coverImage, setCoverImage] = useState('')
  const [startValue, setStartValue] = useState('0')
  const [targetValue, setTargetValue] = useState('100')
  const [unit, setUnit] = useState('unidades')
  const [direction, setDirection] = useState<GoalDirection>('increase')
  const [targetDate, setTargetDate] = useState('')

  function reset() {
    setStep(1); setTitle(''); setSubtitle('')
    setCategory('fisico'); setCoverPreset('fisico'); setCoverImage('')
    setStartValue('0'); setTargetValue('100'); setUnit('unidades')
    setDirection('increase'); setTargetDate('')
  }

  function handleClose() { reset(); onClose() }

  function handleSubmit() {
    const sv = parseFloat(startValue.replace(',', '.'))
    const tv = parseFloat(targetValue.replace(',', '.'))
    if (!title.trim() || !Number.isFinite(sv) || !Number.isFinite(tv)) return
    const dir: GoalDirection = sv < tv ? 'increase' : 'decrease'
    const today = new Date().toISOString().slice(0, 10)
    onSubmit({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category,
      coverPreset,
      coverImage: coverImage.trim() || undefined,
      startValue: sv,
      currentValue: sv,
      targetValue: tv,
      unit,
      direction: dir,
      startDate: today,
      targetDate: targetDate || undefined,
      milestones: buildAutoMilestones(sv, tv, unit),
    })
    reset()
  }

  return (
    <Modal open={open} onClose={handleClose} title={step === 1 ? 'Nova meta' : 'Capa da meta'}>
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Título da meta</label>
            <input
              autoFocus
              className="input"
              placeholder="Ex: Meter o shape, Juntar 10 mil…"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Subtítulo motivacional (opcional)</label>
            <input
              className="input"
              placeholder="Ex: 6 meses pra construir o melhor shape da minha vida"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Categoria</label>
              <Select
                value={category}
                onChange={(v) => {
                  setCategory(v as GoalCategory)
                  // ajusta preset para a categoria escolhida automaticamente
                  setCoverPreset(v)
                }}
                options={COVER_PRESETS.map(p => ({ value: p.id, label: p.label }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Unidade</label>
              <Select
                value={unit}
                onChange={(v) => setUnit(v)}
                options={UNIT_OPTIONS}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Valor inicial</label>
              <input
                type="text" inputMode="decimal" className="input"
                value={startValue} onChange={e => setStartValue(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Valor alvo</label>
              <input
                type="text" inputMode="decimal" className="input"
                value={targetValue} onChange={e => setTargetValue(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Prazo (opcional)</label>
            <input
              type="date" className="input"
              value={targetDate} onChange={e => setTargetDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!title.trim()}
            className="btn-primary w-full justify-center py-3"
            style={{ opacity: title.trim() ? 1 : 0.5 }}
          >
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>
            Escolha um visual para sua meta. Você pode trocar depois.
          </p>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Visual</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {COVER_PRESETS.map(p => {
                const active = coverPreset === p.id
                const Icon = p.icon
                return (
                  <button
                    key={p.id}
                    onClick={() => setCoverPreset(p.id)}
                    style={{
                      aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
                      background: p.gradient, position: 'relative',
                      border: active ? `2px solid ${p.accent}` : '1px solid rgba(255,255,255,.08)',
                      cursor: 'pointer', transition: 'all .2s',
                      boxShadow: active ? `0 0 16px ${p.accent}55` : 'none',
                    }}
                    title={p.label}
                  >
                    <Icon
                      size={28}
                      style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', color: p.accent, opacity: .9,
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">URL de imagem (opcional)</label>
            <input
              type="url" className="input"
              placeholder="https://… (foto inspiração)"
              value={coverImage} onChange={e => setCoverImage(e.target.value)}
            />
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
              Se preencher, a imagem aparece sobre o visual escolhido com overlay cinematográfico.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStep(1)}
              className="btn-ghost"
              style={{ flex: 1, padding: '12px' }}
            >Voltar</button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
              style={{ flex: 2, padding: '12px', justifyContent: 'center' }}
            >
              Criar meta
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
