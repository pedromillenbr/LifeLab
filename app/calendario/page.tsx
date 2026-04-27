'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Plus, Calendar, Dumbbell, Star, X } from 'lucide-react'
import { cn, getDaysInMonth, getFirstDayOfMonth, today } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type ViewMode = 'mes' | 'semana'

const P = 'var(--color-primary)'
const PM = 'var(--color-primary-muted)'
const PB = 'var(--color-primary-border)'
const BG1 = 'var(--color-bg-1)'
const BG2 = 'var(--color-bg-2)'
const BORDER = 'var(--color-border)'
const TM = 'var(--color-text-main)'
const TT = 'var(--color-text-muted)'

export default function CalendarioPage() {
  const { calendarEvents, addCalendarEvent, removeCalendarEvent } = useStore()
  const [view, setView] = useState<ViewMode>('mes')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'custom' as 'treino' | 'custom', date: '' })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const todayStr = today()

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  function getDateStr(cellIdx: number): string {
    const dayNum = cellIdx - firstDay + 1
    if (dayNum < 1 || dayNum > daysInMonth) return ''
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
  }

  function openAddEvent(date: string) {
    setForm({ title: '', type: 'custom', date })
    setShowModal(true)
  }

  function handleAdd() {
    if (!form.title.trim() || !form.date) return
    addCalendarEvent({ title: form.title, type: form.type, date: form.date })
    setShowModal(false)
  }

  const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7))
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const EVENT_COLORS = {
    treino: { bg: `${P}20`, border: `${P}40`, text: P, icon: Dumbbell },
    custom: { bg: `${P}20`, border: `${P}40`, text: P, icon: Star },
  }

  return (
    <motion.div 
      className="p-6 max-w-[1400px] mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.p
            className="slabel"
            style={{ marginBottom: 4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >Agenda</motion.p>
          <motion.h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              fontWeight: 800,
              color: TM,
              letterSpacing: '-0.02em',
              textShadow: `0 0 20px ${P}60, 0 0 40px ${P}40`
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Calendário
          </motion.h1>
          <motion.p
            style={{ color: TT, fontSize: 13, marginTop: 4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >Sua agenda inteligente integrada</motion.p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <motion.div
            className="flex rounded-xl overflow-hidden"
            style={{ border: `1px solid ${BORDER}`, background: BG2 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {(['mes', 'semana'] as ViewMode[]).map((v, idx) => (
              <motion.button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-2 text-sm font-semibold transition-all duration-200"
                style={view === v
                  ? { background: P, color: '#fff', boxShadow: `inset 0 0 12px ${P}40` }
                  : { color: TT }
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                {v === 'mes' ? 'Mês' : 'Semana'}
              </motion.button>
            ))}
          </motion.div>
          <Button onClick={() => openAddEvent(todayStr)}>
            <Plus size={16} /> Evento
          </Button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/5"
            style={{ background: BG2, border: `1px solid ${BORDER}` }}>
            <ChevronLeft size={16} style={{ color: TT }} />
          </button>
          <span className="text-lg font-semibold capitalize" style={{ color: TM }}>
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/5"
            style={{ background: BG2, border: `1px solid ${BORDER}` }}>
            <ChevronRight size={16} style={{ color: TT }} />
          </button>
        </motion.div>
        <div className="flex items-center gap-4 text-xs" style={{ color: TT }}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: P, boxShadow: `0 0 6px ${P}` }} /> Treino
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: P, boxShadow: `0 0 6px ${P}` }} /> Evento
          </span>
        </div>
      </div>

      {/* Month View */}
      {view === 'mes' && (
        <motion.div 
          className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${BORDER}`, background: BG1 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-7" style={{ background: BG2, borderBottom: `1px solid ${BORDER}` }}>
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs py-3 font-semibold tracking-wide" style={{ color: TT }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7" style={{ background: BG1 }}>
            {Array.from({ length: totalCells }, (_, i) => {
              const dateStr = getDateStr(i)
              const dayNum = i - firstDay + 1
              const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
              const isToday = dateStr === todayStr
              const events = dateStr ? calendarEvents.filter(e => e.date === dateStr) : []
              return (
                <motion.div 
                  key={i} 
                  onClick={() => dateStr && openAddEvent(dateStr)}
                  className="min-h-[90px] p-2 cursor-pointer"
                  style={{
                    borderRight: `1px solid ${BORDER}`,
                    borderBottom: `1px solid ${BORDER}`,
                    opacity: isCurrentMonth ? 1 : 0.25,
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.div
                    className="mb-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <motion.span
                      className={cn(
                        'text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium transition-all',
                        isToday ? 'text-white font-bold' : isCurrentMonth ? 'text-gray-400' : 'text-gray-700'
                      )}
                      style={isToday ? {
                        background: P,
                        boxShadow: `0 0 16px ${P}60, 0 0 32px ${P}30`
                      } : {}}
                      whileHover={isCurrentMonth ? { scale: 1.15 } : {}}
                    >
                      {isCurrentMonth ? dayNum : ''}
                    </motion.span>
                  </motion.div>
                  <motion.div
                    className="space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {events.slice(0, 2).map((event, idx) => {
                      const c = EVENT_COLORS[event.type]
                      const Icon = c.icon
                      return (
                        <motion.div
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); removeCalendarEvent(event.id) }}
                          className="text-[10px] px-1.5 py-1 rounded-md truncate flex items-center gap-1 cursor-pointer transition-all"
                          style={{
                            background: c.bg,
                            border: `1px solid ${c.border}`,
                            color: c.text,
                            boxShadow: `0 0 8px ${c.text}20`
                          }}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + idx * 0.05 }}
                          whileHover={{
                            scale: 1.08,
                            boxShadow: `0 0 16px ${c.text}50, 0 0 24px ${c.text}30`
                          }}
                        >
                          <Icon size={8} />
                          <span className="truncate">{event.title}</span>
                        </motion.div>
                      )
                    })}
                    {events.length > 2 && (
                      <motion.p
                        className="text-[10px]"
                        style={{ color: TT }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        +{events.length - 2}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Week View */}
      {view === 'semana' && (
        <motion.div 
          className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${BORDER}`, background: BG1 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-8" style={{ background: BG2, borderBottom: `1px solid ${BORDER}` }}>
            <div className="py-3 px-3 text-xs" style={{ color: TT }} />
            {weekDays.map((d, i) => {
              const isToday = d === todayStr
              const day = new Date(d + 'T12:00:00')
              return (
                <motion.div
                  key={d}
                  className="py-3 text-center"
                  style={{ borderLeft: `1px solid ${BORDER}` }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <motion.p
                    className="text-xs"
                    style={{ color: TT }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >{DAY_NAMES[i]}</motion.p>
                  <motion.p
                    className="text-lg font-black mt-0.5"
                    style={isToday ? {
                      color: P,
                      textShadow: `0 0 16px ${P}60, 0 0 32px ${P}30`
                    } : { color: '#9ca3af' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {day.getDate()}
                  </motion.p>
                  <motion.div
                    className="flex flex-col gap-0.5 mt-1.5 px-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    {calendarEvents.filter(e => e.date === d).map((event, idx) => {
                      const c = EVENT_COLORS[event.type]
                      return (
                        <motion.div
                          key={event.id}
                          className="text-[9px] px-1 py-0.5 rounded truncate transition-all"
                          style={{
                            background: c.bg,
                            color: c.text,
                            boxShadow: `0 0 6px ${c.text}20`
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.05 + idx * 0.03 }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: `0 0 12px ${c.text}50`
                          }}
                        >
                          {event.title}
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
          <div className="overflow-y-auto max-h-[480px]" style={{ background: BG1 }}>
            {hours.map(h => (
              <div key={h} className="grid grid-cols-8 min-h-[44px]" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="px-3 py-2 text-[10px]" style={{ color: TT }}>{String(h).padStart(2, '0')}:00</div>
                {weekDays.map(d => (
                  <div key={d} onClick={() => openAddEvent(d)}
                    className="cursor-pointer transition-all duration-150"
                    style={{ borderLeft: `1px solid ${BORDER}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#ffffff02')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Event Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal open={showModal} onClose={() => setShowModal(false)} title={
            <motion.span
              style={{ textShadow: `0 0 16px ${P}70` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Novo Evento
            </motion.span>
          }>
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="slabel mb-2 block">Título</label>
                <motion.input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Nome do evento"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:outline-none"
                  style={{ background: BG2, border: `1px solid ${BORDER}`, color: TM }}
                  autoFocus
                  initial={{ borderColor: BORDER }}
                  whileFocus={{
                    borderColor: P,
                    boxShadow: `0 0 16px ${P}40`
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="slabel mb-2 block">Tipo</label>
                <div className="flex gap-2">
                  {(['treino', 'custom'] as const).map((t, idx) => (
                    <motion.button
                      key={t}
                      onClick={() => setForm({ ...form, type: t })}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + idx * 0.05 }}
                      style={form.type === t
                        ? { background: P, color: '#fff', boxShadow: `0 0 16px ${P}50` }
                        : { background: BG2, border: `1px solid ${BORDER}`, color: TT }
                      }
                      whileHover={{ scale: 1.02 }}
                    >
                      {t === 'treino' ? <Dumbbell size={14} /> : <Star size={14} />}
                      {t === 'treino' ? 'Treino' : 'Evento'}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="slabel mb-2 block">Data</label>
                <motion.input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:outline-none"
                  style={{ background: BG2, border: `1px solid ${BORDER}`, color: TM }}
                  whileFocus={{
                    borderColor: P,
                    boxShadow: `0 0 16px ${P}40`
                  }}
                />
              </motion.div>

              <motion.div
                className="flex gap-3 pt-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleAdd} className="flex-1">
                  Adicionar
                </Button>
              </motion.div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
