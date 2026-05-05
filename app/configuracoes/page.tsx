'use client'
import { useEffect, useState, useRef, useCallback, type ReactNode, type CSSProperties } from 'react'
import { useStore } from '@/store/useStore'
import { Toggle } from '@/components/ui/Toggle'
import { Select } from '@/components/ui/Select'
import { Camera, Shield, Bell, Palette, Save, DollarSign, Settings, Send, Check, LogOut } from 'lucide-react'
import { PEDRO } from '@/lib/pedroProfile'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { stopAutoSync } from '@/store/syncService'
import { THEMES, applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
  type PermissionStatus,
} from '@/lib/notifications'

/* ───── 3D tilt + spotlight wrapper ───── */
function TiltCard({ children, className, style }: {
  children: ReactNode; className?: string; style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', (x * 100).toFixed(1) + '%')
    el.style.setProperty('--my', (y * 100).toFixed(1) + '%')
    el.style.transform = `perspective(900px) rotateX(${((y - .5) * -7).toFixed(2)}deg) rotateY(${((x - .5) * 7).toFixed(2)}deg) scale(1.012)`
  }, [])
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return
    el.style.transform = ''
  }, [])
  return (
    <div ref={ref} className={`tilt-card ${className || ''}`} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="tilt-laser" aria-hidden />
      <div className="tilt-spot" aria-hidden />
      <div style={{ position: 'relative', zIndex: 4 }}>{children}</div>
    </div>
  )
}

const tiltCSS = `
@keyframes tiltLaserSpin { to { --laser-angle: 360deg; } }
.tilt-card {
  position: relative;
  transition: transform .35s cubic-bezier(.22,.68,0,1.2), box-shadow .3s, border-color .3s;
  --mx: 50%; --my: 50%; --laser-angle: 0deg;
  transform-style: preserve-3d;
  overflow: hidden;
}
.tilt-card:hover {
  box-shadow: 0 14px 44px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.18), 0 0 32px rgba(var(--color-primary-rgb), .10) !important;
  border-color: rgba(var(--color-primary-rgb), .32) !important;
}
.tilt-laser {
  position: absolute; inset: -1px; border-radius: inherit;
  background: conic-gradient(from var(--laser-angle), transparent 0deg, var(--color-primary) 12deg, var(--color-primary-light) 22deg, transparent 38deg);
  padding: 1px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .35s;
  animation: tiltLaserSpin 5s linear infinite;
  pointer-events: none; z-index: 2;
}
.tilt-card:hover .tilt-laser { opacity: 1; }
.tilt-spot {
  position: absolute; inset: 0; border-radius: inherit;
  background: radial-gradient(280px circle at var(--mx) var(--my), rgba(var(--color-primary-rgb), 0.10) 0%, transparent 70%);
  opacity: 0; transition: opacity .25s;
  pointer-events: none; z-index: 1;
}
.tilt-card:hover .tilt-spot { opacity: 1; }
`

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

