'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { today } from '@/lib/utils'
import { FoodEntry } from '@/store/types'
import { FOOD_DB, FoodDBItem, searchFoods } from '@/lib/foodDatabase'
import { MEAL_ICONS, ICON_OPTIONS } from '@/lib/dieta/constants'
import {
  UtensilsCrossed, Plus, Trash2, Sun, Soup, Moon,
  Flame, Target, Edit3, Check, Droplets, ChevronDown, ChevronUp,
  TrendingUp, Search, X, Coffee, Apple, Zap, Pizza, Star, Heart,
  Settings2,
} from 'lucide-react'

// ── Design tokens ────────────────────────────────────────────────────
const P      = 'var(--color-primary)'
const PM     = 'var(--color-primary-muted)'
const PB     = 'var(--color-primary-border)'
const BG2    = 'var(--color-bg-2)'
const BG3    = 'var(--color-bg-3)'
const BORDER = 'var(--color-border)'
const TM     = 'var(--color-text-main)'
const TT     = 'var(--color-text-muted)'
const GOLD   = 'var(--gold)'

// ── Macro colors ─────────────────────────────────────────────────────
const MC = {
  protein: { fill: '#38bdf8', glow: 'rgba(56,189,248,0.35)',  label: 'Proteína'    },
  carbs:   { fill: '#fbbf24', glow: 'rgba(251,191,36,0.35)',  label: 'Carboidrato' },
  fat:     { fill: '#f472b6', glow: 'rgba(244,114,182,0.35)', label: 'Gordura'     },
} as const

// ── Icon map for meal icons ───────────────────────────────────────────

// Quick suggestions shown when no search active
const QUICK: Pick<FoodDBItem, 'id' | 'name' | 'cal' | 'p' | 'c' | 'f' | 'serving'>[] = [
  FOOD_DB.find(f => f.id === 'arroz_b')!,
  FOOD_DB.find(f => f.id === 'frango_g')!,
  FOOD_DB.find(f => f.id === 'ovo_c')!,
  FOOD_DB.find(f => f.id === 'banana')!,
  FOOD_DB.find(f => f.id === 'pao_int')!,
  FOOD_DB.find(f => f.id === 'whey')!,
  FOOD_DB.find(f => f.id === 'aveia')!,
  FOOD_DB.find(f => f.id === 'bat_doce')!,
]

