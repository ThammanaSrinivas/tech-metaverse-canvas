import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const NetworkNodes: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const particlesPosition = useMemo(() => {
    // Reduced particle count: 1000 → 150 on mobile, 300 on desktop
    const particleCount = isMobile ? 150 : 300;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * (isMobile ? 12 : 20);
      positions[i * 3 + 1] = (Math.random() - 0.5) * (isMobile ? 12 : 20);
      positions[i * 3 + 2] = (Math.random() - 0.5) * (isMobile ? 12 : 20);
    }
    
    return positions;
  }, [isMobile]);

  useFrame((state) => {
    if (ref.current) {
      const speedMultiplier = isMobile ? 0.3 : 1;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1 * speedMultiplier) * 0.1;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15 * speedMultiplier) * 0.1;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05 * speedMultiplier) * 0.1;
    }
  });

  // Don't render on very low-end devices
  if (isMobile && window.innerWidth < 480) {
    return null;
  }

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f5ff"
        size={isMobile ? 0.06 : 0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={isMobile ? 0.6 : 0.8}
      />
    </Points>
  );
};

const InteractiveParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const particlesPosition = useMemo(() => {
    // Reduced particle count: 200 → 50 on mobile, 100 on desktop
    const particleCount = isMobile ? 50 : 100;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * (isMobile ? 6 : 8);
      positions[i * 3 + 1] = (Math.random() - 0.5) * (isMobile ? 6 : 8);
      positions[i * 3 + 2] = (Math.random() - 0.5) * (isMobile ? 6 : 8);
    }
    
    return positions;
  }, [isMobile]);

  useEffect(() => {
    // Only add mouse tracking on desktop
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: -(e.clientY / window.innerHeight) * 2 + 1,
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  useFrame((state) => {
    if (ref.current) {
      const speedMultiplier = isMobile ? 0.3 : 1;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2 * speedMultiplier) * 0.1;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 * speedMultiplier) * 0.1;
      
      // Interactive movement based on mouse - only on desktop
      if (!isMobile) {
        ref.current.position.x = mousePosition.x * 0.5;
        ref.current.position.y = mousePosition.y * 0.5;
      }
    }
  });

  // Don't render on very low-end devices
  if (isMobile && window.innerWidth < 480) {
    return null;
  }

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ff0066"
        size={isMobile ? 0.08 : 0.1}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={isMobile ? 0.7 : 0.9}
      />
    </Points>
  );
};

const Scene3D: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render 3D scene on very low-end devices
  if (isMobile && window.innerWidth < 480) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ 
          position: [0, 0, isMobile ? 8 : 10], 
          fov: isMobile ? 60 : 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: !isMobile, // Disable antialiasing on mobile for performance
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={isMobile ? 1 : window.devicePixelRatio} // Reduce pixel ratio on mobile
        performance={{ min: isMobile ? 0.5 : 0.8 }} // Lower performance threshold on mobile
      >
        <ambientLight intensity={isMobile ? 0.3 : 0.5} />
        <pointLight position={[10, 10, 10]} intensity={isMobile ? 0.5 : 1} />
        <pointLight position={[-10, -10, -10]} intensity={isMobile ? 0.3 : 0.5} />
        
        <NetworkNodes />
        <InteractiveParticles />
        
        {/* Disable orbit controls on mobile for better performance */}
        {!isMobile && (
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
        
        {/* Environment for better lighting */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default Scene3D;
