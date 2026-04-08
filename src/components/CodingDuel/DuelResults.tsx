import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import type { TestResult } from '@/hooks/useCodeExecution';
import type { Challenge } from '@/data/challenges';
import ShareButton from './ShareButton';

interface DuelResultsProps {
  challenge: Challenge;
  results: TestResult[];
  elapsedMs: number;
  onSubmitScore: (alias: string) => void;
  onPlayAgain: () => void;
  score: number;
}

const DuelResults: React.FC<DuelResultsProps> = ({
  challenge,
  results,
  elapsedMs,
  onSubmitScore,
  onPlayAgain,
  score,
}) => {
  const [alias, setAlias] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const testsPassed = results.filter((r) => r.passed).length;
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);

  const handleSubmit = () => {
    if (!alias.trim()) return;
    onSubmitScore(alias.trim());
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center space-y-5"
    >
      {/* Capture area — everything inside this div becomes the screenshot */}
      <div ref={captureRef} className="flex flex-col items-center text-center p-6 space-y-5 rounded-xl">
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <Trophy className="w-10 h-10 text-primary" />
        </div>

        <div>
          <h3 className="text-2xl font-bold text-foreground mb-1">Duel Complete!</h3>
          <p className="text-muted-foreground">{challenge.title}</p>
        </div>

        <div className="text-5xl font-bold text-primary tabular-nums">{Math.round(score)}</div>
        <p className="text-sm text-muted-foreground -mt-3">out of 100</p>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <div>
            <span className="block text-lg font-semibold text-foreground">{testsPassed}/{results.length}</span>
            Tests Passed
          </div>
          <div>
            <span className="block text-lg font-semibold text-foreground">
              {minutes}:{String(seconds).padStart(2, '0')}
            </span>
            Time
          </div>
        </div>
      </div>

      {/* Submit to leaderboard (outside capture area) */}
      {!submitted ? (
        <div className="flex items-center gap-2 w-full max-w-xs">
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Your alias"
            maxLength={20}
            className="flex-1 px-3 py-2 rounded-lg border border-primary/20 bg-background/50 text-foreground text-sm outline-none focus:border-primary/50 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={!alias.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-all"
          >
            Save
          </button>
        </div>
      ) : (
        <p className="text-sm text-green-500">Score saved!</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 text-foreground hover:bg-primary/10 transition-all text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
        <ShareButton
          captureRef={captureRef}
          challengeTitle={challenge.title}
          score={score}
          timeMs={elapsedMs}
        />
      </div>
    </motion.div>
  );
};

export default DuelResults;
