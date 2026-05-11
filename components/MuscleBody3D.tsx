'use client'
import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'
import type { MuscleGroup } from '@/lib/exercises'
import { MUSCLE_GROUP_LABELS } from '@/lib/exercises'
import {
  INTENSITY_COLOR, INTENSITY_LABEL,
  type MuscleIntensity, type MuscleWeekStats,
} from '@/lib/muscleVolume'

// Tenta o GLB local primeiro; se não existir cai pro CDN.
const LOCAL_MODEL_URL  = '/models/body.glb'
const REMOTE_MODEL_URL = 'https://threejs.org/examples/models/gltf/Soldier.glb'

interface MuscleBody3DProps {
  stats: MuscleWeekStats
  height?: number
}

const MUSCLE_ORDER: MuscleGroup[] = [
  'peito', 'costas', 'ombros',
  'biceps', 'triceps', 'abdomen',
  'pernas', 'gluteos',
]

export function MuscleBody3D({ stats, height = 420 }: MuscleBody3DProps) {
  const [highlighted, setHighlighted] = useState<MuscleGroup | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(LOCAL_MODEL_URL, { method: 'HEAD' })
      .then(r => {
        if (cancelled) return
        setModelUrl(r.ok ? LOCAL_MODEL_URL : REMOTE_MODEL_URL)
      })
      .catch(() => { if (!cancelled) setModelUrl(REMOTE_MODEL_URL) })
    return () => { cancelled = true }
  }, [])

  if (!modelUrl) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
        Carregando boneco 3D…
      </div>
    )
  }

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
      {/* Canvas 3D — sem overlays, modelo limpo */}
      <div style={{ position: 'relative', height: '100%', cursor: 'grab', touchAction: 'none' }}>
        <Canvas
          camera={{ position: [0, 1.0, 3.2], fov: 35 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 4]} intensity={1.2} castShadow />
          <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#3b82f6" />
          <pointLight position={[0, -1, 3]} intensity={0.4} color="#60a5fa" />

          <Suspense fallback={null}>
            <Center top>
              <BodyModel url={modelUrl} highlighted={highlighted} />
            </Center>
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={1.0}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 1.7}
            target={[0, 0.85, 0]}
          />
        </Canvas>

        {/* Legenda inferior */}
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

      {/* Painel lateral — chips dos grupos musculares com heatmap */}
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

interface BodyModelProps {
  url: string
  highlighted: MuscleGroup | null
}

function BodyModel({ url, highlighted }: BodyModelProps) {
  const { scene } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null)

  // Clone + normalização (altura unitária 1)
  const { normalized } = useRef(((): { normalized: THREE.Group } => {
    const cloned = scene.clone(true)
    const sharedMat = new THREE.MeshStandardMaterial({
      color: '#d8dde8',
      roughness: 0.55,
      metalness: 0.05,
    })
    materialRef.current = sharedMat
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.material = sharedMat
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const height = size.y || 1
    const scale = 1 / height
    cloned.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    cloned.scale.setScalar(scale)
    const wrapper = new THREE.Group()
    wrapper.add(cloned)
    return { normalized: wrapper }
  })()).current

  // Emissive sutil quando algum músculo está em hover na lista lateral
  // Como o GLB não tem meshes separados por grupo, o feedback é global:
  // o corpo inteiro pulsa levemente na cor do nível em hover.
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.012
    }
  })

  // Sutil destaque quando algum chip está em hover (apenas mudança de tom)
  useEffect(() => {
    if (!materialRef.current) return
    const mat = materialRef.current
    if (highlighted) {
      mat.color.set('#e6ecf5')
      mat.emissive.set('#3b82f6')
      mat.emissiveIntensity = 0.05
    } else {
      mat.color.set('#d8dde8')
      mat.emissive.set('#000000')
      mat.emissiveIntensity = 0
    }
  }, [highlighted])

  return (
    <group ref={groupRef} scale={1.7}>
      <primitive object={normalized} />
    </group>
  )
}
