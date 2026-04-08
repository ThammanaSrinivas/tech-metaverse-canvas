"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import type * as THREE from "three"

function Stars(props: any) {
  const ref = useRef<THREE.Points>(null!)
  const [sphere] = useState(() => {
    // Reduce particles on mobile for better performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const particleCount = isMobile ? 1500 : 5000;
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const r = 4 + Math.random() * 4
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    return positions
  })

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 20
    ref.current.rotation.y -= delta / 25
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial 
          transparent 
          color="#00f5ff" 
          size={0.025} 
          sizeAttenuation={true} 
          depthWrite={false} 
        />
      </Points>
    </group>
  )
}

function SecondaryStars(props: any) {
  const ref = useRef<THREE.Points>(null!)
  const [sphere] = useState(() => {
    // Reduce particles on mobile for better performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const particleCount = isMobile ? 1000 : 3000;
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const r = 6 + Math.random() * 6
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    return positions
  })

  useFrame((state, delta) => {
    ref.current.rotation.x += delta / 30
    ref.current.rotation.y += delta / 35
  })

  return (
    <group rotation={[0, 0, -Math.PI / 6]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial 
          transparent 
          color="#00f5ff" 
          size={0.02} 
          sizeAttenuation={true} 
          depthWrite={false} 
        />
      </Points>
    </group>
  )
}

function AccentStars(props: any) {
  const ref = useRef<THREE.Points>(null!)
  const [sphere] = useState(() => {
    // Reduce particles on mobile for better performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const particleCount = isMobile ? 500 : 2000;
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const r = 8 + Math.random() * 8
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    return positions
  })

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 40
    ref.current.rotation.z += delta / 45
  })

  return (
    <group rotation={[0, 0, Math.PI / 3]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial 
          transparent 
          color="#39ff14" 
          size={0.015} 
          sizeAttenuation={true} 
          depthWrite={false} 
        />
      </Points>
    </group>
  )
}

export function HeroScene() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  return (
    <Canvas 
      camera={{ position: [0, 0, 8] }}
      gl={{
        antialias: !isMobile, // Disable antialiasing on mobile for better performance
        pixelRatio: isMobile ? 1 : Math.min(window.devicePixelRatio, 2), // Limit pixel ratio on mobile
        alpha: true,
        premultipliedAlpha: true
      }}
      performance={{ min: 0.5 }} // Reduce quality if performance drops
    >
      <ambientLight intensity={isMobile ? 0.3 : 0.5} />
      <pointLight position={[10, 10, 10]} intensity={isMobile ? 60 : 120} color="#00f5ff" />
      <pointLight position={[-10, -10, -10]} intensity={isMobile ? 30 : 60} color="#00f5ff" />
      <pointLight position={[0, 0, 10]} intensity={isMobile ? 20 : 40} color="#39ff14" />
      <Stars />
      <SecondaryStars />
      <AccentStars />
    </Canvas>
  )
} 