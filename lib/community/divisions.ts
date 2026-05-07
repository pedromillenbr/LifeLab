// ════════════════════════════════════════════════════════════════════
//  LifeLab — Division hierarchy
//  Mirror of public.division_for_xp() in supabase/community.sql.
//  KEEP THESE THRESHOLDS IN SYNC.
// ════════════════════════════════════════════════════════════════════

export type DivisionKey =
  | 'ze_bosta'
  | 'faixa_branca'
  | 'sargento'
  | 'cara_focado'
  | 'obstinado'
  | 'capitao'
  | 'goggins'
  | 'pele'

export interface Division {
  key:        DivisionKey
  rank:       number   // 1..8
  name:       string
  short:      string
  tagline:    string
  /** Inclusive lower bound; the next division's `min` is the upper bound. */
  min:        number
  /** Metallic accent color used on badges and chips. NOT the brand green. */
  metal:      string
  /** Glow color applied around badges; should match the metal but softer. */
  glow:       string
  /** Optional top-tier flag for cinematic treatment. */
  mythic?:    boolean
}

// ⚠ The threshold curve is intentionally aggressive at the bottom (1→2→3
// happens FAST to hook the user) and exponential after rank 4 (~30 days
// of consistent use ≈ 3000 XP).
export const DIVISIONS: Division[] = [
  {
    key: 'ze_bosta',     rank: 1, name: 'Zé Bosta',
    short: 'Zé Bosta',   tagline: 'O começo da mudança.',
    min: 0,    metal: '#5a5a5a', glow: 'rgba(90,90,90,0.30)',
  },
  {
    key: 'faixa_branca', rank: 2, name: 'Faixa Branca da Disciplina',
    short: 'Faixa Branca', tagline: 'O primeiro corte.',
    min: 50,   metal: '#e5e5e5', glow: 'rgba(229,229,229,0.30)',
  },
  {
    key: 'sargento',     rank: 3, name: 'Sargento do Foco',
    short: 'Sargento',   tagline: 'Já não há recuo.',
    min: 200,  metal: '#a07845', glow: 'rgba(160,120,69,0.35)',
  },
  {
    key: 'cara_focado',  rank: 4, name: 'Apenas um Cara Focado',
    short: 'Cara Focado', tagline: 'Trinta dias sem ceder.',
    min: 800,  metal: '#7a92a8', glow: 'rgba(122,146,168,0.35)',
  },
  {
    key: 'obstinado',    rank: 5, name: 'Obstinado em Vencer',
    short: 'Obstinado',  tagline: 'A constância virou identidade.',
    min: 3000, metal: '#c8c8d0', glow: 'rgba(200,200,208,0.40)',
  },
  {
    key: 'capitao',      rank: 6, name: 'Capitão América Antes do Soro',
    short: 'Capitão',    tagline: 'Sem soro. Só vontade.',
    min: 8000, metal: '#b8975a', glow: 'rgba(184,151,90,0.45)',
  },
  {
    key: 'goggins',      rank: 7, name: 'David Goggins da Shopee',
    short: 'Goggins',    tagline: 'Quem te conhece sabe.',
    min: 20000, metal: '#eab308', glow: 'rgba(234,179,8,0.50)',
  },
  {
    key: 'pele',         rank: 8, name: 'Pelé do LifeLab',
    short: 'Pelé',       tagline: 'Lendário. Quase mítico.',
    min: 50000, metal: '#facc15', glow: 'rgba(250,204,21,0.65)',
    mythic: true,
  },
]

const BY_KEY: Record<DivisionKey, Division> = Object.fromEntries(
  DIVISIONS.map(d => [d.key, d]),
) as Record<DivisionKey, Division>

export function divisionForXP(xp: number): Division {
  let current = DIVISIONS[0]
  for (const d of DIVISIONS) {
    if (xp >= d.min) current = d
    else break
  }
  return current
}

export function getDivision(key: DivisionKey): Division {
  return BY_KEY[key] ?? DIVISIONS[0]
}

export function nextDivision(xp: number): Division | null {
  const cur = divisionForXP(xp)
  const next = DIVISIONS.find(d => d.rank === cur.rank + 1)
  return next ?? null
}

/** Returns 0..1 progress toward the next division. 1 if already at top. */
export function divisionProgress(xp: number): number {
  const cur = divisionForXP(xp)
  const next = nextDivision(xp)
  if (!next) return 1
  const span = next.min - cur.min
  return Math.max(0, Math.min(1, (xp - cur.min) / span))
}

/** XP delta required to reach the next division. 0 if already at top. */
export function xpToNextDivision(xp: number): number {
  const next = nextDivision(xp)
  return next ? Math.max(0, next.min - xp) : 0
}
