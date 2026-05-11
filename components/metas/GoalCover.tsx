'use client'
import type { Goal } from '@/store/types'
import { getCoverPreset, getPresetForCategory } from '@/lib/goals'

interface GoalCoverProps {
  goal: Pick<Goal, 'coverImage' | 'coverPreset' | 'category' | 'title'>
  height?: number | string
  /** Maior = mais imersivo (header de detalhe). Menor = card de listagem. */
  variant?: 'card' | 'hero'
  rounded?: number
  children?: React.ReactNode
}

/**
 * Cover da meta com 3 camadas:
 *   1. Imagem (se houver) ou gradient do preset
 *   2. Overlay escuro radial (legibilidade do conteúdo sobreposto)
 *   3. Glow de borda + ícone fantasma sutil (só no hero)
 */
export function GoalCover({ goal, height = 180, variant = 'card', rounded = 16, children }: GoalCoverProps) {
  const preset = goal.coverPreset
    ? getCoverPreset(goal.coverPreset)
    : getPresetForCategory(goal.category)
  const Icon = preset.icon
  const isHero = variant === 'hero'

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        borderRadius: rounded,
        overflow: 'hidden',
        background: goal.coverImage ? '#0a0d14' : preset.gradient,
        boxShadow: isHero
          ? `inset 0 -80px 80px -20px rgba(0,0,0,.85), 0 0 1px ${preset.accent}33`
          : `inset 0 -40px 40px -10px rgba(0,0,0,.65)`,
      }}
    >
      {/* Imagem de fundo */}
      {goal.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={goal.coverImage}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.65,
            filter: 'saturate(1.1) contrast(1.05)',
          }}
        />
      )}
      {/* Overlay para legibilidade — gradient diagonal escuro */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, rgba(8,10,16,.55) 0%, rgba(8,10,16,.25) 35%, rgba(8,10,16,.85) 100%)`,
        }}
      />
      {/* Cor de marca sutil no canto superior */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 60,
          background: `radial-gradient(ellipse at 25% 0%, ${preset.accent}30 0%, transparent 70%)`,
        }}
      />
      {/* Ícone fantasma gigante no hero */}
      {isHero && (
        <Icon
          aria-hidden="true"
          size={220}
          style={{
            position: 'absolute',
            right: -40, bottom: -40,
            color: preset.accent,
            opacity: 0.07,
            strokeWidth: 1,
          }}
        />
      )}
      {/* Conteúdo (título, métricas, etc) */}
      {children && (
        <div style={{ position: 'relative', height: '100%', zIndex: 1 }}>
          {children}
        </div>
      )}
    </div>
  )
}
