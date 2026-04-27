'use client'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts'

type Props = {
  volumeChartData: { day: string; vol: number }[]
  weightChartData: { date: string; peso: number }[]
}

export default function FisicoCharts({ volumeChartData, weightChartData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl p-5"
        style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(239,68,68,0.18)' }}>
        <p className="slabel mb-4" style={{ marginBottom: 16 }}>Volume Semanal (toneladas)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={volumeChartData} barCategoryGap="30%">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: 'var(--fg3)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--fg3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(4,10,22,0.95)', border: '1px solid var(--color-primary-border)', borderRadius: '12px', color: '#fff', fontSize: 12, backdropFilter: 'blur(12px)' }} />
            <Bar dataKey="vol" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-5"
        style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(239,68,68,0.18)' }}>
        <p className="slabel mb-4" style={{ marginBottom: 16 }}>Evolução do Peso (kg)</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weightChartData}>
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: 'var(--fg3)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--fg3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(4,10,22,0.95)', border: '1px solid var(--color-primary-border)', borderRadius: '12px', color: '#fff', fontSize: 12, backdropFilter: 'blur(12px)' }} />
            <Area type="monotone" dataKey="peso" stroke="var(--color-primary)" fill="url(#wGrad)" strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
