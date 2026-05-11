'use client'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string | React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay — sólido para esconder conteúdo de fundo */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,6,10,0.88)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Painel — fundo sólido (não vaza texto atrás) */}
      <div
        className={cn('relative w-full max-w-md z-10 rounded-xl p-5 md:p-6 max-h-[90vh] overflow-y-auto', className)}
        style={{
          background: '#0f1218',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.75), 0 0 1px rgba(var(--color-primary-rgb), 0.4) inset',
          animation: 'scaleIn 0.25s var(--ease-out) both',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text-main)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{
              background: 'var(--color-bg-3)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-main)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
