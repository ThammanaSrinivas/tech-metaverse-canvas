import React, { useState, useEffect, useRef } from 'react';
import { renderHighlightedCode } from '@/lib/codeHighlight';
import { useTheme } from '@/contexts/ThemeContext';

interface ReplayPaneProps {
  keystrokes: string[];
  isPlaying: boolean;
  speed?: number; // ms per keystroke chunk
}

const ReplayPane: React.FC<ReplayPaneProps> = ({ keystrokes, isPlaying, speed = 800 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!isPlaying) return;
    setDisplayedIndex(0);
  }, [isPlaying, keystrokes]);

  useEffect(() => {
    if (!isPlaying || displayedIndex >= keystrokes.length) return;
    const timer = setTimeout(() => {
      setDisplayedIndex((prev) => prev + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [displayedIndex, isPlaying, keystrokes.length, speed]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedIndex]);

  const displayedCode = keystrokes.slice(0, displayedIndex).join('');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`text-xs font-medium px-3 py-2 border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
        Opponent (Replay)
      </div>
      <pre
        ref={containerRef}
        className={`flex-1 p-3 font-mono text-sm overflow-auto min-h-0 ${isDark ? 'bg-gray-900/80 text-gray-300' : 'bg-gray-50 text-gray-800'}`}
      >
        <code>{renderHighlightedCode(displayedCode, isDark)}</code>
        <span className="animate-pulse text-primary">|</span>
      </pre>
    </div>
  );
};

export default ReplayPane;
