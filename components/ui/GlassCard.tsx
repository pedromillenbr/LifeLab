'use client';

import { useRef, useCallback, type ReactNode, type CSSProperties } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cardVariants, type CardVariant } from '@/design-system/tokens';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children:     ReactNode;
  variant?:     CardVariant;
  tilt?:        boolean;
  laserBorder?: boolean;
  delay?:       number;
  className?:   string;
  style?:       CSSProperties;
}

export function GlassCard({
  children,
  variant     = 'default',
  tilt        = true,
  laserBorder = true,
  delay       = 0,
  className,
  style,
  ...rest
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const v = cardVariants[variant];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top)  / rect.height;

      if (tilt) {
        const rx = (y - 0.5) * -9;
        const ry = (x - 0.5) *  9;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.015)`;
      }

      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(280px circle at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(255,255,255,0.07) 0%, transparent 70%)`;
        glowRef.current.style.opacity = '1';
      }
    },
    [tilt],
  );

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = '';
    if (glowRef.current) glowRef.current.style.opacity = '0';
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 0.68, 0, 1.2] }}
      whileHover={{ boxShadow: v.hoverShadow }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background:           v.background,
        backdropFilter:       'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border:               `1px solid ${v.border}`,
        borderRadius:         14,
        padding:              20,
        position:             'relative',
        overflow:             'hidden',
        cursor:               'default',
        transformStyle:       'preserve-3d',
        transition:           'box-shadow 0.25s ease, border-color 0.25s',
        ...style,
      }}
      {...rest}
    >
      {laserBorder && (
        <div
          className="laser-ring"
          aria-hidden="true"
          style={{
            position: 'absolute', inset: -1, borderRadius: 15,
            pointerEvents: 'none', zIndex: 3, opacity: 0,
            transition: 'opacity 0.4s',
          }}
        />
      )}

      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, borderRadius: 14,
          opacity: 0, transition: 'opacity 0.2s',
          pointerEvents: 'none', zIndex: 2,
        }}
      />

      <div style={{ position: 'relative', zIndex: 4 }}>
        {children}
      </div>
    </motion.div>
  );
}

interface GlassCardHeaderProps {
  title:      ReactNode;
  action?:    ReactNode;
  className?: string;
}

export function GlassCardHeader({ title, action, className }: GlassCardHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 500,
          color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
