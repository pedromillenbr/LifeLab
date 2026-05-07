'use client'

import { useEffect, useState } from 'react'
import { Crown, Flame, Calendar, BarChart3 } from 'lucide-react'
import { EliteCard } from './EliteCard'
import {
  fetchRankingGlobal, fetchTopByStreak, fetchTopByBestStreak,
  fetchSeasonChampions, type RankingRow, type PublicProfile,
} from '@/lib/community/api'
import { divisionForUser, type DivisionKey } from '@/lib/community/divisions'

type Category = 'top_xp' | 'top_streak' | 'historic_streak' | 'champions'

interface HallProps {
  profile: PublicProfile
}

export function HallOfEliteTab({ profile: _profile }: HallProps) {
  const [category, setCategory] = useState<Category>('top_xp')
  const [topXP,    setTopXP]    = useState<RankingRow[]>([])
  const [streaks,  setStreaks]  = useState<PublicProfile[]>([])
  const [bestStreaks, setBestStreaks] = useState<PublicProfile[]>([])
  const [champions, setChampions] = useState<Awaited<ReturnType<typeof fetchSeasonChampions>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchRankingGlobal(10, 0),
      fetchTopByStreak(10),
      fetchTopByBestStreak(10),
      fetchSeasonChampions(12),
    ]).then(([a, b, c, d]) => {
      if (cancelled) return
      setTopXP(a); setStreaks(b); setBestStreaks(c); setChampions(d)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <div className="com-hall-tabs">
        <button className={`com-hall-tab ${category === 'top_xp' ? 'active' : ''}`}        onClick={() => setCategory('top_xp')}>
          <BarChart3 size={11} /> Top XP histórico
        </button>
        <button className={`com-hall-tab ${category === 'top_streak' ? 'active' : ''}`}    onClick={() => setCategory('top_streak')}>
          <Flame size={11} /> Maiores streaks
        </button>
        <button className={`com-hall-tab ${category === 'historic_streak' ? 'active' : ''}`} onClick={() => setCategory('historic_streak')}>
          <Flame size={11} /> Recordes de streak
        </button>
        <button className={`com-hall-tab ${category === 'champions' ? 'active' : ''}`}     onClick={() => setCategory('champions')}>
          <Crown size={11} /> Campeões mensais
        </button>
      </div>

      {loading ? (
        <div className="com-hall-skel">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="com-hall-skel-card" />)}
        </div>
      ) : (
        <div className="com-hall-grid">
          {category === 'top_xp' && topXP.map(r => (
            <EliteCard
              key={r.id}
              rank={r.position}
              displayName={r.display_name}
              divisionKey={r.division_key}
              xp={r.total_xp ?? 0}
              streak={r.streak}
            />
          ))}

          {category === 'top_streak' && streaks.map((p, i) => (
            <EliteCard
              key={p.id}
              rank={i + 1}
              displayName={p.display_name}
              divisionKey={divisionForUser(p.total_xp, p.days_active ?? 999).key as DivisionKey}
              xp={p.total_xp}
              streak={p.streak}
              caption="STREAK ATUAL"
            />
          ))}

          {category === 'historic_streak' && bestStreaks.map((p, i) => (
            <EliteCard
              key={p.id}
              rank={i + 1}
              displayName={p.display_name}
              divisionKey={divisionForUser(p.total_xp, p.days_active ?? 999).key as DivisionKey}
              xp={p.total_xp}
              streak={p.best_streak}
              caption="MAIOR STREAK"
            />
          ))}

          {category === 'champions' && champions.map(c => (
            <EliteCard
              key={c.id}
              rank={1}
              displayName={c.display_name}
              divisionKey={c.division_key as DivisionKey}
              xp={c.final_xp}
              caption={`CAMPEÃO ${c.season_label}`}
            />
          ))}

          {((category === 'top_xp' && topXP.length === 0) ||
            (category === 'top_streak' && streaks.length === 0) ||
            (category === 'historic_streak' && bestStreaks.length === 0) ||
            (category === 'champions' && champions.length === 0)) && (
            <div className="com-empty com-hall-empty">
              <Crown size={28} />
              <h3>Vazio.</h3>
              <p>Ainda não há lendas nessa categoria. Pode ser você.</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
