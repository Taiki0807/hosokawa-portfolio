'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Wireframe } from 'three/addons/lines/Wireframe.js'
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'

const RADIUS = 1.55
const DETAIL = 3
// フォグ用の背景色。Hero.tsx側の黒っぽい円(#0a0913)と揃え、球の奥側が
// その円の色に溶け込んで消えるようにする(元のSVGの奥行き表現に近づける)。
const BG_COLOR = '#0a0913'

function GlobeMesh() {
  const groupRef = useRef<THREE.Group>(null)

  const { wireframe, pointsGeometry } = useMemo(() => {
    const icosahedron = new THREE.IcosahedronGeometry(RADIUS, DETAIL)

    const wireGeometry = new WireframeGeometry2(icosahedron)
    const lineMaterial = new LineMaterial({
      color: 0x8f7ff0,
      linewidth: 1.8, // px
      transparent: true,
      opacity: 0.75,
      fog: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const wireframe = new Wireframe(wireGeometry, lineMaterial)
    wireframe.computeLineDistances()
    wireframe.frustumCulled = false

    const pointsGeometry = new THREE.BufferGeometry()
    const position = icosahedron.getAttribute('position')
    if (position) pointsGeometry.setAttribute('position', position.clone())

    return { wireframe, pointsGeometry }
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
    }
  })

  return (
    <group ref={groupRef} rotation={[0.35, 0, 0.08]}>
      <primitive object={wireframe} />
      <points geometry={pointsGeometry}>
        <pointsMaterial
          color="#cfc8ff"
          size={0.06}
          sizeAttenuation
          transparent
          opacity={1}
          fog
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

export default function Globe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.4], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <fog attach="fog" args={[BG_COLOR, 3.1, 5.4]} />
      <GlobeMesh />
    </Canvas>
  )
}
