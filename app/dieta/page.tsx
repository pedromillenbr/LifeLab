'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { today } from '@/lib/utils'
import { Meal, FoodEntry } from '@/store/types'
import {
  UtensilsCrossed, Plus, Trash2, Sun, Soup, Moon, Cookie,
  Flame, Target, Edit3, Check, X,
} from 'lucide-react'

const P  = 'var(--color-primary)'
const PM = 'var(--color-primary-muted)'
const PB = 'var(--color-primary-border)'
const BG2 = 'var(--color-bg-2)'
const BG3 = 'var(--color-bg-3)'
const BORDER = 'var(--color-border)'
const TM = 'var(--color-text-main)'
const TT = 'var(--color-text-muted)'
const GOLD = 'var(--gold)'

const MEALS: { key: Meal; label: string; icon: typeof Sun }[] = [
  { key: 'cafe',   label: 'Café da manhã', icon: Sun    },
  { key: 'almoco', label: 'Almoço',        icon: Soup   },
  { key: 'jantar', label: 'Jantar',        icon: Moon   },
  { key: 'lanche', label: 'Lanches',       icon: Cookie },
]

// Sugestões rápidas — base aproximada. Usuário pode editar antes de adicionar.
const QUICK_SUGGESTIONS: { name: string; quantity: string; calories: number; protein?: number; carbs?: number; fat?: number }[] = [
  { name: 'Arroz branco',      quantity: '100 g',  calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Frango grelhado',   quantity: '100 g',  calories: 165, protein: 31,  carbs: 0,  fat: 3.6 },
  { name: 'Ovo',               quantity: '1 unid', calories: 70,  protein: 6,   carbs: 0.6, fat: 5  },
  { name: 'Banana',            quantity: '1 unid', calories: 90,  protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Pão integral',      quantity: '1 fatia', calories: 80, protein: 4,   carbs: 14, fat: 1   },
  { name: 'Whey protein',      quantity: '30 g',   calories: 120, protein: 24,  carbs: 3,  fat: 1.5 },
  { name: 'Aveia',             quantity: '40 g',   calories: 150, protein: 5,   carbs: 27, fat: 3   },
  { name: 'Batata doce',       quantity: '100 g',  calories: 86,  protein: 1.6, carbs: 20, fat: 0.1 },
]

export default function DietaPage() {
  const {
    foodEntries, dietGoals, addFoodEntry, removeFoodEntry, updateDietGoals,
  } = useStore()

  const [modalMeal, setModalMeal] = useState<Meal | null>(null)
  const [editingGoals, setEditingGoals] = useState(false)
  const [goalsDraft, setGoalsDraft] = useState({
    calories: String(dietGoals.calories),
    protein:  String(dietGoals.protein ?? ''),
  })

  const dayKey = today()
  const todayEntries = useMemo(
    () => foodEntries.filter(f => f.date === dayKey),
    [foodEntries, dayKey],
  )

  // Agregados do dia
  const totals = useMemo(() => {
    return todayEntries.reduce(
      (acc, f) => ({
        calories: acc.calories + (f.calories || 0),
        protein:  acc.protein  + (f.protein  || 0),
        carbs:    acc.carbs    + (f.carbs    || 0),
        fat:      acc.fat      + (f.fat      || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }, [todayEntries])

  const calPct = Math.min(100, Math.round((totals.calories / Math.max(1, dietGoals.calories)) * 100))
  const overGoal = totals.calories > dietGoals.calories

  // Últimos alimentos únicos (não-de-hoje, ordenados por createdAt desc, cap 8)
  const recentFoods = useMemo(() => {
    const seen = new Set<string>()
    const sorted = [...foodEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const out: FoodEntry[] = []
    for (const f of sorted) {
      const key = f.name.trim().toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(f)
      if (out.length >= 8) break
    }
    return out
  }, [foodEntries])

  function handleSaveGoals() {
    const cals = parseInt(goalsDraft.calories, 10)
    const prot = goalsDraft.protein.trim() ? parseInt(goalsDraft.protein, 10) : undefined
    if (Number.isFinite(cals) && cals > 0) {
      updateDietGoals({
        calories: cals,
        protein: prot && Number.isFinite(prot) ? prot : undefined,
      })
    }
    setEditingGoals(false)
  }

  return (
    <div
      className="p-4 md:p-6 max-w-[1100px] mx-auto"
      style={{ animation: 'fadeIn 0.4s ease both' }}
    >
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="mb-5 md:mb-6">
        <div
          className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1.2px] mb-1"
          style={{ color: 'var(--color-text-subtle)' }}
        >
          <UtensilsCrossed size={11} /> Nutrição · Diário
        </div>
        <h1
          className="text-2xl md:text-[30px]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: P,
            letterSpacing: '-0.02em',
            textShadow: '0 0 24px var(--color-primary-glow)',
          }}
        >
          Dieta &amp; Calorias
        </h1>
        <p style={{ color: TT, fontSize: 13, marginTop: 4 }}>
          Registre rápido, acompanhe sem fricção.
        </p>
      </div>

      {/* ── A) RESUMO DIÁRIO ─────────────────────────────────────── */}
      <section
        className="rounded-2xl p-5 mb-4"
        style={{
          background: BG2,
          border: `1px solid ${BORDER}`,
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Flame size={14} style={{ color: GOLD }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: TT }}>
              Resumo do dia
            </span>
          </div>
          <button
            onClick={() => setEditingGoals(v => !v)}
            className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            style={{ color: TT }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TM)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
          >
            <Target size={12} /> {editingGoals ? 'Fechar' : 'Editar metas'}
          </button>
        </div>

        {/* Calorias */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-1.5">
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  fontFamily: 'var(--font-jetbrains)',
                  color: overGoal ? '#f87171' : P,
                  letterSpacing: '-.02em',
                  textShadow: overGoal ? '0 0 20px rgba(248,113,113,0.4)' : '0 0 24px var(--color-primary-glow)',
                  lineHeight: 1,
                }}
              >
                {Math.round(totals.calories)}
              </span>
              <span style={{ fontSize: 14, color: TT, fontFamily: 'var(--font-jetbrains)' }}>
                / {dietGoals.calories} kcal
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: overGoal ? '#f87171' : P,
                fontFamily: 'var(--font-jetbrains)',
              }}
            >
              {calPct}%
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: BG3,
              border: `1px solid ${BORDER}`,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${calPct}%`,
                height: '100%',
                background: overGoal
                  ? 'linear-gradient(90deg, var(--color-primary), #f87171)'
                  : 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary), var(--color-primary-light))',
                boxShadow: '0 0 12px var(--color-primary-glow)',
                transition: 'width .35s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: TT, marginTop: 6 }}>
            {overGoal
              ? `${Math.round(totals.calories - dietGoals.calories)} kcal acima da meta`
              : `${Math.round(dietGoals.calories - totals.calories)} kcal restantes`}
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Proteína',    value: totals.protein, unit: 'g', goal: dietGoals.protein },
            { label: 'Carboidrato', value: totals.carbs,   unit: 'g' },
            { label: 'Gordura',     value: totals.fat,     unit: 'g' },
          ].map((m, i) => {
            const pct = m.goal ? Math.min(100, Math.round((m.value / m.goal) * 100)) : null
            return (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{
                  background: BG3,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div style={{ fontSize: 10, color: TT, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: TM, fontFamily: 'var(--font-jetbrains)' }}>
                  {m.value.toFixed(0)}
                  <span style={{ fontSize: 11, color: TT, fontWeight: 400, marginLeft: 2 }}>{m.unit}</span>
                </div>
                {m.goal !== undefined && pct !== null && (
                  <>
                    <div style={{ fontSize: 10, color: TT, marginTop: 2 }}>
                      meta {m.goal}{m.unit} · {pct}%
                    </div>
                    <div
                      style={{
                        height: 3,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.06)',
                        marginTop: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: P,
                          transition: 'width .3s ease',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Edição inline de metas */}
        {editingGoals && (
          <div
            className="mt-4 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
            style={{ background: BG3, border: `1px solid ${PB}` }}
          >
            <div>
              <label style={{ fontSize: 11, color: TT, display: 'block', marginBottom: 4 }}>
                Meta de calorias (kcal)
              </label>
              <input
                type="number"
                className="input"
                value={goalsDraft.calories}
                onChange={e => setGoalsDraft(d => ({ ...d, calories: e.target.value }))}
                placeholder="2000"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: TT, display: 'block', marginBottom: 4 }}>
                Meta de proteína (g) — opcional
              </label>
              <input
                type="number"
                className="input"
                value={goalsDraft.protein}
                onChange={e => setGoalsDraft(d => ({ ...d, protein: e.target.value }))}
                placeholder="120"
              />
            </div>
            <button
              onClick={handleSaveGoals}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-sm"
              style={{
                background: P,
                color: '#000',
                boxShadow: '0 0 18px var(--color-primary-glow)',
                cursor: 'pointer',
              }}
            >
              <Check size={14} /> Salvar
            </button>
          </div>
        )}
      </section>

      {/* ── B) REFEIÇÕES DO DIA ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {MEALS.map(({ key, label, icon: Icon }) => {
          const items = todayEntries.filter(f => f.meal === key)
          const totalKcal = items.reduce((a, f) => a + (f.calories || 0), 0)
          return (
            <section
              key={key}
              className="rounded-2xl p-4"
              style={{
                background: BG2,
                border: `1px solid ${BORDER}`,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: PM, border: `1px solid ${PB}` }}
                  >
                    <Icon size={14} style={{ color: P }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TM }}>{label}</div>
                    <div style={{ fontSize: 11, color: TT, fontFamily: 'var(--font-jetbrains)' }}>
                      {Math.round(totalKcal)} kcal · {items.length} {items.length === 1 ? 'item' : 'itens'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModalMeal(key)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: PM,
                    border: `1px solid ${PB}`,
                    color: P,
                    cursor: 'pointer',
                  }}
                  aria-label={`Adicionar em ${label}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {items.length === 0 ? (
                <button
                  onClick={() => setModalMeal(key)}
                  className="w-full text-left rounded-lg py-3 px-3 text-[12px] transition-all"
                  style={{
                    color: TT,
                    background: 'transparent',
                    border: `1px dashed ${BORDER}`,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = PB
                    el.style.color = TM
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = BORDER
                    el.style.color = TT
                  }}
                >
                  + Adicionar alimento
                </button>
              ) : (
                <ul className="space-y-1.5">
                  {items.map(f => (
                    <li
                      key={f.id}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg group"
                      style={{ background: BG3, border: `1px solid ${BORDER}` }}
                    >
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: TM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: 10.5, color: TT }}>
                          {f.quantity}
                          {(f.protein || f.carbs || f.fat) && (
                            <> · <span style={{ fontFamily: 'var(--font-jetbrains)' }}>
                              {f.protein ? `P${Math.round(f.protein)} ` : ''}
                              {f.carbs   ? `C${Math.round(f.carbs)} `   : ''}
                              {f.fat     ? `G${Math.round(f.fat)}`      : ''}
                            </span></>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: P,
                          fontFamily: 'var(--font-jetbrains)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {Math.round(f.calories)} kcal
                      </span>
                      <button
                        onClick={() => removeFoodEntry(f.id)}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                        style={{ color: TT, cursor: 'pointer' }}
                        aria-label="Remover"
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      {/* ── ADD FOOD MODAL ───────────────────────────────────────── */}
      {modalMeal && (
        <AddFoodModal
          meal={modalMeal}
          onClose={() => setModalMeal(null)}
          onAdd={(entry) => {
            addFoodEntry({ ...entry, meal: modalMeal, date: dayKey })
            setModalMeal(null)
          }}
          recentFoods={recentFoods}
        />
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   Modal de adicionar alimento — leve, focado em velocidade.
   ────────────────────────────────────────────────────────────── */

interface AddFoodModalProps {
  meal: Meal
  onClose: () => void
  onAdd: (e: { name: string; quantity: string; calories: number; protein?: number; carbs?: number; fat?: number; meal: Meal; date: string }) => void
  recentFoods: FoodEntry[]
}

function AddFoodModal({ meal, onClose, onAdd, recentFoods }: AddFoodModalProps) {
  const [draft, setDraft] = useState({
    name: '',
    quantity: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    meal,
  })
  const [showMacros, setShowMacros] = useState(false)

  const mealLabel = MEALS.find(m => m.key === draft.meal)?.label ?? ''

  function applyPreset(p: { name: string; quantity: string; calories: number; protein?: number; carbs?: number; fat?: number }) {
    setDraft(d => ({
      ...d,
      name: p.name,
      quantity: p.quantity,
      calories: String(p.calories),
      protein: p.protein != null ? String(p.protein) : '',
      carbs:   p.carbs   != null ? String(p.carbs)   : '',
      fat:     p.fat     != null ? String(p.fat)     : '',
    }))
  }

  function applyRecent(f: FoodEntry) {
    setDraft(d => ({
      ...d,
      name: f.name,
      quantity: f.quantity,
      calories: String(f.calories),
      protein: f.protein != null ? String(f.protein) : '',
      carbs:   f.carbs   != null ? String(f.carbs)   : '',
      fat:     f.fat     != null ? String(f.fat)     : '',
    }))
  }

  const cals = parseFloat(draft.calories)
  const valid = draft.name.trim().length > 0 && Number.isFinite(cals) && cals > 0

  function handleAdd() {
    if (!valid) return
    onAdd({
      name: draft.name.trim(),
      quantity: draft.quantity.trim() || '1 porção',
      calories: cals,
      protein: draft.protein ? parseFloat(draft.protein) : undefined,
      carbs:   draft.carbs   ? parseFloat(draft.carbs)   : undefined,
      fat:     draft.fat     ? parseFloat(draft.fat)     : undefined,
      meal: draft.meal,
      date: today(),
    })
  }

  return (
    <Modal open={true} onClose={onClose} title={`Adicionar — ${mealLabel}`}>
      <div className="space-y-4">
        {/* Sugestões rápidas + recentes */}
        <div>
          <div style={{ fontSize: 11, color: TT, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Sugestões rápidas
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map(s => (
              <button
                key={s.name}
                onClick={() => applyPreset(s)}
                className="px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all"
                style={{
                  background: BG3,
                  border: `1px solid ${BORDER}`,
                  color: TM,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.background = PM
                  el.style.borderColor = PB
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.background = BG3
                  el.style.borderColor = BORDER
                }}
              >
                {s.name} <span style={{ color: TT, fontFamily: 'var(--font-jetbrains)' }}>· {s.calories}kcal</span>
              </button>
            ))}
          </div>
        </div>

        {recentFoods.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: TT, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Últimos usados
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentFoods.map(f => (
                <button
                  key={f.id}
                  onClick={() => applyRecent(f)}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: 'rgba(var(--color-primary-rgb), 0.06)',
                    border: `1px solid ${PB}`,
                    color: TM,
                    cursor: 'pointer',
                  }}
                >
                  {f.name} <span style={{ color: TT, fontFamily: 'var(--font-jetbrains)' }}>· {Math.round(f.calories)}kcal</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Refeição (caso queira reatribuir) */}
        <div>
          <label style={{ fontSize: 12, color: TT, display: 'block', marginBottom: 6 }}>Refeição</label>
          <Select
            value={draft.meal}
            onChange={(v) => setDraft(d => ({ ...d, meal: v as Meal }))}
            options={MEALS.map(m => ({ value: m.key, label: m.label }))}
          />
        </div>

        {/* Nome + quantidade + calorias */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
          <div>
            <label style={{ fontSize: 12, color: TT, display: 'block', marginBottom: 6 }}>Alimento</label>
            <input
              className="input"
              autoFocus
              placeholder="Ex: Frango grelhado"
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: TT, display: 'block', marginBottom: 6 }}>Quantidade</label>
            <input
              className="input"
              placeholder="100 g"
              value={draft.quantity}
              onChange={e => setDraft(d => ({ ...d, quantity: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: TT, display: 'block', marginBottom: 6 }}>Calorias (kcal)</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder="180"
            value={draft.calories}
            onChange={e => setDraft(d => ({ ...d, calories: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter' && valid) handleAdd() }}
          />
        </div>

        {/* Macros (collapsible) */}
        <div>
          <button
            onClick={() => setShowMacros(v => !v)}
            className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            style={{ color: TT, cursor: 'pointer' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TM)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
          >
            <Edit3 size={11} />
            {showMacros ? 'Ocultar macros' : 'Adicionar macros (opcional)'}
          </button>
          {showMacros && (
            <div className="grid grid-cols-3 gap-2 mt-2.5">
              {[
                { key: 'protein' as const, label: 'P (g)' },
                { key: 'carbs'   as const, label: 'C (g)' },
                { key: 'fat'     as const, label: 'G (g)' },
              ].map(m => (
                <div key={m.key}>
                  <label style={{ fontSize: 10, color: TT, display: 'block', marginBottom: 4 }}>{m.label}</label>
                  <input
                    className="input"
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={draft[m.key]}
                    onChange={e => setDraft(d => ({ ...d, [m.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={!valid}
          className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: valid ? P : BG3,
            color: valid ? '#000' : TT,
            boxShadow: valid ? '0 0 18px var(--color-primary-glow)' : 'none',
            cursor: valid ? 'pointer' : 'not-allowed',
            opacity: valid ? 1 : 0.6,
            border: `1px solid ${valid ? P : BORDER}`,
          }}
        >
          <Plus size={15} /> Adicionar alimento
        </button>
      </div>
    </Modal>
  )
}
