'use client'
import { Suspense, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'
import type { MuscleGroup } from '@/lib/exercises'
import { MUSCLE_GROUP_LABELS } from '@/lib/exercises'
import {
  INTENSITY_COLOR, INTENSITY_LABEL,
  type MuscleIntensity, type MuscleWeekStats,
} from '@/lib/muscleVolume'

interface MuscleBody3DProps {
  stats: MuscleWeekStats
  /** Altura do canvas em px. Default 380. */
  height?: number
}

/**
 * Boneco estilizado com músculos pintados por intensidade semanal.
 * Geometria procedural — leve, sem dependência de GLB externo.
 */
export function MuscleBody3D({ stats, height = 380 }: MuscleBody3DProps) {
  const [hovered, setHovered] = useState<MuscleGroup | null>(null)

  return (
    <div className="muscle-body-3d-wrap" style={{ position: 'relative' }}>
      <div style={{ height, width: '100%', cursor: 'grab', touchAction: 'none' }}>
        <Canvas
          camera={{ position: [0, 0.4, 4.6], fov: 38 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['transparent' as unknown as THREE.ColorRepresentation]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 5, 4]} intensity={1.1} color="#ffffff" />
          <directionalLight position={[-3, 2, -3]} intensity={0.35} color="#3b82f6" />
          <pointLight position={[0, -2, 2]} intensity={0.3} color="#60a5fa" />

          <Suspense fallback={null}>
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
              <Body intensity={stats.intensityByMuscle} onHoverMuscle={setHovered} />
            </Float>
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.8}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Canvas>
      </div>

      {/* Hover badge */}
      {hovered && (
        <div
          style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(15,17,22,.85)',
            border: `1px solid ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}`,
            color: '#fff', fontSize: 12, fontWeight: 600,
            backdropFilter: 'blur(12px)', pointerEvents: 'none',
            boxShadow: `0 0 16px ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}55`,
          }}
        >
          {MUSCLE_GROUP_LABELS[hovered]} · {stats.setsByMuscle[hovered]} séries · {INTENSITY_LABEL[stats.intensityByMuscle[hovered]]}
        </div>
      )}

      <Legend />
    </div>
  )
}

function Legend() {
  return (
    <div
      style={{
        position: 'absolute', bottom: 10, left: 12, right: 12,
        display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
        pointerEvents: 'none',
      }}
    >
      {(['none', 'light', 'intense'] as MuscleIntensity[]).map(level => (
        <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,.7)' }}>
          <span
            style={{
              width: 10, height: 10, borderRadius: 999,
              background: INTENSITY_COLOR[level],
              boxShadow: level !== 'none' ? `0 0 8px ${INTENSITY_COLOR[level]}` : 'none',
            }}
          />
          {INTENSITY_LABEL[level]}
        </div>
      ))}
    </div>
  )
}

interface BodyProps {
  intensity: Record<MuscleGroup, MuscleIntensity>
  onHoverMuscle: (m: MuscleGroup | null) => void
}

