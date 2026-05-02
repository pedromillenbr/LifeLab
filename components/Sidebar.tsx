'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Dumbbell, CheckSquare, Target,
  DollarSign, Calendar, BookOpen, Sparkles, Settings, Timer
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/fisico',     icon: Dumbbell,        label: 'Físico' },
  { href: '/habitos',    icon: CheckSquare,     label: 'Hábitos' },
  { href: '/missoes',    icon: Target,          label: 'Missões' },
  { href: '/foco',       icon: Timer,           label: 'Foco' },
  { href: '/financeiro', icon: DollarSign,      label: 'Financeiro' },
  { href: '/calendario', icon: Calendar,        label: 'Calendário' },
  { href: '/espiritual', icon: BookOpen,        label: 'Espiritual' },
  { href: '/ai',         icon: Sparkles,        label: 'Life AI' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useStore()

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full w-[56px] flex-col items-center py-4 gap-2 z-50"
      style={{
        background: 'rgba(11,12,16,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-primary-border)',
        boxShadow: '2px 0 16px rgba(0,0,0,0.35), 0 0 32px rgba(34,197,94,0.05)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-250"
        style={{
          background: 'var(--color-primary-muted)',
          border: '1px solid var(--color-primary-border)',
          boxShadow: 'var(--shadow-glow-sm)',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow-sm)')}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path
            d="M5 2.2 V12 H11.4"
            stroke="var(--color-primary)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 w-full px-2 flex-1">
        {NAV.map(({ href, icon: Icon, label }, idx) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={label}
              onClick={e => (e.currentTarget as HTMLElement).blur()}
              className="w-full h-10 rounded-xl flex items-center justify-center relative group transition-all duration-250"
              style={{
                animationDelay: `${idx * 40}ms`,
                background: active ? 'var(--color-primary-muted)' : 'transparent',
                border: active ? '1px solid var(--color-primary-border)' : '1px solid transparent',
                boxShadow: active ? 'var(--shadow-glow-sm)' : 'none',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.07)'
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.4 : 1.8}
                style={{
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  transition: 'color 180ms, filter 180ms',
                  filter: active ? 'drop-shadow(0 0 6px var(--color-primary-glow))' : 'none',
                }}
                className="group-hover:scale-110 transition-transform duration-200"
              />

              {/* Indicador ativo */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{
                    background: 'var(--color-primary)',
                    boxShadow: '0 0 8px var(--color-primary-glow)',
                  }}
                />
              )}

              {/* Tooltip */}
              <span
                className="absolute left-full ml-3 px-3 py-1.5 text-xs font-medium rounded-lg
                           opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                           transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-50"
                style={{
                  background: 'var(--color-bg-2)',
                  border: '1px solid var(--color-primary-border)',
                  boxShadow: 'var(--shadow-card)',
                  color: 'var(--color-text-main)',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-1 w-full px-2">
        <Link
          href="/configuracoes"
          title="Configurações"
          className="w-full h-10 rounded-xl flex items-center justify-center group relative transition-all duration-250"
          style={{
            background: pathname.startsWith('/configuracoes') ? 'var(--color-primary-muted)' : 'transparent',
            border: pathname.startsWith('/configuracoes') ? '1px solid var(--color-primary-border)' : '1px solid transparent',
          }}
        >
          <Settings
            size={18}
            strokeWidth={1.8}
            style={{ color: pathname.startsWith('/configuracoes') ? 'var(--color-primary)' : 'var(--color-text-muted)', transition: 'color 180ms' }}
            className="group-hover:rotate-45 transition-transform duration-300"
          />
          <span
            className="absolute left-full ml-3 px-3 py-1.5 text-xs font-medium rounded-lg
                       opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50"
            style={{
              background: 'var(--color-bg-2)',
              border: '1px solid var(--color-primary-border)',
              boxShadow: 'var(--shadow-card)',
              color: 'var(--color-text-main)',
            }}
          >
            Configurações
          </span>
        </Link>

        {/* Avatar */}
        <Link href="/configuracoes" title={profile.name} className="flex justify-center mt-2 group">
          <div
            className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-250"
            style={{ border: '1.5px solid var(--color-primary-border)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 2px var(--color-primary-glow)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
              >
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </aside>
  )
}
