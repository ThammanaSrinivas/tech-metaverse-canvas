import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CommitNodeProps {
  position: [number, number, number];
  color: string;
  size?: number;
  isSelected?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
}

const CommitNode: React.FC<CommitNodeProps> = ({
  position,
  color,
  size = 0.15,
  isSelected = false,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.4 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 5
      );
    }
    if (glowRef.current) {
      glowRef.current.scale.lerp(
        new THREE.Vector3(
          hovered || isSelected ? 2.5 : 1.8,
          hovered || isSelected ? 2.5 : 1.8,
          hovered || isSelected ? 2.5 : 1.8
        ),
        delta * 5
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
          emissiveIntensity={hovered || isSelected ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
};

export default CommitNode;
