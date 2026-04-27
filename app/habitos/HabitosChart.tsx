'use client'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

type Props = {
  progressData: { day: number; pct: number }[]
  completionPct: number
}

export default function HabitosChart({ progressData, completionPct }: Props) {
  return (
    <div className="rounded-lg p-5 mb-5 animate-fade-in"
      style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)', animationDelay: '180ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-primary)', fontSize: 16 }}>↗</span>
          <h3 style={{ color: 'var(--color-text-main)', fontWeight: 600, fontSize: 14 }}>Progresso Geral — 30 dias</h3>
        </div>
        <span className="score-num" style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-primary)', textShadow: '0 0 20px var(--color-primary-glow)' }}>
          {completionPct}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={progressData}>
          <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
          <YAxis domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-bg-2)', border: '1px solid var(--color-primary-border)', borderRadius: 10, color: '#fff', fontSize: 12 }}
            formatter={(v: number) => [`${v}%`, 'Conclusão']}
          />
          <defs>
            <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="pct" stroke="#10b981" fill="url(#habitGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
