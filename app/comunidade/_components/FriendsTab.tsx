'use client'

import { useCallback, useEffect, useState } from 'react'
import { Users, UserPlus, Check, X, Swords, Loader2, Flame } from 'lucide-react'
import { Avatar } from './Avatar'
import { DivisionBadge } from './DivisionBadge'
import { TalkPanel } from './TalkPanel'
import {
  addFriendByName, fetchMyFriends, fetchIncomingFriendRequests,
  respondFriendRequest,
  type FriendRow, type FriendRequestRow, type PublicProfile,
} from '@/lib/community/api'
import type { DivisionKey } from '@/lib/community/divisions'

type IncomingRequest = FriendRequestRow & {
  profile: { display_name: string; avatar_seed: string } | null
}

interface FriendsTabProps {
  profile: PublicProfile
}

export function FriendsTab({ profile }: FriendsTabProps) {
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [requests, setRequests] = useState<IncomingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState('')
  const [adding, setAdding] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [talkTarget, setTalkTarget] = useState<{ id: string; name: string; div: DivisionKey } | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [f, r] = await Promise.all([
      fetchMyFriends(),
      fetchIncomingFriendRequests(profile.id),
    ])
    setFriends(f)
    setRequests(r)
    setLoading(false)
  }, [profile.id])

  useEffect(() => { refresh() }, [refresh])

  async function handleAdd() {
    const name = searchName.trim()
    if (!name || adding) return
    setAdding(true)
    setStatusMsg(null)
    const result = await addFriendByName(name)
    setAdding(false)
    setSearchName('')
    switch (result.status) {
      case 'sent':
        setStatusMsg({ kind: 'ok', text: `Solicitação enviada para ${name}.` })
        break
      case 'accepted':
        setStatusMsg({ kind: 'ok', text: `Você e ${name} agora são amigos.` })
        await refresh()
        break
      case 'already_friends':
        setStatusMsg({ kind: 'ok', text: 'Vocês já são amigos.' })
        break
      case 'self':
        setStatusMsg({ kind: 'err', text: 'Você não pode adicionar a si mesmo.' })
        break
      case 'not_found':
        setStatusMsg({ kind: 'err', text: `Codinome "${name}" não existe.` })
        break
      default:
        setStatusMsg({ kind: 'err', text: 'Erro ao enviar. Tente de novo.' })
    }
  }

  async function handleRequest(reqId: number, accept: boolean) {
    const result = await respondFriendRequest(reqId, accept)
    if (result.ok) await refresh()
  }

  return (
    <>
      {talkTarget && (
        <TalkPanel
          myId={profile.id}
          friendId={talkTarget.id}
          friendName={talkTarget.name}
          friendDivision={talkTarget.div}
          onClose={() => setTalkTarget(null)}
        />
      )}

      <div className="com-friends-wrap">
        {/* Add by name */}
        <div>
          <div className="com-friends-section-label">
            <UserPlus size={11} /> Adicionar pelo codinome
          </div>
          <div className="com-friends-search">
            <input
              className="com-friends-input"
              placeholder="ex: pedro_focado"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !adding) handleAdd() }}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              className="com-friends-add-btn"
              onClick={handleAdd}
              disabled={!searchName.trim() || adding}
            >
              {adding ? <Loader2 size={12} className="spin" /> : <UserPlus size={12} />}
              {adding ? 'Enviando' : 'Adicionar'}
            </button>
          </div>
          {statusMsg && (
            <div className={`com-friends-msg ${statusMsg.kind}`} style={{ marginTop: 8 }}>
              {statusMsg.text}
            </div>
          )}
        </div>

        {/* Incoming requests */}
        {requests.length > 0 && (
          <div>
            <div className="com-friends-section-label">
              <Users size={11} /> Pedidos pendentes ({requests.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {requests.map(req => {
                const name = req.profile?.display_name ?? 'usuário'
                return (
                  <div key={req.id} className="com-friend-row">
                    <Avatar displayName={name} divisionKey="ze_bosta" size={36} />
                    <div className="com-friend-info">
                      <div className="com-friend-name">{name}</div>
                      <div className="com-friend-meta">quer competir com você</div>
                    </div>
                    <div className="com-friend-actions">
                      <button
                        className="com-friend-action-btn accept"
                        onClick={() => handleRequest(req.id, true)}
                      >
                        <Check size={11} /> Aceitar
                      </button>
                      <button
                        className="com-friend-action-btn decline"
                        onClick={() => handleRequest(req.id, false)}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Friends ranking */}
        <div>
          <div className="com-friends-section-label">
            <Users size={11} /> Ranking entre amigos ({friends.length})
          </div>

          {loading ? (
            <div className="com-skel-list">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="com-skel-row" />)}
            </div>
          ) : friends.length === 0 ? (
            <div className="com-empty" style={{ padding: '24px 16px' }}>
              <Users size={24} />
              <h3 style={{ fontSize: 14, marginTop: 8 }}>Sem amigos ainda.</h3>
              <p style={{ fontSize: 12 }}>
                Adicione pelo codinome acima. O ranking ganha sentido com rivais por perto.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {friends.map((f, i) => (
                <div key={f.friend_id} className="com-friend-row">
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                    color: i === 0 ? '#facc15' : 'var(--com-t2)', minWidth: 24, textAlign: 'center',
                  }}>#{i + 1}</span>
                  <Avatar
                    displayName={f.display_name}
                    divisionKey={f.division_key}
                    avatarColor={f.avatar_color}
                    avatarInitials={f.avatar_initials}
                    size={36}
                  />
                  <div className="com-friend-info">
                    <div className="com-friend-name">{f.display_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <DivisionBadge divisionKey={f.division_key} />
                      <span className="com-friend-meta">
                        {f.total_xp.toLocaleString('pt-BR')} XP
                      </span>
                      <span className="com-friend-meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Flame size={10} style={{ color: '#fb923c' }} /> {f.streak}
                      </span>
                    </div>
                  </div>
                  <div className="com-friend-actions">
                    <button
                      className="com-friend-action-btn"
                      onClick={() => setTalkTarget({ id: f.friend_id, name: f.display_name, div: f.division_key })}
                      title="Trash-talk"
                    >
                      <Swords size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
