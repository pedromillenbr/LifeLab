'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useEffect, useMemo, useState } from 'react'
import { useStore } from '@/store/useStore'
import {
  ArrowLeft, Plus, Flame, Trophy, Calendar, Sparkles,
  Target as TargetIcon, Trash2, Archive, ArchiveRestore,
} from 'lucide-react'
import { GoalCover } from '@/components/metas/GoalCover'
import { GoalProgressRing } from '@/components/metas/GoalProgressRing'
import { GoalTimeline } from '@/components/metas/GoalTimeline'
import { GoalMilestones } from '@/components/metas/GoalMilestones'
import { AddLogModal } from '@/components/metas/AddLogModal'
import { MilestoneIcon } from '@/components/metas/MilestoneIcon'
import { Modal } from '@/components/ui/Modal'
import {
  getGoalProgress, getGoalRemaining, getGoalStreak,
  getNextMilestone, getEstimatedDaysToFinish,
  getCoverPreset, getPresetForCategory,
  formatGoalValue, getMotivationalPhrase, getMilestoneIconKey,
  daysSince, daysUntil,
} from '@/lib/goals'

type Section = 'overview' | 'logs' | 'milestones' | 'plan'

export default function MetaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const goal = useStore(s => s.goals.find(g => g.id === id))
  const addGoalLog = useStore(s => s.addGoalLog)
  const removeGoalLog = useStore(s => s.removeGoalLog)
  const addGoalMilestone = useStore(s => s.addGoalMilestone)
  const removeGoalMilestone = useStore(s => s.removeGoalMilestone)
  const archiveGoal = useStore(s => s.archiveGoal)
  const removeGoal = useStore(s => s.removeGoal)

  const [section, setSection] = useState<Section>('overview')
  const [showLog, setShowLog] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [confetti, setConfetti] = useState(0)

  // Self-heal: meta sumiu (URL antiga) → volta pra lista
  useEffect(() => {
    if (!goal) {
      const t = setTimeout(() => router.replace('/metas'), 600)
      return () => clearTimeout(t)
    }
  }, [goal, router])

  const preset = useMemo(() => {
    if (!goal) return getPresetForCategory('outro')
    return goal.coverPreset ? getCoverPreset(goal.coverPreset) : getPresetForCategory(goal.category)
  }, [goal])

  if (!goal) {
    return (
      <div className="p-6 max-w-[900px] mx-auto">
        <div style={{
          padding: 32, textAlign: 'center', borderRadius: 16,
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
        }}>
          <TargetIcon size={36} style={{ opacity: .3, marginBottom: 8 }} />
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 13 }}>Voltando para suas metas…</p>
        </div>
      </div>
    )
  }

  const pct = getGoalProgress(goal)
  const remaining = getGoalRemaining(goal)
  const streak = getGoalStreak(goal.logs)
  const nextMs = getNextMilestone(goal)
  const eta = getEstimatedDaysToFinish(goal)
  const phrase = getMotivationalPhrase(pct)
  const dStart = daysSince(goal.startDate)
  const dDeadline = daysUntil(goal.targetDate)
  const conqMs = goal.milestones.filter(m => m.achievedAt).length

  function handleAddLog(log: { date: string; value: number; note?: string }) {
    if (!goal) return
    const beforeMs = goal.milestones.filter(m => m.achievedAt).length
    addGoalLog(goal.id, log)
    // Confetti se cumpriu marco novo
    setTimeout(() => {
      const fresh = useStore.getState().goals.find(g => g.id === goal.id)
      const afterMs = fresh?.milestones.filter(m => m.achievedAt).length ?? 0
      if (afterMs > beforeMs) setConfetti(c => c + 1)
    }, 50)
  }

  const heroHeight = goal.subtitle ? 240 : 200

  return (
    <div className="max-w-[1100px] mx-auto pb-20">
      {/* HEADER CINEMATOGRÁFICO */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <GoalCover goal={goal} variant="hero" height={heroHeight} rounded={0}>
          {/* Top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            zIndex: 2,
          }}>
            <Link
              href="/metas"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 999,
                background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(10px)',
                color: '#fff', textDecoration: 'none',
                fontSize: 12, fontWeight: 600,
                border: '1px solid rgba(255,255,255,.1)',
              }}
            >
              <ArrowLeft size={14} /> Metas
            </Link>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => archiveGoal(goal.id, !goal.archived)}
                title={goal.archived ? 'Desarquivar' : 'Arquivar'}
                style={iconBtnStyle}
              >
                {goal.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                title="Excluir meta"
                style={iconBtnStyle}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Bottom: título + categoria */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px 22px',
            zIndex: 2,
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 999,
                background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
                border: `1px solid ${preset.accent}55`,
                fontSize: 10, fontWeight: 700, color: preset.accent,
                letterSpacing: 1, textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <preset.icon size={11} />
                {preset.label}
              </span>
              {streak > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(251,191,36,.4)',
                  fontSize: 11, fontWeight: 700, color: '#fbbf24',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <Flame size={11} /> {streak} dias seguidos
                </span>
              )}
            </div>
            <h1 style={{
              fontSize: 'clamp(24px, 4.5vw, 38px)',
              fontWeight: 800, color: '#fff',
              lineHeight: 1.1, margin: 0,
              textShadow: '0 4px 16px rgba(0,0,0,.7)',
              letterSpacing: -0.5,
            }}>{goal.title}</h1>
            {goal.subtitle && (
              <p style={{
                fontSize: 14, color: 'rgba(255,255,255,.75)',
                marginTop: 6, marginBottom: 0, maxWidth: 600,
                textShadow: '0 2px 8px rgba(0,0,0,.6)',
                lineHeight: 1.5,
              }}>{goal.subtitle}</p>
            )}
          </div>
        </GoalCover>
      </div>

      {/* CONTAINER de conteúdo (padding lateral) */}
      <div style={{ padding: '0 18px' }}>
        {/* Frase motivacional + ring + CTA */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 160px',
          gap: 20, alignItems: 'center', marginBottom: 22,
        }} className="meta-hero-row">
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, color: preset.accent, letterSpacing: 1.5,
              textTransform: 'uppercase', fontWeight: 700, marginBottom: 6,
              fontFamily: "'JetBrains Mono', monospace",
              opacity: .9,
            }}>{phrase}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: remaining > 0 ? 6 : 12 }}>
              <span style={{
                fontSize: 30, fontWeight: 800, color: '#fff',
                fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
              }}>{formatGoalValue(goal.currentValue, goal.unit)}</span>
              <span style={{
                fontSize: 13, color: 'rgba(255,255,255,.4)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>de {formatGoalValue(goal.targetValue, goal.unit)}</span>
            </div>
            {remaining > 0 && (
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.65)', marginBottom: 12, lineHeight: 1.4 }}>
                Faltam <strong style={{ color: '#fff' }}>{formatGoalValue(remaining, goal.unit)}</strong>
                {eta !== null && (
                  <> · estimativa: <strong style={{ color: preset.accent }}>{eta} dias</strong> no ritmo atual</>
                )}
              </div>
            )}
            <button
              onClick={() => setShowLog(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12,
                background: preset.accent, color: '#0a0d14',
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                boxShadow: `0 4px 20px ${preset.accent}55`,
                transition: 'transform .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Plus size={15} /> Atualizar progresso
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoalProgressRing pct={pct} size={150} thickness={10} color={preset.accent}>
              <span style={{
                fontSize: 32, fontWeight: 800, color: '#fff',
                fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
              }}>{pct.toFixed(0)}<span style={{ fontSize: 16, color: 'rgba(255,255,255,.5)' }}>%</span></span>
              <span style={{
                fontSize: 9, color: 'rgba(255,255,255,.5)', letterSpacing: 1,
                textTransform: 'uppercase', marginTop: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>concluído</span>
            </GoalProgressRing>
          </div>
        </div>

        {/* Stats compactas */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 8, marginBottom: 24,
        }}>
          <Stat icon={Calendar} label="Em jornada" value={`${dStart} dias`} accent={preset.accent} />
          <Stat icon={Sparkles} label="Marcos" value={`${conqMs}/${goal.milestones.length}`} accent={preset.accent} />
          <Stat icon={Flame} label="Streak" value={`${streak}`} accent={preset.accent} />
          {dDeadline !== null && (
            <Stat
              icon={TargetIcon}
              label="Prazo"
              value={dDeadline >= 0 ? `${dDeadline}d` : `vencido ${-dDeadline}d`}
              accent={dDeadline >= 0 ? preset.accent : '#f87171'}
            />
          )}
        </div>

        {/* TABS */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 18,
          borderBottom: '1px solid rgba(255,255,255,.08)',
          overflowX: 'auto',
        }}>
          {([
            ['overview', 'Visão geral'],
            ['logs', `Registros (${goal.logs.length})`],
            ['milestones', `Marcos (${conqMs}/${goal.milestones.length})`],
            ['plan', 'Planejamento'],
          ] as [Section, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              style={{
                padding: '10px 14px', background: 'transparent',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                color: section === key ? preset.accent : 'rgba(255,255,255,.5)',
                borderBottom: `2px solid ${section === key ? preset.accent : 'transparent'}`,
                marginBottom: -1, whiteSpace: 'nowrap', transition: 'all .2s',
              }}
            >{label}</button>
          ))}
        </div>

        {/* CONTEÚDO POR SEÇÃO */}
        {section === 'overview' && (
          <Section title="Próximo marco">
            {nextMs ? (
              <div style={{
                padding: '16px 18px', borderRadius: 14,
                background: `linear-gradient(135deg, ${preset.accent}10, transparent)`,
                border: `1px solid ${preset.accent}33`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${preset.accent}22`,
                  border: `1px solid ${preset.accent}55`,
                  flexShrink: 0,
                  color: preset.accent,
                }}>
                  <MilestoneIcon iconKey={getMilestoneIconKey(nextMs)} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{nextMs.label}</div>
                  <div style={{
                    fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {formatGoalValue(nextMs.targetValue, goal.unit)}
                    {' · '}
                    falta {formatGoalValue(Math.abs(nextMs.targetValue - goal.currentValue), goal.unit)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: 16, textAlign: 'center',
                borderRadius: 12, border: '1px dashed rgba(255,255,255,.08)',
                color: 'rgba(255,255,255,.5)', fontSize: 13,
              }}>
                Todos os marcos foram conquistados. Adicione novos na aba Marcos.
              </div>
            )}
            <Section title="Últimos registros" titleStyle={{ marginTop: 24 }}>
              <GoalTimeline goal={{ ...goal, logs: goal.logs.slice(-5) }} accent={preset.accent} />
              {goal.logs.length > 5 && (
                <button
                  onClick={() => setSection('logs')}
                  style={{
                    marginTop: 8, fontSize: 12, color: preset.accent,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Ver todos os {goal.logs.length} registros →
                </button>
              )}
            </Section>
          </Section>
        )}

        {section === 'logs' && (
          <Section title="Histórico completo">
            <GoalTimeline
              goal={goal}
              accent={preset.accent}
              onRemove={(logId) => removeGoalLog(goal.id, logId)}
            />
          </Section>
        )}

        {section === 'milestones' && (
          <Section title="Marcos da jornada">
            <GoalMilestones
              goal={goal}
              accent={preset.accent}
              onAdd={(m) => addGoalMilestone(goal.id, m)}
              onRemove={(mid) => removeGoalMilestone(goal.id, mid)}
            />
          </Section>
        )}

        {section === 'plan' && (
          <Section title="Planejamento">
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <PlanItem label="Início da jornada" value={new Date(goal.startDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} />
              <PlanItem label="Valor inicial" value={formatGoalValue(goal.startValue, goal.unit)} />
              <PlanItem label="Valor alvo" value={formatGoalValue(goal.targetValue, goal.unit)} />
              <PlanItem label="Direção" value={goal.direction === 'increase' ? 'Subir até alvo' : 'Descer até alvo'} />
              {goal.targetDate && (
                <PlanItem label="Prazo final" value={new Date(goal.targetDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} />
              )}
              {eta !== null && (
                <PlanItem label="ETA (ritmo atual)" value={`${eta} dias`} accent={preset.accent} />
              )}
              <PlanItem label="Última atualização" value={new Date(goal.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} />
            </div>
          </Section>
        )}
      </div>

      {/* Modais */}
      <AddLogModal
        open={showLog}
        onClose={() => setShowLog(false)}
        goal={goal}
        accent={preset.accent}
        onSubmit={handleAddLog}
      />

      <Modal open={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} title="Excluir meta?">
        <div className="space-y-4">
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>
            A meta <strong>{goal.title}</strong> e seus {goal.logs.length} registros serão removidos.
            Considere arquivar para preservar o histórico.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="btn-ghost" style={{ flex: 1, padding: 12 }}
            >Cancelar</button>
            <button
              onClick={() => { removeGoal(goal.id); router.replace('/metas') }}
              style={{
                flex: 1, padding: 12, borderRadius: 8,
                background: '#7f1d1d', color: '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              }}
            >Excluir definitivamente</button>
          </div>
        </div>
      </Modal>

      {/* Confetti dopaminérgico ao bater marco */}
      {confetti > 0 && <Confetti key={confetti} accent={preset.accent} />}

      <style jsx>{`
        @media (max-width: 600px) {
          .meta-hero-row {
            grid-template-columns: 1fr !important;
            text-align: left;
          }
          .meta-hero-row > div:last-child {
            justify-self: center;
          }
        }
      `}</style>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 999,
  background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,.1)',
  color: '#fff', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

function Section({ title, children, titleStyle }: { title: string; children: React.ReactNode; titleStyle?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)',
        letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
        fontFamily: "'JetBrains Mono', monospace",
        ...titleStyle,
      }}>{title}</h3>
      {children}
    </div>
  )
}

function Stat({
  icon: Icon, label, value, accent,
}: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; value: string; accent: string }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10,
      background: 'rgba(255,255,255,.025)',
      border: '1px solid rgba(255,255,255,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <Icon size={11} style={{ color: accent }} />
        <span style={{
          fontSize: 9, color: 'rgba(255,255,255,.5)',
          letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600,
        }}>{label}</span>
      </div>
      <div style={{
        fontSize: 16, fontWeight: 800, color: '#fff',
        fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
      }}>{value}</div>
    </div>
  )
}

function PlanItem({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      background: 'rgba(255,255,255,.025)',
      border: '1px solid rgba(255,255,255,.06)',
    }}>
      <div style={{
        fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: 1,
        textTransform: 'uppercase', fontWeight: 600, marginBottom: 5,
      }}>{label}</div>
      <div style={{
        fontSize: 13, color: accent ?? '#fff', fontWeight: 700,
      }}>{value}</div>
    </div>
  )
}

/**
 * Confetti CSS leve — 14 partículas que caem com cores variadas.
 * Some sozinho após 1.6s. Sem libs externas.
 */
function Confetti({ accent }: { accent: string }) {
  const colors = [accent, '#fbbf24', '#10b981', '#a78bfa', '#fb923c', '#60a5fa']
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[i % colors.length],
    delay: Math.random() * 0.2,
    rotate: Math.random() * 360,
    duration: 1.2 + Math.random() * 0.6,
  }))
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200,
        overflow: 'hidden',
      }}
    >
      {pieces.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: -10,
            left: `${p.left}%`,
            width: 8, height: 12,
            background: p.color,
            opacity: 0.95,
            borderRadius: 2,
            animation: `confettiFall ${p.duration}s cubic-bezier(.4,.7,.6,1) ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
            boxShadow: `0 0 6px ${p.color}77`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
