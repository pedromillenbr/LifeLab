'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface MissionToggleProps {
  label:      string;
  checked:    boolean;
  onChange:   (value: boolean) => void;
  icon?:      ReactNode;
  sublabel?:  string;
  xp?:        number;
  disabled?:  boolean;
  className?: string;
}

export function MissionToggle({
  label, checked, onChange, icon, sublabel, xp,
  disabled = false, className,
}: MissionToggleProps) {
  const handleClick = () => { if (!disabled) onChange(!checked); };

  return (
    <motion.div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      className={className}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled  ? {} : { scale: 0.99 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 10,
        background: checked ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${checked ? 'rgba(34,197,94,0.18)' : 'transparent'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s, border-color 0.2s',
        userSelect: 'none', outline: 'none',
      }}
    >
      {icon && (
        <motion.span
          animate={{ color: checked ? '#22c55e' : 'rgba(255,255,255,0.35)' }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
        >
          {icon}
        </motion.span>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <motion.span
          animate={{
            color: checked ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.90)',
            textDecoration: checked ? 'line-through' : 'none',
          }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'block', fontSize: '13px', fontWeight: 500,
            lineHeight: 1.3, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {label}
        </motion.span>

        {sublabel && (
          <span
            style={{
              display: 'block', fontSize: '11px',
              color: 'rgba(255,255,255,0.30)', marginTop: 2,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>

      {xp !== undefined && (
        <motion.span
          animate={{
            opacity: checked ? 1 : 0.5,
            color: checked ? '#eab308' : 'rgba(255,255,255,0.30)',
          }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: '11px', fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
          }}
        >
          +{xp} XP
        </motion.span>
      )}

      <motion.div
        animate={{
          background: checked ? '#22c55e' : 'rgba(255,255,255,0.10)',
          borderColor: checked ? '#22c55e' : 'rgba(255,255,255,0.15)',
          boxShadow: checked
            ? '0 0 10px rgba(34,197,94,0.50), 0 0 20px rgba(34,197,94,0.20)'
            : 'none',
        }}
        transition={{ duration: 0.2 }}
        style={{
          width: 36, height: 20, borderRadius: 10,
          border: '1px solid', position: 'relative', flexShrink: 0,
        }}
      >
        <motion.div
          animate={{
            x: checked ? 16 : 2,
            background: checked ? '#000000' : 'rgba(255,255,255,0.60)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute', top: 2,
            width: 14, height: 14, borderRadius: '50%',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
