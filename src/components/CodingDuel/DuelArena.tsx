import React from 'react';
import ReplayPane from './ReplayPane';
import EditorPane from './EditorPane';

interface DuelArenaProps {
  keystrokes: string[];
  isPlaying: boolean;
  code: string;
  onCodeChange: (code: string) => void;
  disabled?: boolean;
}

const DuelArena: React.FC<DuelArenaProps> = ({
  keystrokes,
  isPlaying,
  code,
  onCodeChange,
  disabled = false,
}) => {

  return (
    <div className={`flex flex-col md:flex-row flex-1 min-h-0 rounded-lg overflow-hidden border border-gray-200 bg-white/50`}>
      {/* Left — Replay */}
      <div className={`flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-gray-200`}>
        <ReplayPane keystrokes={keystrokes} isPlaying={isPlaying} />
      </div>
      {/* Right — Editor */}
      <div className="flex-1 flex flex-col min-h-0">
        <EditorPane code={code} onChange={onCodeChange} disabled={disabled} />
      </div>
    </div>
  );
};

export default DuelArena;
