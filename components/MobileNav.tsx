'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store/useStore'
import {
  LayoutDashboard, Dumbbell, CheckSquare, Target,
  DollarSign, Calendar, BookOpen, Sparkles, Settings, Menu, X, Timer, UtensilsCrossed,
} from 'lucide-react'

const NAV = [
  { href: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/fisico',     icon: Dumbbell,        label: 'Físico' },
  { href: '/dieta',      icon: UtensilsCrossed, label: 'Dieta' },
  { href: '/habitos',    icon: CheckSquare,     label: 'Hábitos' },
  { href: '/missoes',    icon: Target,          label: 'Missões' },
  { href: '/foco',       icon: Timer,           label: 'Foco' },
  { href: '/financeiro', icon: DollarSign,      label: 'Financeiro' },
  { href: '/calendario', icon: Calendar,        label: 'Calendário' },
  { href: '/espiritual', icon: BookOpen,        label: 'Espiritual' },
  { href: '/ai',         icon: Sparkles,        label: 'Life AI' },
]

export function MobileNav() {
  const pathname = usePathname()
  const { profile } = useStore()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Topbar — mobile only */}
      <div
        className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between h-14 px-4"
        style={{
          background: 'rgba(11,12,16,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-primary-border)',
        }}
      >
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
          className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: 'var(--color-bg-2)',
            border: '1px solid var(--color-primary-border)',
            color: 'var(--color-primary)',
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-primary-muted)', border: '1px solid var(--color-primary-border)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L13 13H10.5L8 7.5L5.5 13H3Z" fill="var(--color-primary)" />
              <path d="M4.5 10H11.5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--color-text-main)' }}>
            LifeLab
          </span>
        </Link>
        {/* Spacer para manter o logo centralizado visualmente em relação ao botão */}
        <div className="w-10 h-10" aria-hidden="true" />
      </div>

      {/* Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease both' }}
          />
          <aside
            onClick={e => e.stopPropagation()}
            className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] flex flex-col p-4"
            style={{
              background: 'rgba(11,12,16,0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRight: '1px solid var(--color-primary-border)',
              animation: 'slideInLeft 0.25s var(--ease-out) both',
            }}
          >
            <style>{`@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>

            <div className="flex items-center justify-between mb-6 pt-1">
              <Link href="/configuracoes" className="flex items-center gap-3 active:opacity-80">
                <div
                  className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ border: '1.5px solid var(--color-primary-border)' }}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
                    >
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-main)' }}>
                    {profile.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Nível {profile.level}</p>
                </div>
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto -mx-1 px-1">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 h-12 px-3 rounded-xl active:scale-[0.98] transition-transform min-h-[48px]"
                    style={{
                      background: active ? 'var(--color-primary-muted)' : 'transparent',
                      border: active ? '1px solid var(--color-primary-border)' : '1px solid transparent',
                      color: active ? 'var(--color-primary)' : 'var(--color-text-main)',
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.4 : 1.8}
                      style={{
                        color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        filter: active ? 'drop-shadow(0 0 6px var(--color-primary-glow))' : 'none',
                      }}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                )
              })}
            </nav>

            <Link
              href="/configuracoes"
              className="flex items-center gap-3 h-12 px-3 rounded-xl mt-2 active:scale-[0.98] transition-transform min-h-[48px]"
              style={{
                background: pathname.startsWith('/configuracoes') ? 'var(--color-primary-muted)' : 'transparent',
                border: pathname.startsWith('/configuracoes') ? '1px solid var(--color-primary-border)' : '1px solid var(--color-border)',
                color: 'var(--color-text-main)',
              }}
            >
              <Settings size={18} strokeWidth={1.8} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm font-medium">Configurações</span>
            </Link>
          </aside>
        </div>
      )}
    </>
  )
}
