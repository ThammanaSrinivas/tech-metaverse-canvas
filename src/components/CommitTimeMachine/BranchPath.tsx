import React, { useMemo } from 'react';
import * as THREE from 'three';

interface BranchPathProps {
  points: [number, number, number][];
  color: string;
  tubeRadius?: number;
}

const BranchPath: React.FC<BranchPathProps> = ({ points, color, tubeRadius = 0.03 }) => {
  const curve = useMemo(() => {
    if (points.length < 2) return null;
    const vectors = points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.5);
  }, [points]);

  const geometry = useMemo(() => {
    if (!curve) return null;
    const segments = Math.min(points.length * 8, 128);
    return new THREE.TubeGeometry(curve, segments, tubeRadius, 8, false);
  }, [curve, tubeRadius, points.length]);

  if (!geometry || !curve) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.4}
        metalness={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

export default BranchPath;
