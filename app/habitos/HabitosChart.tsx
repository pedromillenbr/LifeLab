'use client'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

type Props = {
  progressData: { day: number; pct: number }[]
  completionPct: number
}

export default function HabitosChart({ progressData, completionPct }: Props) {
  return (
    <div className="rounded-lg p-5 mb-5 animate-fade-in"
      style={{ 
        background: 'var(--color-bg-2)', 
        border: '1px solid rgba(234,179,8,0.25)', 
        boxShadow: 'var(--shadow-card), 0 0 20px rgba(234,179,8,0.1)', 
        animationDelay: '180ms' 
      }}>
      {/* Barra de Progresso Premium Contínua */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ color: '#facc15', fontSize: 16 }}>✦</span>
            <h3 style={{ color: 'var(--color-text-main)', fontWeight: 600, fontSize: 14 }}>Progresso Contínuo</h3>
          </div>
          <span className="score-num" style={{ fontSize: 36, fontWeight: 800, color: '#facc15', textShadow: '0 0 20px rgba(234,179,8,0.5)' }}>
            {completionPct}%
          </span>
        </div>
        {/* Barra de progresso com segmento dourado */}
        <div className="h-2 rounded-full bg-[var(--color-bg-4)] overflow-hidden relative">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${completionPct}%`,
              background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #facc15 100%)',
              boxShadow: '0 0 12px 2px rgba(234,179,8,0.4), 0 0 8px rgba(34,197,94,0.5)',
              animation: 'progressFill 1.5s ease-out'
            }}
          />
          {/* Marcadores de segmento semanal */}
          <div className="absolute inset-0 flex">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-white/10 last:border-r-0" />
            ))}
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
          Progresso desde o onboarding • Segmentado por semana
        </p>
      </div>

      {/* Gráfico de área */}
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={progressData}>
          <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
          <YAxis domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-bg-2)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, color: '#fff', fontSize: 12 }}
            formatter={(v: number) => [`${v}%`, 'Conclusão']}
          />
          <defs>
            <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#facc15" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="pct" stroke="#10b981" fill="url(#habitGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
