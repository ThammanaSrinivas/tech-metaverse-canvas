import React from 'react';
import { VolumeX } from 'lucide-react';
import { useSound } from '@/lib/sound';

/**
 * The only way sound starts: the visitor presses this. Off shows a muted speaker; on shows three
 * breathing bars in the accent colour, so it is obvious at a glance that sound is live.
 */
const SoundToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [on, toggle] = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'}
      data-cursor={on ? 'sound off' : 'sound on'}
      className={`flex h-10 w-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      {on ? (
        <span className="zen-eq flex h-3.5 items-end gap-[3px]" aria-hidden>
          <span className="h-full w-[3px] rounded-full bg-primary" />
          <span className="h-full w-[3px] rounded-full bg-primary" />
          <span className="h-full w-[3px] rounded-full bg-primary" />
        </span>
      ) : (
        <VolumeX className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
};

export default SoundToggle;
