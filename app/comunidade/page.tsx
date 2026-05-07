'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import { Trophy, Users, Crown } from 'lucide-react'
import { ensureValidSession } from '@/lib/auth'
import { fetchMyPublicProfile, type PublicProfile } from '@/lib/community/api'
import { OnboardingModal } from './_components/OnboardingModal'
import { RankingTab } from './_components/RankingTab'
import { CommunityStyles } from './_components/styles'

// Tabs other than the default (Ranking) are loaded only on first click.
const FriendsTab     = lazy(() => import('./_components/FriendsTab').then(m => ({ default: m.FriendsTab })))
const HallOfEliteTab = lazy(() => import('./_components/HallOfEliteTab').then(m => ({ default: m.HallOfEliteTab })))

type Tab = 'ranking' | 'friends' | 'hall'

export default function ComunidadePage() {
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(undefined)
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('ranking')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const session = await ensureValidSession().catch(() => null)
      if (cancelled) return
      if (!session) { setProfile(null); return }
      setUserId(session.user.id)
      const p = await fetchMyPublicProfile(session.user.id)
      if (cancelled) return
      setProfile(p)
    })()
    return () => { cancelled = true }
  }, [])

  if (profile === undefined) {
    return (
      <div className="com-root">
        <CommunityStyles />
        <div className="com-loading">
          <div className="com-loading-spinner" />
        </div>
      </div>
    )
  }

  // No onboarding yet → modal blocks the rest of the screen.
  if (profile === null && userId) {
    return (
      <div className="com-root">
        <CommunityStyles />
        <Header />
        <OnboardingModal
          userId={userId}
          onDone={(p) => setProfile(p)}
        />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="com-root">
      <CommunityStyles />
      <Header />

      <nav className="com-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'ranking'}
          className={`com-tab ${tab === 'ranking' ? 'active' : ''}`}
          onClick={() => setTab('ranking')}
        >
          <Trophy size={12} /> Ranking
        </button>
        <button
          role="tab"
          aria-selected={tab === 'friends'}
          className={`com-tab ${tab === 'friends' ? 'active' : ''}`}
          onClick={() => setTab('friends')}
        >
          <Users size={12} /> Amigos
        </button>
        <button
          role="tab"
          aria-selected={tab === 'hall'}
          className={`com-tab ${tab === 'hall' ? 'active' : ''}`}
          onClick={() => setTab('hall')}
        >
          <Crown size={12} /> Hall of Elite
        </button>
      </nav>

      <div className="com-pane">
        {tab === 'ranking' && <RankingTab profile={profile} />}
        {tab !== 'ranking' && (
          <Suspense fallback={<div className="com-loading"><div className="com-loading-spinner" /></div>}>
            {tab === 'friends' && <FriendsTab profile={profile} />}
            {tab === 'hall'    && <HallOfEliteTab profile={profile} />}
          </Suspense>
        )}
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="com-page-header">
      <div className="com-eyebrow">
        <span className="com-eyebrow-dot" />
        Comunidade · Disciplina pública
      </div>
      <h1 className="page-title">Comunidade</h1>
      <p className="com-subtitle">O ranking lembra quem trabalha.</p>
    </header>
  )
}
