'use client'

interface GoalProgressRingProps {
  pct: number               // 0–100
  size?: number             // px
  thickness?: number        // px
  color: string             // hex/rgb da cor de progresso
  trackColor?: string
  /** Conteúdo central (% + label, ou número absoluto). */
  children?: React.ReactNode
  /** Animar o arco ao mudar pct. */
  animate?: boolean
}

/**
 * Anel de progresso premium com gradient + glow + pulso sutil ao 100%.
 * SVG puro, sem dependências.
 */
export function GoalProgressRing({
  pct, size = 160, thickness = 10,
  color, trackColor = 'rgba(255,255,255,.06)',
  children, animate = true,
}: GoalProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, pct))
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c
  const isDone = clamped >= 100
  const gradId = `ring-${color.replace(/[^a-z0-9]/gi, '')}`

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={trackColor} strokeWidth={thickness}
        />
        {/* Arco de progresso */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            filter: `drop-shadow(0 0 8px ${color}aa) drop-shadow(0 0 16px ${color}55)`,
            transition: animate ? 'stroke-dashoffset 0.9s cubic-bezier(.22,1,.36,1)' : undefined,
          }}
        />
        {/* Pulso ao bater 100% */}
        {isDone && (
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={thickness * 0.6}
            opacity="0.4"
            style={{
              animation: 'goalRingPulse 1.8s ease-in-out infinite',
              transformOrigin: `${size / 2}px ${size / 2}px`,
            }}
          />
        )}
      </svg>
      {/* Conteúdo central */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 8,
        }}
      >
        {children}
      </div>
      <style jsx>{`
        @keyframes goalRingPulse {
          0%, 100% { opacity: .35; transform: scale(1); }
          50%      { opacity: .05; transform: scale(1.07); }
        }
      `}</style>
    </div>
  )
}
