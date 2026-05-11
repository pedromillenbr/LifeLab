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

// Modelo humanoide CC0 hospedado no CDN oficial do three.js examples
// Tenta carregar o GLB local primeiro (em /public/models/body.glb).
// Se não existir, cai para um humanoide CC0 do CDN oficial do three.js.
// Para usar o seu próprio: coloque o arquivo em lifelab/public/models/body.glb.
const LOCAL_MODEL_URL  = '/models/body.glb'
const REMOTE_MODEL_URL = 'https://threejs.org/examples/models/gltf/Soldier.glb'

interface MuscleBody3DProps {
  stats: MuscleWeekStats
  height?: number
}

export function MuscleBody3D({ stats, height = 420 }: MuscleBody3DProps) {
  const [hovered, setHovered] = useState<MuscleGroup | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)

  // Detecta se o GLB local existe; senão usa o do CDN.
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
    <div style={{ position: 'relative', height, width: '100%' }}>
      <div style={{ height: '100%', width: '100%', cursor: 'grab', touchAction: 'none' }}>
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
              <BodyModel url={modelUrl} intensity={stats.intensityByMuscle} onHover={setHovered} />
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
      </div>

      {hovered && (
        <div
          style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            padding: '7px 16px', borderRadius: 999,
            background: 'rgba(15,17,22,.92)',
            border: `1px solid ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}`,
            color: '#fff', fontSize: 12, fontWeight: 600,
            backdropFilter: 'blur(12px)', pointerEvents: 'none',
            boxShadow: `0 0 20px ${INTENSITY_COLOR[stats.intensityByMuscle[hovered]]}66`,
            whiteSpace: 'nowrap',
          }}
        >
          {MUSCLE_GROUP_LABELS[hovered]} · {stats.setsByMuscle[hovered]} séries · {INTENSITY_LABEL[stats.intensityByMuscle[hovered]]}
        </div>
      )}

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
    </div>
  )
}

interface BodyModelProps {
  url: string
  intensity: Record<MuscleGroup, MuscleIntensity>
  onHover: (m: MuscleGroup | null) => void
}

function BodyModel({ url, intensity, onHover }: BodyModelProps) {
  const { scene } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)

  // Clone + normalização: medir bounding box e escalar o modelo
  // para altura unitária 1, recolocando os pés em y=0. Assim os
  // overlays funcionam para qualquer GLB independente de unidade
  // (m, cm, polegada) ou orientação salva no arquivo.
  const { normalized, depth } = useRef(((): { normalized: THREE.Group; depth: number } => {
    const cloned = scene.clone(true)
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        const mat = new THREE.MeshStandardMaterial({
          color: '#d8dde8',
          roughness: 0.55,
          metalness: 0.05,
        })
        mesh.material = mat
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
    // Pivô: centro horizontal, pés no chão
    cloned.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    cloned.scale.setScalar(scale)
    const wrapper = new THREE.Group()
    wrapper.add(cloned)
    return { normalized: wrapper, depth: size.z * scale }
  })()).current

  // Idle breathing
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.012
    }
  })

  return (
    <group ref={groupRef} scale={1.7}>
      <primitive object={normalized} />
      {/* Overlays glow por grupo muscular — agora em coordenadas
          relativas à altura 1 (0 = pé, 1 = topo da cabeça) */}
      <MuscleOverlays intensity={intensity} onHover={onHover} depth={depth} />
    </group>
  )
}

interface MuscleOverlaysProps {
  intensity: Record<MuscleGroup, MuscleIntensity>
  onHover: (m: MuscleGroup | null) => void
  depth: number
}

/**
 * Overlays semi-transparentes posicionados em cima do modelo, em
 * coordenadas RELATIVAS à altura unitária (0 = pé, 1 = topo da cabeça).
 * Funciona em qualquer GLB porque o BodyModel normaliza a escala.
 * Z é proporcional à espessura medida do modelo.
 */
