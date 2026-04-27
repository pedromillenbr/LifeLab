'use client';

import { useState, useId, forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type InputVariant = 'default' | 'mono';

export interface CyberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:     string;
  error?:     string;
  hint?:      string;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  variant?:   InputVariant;
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  function CyberInput(
    { label, error, hint, leftIcon, rightIcon, variant = 'default', style, ...props },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const id = useId();

    const hasError = Boolean(error);
    const borderColor = hasError
      ? 'rgba(248,113,113,0.55)'
      : focused ? 'rgba(34,197,94,0.55)' : 'rgba(255,255,255,0.09)';

    const ringColor = hasError
      ? 'rgba(248,113,113,0.12)'
      : focused ? 'rgba(34,197,94,0.12)' : 'transparent';

    const labelColor = hasError ? '#f87171' : focused ? '#22c55e' : 'rgba(255,255,255,0.55)';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...(style as any) }}>
        {label && (
          <motion.label
            htmlFor={id}
            animate={{ color: labelColor }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
              textTransform: 'uppercase', lineHeight: 1, cursor: 'default',
            }}
          >
            {label}
          </motion.label>
        )}

        <motion.div
          animate={{
            borderColor,
            boxShadow: focused
              ? `0 0 0 3px ${ringColor}, inset 0 0 0 1px ${borderColor}`
              : `0 0 0 0px transparent`,
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            borderRadius: 9, border: `1px solid ${borderColor}`,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            overflow: 'hidden',
          }}
        >
          {leftIcon && (
            <motion.span
              animate={{ color: focused ? '#22c55e' : 'rgba(255,255,255,0.35)' }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', left: 12, display: 'inline-flex',
                alignItems: 'center', pointerEvents: 'none', zIndex: 1,
              }}
            >
              {leftIcon}
            </motion.span>
          )}

          <input
            ref={ref}
            id={id}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%',
              padding: `10px ${rightIcon ? '40px' : '14px'} 10px ${leftIcon ? '40px' : '14px'}`,
              background: 'transparent', border: 'none', outline: 'none',
              color: 'rgba(255,255,255,0.93)', fontSize: '14px',
              fontFamily: variant === 'mono' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
              fontWeight: variant === 'mono' ? 600 : 400,
              lineHeight: 1.5, caretColor: '#22c55e',
            }}
            {...props}
          />

          {rightIcon && (
            <span
              style={{
                position: 'absolute', right: 12, display: 'inline-flex',
                alignItems: 'center', pointerEvents: 'none',
                color: 'rgba(255,255,255,0.35)', zIndex: 1,
              }}
            >
              {rightIcon}
            </span>
          )}

          <AnimatePresence>
            {focused && (
              <motion.div
                key="scanline"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                aria-hidden="true"
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 2,
                  background: hasError
                    ? 'linear-gradient(90deg, transparent, #f87171 40%, #fca5a5 60%, transparent)'
                    : 'linear-gradient(90deg, transparent, #22c55e 40%, #4ade80 60%, transparent)',
                  borderRadius: '0 0 9px 9px', transformOrigin: 'left',
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.span
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: '11px', color: '#f87171', lineHeight: 1.4 }}
            >
              {error}
            </motion.span>
          ) : hint ? (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)', lineHeight: 1.4 }}
            >
              {hint}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);
