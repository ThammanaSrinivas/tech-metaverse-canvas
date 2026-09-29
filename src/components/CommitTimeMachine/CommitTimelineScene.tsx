import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BranchPath from './BranchPath';
import CommitNode from './CommitNode';
import TimelineCamera from './TimelineCamera';
import type { GitHubCommit } from '@/lib/github';

interface CommitTimelineSceneProps {
  commits: GitHubCommit[];
  color: string;
  selectedIndex: number;
  isExploring: boolean;
  progress: number;
  onCommitHover: (index: number | null) => void;
  onCommitClick: (index: number) => void;
}

function buildCurvePoints(
  commits: GitHubCommit[],
  yOffset: number
): [number, number, number][] {
  if (commits.length === 0) return [];
  // A loose helix: time runs left → right, the path breathes in y and z so the camera has depth to fly through.
  const spacing = 14 / Math.max(commits.length - 1, 1);
  return commits.map((_, i) => {
    const x = -7 + i * spacing;
    const y = yOffset + Math.sin(i * 0.35) * 0.6;
    const z = Math.cos(i * 0.35) * 1.2;
    return [x, y, z] as [number, number, number];
  });
}

const CommitTimelineScene: React.FC<CommitTimelineSceneProps> = ({
  commits,
  color,
  selectedIndex,
  isExploring,
  progress,
  onCommitHover,
  onCommitClick,
}) => {
  const points = useMemo(() => buildCurvePoints(commits, 0), [commits]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div data-cursor="drag" className="h-[320px] w-full overflow-hidden rounded-[20px] border bg-background md:h-[420px]">
      <Canvas
        camera={{ position: [0, 2.2, 8.5], fov: 50 }}
        dpr={isMobile ? 1 : [1, 2]}
        gl={{ antialias: !isMobile }}
      >
        <ambientLight intensity={0.6} />
        <gridHelper args={[20, 20, color, color]} position={[0, -1.2, 0]} material-transparent material-opacity={0.08} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 3, -3]} intensity={0.4} color={color} />

        <TimelineCamera
          points={points}
          progress={progress}
          isExploring={isExploring}
        />

        {points.length >= 2 && (
          <BranchPath points={points} color={color} />
        )}

        {points.map((pos, i) => (
          <CommitNode
            key={commits[i]?.sha || i}
            position={pos}
            color={selectedIndex === i ? '#FFC800' : color}
            isLatest={i === points.length - 1}
            isSelected={selectedIndex === i}
            onPointerOver={() => onCommitHover(i)}
            onPointerOut={() => onCommitHover(null)}
            onClick={() => onCommitClick(i)}
          />
        ))}

        {!isExploring && <OrbitControls enablePan={false} enableZoom={false} />}
      </Canvas>
    </div>
  );
};

export default CommitTimelineScene;
