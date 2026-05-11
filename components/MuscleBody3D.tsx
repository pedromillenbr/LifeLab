'use client'
import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type * as THREE from 'three'
import type { MuscleGroup } from '@/lib/exercises'
import { MUSCLE_GROUP_LABELS } from '@/lib/exercises'
import {
  INTENSITY_COLOR, INTENSITY_LABEL,
  type MuscleIntensity, type MuscleWeekStats,
} from '@/lib/muscleVolume'

interface MuscleBody3DProps {
  stats: MuscleWeekStats
  height?: number
}

export function MuscleBody3D({ stats, height = 380 }: MuscleBody3DProps) {
  const [hovered, setHovered] = useState<MuscleGroup | null>(null)

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height, width: '100%', cursor: 'grab', touchAction: 'none' }}>
        <Canvas
          camera={{ position: [0, 0.4, 4.6], fov: 38 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 4]} intensity={1.0} />
          <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#3b82f6" />

          <Suspense fallback={null}>
            <Body intensity={stats.intensityByMuscle} onHoverMuscle={setHovered} />
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
        position: 'absolute', bottom: 6, left: 12, right: 12,
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

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.getElapsedTime() * 1.4) * 0.04
    }
  })

  return (
    <group ref={group}>
      {/* Cabeça + pescoço */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#e8eef8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.16, 12]} />
        <meshStandardMaterial color="#cfd6e2" roughness={0.6} />
      </mesh>

      {/* Tronco base */}
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.32, 0.7, 8, 16]} />
        <meshStandardMaterial color="#1f2530" roughness={0.7} />
      </mesh>

      {/* Músculos */}
      <MusclePart muscle="peito" intensity={intensity.peito} position={[0, 0.78, 0.27]} rotation={[0.15, 0, 0]} onHover={onHoverMuscle} geom={<boxGeometry args={[0.52, 0.32, 0.12]} />} />

      <MusclePart muscle="ombros" intensity={intensity.ombros} position={[-0.38, 0.92, 0]} onHover={onHoverMuscle} geom={<sphereGeometry args={[0.16, 16, 16]} />} />
      <MusclePart muscle="ombros" intensity={intensity.ombros} position={[0.38, 0.92, 0]} onHover={onHoverMuscle} geom={<sphereGeometry args={[0.16, 16, 16]} />} />

      <MusclePart muscle="costas" intensity={intensity.costas} position={[0, 0.7, -0.27]} rotation={[-0.15, 0, 0]} onHover={onHoverMuscle} geom={<boxGeometry args={[0.56, 0.6, 0.12]} />} />

      <MusclePart muscle="abdomen" intensity={intensity.abdomen} position={[0, 0.32, 0.26]} onHover={onHoverMuscle} geom={<boxGeometry args={[0.38, 0.36, 0.1]} />} />

      <MusclePart muscle="biceps" intensity={intensity.biceps} position={[-0.5, 0.6, 0.08]} onHover={onHoverMuscle} geom={<capsuleGeometry args={[0.1, 0.22, 6, 12]} />} />
      <MusclePart muscle="biceps" intensity={intensity.biceps} position={[0.5, 0.6, 0.08]} onHover={onHoverMuscle} geom={<capsuleGeometry args={[0.1, 0.22, 6, 12]} />} />

      <MusclePart muscle="triceps" intensity={intensity.triceps} position={[-0.5, 0.6, -0.08]} onHover={onHoverMuscle} geom={<capsuleGeometry args={[0.09, 0.22, 6, 12]} />} />
      <MusclePart muscle="triceps" intensity={intensity.triceps} position={[0.5, 0.6, -0.08]} onHover={onHoverMuscle} geom={<capsuleGeometry args={[0.09, 0.22, 6, 12]} />} />

      {/* Antebraços neutros */}
      <mesh position={[-0.5, 0.28, 0]}>
        <capsuleGeometry args={[0.075, 0.26, 6, 12]} />
        <meshStandardMaterial color="#cfd6e2" roughness={0.6} />
      </mesh>
      <mesh position={[0.5, 0.28, 0]}>
        <capsuleGeometry args={[0.075, 0.26, 6, 12]} />
        <meshStandardMaterial color="#cfd6e2" roughness={0.6} />
      </mesh>

      <MusclePart muscle="gluteos" intensity={intensity.gluteos} position={[0, 0.12, -0.22]} onHover={onHoverMuscle} geom={<sphereGeometry args={[0.26, 16, 16]} />} />

      <MusclePart muscle="pernas" intensity={intensity.pernas} position={[-0.18, -0.32, 0.06]} onHover={onHoverMuscle} geom={<capsuleGeometry args={[0.14, 0.6, 8, 16]} />} />
      <MusclePart muscle="pernas" intensity={intensity.pernas} position={[0.18, -0.32, 0.06]} onHover={onHoverMuscle} geom={<capsuleGeometry args={[0.14, 0.6, 8, 16]} />} />
      <MusclePart muscle="pernas" intensity={intensity.pernas} position={[-0.18, -0.95, 0]} onHover={onHoverMuscle} geom={<capsuleGeometry args={[0.1, 0.32, 6, 12]} />} />
      <MusclePart muscle="pernas" intensity={intensity.pernas} position={[0.18, -0.95, 0]} onHover={onHoverMuscle} geom={<capsuleGeometry args={[0.1, 0.32, 6, 12]} />} />

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
  geom: React.ReactElement
}

function MusclePart({ muscle, intensity, position, rotation, onHover, geom }: MusclePartProps) {
  const [isHover, setIsHover] = useState(false)
  const color = INTENSITY_COLOR[intensity]
  const isLit = intensity !== 'none'
  const scale = isHover ? 1.08 : 1

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHover(true)
    onHover(muscle)
  }
  const handleOut = () => {
    setIsHover(false)
    onHover(null)
  }

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      {geom}
      <meshStandardMaterial
        color={color}
        roughness={0.45}
        metalness={0.15}
        emissive={isLit ? color : '#000000'}
        emissiveIntensity={intensity === 'intense' ? 0.8 : intensity === 'light' ? 0.35 : 0}
      />
    </mesh>
  )
}
