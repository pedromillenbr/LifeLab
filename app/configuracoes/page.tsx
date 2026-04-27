'use client'
import { useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { Toggle } from '@/components/ui/Toggle'
import { Camera, Shield, Bell, Moon, Palette, Save, DollarSign, Settings } from 'lucide-react'
import { PEDRO } from '@/lib/pedroProfile'
import { motion } from 'framer-motion'

type Tab = 'perfil' | 'preferencias' | 'seguranca'

const P  = 'var(--color-primary)'
const PM = 'var(--color-primary-muted)'
const PB = 'var(--color-primary-border)'
const BG2 = 'var(--color-bg-2)'
const BG3 = 'var(--color-bg-3)'
const BG4 = 'var(--color-bg-4)'
const BORDER = 'var(--color-border)'
const TM = 'var(--color-text-main)'
const TT = 'var(--color-text-muted)'

const COLORS = [
  { color: '#10b981', label: 'Verde'    },
  { color: 'var(--color-primary)', label: 'Azul'     },
  { color: '#a855f7', label: 'Roxo'     },
  { color: 'var(--color-primary)', label: 'Laranja'  },
  { color: 'var(--color-primary)', label: 'Vermelho' },
]

export default function ConfiguracoesPage() {
  const { profile, updateProfile } = useStore()
  const [tab, setTab]             = useState<Tab>('perfil')
  const [name, setName]           = useState(profile.name)
  const [bio, setBio]             = useState(profile.bio)
  const [saved, setSaved]         = useState(false)
  const [newPassword, setNewPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwError, setPwError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function getXpStart(level: number) {
    const levels = [0, 100, 250, 520, 1000, 2000, 4000, 8000]
    return levels[level - 1] || 0
  }
  const xpRange    = profile.xpToNextLevel - getXpStart(profile.level)
  const xpProgress = profile.xp - getXpStart(profile.level)
  const xpPercent  = Math.round((xpProgress / xpRange) * 100)

  function handleSaveProfile() {
    updateProfile({ name, bio })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateProfile({ avatar: reader.result as string })
    reader.readAsDataURL(file)
  }

  function handleUpdatePassword() {
    if (newPassword.length < 6) { setPwError('Senha deve ter pelo menos 6 caracteres'); return }
    if (newPassword !== confirmPassword) { setPwError('Senhas não coincidem'); return }
    setPwError('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const TABS = [
    { key: 'perfil'      as Tab, label: 'Perfil'       },
    { key: 'preferencias'as Tab, label: 'Preferências' },
    { key: 'seguranca'   as Tab, label: 'Segurança'    },
  ]

  return (
    <motion.div
      className="p-6 max-w-[900px] mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <p className="slabel" style={{ marginBottom: 4 }}>Conta</p>
        <h1 className="flex items-center gap-3"
          style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: P, letterSpacing: '-0.02em', textShadow: '0 0 24px var(--color-primary-glow)' }}>
          <Settings size={26} style={{ color: P, filter: 'drop-shadow(0 0 8px var(--color-primary-glow))' }} />
          Configurações
        </h1>
        <p style={{ color: TT, fontSize: 13, marginTop: 4 }}>Personalize sua experiência</p>
      </div>

      {/* Cartão de perfil */}
      <div className="rounded-lg p-5 mb-6 animate-fade-in"
        style={{ background: BG2, border: `1px solid ${PB}`, boxShadow: 'var(--shadow-glow-sm)', animationDelay: '60ms' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: `2px solid ${PB}`, boxShadow: 'var(--shadow-glow-sm)' }}>
            {profile.avatar
              ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))` }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{profile.name.charAt(0)}</span>
                </div>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p style={{ color: TM, fontWeight: 700, fontSize: 17 }}>{profile.name}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: PM, border: `1px solid ${PB}`, color: P }}>
                NÍVEL {profile.level}
              </span>
            </div>
            <p style={{ color: TT, fontSize: 13, fontStyle: 'italic' }}>"{PEDRO.motivationalPhrase}"</p>
            <p style={{ color: TT, fontSize: 11, marginTop: 2 }}>{profile.xp} / {profile.xpToNextLevel} XP</p>
          </div>
        </div>
        <div className="xp-bar mt-4">
          <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
        </div>
        <p style={{ fontSize: 10, color: TT, marginTop: 4 }}>{xpPercent}% para nível {profile.level + 1}</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 mb-6 gap-1 animate-fade-in"
        style={{ background: BG3, border: `1px solid ${BORDER}`, animationDelay: '120ms' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={tab === t.key
              ? { background: P, color: '#fff', boxShadow: '0 2px 12px var(--color-primary-glow)' }
              : { color: TT }
            }
            onMouseEnter={e => { if (tab !== t.key) (e.currentTarget as HTMLElement).style.color = TM }}
            onMouseLeave={e => { if (tab !== t.key) (e.currentTarget as HTMLElement).style.color = TT }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PERFIL ─────────────────────────────────────────────────── */}
      {tab === 'perfil' && (
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '180ms' }}>
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
              <div className="w-24 h-24 rounded-xl overflow-hidden transition-all duration-200"
                style={{ border: `2px solid ${BORDER}` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = PB)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
              >
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ background: BG4 }}>
                      <Camera size={28} style={{ color: TT }} />
                    </div>
                }
              </div>
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={22} style={{ color: '#fff' }} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: TT }}>Clique para alterar (max 2MB)</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Apelido</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Bio / Regra de Vida</label>
            <textarea className="input resize-none" rows={3} value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Deus é fiel..." maxLength={500} />
            <p style={{ fontSize: 10, color: TT, textAlign: 'right', marginTop: 4 }}>{bio.length}/500</p>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }} className="flex items-center gap-2">
              <DollarSign size={12} /> Moeda de Exibição
            </label>
            <select className="input" value={profile.currency} onChange={e => updateProfile({ currency: e.target.value })}>
              <option value="BRL">R$ — Real Brasileiro</option>
            </select>
          </div>

          <button onClick={handleSaveProfile}
            className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
            style={saved
              ? { background: 'var(--color-primary)', color: '#fff', boxShadow: '0 2px 12px var(--color-primary-glow)' }
              : { background: 'var(--color-primary-dark)', color: '#fff', boxShadow: '0 2px 12px var(--color-primary-muted)' }
            }
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = '' }}
          >
            <Save size={15} />
            {saved ? 'Salvo com sucesso!' : 'Salvar Alterações'}
          </button>
        </div>
      )}

      {/* ── PREFERÊNCIAS ───────────────────────────────────────────── */}
      {tab === 'preferencias' && (
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '180ms' }}>
          {[
            { icon: Moon, label: 'Tema Escuro',   sub: 'Modo escuro ativo',          prop: 'darkMode'       as const },
            { icon: Bell, label: 'Notificações',  sub: 'Receber lembretes diários',   prop: 'notifications'  as const },
          ].map(({ icon: Icon, label, sub, prop }) => (
            <div key={prop} className="rounded-lg p-5"
              style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: PM, border: `1px solid ${PB}` }}>
                    <Icon size={16} style={{ color: P }} />
                  </div>
                  <div>
                    <p style={{ color: TM, fontWeight: 500, fontSize: 14 }}>{label}</p>
                    <p style={{ fontSize: 11, color: TT }}>{sub}</p>
                  </div>
                </div>
                <Toggle checked={!!(profile as any)[prop]} onChange={v => updateProfile({ [prop]: v })} />
              </div>
            </div>
          ))}

          {/* Seletor de cor */}
          <div className="rounded-lg p-5"
            style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: PM, border: `1px solid ${PB}` }}>
                <Palette size={16} style={{ color: P }} />
              </div>
              <div>
                <p style={{ color: TM, fontWeight: 500, fontSize: 14 }}>Cor Principal</p>
                <p style={{ fontSize: 11, color: TT }}>Personalize o destaque do app</p>
              </div>
            </div>
            <div className="flex gap-3">
              {COLORS.map(({ color, label }) => (
                <button key={color} onClick={() => updateProfile({ primaryColor: color })} title={label}
                  className="w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: color,
                    boxShadow: profile.primaryColor === color
                      ? `0 0 0 2px var(--color-bg-1), 0 0 0 4px ${color}, 0 0 12px ${color}60`
                      : 'none',
                    transform: profile.primaryColor === color ? 'scale(1.15)' : '',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SEGURANÇA ──────────────────────────────────────────────── */}
      {tab === 'seguranca' && (
        <div className="animate-fade-in" style={{ animationDelay: '180ms' }}>
          <div className="rounded-lg p-5"
            style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: PM, border: `1px solid ${PB}` }}>
                <Shield size={16} style={{ color: P }} />
              </div>
              <div>
                <p style={{ color: TM, fontWeight: 600, fontSize: 14 }}>Alterar Senha</p>
                <p style={{ fontSize: 11, color: TT }}>Atualize sua senha de acesso</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Nova Senha</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} className="input pr-12"
                    placeholder="Mínimo 6 caracteres" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} />
                  <button onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-colors"
                    style={{ color: TT }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TM)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
                  >
                    {showNew ? '●' : '○'}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Confirmar Nova Senha</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} className="input pr-12"
                    placeholder="Repita a nova senha" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} />
                  <button onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-colors"
                    style={{ color: TT }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = TM)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = TT)}
                  >
                    {showConfirm ? '●' : '○'}
                  </button>
                </div>
              </div>
              {pwError && <p style={{ color: 'var(--color-primary)', fontSize: 12 }}>{pwError}</p>}
              <button onClick={handleUpdatePassword} className="btn-primary w-full justify-center py-3">
                Atualizar Senha
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: TT }}>
          LifeLab v1.0.0 · <span style={{ color: P }}>Hunt or be hunted.</span>
        </p>
      </div>
    </motion.div>
  )
}
