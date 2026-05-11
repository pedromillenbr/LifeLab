import type { WorkoutSession } from '@/store/types'
import type { MuscleGroup } from '@/lib/exercises'

export type MuscleIntensity = 'none' | 'light' | 'intense'

export interface MuscleWeekStats {
  /** Total volume (kg × reps somados) por grupo nesta semana. */
  volumeByMuscle: Record<MuscleGroup, number>
  /** Total de sets executados por grupo nesta semana. */
  setsByMuscle: Record<MuscleGroup, number>
  /** Nível para o boneco: 'none' (cinza), 'light' (amarelo), 'intense' (vermelho). */
  intensityByMuscle: Record<MuscleGroup, MuscleIntensity>
}

const EMPTY_RECORD = (): Record<MuscleGroup, number> => ({
  peito: 0, costas: 0, pernas: 0, ombros: 0,
  biceps: 0, triceps: 0, abdomen: 0, gluteos: 0,
})

const EMPTY_INTENSITY = (): Record<MuscleGroup, MuscleIntensity> => ({
  peito: 'none', costas: 'none', pernas: 'none', ombros: 'none',
  biceps: 'none', triceps: 'none', abdomen: 'none', gluteos: 'none',
})

/**
 * Limiares de sets/semana para classificação leve vs intenso.
 * Baseado em referências comuns de hipertrofia: ≥10 sets/semana é volume produtivo.
 */
const INTENSE_SETS_THRESHOLD = 10
const LIGHT_SETS_THRESHOLD = 1

/** Retorna stats da semana corrente (últimos 7 dias) por grupo muscular. */
export function getWeeklyMuscleStats(sessions: WorkoutSession[]): MuscleWeekStats {
  const cutoff = Date.now() - 7 * 86400000
  const volumeByMuscle = EMPTY_RECORD()
  const setsByMuscle = EMPTY_RECORD()

  for (const s of sessions) {
    const t = new Date(s.date + 'T12:00:00').getTime()
    if (t < cutoff) continue
    for (const ex of s.exercises) {
      const muscle = ex.muscleGroup as MuscleGroup
      if (!(muscle in volumeByMuscle)) continue
      for (const set of ex.sets) {
        if (!set.completed) continue
        volumeByMuscle[muscle] += set.weight * set.reps
        setsByMuscle[muscle] += 1
      }
    }
  }

  const intensityByMuscle = EMPTY_INTENSITY()
  for (const m of Object.keys(setsByMuscle) as MuscleGroup[]) {
    const sets = setsByMuscle[m]
    if (sets >= INTENSE_SETS_THRESHOLD) intensityByMuscle[m] = 'intense'
    else if (sets >= LIGHT_SETS_THRESHOLD) intensityByMuscle[m] = 'light'
  }

  return { volumeByMuscle, setsByMuscle, intensityByMuscle }
}

/** Cor hex para cada nível de intensidade (alinhado ao design system). */
export const INTENSITY_COLOR: Record<MuscleIntensity, string> = {
  none: '#3a3f4b',
  light: '#fbbf24',
  intense: '#ef4444',
}

export const INTENSITY_LABEL: Record<MuscleIntensity, string> = {
  none: 'Não treinado',
  light: 'Treinado leve',
  intense: 'Treinado intenso',
}
