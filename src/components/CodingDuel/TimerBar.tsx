import React from 'react';
import { motion } from 'framer-motion';

interface TimerBarProps {
  elapsed: number; // seconds
  timeLimit: number; // seconds
  testsPassed: number;
  testsTotal: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ elapsed, timeLimit, testsPassed, testsTotal }) => {
  const remaining = Math.max(0, timeLimit - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = Math.max(0, (remaining / timeLimit) * 100);
  const isLow = remaining < 30;

  return (
    <div className="flex items-center gap-4 px-4 py-2">
      <div className="flex-1">
        <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-primary'}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <span className={`font-mono text-sm font-semibold tabular-nums ${isLow ? 'text-red-500' : 'text-foreground'}`}>
        {minutes}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground">
        {testsPassed}/{testsTotal} passed
      </span>
    </div>
  );
};

export default TimerBar;
