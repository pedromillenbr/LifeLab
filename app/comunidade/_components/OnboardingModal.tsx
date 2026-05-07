'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, ShieldAlert } from 'lucide-react'
import { Avatar } from './Avatar'
import { checkDisplayNameAvailable, claimDisplayName, type PublicProfile } from '@/lib/community/api'

interface OnboardingModalProps {
  userId:    string
  onDone:    (profile: PublicProfile) => void
}

const NAME_REGEX = /^[A-Za-z0-9_.]+$/

export function OnboardingModal({ userId, onDone }: OnboardingModalProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Live availability check (debounced)
  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current)
    const trimmed = name.trim()
    setErrorMsg('')

    if (!trimmed) { setStatus('idle'); return }
    if (trimmed.length < 3 || trimmed.length > 20 || !NAME_REGEX.test(trimmed)) {
      setStatus('invalid')
      return
    }
    setStatus('checking')

    checkTimer.current = setTimeout(async () => {
      const ok = await checkDisplayNameAvailable(trimmed, userId)
      setStatus(ok ? 'available' : 'taken')
    }, 350)

    return () => { if (checkTimer.current) clearTimeout(checkTimer.current) }
  }, [name, userId])

  async function handleSubmit() {
    if (status !== 'available' && status !== 'idle') return
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    const result = await claimDisplayName(trimmed)
    setSubmitting(false)
    if (result.ok === true) {
      onDone(result.profile)
      return
    }
    const code = (result.error ?? '').toLowerCase()
    if (code.includes('taken') || code.includes('23505')) {
      setStatus('taken')
      setErrorMsg('Esse nome acabou de ser tomado.')
    } else if (code.includes('reserved')) {
      setStatus('invalid')
      setErrorMsg('Esse nome está reservado.')
    } else if (code.includes('chars') || code.includes('length')) {
      setStatus('invalid')
      setErrorMsg('Use 3 a 20 caracteres: letras, números, _ ou .')
    } else {
      setStatus('error')
      setErrorMsg('Erro de conexão. Tente novamente.')
    }
  }

  const canSubmit = status === 'available' && !submitting

  return (
    <div className="com-onboard-overlay" role="dialog" aria-modal="true">
      <div className="com-onboard-card">
        <div className="com-onboard-eyebrow">
          <ShieldAlert size={11} /> Identidade pública
        </div>
        <h2 className="com-onboard-title">Escolha seu codinome.</h2>
        <p className="com-onboard-sub">
          Esse é o nome que vai aparecer nos rankings, no Hall of Elite e nos
          duelos. Você não muda depois sem motivo. Pense bem.
        </p>

        <div className="com-onboard-preview">
          <Avatar displayName={name || '??'} divisionKey="ze_bosta" size={56} glow />
          <div>
            <div className="com-onboard-preview-name">{name.trim() || 'Seu codinome'}</div>
            <div className="com-onboard-preview-meta">Zé Bosta · 0 XP</div>
          </div>
        </div>

        <div className="com-onboard-input-wrap">
          <input
            ref={inputRef}
            className="com-onboard-input"
            placeholder="ex: pedro_focado"
            maxLength={20}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && canSubmit) handleSubmit() }}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          <span className={`com-onboard-status com-onboard-status-${status}`}>
            {status === 'checking'  && <Loader2 size={12} className="spin" />}
            {status === 'available' && <Check size={12} />}
            {status === 'available' && <span>disponível</span>}
            {status === 'taken'     && <span>já foi tomado</span>}
            {status === 'invalid'   && <span>3–20 letras / números / _ / .</span>}
            {status === 'error'     && <span>erro de conexão</span>}
          </span>
        </div>

        {errorMsg && <div className="com-onboard-error">{errorMsg}</div>}

        <button
          className="com-onboard-cta"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
          {submitting ? 'Reservando...' : 'Confirmar codinome'}
        </button>

        <p className="com-onboard-foot">
          Ao confirmar, você entra no ranking. Sem volta — mas pode evoluir.
        </p>
      </div>
    </div>
  )
}
