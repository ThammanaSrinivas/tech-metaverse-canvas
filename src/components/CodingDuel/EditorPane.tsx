import React, { useRef, useEffect } from 'react';
import { renderHighlightedCode } from '@/lib/codeHighlight';
import { useTheme } from '@/contexts/ThemeContext';

interface EditorPaneProps {
  code: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

const EditorPane: React.FC<EditorPaneProps> = ({ code, onChange, disabled = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Sync scroll between textarea and pre
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Handle Tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`text-xs font-medium px-3 py-2 border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
        Your Solution
      </div>
      <div className="relative flex-1 min-h-0">
        {/* Syntax highlight overlay */}
        <pre
          ref={preRef}
          className={`absolute inset-0 p-3 font-mono text-sm overflow-hidden pointer-events-none whitespace-pre-wrap break-words ${
            isDark ? 'text-gray-300' : 'text-gray-800'
          }`}
          aria-hidden="true"
        >
          <code>{renderHighlightedCode(code, isDark)}</code>
        </pre>
        {/* Actual textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          className={`absolute inset-0 w-full h-full p-3 font-mono text-sm resize-none outline-none bg-transparent caret-primary ${
            isDark ? 'text-transparent' : 'text-transparent'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Code editor"
        />
      </div>
    </div>
  );
};

export default EditorPane;
