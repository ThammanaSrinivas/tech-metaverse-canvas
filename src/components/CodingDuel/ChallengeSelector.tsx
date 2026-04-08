import React from 'react';
import { motion } from 'framer-motion';
import { challenges } from '@/data/challenges';
import type { Challenge } from '@/data/challenges';

interface ChallengeSelectorProps {
  onSelect: (challenge: Challenge) => void;
}

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ChallengeSelector: React.FC<ChallengeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
      {challenges.map((challenge, i) => (
        <motion.button
          key={challenge.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => onSelect(challenge)}
          className="text-left p-5 rounded-xl border border-primary/20 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {challenge.title}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[challenge.difficulty]}`}
            >
              {challenge.difficulty}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {challenge.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{challenge.testCases.length} tests</span>
            <span>{Math.floor(challenge.timeLimit / 60)}:{String(challenge.timeLimit % 60).padStart(2, '0')} limit</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default ChallengeSelector;