function Body({ intensity, onHoverMuscle }: BodyProps) {
  const group = useRef<THREE.Group>(null)
  // Idle breathing
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.position.y = Math.sin(t * 1.4) * 0.04
  })

  return (
    <group ref={group}>
      {/* Cabeça */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#e8eef8" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Pescoço */}
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.16, 16]} />
        <meshStandardMaterial color="#cfd6e2" roughness={0.6} />
      </mesh>

      {/* Tronco base (cinza neutro) */}
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.32, 0.7, 12, 24]} />
        <meshStandardMaterial color="#1f2530" roughness={0.7} />
      </mesh>

      {/* PEITO — placa frontal sobre o tronco */}
      <MusclePart
        muscle="peito"
        intensity={intensity.peito}
        position={[0, 0.78, 0.27]}
        rotation={[0.15, 0, 0]}
        onHover={onHoverMuscle}
      >
        <boxGeometry args={[0.52, 0.32, 0.12]} />
      </MusclePart>

      {/* OMBROS — duas esferas nos topos */}
      <MusclePart muscle="ombros" intensity={intensity.ombros} position={[-0.38, 0.92, 0]} onHover={onHoverMuscle}>
        <sphereGeometry args={[0.16, 24, 24]} />
      </MusclePart>
      <MusclePart muscle="ombros" intensity={intensity.ombros} position={[0.38, 0.92, 0]} onHover={onHoverMuscle}>
        <sphereGeometry args={[0.16, 24, 24]} />
      </MusclePart>

      {/* COSTAS — placa traseira */}
      <MusclePart
        muscle="costas"
        intensity={intensity.costas}
        position={[0, 0.7, -0.27]}
        rotation={[-0.15, 0, 0]}
        onHover={onHoverMuscle}
      >
        <boxGeometry args={[0.56, 0.6, 0.12]} />
      </MusclePart>

      {/* ABDÔMEN */}
      <MusclePart
        muscle="abdomen"
        intensity={intensity.abdomen}
        position={[0, 0.32, 0.26]}
        onHover={onHoverMuscle}
      >
        <boxGeometry args={[0.38, 0.36, 0.1]} />
      </MusclePart>

      {/* BÍCEPS — esferas nos braços frontais */}
      <MusclePart muscle="biceps" intensity={intensity.biceps} position={[-0.5, 0.6, 0.08]} onHover={onHoverMuscle}>
        <capsuleGeometry args={[0.1, 0.22, 8, 16]} />
      </MusclePart>
      <MusclePart muscle="biceps" intensity={intensity.biceps} position={[0.5, 0.6, 0.08]} onHover={onHoverMuscle}>
        <capsuleGeometry args={[0.1, 0.22, 8, 16]} />
      </MusclePart>

      {/* TRÍCEPS — atrás dos braços */}
      <MusclePart muscle="triceps" intensity={intensity.triceps} position={[-0.5, 0.6, -0.08]} onHover={onHoverMuscle}>
        <capsuleGeometry args={[0.09, 0.22, 8, 16]} />
      </MusclePart>
      <MusclePart muscle="triceps" intensity={intensity.triceps} position={[0.5, 0.6, -0.08]} onHover={onHoverMuscle}>
        <capsuleGeometry args={[0.09, 0.22, 8, 16]} />
      </MusclePart>

      {/* Antebraços (neutros) */}
      <mesh position={[-0.5, 0.28, 0]}>
        <capsuleGeometry args={[0.075, 0.26, 8, 16]} />
        <meshStandardMaterial color="#cfd6e2" roughness={0.6} />
      </mesh>
      <mesh position={[0.5, 0.28, 0]}>
        <capsuleGeometry args={[0.075, 0.26, 8, 16]} />
        <meshStandardMaterial color="#cfd6e2" roughness={0.6} />
      </mesh>

      {/* GLÚTEOS — atrás do quadril */}
      <MusclePart
        muscle="gluteos"
        intensity={intensity.gluteos}
        position={[0, 0.12, -0.22]}
        onHover={onHoverMuscle}
      >
        <sphereGeometry args={[0.26, 24, 24]} />
      </MusclePart>

      {/* PERNAS — dois grandes blocos (quadríceps frontais) */}
      <MusclePart muscle="pernas" intensity={intensity.pernas} position={[-0.18, -0.32, 0.06]} onHover={onHoverMuscle}>
        <capsuleGeometry args={[0.14, 0.6, 10, 20]} />
      </MusclePart>
      <MusclePart muscle="pernas" intensity={intensity.pernas} position={[0.18, -0.32, 0.06]} onHover={onHoverMuscle}>
        <capsuleGeometry args={[0.14, 0.6, 10, 20]} />
      </MusclePart>

      {/* Panturrilhas (parte do grupo pernas) */}
      <MusclePart muscle="pernas" intensity={intensity.pernas} position={[-0.18, -0.95, 0]} onHover={onHoverMuscle}>
        <capsuleGeometry args={[0.1, 0.32, 8, 16]} />
      </MusclePart>
      <MusclePart muscle="pernas" intensity={intensity.pernas} position={[0.18, -0.95, 0]} onHover={onHoverMuscle}>
        <capsuleGeometry args={[0.1, 0.32, 8, 16]} />
      </MusclePart>

      {/* Pés */}
      <mesh position={[-0.18, -1.2, 0.08]}>
        <boxGeometry args={[0.16, 0.08, 0.28]} />
        <meshStandardMaterial color="#cfd6e2" roughness={0.6} />
      </mesh>
      <mesh position={[0.18, -1.2, 0.08]}>
        <boxGeometry args={[0.16, 0.08, 0.28]} />
        <meshStandardMaterial color="#cfd6e2" roughness={0.6} />
      </mesh>
    </group>
  )
}

interface MusclePartProps {
  muscle: MuscleGroup
  intensity: MuscleIntensity
  position: [number, number, number]
  rotation?: [number, number, number]
  onHover: (m: MuscleGroup | null) => void
  children: React.ReactNode
}

function MusclePart({ muscle, intensity, position, rotation, onHover, children }: MusclePartProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isHover, setIsHover] = useState(false)

  // Pulse animation for intense muscles
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    if (!mat || !mat.emissive) return
    if (intensity === 'intense') {
      const pulse = (Math.sin(clock.getElapsedTime() * 2.5) + 1) / 2
      mat.emissiveIntensity = 0.6 + pulse * 0.5
    } else if (intensity === 'light') {
      mat.emissiveIntensity = 0.35
    } else {
      mat.emissiveIntensity = 0
    }
  })

  const color = INTENSITY_COLOR[intensity]
  const baseScale = isHover ? 1.08 : 1

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0.15,
      emissive: intensity === 'none' ? '#000000' : color,
      emissiveIntensity: 0,
    })
    return m
  }, [color, intensity])

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHover(true)
    onHover(muscle)
    document.body.style.cursor = 'pointer'
  }
  const handleOut = () => {
    setIsHover(false)
    onHover(null)
    document.body.style.cursor = 'auto'
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={baseScale}
      material={material}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      {children}
    </mesh>
  )
}
