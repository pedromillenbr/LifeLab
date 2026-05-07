'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { today } from '@/lib/utils'
import { FoodEntry } from '@/store/types'
import { FOOD_DB, FoodDBItem, searchFoods } from '@/lib/foodDatabase'
import { MEAL_ICONS, ICON_OPTIONS } from '@/lib/mealIcons'
import {
  Plus, Trash2, Flame, SlidersHorizontal, Check, Droplet, ChevronDown, ChevronUp,
  TrendingUp, Search, X, Settings2, Beef, Wheat, Droplets, Utensils,
} from 'lucide-react'

// ════════════════════════════════════════════════════════════════════
//  Quick suggestions (for the modal)
// ════════════════════════════════════════════════════════════════════
const QUICK: FoodDBItem[] = [
  FOOD_DB.find(f => f.id === 'arroz_b')!,
  FOOD_DB.find(f => f.id === 'frango_g')!,
  FOOD_DB.find(f => f.id === 'ovo_c')!,
  FOOD_DB.find(f => f.id === 'banana')!,
  FOOD_DB.find(f => f.id === 'pao_int')!,
  FOOD_DB.find(f => f.id === 'whey')!,
  FOOD_DB.find(f => f.id === 'aveia')!,
  FOOD_DB.find(f => f.id === 'bat_doce')!,
]

// ════════════════════════════════════════════════════════════════════
//  Helpers
// ════════════════════════════════════════════════════════════════════
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}
function shortDay(dateStr: string) {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
}

// Count-up — animates a numeric value smoothly
function useCountUp(target: number, dur = 280) {
  const [val, setVal] = useState(target)
  const raf = useRef<number | null>(null)
  const prev = useRef(target)
  useEffect(() => {
    const from = prev.current, to = target
    if (from === to) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (to - from) * e))
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else { prev.current = to; setVal(to) }
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, dur])
  return val
}

