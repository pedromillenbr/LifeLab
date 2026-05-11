'use client'
import { useState } from 'react'
import { Lock, Check, Plus, Trash2 } from 'lucide-react'
import type { Goal, GoalMilestone } from '@/store/types'
import { formatGoalValue } from '@/lib/goals'

interface GoalMilestonesProps {
  goal: Goal
  accent: string
  onAdd?: (m: Omit<GoalMilestone, 'id'>) => void
  onRemove?: (milestoneId: string) => void
}

export function GoalMilestones({ goal, accent, onAdd, onRemove }: GoalMilestonesProps) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')

  const sorted = [...goal.milestones].sort((a, b) => {
    return goal.direction === 'increase' ? a.targetValue - b.targetValue : b.targetValue - a.targetValue
  })

  function submit() {
    const v = parseFloat(value.replace(',', '.'))
    if (!label.trim() || !Number.isFinite(v)) return
    onAdd?.({ label: label.trim(), targetValue: v, auto: false })
    setLabel(''); setValue(''); setAdding(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.length === 0 && (
          <div style={{
            padding: '16px', textAlign: 'center',
            color: 'rgba(255,255,255,.4)', fontSize: 13,
            border: '1px dashed rgba(255,255,255,.08)', borderRadius: 12,
          }}>
            Nenhum marco definido. Adicione checkpoints para celebrar a jornada.
          </div>
        )}
        {sorted.map((m, i) => {
          const done = !!m.achievedAt
          return (
            <div
              key={m.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                background: done ? `${accent}10` : 'rgba(255,255,255,.025)',
                border: `1px solid ${done ? accent + '50' : 'rgba(255,255,255,.06)'}`,
                borderRadius: 12,
                transition: 'all .3s ease',
                animation: `mileStep .4s cubic-bezier(.22,1,.36,1) ${i * 50}ms both`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Glow ao bater */}
              {done && (
                <div aria-hidden="true" style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(ellipse at 0% 50%, ${accent}33 0%, transparent 60%)`,
                  pointerEvents: 'none',
                }} />
              )}
              <div style={{
                width: 38, height: 38, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? accent : 'rgba(255,255,255,.04)',
                border: `1px solid ${done ? accent : 'rgba(255,255,255,.08)'}`,
                color: done ? '#0a0d14' : 'rgba(255,255,255,.3)',
                flexShrink: 0,
                boxShadow: done ? `0 0 14px ${accent}88` : 'none',
                fontSize: 16,
                position: 'relative', zIndex: 1,
              }}>
                {done ? <Check size={18} strokeWidth={3} /> : (m.emoji ? <span>{m.emoji}</span> : <Lock size={14} />)}
              </div>
              <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  color: done ? '#fff' : 'rgba(255,255,255,.85)',
                  textDecoration: done ? 'none' : 'none',
                }}>{m.label}</div>
                <div style={{
                  fontSize: 11, color: done ? accent : 'rgba(255,255,255,.4)',
                  fontFamily: "'JetBrains Mono', monospace", marginTop: 2,
                }}>
                  {formatGoalValue(m.targetValue, goal.unit)}
                  {done && m.achievedAt && (
                    <span style={{ marginLeft: 8, color: 'rgba(255,255,255,.5)' }}>
                      · conquistado em {new Date(m.achievedAt + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
              {onRemove && !m.auto && (
                <button
                  onClick={() => onRemove(m.id)}
                  aria-label="Remover marco"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,.3)', padding: 4, borderRadius: 6,
                    transition: 'all .2s', position: 'relative', zIndex: 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.3)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {onAdd && (
        adding ? (
          <div style={{
            marginTop: 10, padding: 12,
            background: 'rgba(255,255,255,.03)',
            border: `1px solid ${accent}40`, borderRadius: 12,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <input
              autoFocus
              className="input"
              placeholder="Ex: 30 dias consistentes"
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder={`Valor (${goal.unit})`}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{ flex: 1 }}
              />
              <button onClick={submit} style={{
                padding: '0 16px', borderRadius: 8,
                background: accent, color: '#0a0d14',
                border: 'none', fontWeight: 700, cursor: 'pointer',
                fontSize: 12,
              }}>Salvar</button>
              <button onClick={() => { setAdding(false); setLabel(''); setValue('') }} style={{
                padding: '0 12px', borderRadius: 8,
                background: 'transparent', color: 'rgba(255,255,255,.55)',
                border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer',
                fontSize: 12,
              }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              width: '100%', marginTop: 10,
              padding: '10px',
              border: '1px dashed rgba(255,255,255,.12)',
              borderRadius: 12, background: 'transparent',
              color: 'rgba(255,255,255,.5)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 12, fontWeight: 600,
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent + '66'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)' }}
          >
            <Plus size={14} /> Adicionar marco personalizado
          </button>
        )
      )}

      <style jsx>{`
        @keyframes mileStep {
          0% { opacity: 0; transform: translateX(-8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
