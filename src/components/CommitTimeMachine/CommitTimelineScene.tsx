import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BranchPath from './BranchPath';
import CommitNode from './CommitNode';
import TimelineCamera from './TimelineCamera';
import { languageColors } from '@/lib/github';
import type { GitHubCommit } from '@/lib/github';

interface CommitTimelineSceneProps {
  commits: GitHubCommit[];
  repoLanguage: string | null;
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
  const spacing = 12 / Math.max(commits.length - 1, 1);
  return commits.map((_, i) => {
    const x = -6 + i * spacing;
    const z = Math.sin(i * 0.4) * 0.5;
    return [x, yOffset, z] as [number, number, number];
  });
}

const CommitTimelineScene: React.FC<CommitTimelineSceneProps> = ({
  commits,
  repoLanguage,
  selectedIndex,
  isExploring,
  progress,
  onCommitHover,
  onCommitClick,
}) => {
  const color = repoLanguage
    ? languageColors[repoLanguage] || '#6366f1'
    : '#6366f1';

  const points = useMemo(() => buildCurvePoints(commits, 0), [commits]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="w-full h-[320px] md:h-[420px] rounded-xl overflow-hidden border border-primary/20">
      <Canvas
        camera={{ position: [0, 1, 8], fov: 50 }}
        dpr={isMobile ? 1 : [1, 2]}
        gl={{ antialias: !isMobile }}
      >
        <ambientLight intensity={0.4} />
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
            color={color}
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
