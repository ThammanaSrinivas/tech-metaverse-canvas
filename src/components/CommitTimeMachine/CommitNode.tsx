import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CommitNodeProps {
  position: [number, number, number];
  color: string;
  size?: number;
  isSelected?: boolean;
  /** The newest commit breathes, like a live cursor. */
  isLatest?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
}

const CommitNode: React.FC<CommitNodeProps> = ({
  position,
  color,
  size = 0.15,
  isSelected = false,
  isLatest = false,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }, delta) => {
    // Clamp: a long frame (tab resumed, slow device) would otherwise overshoot the lerp and blow the node up.
    const k = Math.min(1, delta * 5);
    if (meshRef.current) {
      const pulse = isLatest ? 1 + Math.sin(clock.elapsedTime * 2) * 0.15 : 1;
      const targetScale = (hovered || isSelected ? 1.5 : 1) * pulse;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        k
      );
    }
    if (glowRef.current) {
      glowRef.current.scale.lerp(
        new THREE.Vector3(
          hovered || isSelected ? 2.5 : 1.8,
          hovered || isSelected ? 2.5 : 1.8,
          hovered || isSelected ? 2.5 : 1.8
        ),
        k
      );
    }
  });

  return (
    <group position={position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered || isSelected ? 0.3 : 0.1}
        />
      </mesh>
      {/* Core sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onPointerOver?.();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onPointerOut?.();
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 0.7 : 0.35}
          roughness={0.45}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};

export default CommitNode;
