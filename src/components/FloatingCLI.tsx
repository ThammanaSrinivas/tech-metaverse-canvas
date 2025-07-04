import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, XCircle, Play, Code, TestTube, Rocket, BarChart3, Minus, Maximize2, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface CLIStep {
  id: number;
  title: string;
  command: string;
  output: string;
  status: 'pending' | 'running' | 'success' | 'error';
  icon: React.ReactNode;
  delay: number;
}

const mockCoverage = {
  lines: 94,
  statements: 95,
  functions: 93,
  branches: 95,
  components: 96,
  hooks: 94,
  utils: 95,
  tests: 94,
  accessibility: 93,
  performance: 94,
};

function getEffectiveCoverage(coverage: typeof mockCoverage): number {
  const values = Object.values(coverage);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
}

const renderHighlightedCode = (code: string, isDark: boolean): React.ReactNode => {
  return code.split('\n').map((line, idx) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partIndex = 0;
    
    // Helper function to add text parts with highlighting
    const addHighlightedPart = (text: string, className?: string) => {
      if (className) {
        parts.push(<span key={`${idx}-${partIndex++}`} className={className}>{text}</span>);
      } else {
        parts.push(text);
      }
    };
    
    // Process the line character by character for better control
    const tokens = remaining.split(/(\s+|[<>{}();,.]|\b(?:import|export|const|let|var|function|interface|type|React|useState|useEffect|from|motion|div|h3|p)\b|'[^']*'|"[^"]*"|\d+\.?\d*)/g);
    
    tokens.forEach((token, tokenIdx) => {
      if (!token) return;
      
      // Keywords
      if (['import', 'export', 'const', 'let', 'var', 'function', 'interface', 'type', 'React', 'useState', 'useEffect', 'from'].includes(token)) {
        addHighlightedPart(token, isDark ? 'text-purple-400' : 'text-purple-600');
      }
      // Strings
      else if (token.match(/^['"][^'"]*['"]$/)) {
        addHighlightedPart(token, isDark ? 'text-green-400' : 'text-green-600');
      }
      // JSX/HTML tags and React components
      else if (['motion', 'div', 'h3', 'p'].includes(token)) {
        addHighlightedPart(token, isDark ? 'text-blue-400' : 'text-blue-600');
      }
      // Numbers
      else if (token.match(/^\d+\.?\d*$/)) {
        addHighlightedPart(token, isDark ? 'text-yellow-400' : 'text-yellow-600');
      }
      // JSX angle brackets
      else if (token === '<' || token === '>') {
        addHighlightedPart(token, isDark ? 'text-blue-400' : 'text-blue-600');
      }
      // Braces and special characters
      else if (['{', '}', '(', ')', ';', ',', '.'].includes(token)) {
        addHighlightedPart(token, isDark ? 'text-gray-300' : 'text-gray-700');
      }
      // Regular text
      else {
        parts.push(token);
      }
    });
    
    return (
      <span key={idx}>
        {parts}
        {'\n'}
      </span>
    );
  });
};

interface FloatingCLIProps {
  testMode?: boolean;
}

