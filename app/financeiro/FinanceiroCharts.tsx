'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Area, AreaChart, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '@/lib/utils'

type CatData = { name: string; key: string; value: number; color: string }
type EvolutionData = { month: string; entradas: number; saidas: number; saldo: number }

type Props = {
  catData: CatData[]
  evolutionData: EvolutionData[]
  hideValues: boolean
}

export default function FinanceiroCharts({ catData, evolutionData, hideValues }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      <div className="rounded-2xl p-5"
        style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-white font-semibold mb-4">Gastos por Categoria</h3>
        {catData.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">Nenhuma despesa registrada</p>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value" strokeWidth={0}>
                  {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => [hideValues ? '****' : formatCurrency(v), '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {catData.map(c => (
                <div key={c.key} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                  <span className="text-xs text-gray-500 flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-white font-semibold">{hideValues ? '**' : formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-5"
        style={{ background: 'var(--bg1)', backdropFilter: 'blur(var(--blur))', WebkitBackdropFilter: 'blur(var(--blur))', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-white font-semibold mb-4">Evolucao - 12 meses</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={evolutionData}>
            <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: 12 }}
              formatter={(v: number) => [hideValues ? '****' : formatCurrency(v), '']}
            />
            <defs>
              <linearGradient id="entGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="saiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="entradas" stroke="var(--color-primary)" fill="url(#entGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="saidas" stroke="var(--color-primary)" fill="url(#saiGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
