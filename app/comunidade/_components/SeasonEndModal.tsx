'use client'

import { Crown, Flame, X } from 'lucide-react'
import { Avatar } from './Avatar'
import { DivisionBadge } from './DivisionBadge'
import { Portal } from './Portal'
import { acknowledgeSeasonHistory, type SeasonHistoryRow } from '@/lib/community/api'
import type { DivisionKey } from '@/lib/community/divisions'

interface SeasonEndModalProps {
  history:     SeasonHistoryRow
  displayName: string
  onClose:     () => void
}

export function SeasonEndModal({ history, displayName, onClose }: SeasonEndModalProps) {
  async function dismiss() {
    await acknowledgeSeasonHistory(history.id)
    onClose()
  }

  const { final_position, final_xp, division_key } = history
  const podium = final_position <= 3
  const top10  = final_position <= 10

  return (
    <Portal>
    <div className="com-season-overlay" role="dialog" aria-modal="true">
      <div className={`com-season-card ${podium ? 'is-podium' : ''} ${top10 ? 'is-top10' : ''}`}>
        <button className="com-season-close" onClick={dismiss} aria-label="Fechar">
          <X size={14} />
        </button>

        <div className="com-season-eyebrow">Season encerrada</div>
        <div className="com-season-title">
          {podium ? <Crown size={22} /> : null}
          {podium ? 'Pódio.' : top10 ? 'Top 10.' : 'Resultado final.'}
        </div>

        <div className="com-season-portrait">
          <Avatar displayName={displayName} divisionKey={division_key as DivisionKey} size={88} glow />
        </div>

        <div className="com-season-name">{displayName}</div>
        <DivisionBadge divisionKey={division_key as DivisionKey} size="md" />

        <div className="com-season-stats">
          <div className="com-season-stat">
            <div className="com-season-stat-label">Posição final</div>
            <div className="com-season-stat-val">#{final_position}</div>
          </div>
          <div className="com-season-stat">
            <div className="com-season-stat-label">XP da season</div>
            <div className="com-season-stat-val">{final_xp.toLocaleString('pt-BR')}</div>
          </div>
        </div>

        <div className="com-season-msg">
          {podium
            ? 'Você ficou no pódio. Apareça de novo no próximo mês.'
            : top10
              ? 'Top 10. Bom — só não relaxa.'
              : final_position <= 50
                ? 'Top 50. Subir é decisão. Decide.'
                : 'A season acabou. A próxima já começou. Trabalha.'}
        </div>

        <button className="com-season-cta" onClick={dismiss}>
          <Flame size={14} /> Continuar
        </button>
      </div>
    </div>
    </Portal>
  )
}
