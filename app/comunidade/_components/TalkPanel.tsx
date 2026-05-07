'use client'

import { useEffect, useRef, useState } from 'react'
import { Swords, X, Loader2, Send } from 'lucide-react'
import { Portal } from './Portal'
import { Avatar } from './Avatar'
import {
  fetchMessagesWith, markMessagesRead, sendFriendMessage,
  type FriendMessage,
} from '@/lib/community/api'
import type { DivisionKey } from '@/lib/community/divisions'

// Curated trash-talk pre-fills. Aggressive but not abusive — match the
// product tone you specified in the brief.
const PREFILLS: Array<{ id: string; text: string }> = [
  { id: 'mole',        text: 'Tá ficando mole.' },
  { id: 'ficou_pra_tras', text: 'Ficou pra trás.' },
  { id: 'treina',      text: 'Treina ou reclama.' },
  { id: 'fracasso',    text: 'Mais um dia no fracasso?' },
  { id: 'deprimente',  text: 'Seu XP tá deprimente.' },
  { id: 'desistiu',    text: 'Você desistiu ou só cansou?' },
  { id: 'nada',        text: 'Até agora nada?' },
  { id: 'sem_pena',    text: 'O ranking não tem pena.' },
]

interface TalkPanelProps {
  myId:           string
  friendId:       string
  friendName:     string
  friendDivision: DivisionKey
  onClose:        () => void
}

export function TalkPanel({ myId, friendId, friendName, friendDivision, onClose }: TalkPanelProps) {
  const [body, setBody] = useState('')
  const [selectedPreFill, setSelectedPreFill] = useState<string | null>(null)
  const [history, setHistory] = useState<FriendMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const historyEndRef = useRef<HTMLDivElement>(null)

  // Load conversation
  useEffect(() => {
    let cancelled = false
    fetchMessagesWith(friendId).then(rows => {
      if (cancelled) return
      setHistory(rows)
      setLoading(false)
      // Mark unread inbound as read
      const unread = rows.filter(m => m.to_user === myId && m.read_at == null).map(m => m.id)
      if (unread.length > 0) markMessagesRead(unread)
    })
    return () => { cancelled = true }
  }, [friendId, myId])

  useEffect(() => {
    if (!loading) historyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [history.length, loading])

  function pickPreFill(p: typeof PREFILLS[number]) {
    setSelectedPreFill(p.id)
    setBody(p.text)
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  async function handleSend() {
    const text = body.trim()
    if (!text || sending) return
    if (text.length > 200) {
      setError('Máximo 200 caracteres.')
      return
    }
    setSending(true)
    setError('')
    const result = await sendFriendMessage(friendId, text, selectedPreFill ?? undefined)
    setSending(false)
    if (!result.ok) {
      const msg = (result.error ?? '').toLowerCase()
      if (msg.includes('rate_limited')) setError('Calma. 12 mensagens por hora.')
      else if (msg.includes('not_friends')) setError('Vocês não são mais amigos.')
      else setError('Não foi possível enviar.')
      return
    }
    // Optimistic insert
    setHistory(prev => [...prev, {
      id: -Date.now(),
      from_user: myId,
      to_user: friendId,
      body: text,
      pre_fill_id: selectedPreFill,
      created_at: new Date().toISOString(),
      read_at: null,
    }])
    setBody('')
    setSelectedPreFill(null)
  }

  return (
    <Portal>
      <div className="com-talk-overlay" role="dialog" aria-modal="true" onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}>
        <div className="com-talk-card" onClick={e => e.stopPropagation()}>
          <div className="com-talk-header">
            <div className="com-talk-title">
              <Avatar displayName={friendName} divisionKey={friendDivision} size={28} />
              <span>Trash-talk · {friendName}</span>
            </div>
            <button className="com-promo-close" onClick={onClose} aria-label="Fechar"><X size={14} /></button>
          </div>

          <div className="com-talk-prefills">
            {PREFILLS.map(p => (
              <button
                key={p.id}
                type="button"
                className={`com-talk-prefill ${selectedPreFill === p.id ? 'selected' : ''}`}
                onClick={() => pickPreFill(p)}
              >
                {p.text}
              </button>
            ))}
          </div>

          <textarea
            ref={inputRef}
            className="com-talk-input"
            placeholder="Provoque ou edite o pre-fill..."
            value={body}
            onChange={e => {
              setBody(e.target.value.slice(0, 200))
              if (selectedPreFill && e.target.value !== PREFILLS.find(p => p.id === selectedPreFill)?.text) {
                setSelectedPreFill(null)
              }
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            maxLength={200}
          />
          <div className="com-talk-counter">{body.length} / 200</div>

          {error && <div className="com-friends-msg err" style={{ marginTop: 8 }}>{error}</div>}

          <button
            type="button"
            className="com-talk-send"
            onClick={handleSend}
            disabled={!body.trim() || sending}
          >
            {sending ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
            {sending ? 'Enviando...' : 'Provocar'}
          </button>

          {!loading && history.length > 0 && (
            <div className="com-talk-history">
              {history.map(m => {
                const fromMe = m.from_user === myId
                return (
                  <div key={m.id}>
                    <div className={`com-talk-msg ${fromMe ? 'from-me' : 'from-them'}`}>
                      {m.body}
                    </div>
                    <div className="com-talk-msg-time" style={{ textAlign: fromMe ? 'right' : 'left' }}>
                      {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
              <div ref={historyEndRef} />
            </div>
          )}
        </div>
      </div>
    </Portal>
  )
}
