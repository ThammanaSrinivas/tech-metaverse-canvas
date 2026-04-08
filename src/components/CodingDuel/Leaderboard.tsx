import React from 'react';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/hooks/useLeaderboard';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  challengeTitle: string;
}

const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, challengeTitle }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No scores yet for {challengeTitle}. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto px-1">
      <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        Top Scores — {challengeTitle}
      </h4>
      {entries.map((entry, i) => (
        <div
          key={`${entry.alias}-${entry.createdAt}`}
          className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/10"
        >
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold w-6 text-center ${medalColors[i] || 'text-muted-foreground'}`}>
              {i + 1}
            </span>
            <span className="text-sm font-medium text-foreground">{entry.alias}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {entry.testsPassed}/{entry.testsTotal}
            </span>
            <span className="font-semibold text-primary tabular-nums">{Math.round(entry.score)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
