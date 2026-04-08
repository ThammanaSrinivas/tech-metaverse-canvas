import React from 'react';

interface TimelineScrubberProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({ value, max, onChange, label }) => {
  return (
    <div className="w-full px-4">
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-primary/20 accent-primary
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background"
        aria-label={label || 'Timeline scrubber'}
      />
      {label && (
        <p className="text-xs text-muted-foreground text-center mt-1">{label}</p>
      )}
    </div>
  );
};

export default TimelineScrubber;
