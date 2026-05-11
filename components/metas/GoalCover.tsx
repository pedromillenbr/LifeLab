'use client'
import { useState, useEffect } from 'react'
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
 *   1. Imagem (se houver e carregar) ou gradient do preset
 *   2. Overlay escuro radial (legibilidade do conteúdo sobreposto)
 *   3. Glow de borda + ícone fantasma sutil (só no hero)
 *
 * Fallback gracioso: se a URL da imagem falhar (404, CORS, hotlink bloqueado),
 * volta automaticamente pro gradient do preset sem quebrar layout.
 */
export function GoalCover({ goal, height = 180, variant = 'card', rounded = 16, children }: GoalCoverProps) {
  const preset = goal.coverPreset
    ? getCoverPreset(goal.coverPreset)
    : getPresetForCategory(goal.category)
  const Icon = preset.icon
  const isHero = variant === 'hero'

  // Estado da imagem: 'loading' enquanto não responde, 'ok' carregou, 'err' falhou.
  const [imgState, setImgState] = useState<'loading' | 'ok' | 'err'>(
    goal.coverImage ? 'loading' : 'err',
  )
  // Reset quando o URL muda
  useEffect(() => {
    setImgState(goal.coverImage ? 'loading' : 'err')
  }, [goal.coverImage])

  const useImage = goal.coverImage && imgState !== 'err'

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        borderRadius: rounded,
        overflow: 'hidden',
        background: useImage ? '#0a0d14' : preset.gradient,
        boxShadow: isHero
          ? `inset 0 -80px 80px -20px rgba(0,0,0,.85), 0 0 1px ${preset.accent}33`
          : `inset 0 -40px 40px -10px rgba(0,0,0,.65)`,
      }}
    >
      {/* Imagem de fundo */}
      {useImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={goal.coverImage}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          onLoad={() => setImgState('ok')}
          onError={() => setImgState('err')}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: imgState === 'ok' ? 0.7 : 0,
            transition: 'opacity .35s ease',
            filter: 'saturate(1.1) contrast(1.05)',
          }}
        />
      )}
      {/* Enquanto a imagem carrega ou se falhou, o gradient fica visível por baixo */}
      {goal.coverImage && imgState === 'loading' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: preset.gradient,
            opacity: 1,
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
