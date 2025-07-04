import React, { useEffect, useState, useRef, useMemo } from 'react';
import { performanceUtils } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const ParticleEffect: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const { capabilities, recommendations } = useMemo(() => {
    const cap = performanceUtils.getDeviceCapabilities();
    const rec = performanceUtils.getPerformanceRecommendations();
    return { capabilities: cap, recommendations: rec };
  }, []);

  useEffect(() => {
    // Use performance recommendations to determine if particles should render
    if (recommendations.reduceParticles && capabilities.screenWidth < 480) {
      return; // Don't render particles on very low-end devices
    }

    setIsMobile(capabilities.isMobile);

    // Create initial particles with adaptive count based on device capabilities
    let particleCount;
    if (capabilities.screenWidth < 480) {
      particleCount = 8;
    } else if (capabilities.isMobile) {
      particleCount = 12;
    } else if (capabilities.isLowEnd) {
      particleCount = 20;
    } else {
      particleCount = 25;
    }
    const initialParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5, // Smaller particles
      speedX: (Math.random() - 0.5) * 0.3, // Slower movement
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.2, // Lower opacity
      color: ['#00f5ff', '#00ff88', '#39ff14'][Math.floor(Math.random() * 3)]
    }));

    setParticles(initialParticles);

    // Optimized animation loop using requestAnimationFrame
    const animate = (currentTime: number) => {
      // Adaptive FPS based on device capabilities
      let targetFPS;
      if (capabilities.isLowEnd || capabilities.isMobile) {
        targetFPS = 24; // Lower FPS for better performance
      } else {
        targetFPS = 45; // Moderate FPS for smooth animation
      }
      const frameInterval = 1000 / targetFPS;
      
      if (currentTime - lastTimeRef.current >= frameInterval) {
        setParticles(prevParticles => 
          prevParticles.map(particle => {
            let newX = particle.x + particle.speedX;
            let newY = particle.y + particle.speedY;

            // Bounce off edges
            if (newX <= 0 || newX >= window.innerWidth) {
              particle.speedX *= -1;
              newX = particle.x + particle.speedX;
            }
            if (newY <= 0 || newY >= window.innerHeight) {
              particle.speedY *= -1;
              newY = particle.y + particle.speedY;
            }

            return {
              ...particle,
              x: newX,
              y: newY,
            };
          })
        );
        lastTimeRef.current = currentTime;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [capabilities, recommendations]);

  // Don't render particles based on performance recommendations
  if (recommendations.reduceParticles && capabilities.screenWidth < 480) {
    return null;
  }

  // Disable particles if user prefers reduced motion
  if (capabilities.hasReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 1.5}px ${particle.color}`,
            // Use transform3d for hardware acceleration
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect; 