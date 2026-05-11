'use client'
import { useState, useId } from 'react'
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

const MUSCLE_ORDER: MuscleGroup[] = [
  'peito', 'costas', 'ombros',
  'biceps', 'triceps', 'abdomen',
  'pernas', 'gluteos',
]

/**
 * Paleta premium — tons frios neutros pra "pele" e dourado→âmbar pros músculos
 * trabalhados. As cores chapadas em INTENSITY_COLOR (lib) seguem usadas pelos
 * chips e tooltip pra consistência com o resto do app; o SVG usa gradients.
 */
const PALETTE = {
  /* Pele neutra (músculos não treinados) */
  skinHi: '#7a8497',
  skinMid: '#4f5867',
  skinLo: '#2c3340',
  skinDeep: '#1a1f2a',
  /* Treinado leve — dourado premium */
  lightHi: '#fde68a',
  lightMid: '#fbbf24',
  lightLo: '#a16207',
  /* Treinado intenso — âmbar quente → vermelho */
  intenseHi: '#fb923c',
  intenseMid: '#ef4444',
  intenseLo: '#7f1d1d',
  /* Stage / ambiente */
  rim: '#a8c5ff',
  bgCenter: 'rgba(60, 80, 120, 0.18)',
  bgEdge: 'rgba(8, 10, 16, 0.85)',
}

