// Hardcoded from pedro_profile.json — no runtime API calls
export const PEDRO = {
  name: 'Pedro',
  bio: 'Hunt or be hunted.',
  age: 22,
  currentWeight: 63,
  targetWeight: 75,
  height: 175,
  goal: 'hipertrofia' as const,
  level: 3,
  xp: 512,
  trainingDaysPerWeek: 4,
  trainingLevel: 'intermediario' as const,
  preferredSplit: 'push_pull_legs' as const,
  monthlyIncome: 600,
  monthlyBudget: 500,
  motivationalPhrase: 'Hunt or be hunted.',
  spiritualPlan: 'nt1year',
  pillarsTarget: {
    fisico: 80,
    mental: 85,
    financeiro: 75,
    produtividade: 90,
    disciplina: 95,
    espiritual: 70,
  },
  badges: ['first_workout', 'streak_7', 'level_3'],
  joinDate: '2026-01-01',
  bmi: parseFloat((63 / (1.75 * 1.75)).toFixed(1)), // 20.6
  weightToGain: 75 - 63, // 12kg
  joinDaysAgo: Math.floor((Date.now() - new Date('2026-01-01').getTime()) / 86400000),
}

export const MOTIVATIONAL_LINES = [
  'Caça ou é caçado.',
  'A disciplina é a ponte entre os objetivos e as conquistas.',
  'A dor que você sente hoje será a força que você sentirá amanhã.',
  'Sem desculpas. Sem atalhos. Apenas resultados.',
  'Cada repetição conta. Cada dia conta.',
  'Seja obcecado ou seja medíocre.',
  'Seu corpo alcança o que sua mente acredita.',
   ' Seja incomum entre os incomuns ' ,
' A única maneira de crescer é abraçar a dor ' ,
' Não pare quando estiver cansado. Pare quando terminar ' ,
' Tudo posso naquele que me fortalece ' ,
' O homem fiel será coberto de bênçãos ' ,
' Quem é fiel no pouco, também é fiel no muito ' ,
' Sede fortes e corajosos, não temais ' ,
' Combati o bom combate, completei a carreira, guardei a fé ' ,
' As dificuldades frequentemente preparam pessoas comuns para um destino extraordinário ' ,
' A disciplina é o caminho para a liberdade ' ,
]

export function getTodayMotivation(): string {
  return MOTIVATIONAL_LINES[new Date().getDay() % MOTIVATIONAL_LINES.length]
}