const FloatingCLI: React.FC<FloatingCLIProps> = ({ testMode = false }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(testMode);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const cliRef = useRef<HTMLDivElement>(null);

  const steps: CLIStep[] = useMemo(() => [
    {
      id: 1,
      title: "Write Code",
      command: "vim src/components/Feature.tsx",
      output: `import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FeatureProps {
  title: string;
  description: string;
}

export const Feature: React.FC<FeatureProps> = ({ title, description }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="feature-card"
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
};`,
      status: 'success',
      icon: <Code className="w-4 h-4" />,
      delay: 2000,
    },
    {
      id: 2,
      title: "Run Unit & Functional Tests",
      command: "npm run test:coverage",
      output: `> vite_react_shadcn_ts@0.0.0 test:coverage
> vitest run --coverage --reporter=verbose

 ✓ src/lib/utils.test.ts (3 tests) 12ms
 ✓ src/components/__tests__/About.test.tsx (8 tests) 45ms
 ✓ src/components/__tests__/Contact.test.tsx (12 tests) 67ms
 ✓ src/components/__tests__/Hero.test.tsx (10 tests) 89ms
 ✓ src/components/__tests__/Projects.test.tsx (8 tests) 34ms
 ✓ src/components/__tests__/ThemeToggle.test.tsx (6 tests) 23ms
 ✓ src/contexts/__tests__/ThemeContext.test.tsx (4 tests) 18ms
 ✓ src/components/__tests__/FloatingCLI.test.tsx (6 tests) 41ms

Test Files  8 passed, 8 total
Tests       57 passed, 57 total
Snapshots   0 total
Time        3.2s

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   94.2% |    95.0% |   93.0% |   94.0% |                  
----------|---------|----------|---------|---------|-------------------`,
      status: 'error',
      icon: <TestTube className="w-4 h-4" />,
      delay: 3000,
    },
    {
      id: 3,
      title: "1 Test Failed",
      command: "npm test FloatingCLI.test.tsx",
      output: `> vite_react_shadcn_ts@0.0.0 test
> vitest FloatingCLI.test.tsx

 ✗ src/components/__tests__/FloatingCLI.test.tsx
   ✗ shows the first step initially
     TypeError: Cannot read property 'textContent' of null
       at hasStepText (FloatingCLI.test.tsx:15:8)
       at getByText (FloatingCLI.test.tsx:18:4)
       at Object.<anonymous> (FloatingCLI.test.tsx:12:6)

Test Files  0 passed, 1 failed
Tests       0 passed, 1 failed
Snapshots   0 total
Time        0.8s

FAIL src/components/__tests__/FloatingCLI.test.tsx
● shows the first step initially

  TypeError: Cannot read property 'textContent' of null

      at hasStepText (FloatingCLI.test.tsx:15:8)
      at getByText (FloatingCLI.test.tsx:18:4)
      at Object.<anonymous> (FloatingCLI.test.tsx:12:6)

  > 12 |     const stepNode = screen.getByText((content, node) => hasStepText(node));
  > 13 |     expect(stepNode).toBeInTheDocument();
  > 14 |     expect(screen.getByText(/\\$ vim src\\/components\\/Feature\\.tsx/)).toBeInTheDocument();
  > 15 |   });
  > 16 | });`,
      status: 'error',
      icon: <XCircle className="w-4 h-4" />,
      delay: 2500,
    },
    {
      id: 4,
      title: "Write Some Other Code",
      command: "vim src/components/FloatingCLI.tsx",
      output: `import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, XCircle, Play, Code, TestTube, Rocket, BarChart3, Minus, Maximize2, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface CLIStep {
  id: number;
  title: string;
  command: string;
  output: string;
  status: 'pending' | 'running' | 'success' | 'error';
  icon: React.ReactNode;
  delay: number;
}

const FloatingCLI: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);

  // Fixed test issue by using container.textContent
  const handleStepNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <motion.div className="floating-cli">
      {/* CLI content */}
    </motion.div>
  );
};

export default FloatingCLI;`,
      status: 'success',
      icon: <Code className="w-4 h-4" />,
      delay: 2000,
    },
    {
      id: 5,
      title: "Now All Tests Pass",
      command: "npm run test:all",
      output: `> vite_react_shadcn_ts@0.0.0 test:all
> npm run test:unit && npm run test:functional && npm run test:performance

 ✓ src/lib/utils.test.ts (3 tests) 12ms
 ✓ src/components/__tests__/About.test.tsx (8 tests) 45ms
 ✓ src/components/__tests__/Contact.test.tsx (12 tests) 67ms
 ✓ src/components/__tests__/Hero.test.tsx (10 tests) 89ms
 ✓ src/components/__tests__/Projects.test.tsx (8 tests) 34ms
 ✓ src/components/__tests__/ThemeToggle.test.tsx (6 tests) 23ms
 ✓ src/contexts/__tests__/ThemeContext.test.tsx (4 tests) 18ms
 ✓ src/components/__tests__/FloatingCLI.test.tsx (6 tests) 41ms

Test Files  8 passed, 8 total
Tests       57 passed, 57 total
Snapshots   0 total
Time        3.2s

Ran all test suites.`,
      status: 'success',
      icon: <CheckCircle className="w-4 h-4" />,
      delay: 2000,
    },
    {
      id: 6,
      title: "Build & Deploy",
      command: "npm run build",
      output: `> vite_react_shadcn_ts@0.0.0 build
> npm run test:all && npm run test:coverage && vite build

✓ All tests passed
✓ Coverage threshold met
✓ Built in 2.1s

> vite build

 ✓ src/lib/utils.test.ts (3 tests) 12ms
 ✓ src/components/__tests__/About.test.tsx (8 tests) 45ms
 ✓ src/components/__tests__/Contact.test.tsx (12 tests) 67ms
 ✓ src/components/__tests__/Hero.test.tsx (10 tests) 89ms
 ✓ src/components/__tests__/Projects.test.tsx (8 tests) 34ms
 ✓ src/components/__tests__/ThemeToggle.test.tsx (6 tests) 23ms
 ✓ src/contexts/__tests__/ThemeContext.test.tsx (4 tests) 18ms
 ✓ src/components/__tests__/FloatingCLI.test.tsx (6 tests) 41ms

Test Files  8 passed, 8 total
Tests       57 passed, 57 total
Snapshots   0 total
Time        3.2s

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   94.2% |    95.0% |   93.0% |   94.0% |                  
----------|---------|----------|---------|---------|-------------------

Effective Coverage: ${getEffectiveCoverage(mockCoverage)}%

🎉 All tests passing! Ready for deployment.
🚀 Coverage target achieved: ${getEffectiveCoverage(mockCoverage)}%`,
      status: 'success',
      icon: <Rocket className="w-4 h-4" />,
      delay: 3000,
    },
  ], []);

  // Initialize component with proper timing to prevent flash
  useEffect(() => {
    if (testMode) {
      setIsInitialized(true);
      return;
    }
    
    // Set initialized immediately to prevent layout shifts
    setIsInitialized(true);
    
    // Show CLI after a shorter delay to reduce flash
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, [testMode]);

  useEffect(() => {
    if (!isAutoPlaying || isClosed || isMinimized) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, steps[currentStep].delay);

    return () => clearTimeout(timer);
  }, [currentStep, isAutoPlaying, isClosed, isMinimized, steps]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [currentStep]);

  const handleStepNavigation = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    setIsAutoPlaying(false);
  }, [currentStep, steps.length]);

  const handleAutoPlayToggle = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying);
  }, [isAutoPlaying]);

  const handleWindowControl = useCallback((action: 'minimize' | 'maximize' | 'close') => {
    switch (action) {
      case 'minimize':
        setIsMinimized(true);
        setIsMaximized(false);
        break;
      case 'maximize':
        setIsMaximized(!isMaximized);
        setIsMinimized(false);
        break;
      case 'close':
        setIsClosed(true);
        setIsMinimized(false);
        setIsMaximized(false);
        break;
    }
  }, [isMaximized]);

  const handleReopen = useCallback(() => {
    setIsClosed(false);
    setIsMinimized(false);
    setIsMaximized(false);
    setIsAutoPlaying(true);
  }, []);

  // Theme-aware color classes (memoized for performance)
  const themeClasses = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      isDark,
      bgColor: isDark ? 'bg-gray-800/90' : 'bg-white/90',
      headerBg: isDark ? 'bg-gray-900/80' : 'bg-gray-100/80',
      borderColor: isDark ? 'border-gray-700' : 'border-gray-300',
      textColor: isDark ? 'text-gray-300' : 'text-gray-700',
      textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
      textGreen: isDark ? 'text-green-400' : 'text-green-600',
      outputBg: isDark ? 'bg-black/50' : 'bg-gray-100/50',
      progressBg: isDark ? 'bg-gray-700' : 'bg-gray-300',
      progressFill: isDark ? 'bg-green-400' : 'bg-green-500'
    };
  }, [theme]);
  
  const { isDark, bgColor, headerBg, borderColor, textColor, textSecondary, textGreen, outputBg, progressBg, progressFill } = themeClasses;

  // Don't render anything until initialized to prevent flash
  if (!isInitialized) {
    return null;
  }

  if (isClosed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleReopen}
        className="fixed z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bottom-8 right-4 md:bottom-12 md:right-6"
        title="Reopen Developer Workflow"
        aria-label="Reopen developer workflow terminal"
      >
        <Terminal className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </motion.button>
    );
  }

  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleReopen}
        className={`fixed z-50 p-3 ${bgColor} ${textGreen} rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 bottom-8 right-4 md:bottom-12 md:right-6`}
        title="Restore Developer Workflow"
        aria-label="Restore developer workflow terminal"
      >
        <Terminal className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            duration: 0.3, 
            ease: "easeOut",
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className={`fixed z-40 floating-cli-container ${
            isMaximized
              ? 'inset-x-0 left-0 right-0 top-[5.5rem] bottom-0 m-0 md:inset-x-6 md:top-[5.5rem] md:bottom-6 md:m-0' // offset for header
              : 'bottom-6 right-6 w-[calc(100vw-2rem)] h-[22rem] md:bottom-8 md:right-8 md:w-[22rem] md:h-[22rem] lg:w-[26rem] lg:h-[26rem] xl:w-[30rem] xl:h-[30rem]'
          }`}
          data-maximized={isMaximized}
          tabIndex={0}
          aria-label="Draggable Developer Workflow CLI"
        >
          {/* Terminal Window */}
          <div 
            ref={cliRef}
            className={`${bgColor} backdrop-blur-md rounded-xl shadow-2xl ring-1 ring-white/10 border ${borderColor} h-full flex flex-col transition-all duration-200 hover:shadow-3xl`}
            style={{
              boxShadow: isDark 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Terminal Header */}
            <div className={`flex items-center justify-between p-2 md:p-3 ${headerBg} rounded-t-xl border-b ${borderColor} flex-shrink-0 select-none backdrop-blur-sm`}>
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className={`p-1 rounded-lg ${isDark ? 'bg-green-400/10' : 'bg-green-500/10'} flex-shrink-0`}>
                  <Terminal className={`w-3 h-3 md:w-3.5 md:h-3.5 ${textGreen} flex-shrink-0`} />
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleWindowControl('minimize')}
                  className="hidden md:flex w-3.5 h-3.5 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-all duration-200 items-center justify-center group hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                    title="Minimize"
                  >
                    <Minus className="w-2 h-2 text-yellow-900 group-hover:text-yellow-800" />
                  </button>
                <button
                  onClick={() => handleWindowControl('maximize')}
                  className="flex w-3.5 h-3.5 bg-green-500 rounded-full hover:bg-green-400 transition-all duration-200 items-center justify-center group hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  <Maximize2 className="w-2 h-2 text-green-900 group-hover:text-green-800" />
                </button>
                <button
                  onClick={() => handleWindowControl('close')}
                  className="flex w-3.5 h-3.5 bg-red-500 rounded-full hover:bg-red-400 transition-all duration-200 items-center justify-center group hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  title="Close"
                >
                  <X className="w-2 h-2 text-red-900 group-hover:text-red-800" />
                </button>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 flex flex-col p-4 md:p-5 space-y-3 md:space-y-4 min-h-0">
              {/* Step Header */}
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 ring-1 ring-blue-500/20' : 'bg-blue-500/10 ring-1 ring-blue-500/20'} flex-shrink-0`}>
                    <div className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {steps[currentStep].icon}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`text-sm md:text-base font-semibold ${textColor} truncate block`}>
                      <span className="md:hidden">Step {steps[currentStep].id}</span>
                      <span className="hidden md:inline">Step {steps[currentStep].id}: {steps[currentStep].title}</span>
                    </span>
                    <span className={`text-xs ${textSecondary} block md:hidden truncate`}>
                      {steps[currentStep].title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                  <button
                    onClick={handleAutoPlayToggle}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                      isAutoPlaying 
                        ? `${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600'}`
                        : `${isDark ? 'bg-gray-700/50 text-gray-400 hover:text-green-400' : 'bg-gray-200/50 text-gray-600 hover:text-green-600'}`
                    }`}
                    title={isAutoPlaying ? "Pause Auto-play" : "Resume Auto-play"}
                  >
                    <Play className={`w-3.5 h-3.5 transition-transform duration-200 ${!isAutoPlaying ? 'rotate-90' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleStepNavigation('prev')}
                    disabled={currentStep === 0}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      isDark ? 'bg-gray-700/50 text-gray-400 hover:text-blue-400' : 'bg-gray-200/50 text-gray-600 hover:text-blue-600'
                    }`}
                    title="Previous Step"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStepNavigation('next')}
                    disabled={currentStep === steps.length - 1}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      isDark ? 'bg-gray-700/50 text-gray-400 hover:text-blue-400' : 'bg-gray-200/50 text-gray-600 hover:text-blue-600'
                    }`}
                    title="Next Step"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={`w-full ${progressBg} rounded-full h-2 flex-shrink-0 overflow-hidden`} role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps.length}>
                <motion.div
                  className={`${progressFill} h-2 rounded-full relative overflow-hidden`}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </motion.div>
              </div>

              {/* Command Line */}
              <div className={`flex items-center space-x-3 flex-shrink-0 p-3 rounded-lg ${isDark ? 'bg-gray-900/50 ring-1 ring-gray-700/50' : 'bg-gray-50/50 ring-1 ring-gray-200/50'} font-mono`}>
                <span className={`${isDark ? 'text-green-400' : 'text-green-600'} text-sm md:text-base font-semibold`}>$</span>
                <span className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm md:text-base truncate`}>
                  <span className="md:hidden">
                    {steps[currentStep].command.length > 25 
                      ? steps[currentStep].command.substring(0, 25) + '...'
                      : steps[currentStep].command
                    }
                  </span>
                  <span className="hidden md:inline">{steps[currentStep].command}</span>
                </span>
              </div>

              {/* Output Area */}
              <div 
                ref={outputRef}
                className={`flex-1 ${outputBg} rounded-lg p-3 md:p-4 font-mono text-xs md:text-sm ${textColor} overflow-y-auto overflow-x-hidden min-h-0 ring-1 ${isDark ? 'ring-gray-700/50' : 'ring-gray-200/50'}`}
                style={{ 
                  maxHeight: isMaximized 
                    ? 'calc(100vh - 140px)'
                    : 'clamp(120px, 40vh, 180px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: isDark ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6'
                }}
              >
                {steps[currentStep].command.startsWith('vim') ? (
                  <pre className={`whitespace-pre-wrap break-words overflow-hidden rounded-lg p-3 ${isDark ? 'bg-gray-900 text-green-300 ring-1 ring-green-500/20' : 'bg-gray-100 text-green-700 ring-1 ring-green-500/20'}`}>
                    <code>{renderHighlightedCode(steps[currentStep].output, isDark)}</code>
                  </pre>
                ) : (
                  <pre className="whitespace-pre-wrap break-words overflow-hidden">
                    {steps[currentStep].output.split('\n').map((line, idx) => {
                      if (/FAIL|✗|error|TypeError|failed/i.test(line)) {
                        return <span key={idx} className="text-red-400">{line + '\n'}</span>;
                      }
                      if (/PASS|✓|success|passed|All tests passing|Ready for deployment|Coverage target achieved/i.test(line)) {
                        return <span key={idx} className="text-green-400">{line + '\n'}</span>;
                      }
                      if (/WARN|warning|uncovered/i.test(line)) {
                        return <span key={idx} className="text-yellow-400">{line + '\n'}</span>;
                      }
                      if (/npm|yarn|pnpm|bun/.test(line)) {
                        return <span key={idx} className={isDark ? 'text-blue-400' : 'text-blue-600'}>{line + '\n'}</span>;
                      }
                      if (/\$/.test(line)) {
                        return <span key={idx} className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>{line + '\n'}</span>;
                      }
                      return <span key={idx}>{line + '\n'}</span>;
                    })}
                  </pre>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between text-sm flex-shrink-0">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                    steps[currentStep].status === 'success' ? `${isDark ? 'bg-green-500/20 ring-1 ring-green-500/30' : 'bg-green-500/20 ring-1 ring-green-500/30'}` :
                    steps[currentStep].status === 'error' ? `${isDark ? 'bg-red-500/20 ring-1 ring-red-500/30' : 'bg-red-500/20 ring-1 ring-red-500/30'}` :
                    steps[currentStep].status === 'running' ? `${isDark ? 'bg-yellow-500/20 ring-1 ring-yellow-500/30' : 'bg-yellow-500/20 ring-1 ring-yellow-500/30'}` :
                    `${isDark ? 'bg-gray-500/20 ring-1 ring-gray-500/30' : 'bg-gray-500/20 ring-1 ring-gray-500/30'}`
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      steps[currentStep].status === 'success' ? 'bg-green-400' :
                      steps[currentStep].status === 'error' ? 'bg-red-400' :
                      steps[currentStep].status === 'running' ? 'bg-yellow-400 animate-pulse' :
                      'bg-gray-400'
                    }`} />
                    <span className={`capitalize text-xs font-medium ${
                      steps[currentStep].status === 'success' ? 'text-green-400' :
                      steps[currentStep].status === 'error' ? 'text-red-400' :
                      steps[currentStep].status === 'running' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {steps[currentStep].status}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-700/50 ring-1 ring-gray-600/50' : 'bg-gray-200/50 ring-1 ring-gray-300/50'}`}>
                  <span className={`${textSecondary} text-xs font-medium`}>
                    {currentStep + 1} / {steps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

FloatingCLI.displayName = 'FloatingCLI';

export default React.memo(FloatingCLI, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return prevProps.testMode === nextProps.testMode;
});