export function MuscleBody3D({ stats, height = 460 }: MuscleBody3DProps) {
  const [hovered, setHovered] = useState<MuscleGroup | null>(null)

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 200px',
        gap: 12,
      }}
      className="muscle-body-root"
    >
      <FigureStage stats={stats} hovered={hovered} onHover={setHovered} />
      <SidePanel stats={stats} hovered={hovered} onHover={setHovered} />

      <style jsx global>{`
        @keyframes mb-pulseIntense {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.82; }
        }
        @keyframes mb-pulseLight {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
        @keyframes mb-fadeRise {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .mb-muscle {
          transition: filter .35s ease, opacity .35s ease;
          cursor: pointer;
        }
        .mb-muscle[data-level="intense"] { animation: mb-pulseIntense 2.4s ease-in-out infinite; }
        .mb-muscle[data-level="light"]   { animation: mb-pulseLight 3.2s ease-in-out infinite; }
        .mb-muscle:hover { filter: brightness(1.18) drop-shadow(0 0 6px rgba(255,255,255,.35)); }
        .mb-stage { animation: mb-fadeRise .55s cubic-bezier(.22,.68,0,1.2) both; }
      `}</style>

      <style jsx>{`
        @media (max-width: 640px) {
          .muscle-body-root {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr auto !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   STAGE — fundo cinematográfico + duas figuras + tooltip + legenda
   ──────────────────────────────────────────────────────────── */
function FigureStage({
  stats, hovered, onHover,
}: { stats: MuscleWeekStats; hovered: MuscleGroup | null; onHover: (m: MuscleGroup | null) => void }) {
  return (
    <div
      className="mb-stage"
      style={{
        position: 'relative',
        height: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 50% 35%, ${PALETTE.bgCenter} 0%, transparent 60%),
          radial-gradient(ellipse at 50% 80%, rgba(20,40,80,0.12) 0%, transparent 55%),
          linear-gradient(180deg, ${PALETTE.bgEdge} 0%, #05070b 100%)
        `,
        boxShadow: 'inset 0 0 60px rgba(0,0,0,.6)',
      }}
    >
      {/* Vinheta sutil */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.45) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Linhas de "ground" sutis */}
      <svg
        viewBox="0 0 200 40" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 18, left: 0, right: 0, height: 32, opacity: 0.18, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="floorLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(168,197,255,0)" />
            <stop offset="50%" stopColor="rgba(168,197,255,.7)" />
            <stop offset="100%" stopColor="rgba(168,197,255,0)" />
          </linearGradient>
        </defs>
        <line x1="0" y1="20" x2="200" y2="20" stroke="url(#floorLine)" strokeWidth="0.5" />
      </svg>

      {/* Figuras */}
      <div
        style={{
          position: 'relative', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: '6px 4px 36px',
        }}
      >
        <FigureWrap label="FRENTE">
          <FrontView stats={stats} hovered={hovered} onHover={onHover} />
        </FigureWrap>
        <FigureWrap label="COSTAS">
          <BackView stats={stats} hovered={hovered} onHover={onHover} />
        </FigureWrap>
      </div>

      {/* Tooltip de hover */}
      {hovered && (
        <div
          style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(15,17,22,.92)',
            border: `1px solid ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}`,
            color: '#fff', fontSize: 11, fontWeight: 600,
            backdropFilter: 'blur(12px)', pointerEvents: 'none',
            boxShadow: `0 4px 16px rgba(0,0,0,.5), 0 0 18px ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}55`,
            whiteSpace: 'nowrap', zIndex: 5,
            letterSpacing: 0.3,
          }}
        >
          <span style={{ textTransform: 'uppercase', opacity: 0.9 }}>{MUSCLE_GROUP_LABELS[hovered]}</span>
          <span style={{ opacity: 0.5, margin: '0 8px' }}>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats.setsByMuscle[hovered]} séries</span>
          <span style={{ opacity: 0.5, margin: '0 8px' }}>·</span>
          <span>{INTENSITY_LABEL[stats.intensityByMuscle[hovered]]}</span>
        </div>
      )}

      {/* Legenda */}
      <div
        style={{
          position: 'absolute', bottom: 6, left: 8, right: 8,
          display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
          pointerEvents: 'none',
        }}
      >
        {(['none', 'light', 'intense'] as MuscleIntensity[]).map(level => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: 'rgba(255,255,255,.55)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
            <span
              style={{
                width: 7, height: 7, borderRadius: 999,
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

function FigureWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        {children}
      </div>
      <div style={{
        marginTop: 2, fontSize: 8, fontWeight: 700,
        color: 'rgba(168,197,255,.5)', letterSpacing: 2,
        fontFamily: "'JetBrains Mono', monospace",
      }}>{label}</div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   PAINEL LATERAL DE MÚSCULOS
   ──────────────────────────────────────────────────────────── */
function SidePanel({
  stats, hovered, onHover,
}: { stats: MuscleWeekStats; hovered: MuscleGroup | null; onHover: (m: MuscleGroup | null) => void }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        overflowY: 'auto', paddingRight: 4,
      }}
      className="muscle-side-panel"
    >
      {MUSCLE_ORDER.map(m => {
        const level = stats.intensityByMuscle[m]
        const sets = stats.setsByMuscle[m]
        const color = INTENSITY_COLOR[level]
        const isHovered = hovered === m
        return (
          <button
            key={m}
            type="button"
            onMouseEnter={() => onHover(m)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(m)}
            onBlur={() => onHover(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              background: isHovered ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${level !== 'none' ? color : 'rgba(255,255,255,.09)'}`,
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'background .2s ease, transform .2s ease',
              transform: isHovered ? 'translateX(-2px)' : 'translateX(0)',
              textAlign: 'left',
              color: 'var(--color-text-main)',
              font: 'inherit',
            }}
          >
            <span
              style={{
                width: 10, height: 10, borderRadius: 999,
                background: color, flexShrink: 0,
                boxShadow: level !== 'none' ? `0 0 8px ${color}` : 'none',
              }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, lineHeight: 1.15 }}>
                {MUSCLE_GROUP_LABELS[m]}
              </span>
              <span style={{ display: 'block', fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 1 }}>
                {sets > 0 ? `${sets} ${sets === 1 ? 'série' : 'séries'}` : '—'}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   DEFS — gradients + filtros SVG (volume + AO + rim light fake)
   prefix garante IDs únicos quando 2 SVGs coexistem.
   ──────────────────────────────────────────────────────────── */
function Defs({ prefix }: { prefix: string }) {
  return (
    <defs>
      {/* Pele (silhueta neutra) — gradient suave volumétrico */}
      <radialGradient id={`${prefix}-skin`} cx="42%" cy="30%" r="80%">
        <stop offset="0%" stopColor={PALETTE.skinHi} />
        <stop offset="55%" stopColor={PALETTE.skinMid} />
        <stop offset="100%" stopColor={PALETTE.skinDeep} />
      </radialGradient>

      {/* Músculo NÃO treinado — tom integrado à pele, levemente mais saturado */}
      <radialGradient id={`${prefix}-mNone`} cx="40%" cy="32%" r="80%">
        <stop offset="0%" stopColor={PALETTE.skinHi} />
        <stop offset="60%" stopColor={PALETTE.skinMid} />
        <stop offset="100%" stopColor={PALETTE.skinLo} />
      </radialGradient>

      {/* Músculo LEVE — dourado premium */}
      <radialGradient id={`${prefix}-mLight`} cx="42%" cy="32%" r="85%">
        <stop offset="0%" stopColor={PALETTE.lightHi} />
        <stop offset="55%" stopColor={PALETTE.lightMid} />
        <stop offset="100%" stopColor={PALETTE.lightLo} />
      </radialGradient>

      {/* Músculo INTENSO — âmbar/vermelho */}
      <radialGradient id={`${prefix}-mIntense`} cx="42%" cy="32%" r="85%">
        <stop offset="0%" stopColor={PALETTE.intenseHi} />
        <stop offset="55%" stopColor={PALETTE.intenseMid} />
        <stop offset="100%" stopColor={PALETTE.intenseLo} />
      </radialGradient>

      {/* Rim light (luz de borda azulada do canto direito) */}
      <linearGradient id={`${prefix}-rim`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(168,197,255,0)" />
        <stop offset="80%" stopColor="rgba(168,197,255,0)" />
        <stop offset="100%" stopColor="rgba(168,197,255,0.45)" />
      </linearGradient>

      {/* Sombra ambiente lateral */}
      <linearGradient id={`${prefix}-aoSide`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
        <stop offset="35%" stopColor="rgba(0,0,0,0)" />
        <stop offset="65%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
      </linearGradient>

      {/* Sombra inferior do tronco */}
      <linearGradient id={`${prefix}-aoBottom`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
      </linearGradient>

      {/* Sombra de chão (elipse projetada) */}
      <radialGradient id={`${prefix}-ground`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>

      {/* Filtro de blur sutil pra suavizar bordas */}
      <filter id={`${prefix}-soft`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="0.35" />
      </filter>
    </defs>
  )
}

/* ────────────────────────────────────────────────────────────
   Helper de fill por intensidade — aponta pro gradient certo
   ──────────────────────────────────────────────────────────── */
function fillFor(prefix: string, level: MuscleIntensity): string {
  if (level === 'intense') return `url(#${prefix}-mIntense)`
  if (level === 'light')   return `url(#${prefix}-mLight)`
  return `url(#${prefix}-mNone)`
}

interface ViewProps {
  stats: MuscleWeekStats
  hovered: MuscleGroup | null
  onHover: (m: MuscleGroup | null) => void
}

/* ────────────────────────────────────────────────────────────
   FRONT VIEW — viewBox 200×460
   Anatomia: deltoides 3 cabeças, peito U c/ inserção, serrátil,
   abs 8-pack + V-cut + linha alba, bíceps 2 cabeças,
   antebraço (flexores), quads 4 cabeças, panturrilhas, tibial.
   ──────────────────────────────────────────────────────────── */
function FrontView({ stats, hovered, onHover }: ViewProps) {
  const uid = useId().replace(/:/g, '')
  const p = `f${uid}`
  const handler = (m: MuscleGroup) => ({
    onPointerEnter: () => onHover(m),
    onPointerLeave: () => onHover(null),
    'data-level': stats.intensityByMuscle[m],
    className: 'mb-muscle',
  })
  const lvl = (m: MuscleGroup) => stats.intensityByMuscle[m]

  return (
    <svg viewBox="0 0 200 460" style={{ height: '100%', maxWidth: '100%', display: 'block' }}>
      <Defs prefix={p} />

      {/* Sombra de chão */}
      <ellipse cx="100" cy="450" rx="50" ry="6" fill={`url(#${p}-ground)`} />

      {/* ═══════════════════ SILHUETA DE FUNDO ═══════════════════ */}

      {/* Cabeça — formato mais orgânico, mandíbula sugerida */}
      <path
        d="M 100 14
           C 84 14 73 24 72 40
           C 71 50 74 60 80 67
           C 80 72 79 76 77 80
           L 88 84
           Q 100 89 112 84
           L 123 80
           C 121 76 120 72 120 67
           C 126 60 129 50 128 40
           C 127 24 116 14 100 14 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      {/* Sombra mandíbula */}
      <path d="M 84 70 Q 100 78 116 70" stroke="rgba(0,0,0,.18)" strokeWidth="0.7" fill="none" />
      {/* Olhos */}
      <ellipse cx="91" cy="42" rx="2.2" ry="1.4" fill="rgba(0,0,0,.55)" />
      <ellipse cx="109" cy="42" rx="2.2" ry="1.4" fill="rgba(0,0,0,.55)" />
      {/* Nariz */}
      <path d="M 100 48 L 99 56 Q 100 58 101 56 Z" fill="rgba(0,0,0,.18)" />

      {/* Pescoço com esternocleidomastoideo */}
      <path
        d="M 87 84 L 86 102 Q 100 110 114 102 L 113 84 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      {/* SCM esquerdo + direito (linhas) */}
      <path d="M 89 86 Q 95 96 98 106" stroke="rgba(0,0,0,.22)" strokeWidth="0.7" fill="none" />
      <path d="M 111 86 Q 105 96 102 106" stroke="rgba(0,0,0,.22)" strokeWidth="0.7" fill="none" />
      {/* Fossa supraesternal */}
      <ellipse cx="100" cy="106" rx="2" ry="1.2" fill="rgba(0,0,0,.35)" />

      {/* Trapézio frontal (entre pescoço e ombros) */}
      <path
        d="M 75 105 Q 86 100 100 102 Q 114 100 125 105 L 134 116 L 66 116 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />

      {/* Tronco — silhueta com V-taper masculino */}
      <path
        d="M 56 110
           Q 50 130 50 150
           L 52 180
           Q 56 210 64 240
           L 76 268
           L 124 268
           L 136 240
           Q 144 210 148 180
           L 150 150
           Q 150 130 144 110 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.6"
      />

      {/* Antebraços (flexores) */}
      <path
        d="M 28 175 Q 25 200 28 225 L 33 265 Q 38 270 45 268 L 47 225 Q 47 200 45 175 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      <path
        d="M 172 175 Q 175 200 172 225 L 167 265 Q 162 270 155 268 L 153 225 Q 153 200 155 175 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      {/* Sulcos do antebraço */}
      <path d="M 33 195 Q 35 220 36 250" stroke="rgba(0,0,0,.18)" strokeWidth="0.5" fill="none" />
      <path d="M 41 195 Q 39 220 40 250" stroke="rgba(0,0,0,.15)" strokeWidth="0.4" fill="none" />
      <path d="M 167 195 Q 165 220 164 250" stroke="rgba(0,0,0,.18)" strokeWidth="0.5" fill="none" />
      <path d="M 159 195 Q 161 220 160 250" stroke="rgba(0,0,0,.15)" strokeWidth="0.4" fill="none" />

      {/* Mãos */}
      <path
        d="M 32 268 Q 28 274 30 286 Q 34 295 42 296 Q 50 294 50 285 L 48 268 Z"
        fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      <path
        d="M 168 268 Q 172 274 170 286 Q 166 295 158 296 Q 150 294 150 285 L 152 268 Z"
        fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />

      {/* Quadril/cintura */}
      <path
        d="M 76 268
           Q 70 282 70 302
           L 78 322
           L 122 322
           L 130 302
           Q 130 282 124 268 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.6"
      />
      {/* Linha do íliaco / V-cut sutil */}
      <path d="M 78 308 Q 100 318 122 308" stroke="rgba(0,0,0,.28)" strokeWidth="0.7" fill="none" />
      <path d="M 82 296 Q 100 306 118 296" stroke="rgba(0,0,0,.16)" strokeWidth="0.5" fill="none" />

      {/* Coxas silhueta */}
      <path
        d="M 70 318 Q 62 360 62 405 L 70 432 L 98 432 L 100 390 L 100 318 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.6"
      />
      <path
        d="M 130 318 Q 138 360 138 405 L 130 432 L 102 432 L 100 390 L 100 318 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.6"
      />

      {/* Joelhos com patela */}
      <ellipse cx="83" cy="436" rx="11" ry="6" fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />
      <ellipse cx="117" cy="436" rx="11" ry="6" fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />
      <circle cx="83" cy="436" r="3.5" fill="rgba(0,0,0,.15)" />
      <circle cx="117" cy="436" r="3.5" fill="rgba(0,0,0,.15)" />

      {/* ═══════════════════ MÚSCULOS PINTÁVEIS ═══════════════════ */}

      {/* OMBROS — deltoide com 3 cabeças (anterior, lateral, posterior) */}
      <g {...handler('ombros')}>
        {/* Esquerdo */}
        <path
          d="M 56 113
             Q 44 118 40 135
             Q 38 152 46 162
             Q 56 158 62 148
             Q 65 132 64 115 Z"
          fill={fillFor(p, lvl('ombros'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        {/* Direito */}
        <path
          d="M 144 113
             Q 156 118 160 135
             Q 162 152 154 162
             Q 144 158 138 148
             Q 135 132 136 115 Z"
          fill={fillFor(p, lvl('ombros'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Linhas das 3 cabeças do deltoide */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.5" fill="none">
        <path d="M 50 122 Q 52 138 56 152" />
        <path d="M 58 118 Q 56 138 56 158" />
        <path d="M 150 122 Q 148 138 144 152" />
        <path d="M 142 118 Q 144 138 144 158" />
      </g>

      {/* PEITO — peitorais em U com inserção esternal e linha clavicular */}
      <g {...handler('peito')}>
        {/* Peitoral esquerdo (forma de gota inclinada) */}
        <path
          d="M 64 117
             Q 78 113 99 119
             L 99 165
             Q 90 172 76 168
             Q 66 164 63 152
             Q 62 135 64 117 Z"
          fill={fillFor(p, lvl('peito'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        {/* Peitoral direito */}
        <path
          d="M 136 117
             Q 122 113 101 119
             L 101 165
             Q 110 172 124 168
             Q 134 164 137 152
             Q 138 135 136 117 Z"
          fill={fillFor(p, lvl('peito'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Linha clavicular (sob o trapézio) */}
      <path d="M 64 118 Q 80 122 99 119 Q 100 119 101 119 Q 120 122 136 118"
        stroke="rgba(0,0,0,.3)" strokeWidth="0.6" fill="none" pointerEvents="none" />
      {/* Sulco esternal central */}
      <line x1="100" y1="119" x2="100" y2="166" stroke="rgba(0,0,0,.45)" strokeWidth="0.9" pointerEvents="none" />
      {/* Sombra inferior do peito (define o "peso") */}
      <path d="M 65 158 Q 80 168 99 165" stroke="rgba(0,0,0,.28)" strokeWidth="0.7" fill="none" pointerEvents="none" />
      <path d="M 135 158 Q 120 168 101 165" stroke="rgba(0,0,0,.28)" strokeWidth="0.7" fill="none" pointerEvents="none" />
      {/* Mamilo sutil (decoração) */}
      <circle cx="78" cy="148" r="1.2" fill="rgba(0,0,0,.35)" pointerEvents="none" />
      <circle cx="122" cy="148" r="1.2" fill="rgba(0,0,0,.35)" pointerEvents="none" />

      {/* SERRÁTIL ANTERIOR (parte de "peito" — músculo sob a axila) */}
      <g {...handler('peito')}>
        <path d="M 60 165 Q 58 175 62 185 Q 70 188 73 180 L 75 168 Z"
          fill={fillFor(p, lvl('peito'))} stroke="rgba(0,0,0,.35)" strokeWidth="0.5" />
        <path d="M 140 165 Q 142 175 138 185 Q 130 188 127 180 L 125 168 Z"
          fill={fillFor(p, lvl('peito'))} stroke="rgba(0,0,0,.35)" strokeWidth="0.5" />
      </g>
      {/* Estriações do serrátil */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.4" fill="none">
        <path d="M 62 172 L 72 174" />
        <path d="M 62 178 L 72 180" />
        <path d="M 138 172 L 128 174" />
        <path d="M 138 178 L 128 180" />
      </g>

      {/* BÍCEPS — 2 cabeças (longa + curta) com pico */}
      <g {...handler('biceps')}>
        <path
          d="M 40 135
             Q 30 148 28 172
             Q 27 195 33 212
             Q 42 215 47 200
             Q 50 175 48 152 Z"
          fill={fillFor(p, lvl('biceps'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        <path
          d="M 160 135
             Q 170 148 172 172
             Q 173 195 167 212
             Q 158 215 153 200
             Q 150 175 152 152 Z"
          fill={fillFor(p, lvl('biceps'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Pico do bíceps + sulco */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.5" fill="none">
        <path d="M 36 158 Q 38 178 38 200" />
        <path d="M 44 158 Q 42 178 42 200" />
        <path d="M 164 158 Q 162 178 162 200" />
        <path d="M 156 158 Q 158 178 158 200" />
      </g>

      {/* ABDOMEN — retos abdominais (8-pack) + oblíquos + V-cut */}
      <g {...handler('abdomen')}>
        {/* Bloco central dos retos (forma orgânica, não retangular) */}
        <path
          d="M 84 165
             Q 86 162 100 162
             Q 114 162 116 165
             Q 120 175 120 200
             Q 120 230 116 260
             Q 110 268 100 268
             Q 90 268 84 260
             Q 80 230 80 200
             Q 80 175 84 165 Z"
          fill={fillFor(p, lvl('abdomen'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        {/* Oblíquos esquerdo */}
        <path
          d="M 70 170
             Q 64 188 64 215
             Q 64 240 70 262
             L 80 262
             Q 80 240 80 215
             Q 80 190 82 170 Z"
          fill={fillFor(p, lvl('abdomen'))}
          stroke="rgba(0,0,0,.35)" strokeWidth="0.5"
        />
        {/* Oblíquos direito */}
        <path
          d="M 130 170
             Q 136 188 136 215
             Q 136 240 130 262
             L 120 262
             Q 120 240 120 215
             Q 120 190 118 170 Z"
          fill={fillFor(p, lvl('abdomen'))}
          stroke="rgba(0,0,0,.35)" strokeWidth="0.5"
        />
      </g>
      {/* Linhas do 8-pack — curvas anatômicas */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.4)" strokeWidth="0.7" fill="none">
        <line x1="100" y1="166" x2="100" y2="262" />
        <path d="M 84 178 Q 100 182 116 178" />
        <path d="M 82 198 Q 100 202 118 198" />
        <path d="M 80 220 Q 100 224 120 220" />
        <path d="M 80 244 Q 100 248 120 244" />
      </g>
      {/* Estriações dos oblíquos */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.18)" strokeWidth="0.4" fill="none">
        <path d="M 67 195 Q 73 200 79 200" />
        <path d="M 66 215 Q 72 220 78 220" />
        <path d="M 66 235 Q 72 240 78 240" />
        <path d="M 133 195 Q 127 200 121 200" />
        <path d="M 134 215 Q 128 220 122 220" />
        <path d="M 134 235 Q 128 240 122 240" />
      </g>
      {/* Umbigo */}
      <ellipse cx="100" cy="248" rx="1.6" ry="2.2" fill="rgba(0,0,0,.55)" pointerEvents="none" />

      {/* PERNAS — quadríceps com 4 cabeças (vasto lateral, reto femoral, vasto medial) */}
      <g {...handler('pernas')}>
        {/* Coxa esquerda — silhueta dos quads */}
        <path
          d="M 70 322
             Q 64 360 64 400
             L 73 428
             L 96 428
             L 99 400
             Q 100 360 95 322 Z"
          fill={fillFor(p, lvl('pernas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        {/* Coxa direita */}
        <path
          d="M 130 322
             Q 136 360 136 400
             L 127 428
             L 104 428
             L 101 400
             Q 100 360 105 322 Z"
          fill={fillFor(p, lvl('pernas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Sulcos do quadríceps — vasto lateral, reto femoral, vasto medial */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.28)" strokeWidth="0.55" fill="none">
        {/* Esquerda: vasto lateral (externo) */}
        <path d="M 71 335 Q 67 365 70 410" />
        {/* Reto femoral (centro da coxa) */}
        <path d="M 84 335 Q 84 370 84 415" />
        {/* Vasto medial (gota perto do joelho) */}
        <path d="M 90 380 Q 92 405 92 425" />
        {/* Linha lateral / sartório */}
        <path d="M 78 330 Q 86 365 92 405" />
        {/* Direita */}
        <path d="M 129 335 Q 133 365 130 410" />
        <path d="M 116 335 Q 116 370 116 415" />
        <path d="M 110 380 Q 108 405 108 425" />
        <path d="M 122 330 Q 114 365 108 405" />
      </g>

      {/* PANTURRILHAS frente — tibial anterior visível */}
      <g {...handler('pernas')}>
        <path
          d="M 73 442
             Q 68 460 70 480
             L 76 510
             L 90 510
             L 92 485
             Q 93 460 90 442 Z"
          fill={fillFor(p, lvl('pernas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        <path
          d="M 127 442
             Q 132 460 130 480
             L 124 510
             L 110 510
             L 108 485
             Q 107 460 110 442 Z"
          fill={fillFor(p, lvl('pernas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Sulco tibial */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.28)" strokeWidth="0.5" fill="none">
        <path d="M 80 450 Q 82 475 84 505" />
        <path d="M 87 450 Q 88 475 90 505" />
        <path d="M 120 450 Q 118 475 116 505" />
        <path d="M 113 450 Q 112 475 110 505" />
      </g>

      {/* Pés */}
      <ellipse cx="83" cy="514" rx="11" ry="4" fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />
      <ellipse cx="117" cy="514" rx="11" ry="4" fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />

      {/* ═══════════════ OVERLAYS DE LUZ E SOMBRA ═══════════════ */}
      {/* AO lateral (escurece bordas) */}
      <rect x="40" y="100" width="120" height="430" fill={`url(#${p}-aoSide)`} pointerEvents="none" opacity="0.8" />
      {/* Rim light azulado borda direita */}
      <rect x="40" y="100" width="120" height="430" fill={`url(#${p}-rim)`} pointerEvents="none" opacity="0.6" />
    </svg>
  )
}

/* ────────────────────────────────────────────────────────────
   BACK VIEW — viewBox 200×460
   Anatomia: trapézio + romboides, latíssimo V-taper agressivo,
   eretores espinhais, deltoide posterior, tríceps 3 cabeças,
   glúteos dois lobos com sulco, isquios em 3 fascículos,
   gastrocnêmio bicéfalo + sóleo.
   ──────────────────────────────────────────────────────────── */
function BackView({ stats, hovered, onHover }: ViewProps) {
  const uid = useId().replace(/:/g, '')
  const p = `b${uid}`
  const handler = (m: MuscleGroup) => ({
    onPointerEnter: () => onHover(m),
    onPointerLeave: () => onHover(null),
    'data-level': stats.intensityByMuscle[m],
    className: 'mb-muscle',
  })
  const lvl = (m: MuscleGroup) => stats.intensityByMuscle[m]

  return (
    <svg viewBox="0 0 200 460" style={{ height: '100%', maxWidth: '100%', display: 'block' }}>
      <Defs prefix={p} />

      <ellipse cx="100" cy="450" rx="50" ry="6" fill={`url(#${p}-ground)`} />

      {/* ═══════════════ SILHUETA DE FUNDO ═══════════════ */}

      {/* Cabeça (atrás) */}
      <path
        d="M 100 14
           C 84 14 73 24 72 40
           C 71 50 74 60 80 67
           C 80 72 79 76 77 80
           L 88 84
           Q 100 89 112 84
           L 123 80
           C 121 76 120 72 120 67
           C 126 60 129 50 128 40
           C 127 24 116 14 100 14 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      {/* Linha occipital */}
      <path d="M 80 60 Q 100 65 120 60" stroke="rgba(0,0,0,.18)" strokeWidth="0.6" fill="none" />

      {/* Pescoço */}
      <path
        d="M 87 84 L 86 102 Q 100 110 114 102 L 113 84 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      {/* C7 vertebra */}
      <ellipse cx="100" cy="106" rx="1.5" ry="2" fill="rgba(0,0,0,.4)" />

      {/* Tronco */}
      <path
        d="M 56 110
           Q 50 130 50 150
           L 52 180
           Q 56 210 64 240
           L 76 268
           L 124 268
           L 136 240
           Q 144 210 148 180
           L 150 150
           Q 150 130 144 110 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.6"
      />

      {/* Antebraços */}
      <path
        d="M 28 175 Q 25 200 28 225 L 33 265 Q 38 270 45 268 L 47 225 Q 47 200 45 175 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      <path
        d="M 172 175 Q 175 200 172 225 L 167 265 Q 162 270 155 268 L 153 225 Q 153 200 155 175 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.5"
      />
      {/* Sulcos extensores */}
      <path d="M 32 195 Q 34 220 35 250" stroke="rgba(0,0,0,.18)" strokeWidth="0.5" fill="none" />
      <path d="M 42 195 Q 40 220 41 250" stroke="rgba(0,0,0,.15)" strokeWidth="0.4" fill="none" />
      <path d="M 168 195 Q 166 220 165 250" stroke="rgba(0,0,0,.18)" strokeWidth="0.5" fill="none" />
      <path d="M 158 195 Q 160 220 159 250" stroke="rgba(0,0,0,.15)" strokeWidth="0.4" fill="none" />

      {/* Mãos (dorso) */}
      <path d="M 32 268 Q 28 274 30 286 Q 34 295 42 296 Q 50 294 50 285 L 48 268 Z"
        fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />
      <path d="M 168 268 Q 172 274 170 286 Q 166 295 158 296 Q 150 294 150 285 L 152 268 Z"
        fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />

      {/* Quadril */}
      <path
        d="M 76 268 Q 70 282 70 302 L 78 322 L 122 322 L 130 302 Q 130 282 124 268 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.6"
      />

      {/* Coxas */}
      <path d="M 70 318 Q 62 360 62 405 L 70 432 L 98 432 L 100 390 L 100 318 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.6" />
      <path d="M 130 318 Q 138 360 138 405 L 130 432 L 102 432 L 100 390 L 100 318 Z"
        fill={`url(#${p}-skin)`} stroke={PALETTE.skinDeep} strokeWidth="0.6" />

      {/* Joelhos (fossa poplítea) */}
      <ellipse cx="83" cy="436" rx="11" ry="6" fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />
      <ellipse cx="117" cy="436" rx="11" ry="6" fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />

      {/* ═══════════════ MÚSCULOS PINTÁVEIS ═══════════════ */}

      {/* OMBROS — deltoide posterior */}
      <g {...handler('ombros')}>
        <path
          d="M 56 113 Q 44 118 40 135 Q 38 152 46 162 Q 56 158 62 148 Q 65 132 64 115 Z"
          fill={fillFor(p, lvl('ombros'))} stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        <path
          d="M 144 113 Q 156 118 160 135 Q 162 152 154 162 Q 144 158 138 148 Q 135 132 136 115 Z"
          fill={fillFor(p, lvl('ombros'))} stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Estriações deltoide posterior */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.5" fill="none">
        <path d="M 50 122 Q 52 138 56 152" />
        <path d="M 150 122 Q 148 138 144 152" />
      </g>

      {/* COSTAS — Trapézio + Latíssimo (V-taper) + Lombar */}
      <g {...handler('costas')}>
        {/* Trapézio (forma de losango/diamante) */}
        <path
          d="M 87 102
             Q 75 108 64 116
             L 70 145
             Q 85 142 100 142
             Q 115 142 130 145
             L 136 116
             Q 125 108 113 102 Z"
          fill={fillFor(p, lvl('costas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        {/* Latíssimo esquerdo (asa em V) */}
        <path
          d="M 64 142
             Q 60 165 64 195
             Q 75 215 90 215
             L 99 215
             L 99 168
             Q 92 156 80 152
             Q 70 148 64 142 Z"
          fill={fillFor(p, lvl('costas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        {/* Latíssimo direito */}
        <path
          d="M 136 142
             Q 140 165 136 195
             Q 125 215 110 215
             L 101 215
             L 101 168
             Q 108 156 120 152
             Q 130 148 136 142 Z"
          fill={fillFor(p, lvl('costas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        {/* Lombar (eretores espinhais) */}
        <path
          d="M 78 215 L 122 215 Q 126 240 122 268 L 78 268 Q 74 240 78 215 Z"
          fill={fillFor(p, lvl('costas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Coluna vertebral (sulco) */}
      <line x1="100" y1="105" x2="100" y2="265" stroke="rgba(0,0,0,.5)" strokeWidth="1" pointerEvents="none" />
      {/* Vertebras (pontinhos) */}
      <g pointerEvents="none" fill="rgba(0,0,0,.35)">
        {[120, 140, 160, 180, 200, 220, 240, 258].map((y, i) => (
          <circle key={i} cx="100" cy={y} r="0.9" />
        ))}
      </g>
      {/* Estriações decorativas dos lats e trapézio */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.5" fill="none">
        {/* Trapézio fibers */}
        <path d="M 88 108 Q 82 122 76 138" />
        <path d="M 112 108 Q 118 122 124 138" />
        {/* Lats fibers */}
        <path d="M 70 152 Q 78 175 92 200" />
        <path d="M 80 148 Q 86 175 96 205" />
        <path d="M 130 152 Q 122 175 108 200" />
        <path d="M 120 148 Q 114 175 104 205" />
        {/* Eretores lombares */}
        <path d="M 90 220 L 90 262" />
        <path d="M 110 220 L 110 262" />
      </g>
      {/* Romboides centrais — pequenos triângulos (decoração visual) */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.18)" strokeWidth="0.4" fill="none">
        <path d="M 90 138 L 100 145 L 90 152 Z" />
        <path d="M 110 138 L 100 145 L 110 152 Z" />
      </g>

      {/* TRÍCEPS — 3 cabeças (longa, lateral, medial) */}
      <g {...handler('triceps')}>
        <path
          d="M 40 135 Q 30 148 28 172 Q 27 195 33 212 Q 42 215 47 200 Q 50 175 48 152 Z"
          fill={fillFor(p, lvl('triceps'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        <path
          d="M 160 135 Q 170 148 172 172 Q 173 195 167 212 Q 158 215 153 200 Q 150 175 152 152 Z"
          fill={fillFor(p, lvl('triceps'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Sulcos das 3 cabeças do tríceps */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.24)" strokeWidth="0.55" fill="none">
        {/* Esquerda */}
        <path d="M 33 158 Q 34 178 36 200" />
        <path d="M 41 158 Q 40 178 42 205" />
        <path d="M 47 165 Q 47 185 47 205" />
        {/* Direita */}
        <path d="M 167 158 Q 166 178 164 200" />
        <path d="M 159 158 Q 160 178 158 205" />
        <path d="M 153 165 Q 153 185 153 205" />
      </g>

      {/* GLÚTEOS — duas cúpulas com sulco profundo */}
      <g {...handler('gluteos')}>
        <path
          d="M 70 268
             Q 60 285 62 315
             Q 70 332 88 330
             Q 99 326 99 305
             L 99 268 Z"
          fill={fillFor(p, lvl('gluteos'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        <path
          d="M 130 268
             Q 140 285 138 315
             Q 130 332 112 330
             Q 101 326 101 305
             L 101 268 Z"
          fill={fillFor(p, lvl('gluteos'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Sulco intergluteo */}
      <line x1="100" y1="270" x2="100" y2="328" stroke="rgba(0,0,0,.55)" strokeWidth="1.1" pointerEvents="none" />
      {/* Linha do glúteo médio (curva superior) */}
      <path d="M 70 280 Q 78 272 90 273" stroke="rgba(0,0,0,.2)" strokeWidth="0.5" fill="none" pointerEvents="none" />
      <path d="M 130 280 Q 122 272 110 273" stroke="rgba(0,0,0,.2)" strokeWidth="0.5" fill="none" pointerEvents="none" />

      {/* PERNAS posterior — isquiotibiais (3 fascículos) */}
      <g {...handler('pernas')}>
        {/* Coxa esquerda posterior */}
        <path
          d="M 68 330
             Q 62 365 64 405
             L 73 428
             L 96 428
             L 99 400
             Q 100 365 95 330 Z"
          fill={fillFor(p, lvl('pernas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        {/* Coxa direita posterior */}
        <path
          d="M 132 330
             Q 138 365 136 405
             L 127 428
             L 104 428
             L 101 400
             Q 100 365 105 330 Z"
          fill={fillFor(p, lvl('pernas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Sulcos isquios — bíceps femoral, semitendinoso, semimembranoso */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.26)" strokeWidth="0.55" fill="none">
        <path d="M 73 340 Q 72 380 76 420" />
        <path d="M 84 340 Q 84 380 84 420" />
        <path d="M 92 340 Q 93 380 92 420" />
        <path d="M 127 340 Q 128 380 124 420" />
        <path d="M 116 340 Q 116 380 116 420" />
        <path d="M 108 340 Q 107 380 108 420" />
      </g>

      {/* PANTURRILHAS — gastrocnêmio bicéfalo + sóleo */}
      <g {...handler('pernas')}>
        <path
          d="M 73 442
             Q 67 462 70 485
             L 78 510
             L 90 510
             L 92 485
             Q 93 462 90 442 Z"
          fill={fillFor(p, lvl('pernas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
        <path
          d="M 127 442
             Q 133 462 130 485
             L 122 510
             L 110 510
             L 108 485
             Q 107 462 110 442 Z"
          fill={fillFor(p, lvl('pernas'))}
          stroke="rgba(0,0,0,.4)" strokeWidth="0.6"
        />
      </g>
      {/* Sulco central da panturrilha (gastroc bicéfalo) */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.32)" strokeWidth="0.7" fill="none">
        <line x1="82" y1="450" x2="82" y2="498" />
        <line x1="118" y1="450" x2="118" y2="498" />
      </g>
      {/* Linhas do sóleo */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.18)" strokeWidth="0.4" fill="none">
        <path d="M 76 470 Q 82 472 88 470" />
        <path d="M 78 488 Q 83 490 88 488" />
        <path d="M 124 470 Q 118 472 112 470" />
        <path d="M 122 488 Q 117 490 112 488" />
      </g>

      {/* Pés (calcanhar) */}
      <ellipse cx="83" cy="514" rx="11" ry="4" fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />
      <ellipse cx="117" cy="514" rx="11" ry="4" fill={PALETTE.skinMid} stroke={PALETTE.skinDeep} strokeWidth="0.5" />

      {/* ═══════════════ OVERLAYS DE LUZ E SOMBRA ═══════════════ */}
      <rect x="40" y="100" width="120" height="430" fill={`url(#${p}-aoSide)`} pointerEvents="none" opacity="0.8" />
      <rect x="40" y="100" width="120" height="430" fill={`url(#${p}-rim)`} pointerEvents="none" opacity="0.6" />
    </svg>
  )
}
