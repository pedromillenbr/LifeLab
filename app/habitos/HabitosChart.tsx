'use client'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts'

type Props = {
  /** Cobre todo o mês: 1..30/31. Dias futuros vêm com pct = null. */
  progressData: { day: number; pct: number | null }[]
  completionPct: number
  monthLabel?: string
}

export default function HabitosChart({ progressData, completionPct, monthLabel }: Props) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(completionPct) ? completionPct : 0))

  // Calcula posição do dia atual + delimita as 4 "semanas" do mês p/ checkpoints visíveis.
  const now = new Date()
  const daysInMonth = progressData.length > 0
    ? progressData.length
    : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = Math.min(now.getDate(), daysInMonth)
  const todayPct = (dayOfMonth / daysInMonth) * 100
  // 4 segmentos iguais para "S1..S4"
  const segmentSize = 100 / 4
  const currentSegment = Math.min(3, Math.floor(((dayOfMonth - 1) / daysInMonth) * 4))

  return (
    <div className="rounded-lg p-5 mb-5 animate-fade-in"
      style={{ 
        background: 'var(--color-bg-2)', 
        border: '1px solid rgba(var(--color-accent-rgb), 0.25)', 
        boxShadow: 'var(--shadow-card), 0 0 20px rgba(var(--color-accent-rgb), 0.1)', 
        animationDelay: '180ms' 
      }}>
      {/* Barra de Progresso Premium Contínua */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--gold)', fontSize: 16 }}>✦</span>
            <h3 style={{ color: 'var(--color-text-main)', fontWeight: 600, fontSize: 13 }}>Progresso Contínuo</h3>
          </div>
          <span style={{ fontSize: 42, fontWeight: 800, color: 'var(--gold)', textShadow: '0 0 20px rgba(var(--color-accent-rgb), 0.4)' }}>
            {pct}%
          </span>
        </div>
        {/* Barra de progresso com checkpoints semanais visíveis */}
        <div style={{ position: 'relative', paddingTop: 4, paddingBottom: 22 }}>
          <div
            className="w-full rounded-full overflow-hidden relative"
            style={{
              height: 12,
              background: 'var(--color-bg-4)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxSizing: 'border-box',
            }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Highlight da semana atual (atrás do fill) */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 pointer-events-none"
              style={{
                left: `${currentSegment * segmentSize}%`,
                width: `${segmentSize}%`,
                background: 'linear-gradient(180deg, rgba(var(--color-accent-rgb),0.18) 0%, rgba(var(--color-accent-rgb),0.08) 100%)',
                borderLeft: '1px dashed rgba(var(--color-accent-rgb), 0.5)',
                borderRight: '1px dashed rgba(var(--color-accent-rgb), 0.5)',
              }}
            />
            {/* Divisores das 4 semanas (visíveis) */}
            <div className="absolute inset-0 flex pointer-events-none" aria-hidden="true">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ borderRight: '1px solid rgba(255,255,255,0.18)' }}
                />
              ))}
              <div className="flex-1" />
            </div>
            {pct > 0 && (
              <div
                className="rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 40%, var(--gold) 100%)',
                  boxShadow: '0 0 12px rgba(var(--color-accent-rgb), 0.45), inset 0 0 6px rgba(255,255,255,0.08)',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            )}
            {/* Marcador "HOJE" — pin vertical pulsante */}
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                left: `${todayPct}%`,
                top: -3,
                bottom: -3,
                width: 2,
                marginLeft: -1,
                background: 'var(--gold)',
                boxShadow: '0 0 8px rgba(var(--color-accent-rgb), 0.9), 0 0 16px rgba(var(--color-accent-rgb), 0.5)',
                borderRadius: 2,
                zIndex: 2,
              }}
            />
            <div
              aria-hidden="true"
              className="absolute pointer-events-none animate-ping"
              style={{
                left: `${todayPct}%`,
                top: '50%',
                width: 8,
                height: 8,
                marginLeft: -4,
                marginTop: -4,
                borderRadius: 999,
                background: 'var(--gold)',
                opacity: 0.4,
                zIndex: 2,
              }}
            />
          </div>
          {/* Labels das semanas (S1..S4) abaixo dos divisores */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 flex pointer-events-none"
            style={{ top: 'calc(100% - 18px)' }}
          >
            {[1, 2, 3, 4].map(w => {
              const isCurrent = (w - 1) === currentSegment
              return (
                <div
                  key={w}
                  className="flex-1 text-center"
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isCurrent ? 'var(--gold)' : 'rgba(255,255,255,0.32)',
                    letterSpacing: 1,
                    textShadow: isCurrent ? '0 0 6px rgba(var(--color-accent-rgb), 0.6)' : 'none',
                  }}
                >
                  S{w}
                </div>
              )
            })}
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span>{monthLabel ?? 'Mês corrente'} • Reinicia todo dia 1º</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--gold)', boxShadow: '0 0 6px var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
              Hoje · dia {dayOfMonth}/{daysInMonth}
            </span>
          </span>
        </p>
      </div>

      {/* Gráfico de área — eixo X cobre o mês inteiro */}
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={progressData} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="day"
            type="number"
            domain={[1, daysInMonth]}
            ticks={Array.from(new Set([1, 5, 10, 15, 20, 25, daysInMonth])).filter(t => t <= daysInMonth)}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={false} tickLine={false}
            allowDecimals={false}
          />
          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-bg-2)', border: '1px solid rgba(var(--color-accent-rgb), 0.3)', borderRadius: 10, color: '#fff', fontSize: 12 }}
            formatter={(v: number | null) => v === null ? ['—', 'Futuro'] : [`${v}%`, 'Conclusão']}
            labelFormatter={(d) => `Dia ${d}`}
          />
          <defs>
            <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}    />
            </linearGradient>
          </defs>
          {/* Linha vertical em "hoje" — separa passado de futuro */}
          <ReferenceLine
            x={dayOfMonth}
            stroke="var(--gold)"
            strokeWidth={1}
            strokeDasharray="3 3"
            label={{
              value: 'hoje',
              position: 'top',
              fill: 'var(--gold)',
              fontSize: 9,
              fontWeight: 700,
            }}
          />
          <Area
            type="monotone"
            dataKey="pct"
            stroke="var(--color-primary)"
            fill="url(#habitGrad)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