// ── Helpers ───────────────────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════════════
export default function DietaPage() {
  const {
    foodEntries, dietGoals, addFoodEntry, removeFoodEntry, updateDietGoals,
    customMeals, addCustomMeal, removeCustomMeal,
  } = useStore()

  const [modalMeal,     setModalMeal]     = useState<string | null>(null)
  const [editingGoals,  setEditingGoals]  = useState(false)
  const [goalsDraft,    setGoalsDraft]    = useState({
    calories: String(dietGoals.calories),
    protein:  String(dietGoals.protein  ?? ''),
    carbs:    String(dietGoals.carbs    ?? ''),
    fat:      String(dietGoals.fat      ?? ''),
  })
  const [water,          setWater]         = useState(0)
  const [managingMeals,  setManagingMeals] = useState(false)
  const [newMealLabel,   setNewMealLabel]  = useState('')
  const [newMealIcon,    setNewMealIcon]   = useState('sun')

  const dayKey       = today()
  const todayEntries = useMemo(() => foodEntries.filter(f => f.date === dayKey), [foodEntries, dayKey])

  const totals = useMemo(() => todayEntries.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein:  acc.protein  + (f.protein  || 0),
      carbs:    acc.carbs    + (f.carbs    || 0),
      fat:      acc.fat      + (f.fat      || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  ), [todayEntries])

  const calPct   = Math.min(100, Math.round((totals.calories / Math.max(1, dietGoals.calories)) * 100))
  const overGoal = totals.calories > dietGoals.calories

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

  const weekDays   = useMemo(() => getLast7Days(), [])
  const weekTotals = useMemo(() => weekDays.map(d => ({
    date:     d,
    label:    shortDay(d),
    calories: foodEntries.filter(f => f.date === d).reduce((a, f) => a + (f.calories || 0), 0),
    isToday:  d === dayKey,
  })), [foodEntries, weekDays, dayKey])
  const weekMax = Math.max(...weekTotals.map(d => d.calories), dietGoals.calories, 1)

  function handleSaveGoals() {
    const cals  = parseInt(goalsDraft.calories, 10)
    const prot  = goalsDraft.protein.trim() ? parseInt(goalsDraft.protein, 10) : undefined
    const carbs = goalsDraft.carbs.trim()   ? parseInt(goalsDraft.carbs,   10) : undefined
    const fat   = goalsDraft.fat.trim()     ? parseInt(goalsDraft.fat,     10) : undefined
    if (Number.isFinite(cals) && cals > 0) {
      updateDietGoals({
        calories: cals,
        protein:  prot  && Number.isFinite(prot)  ? prot  : undefined,
        carbs:    carbs && Number.isFinite(carbs)  ? carbs : undefined,
        fat:      fat   && Number.isFinite(fat)    ? fat   : undefined,
      })
    }
    setEditingGoals(false)
  }

  function handleAddMeal() {
    if (!newMealLabel.trim()) return
    addCustomMeal({ label: newMealLabel.trim(), icon: newMealIcon })
    setNewMealLabel('')
    setNewMealIcon('sun')
  }

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto" style={{ animation: 'fadeIn 0.4s ease both' }}>

      {/* ── HEADER ────────────────────────────────────────────── */}
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

      {/* ── A) RESUMO DIÁRIO ──────────────────────────────────── */}
      <section
        className="rounded-2xl p-5 mb-4"
        style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Flame size={14} style={{ color: GOLD }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: TT }}>
              Resumo do dia
            </span>
          </div>
          <button
            onClick={() => {
              setGoalsDraft({
                calories: String(dietGoals.calories),
                protein:  String(dietGoals.protein  ?? ''),
                carbs:    String(dietGoals.carbs    ?? ''),
                fat:      String(dietGoals.fat      ?? ''),
              })
              setEditingGoals(v => !v)
            }}
            className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            style={{ color: TT, cursor: 'pointer' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TM)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
          >
            <Target size={12} />
            {editingGoals ? 'Fechar' : 'Editar metas'}
            {editingGoals ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {/* Calorias */}
        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-1.5">
              <span
                style={{
                  fontSize: 38, fontWeight: 800,
                  fontFamily: 'var(--font-jetbrains)',
                  color: overGoal ? '#f87171' : P,
                  letterSpacing: '-.02em',
                  textShadow: overGoal ? '0 0 20px rgba(248,113,113,0.4)' : '0 0 24px var(--color-primary-glow)',
                  lineHeight: 1, transition: 'color .2s',
                }}
              >
                {Math.round(totals.calories)}
              </span>
              <span style={{ fontSize: 14, color: TT, fontFamily: 'var(--font-jetbrains)' }}>
                / {dietGoals.calories} kcal
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: overGoal ? '#f87171' : P, fontFamily: 'var(--font-jetbrains)' }}>
              {calPct}%
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: BG3, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <div style={{
              width: `${calPct}%`, height: '100%',
              background: overGoal
                ? 'linear-gradient(90deg, var(--color-primary), #f87171)'
                : 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary), var(--color-primary-light))',
              boxShadow: '0 0 12px var(--color-primary-glow)',
              transition: 'width .35s ease',
            }} />
          </div>
          <div style={{ fontSize: 11, color: TT, marginTop: 5 }}>
            {overGoal
              ? `${Math.round(totals.calories - dietGoals.calories)} kcal acima da meta`
              : `${Math.round(dietGoals.calories - totals.calories)} kcal restantes`}
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2.5">
          {(['protein', 'carbs', 'fat'] as const).map(key => {
            const mc   = MC[key]
            const val  = totals[key]
            const goal = dietGoals[key]
            const pct  = goal ? Math.min(100, Math.round((val / goal) * 100)) : null
            return (
              <div key={key} className="rounded-xl p-3" style={{ background: BG3, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 10, color: mc.fill, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 600 }}>
                  {mc.label}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, color: TM, fontFamily: 'var(--font-jetbrains)' }}>
                  {val.toFixed(0)}<span style={{ fontSize: 11, color: TT, fontWeight: 400, marginLeft: 2 }}>g</span>
                </div>
                {goal !== undefined && pct !== null ? (
                  <>
                    <div style={{ fontSize: 10, color: TT, marginTop: 2 }}>meta {goal}g · {pct}%</div>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: mc.fill, boxShadow: `0 0 6px ${mc.glow}`, transition: 'width .3s ease' }} />
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 10, color: TT, marginTop: 2, opacity: 0.5 }}>sem meta</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Edição de metas */}
        {editingGoals && (
          <div
            className="mt-4 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end"
            style={{ background: BG3, border: `1px solid ${PB}` }}
          >
            {[
              { key: 'calories' as const, label: 'Calorias (kcal)', placeholder: '2000' },
              { key: 'protein'  as const, label: 'Proteína (g)',     placeholder: '120'  },
              { key: 'carbs'    as const, label: 'Carboidrato (g)',  placeholder: '250'  },
              { key: 'fat'      as const, label: 'Gordura (g)',      placeholder: '60'   },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, color: TT, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input
                  type="number" className="input"
                  value={goalsDraft[f.key]}
                  onChange={e => setGoalsDraft(d => ({ ...d, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <button
              onClick={handleSaveGoals}
              className="col-span-2 sm:col-span-4 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-sm mt-1"
              style={{ background: P, color: '#000', boxShadow: '0 0 18px var(--color-primary-glow)', cursor: 'pointer' }}
            >
              <Check size={14} /> Salvar metas
            </button>
          </div>
        )}
      </section>

      {/* ── ÁGUA ─────────────────────────────────────────────── */}
      <section
        className="rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3"
        style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
          <Droplets size={14} style={{ color: '#38bdf8' }} />
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: TT }}>Água</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-jetbrains)', color: '#38bdf8' }}>
            {(water / 1000).toFixed(2).replace('.', ',')}
          </span>
          <span style={{ fontSize: 12, color: TT }}>L / 2,00 L</span>
        </div>
        <div style={{ flex: '1 1 100%', height: 5, borderRadius: 3, background: BG3, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, (water / 2000) * 100)}%`, height: '100%',
            background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
            boxShadow: '0 0 10px rgba(56,189,248,0.5)',
            transition: 'width .3s ease',
          }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[200, 300, 500].map(ml => (
            <button
              key={ml}
              onClick={() => setWater(w => Math.min(3000, w + ml))}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', cursor: 'pointer' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(56,189,248,0.2)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(56,189,248,0.1)')}
            >+{ml}ml</button>
          ))}
          {water > 0 && (
            <button
              onClick={() => setWater(0)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{ background: BG3, border: `1px solid ${BORDER}`, color: TT, cursor: 'pointer' }}
            >Reset</button>
          )}
        </div>
      </section>

      {/* ── B) REFEIÇÕES ─────────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: TT }}>
            Refeições · {customMeals.length}
          </span>
          <button
            onClick={() => setManagingMeals(v => !v)}
            className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            style={{ color: TT, cursor: 'pointer' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TM)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
          >
            <Settings2 size={12} />
            {managingMeals ? 'Fechar' : 'Gerenciar'}
            {managingMeals ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {/* Painel de gerenciamento */}
        {managingMeals && (
          <div
            className="rounded-2xl p-4 mb-3"
            style={{ background: BG2, border: `1px solid ${PB}`, boxShadow: 'var(--shadow-card)' }}
          >
            <div style={{ fontSize: 11, color: TT, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              Refeições atuais
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {customMeals.map(m => {
                const Icon = MEAL_ICONS[m.icon] ?? UtensilsCrossed
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px]"
                    style={{ background: BG3, border: `1px solid ${BORDER}` }}
                  >
                    <Icon size={12} style={{ color: P }} />
                    <span style={{ color: TM, fontWeight: 500 }}>{m.label}</span>
                    {customMeals.length > 1 && (
                      <button
                        onClick={() => removeCustomMeal(m.id)}
                        style={{ color: TT, cursor: 'pointer', marginLeft: 2 }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f87171')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
                        aria-label="Remover refeição"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ fontSize: 11, color: TT, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Adicionar refeição
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <div style={{ flex: '1 1 160px' }}>
                <input
                  className="input"
                  placeholder="Nome da refeição"
                  value={newMealLabel}
                  onChange={e => setNewMealLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddMeal() }}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: TT, marginBottom: 4 }}>Ícone</div>
                <div className="flex flex-wrap gap-1.5">
                  {ICON_OPTIONS.map(key => {
                    const Icon = MEAL_ICONS[key]
                    const active = newMealIcon === key
                    return (
                      <button
                        key={key}
                        onClick={() => setNewMealIcon(key)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: active ? PM : BG3,
                          border:     `1px solid ${active ? PB : BORDER}`,
                          color:      active ? P : TT,
                          cursor: 'pointer',
                        }}
                        title={key}
                      >
                        <Icon size={13} />
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                onClick={handleAddMeal}
                disabled={!newMealLabel.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[12px] transition-all"
                style={{
                  background: newMealLabel.trim() ? P : BG3,
                  color:      newMealLabel.trim() ? '#000' : TT,
                  cursor:     newMealLabel.trim() ? 'pointer' : 'not-allowed',
                  opacity:    newMealLabel.trim() ? 1 : 0.5,
                  boxShadow:  newMealLabel.trim() ? '0 0 14px var(--color-primary-glow)' : 'none',
                  border: `1px solid ${newMealLabel.trim() ? P : BORDER}`,
                  alignSelf: 'flex-end',
                }}
              >
                <Plus size={13} /> Adicionar
              </button>
            </div>
            <p style={{ fontSize: 10, color: TT, marginTop: 8, opacity: 0.6 }}>
              Remover uma refeição não apaga os alimentos já registrados.
            </p>
          </div>
        )}

        {/* Cards de refeição */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customMeals.map(meal => {
            const Icon      = MEAL_ICONS[meal.icon] ?? UtensilsCrossed
            const items     = todayEntries.filter(f => f.meal === meal.id)
            const totalKcal = items.reduce((a, f) => a + (f.calories || 0), 0)
            return (
              <section
                key={meal.id}
                className="rounded-2xl p-4"
                style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: PM, border: `1px solid ${PB}` }}>
                      <Icon size={14} style={{ color: P }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TM }}>{meal.label}</div>
                      <div style={{ fontSize: 11, color: TT, fontFamily: 'var(--font-jetbrains)' }}>
                        {Math.round(totalKcal)} kcal · {items.length} {items.length === 1 ? 'item' : 'itens'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalMeal(meal.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: PM, border: `1px solid ${PB}`, color: P, cursor: 'pointer' }}
                    aria-label={`Adicionar em ${meal.label}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {items.length === 0 ? (
                  <button
                    onClick={() => setModalMeal(meal.id)}
                    className="w-full text-left rounded-lg py-3 px-3 text-[12px] transition-all"
                    style={{ color: TT, background: 'transparent', border: `1px dashed ${BORDER}`, cursor: 'pointer' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = PB; el.style.color = TM }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = BORDER; el.style.color = TT }}
                  >
                    + Adicionar alimento
                  </button>
                ) : (
                  <ul className="space-y-1.5">
                    {items.map(f => (
                      <li
                        key={f.id}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
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
                                {f.protein ? <span style={{ color: MC.protein.fill }}>P{Math.round(f.protein)} </span> : null}
                                {f.carbs   ? <span style={{ color: MC.carbs.fill   }}>C{Math.round(f.carbs)} </span>   : null}
                                {f.fat     ? <span style={{ color: MC.fat.fill     }}>G{Math.round(f.fat)}</span>      : null}
                              </span></>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: P, fontFamily: 'var(--font-jetbrains)', whiteSpace: 'nowrap' }}>
                          {Math.round(f.calories)} kcal
                        </span>
                        <button
                          onClick={() => removeFoodEntry(f.id)}
                          className="opacity-40 hover:opacity-100 transition-opacity"
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
      </div>

      {/* ── HISTÓRICO SEMANAL ─────────────────────────────────── */}
      <section
        className="rounded-2xl p-5 mb-4"
        style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} style={{ color: P }} />
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: TT }}>
            Últimos 7 dias
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 items-end" style={{ height: 80 }}>
          {weekTotals.map(day => {
            const barPct   = (day.calories / weekMax) * 100
            const overMeta = day.calories > dietGoals.calories
            return (
              <div key={day.date} className="flex flex-col items-center gap-1" style={{ height: '100%' }}>
                <div className="flex-1 w-full flex items-end" style={{ minHeight: 0 }}>
                  <div
                    title={`${day.label}: ${Math.round(day.calories)} kcal`}
                    style={{
                      width: '100%',
                      height: barPct > 0 ? `${Math.max(barPct, 5)}%` : '5%',
                      borderRadius: '4px 4px 2px 2px',
                      background: day.isToday
                        ? (overMeta ? 'linear-gradient(180deg,#f87171,#ef4444)' : 'linear-gradient(180deg,var(--color-primary-light),var(--color-primary))')
                        : overMeta ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)',
                      border:     `1px solid ${day.isToday ? P : BORDER}`,
                      boxShadow:  day.isToday ? '0 0 8px var(--color-primary-glow)' : 'none',
                      transition: 'height .4s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: 9.5, color: day.isToday ? P : TT, fontWeight: day.isToday ? 700 : 400, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                  {day.isToday ? 'hoje' : day.label}
                </div>
                {day.calories > 0 && (
                  <div style={{ fontSize: 8.5, color: TT, fontFamily: 'var(--font-jetbrains)', lineHeight: 1 }}>
                    {Math.round(day.calories / 1000 * 10) / 10}k
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 10, color: TT, marginTop: 8, textAlign: 'right' }}>
          Meta: <span style={{ color: P, fontFamily: 'var(--font-jetbrains)', fontWeight: 600 }}>{dietGoals.calories} kcal/dia</span>
        </div>
      </section>

      {/* ── MODAL ─────────────────────────────────────────────── */}
      {modalMeal && (
        <AddFoodModal
          mealId={modalMeal}
          mealLabel={customMeals.find(m => m.id === modalMeal)?.label ?? modalMeal}
          meals={customMeals}
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

// ════════════════════════════════════════════════════════════════════
//  MODAL — Adicionar alimento
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
  // ── auto-calc mode (food selected from DB) ──────────────────
  const [selectedFood, setSelectedFood] = useState<FoodDBItem | null>(null)
  const [grams,        setGrams]        = useState(100)
  const [search,       setSearch]       = useState('')
  const [activeMeal,   setActiveMeal]   = useState(mealId)

  // ── manual mode ─────────────────────────────────────────────
  const [draft,      setDraft]      = useState({ name: '', quantity: '', calories: '', protein: '', carbs: '', fat: '' })
  const [showMacros, setShowMacros] = useState(false)

  const autoMode = selectedFood !== null

  // Computed values (auto mode)
  const mult    = grams / 100
  const compCal = selectedFood ? Math.round(selectedFood.cal * mult) : 0
  const compP   = selectedFood ? +(selectedFood.p * mult).toFixed(1)  : 0
  const compC   = selectedFood ? +(selectedFood.c * mult).toFixed(1)  : 0
  const compF   = selectedFood ? +(selectedFood.f * mult).toFixed(1)  : 0

  // Search results
  const searchResults = search.trim() ? searchFoods(search, 8) : []

  const manualValid = draft.name.trim().length > 0
    && Number.isFinite(parseFloat(draft.calories))
    && parseFloat(draft.calories) > 0
  const canAdd = autoMode ? grams > 0 : manualValid

  function pickFood(food: FoodDBItem) {
    setSelectedFood(food)
    setGrams(food.serving ?? 100)
    setSearch('')
  }

  function applyRecent(f: FoodEntry) {
    setSelectedFood(null)
    setDraft({
      name:     f.name,
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
      onAdd({
        name:     selectedFood.name,
        quantity: `${grams} g`,
        calories: compCal,
        protein:  compP || undefined,
        carbs:    compC || undefined,
        fat:      compF || undefined,
        meal:     activeMeal,
        date:     today(),
      })
    } else {
      if (!manualValid) return
      onAdd({
        name:     draft.name.trim(),
        quantity: draft.quantity.trim() || '1 porção',
        calories: parseFloat(draft.calories),
        protein:  draft.protein ? parseFloat(draft.protein) : undefined,
        carbs:    draft.carbs   ? parseFloat(draft.carbs)   : undefined,
        fat:      draft.fat     ? parseFloat(draft.fat)     : undefined,
        meal:     activeMeal,
        date:     today(),
      })
    }
  }

  return (
    <Modal open={true} onClose={onClose} title={`Adicionar — ${mealLabel}`}>
      <div className="space-y-4">

        {/* ── Busca no banco de dados ──────────────────────────── */}
        <div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: TT, pointerEvents: 'none' }} />
            <input
              className="input"
              style={{ paddingLeft: 32 }}
              placeholder="Buscar alimento... (ex: frango, aveia)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: TT, cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Resultados de busca */}
          {searchResults.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {searchResults.map(f => (
                <button
                  key={f.id}
                  onClick={() => pickFood(f)}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={{ background: PM, border: `1px solid ${PB}`, color: TM, cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = P}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = PB}
                >
                  {f.name}
                  <span style={{ color: P, fontFamily: 'var(--font-jetbrains)', marginLeft: 4 }}>{f.cal}kcal/100g</span>
                </button>
              ))}
            </div>
          )}

          {/* Sugestões rápidas (sem busca ativa) */}
          {!search && (
            <div className="mt-2">
              <div style={{ fontSize: 10, color: TT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>Sugestões rápidas</div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK.map(s => (
                  <button
                    key={s.id}
                    onClick={() => pickFood(s as FoodDBItem)}
                    className="px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all"
                    style={{ background: BG3, border: `1px solid ${BORDER}`, color: TM, cursor: 'pointer' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = PM; el.style.borderColor = PB }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = BG3; el.style.borderColor = BORDER }}
                  >
                    {s.name} <span style={{ color: TT, fontFamily: 'var(--font-jetbrains)' }}>· {s.cal}kcal</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Últimos usados */}
          {!search && recentFoods.length > 0 && (
            <div className="mt-3">
              <div style={{ fontSize: 10, color: TT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>Últimos usados</div>
              <div className="flex flex-wrap gap-1.5">
                {recentFoods.map(f => (
                  <button
                    key={f.id}
                    onClick={() => applyRecent(f)}
                    className="px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all"
                    style={{ background: 'rgba(var(--color-primary-rgb),0.06)', border: `1px solid ${PB}`, color: TM, cursor: 'pointer' }}
                  >
                    {f.name} <span style={{ color: TT, fontFamily: 'var(--font-jetbrains)' }}>· {Math.round(f.calories)}kcal</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Refeição ─────────────────────────────────────────── */}
        <div>
          <label style={{ fontSize: 12, color: TT, display: 'block', marginBottom: 6 }}>Refeição</label>
          <Select
            value={activeMeal}
            onChange={v => setActiveMeal(v)}
            options={meals.map(m => ({ value: m.id, label: m.label }))}
          />
        </div>

        {/* ── AUTO MODE: food selecionado + grams ──────────────── */}
        {autoMode && selectedFood && (
          <div className="rounded-xl p-3.5 space-y-3" style={{ background: BG3, border: `1px solid ${PB}` }}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TM }}>{selectedFood.name}</div>
                <div style={{ fontSize: 10, color: TT, marginTop: 1 }}>
                  {selectedFood.cal} kcal · {selectedFood.p}g P · {selectedFood.c}g C · {selectedFood.f}g G — por 100 g
                </div>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                style={{ color: TT, cursor: 'pointer', flexShrink: 0 }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TM)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
                title="Desfazer seleção"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: 11, color: TT, display: 'block', marginBottom: 5 }}>
                Quantidade (g) — valores são recalculados automaticamente
              </label>
              <input
                type="number"
                className="input"
                inputMode="numeric"
                min={1}
                value={grams}
                onChange={e => setGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
                onKeyDown={e => { if (e.key === 'Enter' && canAdd) handleAdd() }}
              />
            </div>

            {/* Preview calculado */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Calorias', value: `${compCal} kcal`, color: P                 },
                { label: 'Proteína', value: `${compP} g`,       color: MC.protein.fill  },
                { label: 'Carb',     value: `${compC} g`,       color: MC.carbs.fill    },
                { label: 'Gordura',  value: `${compF} g`,       color: MC.fat.fill      },
              ].map(item => (
                <div key={item.label} className="rounded-lg p-2 text-center" style={{ background: BG2, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 9, color: TT, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: item.color, fontFamily: 'var(--font-jetbrains)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MANUAL MODE ──────────────────────────────────────── */}
        {!autoMode && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
              <div>
                <label style={{ fontSize: 12, color: TT, display: 'block', marginBottom: 6 }}>Alimento</label>
                <input
                  className="input"
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
                onKeyDown={e => { if (e.key === 'Enter' && canAdd) handleAdd() }}
              />
            </div>
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
                  {([
                    { key: 'protein' as const, label: 'Proteína (g)', color: MC.protein.fill },
                    { key: 'carbs'   as const, label: 'Carb (g)',     color: MC.carbs.fill   },
                    { key: 'fat'     as const, label: 'Gordura (g)',  color: MC.fat.fill     },
                  ]).map(m => (
                    <div key={m.key}>
                      <label style={{ fontSize: 10, color: m.color, display: 'block', marginBottom: 4, fontWeight: 600 }}>{m.label}</label>
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
          </div>
        )}

        {/* ── Botão adicionar ───────────────────────────────────── */}
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: canAdd ? P   : BG3,
            color:      canAdd ? '#000' : TT,
            boxShadow:  canAdd ? '0 0 18px var(--color-primary-glow)' : 'none',
            cursor:     canAdd ? 'pointer' : 'not-allowed',
            opacity:    canAdd ? 1 : 0.6,
            border: `1px solid ${canAdd ? P : BORDER}`,
          }}
        >
          <Plus size={15} /> Adicionar alimento
        </button>
      </div>
    </Modal>
  )
}
