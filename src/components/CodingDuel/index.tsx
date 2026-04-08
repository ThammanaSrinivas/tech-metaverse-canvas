import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { Challenge } from '@/data/challenges';
import ChallengeSelector from './ChallengeSelector';
import DuelArena from './DuelArena';
import TimerBar from './TimerBar';
import TestRunner from './TestRunner';
import DuelResults from './DuelResults';
import Leaderboard from './Leaderboard';

type DuelState = 'SELECTING' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED' | 'LEADERBOARD';

interface CodingDuelProps {
  isOpen: boolean;
  onClose: () => void;
}

function computeScore(
  testsPassed: number,
  testsTotal: number,
  elapsedMs: number,
  timeLimitMs: number
): number {
  const accuracy = (testsPassed / testsTotal) * 70;
  const timeFactor = Math.max(0, 1 - elapsedMs / timeLimitMs) * 30;
  return accuracy + timeFactor;
}

const CodingDuel: React.FC<CodingDuelProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [state, setState] = useState<DuelState>('SELECTING');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { results, runTests, clearResults } = useCodeExecution();
  const { addEntry, getEntriesForChallenge } = useLeaderboard();

  const testsPassed = results.filter((r) => r.passed).length;
  const elapsedMs = elapsed * 1000;

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setState('SELECTING');
      setChallenge(null);
      setCode('');
      setCountdown(3);
      setElapsed(0);
      clearResults();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, clearResults]);

  // Countdown
  useEffect(() => {
    if (state !== 'COUNTDOWN') return;
    if (countdown <= 0) {
      setState('PLAYING');
      setStartTime(Date.now());
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, countdown]);

  // Game timer
  useEffect(() => {
    if (state !== 'PLAYING' || !challenge) return;
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(secs);
      if (secs >= challenge.timeLimit) {
        setState('FINISHED');
        // Auto-run tests on timeout
        runTests(code, challenge.functionName, challenge.testCases);
      }
    }, 250);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, challenge, startTime, code, runTests]);

  const handleSelectChallenge = useCallback((c: Challenge) => {
    setChallenge(c);
    setCode(c.starterCode);
    setCountdown(3);
    setElapsed(0);
    clearResults();
    setState('COUNTDOWN');
  }, [clearResults]);

  const handleSubmit = useCallback(() => {
    if (!challenge) return;
    runTests(code, challenge.functionName, challenge.testCases);
    setState('FINISHED');
    if (timerRef.current) clearInterval(timerRef.current);
  }, [challenge, code, runTests]);

  const handleSubmitScore = useCallback(
    (alias: string) => {
      if (!challenge) return;
      const score = computeScore(
        testsPassed,
        challenge.testCases.length,
        elapsedMs,
        challenge.timeLimit * 1000
      );
      addEntry({
        alias,
        challengeId: challenge.id,
        score,
        timeMs: elapsedMs,
        testsPassed,
        testsTotal: challenge.testCases.length,
        createdAt: new Date().toISOString(),
      });
    },
    [challenge, testsPassed, elapsedMs, addEntry]
  );

  const handlePlayAgain = useCallback(() => {
    setState('SELECTING');
    setChallenge(null);
    setCode('');
    clearResults();
  }, [clearResults]);

  const score = challenge
    ? computeScore(testsPassed, challenge.testCases.length, elapsedMs, challenge.timeLimit * 1000)
    : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
            isDark
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Swords className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Coding Duel</h2>
                {challenge && state !== 'SELECTING' && (
                  <p className="text-xs text-muted-foreground">{challenge.title}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {state === 'SELECTING' && (
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Choose a challenge and race against a pre-recorded solution!
                </p>
                <ChallengeSelector onSelect={handleSelectChallenge} />
              </div>
            )}

            {state === 'COUNTDOWN' && (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-7xl font-bold text-primary"
                >
                  {countdown > 0 ? countdown : 'GO!'}
                </motion.div>
              </div>
            )}

            {state === 'PLAYING' && challenge && (
              <>
                <TimerBar
                  elapsed={elapsed}
                  timeLimit={challenge.timeLimit}
                  testsPassed={testsPassed}
                  testsTotal={challenge.testCases.length}
                />
                <div className="flex-1 flex flex-col min-h-0 px-4 pb-2">
                  <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
                  <div className="flex-1 min-h-0" style={{ minHeight: '300px' }}>
                    <DuelArena
                      keystrokes={challenge.keystrokes}
                      isPlaying={true}
                      code={code}
                      onCodeChange={setCode}
                    />
                  </div>
                </div>
                <TestRunner results={results} totalTests={challenge.testCases.length} />
                <div className="flex justify-end px-4 py-3 border-t border-primary/10">
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    Run & Submit
                  </button>
                </div>
              </>
            )}

            {state === 'FINISHED' && challenge && (
              <div className="p-4 space-y-6">
                <DuelResults
                  challenge={challenge}
                  results={results}
                  elapsedMs={elapsedMs}
                  score={score}
                  onSubmitScore={handleSubmitScore}
                  onPlayAgain={handlePlayAgain}
                />
                <div className="border-t border-primary/10 pt-4">
                  <button
                    onClick={() => setState('LEADERBOARD')}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            )}

            {state === 'LEADERBOARD' && challenge && (
              <div className="p-4 space-y-4">
                <Leaderboard
                  entries={getEntriesForChallenge(challenge.id)}
                  challengeTitle={challenge.title}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setState('FINISHED')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Results
                  </button>
                  <button
                    onClick={handlePlayAgain}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CodingDuel;