export default function ConfiguracoesPage() {
  const { profile, updateProfile } = useStore()
  const router                    = useRouter()
  const [tab, setTab]             = useState<Tab>('perfil')
  const [name, setName]           = useState(profile.name)
  const [bio, setBio]             = useState(profile.bio)
  const [saved, setSaved]         = useState(false)
  const [newPassword, setNewPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwError, setPwError]     = useState('')
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [loggingOut,    setLoggingOut]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleLogout() {
    if (!logoutConfirm) { setLogoutConfirm(true); return }
    setLoggingOut(true)
    stopAutoSync()
    await signOut()
    router.replace('/auth')
  }

  // Tema atual + status de permissão de notificação
  const activeThemeKey = profile.primaryColor || DEFAULT_THEME_KEY
  const [permission, setPermission] = useState<PermissionStatus>('default')
  useEffect(() => { setPermission(getNotificationPermission()) }, [])

  function handleSelectTheme(key: string) {
    applyTheme(key)
    updateProfile({ primaryColor: key })
  }

  async function handleToggleNotifications(checked: boolean) {
    if (!checked) {
      updateProfile({ notifications: false })
      return
    }
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') {
      updateProfile({ notifications: true })
      sendNotification('LifeLab ativado', {
        body: 'Notificações ativas — você receberá lembretes diários.',
        tag: 'lifelab-welcome',
      })
    } else {
      updateProfile({ notifications: false })
    }
  }

  function handleTestNotification() {
    sendNotification('LifeLab — teste', {
      body: 'Notificações estão funcionando perfeitamente.',
      tag: 'lifelab-test',
    })
  }

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
      className="p-4 md:p-6 max-w-[900px] mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <style>{tiltCSS}</style>
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-fade-in">
        <p className="slabel" style={{ marginBottom: 4 }}>Conta</p>
        <h1 className="flex items-center gap-3 text-2xl md:text-[30px]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: P, letterSpacing: '-0.02em', textShadow: '0 0 24px var(--color-primary-glow)' }}>
          <Settings size={26} style={{ color: P, filter: 'drop-shadow(0 0 8px var(--color-primary-glow))' }} />
          Configurações
        </h1>
        <p style={{ color: TT, fontSize: 13, marginTop: 4 }}>Personalize sua experiência</p>
      </div>

      {/* Cartão de perfil */}
      <TiltCard className="rounded-lg p-5 mb-6 animate-fade-in"
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
      </TiltCard>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 mb-6 gap-1 animate-fade-in"
        style={{ background: BG3, border: `1px solid ${BORDER}`, animationDelay: '120ms' }}>
        {TABS.map(t => (
          <button key={t.key}
            onClick={(e) => { setTab(t.key); (e.currentTarget as HTMLButtonElement).blur() }}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={tab === t.key
              ? { background: P, color: '#fff', boxShadow: '0 2px 12px var(--color-primary-glow)' }
              : { background: 'transparent', color: TT, boxShadow: 'none' }
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
            <Select
              value={profile.currency}
              onChange={(v) => updateProfile({ currency: v })}
              options={[{ value: 'BRL', label: 'R$ — Real Brasileiro' }]}
            />
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
          {/* Notificações */}
          <TiltCard className="rounded-lg p-5"
            style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: PM, border: `1px solid ${PB}` }}>
                  <Bell size={16} style={{ color: P }} />
                </div>
                <div className="min-w-0">
                  <p style={{ color: TM, fontWeight: 500, fontSize: 14 }}>Notificações</p>
                  <p style={{ fontSize: 11, color: TT }}>
                    {permission === 'unsupported'
                      ? 'Não suportado neste navegador'
                      : permission === 'denied'
                        ? 'Permissão negada — ajuste nas configurações do navegador'
                        : profile.notifications && permission === 'granted'
                          ? 'Lembretes diários ativados'
                          : 'Receber lembretes diários'}
                  </p>
                </div>
              </div>
              <Toggle
                checked={!!profile.notifications && permission === 'granted'}
                onChange={handleToggleNotifications}
              />
            </div>

            {profile.notifications && permission === 'granted' && (
              <button
                onClick={handleTestNotification}
                className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: PM,
                  border: `1px solid ${PB}`,
                  color: P,
                }}
              >
                <Send size={12} />
                Enviar notificação teste
              </button>
            )}
          </TiltCard>

          {/* Seletor de tema */}
          <TiltCard className="rounded-lg p-5"
            style={{ background: BG2, border: `1px solid ${BORDER}`, boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: PM, border: `1px solid ${PB}` }}>
                <Palette size={16} style={{ color: P }} />
              </div>
              <div>
                <p style={{ color: TM, fontWeight: 500, fontSize: 14 }}>Esquema de Cores</p>
                <p style={{ fontSize: 11, color: TT }}>Escolha a paleta principal do app</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {THEMES.map(t => {
                const isActive = activeThemeKey === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => handleSelectTheme(t.key)}
                    className="text-left rounded-lg p-3 transition-all duration-200"
                    style={{
                      background: isActive ? `rgba(${t.primaryRgb}, 0.10)` : BG3,
                      border: `1.5px solid ${isActive ? t.primary : BORDER}`,
                      boxShadow: isActive
                        ? `0 0 0 1px ${t.primary}, 0 0 16px rgba(${t.primaryRgb}, 0.25)`
                        : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full"
                          style={{
                            background: t.primary,
                            boxShadow: `0 0 8px rgba(${t.primaryRgb}, 0.5)`,
                          }}
                        />
                        <span
                          className="w-5 h-5 rounded-full"
                          style={{
                            background: t.accent,
                            boxShadow: `0 0 8px rgba(${t.accentRgb}, 0.5)`,
                            marginLeft: -8,
                            border: '2px solid var(--color-bg-2)',
                          }}
                        />
                      </div>
                      {isActive && <Check size={14} style={{ color: t.primary }} />}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TM }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: TT, marginTop: 2 }}>{t.description}</div>
                  </button>
                )
              })}
            </div>
          </TiltCard>
        </div>
      )}

      {/* ── SEGURANÇA ──────────────────────────────────────────────── */}
      {tab === 'seguranca' && (
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '180ms' }}>

          {/* Alterar senha */}
          <TiltCard className="rounded-lg p-5"
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
          </TiltCard>

          {/* Sair da conta */}
          <TiltCard className="rounded-lg p-5"
            style={{ background: BG2, border: `1px solid ${logoutConfirm ? 'rgba(239,68,68,0.35)' : BORDER}`, boxShadow: 'var(--shadow-card)', transition: 'border-color .25s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: logoutConfirm ? 'rgba(239,68,68,0.12)' : BG3, border: `1px solid ${logoutConfirm ? 'rgba(239,68,68,0.35)' : BORDER}`, transition: 'background .25s, border-color .25s' }}>
                <LogOut size={16} style={{ color: logoutConfirm ? '#f87171' : TT, transition: 'color .25s' }} />
              </div>
              <div>
                <p style={{ color: TM, fontWeight: 600, fontSize: 14 }}>Sair da conta</p>
                <p style={{ fontSize: 11, color: TT }}>Encerrar sessão neste dispositivo</p>
              </div>
            </div>

            {logoutConfirm && (
              <div className="rounded-lg px-3 py-2.5 mb-4 text-[12px]"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                Tem certeza? Você precisará fazer login novamente para acessar o app.
              </div>
            )}

            <div className="flex gap-2">
              {logoutConfirm && (
                <button
                  onClick={() => setLogoutConfirm(false)}
                  disabled={loggingOut}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: BG3, border: `1px solid ${BORDER}`, color: TT, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  background:  logoutConfirm ? '#ef4444' : BG3,
                  border:      `1px solid ${logoutConfirm ? '#ef4444' : BORDER}`,
                  color:       logoutConfirm ? '#fff' : TT,
                  cursor:      loggingOut ? 'not-allowed' : 'pointer',
                  opacity:     loggingOut ? 0.6 : 1,
                  boxShadow:   logoutConfirm ? '0 0 18px rgba(239,68,68,0.35)' : 'none',
                  transition:  'all .25s',
                }}
                onMouseEnter={e => { if (!logoutConfirm) (e.currentTarget as HTMLElement).style.color = '#f87171' }}
                onMouseLeave={e => { if (!logoutConfirm) (e.currentTarget as HTMLElement).style.color = TT }}
              >
                <LogOut size={14} />
                {loggingOut ? 'Saindo...' : logoutConfirm ? 'Confirmar saída' : 'Sair da conta'}
              </button>
            </div>
          </TiltCard>

        </div>
      )}

      <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: TT }}>
          LifeLab v1.0.0 · <span style={{ color: P }}>Laboratório de Evolução</span>
        </p>
      </div>
    </motion.div>
  )
}
