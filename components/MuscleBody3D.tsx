'use client'
import { useState } from 'react'
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

const SKIN = '#cfd6e2'
const SKIN_DARK = '#a8b0bd'
const SHADOW = 'rgba(0,0,0,.18)'

export function MuscleBody3D({ stats, height = 420 }: MuscleBody3DProps) {
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
      {/* Bonecos lado a lado */}
      <div
        style={{
          position: 'relative', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, padding: '8px 4px 28px',
        }}
      >
        <FigureWrap label="Frente">
          <FrontView intensity={stats.intensityByMuscle} hovered={hovered} onHover={setHovered} />
        </FigureWrap>
        <FigureWrap label="Costas">
          <BackView intensity={stats.intensityByMuscle} hovered={hovered} onHover={setHovered} />
        </FigureWrap>

        {/* Tooltip sobre hover */}
        {hovered && (
          <div
            style={{
              position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(15,17,22,.92)',
              border: `1px solid ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}`,
              color: '#fff', fontSize: 12, fontWeight: 600,
              backdropFilter: 'blur(12px)', pointerEvents: 'none',
              boxShadow: `0 0 16px ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}55`,
              whiteSpace: 'nowrap', zIndex: 5,
            }}
          >
            {MUSCLE_GROUP_LABELS[hovered]} · {stats.setsByMuscle[hovered]} séries · {INTENSITY_LABEL[stats.intensityByMuscle[hovered]]}
          </div>
        )}

        {/* Legenda */}
        <div
          style={{
            position: 'absolute', bottom: 4, left: 8, right: 8,
            display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
            pointerEvents: 'none',
          }}
        >
          {(['none', 'light', 'intense'] as MuscleIntensity[]).map(level => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,.6)' }}>
              <span
                style={{
                  width: 8, height: 8, borderRadius: 999,
                  background: INTENSITY_COLOR[level],
                  boxShadow: level !== 'none' ? `0 0 6px ${INTENSITY_COLOR[level]}` : 'none',
                }}
              />
              {INTENSITY_LABEL[level]}
            </div>
          ))}
        </div>
      </div>

      {/* Painel lateral — chips */}
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
              onMouseEnter={() => setHovered(m)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(m)}
              onBlur={() => setHovered(null)}
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

      <style jsx>{`
        @media (max-width: 640px) {
          .muscle-body-root {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr auto !important;
          }
          .muscle-side-panel {
            flex-direction: row !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            padding-bottom: 4px;
          }
          .muscle-side-panel button {
            flex-shrink: 0;
            min-width: 110px;
          }
        }
      `}</style>
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
        marginTop: 2, fontSize: 9, fontWeight: 600,
        color: 'rgba(255,255,255,.4)', letterSpacing: 1, textTransform: 'uppercase',
      }}>{label}</div>
    </div>
  )
}

interface ViewProps {
  intensity: Record<MuscleGroup, MuscleIntensity>
  hovered: MuscleGroup | null
  onHover: (m: MuscleGroup | null) => void
}

function muscleStyle(level: MuscleIntensity, isHovered: boolean): React.CSSProperties {
  const color = INTENSITY_COLOR[level]
  let filter = 'none'
  if (isHovered) {
    filter = `drop-shadow(0 0 6px ${color}cc) brightness(1.15)`
  } else if (level === 'intense') {
    filter = `drop-shadow(0 0 4px ${color}88)`
  } else if (level === 'light') {
    filter = `drop-shadow(0 0 3px ${color}66)`
  }
  return {
    fill: color,
    stroke: 'rgba(0,0,0,.35)',
    strokeWidth: 0.6,
    filter,
    cursor: 'pointer',
    transition: 'fill .35s ease, filter .35s ease',
  }
}

/* ────────────────────────────────────────────────────────────
   FRONT VIEW
   viewBox 200×420 — silhueta anatômica masculina musculosa
   Grupos: peito, ombros, biceps, abdomen, pernas (quads/calves)
   ──────────────────────────────────────────────────────────── */
