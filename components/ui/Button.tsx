'use client'
import { cn } from '@/lib/utils'
import { CSSProperties, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:   'btn-primary btn-glow',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  gold:      'inline-flex items-center gap-2 font-semibold text-sm rounded-lg px-4 py-2 cursor-pointer',
}

const sizeStyles: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: '',
  lg: 'text-base px-5 py-3',
}

const goldStyle: CSSProperties = {
  background: 'var(--gold)',
  color: '#0d0a00',
  boxShadow: '0 2px 12px rgba(245,166,35,0.25)',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full justify-center',
        className
      )}
      style={variant === 'gold' ? { ...goldStyle, ...style } : style}
      {...props}
    >
      {children}
    </button>
  )
}
