// Defaults zeroed — usuário preenche seus próprios dados
export const PEDRO = {
  name: 'Usuário',
  bio: '',
  age: 0,
  currentWeight: 0,
  targetWeight: 0,
  height: 0,
  goal: 'hipertrofia' as const,
  level: 1,
  xp: 0,
  trainingDaysPerWeek: 0,
  trainingLevel: 'intermediario' as const,
  preferredSplit: 'push_pull_legs' as const,
  monthlyIncome: 0,
  monthlyBudget: 0,
  motivationalPhrase: '',
  spiritualPlan: 'biblia-1-ano',
  pillarsTarget: {
    fisico: 100,
    mental: 100,
    financeiro: 100,
    produtividade: 100,
    disciplina: 100,
    espiritual: 100,
  },
  badges: [] as string[],
  joinDate: new Date().toISOString().split('T')[0],
  bmi: 0,
  weightToGain: 0,
  joinDaysAgo: 0,
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
