import { useState, useCallback, useEffect } from 'react';

export interface LeaderboardEntry {
  alias: string;
  challengeId: string;
  score: number;
  timeMs: number;
  testsPassed: number;
  testsTotal: number;
  createdAt: string;
}

const STORAGE_KEY = 'duel-leaderboard';

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => loadLeaderboard());

  useEffect(() => {
    setEntries(loadLeaderboard());
  }, []);

  const addEntry = useCallback((entry: LeaderboardEntry) => {
    setEntries((prev) => {
      const updated = [...prev, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 50); // keep top 50
      saveLeaderboard(updated);
      return updated;
    });
  }, []);

  const getEntriesForChallenge = useCallback(
    (challengeId: string) => {
      return entries
        .filter((e) => e.challengeId === challengeId)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    },
    [entries]
  );

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  return { entries, addEntry, getEntriesForChallenge, clearAll };
}
