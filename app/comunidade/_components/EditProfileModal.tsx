'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, X, Lock, Pencil } from 'lucide-react'
import { Avatar, METAL_PALETTE, metalFromHex } from './Avatar'
import { Portal } from './Portal'
import { checkDisplayNameAvailable, updateProfile, type PublicProfile } from '@/lib/community/api'
import { divisionForUser } from '@/lib/community/divisions'

const NAME_REGEX = /^[A-Za-z0-9_.]+$/

interface EditProfileModalProps {
  profile: PublicProfile
  onClose: () => void
  onSaved: (updated: PublicProfile) => void
}

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'unchanged'

export function EditProfileModal({ profile, onClose, onSaved }: EditProfileModalProps) {
  const [name, setName]         = useState(profile.display_name)
  const [initials, setInitials] = useState(profile.avatar_initials || '')
  const [color, setColor]       = useState<string>(profile.avatar_color || (metalFromHex(profile.avatar_color)?.hex ?? METAL_PALETTE[0]!.hex))
  const [nameStatus, setNameStatus] = useState<Status>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [renameLockedUntil, setRenameLockedUntil] = useState<Date | null>(null)
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compute the cooldown: 30 days from last_rename_at (if any)
  useEffect(() => {
    if (profile.last_rename_at) {
      const last = new Date(profile.last_rename_at)
      const next = new Date(last.getTime() + 30 * 24 * 3600_000)
      if (next.getTime() > Date.now()) setRenameLockedUntil(next)
    }
  }, [profile.last_rename_at])

  // Live availability check on display_name (debounced, only when changed)
  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current)
    const trimmed = name.trim()
    if (trimmed === profile.display_name) { setNameStatus('unchanged'); return }
    if (!trimmed) { setNameStatus('idle'); return }
    if (trimmed.length < 3 || trimmed.length > 20 || !NAME_REGEX.test(trimmed)) {
      setNameStatus('invalid'); return
    }
    setNameStatus('checking')
    checkTimer.current = setTimeout(async () => {
      const ok = await checkDisplayNameAvailable(trimmed, profile.id)
      setNameStatus(ok ? 'available' : 'taken')
    }, 300)
    return () => { if (checkTimer.current) clearTimeout(checkTimer.current) }
  }, [name, profile.display_name, profile.id])

  const wantsRename = name.trim() !== profile.display_name && nameStatus === 'available'
  const canSubmit = !submitting && (
    nameStatus === 'unchanged' || nameStatus === 'available'
  ) && !(wantsRename && renameLockedUntil)

  async function handleSave() {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    const result = await updateProfile({
      displayName:    wantsRename ? name.trim() : undefined,
      avatarColor:    color,
      avatarInitials: initials.trim() || '', // empty string clears it
    })
    setSubmitting(false)
    if (result.ok === true) {
      onSaved(result.profile)
      onClose()
      return
    }
    const code = result.code
    if (code === 'name_taken') {
      setError('Esse codinome já foi tomado.')
      setNameStatus('taken')
    } else if (code === 'name_length' || code === 'name_chars') {
      setError('Codinome inválido. 3–20 letras, números, _ ou .')
    } else if (code === 'name_reserved') {
      setError('Esse codinome está reservado.')
    } else if (code === 'rename_cooldown') {
      if (result.nextAllowedAt) setRenameLockedUntil(new Date(result.nextAllowedAt))
      setError('Você não pode renomear ainda. O codinome trava por 30 dias.')
    } else {
      setError('Erro de conexão. Tente novamente.')
    }
  }

  const previewDiv = divisionForUser(profile.total_xp, profile.days_active ?? 0)
  const previewColor = color
  const previewInitials = initials.trim()

  return (
    <Portal>
      <div className="com-edit-overlay" role="dialog" aria-modal="true" onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}>
        <div className="com-edit-card" onClick={e => e.stopPropagation()}>
          <button className="com-promo-close" onClick={onClose} aria-label="Fechar">
            <X size={14} />
          </button>

          <div className="com-edit-eyebrow"><Pencil size={11} /> Editar perfil</div>
          <h2 className="com-edit-title">Sua identidade no ranking.</h2>

          <div className="com-edit-preview">
            <Avatar
              displayName={name || profile.display_name}
              divisionKey={previewDiv.key}
              avatarColor={previewColor}
              avatarInitials={previewInitials}
              size={64}
              glow
            />
            <div className="com-edit-preview-meta">
              <div className="com-edit-preview-name">{name.trim() || 'Sem nome'}</div>
              <div className="com-edit-preview-sub">{previewDiv.short} · {profile.total_xp.toLocaleString('pt-BR')} XP</div>
            </div>
          </div>

          {/* Display name */}
          <label className="com-edit-label">
            Codinome
            {renameLockedUntil && (
              <span className="com-edit-lock">
                <Lock size={9} /> trava por {daysUntil(renameLockedUntil)}d
              </span>
            )}
          </label>
          <div className="com-edit-input-wrap">
            <input
              className="com-edit-input"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={!!renameLockedUntil}
            />
            <span className={`com-onboard-status com-onboard-status-${nameStatus}`}>
              {nameStatus === 'checking'  && <Loader2 size={12} className="spin" />}
              {nameStatus === 'available' && <Check size={12} />}
              {nameStatus === 'available' && <span>disponível</span>}
              {nameStatus === 'taken'     && <span>já foi tomado</span>}
              {nameStatus === 'invalid'   && <span>3–20 letras / números / _ / .</span>}
              {nameStatus === 'unchanged' && <span style={{ color: 'var(--com-t3)' }}>atual</span>}
            </span>
          </div>
          {renameLockedUntil && (
            <div className="com-edit-help">
              Liberação em {renameLockedUntil.toLocaleDateString('pt-BR')}.
              Codinome trava por 30 dias para preservar a credibilidade do ranking.
            </div>
          )}

          {/* Initials */}
          <label className="com-edit-label" style={{ marginTop: 14 }}>
            Iniciais do avatar <span className="com-edit-help-inline">opcional · até 3 letras</span>
          </label>
          <input
            className="com-edit-input"
            placeholder={profile.display_name.slice(0, 2).toUpperCase()}
            value={initials}
            onChange={e => setInitials(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase())}
            maxLength={3}
          />

          {/* Color palette */}
          <label className="com-edit-label" style={{ marginTop: 14 }}>
            Cor do avatar
          </label>
          <div className="com-edit-palette">
            {METAL_PALETTE.map(opt => (
              <button
                key={opt.key}
                type="button"
                className={`com-edit-swatch ${color === opt.hex ? 'selected' : ''}`}
                style={{
                  ['--metal' as string]: opt.hex,
                  ['--metal-glow' as string]: opt.glow,
                }}
                onClick={() => setColor(opt.hex)}
                title={opt.label}
                aria-label={opt.label}
              >
                {color === opt.hex ? <Check size={12} /> : null}
              </button>
            ))}
          </div>

          {error && <div className="com-friends-msg err" style={{ marginTop: 12 }}>{error}</div>}

          <button
            className="com-edit-cta"
            onClick={handleSave}
            disabled={!canSubmit}
          >
            {submitting ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
            {submitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </Portal>
  )
}

function daysUntil(d: Date): number {
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / (24 * 3600_000)))
}
