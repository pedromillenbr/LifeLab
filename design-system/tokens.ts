// src/design-system/tokens.ts
// Design System – High Performance Biohacking (AuraLab v2)

export const colors = {
  bg: {
    base:     '#0b0c10',
    surface:  'rgba(255,255,255,0.04)',
    card:     'rgba(255,255,255,0.05)',
    elevated: 'rgba(255,255,255,0.07)',
    overlay:  'rgba(11,12,16,0.85)',
  },
  border: {
    DEFAULT: 'rgba(255,255,255,0.09)',
    hover:   'rgba(255,255,255,0.18)',
    focus:   'rgba(34,197,94,0.40)',
    gold:    'rgba(234,179,8,0.25)',
  },
  green: {
    DEFAULT:  '#22c55e',
    subtle:   '#4ade80',
    light:    '#86efac',
    glow:     'rgba(34,197,94,0.28)',
    glowSoft: 'rgba(34,197,94,0.13)',
    g07:      'rgba(34,197,94,0.07)',
    g12:      'rgba(34,197,94,0.12)',
    g20:      'rgba(34,197,94,0.20)',
    g30:      'rgba(34,197,94,0.30)',
    g40:      'rgba(34,197,94,0.40)',
    g50:      'rgba(34,197,94,0.50)',
  },
  gold: {
    DEFAULT:  '#eab308',
    hi:       '#facc15',
    light:    '#fde68a',
    glow:     'rgba(234,179,8,0.28)',
    glowSoft: 'rgba(234,179,8,0.11)',
  },
  cyan: {
    DEFAULT:  '#06b6d4',
    glow:     'rgba(6,182,212,0.25)',
    glowSoft: 'rgba(6,182,212,0.12)',
  },
  danger: {
    DEFAULT:  '#f87171',
    glow:     'rgba(248,113,113,0.30)',
  },
  text: {
    primary:   'rgba(255,255,255,0.93)',
    secondary: 'rgba(255,255,255,0.55)',
    tertiary:  'rgba(255,255,255,0.30)',
    disabled:  'rgba(255,255,255,0.15)',
    inverse:   '#000000',
  },
} as const;

export const spacing = {
  0: '0px', 0.5: '2px', 1: '4px', 1.5: '6px', 2: '8px', 2.5: '10px',
  3: '12px', 3.5: '14px', 4: '16px', 5: '20px', 6: '24px', 7: '28px',
  8: '32px', 9: '36px', 10: '40px', 12: '48px', 14: '56px', 16: '64px',
  20: '80px', 24: '96px',
} as const;

export const radius = {
  none: '0px', sm: '6px', md: '9px', lg: '14px', xl: '18px',
  '2xl': '24px', badge: '20px', full: '9999px',
} as const;

export const zIndex = {
  base: 0, raised: 10, overlay: 20, modal: 30, toast: 40, tooltip: 50,
} as const;

export const fonts = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
} as const;

export const display = {
  hero: { fontSize: '56px', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1 },
  xl:   { fontSize: '48px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 },
  lg:   { fontSize: '36px', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1 },
  md:   { fontSize: '28px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 },
  sm:   { fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em',  lineHeight: 1.2 },
  xs:   { fontSize: '20px', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 },
} as const;

export const body = {
  lg:    { fontSize: '16px', fontWeight: 400, lineHeight: 1.6 },
  md:    { fontSize: '14px', fontWeight: 400, lineHeight: 1.6 },
  sm:    { fontSize: '13px', fontWeight: 400, lineHeight: 1.5 },
  xs:    { fontSize: '12px', fontWeight: 400, lineHeight: 1.5 },
  '2xs': { fontSize: '11px', fontWeight: 400, lineHeight: 1.4 },
} as const;

export const mono = {
  lg:    { fontSize: '16px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' },
  md:    { fontSize: '14px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' },
  sm:    { fontSize: '13px', fontWeight: 400, fontFamily: 'JetBrains Mono, monospace' },
  xs:    { fontSize: '12px', fontWeight: 400, fontFamily: 'JetBrains Mono, monospace' },
  '2xs': { fontSize: '11px', fontWeight: 400, fontFamily: 'JetBrains Mono, monospace' },
} as const;

export const label = {
  DEFAULT: { fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' as const },
  sm:      { fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
} as const;

export const glow = {
  green:     '0 0 20px rgba(34,197,94,0.40), 0 0 40px rgba(34,197,94,0.20)',
  greenSoft: '0 0 12px rgba(34,197,94,0.25), 0 0 24px rgba(34,197,94,0.10)',
  greenHard: '0 0 32px rgba(34,197,94,0.60), 0 0 64px rgba(34,197,94,0.30)',
  gold:      '0 0 16px rgba(234,179,8,0.50),  0 0 32px rgba(234,179,8,0.25)',
  goldSoft:  '0 0 10px rgba(234,179,8,0.30)',
  cyan:      '0 0 16px rgba(6,182,212,0.40),  0 0 32px rgba(6,182,212,0.20)',
  red:       '0 0 16px rgba(248,113,113,0.40)',
} as const;

export const cardShadow = {
  DEFAULT: '0 8px 32px rgba(0,0,0,0.50)',
  hover:   '0 12px 48px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.18)',
  float:   '0 24px 64px rgba(0,0,0,0.70)',
  green:   '0 8px 32px rgba(0,0,0,0.50), 0 0 32px rgba(34,197,94,0.12)',
  gold:    '0 8px 32px rgba(0,0,0,0.50), 0 0 32px rgba(234,179,8,0.12)',
} as const;

export const dropFilter = {
  green:     'drop-shadow(0 0 8px rgba(34,197,94,0.70))',
  greenSoft: 'drop-shadow(0 0 4px rgba(34,197,94,0.45))',
  gold:      'drop-shadow(0 0 12px rgba(234,179,8,0.80))',
  goldSoft:  'drop-shadow(0 0 6px rgba(234,179,8,0.50))',
  red:       'drop-shadow(0 0 8px rgba(248,113,113,0.60))',
} as const;

export const cardVariants = {
  default: {
    background:  colors.bg.card,
    border:      colors.border.DEFAULT,
    hoverShadow: cardShadow.hover,
  },
  green: {
    background:  colors.green.g07,
    border:      colors.green.g20,
    hoverShadow: cardShadow.green,
  },
  gold: {
    background:  'rgba(234,179,8,0.05)',
    border:      colors.border.gold,
    hoverShadow: cardShadow.gold,
  },
  elevated: {
    background:  colors.bg.elevated,
    border:      'rgba(255,255,255,0.12)',
    hoverShadow: '0 16px 56px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.22)',
  },
} as const;

export type CardVariant = keyof typeof cardVariants;

export const duration = {
  fast: 0.15, normal: 0.25, slow: 0.45, xslow: 0.8,
} as const;

export const ease = {
  spring: [0.22, 0.68, 0, 1.2] as const,
  out:    [0.0,  0.0,  0.2, 1] as const,
  inOut:  [0.4,  0.0,  0.2, 1] as const,
} as const;
