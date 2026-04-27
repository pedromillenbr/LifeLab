'use client';

import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface FuturisticButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children:   ReactNode;
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  loading?:   boolean;
  fullWidth?: boolean;
}

const variantConfig: Record<
  ButtonVariant,
  { bg: string; border: string; color: string; hoverBg: string; shadow: string; hoverShadow: string }
> = {
  primary: {
    bg: '#22c55e', border: 'transparent', color: '#000000',
    hoverBg: '#4ade80',
    shadow: '0 0 24px rgba(34,197,94,0.30), 0 0 48px rgba(34,197,94,0.15)',
    hoverShadow: '0 0 32px rgba(34,197,94,0.55), 0 0 64px rgba(34,197,94,0.20)',
  },
  secondary: {
    bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.28)', color: '#22c55e',
    hoverBg: 'rgba(34,197,94,0.18)', shadow: 'none',
    hoverShadow: '0 0 20px rgba(34,197,94,0.22)',
  },
  ghost: {
    bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)',
    hoverBg: 'rgba(255,255,255,0.09)', shadow: 'none',
    hoverShadow: '0 4px 16px rgba(0,0,0,0.30)',
  },
  danger: {
    bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)', color: '#f87171',
    hoverBg: 'rgba(248,113,113,0.20)', shadow: 'none',
    hoverShadow: '0 0 20px rgba(248,113,113,0.28)',
  },
  gold: {
    bg: 'rgba(234,179,8,0.10)', border: 'rgba(234,179,8,0.28)', color: '#eab308',
    hoverBg: 'rgba(234,179,8,0.18)', shadow: 'none',
    hoverShadow: '0 0 20px rgba(234,179,8,0.30)',
  },
};

const sizeConfig: Record<
  ButtonSize,
  { padding: string; fontSize: string; borderRadius: number; gap: number; iconSize: number }
> = {
  sm: { padding: '7px 14px',  fontSize: '12px', borderRadius: 8,  gap: 5, iconSize: 12 },
  md: { padding: '11px 20px', fontSize: '14px', borderRadius: 9,  gap: 7, iconSize: 14 },
  lg: { padding: '14px 28px', fontSize: '15px', borderRadius: 10, gap: 8, iconSize: 16 },
};

export function FuturisticButton({
  children, variant = 'primary', size = 'md',
  leftIcon, rightIcon, loading = false, fullWidth = false,
  disabled, style, ...rest
}: FuturisticButtonProps) {
  const v = variantConfig[variant];
  const s = sizeConfig[size];
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02, background: v.hoverBg, boxShadow: v.hoverShadow }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, padding: s.padding, borderRadius: s.borderRadius,
        background: v.bg, border: `1px solid ${v.border}`, color: v.color,
        fontSize: s.fontSize, fontWeight: 700,
        fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.45 : 1,
        width: fullWidth ? '100%' : 'auto',
        boxShadow: v.shadow,
        position: 'relative', overflow: 'hidden', userSelect: 'none',
        ...style,
      }}
      {...(rest as any)}
    >
      <motion.span
        initial={{ x: '-110%', opacity: 0 }}
        whileHover={{ x: '210%', opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
          borderRadius: 'inherit',
        }}
      />

      {loading ? (
        <ButtonSpinner size={s.iconSize} color={v.color} />
      ) : (
        leftIcon && (
          <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0, flexShrink: 0 }}>
            {leftIcon}
          </span>
        )
      )}

      <span>{children}</span>

      {!loading && rightIcon && (
        <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0, flexShrink: 0 }}>
          {rightIcon}
        </span>
      )}
    </motion.button>
  );
}

function ButtonSpinner({ size, color }: { size: number; color: string }) {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size, height: size,
        border: `2px solid ${color}`, borderTopColor: 'transparent',
        borderRadius: '50%', display: 'inline-block', flexShrink: 0,
      }}
    />
  );
}
