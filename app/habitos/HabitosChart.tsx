'use client'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

type Props = {
  progressData: { day: number; pct: number }[]
  completionPct: number
  monthLabel?: string  // e.g. 'Maio · 2026' — shown under the progress bar
}

export default function HabitosChart({ progressData, completionPct, monthLabel }: Props) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(completionPct) ? completionPct : 0))
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
        {/* Barra de progresso com segmento dourado */}
        <div
          className="w-full rounded-full overflow-hidden relative"
          style={{
            height: 10,
            background: 'var(--color-bg-4)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxSizing: 'border-box',
          }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Marcadores de segmento semanal (atrás do fill) */}
          <div className="absolute inset-0 flex pointer-events-none" aria-hidden="true">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-white/5 last:border-r-0" />
            ))}
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
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8, fontWeight: 500 }}>
          {monthLabel ?? 'Mês corrente'} • Reinicia todo dia 1º
        </p>
      </div>

      {/* Gráfico de área */}
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={progressData}>
          <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
          <YAxis domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-bg-2)', border: '1px solid rgba(var(--color-accent-rgb), 0.3)', borderRadius: 10, color: '#fff', fontSize: 12 }}
            formatter={(v: number) => [`${v}%`, 'Conclusão']}
          />
          <defs>
            <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="pct" stroke="var(--color-primary)" fill="url(#habitGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
