'use client'

import { useEffect, useState } from 'react'

interface AnimatedRadarProps {
  /** values 0..100 in order matching `labels` */
  values: number[]
  labels: string[]
  /** central score (already calculated) */
  score: number
}

export function AnimatedRadar({ values, labels, score }: AnimatedRadarProps) {
  const [sonarKey, setSonarKey] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSonarKey(k => k + 1), 5000)
    return () => clearInterval(t)
  }, [])

  const cx = 110, cy = 110, r = 70
  const n = labels.length
  const norm = values.map(v => Math.max(0, Math.min(1, v / 100)))
  const pts = norm.map((v, i) => {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2
    return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v]
  })
  const gridPts = (f: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 / n) * i - Math.PI / 2
      return `${cx + Math.cos(a) * r * f},${cy + Math.sin(a) * r * f}`
    }).join(' ')

  const particles = [
    { cx: 90, cy: 75, r: 1.5, delay: '0s' },
    { cx: 140, cy: 85, r: 1, delay: '.6s' },
    { cx: 75, cy: 130, r: 1.5, delay: '1.1s' },
    { cx: 150, cy: 135, r: 1, delay: '.3s' },
    { cx: 110, cy: 165, r: 1.5, delay: '.8s' },
    { cx: 60, cy: 100, r: 1, delay: '1.5s' },
  ]

  return (
    <svg width="220" height="220" viewBox="0 0 220 220" style={{ overflow: 'visible' }}>
      {[0.3, 0.55, 0.8, 1].map(f => (
        <polygon key={f} points={gridPts(f)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const a = (Math.PI * 2 / n) * i - Math.PI / 2
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        )
      })}
      <polygon className="radar-fill-anim" points={pts.map(p => p.join(',')).join(' ')} style={{ fill: 'var(--g12)' }} stroke="none" />
      <polygon className="radar-animated" points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="var(--green)" strokeWidth="1.8" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="var(--green)"
          style={{ animation: `radarPoly 2.5s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
      {particles.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="var(--green)"
          style={{ opacity: 0.4, animation: `dotPulseHdr 2s ease-in-out ${p.delay} infinite` }} />
      ))}
      <circle key={sonarKey} cx={cx} cy={cy} r="8" className="sonar-circle" />
      {labels.map((l, i) => {
        const a = (Math.PI * 2 / n) * i - Math.PI / 2
        return (
          <text key={i}
            x={cx + Math.cos(a) * (r + 20)}
            y={cy + Math.sin(a) * (r + 20)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="Inter">
            {l}
          </text>
        )
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="24" fontWeight="700"
        fill="white" fontFamily="JetBrains Mono, monospace"
        style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,.3))' }}>
        {score}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.35)" fontFamily="Inter">
        score
      </text>
    </svg>
  )
}
