# AuraLab — Sistema de Alta Performance Pessoal

## 🚀 Como rodar

```bash
# 1. Entrar na pasta
cd "app habit tracker/auralab"

# 2. Instalar dependências
npm install

# 3. Rodar em desenvolvimento
npm run dev
```

Abra http://localhost:3000 no browser.

## 📁 Estrutura

```
auralab/
├── app/
│   ├── page.tsx              # Dashboard principal
│   ├── fisico/page.tsx       # Pilar Físico + Treinos
│   ├── habitos/page.tsx      # Hábitos e grade semanal
│   ├── missoes/page.tsx      # Missões do dia
│   ├── financeiro/page.tsx   # Controle financeiro
│   ├── calendario/page.tsx   # Calendário de eventos
│   ├── espiritual/page.tsx   # Leitura bíblica
│   ├── ai/page.tsx           # Aura AI
│   └── configuracoes/page.tsx
├── components/
│   ├── Sidebar.tsx
│   └── ui/ (Card, Modal, Toggle)
├── store/
│   ├── useStore.ts           # Zustand + localStorage
│   └── types.ts
└── lib/
    ├── utils.ts
    └── bibleData.ts
```

## ✨ Funcionalidades

- **6 Pilares**: Físico, Mental, Financeiro, Produtividade, Disciplina, Espiritual
- **Radar de Performance** com score geral
- **Pilar Físico**: Rotinas de treino completas, mapa muscular, histórico de peso
- **Financeiro**: Controle de receitas/despesas, gráficos, orçamento
- **Hábitos**: Grade semanal visual, streaks, progresso por pilar
- **Missões**: Gamificação com XP por tarefa concluída
- **Calendário**: Eventos e treinos integrados
- **Espiritual**: Planos de leitura bíblica com streak e reflexões
- **Aura AI**: Assistente contextual com dados reais
- **Persistência 100% local** via localStorage
