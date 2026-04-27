'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Sparkles, Send, Mic, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PEDRO } from '@/lib/pedroProfile'
import { motion } from 'framer-motion'

interface Message { id: string; role: 'user' | 'assistant'; content: string; time: string }

const QUICK_ACTIONS = [
  { label: 'Resumo Financeiro', prompt: 'Me dê um resumo das minhas finanças deste mês.' },
  { label: 'Analisar Treinos', prompt: 'Analise minha frequência de treinos recentes.' },
  { label: 'Criar Tarefa', prompt: 'Quero criar uma nova tarefa para hoje.' },
  { label: 'Novo Hábito', prompt: 'Me ajude a criar um novo hábito saudável.' },
  { label: 'Nova Meta', prompt: 'Quero definir uma nova meta pessoal.' },
  { label: 'Meus Scores', prompt: 'Me mostre meu score atual de performance.' },
]

function generateResponse(prompt: string, context: { balance: number; receita: number; despesa: number; scores: { [k: string]: number }; workouts: number; name: string }): string {
  const p = prompt.toLowerCase()
  if (p.includes('finanç') || p.includes('gasto') || p.includes('dinheiro')) {
    return `**Resumo Financeiro**\n\nSaldo atual: R$ ${context.balance.toFixed(2)}\nReceitas: R$ ${context.receita.toFixed(2)}\nDespesas: R$ ${context.despesa.toFixed(2)}\n\n${context.balance > 0 ? 'Suas finanças estão positivas! Continue assim.' : 'Atenção: saldo negativo. Revise seus gastos.'}\n\nDica: Tente manter suas despesas em até 70% da renda.`
  }
  if (p.includes('treino') || p.includes('exerc') || p.includes('muscula')) {
    return `**Análise de Treinos**\n\nVocê completou ${context.workouts} treinos recentemente.\n\n${context.workouts >= 3 ? 'Excelente frequência! Mantenha a consistência.' : 'Você pode treinar mais. Tente pelo menos 3x por semana.'}\n\nConsistência supera intensidade. Cada treino conta!`
  }
  if (p.includes('hábito') || p.includes('habito')) {
    return `**Novo Hábito**\n\nSugestões de hábitos poderosos:\n\n• Acordar às 5h30\n• Ler 20 páginas por dia\n• Beber 2L de água\n• Meditar 10 minutos\n• Sem redes sociais pela manhã\n\nQual ressoa mais com seus objetivos?`
  }
  if (p.includes('meta') || p.includes('objetivo')) {
    return `**Nova Meta — Método SMART**\n\n• **S**pecific (Específica)\n• **M**easurable (Mensurável)\n• **A**chievable (Alcançável)\n• **R**ealistic (Realista)\n• **T**ime-bound (Com prazo)\n\nExemplo: "Ganhar ${PEDRO.weightToGain}kg em 90 dias através de treino 4x/semana e superávit calórico"\n\nQual área você quer focar?`
  }
  if (p.includes('score') || p.includes('pilar') || p.includes('performance')) {
    const s = context.scores
    const best = Object.entries(s).sort((a, b) => b[1] - a[1])[0][0]
    const worst = Object.entries(s).sort((a, b) => a[1] - b[1])[0][0]
    return `**Seus Pilares de Performance**\n\nFísico: ${s.fisico}/100\nMental: ${s.mental}/100\nFinanceiro: ${s.financeiro}/100\nProdutividade: ${s.produtividade}/100\nDisciplina: ${s.disciplina}/100\nEspiritual: ${s.espiritual}/100\n\n**Pilar mais forte:** ${best}\n**Foco recomendado:** ${worst}`
  }
  if (p.includes('olá') || p.includes('oi') || p.includes('hello')) {
    return `Olá, ${context.name}!\n\nPosso ajudar com:\n• Análise financeira\n• Planejamento de treinos\n• Hábitos e metas\n• Módulo espiritual\n\nO que você precisa hoje?`
  }
  return `Entendido! Processando: "${prompt}"\n\nComo Life AI, posso:\n\n• Analisar seus dados de performance\n• Sugerir melhorias em hábitos\n• Planejar sua semana\n• Revisar suas metas\n\nSeja mais específico para uma resposta precisa!`
}

