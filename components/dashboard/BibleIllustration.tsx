'use client'

export function BibleIllustration() {
  const rays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
  return (
    <svg className="bible-svg" width="130" height="200" viewBox="0 0 130 200" fill="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="bookGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <filter id="crossGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {rays.map((angle, i) => (
        <rect key={i} x="62" y="-55" width="3" height="90" rx="1.5"
          fill="rgba(var(--color-accent-rgb), 0.07)"
          style={{
            transformOrigin: '64px 81px',
            transform: `rotate(${angle}deg)`,
            animation: `godRay ${2.5 + i * 0.15}s ease-in-out ${i * 0.12}s infinite`,
            ['--ray-r' as any]: `${angle}deg`,
          }} />
      ))}
      {[0, 1, 2, 3, 4].map(i => (
        <circle key={i} cx={36 + i * 12} r="1.5" fill="rgba(var(--color-accent-rgb), 0.6)">
          <animate attributeName="cy" from="148" to="108" dur={`${2 + i * 0.4}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.6;0" dur={`${2 + i * 0.4}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <rect x="20" y="18" width="88" height="134" rx="7" fill="rgba(0,0,0,0.4)" />
      <rect x="16" y="14" width="88" height="134" rx="7" fill="#152219" />
      <rect x="16" y="14" width="88" height="134" rx="7" fill="url(#bookGrad)" />
      <rect x="16" y="14" width="16" height="134" rx="5" fill="#1e2e22" />
      <rect x="28" y="14" width="2" height="134" fill="rgba(0,0,0,0.25)" />
      <line x1="22" y1="24" x2="22" y2="138" stroke="rgba(var(--color-accent-rgb), 0.4)" strokeWidth="1.2" />
      <rect x="102" y="16" width="4" height="130" rx="1" fill="rgba(255,255,255,0.05)" />
      <rect x="16" y="14" width="88" height="4" rx="3" fill="rgba(var(--color-accent-rgb), 0.22)" />
      <rect x="16" y="144" width="88" height="4" rx="3" fill="rgba(var(--color-accent-rgb), 0.22)" />
      <rect x="16" y="14" width="88" height="134" rx="7" fill="none" stroke="rgba(var(--color-accent-rgb), 0.5)" strokeWidth="1.4" />
      <rect x="34" y="26" width="62" height="110" rx="4" fill="none" stroke="rgba(var(--color-accent-rgb), 0.14)" strokeWidth="1" />
      <rect x="61" y="44" width="10" height="54" rx="3.5" fill="rgba(var(--color-accent-rgb), 0.95)" filter="url(#crossGlow)" />
      <rect x="44" y="60" width="44" height="10" rx="3.5" fill="rgba(var(--color-accent-rgb), 0.95)" filter="url(#crossGlow)" />
      <rect x="61" y="44" width="10" height="54" rx="3.5" fill="rgba(var(--color-accent-rgb), 0.3)" style={{ filter: 'blur(8px)' }} />
      <rect x="44" y="60" width="44" height="10" rx="3.5" fill="rgba(var(--color-accent-rgb), 0.3)" style={{ filter: 'blur(8px)' }} />
      <rect x="42" y="108" width="48" height="5" rx="2.5" fill="rgba(var(--color-accent-rgb), 0.38)" />
      <rect x="48" y="118" width="36" height="4" rx="2" fill="rgba(var(--color-accent-rgb), 0.2)" />
      <rect x="54" y="126" width="24" height="3" rx="1.5" fill="rgba(var(--color-accent-rgb), 0.12)" />
      <path d="M79 14 L79 42 L73 36 L67 42 L67 14 Z" style={{ fill: 'var(--g75)' }} />
      <line x1="73" y1="14" x2="73" y2="42" style={{ stroke: 'var(--g35)' }} strokeWidth="1" />
    </svg>
  )
}