// ════════════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════════════
export default function DietaPage() {
  const {
    foodEntries, dietGoals, addFoodEntry, removeFoodEntry, updateDietGoals,
    customMeals, addCustomMeal, removeCustomMeal,
    addWater, resetWaterToday, getTodayWater,
  } = useStore()

  const [modalMeal, setModalMeal] = useState<string | null>(null)
  const [editingGoals, setEditingGoals] = useState(false)
  const [goalsDraft, setGoalsDraft] = useState({
    calories: String(dietGoals.calories),
    protein:  String(dietGoals.protein   ?? ''),
    carbs:    String(dietGoals.carbs     ?? ''),
    fat:      String(dietGoals.fat       ?? ''),
  })
  const [managingMeals, setManagingMeals] = useState(false)
  const [newMealLabel,  setNewMealLabel]  = useState('')
  const [newMealIcon,   setNewMealIcon]   = useState('sun')

  const [showWaterEdit, setShowWaterEdit] = useState(false)
  const [waterGoalDraft, setWaterGoalDraft] = useState(String(dietGoals.waterGoal ?? 2))
  const [waterSplash, setWaterSplash] = useState(0)
  const [calPulse, setCalPulse] = useState(false)

  const dayKey = today()
  const todayEntries = useMemo(
    () => foodEntries.filter(f => f.date === dayKey),
    [foodEntries, dayKey],
  )

  const totals = useMemo(() => todayEntries.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein:  acc.protein  + (f.protein  || 0),
      carbs:    acc.carbs    + (f.carbs    || 0),
      fat:      acc.fat      + (f.fat      || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  ), [todayEntries])

  const dispKcal = useCountUp(Math.round(totals.calories), 280)
  const dispProt = useCountUp(Math.round(totals.protein), 240)
  const dispCarb = useCountUp(Math.round(totals.carbs), 240)
  const dispFat  = useCountUp(Math.round(totals.fat), 240)

  const calPct = Math.min(100, Math.round((totals.calories / Math.max(1, dietGoals.calories)) * 100))
  const remaining = dietGoals.calories - totals.calories

  const recentFoods = useMemo(() => {
    const seen = new Set<string>()
    const out: FoodEntry[] = []
    for (const f of [...foodEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
      const key = f.name.trim().toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(f)
      if (out.length >= 8) break
    }
    return out
  }, [foodEntries])

  const weekDays = useMemo(() => getLast7Days(), [])
  const weekTotals = useMemo(() => weekDays.map(d => ({
    date: d,
    label: shortDay(d),
    calories: foodEntries.filter(f => f.date === d).reduce((a, f) => a + (f.calories || 0), 0),
    isToday: d === dayKey,
  })), [foodEntries, weekDays, dayKey])
  const weekMax = Math.max(...weekTotals.map(d => d.calories), dietGoals.calories, 1)

  // Water
  const waterMl = getTodayWater()
  const goalL   = dietGoals.waterGoal ?? 2
  const waterL  = waterMl / 1000
  const waterPct = Math.min(100, (waterL / Math.max(0.001, goalL)) * 100)
  const dispWaterCl = useCountUp(Math.round(waterL * 100), 240) // centiliters for smoother count

  function handleSaveGoals() {
    const cals  = parseInt(goalsDraft.calories, 10)
    const prot  = goalsDraft.protein.trim()  ? parseInt(goalsDraft.protein,  10) : undefined
    const carbs = goalsDraft.carbs.trim()    ? parseInt(goalsDraft.carbs,    10) : undefined
    const fat   = goalsDraft.fat.trim()      ? parseInt(goalsDraft.fat,      10) : undefined
    if (Number.isFinite(cals) && cals > 0) {
      updateDietGoals({
        calories: cals,
        protein:  prot  && Number.isFinite(prot)  ? prot  : undefined,
        carbs:    carbs && Number.isFinite(carbs) ? carbs : undefined,
        fat:      fat   && Number.isFinite(fat)   ? fat   : undefined,
      })
    }
    setEditingGoals(false)
  }

  function handleSaveWaterGoal() {
    const v = parseFloat(waterGoalDraft)
    if (!isNaN(v) && v > 0) {
      updateDietGoals({ waterGoal: Math.round(v * 100) / 100 })
    }
    setShowWaterEdit(false)
  }

  function handleAddMeal() {
    if (!newMealLabel.trim()) return
    addCustomMeal({ label: newMealLabel.trim(), icon: newMealIcon })
    setNewMealLabel('')
    setNewMealIcon('sun')
  }

  function handleAddWater(ml: number) {
    addWater(ml)
    setWaterSplash(n => n + 1)
  }

  return (
    <div className="dieta-root" style={{ animation: 'fadeIn 0.4s ease both' }}>
      <DietaStyles />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="dieta-page-header">
        <div className="dieta-eyebrow">
          <span className="dieta-eyebrow-dot" />
          Nutrição · Diário
        </div>
        <h1 className="dieta-page-title">Dieta &amp; Calorias</h1>
        <p className="dieta-subtitle">Registre rápido, acompanhe sem fricção.</p>
      </div>

      {/* ── Resumo do dia (hero) ──────────────────────────────── */}
      <div className="dieta-card dieta-hero">
        <div className="dieta-card-header">
          <div className="dieta-section-label">
            <Flame size={12} /> Resumo do dia
          </div>
          <button
            className="dieta-card-action"
            onClick={() => {
              setGoalsDraft({
                calories: String(dietGoals.calories),
                protein:  String(dietGoals.protein  ?? ''),
                carbs:    String(dietGoals.carbs    ?? ''),
                fat:      String(dietGoals.fat      ?? ''),
              })
              setEditingGoals(v => !v)
            }}
          >
            <SlidersHorizontal size={11} />
            {editingGoals ? 'Fechar' : 'Editar metas'}
            {editingGoals ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>

        <div className="dieta-cal-row">
          <div
            className={`dieta-cal-number ${calPulse ? 'pulse' : ''}`}
            onAnimationEnd={() => setCalPulse(false)}
          >
            {dispKcal}
          </div>
          <div className="dieta-cal-goal">/ {dietGoals.calories.toLocaleString('pt-BR')} kcal</div>
          <div className="dieta-cal-pct">{calPct}%</div>
        </div>
        <div className="dieta-progress-track">
          <div className="dieta-progress-fill p-green" style={{ width: `${calPct}%` }} />
        </div>
        <div className="dieta-cal-remaining">
          {remaining >= 0
            ? `${Math.round(remaining).toLocaleString('pt-BR')} kcal restantes`
            : `${Math.abs(Math.round(remaining)).toLocaleString('pt-BR')} kcal acima da meta`}
        </div>

        {/* Macros */}
        <div className="dieta-macros-grid">
          {[
            { key: 'protein' as const, label: 'Proteína',    val: dispProt, total: totals.protein, goal: dietGoals.protein, cls: 'm-prot', prog: 'p-lime',   icon: Beef    },
            { key: 'carbs'   as const, label: 'Carboidrato', val: dispCarb, total: totals.carbs,   goal: dietGoals.carbs,   cls: 'm-carb', prog: 'p-gold',   icon: Wheat   },
            { key: 'fat'     as const, label: 'Gordura',     val: dispFat,  total: totals.fat,     goal: dietGoals.fat,     cls: 'm-fat',  prog: 'p-danger', icon: Droplets },
          ].map(m => {
            const Icon = m.icon
            const pct = m.goal ? Math.min(100, Math.round((m.total / m.goal) * 100)) : null
            return (
              <div key={m.key} className={`dieta-macro-card ${m.cls}`}>
                <div className="dieta-macro-head">
                  <Icon size={11} className="dieta-macro-icon" />
                  <span className="dieta-macro-label">{m.label}</span>
                </div>
                <div className="dieta-macro-val">
                  {m.val}<span className="dieta-macro-unit"> g</span>
                </div>
                {m.goal !== undefined && pct !== null ? (
                  <>
                    <div className="dieta-progress-track" style={{ height: 4, marginTop: 8 }}>
                      <div className={`dieta-progress-fill ${m.prog}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="dieta-macro-sub">{m.goal}g meta · {pct}%</div>
                  </>
                ) : (
                  <div className="dieta-macro-sub">sem meta</div>
                )}
              </div>
            )
          })}
        </div>

        {editingGoals && (
          <div className="dieta-goal-panel">
            <div className="dieta-goals-grid">
              {([
                { key: 'calories' as const, label: 'Calorias (kcal)', placeholder: '2000' },
                { key: 'protein'  as const, label: 'Proteína (g)',     placeholder: '120' },
                { key: 'carbs'    as const, label: 'Carboidrato (g)',  placeholder: '250' },
                { key: 'fat'      as const, label: 'Gordura (g)',      placeholder: '60'  },
              ]).map(f => (
                <div key={f.key} className="dieta-form-field">
                  <label className="dieta-form-label">{f.label}</label>
                  <input
                    className="dieta-form-input"
                    type="number"
                    value={goalsDraft[f.key]}
                    onChange={e => setGoalsDraft(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
            <button className="dieta-btn-primary" onClick={handleSaveGoals}>
              <Check size={13} /> Salvar metas
            </button>
          </div>
        )}
      </div>

      {/* ── Água ──────────────────────────────────────────────── */}
      <div
        key={`water-${waterSplash}`}
        className={`dieta-card dieta-water-card ${waterL > 0 ? 'has-fill' : ''} ${waterSplash > 0 ? 'splashing' : ''}`}
      >
        <div className="dieta-water-fill" style={{ width: `${waterPct}%` }} />
        <span
          className="dieta-water-ripple"
          style={{ right: `${100 - waterPct}%` }}
        />
        <div className="dieta-water-content">
          <div className="dieta-water-top">
            <div className="dieta-section-label" style={{ color: 'var(--cyan)' }}>
              <Droplet size={12} /> Água
            </div>
            <div className="dieta-water-right">
              <div className="dieta-water-val">
                {(dispWaterCl / 100).toFixed(2)} L / {goalL.toFixed(2)} L
              </div>
              <button
                className="dieta-water-edit-link"
                onClick={() => {
                  setWaterGoalDraft(String(goalL))
                  setShowWaterEdit(v => !v)
                }}
              >
                <SlidersHorizontal size={10} />
                {showWaterEdit ? 'Fechar' : 'Meta'}
              </button>
            </div>
          </div>
          <div className="dieta-progress-track" style={{ marginTop: 12 }}>
            <div className="dieta-progress-fill p-cyan" style={{ width: `${waterPct}%` }} />
          </div>
          <div className="dieta-water-btns">
            {[200, 300, 500].map(ml => (
              <WaterBtn key={ml} label={`+${ml} ml`} onClick={() => handleAddWater(ml)} />
            ))}
            {waterMl > 0 && (
              <button
                onClick={resetWaterToday}
                className="dieta-water-btn dieta-water-btn-reset"
              >
                Reset
              </button>
            )}
          </div>
          {showWaterEdit && (
            <div className="dieta-water-edit-panel">
              <div style={{ flex: 1 }}>
                <label className="dieta-form-label" style={{ color: 'rgba(186,255,255,0.75)' }}>
                  Meta diária (litros)
                </label>
                <input
                  className="dieta-form-input"
                  type="number"
                  step="0.25"
                  min="0.5"
                  max="6"
                  value={waterGoalDraft}
                  onChange={e => setWaterGoalDraft(e.target.value)}
                />
              </div>
              <button className="dieta-water-save-btn" onClick={handleSaveWaterGoal}>
                <Check size={12} /> Salvar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Refeições ─────────────────────────────────────────── */}
      <div className="dieta-meals-section">
        <div className="dieta-meals-header">
          <div className="dieta-meals-title">
            Refeições
            <span className="dieta-meals-count">{customMeals.length}</span>
          </div>
          <button
            className="dieta-card-action"
            onClick={() => setManagingMeals(v => !v)}
          >
            <Settings2 size={11} />
            {managingMeals ? 'Fechar' : 'Gerenciar'}
            {managingMeals ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>

        {managingMeals && (
          <div className="dieta-manage-panel">
            <div className="dieta-panel-label">Refeições atuais</div>
            <div className="dieta-meal-chips">
              {customMeals.map(m => {
                const Icon = MEAL_ICONS[m.icon] ?? Utensils
                return (
                  <div key={m.id} className="dieta-meal-chip">
                    <Icon size={11} />
                    <span>{m.label}</span>
                    {customMeals.length > 1 && (
                      <button
                        className="dieta-meal-chip-remove"
                        onClick={() => removeCustomMeal(m.id)}
                        aria-label="Remover refeição"
                      >
                        <X size={9} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="dieta-panel-label">Nova refeição</div>
            <div className="dieta-add-meal-row">
              <input
                className="dieta-form-input"
                style={{ flex: 1, minWidth: 140 }}
                placeholder="Nome da refeição"
                value={newMealLabel}
                onChange={e => setNewMealLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddMeal() }}
              />
              <div className="dieta-icon-picker">
                {ICON_OPTIONS.map(key => {
                  const Icon = MEAL_ICONS[key]
                  const active = newMealIcon === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewMealIcon(key)}
                      className={`dieta-icon-opt ${active ? 'selected' : ''}`}
                      title={key}
                    >
                      <Icon size={13} />
                    </button>
                  )
                })}
              </div>
              <button
                className="dieta-btn-sm"
                disabled={!newMealLabel.trim()}
                onClick={handleAddMeal}
              >
                <Plus size={11} /> Adicionar
              </button>
            </div>
          </div>
        )}

        {/* Cards das refeições */}
        <div className="dieta-meals-grid">
          {customMeals.map((meal, i) => {
            const Icon = MEAL_ICONS[meal.icon] ?? Utensils
            const items = todayEntries.filter(f => f.meal === meal.id)
            const totalKcal = items.reduce((a, f) => a + (f.calories || 0), 0)
            return (
              <section
                key={meal.id}
                className="dieta-meal-card"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="dieta-meal-top">
                  <div className="dieta-meal-info">
                    <div className="dieta-meal-icon">
                      <Icon size={13} />
                    </div>
                    <div>
                      <div className="dieta-meal-name">{meal.label}</div>
                      <div className="dieta-meal-meta">
                        {Math.round(totalKcal)} kcal · {items.length} {items.length === 1 ? 'item' : 'itens'}
                      </div>
                    </div>
                  </div>
                  <button
                    className="dieta-meal-add-btn"
                    onClick={() => setModalMeal(meal.id)}
                    aria-label={`Adicionar em ${meal.label}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {items.length > 0 && (
                  <div className="dieta-food-list">
                    {items.map(f => (
                      <FoodItem
                        key={f.id}
                        entry={f}
                        onRemove={() => removeFoodEntry(f.id)}
                      />
                    ))}
                  </div>
                )}

                <button
                  className="dieta-meal-add-link"
                  onClick={() => setModalMeal(meal.id)}
                >
                  <Plus size={10} />
                  Adicionar alimento
                </button>
              </section>
            )
          })}
        </div>
      </div>

      {/* ── Últimos 7 dias ────────────────────────────────────── */}
      <div className="dieta-card">
        <div className="dieta-card-header">
          <div className="dieta-section-label">
            <TrendingUp size={12} /> Últimos 7 dias
          </div>
        </div>
        <div className="dieta-chart-wrap">
          <div className="dieta-chart-bars">
            {weekTotals.map(day => {
              const pct = (day.calories / weekMax) * 100
              return (
                <div key={day.date} className="dieta-chart-col">
                  <div className="dieta-chart-track">
                    <div
                      className={`dieta-chart-fill ${day.isToday ? 'today' : ''}`}
                      style={{ height: `${Math.max(pct, day.calories > 0 ? 5 : 0)}%` }}
                      title={`${day.label}: ${Math.round(day.calories)} kcal`}
                    />
                  </div>
                  {day.isToday ? (
                    <div className="dieta-chart-today-pill">hoje</div>
                  ) : (
                    <div className="dieta-chart-label">{day.label}</div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="dieta-chart-footer">
            <span>últimos 7 dias</span>
            <span>
              Meta <span className="dieta-chart-goal">{dietGoals.calories.toLocaleString('pt-BR')}</span> kcal
            </span>
          </div>
        </div>
      </div>

      {/* ── Modal de adicionar alimento ──────────────────────── */}
      {modalMeal && (
        <AddFoodModal
          mealId={modalMeal}
          mealLabel={customMeals.find(m => m.id === modalMeal)?.label ?? modalMeal}
          meals={customMeals}
          onClose={() => setModalMeal(null)}
          onAdd={(entry) => {
            addFoodEntry({ ...entry, meal: modalMeal, date: dayKey })
            setCalPulse(true)
            setModalMeal(null)
          }}
          recentFoods={recentFoods}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
//  Water button — ripple effect
// ════════════════════════════════════════════════════════════════════
function WaterBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [clicking, setClicking] = useState(false)
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setClicking(true)
    setTimeout(() => setClicking(false), 220)
    const btn = ref.current
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const ripple = document.createElement('span')
      ripple.className = 'dieta-water-ripple-dot'
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ripple.style.cssText = `width:56px;height:56px;left:${x - 28}px;top:${y - 28}px`
      btn.appendChild(ripple)
      setTimeout(() => ripple.remove(), 380)
    }
    onClick()
  }
  return (
    <button
      ref={ref}
      type="button"
      className={`dieta-water-btn ${clicking ? 'clicking' : ''}`}
      onClick={handleClick}
    >
      {label}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════
//  Food item row (with remove animation)
// ════════════════════════════════════════════════════════════════════
function FoodItem({ entry, onRemove }: { entry: FoodEntry; onRemove: () => void }) {
  const [removing, setRemoving] = useState(false)
  const handle = () => {
    setRemoving(true)
    setTimeout(onRemove, 180)
  }
  return (
    <div className={`dieta-food-item ${removing ? 'removing' : ''}`}>
      <div className="dieta-food-info">
        <div className="dieta-food-name">{entry.name}</div>
        <div className="dieta-food-meta">
          {entry.quantity} · {Math.round(entry.calories)} kcal
        </div>
      </div>
      <button
        className="dieta-food-remove"
        onClick={handle}
        aria-label="Remover"
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
//  Add Food Modal
// ════════════════════════════════════════════════════════════════════
interface AddFoodModalProps {
  mealId: string
  mealLabel: string
  meals: { id: string; label: string }[]
  onClose: () => void
  onAdd: (e: {
    name: string; quantity: string; calories: number
    protein?: number; carbs?: number; fat?: number
    meal: string; date: string
  }) => void
  recentFoods: FoodEntry[]
}

function AddFoodModal({ mealId, mealLabel, meals, onClose, onAdd, recentFoods }: AddFoodModalProps) {
  const [selectedFood, setSelectedFood] = useState<FoodDBItem | null>(null)
  const [grams, setGrams] = useState(100)
  const [units, setUnits] = useState(1)
  const [useUnits, setUseUnits] = useState(false)
  const [search, setSearch] = useState('')
  const [activeMeal, setActiveMeal] = useState(mealId)

  const [draft, setDraft] = useState({ name: '', quantity: '', calories: '', protein: '', carbs: '', fat: '' })
  const [showMacros, setShowMacros] = useState(false)

  const autoMode = selectedFood !== null

  const effectiveGrams = (autoMode && useUnits && selectedFood?.unitGrams)
    ? units * selectedFood.unitGrams
    : grams

  const mult = effectiveGrams / 100
  const compCal = selectedFood ? Math.round(selectedFood.cal * mult) : 0
  const compP   = selectedFood ? +(selectedFood.p * mult).toFixed(1) : 0
  const compC   = selectedFood ? +(selectedFood.c * mult).toFixed(1) : 0
  const compF   = selectedFood ? +(selectedFood.f * mult).toFixed(1) : 0

  const searchResults = search.trim() ? searchFoods(search, 8) : []

  const manualValid = draft.name.trim().length > 0
    && Number.isFinite(parseFloat(draft.calories))
    && parseFloat(draft.calories) > 0
  const canAdd = autoMode ? (useUnits ? units > 0 : grams > 0) : manualValid

  function pickFood(food: FoodDBItem) {
    setSelectedFood(food)
    setGrams(food.serving ?? 100)
    setUnits(1)
    setUseUnits(!!(food.unitLabel && food.unitGrams))
    setSearch('')
  }

  function applyRecent(f: FoodEntry) {
    setSelectedFood(null)
    setDraft({
      name: f.name,
      quantity: f.quantity,
      calories: String(f.calories),
      protein:  f.protein != null ? String(f.protein) : '',
      carbs:    f.carbs   != null ? String(f.carbs)   : '',
      fat:      f.fat     != null ? String(f.fat)     : '',
    })
    setShowMacros(!!(f.protein || f.carbs || f.fat))
  }

  function handleAdd() {
    if (autoMode && selectedFood) {
      const qtyLabel = (useUnits && selectedFood.unitLabel && selectedFood.unitGrams)
        ? `${units} ${units === 1 ? selectedFood.unitLabel : selectedFood.unitLabel + 's'}`
        : `${effectiveGrams} g`
      onAdd({
        name: selectedFood.name,
        quantity: qtyLabel,
        calories: compCal,
        protein: compP || undefined,
        carbs:   compC || undefined,
        fat:     compF || undefined,
        meal: activeMeal,
        date: today(),
      })
    } else {
      if (!manualValid) return
      onAdd({
        name: draft.name.trim(),
        quantity: draft.quantity.trim() || '1 porção',
        calories: parseFloat(draft.calories),
        protein: draft.protein ? parseFloat(draft.protein) : undefined,
        carbs:   draft.carbs   ? parseFloat(draft.carbs)   : undefined,
        fat:     draft.fat     ? parseFloat(draft.fat)     : undefined,
        meal: activeMeal,
        date: today(),
      })
    }
  }

  return (
    <Modal open={true} onClose={onClose} title={`Adicionar — ${mealLabel}`}>
      <div className="dieta-modal-body">
        <div className="dieta-search-wrap">
          <Search size={13} className="dieta-search-icon" />
          <input
            className="dieta-search-input"
            placeholder="Buscar alimento... (ex: frango, aveia)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button className="dieta-search-clear" onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="dieta-chips-wrap">
            {searchResults.map(f => (
              <button key={f.id} className="dieta-chip" onClick={() => pickFood(f)}>
                {f.name} <span className="dieta-chip-muted">· {f.cal}kcal/100g</span>
              </button>
            ))}
          </div>
        )}

        {!search && (
          <>
            <div className="dieta-chips-label">Sugestões rápidas</div>
            <div className="dieta-chips-wrap">
              {QUICK.map(s => (
                <button key={s.id} className="dieta-chip" onClick={() => pickFood(s)}>
                  {s.name} <span className="dieta-chip-muted">· {s.cal}kcal</span>
                </button>
              ))}
            </div>
          </>
        )}

        {!search && recentFoods.length > 0 && (
          <>
            <div className="dieta-chips-label">Últimos usados</div>
            <div className="dieta-chips-wrap">
              {recentFoods.map(f => (
                <button key={f.id} className="dieta-chip dieta-chip-recent" onClick={() => applyRecent(f)}>
                  {f.name} <span className="dieta-chip-muted">· {Math.round(f.calories)}kcal</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="dieta-form-field">
          <label className="dieta-form-label">Refeição</label>
          <Select
            value={activeMeal}
            onChange={v => setActiveMeal(v)}
            options={meals.map(m => ({ value: m.id, label: m.label }))}
          />
        </div>

        {autoMode && selectedFood && (
          <div className="dieta-auto-panel">
            <div className="dieta-auto-head">
              <div>
                <div className="dieta-auto-name">{selectedFood.name}</div>
                <div className="dieta-auto-base">
                  {selectedFood.cal} kcal · {selectedFood.p}g P · {selectedFood.c}g C · {selectedFood.f}g G — por 100 g
                </div>
              </div>
              <button
                className="dieta-auto-clear"
                onClick={() => setSelectedFood(null)}
                title="Desfazer seleção"
              >
                <X size={14} />
              </button>
            </div>

            {selectedFood.unitLabel && selectedFood.unitGrams && (
              <div className="dieta-toggle-row">
                {(['g', 'un'] as const).map(mode => {
                  const active = mode === 'un' ? useUnits : !useUnits
                  const label = mode === 'un' ? selectedFood.unitLabel! : 'gramas'
                  return (
                    <button
                      key={mode}
                      onClick={() => setUseUnits(mode === 'un')}
                      className={`dieta-toggle-btn ${active ? 'active' : ''}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="dieta-form-field">
              <label className="dieta-form-label">
                {useUnits && selectedFood.unitLabel
                  ? `Quantidade (${selectedFood.unitLabel}) — recalculada automaticamente`
                  : 'Quantidade (g) — recalculada automaticamente'}
              </label>
              <input
                type="number"
                className="dieta-form-input"
                inputMode="numeric"
                min={1}
                value={useUnits ? units : grams}
                onChange={e => {
                  const v = Math.max(1, parseInt(e.target.value, 10) || 1)
                  if (useUnits) setUnits(v)
                  else setGrams(v)
                }}
                onKeyDown={e => { if (e.key === 'Enter' && canAdd) handleAdd() }}
              />
            </div>

            <div className="dieta-preview-grid">
              <div className="dieta-preview-cell">
                <div className="dieta-preview-label">Calorias</div>
                <div className="dieta-preview-val c-green">{compCal} kcal</div>
              </div>
              <div className="dieta-preview-cell">
                <div className="dieta-preview-label">Proteína</div>
                <div className="dieta-preview-val c-lime">{compP} g</div>
              </div>
              <div className="dieta-preview-cell">
                <div className="dieta-preview-label">Carb</div>
                <div className="dieta-preview-val c-gold">{compC} g</div>
              </div>
              <div className="dieta-preview-cell">
                <div className="dieta-preview-label">Gordura</div>
                <div className="dieta-preview-val c-danger">{compF} g</div>
              </div>
            </div>
          </div>
        )}

        {!autoMode && (
          <div className="dieta-manual">
            <div className="dieta-form-row">
              <div className="dieta-form-field">
                <label className="dieta-form-label">Alimento</label>
                <input
                  className="dieta-form-input"
                  placeholder="Ex: Frango grelhado"
                  value={draft.name}
                  onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div className="dieta-form-field">
                <label className="dieta-form-label">Quantidade</label>
                <input
                  className="dieta-form-input"
                  placeholder="100 g"
                  value={draft.quantity}
                  onChange={e => setDraft(d => ({ ...d, quantity: e.target.value }))}
                />
              </div>
            </div>
            <div className="dieta-form-field">
              <label className="dieta-form-label">Calorias (kcal)</label>
              <input
                className="dieta-form-input"
                type="number"
                inputMode="numeric"
                placeholder="180"
                value={draft.calories}
                onChange={e => setDraft(d => ({ ...d, calories: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter' && canAdd) handleAdd() }}
              />
            </div>
            <button
              className="dieta-macros-toggle"
              type="button"
              onClick={() => setShowMacros(v => !v)}
            >
              {showMacros ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showMacros ? 'Ocultar macros' : 'Adicionar macros'} (opcional)
            </button>
            {showMacros && (
              <div className="dieta-form-row-3">
                <div className="dieta-form-field">
                  <label className="dieta-form-label c-lime">Proteína (g)</label>
                  <input
                    className="dieta-form-input"
                    type="number"
                    placeholder="0"
                    value={draft.protein}
                    onChange={e => setDraft(d => ({ ...d, protein: e.target.value }))}
                  />
                </div>
                <div className="dieta-form-field">
                  <label className="dieta-form-label c-gold">Carboidrato (g)</label>
                  <input
                    className="dieta-form-input"
                    type="number"
                    placeholder="0"
                    value={draft.carbs}
                    onChange={e => setDraft(d => ({ ...d, carbs: e.target.value }))}
                  />
                </div>
                <div className="dieta-form-field">
                  <label className="dieta-form-label c-danger">Gordura (g)</label>
                  <input
                    className="dieta-form-input"
                    type="number"
                    placeholder="0"
                    value={draft.fat}
                    onChange={e => setDraft(d => ({ ...d, fat: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className="dieta-btn-primary"
          disabled={!canAdd}
          onClick={handleAdd}
        >
          <Plus size={14} /> Adicionar alimento
        </button>
      </div>
    </Modal>
  )
}

// ════════════════════════════════════════════════════════════════════
//  Styles — escopados na página, alinhados aos tokens do design system
// ════════════════════════════════════════════════════════════════════
function DietaStyles() {
  return (
    <style>{`
      /* Local tokens (mapeados para os globais quando existem) */
      .dieta-root {
        --green: var(--color-primary);
        --green-subtle: var(--color-primary-light);
        --green-glow: var(--color-primary-glow);
        --green-g07: rgba(var(--color-primary-rgb), 0.07);
        --green-g12: rgba(var(--color-primary-rgb), 0.12);
        --green-g20: rgba(var(--color-primary-rgb), 0.20);
        --green-g30: rgba(var(--color-primary-rgb), 0.30);
        --lime: #84cc16;
        --lime-glow: rgba(132,204,22,0.32);
        --cyan: #00e5ff;
        --cyan-glow: rgba(0,229,255,0.34);
        --gold-c: #eab308;
        --gold-glow: rgba(234,179,8,0.30);
        --danger: #f87171;
        --danger-glow: rgba(248,113,113,0.30);

        --t-prim: var(--color-text-main);
        --t-sec:  var(--color-text-muted);
        --t-ter:  var(--color-text-subtle);
        --t-dis:  rgba(255,255,255,0.15);
        --bd:     var(--color-border);
        --bd-h:   rgba(255,255,255,0.18);
        --bd-f:   rgba(var(--color-primary-rgb), 0.40);

        max-width: 880px;
        margin: 0 auto;
        padding: 24px 20px 64px;
        color: var(--t-prim);
      }
      @media (min-width: 768px) {
        .dieta-root { padding: 32px 28px 72px; }
      }

      /* ── Header ────────────────────────────────────────────── */
      .dieta-page-header { margin-bottom: 24px; }
      .dieta-eyebrow {
        font-size: 10px; font-weight: 600; letter-spacing: 0.09em;
        text-transform: uppercase; color: var(--t-ter);
        display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
      }
      .dieta-eyebrow-dot {
        width: 4px; height: 4px; border-radius: 50%;
        background: var(--green);
        box-shadow: 0 0 8px var(--green-glow);
      }
      .dieta-page-title {
        font-family: var(--font-display);
        font-size: 28px; font-weight: 800;
        letter-spacing: -0.025em; line-height: 1.1;
        background: linear-gradient(180deg, #ffffff 0%, var(--green-subtle) 65%, var(--green) 100%);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 16px var(--green-glow)) drop-shadow(0 2px 4px rgba(0,0,0,0.45));
      }
      .dieta-subtitle {
        font-size: 13px; color: var(--t-sec); margin-top: 4px;
      }

      /* ── Card 3D base ──────────────────────────────────────── */
      .dieta-card {
        position: relative;
        background:
          radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.05), transparent 55%),
          linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
        border: 1px solid var(--bd);
        border-radius: 14px;
        padding: 22px;
        margin-bottom: 12px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.06),
          inset 0 -1px 0 rgba(0,0,0,0.35),
          0 14px 40px rgba(0,0,0,0.55);
        overflow: hidden;
        transition: border-color .2s, box-shadow .25s, transform .25s;
      }
      .dieta-card::before {
        content: ''; position: absolute; inset: 0;
        border-radius: inherit; pointer-events: none;
        background: radial-gradient(140% 80% at 100% 0%, var(--green-g07), transparent 55%);
        opacity: 0.65;
      }
      .dieta-card > * { position: relative; z-index: 1; }
      .dieta-hero::after {
        content: ''; position: absolute; pointer-events: none;
        width: 280px; height: 280px; right: -90px; top: -130px;
        background: radial-gradient(circle, var(--green-g20), transparent 65%);
        filter: blur(8px); opacity: 0.55; z-index: 0;
      }

      .dieta-card-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 18px; gap: 10px;
      }
      .dieta-section-label {
        font-size: 10px; font-weight: 600; letter-spacing: 0.09em;
        text-transform: uppercase; color: var(--t-ter);
        display: inline-flex; align-items: center; gap: 6px;
      }
      .dieta-card-action {
        font-size: 11px; font-weight: 500; color: var(--t-ter);
        cursor: pointer;
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 8px; border-radius: 6px;
        border: 1px solid transparent; background: transparent;
        transition: color .15s, background .15s, border-color .15s;
      }
      .dieta-card-action:hover {
        color: var(--t-sec); border-color: var(--bd);
        background: rgba(255,255,255,0.04);
      }

      /* ── Calorie hero ──────────────────────────────────────── */
      .dieta-cal-row {
        display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px;
      }
      .dieta-cal-number {
        font-family: var(--font-mono);
        font-size: 52px; font-weight: 700;
        line-height: 1; letter-spacing: -0.045em;
        background: linear-gradient(180deg, #fff 0%, var(--green-subtle) 60%, var(--green) 100%);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 18px var(--green-glow)) drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        transition: transform .1s ease, filter .2s ease;
      }
      .dieta-cal-number.pulse { animation: dietaCalPulse 0.32s ease-out; }
      @keyframes dietaCalPulse {
        0%   { transform: scale(1);    filter: drop-shadow(0 0 18px var(--green-glow)) drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
        50%  { transform: scale(1.04); filter: drop-shadow(0 0 28px var(--green-glow)) drop-shadow(0 0 10px var(--green-glow)); }
        100% { transform: scale(1);    filter: drop-shadow(0 0 18px var(--green-glow)) drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
      }
      .dieta-cal-goal {
        font-size: 15px; color: var(--t-ter);
        font-family: var(--font-mono); letter-spacing: -0.02em;
      }
      .dieta-cal-pct {
        font-size: 11px; font-weight: 600; color: var(--green);
        font-family: var(--font-mono); margin-left: auto;
        background: var(--green-g12);
        border: 1px solid var(--green-g30);
        padding: 3px 10px; border-radius: 9999px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.08),
          0 0 16px var(--green-glow);
        letter-spacing: 0.02em;
      }
      .dieta-cal-remaining {
        font-size: 12px; color: var(--t-sec); margin-top: 8px;
      }

      /* ── Progress bar ──────────────────────────────────────── */
      .dieta-progress-track {
        height: 6px; background: rgba(0,0,0,0.45);
        border-radius: 9999px; overflow: hidden; margin: 12px 0 4px;
        position: relative;
        box-shadow:
          inset 0 1px 2px rgba(0,0,0,0.6),
          inset 0 0 0 1px rgba(255,255,255,0.03);
      }
      .dieta-progress-fill {
        height: 100%; border-radius: 9999px;
        transition: width 0.55s cubic-bezier(0.4,0,0.2,1);
        position: relative; overflow: hidden;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.35),
          inset 0 -1px 0 rgba(0,0,0,0.25);
      }
      .dieta-progress-fill::after {
        content: ''; position: absolute;
        top: 0; left: -100%; width: 55%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: dietaShimmer 2.2s infinite;
      }
      @keyframes dietaShimmer { 0% { left: -55%; } 100% { left: 160%; } }

      .dieta-progress-fill.p-green  { background: linear-gradient(90deg, var(--green), var(--green-subtle)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 12px var(--green-glow); }
      .dieta-progress-fill.p-lime   { background: linear-gradient(90deg, #65a30d, var(--lime)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 10px var(--lime-glow); }
      .dieta-progress-fill.p-gold   { background: linear-gradient(90deg, #ca8a04, var(--gold-c)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 10px var(--gold-glow); }
      .dieta-progress-fill.p-danger { background: linear-gradient(90deg, #ef4444, var(--danger)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 10px var(--danger-glow); }
      .dieta-progress-fill.p-cyan   { background: linear-gradient(90deg, #0891b2, var(--cyan)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 12px var(--cyan-glow); }

      /* ── Macros grid 3D ────────────────────────────────────── */
      .dieta-macros-grid {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 10px; margin-top: 20px;
      }
      .dieta-macro-card {
        position: relative;
        background:
          radial-gradient(110% 70% at 0% 0%, rgba(255,255,255,0.05), transparent 55%),
          linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.18));
        border: 1px solid var(--bd);
        border-radius: 9px; padding: 14px 14px 12px;
        transition: transform .18s ease, box-shadow .2s ease, border-color .2s ease;
        overflow: hidden;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.05),
          inset 0 -1px 0 rgba(0,0,0,0.35),
          0 6px 20px rgba(0,0,0,0.4);
      }
      .dieta-macro-card::before {
        content: ''; position: absolute; pointer-events: none;
        width: 80px; height: 80px; right: -28px; top: -28px;
        border-radius: 50%; opacity: 0.35;
        filter: blur(6px);
        transition: opacity .25s, transform .25s;
      }
      .dieta-macro-card.m-prot::before { background: radial-gradient(circle, var(--lime), transparent 65%); }
      .dieta-macro-card.m-carb::before { background: radial-gradient(circle, var(--gold-c), transparent 65%); }
      .dieta-macro-card.m-fat::before  { background: radial-gradient(circle, var(--danger), transparent 65%); }
      .dieta-macro-card:hover { transform: translateY(-2px); }
      .dieta-macro-card:hover::before { opacity: 0.7; transform: scale(1.15); }
      .dieta-macro-card.m-prot:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.45), 0 0 24px var(--lime-glow); border-color: rgba(132,204,22,0.32); }
      .dieta-macro-card.m-carb:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.45), 0 0 24px var(--gold-glow); border-color: rgba(234,179,8,0.30); }
      .dieta-macro-card.m-fat:hover  { box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.45), 0 0 24px var(--danger-glow); border-color: rgba(248,113,113,0.28); }
      .dieta-macro-card > * { position: relative; }

      .dieta-macro-head { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; }
      .dieta-macro-card.m-prot .dieta-macro-icon  { color: var(--lime); }
      .dieta-macro-card.m-carb .dieta-macro-icon  { color: var(--gold-c); }
      .dieta-macro-card.m-fat  .dieta-macro-icon  { color: var(--danger); }
      .dieta-macro-label {
        font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .dieta-macro-card.m-prot .dieta-macro-label { color: var(--lime); }
      .dieta-macro-card.m-carb .dieta-macro-label { color: var(--gold-c); }
      .dieta-macro-card.m-fat  .dieta-macro-label { color: var(--danger); }
      .dieta-macro-val {
        font-family: var(--font-mono);
        font-size: 26px; font-weight: 700; line-height: 1;
        letter-spacing: -0.035em;
        color: var(--t-prim);
        text-shadow: 0 0 22px currentColor, 0 1px 0 rgba(0,0,0,0.4);
      }
      .dieta-macro-card.m-prot .dieta-macro-val { color: #f7fee7; text-shadow: 0 0 22px var(--lime-glow), 0 1px 0 rgba(0,0,0,0.4); }
      .dieta-macro-card.m-carb .dieta-macro-val { color: #fefce8; text-shadow: 0 0 22px var(--gold-glow), 0 1px 0 rgba(0,0,0,0.4); }
      .dieta-macro-card.m-fat  .dieta-macro-val { color: #fff1f1; text-shadow: 0 0 22px var(--danger-glow), 0 1px 0 rgba(0,0,0,0.4); }
      .dieta-macro-unit { font-size: 12px; font-weight: 400; color: var(--t-ter); }
      .dieta-macro-sub {
        font-size: 10px; color: var(--t-ter); margin-top: 6px;
        font-family: var(--font-mono); letter-spacing: 0.01em;
      }

      /* ── Goal panel ────────────────────────────────────────── */
      .dieta-goal-panel {
        background: rgba(255,255,255,0.04);
        border-radius: 9px; padding: 16px; margin-top: 14px;
        border: 1px solid var(--bd);
        animation: dietaPanelIn .18s ease;
      }
      @keyframes dietaPanelIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .dieta-goals-grid {
        display: grid; gap: 8px; margin-bottom: 12px;
        grid-template-columns: repeat(2, 1fr);
      }
      @media (min-width: 640px) {
        .dieta-goals-grid { grid-template-columns: repeat(4, 1fr); }
      }

      /* ── Form fields ───────────────────────────────────────── */
      .dieta-form-field { display: flex; flex-direction: column; gap: 4px; }
      .dieta-form-label {
        font-size: 10px; font-weight: 500; color: var(--t-ter);
        letter-spacing: 0.02em;
      }
      .dieta-form-label.c-lime   { color: var(--lime); }
      .dieta-form-label.c-gold   { color: var(--gold-c); }
      .dieta-form-label.c-danger { color: var(--danger); }
      .dieta-form-input {
        width: 100%; padding: 9px 10px;
        background: rgba(255,255,255,0.04); border: 1px solid var(--bd);
        border-radius: 6px; color: var(--t-prim); font-size: 13px;
        font-family: inherit; outline: none;
        transition: border-color .15s, box-shadow .15s;
      }
      .dieta-form-input:focus {
        border-color: var(--bd-f);
        box-shadow: 0 0 0 2px var(--green-g07);
      }
      .dieta-form-row {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 8px; margin-bottom: 8px;
      }
      .dieta-form-row-3 {
        display: grid; grid-template-columns: 1fr 1fr 1fr;
        gap: 8px; margin-bottom: 12px;
      }

      /* ── Buttons ───────────────────────────────────────────── */
      .dieta-btn-primary {
        width: 100%; padding: 11px;
        background: linear-gradient(180deg, var(--green-subtle), var(--green));
        border: 1px solid rgba(255,255,255,0.12); border-radius: 9px;
        color: #000; font-size: 13px; font-weight: 700;
        cursor: pointer; font-family: inherit; letter-spacing: 0.01em;
        transition: all .15s ease;
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.25),
          inset 0 -1px 0 rgba(0,0,0,0.15),
          0 0 0 rgba(34,197,94,0);
      }
      .dieta-btn-primary:hover:not(:disabled) {
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.30),
          inset 0 -1px 0 rgba(0,0,0,0.15),
          0 0 24px var(--green-glow);
      }
      .dieta-btn-primary:active:not(:disabled) { transform: scale(0.98); }
      .dieta-btn-primary:disabled {
        background: rgba(255,255,255,0.07);
        color: var(--t-dis); cursor: not-allowed;
        box-shadow: none; border-color: var(--bd);
      }

      .dieta-btn-sm {
        padding: 7px 12px; border-radius: 6px;
        background: var(--green); border: none; cursor: pointer;
        font-size: 11px; font-weight: 600; color: #000;
        font-family: inherit; transition: all .12s; white-space: nowrap;
        display: inline-flex; align-items: center; gap: 4px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 0 14px var(--green-glow);
      }
      .dieta-btn-sm:hover:not(:disabled) { background: var(--green-subtle); }
      .dieta-btn-sm:disabled { background: rgba(255,255,255,0.07); color: var(--t-dis); cursor: not-allowed; box-shadow: none; }

      /* ── Water card (horizontal cyan fill) ─────────────────── */
      .dieta-water-card {
        position: relative;
        overflow: hidden;
        isolation: isolate;
        transition: box-shadow .35s, border-color .35s;
      }
      .dieta-water-card.has-fill { border-color: rgba(0,229,255,0.42); }
      .dieta-water-card.has-fill {
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.06),
          inset 0 -1px 0 rgba(0,0,0,0.35),
          0 14px 40px rgba(0,0,0,0.55),
          0 0 32px rgba(0,229,255,0.32),
          0 0 60px rgba(0,229,255,0.18);
      }
      .dieta-water-fill {
        position: absolute; left: 0; top: 0; bottom: 0;
        width: 0%; z-index: 0; pointer-events: none;
        transition: width 0.7s cubic-bezier(0.4,0,0.2,1);
        background:
          linear-gradient(90deg,
            rgba(0,229,255,0.58) 0%,
            rgba(0,200,230,0.46) 60%,
            rgba(0,170,200,0.36) 100%);
        box-shadow:
          inset 12px 0 24px rgba(255,255,255,0.07),
          inset -8px 0 24px rgba(0,0,0,0.18);
      }
      .dieta-water-fill::after {
        content: '';
        position: absolute; top: 0; bottom: 0; right: 0;
        width: 14px;
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(186,255,255,0.55) 60%, rgba(255,255,255,0.85) 100%);
        opacity: 0;
        pointer-events: none;
      }
      .dieta-water-card.splashing .dieta-water-fill::after { animation: dietaWaterEdge 0.7s ease-out; }
      .dieta-water-card.splashing .dieta-water-fill { animation: dietaWaterSlosh 0.7s ease-out; }
      @keyframes dietaWaterEdge {
        0%   { opacity: 0; transform: scaleX(0.4); }
        30%  { opacity: 1; transform: scaleX(1.6); }
        100% { opacity: 0; transform: scaleX(0.6); }
      }
      @keyframes dietaWaterSlosh {
        0%   { filter: brightness(1)   saturate(1); }
        20%  { filter: brightness(1.4) saturate(1.35); }
        60%  { filter: brightness(1.1) saturate(1.15); }
        100% { filter: brightness(1)   saturate(1); }
      }
      .dieta-water-ripple {
        position: absolute; top: 50%;
        width: 14px; height: 14px;
        border-radius: 50%;
        border: 2px solid rgba(186,255,255,0.85);
        transform: translate(50%, -50%) scale(0.4);
        opacity: 0; pointer-events: none; z-index: 1;
      }
      .dieta-water-card.splashing .dieta-water-ripple { animation: dietaWaterRipple 0.7s ease-out; }
      @keyframes dietaWaterRipple {
        0%   { opacity: 0.95; transform: translate(50%, -50%) scale(0.3); border-width: 3px; }
        100% { opacity: 0;    transform: translate(50%, -50%) scale(6);   border-width: 0.5px; }
      }
      .dieta-water-content { position: relative; z-index: 2; }
      .dieta-water-card.has-fill .dieta-water-val { color: #ecfeff; text-shadow: 0 0 18px rgba(103,232,249,0.85); }

      .dieta-water-top {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; flex-wrap: wrap;
      }
      .dieta-water-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .dieta-water-val {
        font-family: var(--font-mono);
        font-size: 14px; font-weight: 600;
        color: #93dbff; letter-spacing: -0.01em;
        text-shadow: 0 0 14px rgba(96,165,250,0.45);
      }
      .dieta-water-edit-link {
        font-size: 11px; color: var(--t-ter); cursor: pointer;
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 8px; border-radius: 6px;
        border: 1px solid transparent; background: transparent;
        transition: all .15s; font-weight: 500;
      }
      .dieta-water-edit-link:hover {
        color: var(--cyan); border-color: rgba(0,229,255,0.25);
        background: rgba(0,229,255,0.06);
      }

      .dieta-water-btns { display: flex; gap: 6px; margin-top: 14px; flex-wrap: wrap; align-items: center; }
      .dieta-water-btn {
        padding: 7px 14px; border-radius: 9999px;
        border: 1px solid var(--bd);
        background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
        font-size: 12px; font-weight: 500; color: var(--t-sec);
        cursor: pointer; transition: all .15s ease;
        position: relative; overflow: hidden;
        font-family: var(--font-mono); letter-spacing: 0.01em;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.06),
          inset 0 -1px 0 rgba(0,0,0,0.25);
      }
      .dieta-water-btn:hover {
        border-color: rgba(0,229,255,0.4); color: var(--cyan);
        background: linear-gradient(180deg, rgba(0,229,255,0.12), rgba(0,229,255,0.04));
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 0 14px rgba(0,229,255,0.3);
      }
      .dieta-water-btn:active { transform: scale(0.95); }
      .dieta-water-btn.clicking { animation: dietaBtnPress .22s ease-out; }
      @keyframes dietaBtnPress { 40% { transform: scale(0.93); } 100% { transform: scale(1); } }
      .dieta-water-btn-reset { color: var(--t-ter); font-family: inherit; }
      .dieta-water-btn-reset:hover { color: var(--t-prim); border-color: var(--bd-h); background: rgba(255,255,255,0.04); }

      .dieta-water-ripple-dot {
        position: absolute; border-radius: 50%;
        background: rgba(0,229,255,0.32);
        transform: scale(0);
        animation: dietaRippleOut .38s ease-out forwards;
        pointer-events: none;
      }
      @keyframes dietaRippleOut { to { transform: scale(4); opacity: 0; } }

      .dieta-water-edit-panel {
        background: linear-gradient(180deg, rgba(0,229,255,0.05), rgba(0,229,255,0.01));
        border: 1px solid rgba(0,229,255,0.18);
        border-radius: 9px; padding: 12px 14px; margin-top: 12px;
        display: flex; align-items: flex-end; gap: 10px;
        animation: dietaPanelIn .18s ease;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.04),
          0 4px 16px rgba(0,0,0,0.3);
      }
      .dieta-water-save-btn {
        padding: 9px 14px; border-radius: 6px;
        background: linear-gradient(180deg, #22d3ee, #0891b2);
        border: 1px solid rgba(0,229,255,0.4);
        cursor: pointer; font-size: 12px; font-weight: 600;
        color: #fff; font-family: inherit; white-space: nowrap;
        display: inline-flex; align-items: center; gap: 5px;
        transition: all .15s;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.18),
          0 0 16px rgba(0,229,255,0.3);
      }
      .dieta-water-save-btn:hover {
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 0 22px rgba(0,229,255,0.5);
      }

      /* ── Meals section ─────────────────────────────────────── */
      .dieta-meals-section { margin-bottom: 14px; }
      .dieta-meals-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 10px; gap: 8px;
      }
      .dieta-meals-title {
        font-size: 13px; font-weight: 600; color: var(--t-prim);
        display: inline-flex; align-items: center; gap: 8px;
      }
      .dieta-meals-count {
        font-family: var(--font-mono);
        font-size: 10px; font-weight: 600; color: var(--t-ter);
        background: rgba(255,255,255,0.07);
        border: 1px solid var(--bd);
        padding: 1px 7px; border-radius: 9999px;
      }

      .dieta-meals-grid {
        display: grid; grid-template-columns: 1fr; gap: 8px;
      }
      @media (min-width: 640px) {
        .dieta-meals-grid { grid-template-columns: 1fr 1fr; }
      }

      /* ── Meal card 3D ──────────────────────────────────────── */
      .dieta-meal-card {
        position: relative;
        background:
          radial-gradient(140% 80% at 0% 0%, rgba(255,255,255,0.045), transparent 55%),
          linear-gradient(180deg, rgba(255,255,255,0.035), rgba(0,0,0,0.15));
        border: 1px solid var(--bd);
        border-radius: 14px; padding: 14px 14px 10px;
        opacity: 0; transform: translateY(16px);
        animation: dietaMealIn 0.3s ease-out forwards;
        overflow: hidden;
        transition: border-color .2s, box-shadow .25s, transform .2s;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.05),
          inset 0 -1px 0 rgba(0,0,0,0.30),
          0 8px 24px rgba(0,0,0,0.45);
      }
      .dieta-meal-card::before {
        content: ''; position: absolute; pointer-events: none;
        width: 130px; height: 130px; right: -50px; top: -50px;
        background: radial-gradient(circle, var(--green-g12), transparent 65%);
        filter: blur(4px); opacity: 0.7;
        transition: opacity .25s, transform .25s;
      }
      .dieta-meal-card > * { position: relative; }
      .dieta-meal-card:hover {
        border-color: var(--green-g30);
        transform: translateY(-2px);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.08),
          0 12px 32px rgba(0,0,0,0.55),
          0 0 28px var(--green-glow);
      }
      .dieta-meal-card:hover::before { opacity: 1; transform: scale(1.2); }
      @keyframes dietaMealIn { to { opacity: 1; transform: translateY(0); } }

      .dieta-meal-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
      .dieta-meal-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .dieta-meal-icon {
        width: 30px; height: 30px; border-radius: 9px;
        background: radial-gradient(circle at 30% 30%, var(--green-g30), var(--green-g07));
        border: 1px solid var(--green-g30);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; color: var(--green);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.1),
          inset 0 -1px 0 rgba(0,0,0,0.2),
          0 0 12px var(--green-glow);
      }
      .dieta-meal-name { font-size: 13px; font-weight: 600; color: var(--t-prim); line-height: 1.2; }
      .dieta-meal-meta { font-size: 11px; color: var(--t-ter); margin-top: 2px; font-family: var(--font-mono); }

      .dieta-meal-add-btn {
        width: 28px; height: 28px; border-radius: 9px;
        background: linear-gradient(180deg, var(--green-g20), var(--green-g07));
        border: 1px solid var(--green-g30);
        color: var(--green); cursor: pointer; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        transition: all .15s;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.1),
          inset 0 -1px 0 rgba(0,0,0,0.2);
      }
      .dieta-meal-add-btn:hover {
        background: linear-gradient(180deg, var(--green-g30), var(--green-g12));
        transform: scale(1.08);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 0 18px var(--green-glow);
      }
      .dieta-meal-add-btn:active { transform: scale(0.94); }

      .dieta-meal-add-link {
        font-size: 11px; color: var(--t-ter); cursor: pointer;
        margin-top: 8px; padding-top: 8px;
        display: inline-flex; align-items: center; gap: 4px;
        border-top: 1px solid var(--bd);
        transition: color .15s; font-weight: 500;
        background: transparent; border-left: none; border-right: none; border-bottom: none;
        width: 100%; justify-content: flex-start;
      }
      .dieta-meal-add-link:hover { color: var(--green); }

      .dieta-food-list { display: flex; flex-direction: column; }
      .dieta-food-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 6px 0; border-bottom: 1px solid var(--bd);
        opacity: 0; transform: translateX(-8px);
        animation: dietaFoodIn .18s ease-out forwards;
        overflow: hidden; max-height: 56px;
        transition: max-height .2s, opacity .18s, padding .18s;
      }
      .dieta-food-item.removing { opacity: 0; max-height: 0; padding: 0; border-color: transparent; }
      @keyframes dietaFoodIn { to { opacity: 1; transform: translateX(0); } }
      .dieta-food-info { flex: 1; min-width: 0; }
      .dieta-food-name {
        font-size: 12px; color: var(--t-prim); font-weight: 400;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .dieta-food-meta {
        font-size: 10px; color: var(--t-ter);
        font-family: var(--font-mono); margin-top: 1px;
      }
      .dieta-food-remove {
        width: 22px; height: 22px; border-radius: 6px;
        background: transparent; border: none; cursor: pointer;
        color: var(--t-dis); flex-shrink: 0;
        display: inline-flex; align-items: center; justify-content: center;
        transition: all .12s; opacity: 0; margin-left: 6px;
      }
      .dieta-food-item:hover .dieta-food-remove { opacity: 1; }
      .dieta-food-remove:hover { background: rgba(248,113,113,0.12); color: var(--danger); }

      /* ── Manage panel ──────────────────────────────────────── */
      .dieta-manage-panel {
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--bd);
        border-radius: 9px; padding: 14px 16px; margin-bottom: 8px;
        animation: dietaPanelIn .18s ease;
      }
      .dieta-panel-label {
        font-size: 10px; font-weight: 600; letter-spacing: 0.09em;
        text-transform: uppercase; color: var(--t-ter); margin-bottom: 8px;
      }
      .dieta-meal-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
      .dieta-meal-chip {
        padding: 4px 8px 4px 6px; border-radius: 9999px;
        border: 1px solid var(--bd); background: rgba(255,255,255,0.05);
        font-size: 11px; color: var(--t-sec);
        display: inline-flex; align-items: center; gap: 5px;
      }
      .dieta-meal-chip svg { color: var(--t-ter); flex-shrink: 0; }
      .dieta-meal-chip-remove {
        color: var(--t-ter); cursor: pointer;
        width: 14px; height: 14px;
        display: inline-flex; align-items: center; justify-content: center;
        border-radius: 3px; transition: all .12s;
        background: transparent; border: none; padding: 0;
      }
      .dieta-meal-chip-remove:hover { color: var(--danger); background: rgba(248,113,113,0.12); }

      .dieta-add-meal-row {
        display: flex; gap: 6px; align-items: center;
        flex-wrap: wrap;
      }
      .dieta-icon-picker { display: flex; gap: 4px; flex-wrap: wrap; }
      .dieta-icon-opt {
        width: 28px; height: 28px; border-radius: 6px;
        border: 1px solid var(--bd); background: rgba(255,255,255,0.04);
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        color: var(--t-ter);
        transition: all .12s;
      }
      .dieta-icon-opt:hover { border-color: var(--bd-h); background: rgba(255,255,255,0.07); color: var(--t-sec); }
      .dieta-icon-opt.selected {
        border-color: var(--green-g30);
        background: var(--green-g07);
        color: var(--green);
        box-shadow: 0 0 12px var(--green-glow);
      }

      /* ── Week chart ────────────────────────────────────────── */
      .dieta-chart-wrap { padding-top: 4px; }
      .dieta-chart-bars {
        display: flex; align-items: flex-end; gap: 5px;
        height: 80px; margin-bottom: 8px;
      }
      .dieta-chart-col {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; gap: 5px;
      }
      .dieta-chart-track {
        width: 100%; height: 68px;
        background: rgba(255,255,255,0.05);
        border-radius: 4px 4px 0 0;
        position: relative; overflow: hidden;
        display: flex; align-items: flex-end;
      }
      .dieta-chart-fill {
        width: 100%; border-radius: 4px 4px 0 0;
        background: rgba(34,197,94,0.18);
        transition: height 0.45s cubic-bezier(0.4,0,0.2,1);
        height: 0;
      }
      .dieta-chart-fill.today {
        background: linear-gradient(180deg, var(--green), var(--color-primary-dark));
        box-shadow: 0 0 16px rgba(34,197,94,0.30);
      }
      .dieta-chart-label {
        font-size: 9px; font-weight: 500; color: var(--t-ter);
        text-align: center;
        font-family: var(--font-mono); letter-spacing: 0.02em;
      }
      .dieta-chart-today-pill {
        background: var(--green-g20); border: 1px solid var(--green-g30);
        color: var(--green); font-size: 8px; font-weight: 700;
        padding: 1px 5px; border-radius: 9999px; letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .dieta-chart-footer {
        display: flex; align-items: center; justify-content: space-between;
        font-size: 10px; color: var(--t-ter);
      }
      .dieta-chart-goal {
        color: var(--green);
        font-family: var(--font-mono);
        font-weight: 600;
      }

      /* ── Modal-only content ────────────────────────────────── */
      .dieta-modal-body { display: flex; flex-direction: column; gap: 14px; }

      .dieta-search-wrap { position: relative; }
      .dieta-search-icon {
        position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
        color: var(--t-ter); pointer-events: none;
      }
      .dieta-search-input {
        width: 100%; padding: 9px 36px 9px 34px;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--bd); border-radius: 9px;
        color: var(--t-prim); font-size: 13px; font-family: inherit; outline: none;
        transition: border-color .15s, box-shadow .15s;
      }
      .dieta-search-input:focus {
        border-color: var(--bd-f);
        box-shadow: 0 0 0 3px var(--green-g07);
      }
      .dieta-search-clear {
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
        color: var(--t-ter); cursor: pointer;
        background: transparent; border: none; padding: 0;
        display: inline-flex; align-items: center;
      }

      .dieta-chips-label {
        font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
        text-transform: uppercase; color: var(--t-ter); margin-bottom: 7px;
      }
      .dieta-chips-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
      .dieta-chip {
        padding: 4px 9px; border-radius: 9999px;
        border: 1px solid var(--bd); background: rgba(255,255,255,0.04);
        font-size: 11px; color: var(--t-sec); cursor: pointer;
        transition: all .12s; white-space: nowrap;
        font-family: inherit;
      }
      .dieta-chip:hover {
        border-color: var(--green-g30); color: var(--green);
        background: var(--green-g07);
      }
      .dieta-chip.dieta-chip-recent { border-color: var(--green-g30); }
      .dieta-chip-muted { color: var(--t-ter); margin-left: 3px; font-family: var(--font-mono); }

      .dieta-auto-panel {
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--green-g30); border-radius: 14px;
        padding: 14px; display: flex; flex-direction: column; gap: 12px;
      }
      .dieta-auto-head {
        display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
      }
      .dieta-auto-name { font-size: 13px; font-weight: 600; color: var(--t-prim); }
      .dieta-auto-base { font-size: 10px; color: var(--t-ter); margin-top: 2px; font-family: var(--font-mono); }
      .dieta-auto-clear {
        color: var(--t-ter); cursor: pointer; flex-shrink: 0;
        background: transparent; border: none; padding: 0;
        display: inline-flex; align-items: center;
      }
      .dieta-auto-clear:hover { color: var(--t-prim); }

      .dieta-toggle-row { display: flex; gap: 6px; }
      .dieta-toggle-btn {
        padding: 5px 12px; border-radius: 6px;
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--bd);
        color: var(--t-ter); font-size: 11px; font-weight: 600;
        cursor: pointer; transition: all .12s;
      }
      .dieta-toggle-btn.active {
        background: var(--green-g12); border-color: var(--green-g30);
        color: var(--green);
        box-shadow: 0 0 12px var(--green-glow);
      }

      .dieta-preview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
      .dieta-preview-cell {
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--bd); border-radius: 6px;
        padding: 8px 6px; text-align: center;
      }
      .dieta-preview-label {
        font-size: 9px; color: var(--t-ter);
        text-transform: uppercase; letterSpacing: 0.08em; margin-bottom: 3px;
      }
      .dieta-preview-val {
        font-family: var(--font-mono);
        font-size: 13px; font-weight: 700;
      }
      .dieta-preview-val.c-green  { color: var(--green); }
      .dieta-preview-val.c-lime   { color: var(--lime); }
      .dieta-preview-val.c-gold   { color: var(--gold-c); }
      .dieta-preview-val.c-danger { color: var(--danger); }

      .dieta-manual { display: flex; flex-direction: column; gap: 10px; }
      .dieta-macros-toggle {
        font-size: 11px; color: var(--t-ter); cursor: pointer;
        background: transparent; border: none; padding: 0;
        display: inline-flex; align-items: center; gap: 5px;
        transition: color .12s; font-weight: 500;
        align-self: flex-start;
      }
      .dieta-macros-toggle:hover { color: var(--t-sec); }
    `}</style>
  )
}
