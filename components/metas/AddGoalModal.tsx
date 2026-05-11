'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { COVER_PRESETS, buildAutoMilestones } from '@/lib/goals'
import type { GoalCategory, GoalDirection, GoalMilestone } from '@/store/types'
import { Check } from 'lucide-react'

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
  { value: 'unidades', label: 'unidades' },
  { value: 'kg', label: 'kg' },
  { value: 'R$', label: 'R$ (reais)' },
  { value: 'h', label: 'horas' },
  { value: 'dias', label: 'dias' },
  { value: 'páginas', label: 'páginas' },
  { value: '%', label: '%' },
]

export function AddGoalModal({ open, onClose, onSubmit }: AddGoalModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>('fisico')
  const [coverPreset, setCoverPreset] = useState('fisico')
  const [coverImage, setCoverImage] = useState('')
  const [startValue, setStartValue] = useState('0')
  const [targetValue, setTargetValue] = useState('100')
  const [unit, setUnit] = useState('unidades')
  const [targetDate, setTargetDate] = useState('')

  function reset() {
    setStep(1); setTitle('')
    setCategory('fisico'); setCoverPreset('fisico'); setCoverImage('')
    setStartValue('0'); setTargetValue('100'); setUnit('unidades')
    setTargetDate('')
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

  const canContinueStep1 = title.trim().length > 0
  const today = new Date().toISOString().slice(0, 10)

  return (
    <Modal open={open} onClose={handleClose} title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>{step === 1 ? 'Nova meta' : 'Visual da meta'}</span>
        {/* Progresso do wizard */}
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{
            width: 22, height: 3, borderRadius: 2,
            background: 'var(--color-primary)',
          }} />
          <div style={{
            width: 22, height: 3, borderRadius: 2,
            background: step === 2 ? 'var(--color-primary)' : 'rgba(255,255,255,.1)',
          }} />
        </div>
      </div>
    }>
      {step === 1 && (
        <div className="space-y-4">
          {/* Título grande, fonte forte */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">O que você quer construir?</label>
            <input
              autoFocus
              className="input"
              placeholder="Ex: Meter o shape, Juntar 10 mil…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ fontSize: 16, fontWeight: 600 }}
            />
          </div>

          {/* Categoria como cards visuais */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Categoria</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
            }}>
              {COVER_PRESETS.map(p => {
                const active = category === p.id
                const Icon = p.icon
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setCategory(p.id as GoalCategory); setCoverPreset(p.id) }}
                    style={{
                      padding: '10px 4px', borderRadius: 10,
                      background: active ? `${p.accent}18` : 'rgba(255,255,255,.025)',
                      border: `1px solid ${active ? p.accent + '88' : 'rgba(255,255,255,.06)'}`,
                      cursor: 'pointer', transition: 'all .2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      boxShadow: active ? `0 0 12px ${p.accent}33` : 'none',
                    }}
                    title={p.label}
                  >
                    <Icon size={16} style={{ color: active ? p.accent : 'rgba(255,255,255,.5)' }} />
                    <span style={{
                      fontSize: 9, fontWeight: 600,
                      color: active ? p.accent : 'rgba(255,255,255,.5)',
                      letterSpacing: 0.3,
                    }}>{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Valores numéricos lado a lado */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Hoje</label>
              <input
                type="text" inputMode="decimal" className="input"
                value={startValue} onChange={e => setStartValue(e.target.value)}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Alvo</label>
              <input
                type="text" inputMode="decimal" className="input"
                value={targetValue} onChange={e => setTargetValue(e.target.value)}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
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

          {/* Prazo */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Prazo (opcional)</label>
            <DatePicker
              value={targetDate}
              onChange={setTargetDate}
              min={today}
              placeholder="Sem prazo definido"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!canContinueStep1}
            className="btn-primary w-full justify-center py-3"
            style={{ opacity: canContinueStep1 ? 1 : 0.5, cursor: canContinueStep1 ? 'pointer' : 'not-allowed' }}
          >
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          {/* Preview do visual escolhido */}
          <Preview presetId={coverPreset} imageUrl={coverImage} title={title} />

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Estilo visual</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
            }}>
              {COVER_PRESETS.map(p => {
                const active = coverPreset === p.id
                const Icon = p.icon
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCoverPreset(p.id)}
                    style={{
                      aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                      background: p.gradient, position: 'relative',
                      border: active ? `2px solid ${p.accent}` : '1px solid rgba(255,255,255,.06)',
                      cursor: 'pointer', transition: 'all .2s',
                      boxShadow: active ? `0 0 14px ${p.accent}55` : 'none',
                    }}
                    title={p.label}
                  >
                    <Icon
                      size={22}
                      style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: p.accent, opacity: .9,
                      }}
                    />
                    {active && (
                      <div style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 16, height: 16, borderRadius: 999,
                        background: p.accent, color: '#0a0d14',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
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
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 5, lineHeight: 1.4 }}>
              Cole o link público de uma imagem. Se a URL não carregar, o app volta ao estilo visual.
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

/** Preview cinematográfico do que a meta vai parecer. */
function Preview({ presetId, imageUrl, title }: { presetId: string; imageUrl: string; title: string }) {
  const preset = COVER_PRESETS.find(p => p.id === presetId) ?? COVER_PRESETS[0]
  const Icon = preset.icon
  const [imgOk, setImgOk] = useState(true)
  const showImg = imageUrl.trim().length > 0 && imgOk
  return (
    <div style={{
      position: 'relative', width: '100%', height: 110,
      borderRadius: 14, overflow: 'hidden',
      background: showImg ? '#0a0d14' : preset.gradient,
      boxShadow: `inset 0 -50px 50px -10px rgba(0,0,0,.7), 0 0 1px ${preset.accent}33`,
    }}>
      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          onLoad={() => setImgOk(true)}
          onError={() => setImgOk(false)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.7,
            filter: 'saturate(1.1)',
          }}
        />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, rgba(8,10,16,.4) 0%, rgba(8,10,16,.15) 35%, rgba(8,10,16,.85) 100%)`,
      }} />
      <Icon
        aria-hidden="true"
        size={120}
        style={{
          position: 'absolute', right: -24, bottom: -24,
          color: preset.accent, opacity: 0.12, strokeWidth: 1,
        }}
      />
      <div style={{
        position: 'absolute', bottom: 12, left: 14, right: 14,
        zIndex: 1,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 999,
          background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
          border: `1px solid ${preset.accent}55`,
          fontSize: 9, fontWeight: 700, color: preset.accent,
          letterSpacing: 1, textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 4,
        }}>
          <Icon size={9} />{preset.label}
        </div>
        <div style={{
          fontSize: 16, fontWeight: 800, color: '#fff',
          textShadow: '0 2px 8px rgba(0,0,0,.7)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{title || 'Sua meta aqui'}</div>
      </div>
    </div>
  )
}
