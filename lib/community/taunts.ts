// ════════════════════════════════════════════════════════════════════
//  LifeLab — System-generated taunts
//  These are NOT user-to-user messages. The system surfaces them as
//  toasts/banners based on the user's real ranking state. Tone is
//  intentionally aggressive, masculine and uncomfortable — that's the
//  product, not a bug.
// ════════════════════════════════════════════════════════════════════

export type TauntCategory =
  | 'fell_positions'   // user dropped N spots
  | 'overtaken'        // someone passed the user
  | 'idle'             // no XP for >24h
  | 'near_top'         // ≤500 XP from a milestone
  | 'rival_active'     // the rival above you trained today
  | 'top_distance'     // generic top-of-board pressure
  | 'monthly_pressure' // season is closing soon
  | 'mediocrity'       // generic motivational provocation

export interface TauntContext {
  positionsLost?:   number
  overtakenBy?:     string  // display_name
  hoursIdle?:       number
  xpToNextMilestone?: number
  nextMilestoneLabel?: string  // 'Top 50' | 'Top 10' | 'próxima divisão'
  rivalName?:       string
  daysToSeasonEnd?: number
}

const POOL: Record<TauntCategory, string[]> = {
  fell_positions: [
    'Você caiu {N} posições.',
    'Enquanto você descansava, alguém subiu.',
    'O ranking não esquece quem para.',
    'Cada folga sua é uma posição perdida.',
  ],
  overtaken: [
    '{NAME} ultrapassou você.',
    '{NAME} trabalhou enquanto você não.',
    '{NAME} passou. E não está olhando para trás.',
  ],
  idle: [
    'Mais um dia medíocre?',
    'Você desistiu ou só cansou?',
    'O topo continua sem você.',
    'Disciplina não negocia.',
    'Até agora nada?',
  ],
  near_top: [
    'Você está a {XP} XP de {LABEL}.',
    'Faltam {XP} XP. Decide o quanto isso te incomoda.',
    'A diferença para {LABEL}: {XP} XP.',
  ],
  rival_active: [
    'Seu rival treinou hoje. E você?',
    '{NAME} está somando enquanto você lê isso.',
    '{NAME} não tirou folga.',
  ],
  top_distance: [
    'O topo não te conhece.',
    'O topo continua sem você.',
    'Os primeiros lugares não te esperam.',
  ],
  monthly_pressure: [
    'Faltam {DAYS} dias para a season fechar.',
    '{DAYS} dias. Depois o ranking congela.',
    'Sua posição final começa a ser decidida agora.',
  ],
  mediocrity: [
    'O ranking lembra quem trabalha.',
    'Disciplina não negocia.',
    'Treina ou reclama.',
    'Cada dia conta. Esse também.',
  ],
}

function fill(template: string, ctx: TauntContext): string {
  return template
    .replace('{N}',     String(ctx.positionsLost ?? 0))
    .replace('{NAME}',  ctx.overtakenBy ?? ctx.rivalName ?? 'alguém')
    .replace('{XP}',    (ctx.xpToNextMilestone ?? 0).toLocaleString('pt-BR'))
    .replace('{LABEL}', ctx.nextMilestoneLabel ?? 'a próxima divisão')
    .replace('{DAYS}',  String(ctx.daysToSeasonEnd ?? 0))
}

/** Pick a random line from a category, deterministic per (category, day). */
export function getTaunt(category: TauntCategory, ctx: TauntContext = {}): string {
  const lines = POOL[category]
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 6))
  const idx = Math.abs(hashCode(`${category}:${dayBucket}`)) % lines.length
  return fill(lines[idx], ctx)
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return h
}

// ── Heuristics that decide whether to show a taunt ───────────────────

export interface TauntDecisionInput {
  hoursSinceLastXP:  number
  positionMovement:  number   // negative = dropped
  xpToNextMilestone: number | null
  nextMilestoneLabel: string | null
  daysToSeasonEnd:   number
  /** Rival = the user immediately above the current user in the ranking. */
  rivalDisplayName?: string
  rivalActiveToday?: boolean
}

export interface DecidedTaunt {
  category: TauntCategory
  message:  string
  severity: 'low' | 'mid' | 'high'
}

export function decideTaunt(input: TauntDecisionInput): DecidedTaunt | null {
  // Highest priority: someone close above you got active today
  if (input.rivalActiveToday && input.rivalDisplayName) {
    return {
      category: 'rival_active',
      message: getTaunt('rival_active', { rivalName: input.rivalDisplayName }),
      severity: 'high',
    }
  }
  // Dropped positions in the snapshot window
  if (input.positionMovement < 0) {
    return {
      category: 'fell_positions',
      message: getTaunt('fell_positions', { positionsLost: Math.abs(input.positionMovement) }),
      severity: 'high',
    }
  }
  // Idle for over a day
  if (input.hoursSinceLastXP >= 24) {
    return {
      category: 'idle',
      message: getTaunt('idle'),
      severity: 'mid',
    }
  }
  // Close to a milestone
  if (input.xpToNextMilestone != null && input.xpToNextMilestone > 0 && input.xpToNextMilestone <= 500) {
    return {
      category: 'near_top',
      message: getTaunt('near_top', {
        xpToNextMilestone: input.xpToNextMilestone,
        nextMilestoneLabel: input.nextMilestoneLabel ?? 'a próxima divisão',
      }),
      severity: 'mid',
    }
  }
  // Season closing in 5 days or less
  if (input.daysToSeasonEnd > 0 && input.daysToSeasonEnd <= 5) {
    return {
      category: 'monthly_pressure',
      message: getTaunt('monthly_pressure', { daysToSeasonEnd: input.daysToSeasonEnd }),
      severity: 'mid',
    }
  }
  return null
}
