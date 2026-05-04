'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store/useStore'
import {
  LayoutDashboard, Dumbbell, CheckSquare, Target,
  DollarSign, Calendar, BookOpen, Sparkles, Settings, Timer, UtensilsCrossed,
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para a aba ativa quando a página muda
  useEffect(() => {
    const activeLink = scrollContainerRef.current?.querySelector('[data-active="true"]')
    if (activeLink && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const link = activeLink as HTMLElement
      const containerLeft = container.scrollLeft
      const containerWidth = container.clientWidth
      const linkLeft = link.offsetLeft
      const linkWidth = link.offsetWidth

      // Scroll para centralizar a aba ativa
      if (linkLeft < containerLeft) {
        container.scrollLeft = linkLeft - 20
      } else if (linkLeft + linkWidth > containerLeft + containerWidth) {
        container.scrollLeft = linkLeft + linkWidth - containerWidth + 20
      }
    }
  }, [pathname])

  return (
    <>
      {/* Barra de navegação horizontal - mobile only */}
      <div
        className="md:hidden fixed top-0 inset-x-0 z-40 h-16 flex items-center px-3 gap-2"
        style={{
          background: 'rgba(11,12,16,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-primary-border)',
        }}
      >
        {/* Logo/Perfil — esquerda */}
        <Link 
          href="/" 
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: 'var(--color-primary-muted)', border: '1px solid var(--color-primary-border)' }}
          title="LifeLab"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L13 13H10.5L8 7.5L5.5 13H3Z" fill="var(--color-primary)" />
            <path d="M4.5 10H11.5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Divisor */}
        <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', marginRight: 4 }} />

        {/* Abas com scroll horizontal */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                data-active={active}
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center active:scale-90 transition-all relative group"
                style={{
                  background: active ? 'var(--color-primary-muted)' : 'transparent',
                  border: active ? '1px solid var(--color-primary)' : '1px solid transparent',
                }}
                title={label}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{
                    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    filter: active ? 'drop-shadow(0 0 6px var(--color-primary-glow))' : 'none',
                  }}
                />

                {/* Tooltip ao passar o mouse */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: 'var(--color-bg-3)',
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {label}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Divisor */}
        <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', marginLeft: 4 }} />

        {/* Configurações — direita */}
        <Link
          href="/configuracoes"
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: pathname.startsWith('/configuracoes') ? 'var(--color-primary-muted)' : 'transparent',
            border: pathname.startsWith('/configuracoes') ? '1px solid var(--color-primary)' : '1px solid transparent',
          }}
          title="Configurações"
        >
          <Settings
            size={18}
            strokeWidth={pathname.startsWith('/configuracoes') ? 2.2 : 1.8}
            style={{
              color: pathname.startsWith('/configuracoes') ? 'var(--color-primary)' : 'var(--color-text-muted)',
              filter: pathname.startsWith('/configuracoes') ? 'drop-shadow(0 0 6px var(--color-primary-glow))' : 'none',
            }}
          />
        </Link>
      </div>

      {/* Perfil — modal deslizante (acessível via swipe ou outro modo) */}
      <style>{`
        @media (max-width: 768px) {
          div[class*="scroll-smooth"]::-webkit-scrollbar {
            display: none;
          }
          div[class*="scroll-smooth"] {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
    </>
  )
}
