import React, { useEffect, useState, useRef } from 'react';

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

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Create initial particles with reduced count on mobile
    const particleCount = isMobile ? 15 : 30; // Reduced from 50
    const initialParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5, // Smaller particles
      speedX: (Math.random() - 0.5) * 0.3, // Slower movement
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.2, // Lower opacity
      color: ['#00f5ff', '#bf00ff', '#ff0066', '#00ff88'][Math.floor(Math.random() * 4)]
    }));

    setParticles(initialParticles);

    // Optimized animation loop using requestAnimationFrame
    const animate = (currentTime: number) => {
      // Throttle to 30fps on mobile, 60fps on desktop
      const targetFPS = isMobile ? 30 : 60;
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
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  // Don't render particles on very low-end devices
  if (isMobile && window.innerWidth < 480) {
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