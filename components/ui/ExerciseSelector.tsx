'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { X, Search, Plus, Check } from 'lucide-react'
import {
  EXERCISE_DB, MUSCLE_COLORS, MUSCLE_GROUP_LABELS,
  MuscleGroup, ExerciseTemplate
} from '@/lib/exercises'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (ex: ExerciseTemplate) => void
}

const FILTER_TABS: { key: MuscleGroup | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'peito', label: 'Peito' },
  { key: 'costas', label: 'Costas' },
  { key: 'pernas', label: 'Pernas' },
  { key: 'ombros', label: 'Ombros' },
  { key: 'biceps', label: 'Bíceps' },
  { key: 'triceps', label: 'Tríceps' },
  { key: 'abdomen', label: 'Abdômen' },
  { key: 'gluteos', label: 'Glúteos' },
]


export function ExerciseSelector({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<MuscleGroup | 'todos'>('todos')
  const [added, setAdded] = useState<Set<string>>(new Set())
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 100)
      setQuery('')
      setFilter('todos')
      setAdded(new Set())
    }
  }, [open])

  const filtered = useMemo(() => {
    return EXERCISE_DB.filter(ex => {
      const matchesMuscle = filter === 'todos' || ex.muscle === filter
      const matchesQuery = !query ||
        ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(query.toLowerCase())
      return matchesMuscle && matchesQuery
    })
  }, [query, filter])

  const grouped = useMemo(() => {
    const groups: Record<string, ExerciseTemplate[]> = {}
    filtered.forEach(ex => {
      const key = MUSCLE_GROUP_LABELS[ex.muscle] || ex.muscle
      if (!groups[key]) groups[key] = []
      groups[key].push(ex)
    })
    return groups
  }, [filtered])

  function handleSelect(ex: ExerciseTemplate) {
    onSelect(ex)
    setAdded(prev => new Set([...prev, ex.id]))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(4,10,22,0.75)', animation: 'fadeIn 0.2s ease both' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative ml-auto h-full w-full max-w-md flex flex-col"
        style={{
          background: 'rgba(4,10,22,0.92)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderLeft: '1px solid var(--accent-border)',
          boxShadow: 'var(--shadow-modal)',
          animation: 'slideInRight 0.3s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 240, height: 240, background: 'radial-gradient(ellipse at top right, var(--accent-muted), transparent 60%)', pointerEvents: 'none' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--fg1)' }}>
              Adicionar Exercício
            </h2>
            <p style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
              {filtered.length} exercícios disponíveis
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-all duration-200"
            style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--color-bg-3)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-main)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)', pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              placeholder="Buscar exercício..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 36,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                borderRadius: 12,
                fontSize: 14,
                color: 'var(--color-text-main)',
                background: 'var(--color-bg-3)',
                border: '1px solid var(--color-border)',
                outline: 'none',
                transition: 'border-color 200ms, box-shadow 200ms',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--color-border-focus)'
                e.target.style.boxShadow = '0 0 0 3px var(--accent-muted)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--color-border)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {/* Custom exercise */}
        <div className="px-4 pb-3 flex-shrink-0">
          <button
            onClick={() => {
              if (query.trim()) {
                handleSelect({
                  id: 'custom_' + Date.now(),
                  name: query,
                  muscle: filter !== 'todos' ? filter : 'peito',
                  equipment: 'Peso corporal',
                  difficulty: 'intermediário',
                  defaultSets: 3,
                  defaultReps: 12,
                  defaultWeight: 0,
                })
              }
            }}
            className="w-full flex items-center gap-2.5 text-sm transition-all duration-200"
            style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--color-bg-3)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-4)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-3)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
          >
            <Plus size={14} />
            <span style={{ fontWeight: 500 }}>Criar exercício personalizado</span>
          </button>
        </div>

        {/* Filter pills */}
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0"
          style={{ scrollbarWidth: 'thin', paddingBottom: 10 }}>
          {FILTER_TABS.map(tab => {
            const isActive = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className="flex-shrink-0 transition-all duration-200"
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  background: isActive ? 'var(--accent)' : 'var(--color-bg-3)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--color-border)'}`,
                  color: isActive ? '#fff' : 'var(--color-text-muted)',
                  boxShadow: isActive ? 'var(--shadow-glow-sm)' : 'none',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--color-text-main)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'var(--color-border)' } }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-border)', marginLeft: 16, marginRight: 16, flexShrink: 0 }} />

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4" style={{ scrollbarWidth: 'thin' }}>
          {Object.keys(grouped).length === 0 && (
            <div className="flex flex-col items-center justify-center h-40" style={{ color: 'var(--color-text-muted)' }}>
              <Search size={26} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>Nenhum exercício encontrado</p>
            </div>
          )}

          {Object.entries(grouped).map(([groupName, exercises]) => {
            return (
              <div key={groupName} className="mb-3">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                    {groupName}
                  </p>
                </div>
                <div className="space-y-0.5">
                  {exercises.map(ex => {
                    const isAdded = added.has(ex.id)
                    return (
                      <button
                        key={ex.id}
                        onClick={() => handleSelect(ex)}
                        className="w-full flex items-center gap-3 text-left transition-all duration-150"
                        style={{
                          padding: '10px 12px',
                          borderRadius: 12,
                          background: isAdded ? 'var(--accent-muted)' : 'transparent',
                          border: `1px solid ${isAdded ? 'var(--accent-border)' : 'transparent'}`,
                          borderLeft: `3px solid ${isAdded ? 'var(--accent)' : 'transparent'}`,
                        }}
                        onMouseEnter={e => {
                          if (!isAdded) {
                            e.currentTarget.style.background = 'var(--color-bg-3)'
                            e.currentTarget.style.borderColor = `var(--color-border)`
                            e.currentTarget.style.borderLeftColor = 'var(--color-text-muted)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isAdded) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'transparent'
                            e.currentTarget.style.borderLeftColor = 'transparent'
                          }
                        }}
                      >
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: 13, fontWeight: 500, color: isAdded ? 'var(--accent)' : 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ex.name}
                          </p>
                          <p style={{ fontSize: 11, marginTop: 2, color: 'var(--color-text-muted)' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>{MUSCLE_GROUP_LABELS[ex.muscle]}</span>
                            {' · '}{ex.equipment}
                          </p>
                        </div>

                        {/* Add button */}
                        <div style={{
                          width: 24, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: isAdded ? 'var(--accent)' : 'var(--color-bg-3)',
                          border: `1px solid ${isAdded ? 'var(--accent)' : 'var(--color-border)'}`,
                          color: isAdded ? '#fff' : 'var(--color-text-muted)',
                          transition: 'all 200ms',
                        }}>
                          {isAdded ? <Check size={12} /> : <Plus size={12} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
