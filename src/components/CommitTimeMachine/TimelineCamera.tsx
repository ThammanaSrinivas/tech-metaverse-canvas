import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface TimelineCameraProps {
  points: [number, number, number][];
  progress: number; // 0–1
  isExploring: boolean;
}

const TimelineCamera: React.FC<TimelineCameraProps> = ({ points, progress, isExploring }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 8));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  const curve = useMemo(() => {
    if (points.length < 2) return null;
    const vectors = points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.5);
  }, [points]);

  useFrame((_, delta) => {
    if (isExploring && curve) {
      const t = Math.max(0, Math.min(1, progress));
      const point = curve.getPointAt(t);
      targetPos.current.set(point.x, point.y + 1.5, point.z + 3);
      targetLook.current.copy(point);
    } else {
      // Default orbit-like view
      targetPos.current.set(0, 1, 8);
      targetLook.current.set(0, 0, 0);
    }

    camera.position.lerp(targetPos.current, delta * 2);
    const lookTarget = new THREE.Vector3();
    lookTarget.copy(camera.position).lerp(targetLook.current, 0.5);
    camera.lookAt(targetLook.current);
  });

  return null;
};

export default TimelineCamera;
