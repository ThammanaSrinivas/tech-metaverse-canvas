import React from 'react';

export const renderHighlightedCode = (code: string, isDark: boolean): React.ReactNode => {
  return code.split('\n').map((line, idx) => {
    const parts: React.ReactNode[] = [];
    let partIndex = 0;

    const addHighlightedPart = (text: string, className?: string) => {
      if (className) {
        parts.push(React.createElement('span', { key: `${idx}-${partIndex++}`, className }, text));
      } else {
        parts.push(text);
      }
    };

    const tokens = line.split(/(\s+|[<>{}();,.]|\b(?:import|export|const|let|var|function|interface|type|React|useState|useEffect|from|motion|div|h3|p|return|if|else|for|while|new|class|extends|implements|async|await|try|catch|throw|switch|case|break|default|true|false|null|undefined)\b|'[^']*'|"[^"]*"|`[^`]*`|\d+\.?\d*)/g);

    tokens.forEach((token) => {
      if (!token) return;

      if (['import', 'export', 'const', 'let', 'var', 'function', 'interface', 'type', 'from', 'return', 'if', 'else', 'for', 'while', 'new', 'class', 'extends', 'implements', 'async', 'await', 'try', 'catch', 'throw', 'switch', 'case', 'break', 'default'].includes(token)) {
        addHighlightedPart(token, isDark ? 'text-purple-400' : 'text-purple-600');
      } else if (['React', 'useState', 'useEffect'].includes(token)) {
        addHighlightedPart(token, isDark ? 'text-purple-400' : 'text-purple-600');
      } else if (token.match(/^['"`][^'"`]*['"`]$/)) {
        addHighlightedPart(token, isDark ? 'text-green-400' : 'text-green-600');
      } else if (['true', 'false', 'null', 'undefined'].includes(token)) {
        addHighlightedPart(token, isDark ? 'text-orange-400' : 'text-orange-600');
      } else if (['motion', 'div', 'h3', 'p'].includes(token)) {
        addHighlightedPart(token, isDark ? 'text-blue-400' : 'text-blue-600');
      } else if (token.match(/^\d+\.?\d*$/)) {
        addHighlightedPart(token, isDark ? 'text-yellow-400' : 'text-yellow-600');
      } else if (token === '<' || token === '>') {
        addHighlightedPart(token, isDark ? 'text-blue-400' : 'text-blue-600');
      } else if (['{', '}', '(', ')', ';', ',', '.'].includes(token)) {
        addHighlightedPart(token, isDark ? 'text-gray-300' : 'text-gray-700');
      } else {
        parts.push(token);
      }
    });

    return React.createElement('span', { key: idx }, ...parts, '\n');
  });
};
