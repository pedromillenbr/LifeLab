'use client'
import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
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

const MUSCLE_ORDER: MuscleGroup[] = [
  'peito', 'costas', 'ombros',
  'biceps', 'triceps', 'abdomen',
  'pernas', 'gluteos',
]

const SKIN_COLOR = '#5b6573'
const HIGHLIGHT_BOOST = 1.6

export function MuscleBody3D({ stats, height = 420 }: MuscleBody3DProps) {
  const [highlighted, setHighlighted] = useState<MuscleGroup | null>(null)

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 200px',
        gap: 12,
      }}
      className="muscle-body-3d-root"
    >
      <div style={{ position: 'relative', height: '100%', cursor: 'grab', touchAction: 'none' }}>
        <Canvas
          camera={{ position: [0, 1.05, 3.6], fov: 32 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
          <directionalLight position={[-4, 2, -3]} intensity={0.45} color="#3b82f6" />
          <pointLight position={[0, -1, 3]} intensity={0.35} color="#60a5fa" />

          <ProceduralBody stats={stats} highlighted={highlighted} />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.9}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 1.7}
            target={[0, 0.95, 0]}
          />
        </Canvas>

        <div
          style={{
            position: 'absolute', bottom: 6, left: 8, right: 8,
            display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
            pointerEvents: 'none',
          }}
        >
          {(['none', 'light', 'intense'] as MuscleIntensity[]).map(level => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,.6)' }}>
              <span
                style={{
                  width: 8, height: 8, borderRadius: 999,
                  background: INTENSITY_COLOR[level],
                  boxShadow: level !== 'none' ? `0 0 6px ${INTENSITY_COLOR[level]}` : 'none',
                }}
              />
              {INTENSITY_LABEL[level]}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          overflowY: 'auto', paddingRight: 4,
        }}
        className="muscle-side-panel"
      >
        {MUSCLE_ORDER.map(m => {
          const level = stats.intensityByMuscle[m]
          const sets = stats.setsByMuscle[m]
          const color = INTENSITY_COLOR[level]
          const isHighlighted = highlighted === m
          return (
            <button
              key={m}
              type="button"
              onMouseEnter={() => setHighlighted(m)}
              onMouseLeave={() => setHighlighted(null)}
              onFocus={() => setHighlighted(m)}
              onBlur={() => setHighlighted(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                background: isHighlighted ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.03)',
                border: `1px solid ${level !== 'none' ? color : 'rgba(255,255,255,.09)'}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'background .2s ease, transform .2s ease',
                transform: isHighlighted ? 'translateX(-2px)' : 'translateX(0)',
                textAlign: 'left',
                color: 'var(--color-text-main)',
                font: 'inherit',
              }}
            >
              <span
                style={{
                  width: 10, height: 10, borderRadius: 999,
                  background: color, flexShrink: 0,
                  boxShadow: level !== 'none' ? `0 0 8px ${color}` : 'none',
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 600, lineHeight: 1.15 }}>
                  {MUSCLE_GROUP_LABELS[m]}
                </span>
                <span style={{ display: 'block', fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 1 }}>
                  {sets > 0 ? `${sets} ${sets === 1 ? 'série' : 'séries'}` : '—'}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .muscle-body-3d-root {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr auto !important;
          }
          .muscle-side-panel {
            flex-direction: row !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            padding-bottom: 4px;
          }
          .muscle-side-panel button {
            flex-shrink: 0;
            min-width: 110px;
          }
        }
      `}</style>
    </div>
  )
}

interface ProceduralBodyProps {
  stats: MuscleWeekStats
  highlighted: MuscleGroup | null
}

/**
 * Boneco humanoide construído com primitivas do Three.js.
 * Cada grupo muscular é seu próprio mesh (peito, costas, ombros L/R, etc.)
 * para que o heatmap colora individualmente.
 */
function ProceduralBody({ stats, highlighted }: ProceduralBodyProps) {
  const rootRef = useRef<THREE.Group>(null)

  // Material compartilhado para "pele" (partes neutras: cabeça, mãos, pés, juntas).
  const skinMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SKIN_COLOR,
        roughness: 0.65,
        metalness: 0.05,
      }),
    [],
  )

  // Um material por grupo muscular — cor e emissive atualizados via useEffect.
  const muscleMats = useMemo(() => {
    const make = () =>
      new THREE.MeshStandardMaterial({
        color: SKIN_COLOR,
        roughness: 0.55,
        metalness: 0.1,
        emissive: '#000000',
        emissiveIntensity: 0,
      })
    return {
      peito: make(),
      costas: make(),
      ombroL: make(),
      ombroR: make(),
      bicepsL: make(),
      bicepsR: make(),
      tricepsL: make(),
      tricepsR: make(),
      abdomen: make(),
      pernaL: make(),
      pernaR: make(),
      gluteoL: make(),
      gluteoR: make(),
    }
  }, [])

  // Aplica intensidade -> cor base. Hover (highlighted) acrescenta emissive.
  useEffect(() => {
    const apply = (mat: THREE.MeshStandardMaterial, group: MuscleGroup) => {
      const level = stats.intensityByMuscle[group]
      const baseHex = level === 'none' ? SKIN_COLOR : INTENSITY_COLOR[level]
      mat.color.set(baseHex)
      const isHi = highlighted === group
      if (isHi) {
        mat.emissive.set(level === 'none' ? '#3b82f6' : INTENSITY_COLOR[level])
        mat.emissiveIntensity = level === 'none' ? 0.25 : 0.55 * HIGHLIGHT_BOOST
      } else {
        mat.emissive.set(level === 'none' ? '#000000' : INTENSITY_COLOR[level])
        mat.emissiveIntensity = level === 'none' ? 0 : 0.18
      }
      mat.needsUpdate = true
    }
    apply(muscleMats.peito, 'peito')
    apply(muscleMats.costas, 'costas')
    apply(muscleMats.ombroL, 'ombros')
    apply(muscleMats.ombroR, 'ombros')
    apply(muscleMats.bicepsL, 'biceps')
    apply(muscleMats.bicepsR, 'biceps')
    apply(muscleMats.tricepsL, 'triceps')
    apply(muscleMats.tricepsR, 'triceps')
    apply(muscleMats.abdomen, 'abdomen')
    apply(muscleMats.pernaL, 'pernas')
    apply(muscleMats.pernaR, 'pernas')
    apply(muscleMats.gluteoL, 'gluteos')
    apply(muscleMats.gluteoR, 'gluteos')
  }, [stats, highlighted, muscleMats])

  // Respiração suave do tronco
  useFrame(({ clock }) => {
    if (rootRef.current) {
      const t = clock.getElapsedTime()
      rootRef.current.position.y = Math.sin(t * 1.2) * 0.012
    }
  })

  // Geometrias compartilhadas
  const sphere = useMemo(() => new THREE.SphereGeometry(0.5, 24, 18), [])
  const capsule = useMemo(() => new THREE.CapsuleGeometry(0.5, 1, 8, 16), [])
  const ellipsoidTorso = useMemo(() => new THREE.SphereGeometry(0.5, 24, 18), [])

  // ───── Dimensões do humanoide (escala em metros, ~1.8m de altura) ─────
  const HEAD_R = 0.16
  const NECK_H = 0.08
  const TORSO_W = 0.42
  const TORSO_H = 0.52
  const TORSO_D = 0.26
  const PELVIS_W = 0.36
  const PELVIS_H = 0.18
  const PELVIS_D = 0.24
  const SHOULDER_R = 0.11
  const UPPER_ARM_L = 0.32
  const UPPER_ARM_R = 0.075
  const FOREARM_L = 0.28
  const FOREARM_R = 0.065
  const HAND_R = 0.07
  const THIGH_L = 0.42
  const THIGH_R = 0.105
  const SHIN_L = 0.42
  const SHIN_R = 0.085
  const FOOT_L = 0.18

  // posições de referência
  const torsoY = 1.1
  const shoulderY = torsoY + TORSO_H * 0.42
  const shoulderX = TORSO_W * 0.46
  const hipY = torsoY - TORSO_H * 0.5 - PELVIS_H * 0.5
  const hipX = PELVIS_W * 0.32
  const armDownY = shoulderY - SHOULDER_R - UPPER_ARM_L * 0.5
  const forearmY = shoulderY - SHOULDER_R - UPPER_ARM_L - FOREARM_L * 0.5
  const handY = shoulderY - SHOULDER_R - UPPER_ARM_L - FOREARM_L - HAND_R * 0.6
  const armX = shoulderX + 0.02

  return (
    <group ref={rootRef} position={[0, 0, 0]} scale={1}>
      {/* CABEÇA + PESCOÇO */}
      <mesh
        geometry={sphere}
        material={skinMat}
        position={[0, shoulderY + NECK_H + HEAD_R + 0.04, 0]}
        scale={[HEAD_R * 2, HEAD_R * 2.2, HEAD_R * 2]}
        castShadow
      />
      <mesh
        material={skinMat}
        position={[0, shoulderY + NECK_H * 0.5 + 0.02, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.085, NECK_H, 16]} />
      </mesh>

      {/* TRONCO BASE — caixa neutra de "pele" por baixo dos músculos */}
      <mesh
        geometry={ellipsoidTorso}
        material={skinMat}
        position={[0, torsoY, 0]}
        scale={[TORSO_W, TORSO_H, TORSO_D]}
        castShadow
      />

      {/* PEITO — dois peitorais arredondados na frente do tronco */}
      <group position={[0, torsoY + TORSO_H * 0.18, TORSO_D * 0.42]}>
        <mesh
          geometry={sphere}
          material={muscleMats.peito}
          position={[-0.09, 0, 0]}
          scale={[0.13, 0.10, 0.09]}
          castShadow
        />
        <mesh
          geometry={sphere}
          material={muscleMats.peito}
          position={[0.09, 0, 0]}
          scale={[0.13, 0.10, 0.09]}
          castShadow
        />
      </group>

      {/* ABDOMEN — placa frontal central abaixo do peito */}
      <mesh
        geometry={sphere}
        material={muscleMats.abdomen}
        position={[0, torsoY - TORSO_H * 0.12, TORSO_D * 0.44]}
        scale={[0.13, 0.18, 0.06]}
        castShadow
      />

      {/* COSTAS — placa larga atrás do tronco */}
      <mesh
        geometry={sphere}
        material={muscleMats.costas}
        position={[0, torsoY + TORSO_H * 0.05, -TORSO_D * 0.45]}
        scale={[0.20, 0.24, 0.07]}
        castShadow
      />

      {/* OMBROS — esferas em cada lado */}
      <mesh
        geometry={sphere}
        material={muscleMats.ombroL}
        position={[-shoulderX, shoulderY, 0]}
        scale={[SHOULDER_R * 2, SHOULDER_R * 2, SHOULDER_R * 2]}
        castShadow
      />
      <mesh
        geometry={sphere}
        material={muscleMats.ombroR}
        position={[shoulderX, shoulderY, 0]}
        scale={[SHOULDER_R * 2, SHOULDER_R * 2, SHOULDER_R * 2]}
        castShadow
      />

      {/* BRAÇO ESQUERDO */}
      {/* Bíceps (frente do braço) */}
      <mesh
        geometry={capsule}
        material={muscleMats.bicepsL}
        position={[-armX, armDownY, 0.025]}
        scale={[UPPER_ARM_R * 2, UPPER_ARM_L * 0.9, UPPER_ARM_R * 2]}
        castShadow
      />
      {/* Tríceps (trás do braço) — capsula um pouco menor, recuada */}
      <mesh
        geometry={capsule}
        material={muscleMats.tricepsL}
        position={[-armX, armDownY, -0.025]}
        scale={[UPPER_ARM_R * 1.6, UPPER_ARM_L * 0.95, UPPER_ARM_R * 1.6]}
        castShadow
      />
      {/* Antebraço (pele neutra) */}
      <mesh
        geometry={capsule}
        material={skinMat}
        position={[-armX, forearmY, 0]}
        scale={[FOREARM_R * 2, FOREARM_L, FOREARM_R * 2]}
        castShadow
      />
      <mesh
        geometry={sphere}
        material={skinMat}
        position={[-armX, handY, 0]}
        scale={[HAND_R * 1.8, HAND_R * 2.2, HAND_R * 1.4]}
        castShadow
      />

      {/* BRAÇO DIREITO */}
      <mesh
        geometry={capsule}
        material={muscleMats.bicepsR}
        position={[armX, armDownY, 0.025]}
        scale={[UPPER_ARM_R * 2, UPPER_ARM_L * 0.9, UPPER_ARM_R * 2]}
        castShadow
      />
      <mesh
        geometry={capsule}
        material={muscleMats.tricepsR}
        position={[armX, armDownY, -0.025]}
        scale={[UPPER_ARM_R * 1.6, UPPER_ARM_L * 0.95, UPPER_ARM_R * 1.6]}
        castShadow
      />
      <mesh
        geometry={capsule}
        material={skinMat}
        position={[armX, forearmY, 0]}
        scale={[FOREARM_R * 2, FOREARM_L, FOREARM_R * 2]}
        castShadow
      />
      <mesh
        geometry={sphere}
        material={skinMat}
        position={[armX, handY, 0]}
        scale={[HAND_R * 1.8, HAND_R * 2.2, HAND_R * 1.4]}
        castShadow
      />

      {/* QUADRIL / PELVE — base neutra */}
      <mesh
        geometry={ellipsoidTorso}
        material={skinMat}
        position={[0, hipY, 0]}
        scale={[PELVIS_W, PELVIS_H, PELVIS_D]}
        castShadow
      />

      {/* GLÚTEOS — duas esferas atrás da pelve */}
      <mesh
        geometry={sphere}
        material={muscleMats.gluteoL}
        position={[-PELVIS_W * 0.22, hipY - 0.02, -PELVIS_D * 0.42]}
        scale={[0.13, 0.12, 0.09]}
        castShadow
      />
      <mesh
        geometry={sphere}
        material={muscleMats.gluteoR}
        position={[PELVIS_W * 0.22, hipY - 0.02, -PELVIS_D * 0.42]}
        scale={[0.13, 0.12, 0.09]}
        castShadow
      />

      {/* PERNA ESQUERDA — coxa + panturrilha + pé (mesmo material "pernas") */}
      <mesh
        geometry={capsule}
        material={muscleMats.pernaL}
        position={[-hipX, hipY - PELVIS_H * 0.4 - THIGH_L * 0.5, 0]}
        scale={[THIGH_R * 2, THIGH_L * 0.85, THIGH_R * 2]}
        castShadow
      />
      <mesh
        geometry={capsule}
        material={muscleMats.pernaL}
        position={[-hipX, hipY - PELVIS_H * 0.4 - THIGH_L - SHIN_L * 0.5, -0.01]}
        scale={[SHIN_R * 2, SHIN_L * 0.85, SHIN_R * 2]}
        castShadow
      />
      <mesh
        geometry={sphere}
        material={skinMat}
        position={[-hipX, hipY - PELVIS_H * 0.4 - THIGH_L - SHIN_L - 0.02, FOOT_L * 0.25]}
        scale={[0.10, 0.06, FOOT_L]}
        castShadow
      />

      {/* PERNA DIREITA */}
      <mesh
        geometry={capsule}
        material={muscleMats.pernaR}
        position={[hipX, hipY - PELVIS_H * 0.4 - THIGH_L * 0.5, 0]}
        scale={[THIGH_R * 2, THIGH_L * 0.85, THIGH_R * 2]}
        castShadow
      />
      <mesh
        geometry={capsule}
        material={muscleMats.pernaR}
        position={[hipX, hipY - PELVIS_H * 0.4 - THIGH_L - SHIN_L * 0.5, -0.01]}
        scale={[SHIN_R * 2, SHIN_L * 0.85, SHIN_R * 2]}
        castShadow
      />
      <mesh
        geometry={sphere}
        material={skinMat}
        position={[hipX, hipY - PELVIS_H * 0.4 - THIGH_L - SHIN_L - 0.02, FOOT_L * 0.25]}
        scale={[0.10, 0.06, FOOT_L]}
        castShadow
      />

      {/* "Chão" sombra suave */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, hipY - PELVIS_H * 0.4 - THIGH_L - SHIN_L - 0.05, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}
