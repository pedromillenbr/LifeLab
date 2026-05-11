'use client'
import { useState, useEffect, useRef } from 'react'
import type { MuscleGroup } from '@/lib/exercises'
import { MUSCLE_GROUP_LABELS } from '@/lib/exercises'
import {
  INTENSITY_COLOR, INTENSITY_LABEL,
  type MuscleIntensity, type MuscleWeekStats,
} from '@/lib/muscleVolume'

interface MuscleBody3DProps {
  stats: MuscleWeekStats
  height?: number
}

/**
 * Boneco anatômico SVG com rotação frente/costas via CSS 3D.
 * Mais leve e estável que three.js — funciona em qualquer dispositivo.
 * Cada grupo muscular é um path/grupo SVG colorido por intensidade.
 */
export function MuscleBody3D({ stats, height = 380 }: MuscleBody3DProps) {
  const [hovered, setHovered] = useState<MuscleGroup | null>(null)
  const [angle, setAngle] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const dragRef = useRef<{ startX: number; startAngle: number } | null>(null)
  const angleRef = useRef(0)

  // Auto-rotate suave
  useEffect(() => {
    if (!autoRotate) return
    let raf: number
    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last
      last = now
      angleRef.current = (angleRef.current + dt * 0.025) % 360
      setAngle(angleRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [autoRotate])

  // Mantém ref sincronizada quando angle muda externamente (drag)
  useEffect(() => { angleRef.current = angle }, [angle])

  function onPointerDown(e: React.PointerEvent) {
    setAutoRotate(false)
    dragRef.current = { startX: e.clientX, startAngle: angle }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    setAngle(dragRef.current.startAngle + dx * 0.6)
  }
  function onPointerUp(e: React.PointerEvent) {
    dragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    // Retoma auto-rotate após 3s sem interação
    setTimeout(() => setAutoRotate(true), 3000)
  }

  // Normaliza ângulo (0-360) e decide qual lado mostrar
  const norm = ((angle % 360) + 360) % 360
  const showingBack = norm > 90 && norm < 270

  return (
    <div style={{ position: 'relative', height, width: '100%', userSelect: 'none' }}>
      <div
        style={{
          height: '100%', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          perspective: 900, cursor: dragRef.current ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          style={{
            width: 200, height: 340, position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${angle}deg)`,
            transition: dragRef.current ? 'none' : 'transform 50ms linear',
          }}
        >
          <FrontView intensity={stats.intensityByMuscle} onHover={setHovered} dimmed={showingBack} />
          <BackView intensity={stats.intensityByMuscle} onHover={setHovered} dimmed={!showingBack} />
        </div>
      </div>

      {hovered && (
        <div
          style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(15,17,22,.92)',
            border: `1px solid ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}`,
            color: '#fff', fontSize: 12, fontWeight: 600,
            backdropFilter: 'blur(12px)', pointerEvents: 'none',
            boxShadow: `0 0 16px ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}55`,
            whiteSpace: 'nowrap',
          }}
        >
          {MUSCLE_GROUP_LABELS[hovered]} · {stats.setsByMuscle[hovered]} séries · {INTENSITY_LABEL[stats.intensityByMuscle[hovered]]}
        </div>
      )}

      <div
        style={{
          position: 'absolute', bottom: 6, left: 12, right: 12,
          display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
          pointerEvents: 'none',
        }}
      >
        {(['none', 'light', 'intense'] as MuscleIntensity[]).map(level => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,.7)' }}>
            <span
              style={{
                width: 10, height: 10, borderRadius: 999,
                background: INTENSITY_COLOR[level],
                boxShadow: level !== 'none' ? `0 0 8px ${INTENSITY_COLOR[level]}` : 'none',
              }}
            />
            {INTENSITY_LABEL[level]}
          </div>
        ))}
      </div>
    </div>
  )
}

interface ViewProps {
  intensity: Record<MuscleGroup, MuscleIntensity>
  onHover: (m: MuscleGroup | null) => void
  dimmed: boolean
}

function fillFor(level: MuscleIntensity, dimmed: boolean): string {
  const c = INTENSITY_COLOR[level]
  return dimmed ? c : c
}

function glowFor(level: MuscleIntensity): string {
  if (level === 'intense') return 'drop-shadow(0 0 6px #ef444488)'
  if (level === 'light') return 'drop-shadow(0 0 4px #fbbf2466)'
  return 'none'
}

function FrontView({ intensity, onHover, dimmed }: ViewProps) {
  const skin = '#cfd6e2'
  const torso = '#1f2530'

  const muscleProps = (m: MuscleGroup) => ({
    onPointerEnter: () => onHover(m),
    onPointerLeave: () => onHover(null),
    style: {
      fill: fillFor(intensity[m], dimmed),
      filter: glowFor(intensity[m]),
      cursor: 'pointer',
      transition: 'fill 0.4s ease, filter 0.4s ease',
    } as React.CSSProperties,
  })

  return (
    <svg
      viewBox="0 0 200 340"
      style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden',
        opacity: dimmed ? 0.15 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Cabeça */}
      <ellipse cx="100" cy="32" rx="22" ry="26" fill="#e8eef8" />
      {/* Pescoço */}
      <rect x="92" y="55" width="16" height="14" rx="4" fill={skin} />

      {/* Tronco base */}
      <path
        d="M 60 75 Q 60 70, 70 70 L 130 70 Q 140 70, 140 75 L 142 155 Q 142 165, 132 165 L 68 165 Q 58 165, 60 155 Z"
        fill={torso}
      />

      {/* PEITO */}
      <path
        d="M 70 78 Q 100 72, 130 78 L 130 110 Q 100 118, 70 110 Z"
        {...muscleProps('peito')}
      />

      {/* OMBROS */}
      <ellipse cx="58" cy="82" rx="14" ry="13" {...muscleProps('ombros')} />
      <ellipse cx="142" cy="82" rx="14" ry="13" {...muscleProps('ombros')} />

      {/* BÍCEPS */}
      <ellipse cx="48" cy="118" rx="12" ry="22" {...muscleProps('biceps')} />
      <ellipse cx="152" cy="118" rx="12" ry="22" {...muscleProps('biceps')} />

      {/* Antebraços (neutro) */}
      <ellipse cx="42" cy="160" rx="9" ry="22" fill={skin} />
      <ellipse cx="158" cy="160" rx="9" ry="22" fill={skin} />

      {/* ABDÔMEN */}
      <path
        d="M 78 118 L 122 118 L 124 160 Q 100 168, 76 160 Z"
        {...muscleProps('abdomen')}
      />
      {/* Linhas do abdômen */}
      <line x1="100" y1="120" x2="100" y2="160" stroke="rgba(0,0,0,.25)" strokeWidth="1" />
      <line x1="82" y1="132" x2="118" y2="132" stroke="rgba(0,0,0,.25)" strokeWidth="0.5" />
      <line x1="82" y1="146" x2="118" y2="146" stroke="rgba(0,0,0,.25)" strokeWidth="0.5" />

      {/* PERNAS — quadríceps */}
      <path d="M 70 170 Q 70 165, 78 165 L 96 165 Q 98 170, 96 230 L 78 235 Q 70 232, 70 225 Z" {...muscleProps('pernas')} />
      <path d="M 130 170 Q 130 165, 122 165 L 104 165 Q 102 170, 104 230 L 122 235 Q 130 232, 130 225 Z" {...muscleProps('pernas')} />

      {/* Joelhos (neutro) */}
      <ellipse cx="84" cy="245" rx="9" ry="6" fill={skin} />
      <ellipse cx="116" cy="245" rx="9" ry="6" fill={skin} />

      {/* Panturrilhas frente (parte de pernas) */}
      <path d="M 76 252 Q 76 250, 84 250 L 90 250 Q 92 252, 92 290 L 84 308 Q 76 308, 76 300 Z" {...muscleProps('pernas')} />
      <path d="M 124 252 Q 124 250, 116 250 L 110 250 Q 108 252, 108 290 L 116 308 Q 124 308, 124 300 Z" {...muscleProps('pernas')} />

      {/* Pés */}
      <ellipse cx="84" cy="318" rx="10" ry="6" fill={skin} />
      <ellipse cx="116" cy="318" rx="10" ry="6" fill={skin} />
    </svg>
  )
}

function BackView({ intensity, onHover, dimmed }: ViewProps) {
  const skin = '#cfd6e2'
  const torso = '#1f2530'

  const muscleProps = (m: MuscleGroup) => ({
    onPointerEnter: () => onHover(m),
    onPointerLeave: () => onHover(null),
    style: {
      fill: fillFor(intensity[m], dimmed),
      filter: glowFor(intensity[m]),
      cursor: 'pointer',
      transition: 'fill 0.4s ease, filter 0.4s ease',
    } as React.CSSProperties,
  })

  return (
    <svg
      viewBox="0 0 200 340"
      style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        opacity: dimmed ? 0.15 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Cabeça (atrás) */}
      <ellipse cx="100" cy="32" rx="22" ry="26" fill="#dde3ee" />
      {/* Pescoço */}
      <rect x="92" y="55" width="16" height="14" rx="4" fill={skin} />

      {/* Tronco base */}
      <path
        d="M 60 75 Q 60 70, 70 70 L 130 70 Q 140 70, 140 75 L 142 155 Q 142 165, 132 165 L 68 165 Q 58 165, 60 155 Z"
        fill={torso}
      />

      {/* COSTAS — latíssimo + trapézio */}
      <path
        d="M 65 76 L 135 76 L 138 110 L 134 150 Q 100 160, 66 150 L 62 110 Z"
        {...muscleProps('costas')}
      />

      {/* OMBROS posteriores */}
      <ellipse cx="58" cy="82" rx="14" ry="13" {...muscleProps('ombros')} />
      <ellipse cx="142" cy="82" rx="14" ry="13" {...muscleProps('ombros')} />

      {/* TRÍCEPS */}
      <ellipse cx="48" cy="118" rx="12" ry="22" {...muscleProps('triceps')} />
      <ellipse cx="152" cy="118" rx="12" ry="22" {...muscleProps('triceps')} />

      {/* Antebraços (neutro) */}
      <ellipse cx="42" cy="160" rx="9" ry="22" fill={skin} />
      <ellipse cx="158" cy="160" rx="9" ry="22" fill={skin} />

      {/* Lombar (parte de costas) */}
      <path d="M 78 150 L 122 150 L 122 168 Q 100 172, 78 168 Z" {...muscleProps('costas')} />

      {/* GLÚTEOS */}
      <ellipse cx="84" cy="180" rx="18" ry="14" {...muscleProps('gluteos')} />
      <ellipse cx="116" cy="180" rx="18" ry="14" {...muscleProps('gluteos')} />

      {/* PERNAS — posterior */}
      <path d="M 70 195 Q 70 192, 78 192 L 96 192 Q 98 196, 96 235 L 78 238 Q 70 235, 70 228 Z" {...muscleProps('pernas')} />
      <path d="M 130 195 Q 130 192, 122 192 L 104 192 Q 102 196, 104 235 L 122 238 Q 130 235, 130 228 Z" {...muscleProps('pernas')} />

      {/* Joelhos (neutro) */}
      <ellipse cx="84" cy="248" rx="9" ry="6" fill={skin} />
      <ellipse cx="116" cy="248" rx="9" ry="6" fill={skin} />

      {/* Panturrilhas atrás */}
      <path d="M 75 255 Q 75 253, 84 253 L 90 253 Q 93 256, 92 295 L 84 312 Q 75 312, 75 302 Z" {...muscleProps('pernas')} />
      <path d="M 125 255 Q 125 253, 116 253 L 110 253 Q 107 256, 108 295 L 116 312 Q 125 312, 125 302 Z" {...muscleProps('pernas')} />

      {/* Pés */}
      <ellipse cx="84" cy="320" rx="10" ry="6" fill={skin} />
      <ellipse cx="116" cy="320" rx="10" ry="6" fill={skin} />
    </svg>
  )
}
