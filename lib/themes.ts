/**
 * Esquemas de cores selecionáveis pelo usuário.
 * Cada tema redefine as CSS variables `--color-primary*`,
 * `--shadow-glow*` e `--gold*` em runtime.
 */

export interface Theme {
  key: string
  name: string
  description: string
  primary: string
  primaryLight: string
  primaryDark: string
  primaryRgb: string // "r, g, b"
  accent: string
  accentRgb: string
}

export const THEMES: Theme[] = [
  {
    key: 'verde',
    name: 'Verde Esmeralda',
    description: 'Verde + Dourado',
    primary: '#22c55e',
    primaryLight: '#4ade80',
    primaryDark: '#16a34a',
    primaryRgb: '34, 197, 94',
    accent: '#ffbf00',
    accentRgb: '234, 178, 8',
  },
  {
    key: 'roxo',
    name: 'Aurora Violeta',
    description: 'Roxo + Magenta',
    primary: '#a855f7',
    primaryLight: '#c084fc',
    primaryDark: '#7c3aed',
    primaryRgb: '168, 85, 247',
    accent: '#ec4899',
    accentRgb: '236, 72, 153',
  },
  {
    key: 'cyan',
    name: 'Quantum Cyan',
    description: 'Ciano + Âmbar',
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    primaryDark: '#0891b2',
    primaryRgb: '6, 182, 212',
    accent: '#f59e0b',
    accentRgb: '245, 158, 11',
  },
]

export const DEFAULT_THEME_KEY = 'verde'

export function getTheme(key: string): Theme {
  return THEMES.find(t => t.key === key) ?? THEMES[0]
}

export function applyTheme(key: string) {
  if (typeof document === 'undefined') return
  const t = getTheme(key)
  const r = document.documentElement.style

  r.setProperty('--color-primary', t.primary)
  r.setProperty('--color-primary-light', t.primaryLight)
  r.setProperty('--color-primary-dark', t.primaryDark)
  r.setProperty('--color-primary-rgb', t.primaryRgb)
  r.setProperty('--color-accent-rgb', t.accentRgb)
  r.setProperty('--color-primary-muted', `rgba(${t.primaryRgb}, 0.12)`)
  r.setProperty('--color-primary-border', `rgba(${t.primaryRgb}, 0.30)`)
  r.setProperty('--color-primary-glow', `rgba(${t.primaryRgb}, 0.30)`)

  r.setProperty('--color-border-focus', `rgba(${t.primaryRgb}, 0.50)`)
  r.setProperty('--color-border-hover', `rgba(${t.primaryRgb}, 0.18)`)

  r.setProperty('--shadow-glow', `0 0 20px rgba(${t.primaryRgb}, 0.40), 0 0 40px rgba(${t.primaryRgb}, 0.20)`)
  r.setProperty('--shadow-glow-sm', `0 0 12px rgba(${t.primaryRgb}, 0.25), 0 0 24px rgba(${t.primaryRgb}, 0.10)`)

  r.setProperty('--gold', t.accent)
  r.setProperty('--gold10', `rgba(${t.accentRgb}, 0.12)`)
  r.setProperty('--gold-glow', `rgba(${t.accentRgb}, 0.55)`)

  r.setProperty('--shadow-gold', `0 0 16px rgba(${t.accentRgb}, 0.50), 0 0 32px rgba(${t.accentRgb}, 0.25)`)
}
