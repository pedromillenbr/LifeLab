'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, Trophy, Hourglass, AlertTriangle } from 'lucide-react'
import { Avatar } from './Avatar'
import { DivisionBadge } from './DivisionBadge'
import { RankRow } from './RankRow'
import { SeasonEndModal } from './SeasonEndModal'
import {
  fetchRankingMonthly, fetchRankingGlobal, fetchCurrentSeason,
  fetchUnacknowledgedSeasonHistory, nextMilestone,
  type RankingRow, type SeasonRow, type SeasonHistoryRow, type PublicProfile,
} from '@/lib/community/api'
import { subscribeRanking } from '@/lib/community/realtime'
import { divisionForXP, nextDivision, xpToNextDivision } from '@/lib/community/divisions'
import { decideTaunt } from '@/lib/community/taunts'

interface RankingTabProps {
  profile: PublicProfile
}

type Mode = 'monthly' | 'global'

export function RankingTab({ profile }: RankingTabProps) {
  const [mode, setMode] = useState<Mode>('monthly')
  const [rows, setRows] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [season, setSeason] = useState<SeasonRow | null>(null)
  const [pendingHistory, setPendingHistory] = useState<SeasonHistoryRow | null>(null)
  const youRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const refetch = useCallback(async () => {
    const fn = mode === 'monthly' ? fetchRankingMonthly : fetchRankingGlobal
    const data = await fn(100, 0)
    setRows(data)
    setLoading(false)
  }, [mode])

  // Initial load + realtime subscription per mode
  useEffect(() => {
    setLoading(true)
    refetch()
    const unsub = subscribeRanking({ onChange: refetch })
    return unsub
  }, [refetch])

  // Season info
  useEffect(() => {
    fetchCurrentSeason().then(setSeason)
    fetchUnacknowledgedSeasonHistory(profile.id).then(setPendingHistory)
  }, [profile.id])

  // ── Derived ─────────────────────────────────────────────────────
  const youRow = rows.find(r => r.id === profile.id)
  const top3   = rows.slice(0, 3)
  const rest   = rows.slice(3)
  const xpForRanking = mode === 'monthly' ? profile.monthly_xp : profile.total_xp
  const currentDiv = divisionForXP(xpForRanking)
  const nextDiv    = nextDivision(xpForRanking)
  const xpToNext   = xpToNextDivision(xpForRanking)

  // Countdown to season end
  const seasonEndsAt = useMemo(() => {
    if (!season) return null
    // Season ends on the 1st of next month at 00:00 UTC
    const start = new Date(season.started_at)
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1))
    return end
  }, [season])

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  const countdown = useMemo(() => {
    if (!seasonEndsAt) return null
    const ms = seasonEndsAt.getTime() - now
    if (ms <= 0) return { days: 0, hours: 0, minutes: 0, totalDays: 0 }
    const days  = Math.floor(ms / (24 * 3600_000))
    const hours = Math.floor((ms % (24 * 3600_000)) / 3600_000)
    const minutes = Math.floor((ms % 3600_000) / 60_000)
    return { days, hours, minutes, totalDays: days }
  }, [seasonEndsAt, now])

  // Taunt
  const youPosition = youRow?.position ?? null
  const milestone = youPosition ? nextMilestone(youPosition) : null
  const milestoneRow = milestone ? rows[milestone.target - 1] : null
  const xpToMilestone = milestoneRow && youRow
    ? Math.max(0, ((milestoneRow.xp ?? milestoneRow.total_xp ?? 0) - (youRow.xp ?? youRow.total_xp ?? 0)) + 1)
    : null

  const hoursIdle = profile.last_active_at
    ? Math.max(0, (now - new Date(profile.last_active_at).getTime()) / 3600_000)
    : 999

  // Rival = user immediately above
  const rivalRow = youPosition && youPosition > 1 ? rows[youPosition - 2] : null

  const taunt = decideTaunt({
    hoursSinceLastXP: hoursIdle,
    positionMovement: youRow?.movement ?? 0,
    xpToNextMilestone: xpToMilestone,
    nextMilestoneLabel: milestone?.label ?? null,
    daysToSeasonEnd: countdown?.totalDays ?? 999,
    rivalDisplayName: rivalRow?.display_name,
    rivalActiveToday: false, // no per-day activity tracking yet — keep conservative
  })

  function scrollToYou() {
    youRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <>
      {pendingHistory && (
        <SeasonEndModal
          history={pendingHistory}
          displayName={profile.display_name}
          onClose={() => setPendingHistory(null)}
        />
      )}

      {/* Sub-tabs: Mensal (principal) / Histórico (secundário) */}
      <div className="com-subtabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'monthly'}
          className={`com-subtab ${mode === 'monthly' ? 'active' : ''}`}
          onClick={() => setMode('monthly')}
        >
          Mensal
        </button>
        <button
          role="tab"
          aria-selected={mode === 'global'}
          className={`com-subtab com-subtab-secondary ${mode === 'global' ? 'active' : ''}`}
          onClick={() => setMode('global')}
        >
          Histórico
        </button>
      </div>

      {/* Season countdown — only in monthly mode */}
      {mode === 'monthly' && countdown && (
        <div className="com-season-strip">
          <div className="com-season-strip-left">
            <Hourglass size={12} />
            <span className="com-season-strip-label">Season fecha em</span>
          </div>
          <div className="com-season-strip-clock">
            <span className="com-clock-num">{String(countdown.days).padStart(2, '0')}</span>
            <span className="com-clock-sep">d</span>
            <span className="com-clock-num">{String(countdown.hours).padStart(2, '0')}</span>
            <span className="com-clock-sep">h</span>
            <span className="com-clock-num">{String(countdown.minutes).padStart(2, '0')}</span>
            <span className="com-clock-sep">m</span>
          </div>
        </div>
      )}

      {/* Taunt banner */}
      {taunt && (
        <div className={`com-taunt sev-${taunt.severity}`} role="status">
          <AlertTriangle size={12} />
          <span>{taunt.message}</span>
        </div>
      )}

      {/* Your card */}
      <div className="com-you-card">
        <div className="com-you-portrait">
          <Avatar displayName={profile.display_name} divisionKey={currentDiv.key} size={56} glow />
        </div>
        <div className="com-you-meta">
          <div className="com-you-name">{profile.display_name}</div>
          <DivisionBadge divisionKey={currentDiv.key} size="md" />
          <div className="com-you-position">
            {youRow ? <>Posição <strong>#{youRow.position}</strong></> : <>Posição <strong>—</strong></>}
            <span className="com-you-sep">·</span>
            <span className="com-you-xp">{xpForRanking.toLocaleString('pt-BR')} XP</span>
          </div>
        </div>
        <div className="com-you-progress">
          {nextDiv ? (
            <>
              <div className="com-you-progress-label">
                {xpToNext.toLocaleString('pt-BR')} XP para <strong>{nextDiv.short}</strong>
              </div>
              <div className="com-you-progress-bar">
                <div
                  className="com-you-progress-fill"
                  style={{
                    width: `${100 - Math.min(100, (xpToNext / Math.max(1, nextDiv.min - currentDiv.min)) * 100)}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="com-you-progress-label">Última divisão alcançada.</div>
          )}
        </div>
      </div>

      {loading ? (
        <RankingSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="com-rank-wrap" ref={listRef}>
          {/* Top 3 podium */}
          <div className="com-podium">
            {top3.map(r => (
              <PodiumCard key={r.id} row={r} mode={mode} isYou={r.id === profile.id} />
            ))}
          </div>

          {/* Rest of the list */}
          <div className="com-rank-list" role="list">
            {rest.map(r => {
              const isYou = r.id === profile.id
              if (isYou) {
                return (
                  <div key={r.id} ref={youRef}>
                    <div className="com-rank-marker">
                      <ArrowDown size={11} />
                      <span>Você está aqui</span>
                    </div>
                    <RankRow row={r} isYou showXP={mode === 'monthly' ? 'monthly' : 'total'} />
                  </div>
                )
              }
              return <RankRow key={r.id} row={r} isYou={false} showXP={mode === 'monthly' ? 'monthly' : 'total'} />
            })}
          </div>

          {/* Sticky "go to you" if your row exists below top 3 */}
          {youRow && youRow.position > 3 && (
            <button className="com-jump-to-you" onClick={scrollToYou}>
              <ArrowDown size={12} /> ver minha posição
            </button>
          )}
        </div>
      )}
    </>
  )
}

// ── Podium card ─────────────────────────────────────────────────────

function PodiumCard({ row, mode, isYou }: { row: RankingRow; mode: Mode; isYou: boolean }) {
  const xp = mode === 'monthly' ? row.xp ?? 0 : row.total_xp ?? 0
  return (
    <div className={`com-podium-card pos-${row.position} ${isYou ? 'is-you' : ''}`}>
      <div className="com-podium-rank">
        <Trophy size={11} aria-hidden /> #{row.position}
      </div>
      <Avatar displayName={row.display_name} divisionKey={row.division_key} size={56} glow />
      <div className="com-podium-name">{row.display_name}</div>
      <DivisionBadge divisionKey={row.division_key} />
      <div className="com-podium-xp">{xp.toLocaleString('pt-BR')}<span className="com-podium-xp-unit"> XP</span></div>
    </div>
  )
}

function RankingSkeleton() {
  return (
    <div className="com-skel-list">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="com-skel-row" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="com-empty">
      <Trophy size={28} />
      <h3>Ranking vazio.</h3>
      <p>Os primeiros XP da temporada vão posicionar todo mundo. Volte em alguns minutos.</p>
    </div>
  )
}