export default function AIPage() {
  const { profile, getBalance, getPillarScores, workoutSessions, transactions } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const balance = getBalance()
  const receita = transactions.filter(t => t.type === 'receita').reduce((a, t) => a + t.amount, 0)
  const despesa = Math.abs(transactions.filter(t => t.type === 'despesa').reduce((a, t) => a + t.amount, 0))
  const scores = getPillarScores()
  const recentWorkouts = workoutSessions.filter(s => {
    const d = new Date(s.date)
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  }).length

  const context = { balance, receita, despesa, scores: scores as unknown as { [k: string]: number }, workouts: recentWorkouts, name: profile.name }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function sendMessage(text?: string) {
    const content = (text || input).trim()
    if (!content) return
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(), role: 'user', content,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: generateResponse(content, context),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
      setLoading(false)
    }, 700 + Math.random() * 500)
  }

  return (
    <motion.div
      className="flex flex-col h-screen"
      style={{ background: 'var(--bg0)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #1a1a1a', background: 'rgba(4,10,22,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 16px #f9731640' }}>
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold">Life AI</p>
            <p className="text-xs text-gray-600">Assistente Pessoal de Performance</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
          style={{ background: '#f9731615', border: '1px solid #f9731630', color: '#f97316' }}>
          <Zap size={11} /> Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f9731625, #ea580c10)', border: '1px solid #f9731625', boxShadow: '0 0 30px #f9731615' }}>
              <Sparkles size={36} style={{ color: '#f97316', filter: 'drop-shadow(0 0 10px #f9731660)' }} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white mb-1">Olá, {profile.name}</h2>
              <p className="text-gray-500 text-sm">"{PEDRO.motivationalPhrase}"</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {QUICK_ACTIONS.map(action => (
                <button key={action.label} onClick={() => sendMessage(action.prompt)}
                  className="px-3.5 py-2 text-sm rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#f9731640'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#9ca3af' }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={cn('flex animate-fade-in', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
                  style={{ background: '#f9731620', border: '1px solid #f9731630' }}>
                  <Sparkles size={14} style={{ color: '#f97316' }} />
                </div>
              )}
              <div className={cn('max-w-[80%] rounded-2xl px-4 py-3')}
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', borderBottomRightRadius: '6px', boxShadow: '0 2px 12px #f9731630' }
                  : { background: 'linear-gradient(145deg, #141414, #111)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb', borderBottomLeftRadius: '6px' }
                }>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className="text-xs mt-1.5" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : '#4b5563', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2 animate-fade-in">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#f9731620', border: '1px solid #f9731630' }}>
                <Sparkles size={14} style={{ color: '#f97316' }} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: '#f97316', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid #1a1a1a' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3 rounded-2xl px-4 py-2.5"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 0 0 transparent', transition: 'box-shadow 0.2s' }}
          onFocus={() => {}} >
          <input
            className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none py-1"
            placeholder="Pergunte qualquer coisa..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            onFocus={e => (e.currentTarget.parentElement!.style.boxShadow = '0 0 0 2px #f9731630')}
            onBlur={e => (e.currentTarget.parentElement!.style.boxShadow = '0 0 0 0 transparent')}
          />
          <button className="text-gray-600 hover:text-gray-400 transition-colors">
            <Mic size={17} />
          </button>
          <button onClick={() => sendMessage()} disabled={!input.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            style={input.trim()
              ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 12px #f9731440' }
              : { background: '#1e1e1e', cursor: 'not-allowed' }
            }>
            <Send size={14} style={{ color: input.trim() ? '#fff' : '#4b5563' }} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