function FrontView({ intensity, hovered, onHover }: ViewProps) {
  const handler = (m: MuscleGroup) => ({
    onPointerEnter: () => onHover(m),
    onPointerLeave: () => onHover(null),
    style: muscleStyle(intensity[m], hovered === m),
  })

  return (
    <svg viewBox="0 0 200 420" style={{ height: '100%', maxWidth: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="skinGradFront" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d8dfeb" />
          <stop offset="100%" stopColor={SKIN_DARK} />
        </radialGradient>
        <linearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,.15)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,.15)" />
        </linearGradient>
      </defs>

      {/* === SILHUETA DE FUNDO (skin) === */}
      {/* Cabeça */}
      <path
        d="M 100 12 C 86 12 76 22 76 38 C 76 48 79 56 84 62 C 84 68 82 72 80 76 L 120 76 C 118 72 116 68 116 62 C 121 56 124 48 124 38 C 124 22 114 12 100 12 Z"
        fill="url(#skinGradFront)" stroke={SHADOW} strokeWidth="0.6"
      />
      {/* Mandíbula sombra */}
      <path d="M 88 60 Q 100 66 112 60" stroke="rgba(0,0,0,.15)" strokeWidth="0.8" fill="none" />
      {/* Sobrancelhas/olhos sutis */}
      <ellipse cx="92" cy="38" rx="2.4" ry="1.4" fill="rgba(0,0,0,.4)" />
      <ellipse cx="108" cy="38" rx="2.4" ry="1.4" fill="rgba(0,0,0,.4)" />

      {/* Pescoço com esterno */}
      <path d="M 88 76 L 87 96 Q 100 102 113 96 L 112 76 Z" fill="url(#skinGradFront)" stroke={SHADOW} strokeWidth="0.6" />
      <line x1="100" y1="82" x2="100" y2="98" stroke="rgba(0,0,0,.18)" strokeWidth="0.6" />

      {/* Trapézio (decorativo, não mapeado) */}
      <path d="M 75 95 Q 88 88 100 92 Q 112 88 125 95 L 130 105 L 70 105 Z" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.5" />

      {/* TRONCO base (silhueta inferior dos músculos) */}
      <path
        d="M 60 100 Q 56 120 56 145 L 56 175 Q 58 195 62 215 L 70 235 L 130 235 L 138 215 Q 142 195 144 175 L 144 145 Q 144 120 140 100 Z"
        fill="url(#skinGradFront)" stroke={SHADOW} strokeWidth="0.7"
      />

      {/* Antebraços (não mapeados) */}
      <path d="M 32 175 Q 30 195 32 215 L 36 248 Q 40 252 46 250 L 48 215 Q 48 195 46 175 Z" fill="url(#skinGradFront)" stroke={SHADOW} strokeWidth="0.6" />
      <path d="M 168 175 Q 170 195 168 215 L 164 248 Q 160 252 154 250 L 152 215 Q 152 195 154 175 Z" fill="url(#skinGradFront)" stroke={SHADOW} strokeWidth="0.6" />
      {/* Mãos */}
      <ellipse cx="42" cy="262" rx="9" ry="14" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.6" />
      <ellipse cx="158" cy="262" rx="9" ry="14" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.6" />

      {/* Quadril/cintura (silhueta) */}
      <path d="M 70 235 Q 65 250 65 268 L 70 285 L 130 285 L 135 268 Q 135 250 130 235 Z" fill="url(#skinGradFront)" stroke={SHADOW} strokeWidth="0.7" />

      {/* Coxas silhueta (atrás das pernas mapeadas) */}
      <path d="M 68 280 Q 62 320 62 360 L 68 392 L 96 392 L 100 350 L 100 280 Z" fill="url(#skinGradFront)" stroke={SHADOW} strokeWidth="0.6" />
      <path d="M 132 280 Q 138 320 138 360 L 132 392 L 104 392 L 100 350 L 100 280 Z" fill="url(#skinGradFront)" stroke={SHADOW} strokeWidth="0.6" />

      {/* Joelhos */}
      <ellipse cx="82" cy="395" rx="11" ry="6" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.5" />
      <ellipse cx="118" cy="395" rx="11" ry="6" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.5" />

      {/* === MÚSCULOS PINTÁVEIS === */}

      {/* OMBROS — deltoides triangulares, frente */}
      <g {...handler('ombros')}>
        <path d="M 60 100 Q 50 105 46 122 Q 44 135 50 145 Q 58 142 64 132 Q 66 118 64 105 Z" />
        <path d="M 140 100 Q 150 105 154 122 Q 156 135 150 145 Q 142 142 136 132 Q 134 118 136 105 Z" />
      </g>

      {/* PEITO — peitorais (forma de U invertido com divisão central) */}
      <g {...handler('peito')}>
        {/* Peitoral esquerdo */}
        <path d="M 64 105 Q 80 102 99 108 L 99 152 Q 88 158 76 155 Q 66 152 64 142 Z" />
        {/* Peitoral direito */}
        <path d="M 136 105 Q 120 102 101 108 L 101 152 Q 112 158 124 155 Q 134 152 136 142 Z" />
      </g>
      {/* Linha esternal (sulco entre peitos) */}
      <line x1="100" y1="108" x2="100" y2="152" stroke="rgba(0,0,0,.32)" strokeWidth="0.7" pointerEvents="none" />
      {/* Sombra inferior do peito */}
      <path d="M 70 150 Q 88 158 99 152" stroke="rgba(0,0,0,.2)" strokeWidth="0.6" fill="none" pointerEvents="none" />
      <path d="M 130 150 Q 112 158 101 152" stroke="rgba(0,0,0,.2)" strokeWidth="0.6" fill="none" pointerEvents="none" />

      {/* BÍCEPS — forma de "amendoim" alongado */}
      <g {...handler('biceps')}>
        <path d="M 46 122 Q 36 132 34 155 Q 33 175 38 188 Q 46 190 50 178 Q 52 158 50 138 Z" />
        <path d="M 154 122 Q 164 132 166 155 Q 167 175 162 188 Q 154 190 150 178 Q 148 158 150 138 Z" />
      </g>
      {/* Sombra divisória do bíceps */}
      <path d="M 42 145 Q 44 165 44 180" stroke="rgba(0,0,0,.18)" strokeWidth="0.5" fill="none" pointerEvents="none" />
      <path d="M 158 145 Q 156 165 156 180" stroke="rgba(0,0,0,.18)" strokeWidth="0.5" fill="none" pointerEvents="none" />

      {/* ABDOMEN — retos abdominais (6-pack) + oblíquos */}
      <g {...handler('abdomen')}>
        {/* Bloco central dos retos */}
        <path d="M 82 152 L 118 152 Q 122 158 122 185 Q 122 215 118 235 L 82 235 Q 78 215 78 185 Q 78 158 82 152 Z" />
        {/* Oblíquos esquerdo */}
        <path d="M 70 158 Q 64 175 64 200 Q 64 220 68 235 L 78 235 Q 78 215 78 185 Q 78 168 80 152 Z" />
        {/* Oblíquos direito */}
        <path d="M 130 158 Q 136 175 136 200 Q 136 220 132 235 L 122 235 Q 122 215 122 185 Q 122 168 120 152 Z" />
      </g>
      {/* Linhas divisórias do 6-pack (decorativas) */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.32)" strokeWidth="0.7" fill="none">
        <line x1="100" y1="155" x2="100" y2="232" />
        <path d="M 82 175 Q 100 178 118 175" />
        <path d="M 80 195 Q 100 198 120 195" />
        <path d="M 80 215 Q 100 218 120 215" />
        {/* Linha alba inferior */}
      </g>

      {/* Umbigo */}
      <ellipse cx="100" cy="222" rx="1.6" ry="2.2" fill="rgba(0,0,0,.4)" pointerEvents="none" />

      {/* Cintura/V-cut (decoração) */}
      <path d="M 75 248 Q 100 260 125 248" stroke="rgba(0,0,0,.22)" strokeWidth="0.7" fill="none" pointerEvents="none" />

      {/* PERNAS — quadríceps (3 cabeças cada) + panturrilhas */}
      <g {...handler('pernas')}>
        {/* Coxa esquerda — vasto lateral + reto femoral + vasto medial */}
        <path d="M 70 285 Q 64 320 65 360 L 73 388 L 92 388 L 95 360 Q 96 320 92 285 Z" />
        {/* Coxa direita */}
        <path d="M 130 285 Q 136 320 135 360 L 127 388 L 108 388 L 105 360 Q 104 320 108 285 Z" />
      </g>
      {/* Sulcos do quadríceps esquerdo */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.6" fill="none">
        <path d="M 75 295 Q 73 330 78 380" />
        <path d="M 88 295 Q 90 330 86 380" />
        <path d="M 125 295 Q 127 330 122 380" />
        <path d="M 112 295 Q 110 330 114 380" />
      </g>

      {/* Panturrilhas (parte de pernas) */}
      <g {...handler('pernas')}>
        <path d="M 73 401 Q 70 415 71 430 L 76 460 L 90 460 L 92 435 Q 93 415 90 401 Z" />
        <path d="M 127 401 Q 130 415 129 430 L 124 460 L 110 460 L 108 435 Q 107 415 110 401 Z" />
      </g>

      {/* Pés */}
      <ellipse cx="83" cy="468" rx="11" ry="5" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.6" />
      <ellipse cx="117" cy="468" rx="11" ry="5" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.6" />

      {/* Shading vertical pra dar profundidade no corpo */}
      <rect x="56" y="100" width="88" height="135" fill="url(#bodyShade)" pointerEvents="none" opacity="0.6" />
    </svg>
  )
}

/* ────────────────────────────────────────────────────────────
   BACK VIEW
   viewBox 200×420
   Grupos: costas, ombros (delt posterior), triceps, gluteos, pernas
   ──────────────────────────────────────────────────────────── */
function BackView({ intensity, hovered, onHover }: ViewProps) {
  const handler = (m: MuscleGroup) => ({
    onPointerEnter: () => onHover(m),
    onPointerLeave: () => onHover(null),
    style: muscleStyle(intensity[m], hovered === m),
  })

  return (
    <svg viewBox="0 0 200 420" style={{ height: '100%', maxWidth: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="skinGradBack" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d8dfeb" />
          <stop offset="100%" stopColor={SKIN_DARK} />
        </radialGradient>
        <linearGradient id="bodyShadeBack" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,.15)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,.15)" />
        </linearGradient>
      </defs>

      {/* === SILHUETA === */}
      {/* Cabeça (atrás) */}
      <path
        d="M 100 12 C 86 12 76 22 76 38 C 76 48 79 56 84 62 C 84 68 82 72 80 76 L 120 76 C 118 72 116 68 116 62 C 121 56 124 48 124 38 C 124 22 114 12 100 12 Z"
        fill="url(#skinGradBack)" stroke={SHADOW} strokeWidth="0.6"
      />
      {/* Pescoço */}
      <path d="M 88 76 L 87 96 Q 100 102 113 96 L 112 76 Z" fill="url(#skinGradBack)" stroke={SHADOW} strokeWidth="0.6" />

      {/* Tronco silhueta */}
      <path
        d="M 60 100 Q 56 120 56 145 L 56 175 Q 58 195 62 215 L 70 235 L 130 235 L 138 215 Q 142 195 144 175 L 144 145 Q 144 120 140 100 Z"
        fill="url(#skinGradBack)" stroke={SHADOW} strokeWidth="0.7"
      />

      {/* Antebraços */}
      <path d="M 32 175 Q 30 195 32 215 L 36 248 Q 40 252 46 250 L 48 215 Q 48 195 46 175 Z" fill="url(#skinGradBack)" stroke={SHADOW} strokeWidth="0.6" />
      <path d="M 168 175 Q 170 195 168 215 L 164 248 Q 160 252 154 250 L 152 215 Q 152 195 154 175 Z" fill="url(#skinGradBack)" stroke={SHADOW} strokeWidth="0.6" />
      <ellipse cx="42" cy="262" rx="9" ry="14" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.6" />
      <ellipse cx="158" cy="262" rx="9" ry="14" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.6" />

      {/* Quadril */}
      <path d="M 70 235 Q 65 250 65 268 L 70 285 L 130 285 L 135 268 Q 135 250 130 235 Z" fill="url(#skinGradBack)" stroke={SHADOW} strokeWidth="0.7" />

      {/* Coxas silhueta */}
      <path d="M 68 280 Q 62 320 62 360 L 68 392 L 96 392 L 100 350 L 100 280 Z" fill="url(#skinGradBack)" stroke={SHADOW} strokeWidth="0.6" />
      <path d="M 132 280 Q 138 320 138 360 L 132 392 L 104 392 L 100 350 L 100 280 Z" fill="url(#skinGradBack)" stroke={SHADOW} strokeWidth="0.6" />

      <ellipse cx="82" cy="395" rx="11" ry="6" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.5" />
      <ellipse cx="118" cy="395" rx="11" ry="6" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.5" />

      {/* === MÚSCULOS === */}

      {/* OMBROS — deltoide posterior */}
      <g {...handler('ombros')}>
        <path d="M 60 100 Q 50 105 46 122 Q 44 135 50 145 Q 58 142 64 132 Q 66 118 64 105 Z" />
        <path d="M 140 100 Q 150 105 154 122 Q 156 135 150 145 Q 142 142 136 132 Q 134 118 136 105 Z" />
      </g>

      {/* COSTAS — trapézio + latíssimo (V-taper) + lombar */}
      <g {...handler('costas')}>
        {/* Trapézio superior (forma de losango entre pescoço e ombros) */}
        <path d="M 87 96 Q 75 105 64 115 L 70 135 Q 85 132 100 132 Q 115 132 130 135 L 136 115 Q 125 105 113 96 Z" />
        {/* Latíssimo esquerdo (V) */}
        <path d="M 64 115 Q 62 145 66 180 Q 75 195 88 195 L 99 195 L 99 145 Q 92 138 80 135 Q 70 130 64 115 Z" />
        {/* Latíssimo direito (V) */}
        <path d="M 136 115 Q 138 145 134 180 Q 125 195 112 195 L 101 195 L 101 145 Q 108 138 120 135 Q 130 130 136 115 Z" />
        {/* Lombar (parte inferior das costas) */}
        <path d="M 78 195 L 122 195 Q 125 215 122 235 L 78 235 Q 75 215 78 195 Z" />
      </g>
      {/* Coluna (sulco vertical) */}
      <line x1="100" y1="100" x2="100" y2="232" stroke="rgba(0,0,0,.35)" strokeWidth="0.8" pointerEvents="none" />
      {/* Sombras decorativas dos lats */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.55" fill="none">
        <path d="M 70 130 Q 80 160 92 188" />
        <path d="M 130 130 Q 120 160 108 188" />
        <path d="M 75 195 L 75 230" />
        <path d="M 125 195 L 125 230" />
      </g>

      {/* TRÍCEPS — 3 cabeças visíveis */}
      <g {...handler('triceps')}>
        <path d="M 46 122 Q 36 132 34 155 Q 33 175 38 188 Q 46 190 50 178 Q 52 158 50 138 Z" />
        <path d="M 154 122 Q 164 132 166 155 Q 167 175 162 188 Q 154 190 150 178 Q 148 158 150 138 Z" />
      </g>
      {/* Divisória do tríceps (cabeça longa vs lateral) */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.55" fill="none">
        <path d="M 40 140 Q 42 160 42 182" />
        <path d="M 48 142 Q 47 162 47 184" />
        <path d="M 160 140 Q 158 160 158 182" />
        <path d="M 152 142 Q 153 162 153 184" />
      </g>

      {/* GLÚTEOS — duas cúpulas arredondadas */}
      <g {...handler('gluteos')}>
        <path d="M 68 240 Q 60 255 62 280 Q 70 295 88 295 Q 99 290 99 270 L 99 245 Q 85 240 68 240 Z" />
        <path d="M 132 240 Q 140 255 138 280 Q 130 295 112 295 Q 101 290 101 270 L 101 245 Q 115 240 132 240 Z" />
      </g>
      {/* Sulco glúteo central */}
      <line x1="100" y1="245" x2="100" y2="295" stroke="rgba(0,0,0,.4)" strokeWidth="0.8" pointerEvents="none" />

      {/* PERNAS posterior — isquiotibiais + panturrilhas */}
      <g {...handler('pernas')}>
        {/* Posterior coxa esquerda */}
        <path d="M 68 295 Q 62 325 64 360 L 73 388 L 92 388 L 95 360 Q 96 325 92 295 Z" />
        {/* Posterior coxa direita */}
        <path d="M 132 295 Q 138 325 136 360 L 127 388 L 108 388 L 105 360 Q 104 325 108 295 Z" />
      </g>
      {/* Sulcos isquiotibiais (bíceps femoral / semitendinoso) */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.22)" strokeWidth="0.55" fill="none">
        <path d="M 78 305 Q 78 340 80 380" />
        <path d="M 88 305 Q 88 340 86 380" />
        <path d="M 122 305 Q 122 340 120 380" />
        <path d="M 112 305 Q 112 340 114 380" />
      </g>

      {/* Panturrilhas — gastrocnêmio bicéfalo (forma de coração) */}
      <g {...handler('pernas')}>
        <path d="M 72 401 Q 67 420 70 440 L 78 460 L 90 460 L 93 435 Q 94 415 90 401 Z" />
        <path d="M 128 401 Q 133 420 130 440 L 122 460 L 110 460 L 107 435 Q 106 415 110 401 Z" />
      </g>
      {/* Sulco central da panturrilha */}
      <g pointerEvents="none" stroke="rgba(0,0,0,.25)" strokeWidth="0.6" fill="none">
        <line x1="82" y1="408" x2="82" y2="455" />
        <line x1="118" y1="408" x2="118" y2="455" />
      </g>

      {/* Pés */}
      <ellipse cx="83" cy="468" rx="11" ry="5" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.6" />
      <ellipse cx="117" cy="468" rx="11" ry="5" fill={SKIN_DARK} stroke={SHADOW} strokeWidth="0.6" />

      <rect x="56" y="100" width="88" height="135" fill="url(#bodyShadeBack)" pointerEvents="none" opacity="0.6" />
    </svg>
  )
}