function MuscleOverlays({ intensity, onHover, depth }: MuscleOverlaysProps) {
  // Espessura do corpo (varia por modelo). Usamos pra colocar
  // os overlays frontais ligeiramente à frente e traseiros atrás.
  const front = depth * 0.45
  const back  = -depth * 0.45

  return (
    <>
      <Overlay muscle="peito"   intensity={intensity.peito}   position={[0, 0.73, front * 0.85]}     geom={['box',     [0.23, 0.13, 0.10]]} onHover={onHover} />
      <Overlay muscle="costas"  intensity={intensity.costas}  position={[0, 0.72, back * 0.85]}      geom={['box',     [0.26, 0.24, 0.10]]} onHover={onHover} />
      <Overlay muscle="ombros"  intensity={intensity.ombros}  position={[-0.16, 0.82, 0]}            geom={['sphere',  [0.075]]}            onHover={onHover} />
      <Overlay muscle="ombros"  intensity={intensity.ombros}  position={[0.16, 0.82, 0]}             geom={['sphere',  [0.075]]}            onHover={onHover} />
      <Overlay muscle="biceps"  intensity={intensity.biceps}  position={[-0.20, 0.67, front * 0.4]}  geom={['capsule', [0.045, 0.10]]}      onHover={onHover} />
      <Overlay muscle="biceps"  intensity={intensity.biceps}  position={[0.20, 0.67, front * 0.4]}   geom={['capsule', [0.045, 0.10]]}      onHover={onHover} />
      <Overlay muscle="triceps" intensity={intensity.triceps} position={[-0.20, 0.67, back * 0.4]}   geom={['capsule', [0.040, 0.10]]}      onHover={onHover} />
      <Overlay muscle="triceps" intensity={intensity.triceps} position={[0.20, 0.67, back * 0.4]}    geom={['capsule', [0.040, 0.10]]}      onHover={onHover} />
      <Overlay muscle="abdomen" intensity={intensity.abdomen} position={[0, 0.58, front * 0.9]}      geom={['box',     [0.15, 0.17, 0.08]]} onHover={onHover} />
      <Overlay muscle="gluteos" intensity={intensity.gluteos} position={[0, 0.44, back * 0.85]}      geom={['sphere',  [0.115]]}            onHover={onHover} />
      <Overlay muscle="pernas"  intensity={intensity.pernas}  position={[-0.075, 0.28, front * 0.2]} geom={['capsule', [0.07, 0.22]]}       onHover={onHover} />
      <Overlay muscle="pernas"  intensity={intensity.pernas}  position={[0.075, 0.28, front * 0.2]}  geom={['capsule', [0.07, 0.22]]}       onHover={onHover} />
      <Overlay muscle="pernas"  intensity={intensity.pernas}  position={[-0.075, 0.07, 0]}           geom={['capsule', [0.05, 0.13]]}       onHover={onHover} />
      <Overlay muscle="pernas"  intensity={intensity.pernas}  position={[0.075, 0.07, 0]}            geom={['capsule', [0.05, 0.13]]}       onHover={onHover} />
    </>
  )
}

type GeomDef =
  | ['box', [number, number, number]]
  | ['sphere', [number]]
  | ['capsule', [number, number]]

interface OverlayProps {
  muscle: MuscleGroup
  intensity: MuscleIntensity
  position: [number, number, number]
  geom: GeomDef
  onHover: (m: MuscleGroup | null) => void
}

function Overlay({ muscle, intensity, position, geom, onHover }: OverlayProps) {
  const [isHover, setIsHover] = useState(false)
  const isLit = intensity !== 'none'
  const color = INTENSITY_COLOR[intensity]
  const opacity = isLit ? (isHover ? 0.85 : 0.55) : (isHover ? 0.35 : 0.12)
  const scale = isHover ? 1.06 : 1

  return (
    <mesh
      position={position}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setIsHover(true); onHover(muscle) }}
      onPointerOut={() => { setIsHover(false); onHover(null) }}
    >
      {geom[0] === 'box' && <boxGeometry args={geom[1]} />}
      {geom[0] === 'sphere' && <sphereGeometry args={[geom[1][0], 24, 24]} />}
      {geom[0] === 'capsule' && <capsuleGeometry args={[geom[1][0], geom[1][1], 8, 16]} />}
      <meshStandardMaterial
        color={color}
        emissive={isLit ? color : '#000000'}
        emissiveIntensity={intensity === 'intense' ? 0.9 : intensity === 'light' ? 0.4 : 0}
        transparent
        opacity={opacity}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  )
}
