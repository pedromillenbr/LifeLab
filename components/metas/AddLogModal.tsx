'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Goal } from '@/store/types'
import { formatGoalValue } from '@/lib/goals'

interface AddLogModalProps {
  open: boolean
  onClose: () => void
  goal: Goal
  accent: string
  onSubmit: (log: { date: string; value: number; note?: string }) => void
}

export function AddLogModal({ open, onClose, goal, accent, onSubmit }: AddLogModalProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [value, setValue] = useState('')
  const [date, setDate] = useState(today)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setValue(String(goal.currentValue ?? goal.startValue))
      setDate(today)
      setNote('')
    }
  }, [open, goal, today])

  function submit() {
    const v = parseFloat(value.replace(',', '.'))
    if (!Number.isFinite(v)) return
    onSubmit({ date, value: v, note: note.trim() || undefined })
    onClose()
  }

  const numericValue = parseFloat(value.replace(',', '.'))
  const delta = Number.isFinite(numericValue) ? numericValue - goal.currentValue : 0
  const goingRight = goal.direction === 'increase' ? delta > 0 : delta < 0
  const showDelta = Number.isFinite(numericValue) && delta !== 0

  return (
    <Modal open={open} onClose={onClose} title="Atualizar progresso">
      <div className="space-y-4">
        {/* Stat de transição visual */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'rgba(255,255,255,.03)',
          border: `1px solid ${accent}22`,
          borderRadius: 12,
        }}>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: 1, textTransform: 'uppercase' }}>De</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,.65)', fontFamily: "'JetBrains Mono', monospace" }}>
              {formatGoalValue(goal.currentValue, goal.unit)}
            </div>
          </div>
          {showDelta && (goingRight
            ? <TrendingUp size={24} style={{ color: '#4ade80' }} />
            : <TrendingDown size={24} style={{ color: '#f87171' }} />)}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Para</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
              {Number.isFinite(numericValue) ? formatGoalValue(numericValue, goal.unit) : '—'}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Novo valor ({goal.unit})</label>
          <input
            autoFocus type="text" inputMode="decimal" className="input"
            value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Data</label>
          <input
            type="date" className="input"
            value={date} onChange={e => setDate(e.target.value)}
            max={today}
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Nota (opcional)</label>
          <textarea
            className="input"
            placeholder='Ex: "Treino pesado de pernas, segui o plano à risca"'
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            style={{ resize: 'vertical', minHeight: 60 }}
          />
        </div>

        <button
          onClick={submit}
          className="w-full py-3 rounded-lg font-semibold"
          style={{
            background: accent, color: '#0a0d14',
            border: 'none', cursor: 'pointer', fontSize: 14,
            boxShadow: `0 4px 16px ${accent}55`,
          }}
        >
          Registrar progresso
        </button>
      </div>
    </Modal>
  )
}
