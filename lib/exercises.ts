export type MuscleGroup =
  | 'peito' | 'costas' | 'pernas' | 'ombros'
  | 'biceps' | 'triceps' | 'abdomen' | 'gluteos'

export type Equipment =
  | 'Barra' | 'Halteres' | 'Máquina' | 'Polia'
  | 'Peso corporal' | 'Smith' | 'Cabo' | 'Kettlebell'

export interface ExerciseTemplate {
  id: string
  name: string
  muscle: MuscleGroup
  equipment: Equipment
  difficulty: 'iniciante' | 'intermediário' | 'avançado'
  defaultSets: number
  defaultReps: number
  defaultWeight: number
  /** Execução em 1-2 frases, em português simples. */
  description?: string
  /** URL pública de vídeo/gif demonstrativo (YouTube ou similar). */
  videoUrl?: string
}

export const EXERCISE_DB: ExerciseTemplate[] = [
  // ─── PEITO ────────────────────────────────────────────────────────────────
  { id: 'pe01', name: 'Supino Reto com Barra', muscle: 'peito', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 4, defaultReps: 10, defaultWeight: 60 },
  { id: 'pe02', name: 'Supino Reto com Halteres', muscle: 'peito', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 4, defaultReps: 10, defaultWeight: 24 },
  { id: 'pe03', name: 'Supino Inclinado com Barra', muscle: 'peito', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 50 },
  { id: 'pe04', name: 'Supino Inclinado com Halteres', muscle: 'peito', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'pe05', name: 'Supino Declinado com Barra', muscle: 'peito', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 60 },
  { id: 'pe06', name: 'Supino no Smith', muscle: 'peito', equipment: 'Smith', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 40 },
  { id: 'pe07', name: 'Crucifixo com Halteres', muscle: 'peito', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 14 },
  { id: 'pe08', name: 'Crucifixo na Máquina (Peck Deck)', muscle: 'peito', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 40 },
  { id: 'pe09', name: 'Crossover na Polia Alta', muscle: 'peito', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'pe10', name: 'Crossover na Polia Baixa', muscle: 'peito', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'pe11', name: 'Mergulho nas Paralelas', muscle: 'peito', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
  { id: 'pe12', name: 'Flexão de Braço', muscle: 'peito', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { id: 'pe13', name: 'Pullover com Haltere', muscle: 'peito', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'pe14', name: 'Press na Máquina', muscle: 'peito', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 50 },
  { id: 'pe15', name: 'Supino com Pegada Fechada', muscle: 'peito', equipment: 'Barra', difficulty: 'avançado', defaultSets: 3, defaultReps: 10, defaultWeight: 50 },
  { id: 'pe16', name: 'Supino Máquina', muscle: 'peito', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 50 },
  { id: 'pe17', name: 'Supino Inclinado Máquina', muscle: 'peito', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 45 },
  { id: 'pe18', name: 'Voador na Máquina', muscle: 'peito', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 35 },
  { id: 'pe19', name: 'Crucifixo Inclinado com Halteres', muscle: 'peito', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 12 },
  { id: 'pe20', name: 'Crossover Médio na Polia', muscle: 'peito', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 18 },
  { id: 'pe21', name: 'Supino Inclinado 30°', muscle: 'peito', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 4, defaultReps: 10, defaultWeight: 22, description: 'Banco inclinado a 30 graus. Desça os halteres alinhados ao peito superior e empurre para cima sem travar os cotovelos.', videoUrl: 'https://www.youtube.com/results?search_query=supino+inclinado+30+graus+halteres' },
  { id: 'pe22', name: 'Supino Inclinado Smith', muscle: 'peito', equipment: 'Smith', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 35, description: 'No Smith, banco inclinado, desça a barra até a parte alta do peito controlando o movimento.', videoUrl: 'https://www.youtube.com/results?search_query=supino+inclinado+smith' },
  { id: 'pe23', name: 'Flexão Inclinada (Pés Elevados)', muscle: 'peito', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 0, description: 'Pés sobre banco, mãos no chão. Aumenta a carga no peito superior.', videoUrl: 'https://www.youtube.com/results?search_query=flexao+pes+elevados' },
  { id: 'pe24', name: 'Flexão Diamante', muscle: 'peito', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 3, defaultReps: 10, defaultWeight: 0, description: 'Polegares e indicadores formando um losango. Aproxima a pegada e ativa peito interno + tríceps.', videoUrl: 'https://www.youtube.com/results?search_query=flexao+diamante' },
  { id: 'pe25', name: 'Crucifixo na Polia Baixa', muscle: 'peito', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 12, description: 'Polia baixa, traga os punhos para frente e para cima em arco, como abraçando algo grande.', videoUrl: 'https://www.youtube.com/results?search_query=crucifixo+polia+baixa' },
  { id: 'pe26', name: 'Pec Deck Unilateral', muscle: 'peito', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 25, description: 'Um braço de cada vez na máquina voadora. Foco no controle e contração máxima.', videoUrl: 'https://www.youtube.com/results?search_query=pec+deck+unilateral' },
  { id: 'pe27', name: 'Svend Press', muscle: 'peito', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 10, description: 'Segure 1 haltere com as 2 mãos contra o peito e empurre para frente, mantendo pressão entre as palmas.', videoUrl: 'https://www.youtube.com/results?search_query=svend+press' },
  { id: 'pe28', name: 'Supino Reto Pegada Aberta', muscle: 'peito', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 8, defaultWeight: 55, description: 'Pegada mais aberta que a normal. Maior alongamento das fibras externas do peito.', videoUrl: 'https://www.youtube.com/results?search_query=supino+reto+pegada+aberta' },
  { id: 'pe29', name: 'Landmine Press', muscle: 'peito', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 15, description: 'Uma ponta da barra fixa no chão, segure a outra com as duas mãos e empurre na diagonal para cima.', videoUrl: 'https://www.youtube.com/results?search_query=landmine+press' },
  { id: 'pe30', name: 'Cable Fly Cruzado', muscle: 'peito', equipment: 'Cabo', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 15, description: 'Polia alta, cruze um punho sobre o outro à frente do corpo, alternando o de cima a cada série.', videoUrl: 'https://www.youtube.com/results?search_query=cable+fly+cruzado' },

  // ─── COSTAS ───────────────────────────────────────────────────────────────
  { id: 'co01', name: 'Puxada Frontal na Polia', muscle: 'costas', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 4, defaultReps: 12, defaultWeight: 50 },
  { id: 'co02', name: 'Puxada com Triângulo', muscle: 'costas', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 50 },
  { id: 'co03', name: 'Barra Fixa Pronada', muscle: 'costas', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
  { id: 'co04', name: 'Barra Fixa Supinada', muscle: 'costas', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
  { id: 'co05', name: 'Remada Curvada com Barra', muscle: 'costas', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 10, defaultWeight: 60 },
  { id: 'co06', name: 'Remada Unilateral com Haltere', muscle: 'costas', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 24 },
  { id: 'co07', name: 'Remada na Máquina', muscle: 'costas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 50 },
  { id: 'co08', name: 'Remada Cavalinho', muscle: 'costas', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 8, defaultWeight: 80 },
  { id: 'co09', name: 'Levantamento Terra', muscle: 'costas', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 5, defaultWeight: 80 },
  { id: 'co10', name: 'Serrote com Haltere', muscle: 'costas', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'co11', name: 'Pullover na Polia', muscle: 'costas', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 30 },
  { id: 'co12', name: 'Remada no Cabo em Pé', muscle: 'costas', equipment: 'Cabo', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 40 },
  { id: 'co13', name: 'Puxada Alta Aberta', muscle: 'costas', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 45 },
  { id: 'co14', name: 'Good Morning', muscle: 'costas', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 30 },
  { id: 'co15', name: 'Hiperextensão Lombar', muscle: 'costas', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { id: 'co16', name: 'Pulldown na Máquina', muscle: 'costas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 45 },
  { id: 'co17', name: 'Remada Baixa Sentada', muscle: 'costas', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 45 },
  { id: 'co18', name: 'Puxada Neutra (Pegada Paralela)', muscle: 'costas', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 50 },
  { id: 'co19', name: 'Remada T-Bar', muscle: 'costas', equipment: 'Máquina', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 60 },
  { id: 'co20', name: 'Puxada Pegada Fechada', muscle: 'costas', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 50, description: 'Puxada na polia com pegada supinada e fechada. Foco no latíssimo inferior e bíceps.', videoUrl: 'https://www.youtube.com/results?search_query=puxada+pegada+fechada+supinada' },
  { id: 'co21', name: 'Remada Curvada Pronada', muscle: 'costas', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 4, defaultReps: 10, defaultWeight: 50, description: 'Tronco inclinado a 45°, pegada pronada (palmas para baixo), puxe a barra até o abdômen baixo.', videoUrl: 'https://www.youtube.com/results?search_query=remada+curvada+pronada' },
  { id: 'co22', name: 'Remada Curvada Supinada', muscle: 'costas', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 50, description: 'Igual à remada curvada, mas pegada supinada (palmas para cima). Mais ativação de bíceps e dorsal.', videoUrl: 'https://www.youtube.com/results?search_query=remada+curvada+supinada' },
  { id: 'co23', name: 'Pull Apart com Elástico', muscle: 'costas', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 20, defaultWeight: 0, description: 'Segure um elástico com os 2 braços estendidos à frente e abra puxando para os lados. Ótimo para postura.', videoUrl: 'https://www.youtube.com/results?search_query=pull+apart+banda+elastica' },
  { id: 'co24', name: 'Remada Inversa (Australian)', muscle: 'costas', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 0, description: 'Barra na altura do quadril, corpo reto suspenso por baixo, puxe o peito até a barra.', videoUrl: 'https://www.youtube.com/results?search_query=remada+australiana+inversa' },
  { id: 'co25', name: 'Encolhimento Inclinado', muscle: 'costas', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 18, description: 'Deite de bruços num banco inclinado e faça encolhimento. Ativa trapézio médio sem pegar pescoço.', videoUrl: 'https://www.youtube.com/results?search_query=encolhimento+inclinado+halteres' },
  { id: 'co26', name: 'Remada Meadows', muscle: 'costas', equipment: 'Barra', difficulty: 'avançado', defaultSets: 3, defaultReps: 10, defaultWeight: 25, description: 'Uma ponta da barra fixa, ao lado dela com um braço só puxe a outra ponta como uma serra explosiva.', videoUrl: 'https://www.youtube.com/results?search_query=meadows+row' },
  { id: 'co27', name: 'Levantamento Terra Romeno', muscle: 'costas', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 4, defaultReps: 10, defaultWeight: 50, description: 'Pernas semi-flexionadas, desça a barra rente às pernas mantendo lombar reta. Sente o alongamento posterior.', videoUrl: 'https://www.youtube.com/results?search_query=levantamento+terra+romeno' },
  { id: 'co28', name: 'Face Pull com Corda', muscle: 'costas', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 25, description: 'Polia alta, corda. Puxe a corda em direção ao rosto, abrindo as mãos. Foco em postura e trapézio.', videoUrl: 'https://www.youtube.com/results?search_query=face+pull+corda' },
  { id: 'co29', name: 'Superman', muscle: 'costas', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 0, description: 'Deitado de bruços, eleve braços e pernas ao mesmo tempo. Trabalha lombar e estabilidade.', videoUrl: 'https://www.youtube.com/results?search_query=exercicio+superman+lombar' },

  // ─── PERNAS ───────────────────────────────────────────────────────────────
  { id: 'le01', name: 'Agachamento Livre com Barra', muscle: 'pernas', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 8, defaultWeight: 60 },
  { id: 'le02', name: 'Agachamento no Smith', muscle: 'pernas', equipment: 'Smith', difficulty: 'iniciante', defaultSets: 4, defaultReps: 10, defaultWeight: 50 },
  { id: 'le03', name: 'Agachamento Goblet', muscle: 'pernas', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'le04', name: 'Agachamento Sumô', muscle: 'pernas', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 24 },
  { id: 'le05', name: 'Leg Press 45°', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 4, defaultReps: 12, defaultWeight: 120 },
  { id: 'le06', name: 'Cadeira Extensora', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 54 },
  { id: 'le07', name: 'Cadeira Flexora', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 42 },
  { id: 'le08', name: 'Stiff com Barra', muscle: 'pernas', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 50 },
  { id: 'le09', name: 'Stiff com Halteres', muscle: 'pernas', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'le10', name: 'Avanço com Halteres', muscle: 'pernas', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 16 },
  { id: 'le11', name: 'Agachamento Búlgaro', muscle: 'pernas', equipment: 'Halteres', difficulty: 'avançado', defaultSets: 3, defaultReps: 10, defaultWeight: 16 },
  { id: 'le12', name: 'Adutora na Máquina', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 54 },
  { id: 'le13', name: 'Abdutora na Máquina', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 54 },
  { id: 'le14', name: 'Panturrilha em Pé na Máquina', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 4, defaultReps: 20, defaultWeight: 60 },
  { id: 'le15', name: 'Panturrilha Sentado', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 4, defaultReps: 20, defaultWeight: 40 },
  { id: 'le16', name: 'Hack Squat', muscle: 'pernas', equipment: 'Máquina', difficulty: 'intermediário', defaultSets: 4, defaultReps: 10, defaultWeight: 80 },
  { id: 'le17', name: 'Agachamento com Haltere (Sumo)', muscle: 'pernas', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'le18', name: 'Pistol Squat', muscle: 'pernas', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 3, defaultReps: 6, defaultWeight: 0, description: 'Agachamento com uma perna só, a outra estendida à frente. Trabalha força unilateral e equilíbrio.', videoUrl: 'https://www.youtube.com/results?search_query=pistol+squat' },
  { id: 'le19', name: 'Step-Up no Banco', muscle: 'pernas', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 14, description: 'Suba e desça de um banco alternando a perna. Halteres ao lado do corpo.', videoUrl: 'https://www.youtube.com/results?search_query=step+up+banco+halteres' },
  { id: 'le20', name: 'Afundo Reverso', muscle: 'pernas', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 14, description: 'Passo para trás flexionando os 2 joelhos. Mais amigável para os joelhos que o avanço.', videoUrl: 'https://www.youtube.com/results?search_query=afundo+reverso' },
  { id: 'le21', name: 'Afundo Caminhando', muscle: 'pernas', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 20, defaultWeight: 14, description: 'Avance em passadas longas pela sala, alternando pernas. Conta os passos totais.', videoUrl: 'https://www.youtube.com/results?search_query=afundo+caminhando' },
  { id: 'le22', name: 'Cossack Squat', muscle: 'pernas', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 0, description: 'Agachamento lateral profundo, uma perna estendida ao lado. Mobilidade de quadril e adutores.', videoUrl: 'https://www.youtube.com/results?search_query=cossack+squat' },
  { id: 'le23', name: 'Box Jump', muscle: 'pernas', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 0, description: 'Salto explosivo sobre uma caixa ou banco resistente. Foco em potência.', videoUrl: 'https://www.youtube.com/results?search_query=box+jump' },
  { id: 'le24', name: 'Mesa Flexora', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 36, description: 'Deitado de bruços, flexione os joelhos puxando o calcanhar para a glúteo. Isolamento de posterior.', videoUrl: 'https://www.youtube.com/results?search_query=mesa+flexora+pernas' },
  { id: 'le25', name: 'Cadeira Flexora Unilateral', muscle: 'pernas', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 25, description: 'Cadeira flexora trabalhando uma perna de cada vez. Corrige desequilíbrios musculares.', videoUrl: 'https://www.youtube.com/results?search_query=cadeira+flexora+unilateral' },
  { id: 'le26', name: 'Panturrilha em Pé Unilateral', muscle: 'pernas', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 20, defaultWeight: 16, description: 'Apoie um pé num degrau, segure haltere do mesmo lado e suba/desça na ponta do pé.', videoUrl: 'https://www.youtube.com/results?search_query=panturrilha+unilateral+haltere' },
  { id: 'le27', name: 'Agachamento Frontal', muscle: 'pernas', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 8, defaultWeight: 40, description: 'Barra apoiada na clavícula, cotovelos altos. Postura mais vertical, foco em quadríceps.', videoUrl: 'https://www.youtube.com/results?search_query=agachamento+frontal+front+squat' },

  // ─── OMBROS ───────────────────────────────────────────────────────────────
  { id: 'om01', name: 'Desenvolvimento com Halteres', muscle: 'ombros', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 4, defaultReps: 12, defaultWeight: 16 },
  { id: 'om02', name: 'Desenvolvimento com Barra', muscle: 'ombros', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 10, defaultWeight: 40 },
  { id: 'om03', name: 'Arnold Press', muscle: 'ombros', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 14 },
  { id: 'om04', name: 'Desenvolvimento na Máquina', muscle: 'ombros', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 40 },
  { id: 'om05', name: 'Elevação Lateral com Halteres', muscle: 'ombros', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 4, defaultReps: 15, defaultWeight: 8 },
  { id: 'om06', name: 'Elevação Lateral na Polia', muscle: 'ombros', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 10 },
  { id: 'om07', name: 'Elevação Lateral na Máquina', muscle: 'ombros', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'om08', name: 'Elevação Frontal com Halteres', muscle: 'ombros', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 8 },
  { id: 'om09', name: 'Elevação Frontal com Barra', muscle: 'ombros', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'om10', name: 'Face Pull na Polia', muscle: 'ombros', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 25 },
  { id: 'om11', name: 'Remada Alta com Barra', muscle: 'ombros', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 30 },
  { id: 'om12', name: 'Remada Alta com Halteres', muscle: 'ombros', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 12 },
  { id: 'om13', name: 'Encolhimento com Barra', muscle: 'ombros', equipment: 'Barra', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 60 },
  { id: 'om14', name: 'Encolhimento com Halteres', muscle: 'ombros', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 24 },
  { id: 'om15', name: 'Press Militar em Pé', muscle: 'ombros', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 8, defaultWeight: 40 },
  { id: 'om16', name: 'Crucifixo Invertido na Máquina', muscle: 'ombros', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 25 },
  { id: 'om17', name: 'Crucifixo Invertido com Halteres', muscle: 'ombros', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 8 },
  { id: 'om18', name: 'Elevação Lateral Inclinada', muscle: 'ombros', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 6 },
  { id: 'om19', name: 'Pike Push-Up', muscle: 'ombros', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 0, description: 'Posição de cachorro olhando para baixo (quadril alto). Flexione e estenda os cotovelos. Ombros suportam todo o peso.', videoUrl: 'https://www.youtube.com/results?search_query=pike+push+up' },
  { id: 'om20', name: 'Elevação Y na Polia', muscle: 'ombros', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 6, description: 'Polia baixa, eleve os braços em diagonal formando um Y. Trabalha trapézio inferior e ombro posterior.', videoUrl: 'https://www.youtube.com/results?search_query=Y+raise+ombros' },
  { id: 'om21', name: 'Cuban Press', muscle: 'ombros', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 5, description: 'Cotovelos a 90°, rotacione os antebraços para cima e depois empurre acima da cabeça. Ótimo para manguito rotador.', videoUrl: 'https://www.youtube.com/results?search_query=cuban+press' },
  { id: 'om22', name: 'Reverse Pec Deck', muscle: 'ombros', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 25, description: 'Voador na máquina, mas sentado de frente para o encosto, abrindo os braços. Foco em ombro posterior.', videoUrl: 'https://www.youtube.com/results?search_query=reverse+pec+deck' },
  { id: 'om23', name: 'Elevação Lateral Unilateral Cabo', muscle: 'ombros', equipment: 'Cabo', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 8, description: 'Polia baixa, um braço só, elevação lateral. Cabo passa por trás do corpo para arco ideal.', videoUrl: 'https://www.youtube.com/results?search_query=elevacao+lateral+cabo+unilateral' },
  { id: 'om24', name: 'Front Raise com Disco', muscle: 'ombros', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 10, description: 'Segure um disco com as 2 mãos pelas laterais e eleve à frente até a altura dos olhos.', videoUrl: 'https://www.youtube.com/results?search_query=elevacao+frontal+com+anilha' },
  { id: 'om25', name: 'Push Press', muscle: 'ombros', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 6, defaultWeight: 35, description: 'Desenvolvimento com pequeno impulso de pernas. Permite usar mais carga.', videoUrl: 'https://www.youtube.com/results?search_query=push+press' },
  { id: 'om26', name: 'Handstand Push-Up Apoiado', muscle: 'ombros', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 3, defaultReps: 6, defaultWeight: 0, description: 'Parada de mão com pés apoiados na parede. Flexione e estenda os cotovelos.', videoUrl: 'https://www.youtube.com/results?search_query=handstand+push+up' },
  { id: 'om27', name: 'Kettlebell Halo', muscle: 'ombros', equipment: 'Kettlebell', difficulty: 'iniciante', defaultSets: 3, defaultReps: 10, defaultWeight: 8, description: 'Segure um kettlebell e gire-o ao redor da cabeça em círculos lentos, mantendo postura.', videoUrl: 'https://www.youtube.com/results?search_query=kettlebell+halo' },
  { id: 'om28', name: 'Bradford Press', muscle: 'ombros', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 25, description: 'Desenvolvimento alternando barra à frente e atrás da cabeça em movimento contínuo de meio-arco.', videoUrl: 'https://www.youtube.com/results?search_query=bradford+press' },

  // ─── BÍCEPS ───────────────────────────────────────────────────────────────
  { id: 'bi01', name: 'Rosca Direta com Barra', muscle: 'biceps', equipment: 'Barra', difficulty: 'iniciante', defaultSets: 4, defaultReps: 12, defaultWeight: 30 },
  { id: 'bi02', name: 'Rosca Direta com Halteres', muscle: 'biceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 14 },
  { id: 'bi03', name: 'Rosca Alternada com Halteres', muscle: 'biceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 14 },
  { id: 'bi04', name: 'Rosca Martelo', muscle: 'biceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 16 },
  { id: 'bi05', name: 'Rosca Scott com Barra', muscle: 'biceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'bi06', name: 'Rosca Concentrada', muscle: 'biceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 12 },
  { id: 'bi07', name: 'Rosca na Polia', muscle: 'biceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'bi08', name: 'Rosca na Máquina', muscle: 'biceps', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 30 },
  { id: 'bi09', name: 'Rosca 21 com Barra', muscle: 'biceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 21, defaultWeight: 20 },
  { id: 'bi10', name: 'Rosca Inversa com Barra', muscle: 'biceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'bi11', name: 'Rosca com Cabo', muscle: 'biceps', equipment: 'Cabo', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 15 },
  { id: 'bi12', name: 'Rosca Zottman', muscle: 'biceps', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 12 },
  { id: 'bi13', name: 'Barra Fixa Supinada', muscle: 'biceps', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
  { id: 'bi14', name: 'Spider Curl', muscle: 'biceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'bi15', name: 'Rosca no Scott com Haltere', muscle: 'biceps', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 10 },
  { id: 'bi16', name: 'Rosca Bayesian (Polia)', muscle: 'biceps', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 15 },
  { id: 'bi17', name: 'Rosca Inclinada com Halteres', muscle: 'biceps', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 12 },
  { id: 'bi18', name: 'Rosca Martelo na Polia', muscle: 'biceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 18 },
  { id: 'bi19', name: 'Rosca Martelo Cruzada', muscle: 'biceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 14, description: 'Pegada neutra (martelo) e leve o haltere para o ombro do lado oposto. Trabalha braquial.', videoUrl: 'https://www.youtube.com/results?search_query=rosca+martelo+cruzada' },
  { id: 'bi20', name: 'Rosca Direta com Corda', muscle: 'biceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 18, description: 'Polia baixa com corda. Rosca com supinação no topo (giro dos punhos para fora).', videoUrl: 'https://www.youtube.com/results?search_query=rosca+direta+corda' },
  { id: 'bi21', name: 'Rosca em Pé Cabo Unilateral', muscle: 'biceps', equipment: 'Cabo', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 12, description: 'Cabo baixo, um braço de cada vez. Cotovelo fixo ao lado do corpo, flexione com controle.', videoUrl: 'https://www.youtube.com/results?search_query=rosca+cabo+unilateral' },
  { id: 'bi22', name: 'Rosca Direta Pegada Larga', muscle: 'biceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 25, description: 'Pegada larga na barra. Ativa mais a cabeça curta do bíceps (parte interna).', videoUrl: 'https://www.youtube.com/results?search_query=rosca+direta+pegada+larga' },
  { id: 'bi23', name: 'Rosca Direta Pegada Fechada', muscle: 'biceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 25, description: 'Pegada fechada na barra. Ativa mais a cabeça longa (parte externa, pico do bíceps).', videoUrl: 'https://www.youtube.com/results?search_query=rosca+direta+pegada+fechada' },
  { id: 'bi24', name: 'Rosca Drag (Drag Curl)', muscle: 'biceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 20, description: 'Mantenha a barra rente ao corpo, arrastando-a para cima. Cotovelos vão para trás.', videoUrl: 'https://www.youtube.com/results?search_query=drag+curl+rosca+drag' },
  { id: 'bi25', name: 'Rosca Concentrada Cabo', muscle: 'biceps', equipment: 'Cabo', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 10, description: 'Sentado com cotovelo apoiado no joelho, cabo baixo. Foco em contração isolada.', videoUrl: 'https://www.youtube.com/results?search_query=rosca+concentrada+cabo' },
  { id: 'bi26', name: 'Rosca Preacher na Máquina', muscle: 'biceps', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 25, description: 'Máquina específica de rosca scott. Braços apoiados, flexione com controle total.', videoUrl: 'https://www.youtube.com/results?search_query=rosca+scott+maquina' },
  { id: 'bi27', name: 'Chin-Up Negativa', muscle: 'biceps', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 5, defaultWeight: 0, description: 'Suba na barra com pulo ou apoio e desça lentamente (3-5 segundos). Excelente para força.', videoUrl: 'https://www.youtube.com/results?search_query=chin+up+negativa' },
  { id: 'bi28', name: 'Rosca Waiter (Cup Curl)', muscle: 'biceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 10, description: 'Segure 1 haltere na vertical com as 2 mãos, como uma xícara, e faça rosca. Ativa braquial.', videoUrl: 'https://www.youtube.com/results?search_query=cup+curl+waiter+curl' },

  // ─── TRÍCEPS ──────────────────────────────────────────────────────────────
  { id: 'tr01', name: 'Tríceps Corda na Polia', muscle: 'triceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 4, defaultReps: 15, defaultWeight: 25 },
  { id: 'tr02', name: 'Tríceps Barra Reta na Polia', muscle: 'triceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 4, defaultReps: 12, defaultWeight: 30 },
  { id: 'tr03', name: 'Tríceps Testa com Barra', muscle: 'triceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { id: 'tr04', name: 'Tríceps Testa com Halteres', muscle: 'triceps', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 8 },
  { id: 'tr05', name: 'Tríceps Francês com Barra', muscle: 'triceps', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
  { id: 'tr06', name: 'Tríceps Francês com Haltere', muscle: 'triceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 14 },
  { id: 'tr07', name: 'Tríceps Banco (Dips)', muscle: 'triceps', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { id: 'tr08', name: 'Extensão Overhead na Polia', muscle: 'triceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'tr09', name: 'Coice com Haltere', muscle: 'triceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 10 },
  { id: 'tr10', name: 'Mergulho nas Paralelas (Tríceps)', muscle: 'triceps', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
  { id: 'tr11', name: 'Tríceps na Máquina', muscle: 'triceps', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 30 },
  { id: 'tr12', name: 'Close Grip Bench Press', muscle: 'triceps', equipment: 'Barra', difficulty: 'avançado', defaultSets: 4, defaultReps: 10, defaultWeight: 50 },
  { id: 'tr13', name: 'Tríceps Corda Overhead', muscle: 'triceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'tr14', name: 'Pushdown em Pé', muscle: 'triceps', equipment: 'Cabo', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'tr15', name: 'Tríceps Barra V', muscle: 'triceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 25 },
  { id: 'tr16', name: 'Tríceps Coice na Polia', muscle: 'triceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 12 },
  { id: 'tr17', name: 'Tríceps Unilateral na Polia', muscle: 'triceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 12 },
  { id: 'tr18', name: 'Tríceps Banco com Peso', muscle: 'triceps', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 10 },
  { id: 'tr19', name: 'JM Press', muscle: 'triceps', equipment: 'Barra', difficulty: 'avançado', defaultSets: 3, defaultReps: 8, defaultWeight: 40, description: 'Híbrido de supino fechado e testa. Desça a barra para o queixo com cotovelos a 45°.', videoUrl: 'https://www.youtube.com/results?search_query=jm+press' },
  { id: 'tr20', name: 'Tríceps Testa Inclinado', muscle: 'triceps', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 10, description: 'Banco inclinado. Tríceps testa com halteres desce atrás da cabeça. Alonga a cabeça longa.', videoUrl: 'https://www.youtube.com/results?search_query=triceps+testa+inclinado' },
  { id: 'tr21', name: 'Tríceps Kickback Inclinado', muscle: 'triceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 8, description: 'Banco inclinado de bruços. Cotovelos fixos elevados, estenda o antebraço para trás.', videoUrl: 'https://www.youtube.com/results?search_query=kickback+inclinado+halteres' },
  { id: 'tr22', name: 'Tríceps Polia Unilateral Supinado', muscle: 'triceps', equipment: 'Polia', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 10, description: 'Pegada supinada (palma para cima) na polia, um braço. Foco na cabeça medial do tríceps.', videoUrl: 'https://www.youtube.com/results?search_query=triceps+polia+supinado+unilateral' },
  { id: 'tr23', name: 'Tríceps Crucifixo na Polia', muscle: 'triceps', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 15, description: 'Em pé entre 2 polias altas, braços abertos, traga as mãos à frente como crucifixo de peito mas só com o tríceps.', videoUrl: 'https://www.youtube.com/results?search_query=triceps+crucifixo+polia' },
  { id: 'tr24', name: 'Tate Press', muscle: 'triceps', equipment: 'Halteres', difficulty: 'intermediário', defaultSets: 3, defaultReps: 10, defaultWeight: 12, description: 'Deitado, traga os halteres em direção ao peito flexionando os cotovelos para fora.', videoUrl: 'https://www.youtube.com/results?search_query=tate+press' },
  { id: 'tr25', name: 'Skullcrusher com Corda', muscle: 'triceps', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 15, description: 'Deitado num banco, polia baixa atrás da cabeça, corda. Estenda os braços acima do peito.', videoUrl: 'https://www.youtube.com/results?search_query=skullcrusher+corda+polia' },
  { id: 'tr26', name: 'Tríceps no Banco Pés Elevados', muscle: 'triceps', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 0, description: 'Mãos no banco atrás de você, pés sobre outro banco. Desça flexionando os cotovelos.', videoUrl: 'https://www.youtube.com/results?search_query=triceps+banco+pes+elevados' },
  { id: 'tr27', name: 'Diamond Push-Up', muscle: 'triceps', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 12, defaultWeight: 0, description: 'Flexão com mãos juntas formando um diamante embaixo do peito. Ativa muito o tríceps.', videoUrl: 'https://www.youtube.com/results?search_query=diamond+push+up' },
  { id: 'tr28', name: 'Tríceps Overhead com Haltere', muscle: 'triceps', equipment: 'Halteres', difficulty: 'iniciante', defaultSets: 3, defaultReps: 12, defaultWeight: 14, description: 'Em pé, 1 haltere segurado pelos 2 punhos acima da cabeça. Desça atrás da nuca e estenda.', videoUrl: 'https://www.youtube.com/results?search_query=triceps+frances+halter+overhead' },

  // ─── ABDÔMEN ──────────────────────────────────────────────────────────────
  { id: 'ab01', name: 'Abdominal Crunch', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
  { id: 'ab02', name: 'Abdominal na Máquina', muscle: 'abdomen', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 40 },
  { id: 'ab03', name: 'Abdominal na Polia', muscle: 'abdomen', equipment: 'Polia', difficulty: 'intermediário', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'ab04', name: 'Abdominal Infra (Elevação de Pernas)', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { id: 'ab05', name: 'Elevação de Pernas na Barra', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
  { id: 'ab06', name: 'Elevação de Pernas na Cadeira', muscle: 'abdomen', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { id: 'ab07', name: 'Prancha Frontal', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 60, defaultWeight: 0 },
  { id: 'ab08', name: 'Prancha Lateral', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 45, defaultWeight: 0 },
  { id: 'ab09', name: 'Russian Twist', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
  { id: 'ab10', name: 'Bicycle Crunch', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
  { id: 'ab11', name: 'Abdominal Supra', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
  { id: 'ab12', name: 'Abdominal Tradicional', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 25, defaultWeight: 0 },
  { id: 'ab13', name: 'Mountain Climber', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'intermediário', defaultSets: 3, defaultReps: 30, defaultWeight: 0 },
  { id: 'ab14', name: 'Dead Bug', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
  { id: 'ab15', name: 'Rollout com Roda', muscle: 'abdomen', equipment: 'Peso corporal', difficulty: 'avançado', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },

  // ─── GLÚTEOS ──────────────────────────────────────────────────────────────
  { id: 'gl01', name: 'Hip Thrust com Barra', muscle: 'gluteos', equipment: 'Barra', difficulty: 'intermediário', defaultSets: 4, defaultReps: 12, defaultWeight: 60 },
  { id: 'gl02', name: 'Glúteo no Cabo', muscle: 'gluteos', equipment: 'Cabo', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { id: 'gl03', name: 'Extensão de Quadril', muscle: 'gluteos', equipment: 'Máquina', difficulty: 'iniciante', defaultSets: 3, defaultReps: 15, defaultWeight: 40 },
  { id: 'gl04', name: 'Elevação Pélvica', muscle: 'gluteos', equipment: 'Peso corporal', difficulty: 'iniciante', defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
]

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  peito: 'Peito',
  costas: 'Costas',
  pernas: 'Pernas',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abdomen: 'Abdômen',
  gluteos: 'Glúteos',
}

export const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  peito: '#ef4444',
  costas: '#3b82f6',
  pernas: '#22c55e',
  ombros: '#f59e0b',
  biceps: '#a855f7',
  triceps: '#06b6d4',
  abdomen: '#ec4899',
  gluteos: '#f97316',
}

export const EQUIPMENT_ICONS: Record<Equipment, string> = {
  'Barra': '🏋️',
  'Halteres': '💪',
  'Máquina': '⚙️',
  'Polia': '🔄',
  'Peso corporal': '🤸',
  'Smith': '🔩',
  'Cabo': '📎',
  'Kettlebell': '🔔',
}

export function searchExercises(query: string, muscle?: MuscleGroup): ExerciseTemplate[] {
  return EXERCISE_DB.filter(e => {
    const matchesMuscle = !muscle || e.muscle === muscle
    const matchesQuery = !query || e.name.toLowerCase().includes(query.toLowerCase()) || e.equipment.toLowerCase().includes(query.toLowerCase())
    return matchesMuscle && matchesQuery
  })
}
