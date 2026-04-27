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
