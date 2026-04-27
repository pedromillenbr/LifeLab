/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './design-system/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Fonts ────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        body:    ["'Inter'", 'system-ui', 'sans-serif'],
        display: ["'Syne'", 'system-ui', 'sans-serif'],
        mono:    ["'JetBrains Mono'", 'Fira Code', 'monospace'],
      },

      // ── Colors (AuraLab v2 + retrocompat) ────────────────
      colors: {
        // AuraLab v2
        bg: {
          base:     '#0b0c10',
          surface:  'rgba(255,255,255,0.04)',
          card:     'rgba(255,255,255,0.05)',
          elevated: 'rgba(255,255,255,0.07)',
          overlay:  'rgba(11,12,16,0.85)',
        },
        green: {
          DEFAULT: '#22c55e',
          subtle:  '#4ade80',
          light:   '#86efac',
        },
        gold: {
          DEFAULT: '#eab308',
          hi:      '#facc15',
          light:   '#fde68a',
        },
        cyan: {
          DEFAULT: '#06b6d4',
        },
        danger: {
          DEFAULT: '#f87171',
        },
        text: {
          primary:   'rgba(255,255,255,0.93)',
          secondary: 'rgba(255,255,255,0.55)',
          tertiary:  'rgba(255,255,255,0.30)',
          disabled:  'rgba(255,255,255,0.15)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.09)',
          hover:   'rgba(255,255,255,0.18)',
          focus:   'rgba(34,197,94,0.40)',
          gold:    'rgba(234,179,8,0.25)',
        },

        // Retrocompat (apontam para verde — paleta v2)
        primary: {
          DEFAULT: '#22c55e',
          light:   '#4ade80',
          dark:    '#16a34a',
          muted:   'rgba(34,197,94,0.12)',
        },
        'bg-1': '#0b0c10',
        'bg-2': '#111318',
        'bg-3': '#181C23',
        'bg-4': '#1F2430',
        'text-main':   '#F0F2F5',
        'text-muted':  '#9CA3AF',
        'text-subtle': '#4B5563',
        'success': '#22C55E',
        'error':   '#EF4444',
        'warning': '#F5A623',
        'info':    '#38BDF8',
      },

      // ── Border radius ────────────────────────────────────
      borderRadius: {
        sm:    '6px',
        md:    '10px',
        lg:    '14px',
        xl:    '18px',
        '2xl': '24px',
        card:  '14px',
        input: '9px',
        btn:   '9px',
        badge: '20px',
      },

      // ── Box shadows ──────────────────────────────────────
      boxShadow: {
        'glow-green':      '0 0 20px rgba(34,197,94,0.40), 0 0 40px rgba(34,197,94,0.20)',
        'glow-green-soft': '0 0 12px rgba(34,197,94,0.25), 0 0 24px rgba(34,197,94,0.10)',
        'glow-green-hard': '0 0 32px rgba(34,197,94,0.60), 0 0 64px rgba(34,197,94,0.30)',
        'glow-gold':       '0 0 16px rgba(234,179,8,0.50),  0 0 32px rgba(234,179,8,0.25)',
        'glow-gold-soft':  '0 0 10px rgba(234,179,8,0.30)',
        'glow-cyan':       '0 0 16px rgba(6,182,212,0.40),  0 0 32px rgba(6,182,212,0.20)',
        'glow-red':        '0 0 16px rgba(248,113,113,0.40)',
        'card':            '0 8px 32px rgba(0,0,0,0.50)',
        'card-hover':      '0 12px 48px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.18)',
        'card-float':      '0 24px 64px rgba(0,0,0,0.70)',
        'card-green':      '0 8px 32px rgba(0,0,0,0.50), 0 0 32px rgba(34,197,94,0.12)',
        'card-gold':       '0 8px 32px rgba(0,0,0,0.50), 0 0 32px rgba(234,179,8,0.12)',
        // retrocompat
        'modal':           '0 8px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(34,197,94,0.12)',
        'glow':            '0 0 24px rgba(34,197,94,0.28)',
        'glow-sm':         '0 0 12px rgba(34,197,94,0.20)',
        'gold':            '0 0 18px rgba(234,179,8,0.30)',
      },

      // ── Backdrop blur ────────────────────────────────────
      backdropBlur: {
        card:    '24px',
        sidebar: '20px',
        modal:   '32px',
      },

      // ── Keyframes ────────────────────────────────────────
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        nameGlow: {
          '0%,100%': { textShadow: '0 0 12px rgba(34,197,94,.50), 0 0 30px rgba(34,197,94,.20)' },
          '50%':     { textShadow: '0 0 24px rgba(34,197,94,.85), 0 0 60px rgba(34,197,94,.40), 0 0 90px rgba(34,197,94,.15)' },
        },
        liquidFlow: {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        meshDrift: {
          '0%':   { transform: 'translate(0,0) scale(1)' },
          '33%':  { transform: 'translate(3%,2%) scale(1.02)' },
          '66%':  { transform: 'translate(-2%,3%) scale(0.99)' },
          '100%': { transform: 'translate(2%,-2%) scale(1.01)' },
        },
      },

      animation: {
        'fade-up':      'fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) both',
        'fade-in':      'fadeIn 0.4s ease both',
        'name-glow':    'nameGlow 3s ease-in-out infinite',
        'liquid-flow':  'liquidFlow 2.5s linear infinite',
        'mesh-drift':   'meshDrift 18s ease-in-out infinite alternate',
      },

      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
