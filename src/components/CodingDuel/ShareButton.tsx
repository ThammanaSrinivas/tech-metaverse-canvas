import { Share2, Camera, Check, Loader2 } from 'lucide-react';
import React, { useState, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';

interface ShareButtonProps {
  challengeTitle: string;
  score: number;
  timeMs: number;
  /** Ref to the DOM element to capture as screenshot */
  captureRef: React.RefObject<HTMLElement>;
}

const ShareButton: React.FC<ShareButtonProps> = ({ challengeTitle, score, timeMs, captureRef }) => {
  const [status, setStatus] = useState<'idle' | 'capturing' | 'done'>('idle');

  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);

  const handleShare = useCallback(async () => {
    if (!captureRef.current) return;

    setStatus('capturing');

    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(captureRef.current).backgroundColor || '#111',
      });

      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `coding-duel-${challengeTitle.toLowerCase().replace(/\s+/g, '-')}.png`, {
        type: 'image/png',
      });

      const shareText = `I scored ${Math.round(score)}/100 on "${challengeTitle}" in ${minutes}:${String(seconds).padStart(2, '0')}! Can you beat me?`;

      // Try Web Share API with file
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Coding Duel Result',
          text: shareText,
          files: [file],
        });
        setStatus('done');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }

      // Fallback: download the screenshot
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also copy text to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        // clipboard not available
      }

      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      // Screenshot failed, fall back to text share
      const shareText = `I scored ${Math.round(score)}/100 on "${challengeTitle}" in ${minutes}:${String(seconds).padStart(2, '0')}! Can you beat me?`;
      try {
        if (navigator.share) {
          await navigator.share({ title: 'Coding Duel Result', text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
        }
      } catch {
        // nothing we can do
      }
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }, [captureRef, challengeTitle, score, minutes, seconds]);

  return (
    <button
      onClick={handleShare}
      disabled={status === 'capturing'}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-sm disabled:opacity-60"
    >
      {status === 'capturing' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> Capturing...
        </>
      ) : status === 'done' ? (
        <>
          <Check className="w-4 h-4" /> Saved!
        </>
      ) : (
        <>
          <Camera className="w-4 h-4" /> Share Screenshot
        </>
      )}
    </button>
  );
};

export default ShareButton;
