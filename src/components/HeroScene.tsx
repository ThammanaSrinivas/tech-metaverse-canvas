"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import type * as THREE from "three"
import { performanceUtils } from '@/lib/utils'

function Stars(props: any) {
  const ref = useRef<THREE.Points>(null!)
  const sphere = useMemo(() => {
    // Use performance utils for better device detection
    const capabilities = performanceUtils.getDeviceCapabilities();
    const recommendations = performanceUtils.getPerformanceRecommendations();
    
    let particleCount;
    if (capabilities.screenWidth < 480) {
      particleCount = 800; // Very small screens
    } else if (capabilities.isMobile) {
      particleCount = 1200; // Mobile devices
    } else if (capabilities.isLowEnd) {
      particleCount = 2500; // Low-end desktops
    } else {
      particleCount = 4000; // High-end devices
    }
    
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
  }, [])

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
  const sphere = useMemo(() => {
    const capabilities = performanceUtils.getDeviceCapabilities();
    
    let particleCount;
    if (capabilities.screenWidth < 480) {
      particleCount = 500; // Very small screens
    } else if (capabilities.isMobile) {
      particleCount = 800; // Mobile devices
    } else if (capabilities.isLowEnd) {
      particleCount = 1500; // Low-end desktops
    } else {
      particleCount = 2500; // High-end devices
    }
    
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
  }, [])

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
  const sphere = useMemo(() => {
    const capabilities = performanceUtils.getDeviceCapabilities();
    
    let particleCount;
    if (capabilities.screenWidth < 480) {
      particleCount = 200; // Very small screens
    } else if (capabilities.isMobile) {
      particleCount = 400; // Mobile devices
    } else if (capabilities.isLowEnd) {
      particleCount = 800; // Low-end desktops
    } else {
      particleCount = 1500; // High-end devices
    }
    
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
  }, [])

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
  const { capabilities, recommendations } = useMemo(() => {
    const cap = performanceUtils.getDeviceCapabilities();
    const rec = performanceUtils.getPerformanceRecommendations();
    return { capabilities: cap, recommendations: rec };
  }, []);
  
  // Don't render 3D scene on very low-end devices
  if (recommendations.disable3D) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-primary/5 to-background/10" />
    );
  }
  
  return (
    <Canvas 
      camera={{ position: [0, 0, 8] }}
      gl={{
        antialias: !capabilities.isMobile && !capabilities.isLowEnd,
        pixelRatio: Math.min(capabilities.pixelRatio, capabilities.isMobile ? 1 : 2),
        alpha: true,
        premultipliedAlpha: true,
        powerPreference: capabilities.isMobile ? 'low-power' : 'high-performance'
      }}
      performance={{ 
        min: capabilities.isMobile ? 0.3 : 0.5,
        max: capabilities.isLowEnd ? 0.7 : 1
      }}
      frameloop={capabilities.hasReducedMotion ? 'never' : 'always'}
    >
      <ambientLight intensity={capabilities.isMobile ? 0.2 : 0.4} />
      <pointLight 
        position={[10, 10, 10]} 
        intensity={capabilities.isMobile ? 40 : 100} 
        color="#00f5ff" 
      />
      <pointLight 
        position={[-10, -10, -10]} 
        intensity={capabilities.isMobile ? 20 : 50} 
        color="#00f5ff" 
      />
      <pointLight 
        position={[0, 0, 10]} 
        intensity={capabilities.isMobile ? 15 : 30} 
        color="#39ff14" 
      />
      <Stars />
      {!capabilities.isLowEnd && <SecondaryStars />}
      {!capabilities.isMobile && !capabilities.isLowEnd && <AccentStars />}
    </Canvas>
  )
} 