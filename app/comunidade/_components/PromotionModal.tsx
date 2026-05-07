'use client'

import { useEffect, useState } from 'react'
import { Sparkles, ArrowUp, X } from 'lucide-react'
import { Avatar } from './Avatar'
import { Portal } from './Portal'
import { acknowledgePromotion, type PromotionEvent } from '@/lib/community/api'
import { getDivision, type DivisionKey } from '@/lib/community/divisions'

interface PromotionModalProps {
  event:        PromotionEvent
  displayName:  string
  totalXP:      number
  streak:       number
  onClose:      () => void
}

// Cinematic flow:
//   0..400ms   : intro — card antigo entra
//   400..1100  : "se rasga" — flip 90° + dim
//   1100..1700 : card novo flippa-in com aura crescendo
//   1700+      : revelado, CTA aparece
type Phase = 'intro' | 'rip' | 'reveal' | 'ready'

export function PromotionModal({ event, displayName, totalXP, streak, onClose }: PromotionModalProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const fromDiv = getDivision(event.from_division as DivisionKey)
  const toDiv   = getDivision(event.to_division as DivisionKey)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('rip'),    420)
    const t2 = setTimeout(() => setPhase('reveal'), 1100)
    const t3 = setTimeout(() => setPhase('ready'),  1750)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [event.id])

  async function dismiss() {
    await acknowledgePromotion(event.id)
    onClose()
  }

  return (
    <Portal>
      <div className="com-promo-overlay" role="dialog" aria-modal="true">
        <div className="com-promo-bg" aria-hidden />
        {/* Particles burst when we hit `reveal` */}
        {(phase === 'reveal' || phase === 'ready') && (
          <div className="com-promo-particles" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} style={{
                ['--angle' as string]: `${(i / 24) * 360}deg`,
                ['--delay' as string]: `${(i % 6) * 40}ms`,
                ['--metal' as string]: toDiv.metal,
                ['--metal-glow' as string]: toDiv.glow,
              }} />
            ))}
          </div>
        )}

        <div className="com-promo-card" data-phase={phase}>
          <button className="com-promo-close" onClick={dismiss} aria-label="Fechar">
            <X size={14} />
          </button>

          <div className="com-promo-eyebrow">
            <Sparkles size={11} /> Promoção de divisão
          </div>
          <h2 className="com-promo-title">Você subiu.</h2>

          {/* The card stage — old → new with cinematic flip */}
          <div className="com-promo-stage">
            <PromotionCard
              isOld
              divisionKey={fromDiv.key}
              displayName={displayName}
              xp={totalXP}
              streak={streak}
              phase={phase}
            />
            <PromotionCard
              divisionKey={toDiv.key}
              displayName={displayName}
              xp={totalXP}
              streak={streak}
              phase={phase}
            />
          </div>

          {/* Transition label */}
          <div className="com-promo-transition">
            <span className="com-promo-trans-from">{fromDiv.short}</span>
            <ArrowUp size={14} />
            <span className="com-promo-trans-to" style={{ color: toDiv.metal, textShadow: `0 0 14px ${toDiv.glow}` }}>
              {toDiv.short}
            </span>
          </div>

          <div className={`com-promo-tagline ${phase === 'ready' ? 'visible' : ''}`}>
            “{toDiv.tagline}”
          </div>

          <button
            className={`com-promo-cta ${phase === 'ready' ? 'visible' : ''}`}
            onClick={dismiss}
            disabled={phase !== 'ready'}
          >
            <Sparkles size={14} /> Continuar a evolução
          </button>
        </div>
      </div>
    </Portal>
  )
}

interface PromotionCardProps {
  isOld?:       boolean
  divisionKey:  DivisionKey
  displayName:  string
  xp:           number
  streak:       number
  phase:        Phase
}

function PromotionCard({ isOld, divisionKey, displayName, xp, streak, phase }: PromotionCardProps) {
  const div = getDivision(divisionKey)
  // The "old" card is intentionally desaturated and gets ripped away.
  // We expose the fake-attribute strings only on the old card to make the
  // contrast feel earned (the user's *current* numbers are the real ones,
  // shown on the new card).
  return (
    <div
      className={`com-promo-mini ${isOld ? 'is-old' : 'is-new'} phase-${phase}`}
      style={{
        ['--metal' as string]: div.metal,
        ['--metal-glow' as string]: div.glow,
      }}
    >
      <div className="com-promo-mini-frame" />
      <div className="com-promo-mini-inner">
        <div className="com-promo-mini-top">
          <span className="com-promo-mini-rank">{div.short}</span>
        </div>
        <div className="com-promo-mini-portrait">
          <Avatar displayName={displayName} divisionKey={div.key} size={64} glow={!isOld} />
          {!isOld && div.mythic && <div className="com-promo-mini-aura" aria-hidden />}
        </div>
        <div className="com-promo-mini-name">{displayName}</div>
        <div className="com-promo-mini-stats">
          {isOld ? (
            <>
              <Stat label="XP"     value="—" weak />
              <Stat label="Streak" value="—" weak />
              <Stat label="Disc."  value="—" weak />
            </>
          ) : (
            <>
              <Stat label="XP"     value={xp.toLocaleString('pt-BR')} />
              <Stat label="Streak" value={String(streak)} />
              <Stat label="Status" value="✦" />
            </>
          )}
        </div>
        {isOld && <div className="com-promo-mini-stamp">SUPERADO</div>}
      </div>
    </div>
  )
}

function Stat({ label, value, weak }: { label: string; value: string; weak?: boolean }) {
  return (
    <div className={`com-promo-stat ${weak ? 'weak' : ''}`}>
      <span className="com-promo-stat-label">{label}</span>
      <span className="com-promo-stat-val">{value}</span>
    </div>
  )
}
