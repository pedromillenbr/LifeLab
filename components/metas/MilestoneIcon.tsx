'use client'
import { Trophy, Flame, Zap, Sparkles, Check, Star } from 'lucide-react'
import type { MilestoneIconKey } from '@/lib/goals'

/** Ícone lucide consistente em qualquer SO (substitui emojis Unicode). */
export function MilestoneIcon({
  iconKey, size = 16, color, strokeWidth = 2,
}: {
  iconKey: MilestoneIconKey
  size?: number
  color?: string
  strokeWidth?: number
}) {
  const props = { size, color, strokeWidth }
  switch (iconKey) {
    case 'trophy':  return <Trophy {...props} />
    case 'flame':   return <Flame {...props} />
    case 'zap':     return <Zap {...props} />
    case 'check':   return <Check {...props} strokeWidth={3} />
    case 'star':    return <Star {...props} />
    default:        return <Sparkles {...props} />
  }
}
