import React, { useState, useEffect, useRef, forwardRef, useMemo, useCallback } from 'react';
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

  const steps: CLIStep[] = [
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
      command: "npm test -- --coverage",
      output: `> portfolio@1.0.0 test
> vitest --coverage

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
      title: "1 FT Failed",
      command: "npm test -- FloatingCLI.test.tsx",
      output: `> portfolio@1.0.0 test
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
      command: "npm test -- --run",
      output: `> portfolio@1.0.0 test
> vitest --run

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
      title: "Deploy & Check Coverage",
      command: "npm run build && npm run test:coverage",
      output: `> portfolio@1.0.0 build
> vite build

✓ built in 2.1s

> portfolio@1.0.0 test:coverage
> vitest --coverage --run

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
  ];

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

  // Theme-aware color classes
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-800/90' : 'bg-white/90';
  const headerBg = isDark ? 'bg-gray-900/80' : 'bg-gray-100/80';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const textColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textGreen = isDark ? 'text-green-400' : 'text-green-600';
  const outputBg = isDark ? 'bg-black/50' : 'bg-gray-100/50';
  const progressBg = isDark ? 'bg-gray-700' : 'bg-gray-300';
  const progressFill = isDark ? 'bg-green-400' : 'bg-green-500';

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
        className="fixed z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 top-24 right-4 md:top-32 md:right-6"
        title="Reopen Developer Workflow"
      >
        <Terminal className="w-5 h-5 md:w-6 md:h-6" />
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
        className={`fixed z-50 p-3 ${bgColor} ${textGreen} rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 top-24 right-4 md:top-32 md:right-6`}
        title="Restore Developer Workflow"
      >
        <Terminal className="w-5 h-5 md:w-6 md:h-6" />
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
              ? 'inset-x-0 left-0 right-0 top-[5.5rem] bottom-0 m-0 md:inset-x-4 md:top-[5.5rem] md:bottom-4 md:m-0' // offset for header
              : 'top-24 right-4 w-[calc(100vw-2rem)] h-80 md:top-28 md:right-8 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem]'
          }`}
          data-maximized={isMaximized}
          tabIndex={0}
          aria-label="Draggable Developer Workflow CLI"
        >
          {/* Terminal Window */}
          <div 
            ref={cliRef}
            className={`${bgColor} backdrop-blur-sm rounded-lg shadow-2xl border ${borderColor} h-full flex flex-col`}
          >
            {/* Terminal Header */}
            <div className={`flex items-center justify-between p-2 md:p-3 ${headerBg} rounded-t-lg border-b ${borderColor} flex-shrink-0 select-none`}>
              <div className="flex items-center space-x-1 md:space-x-2 min-w-0 flex-1">
                <Terminal className={`w-3 h-3 md:w-4 md:h-4 ${textGreen} flex-shrink-0`} />
                <span className={`text-xs md:text-sm font-mono ${textColor} truncate`}>
                  <span className="md:hidden">Dev Workflow</span>
                  <span className="hidden md:inline">Development Workflow</span>
                </span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleWindowControl('minimize')}
                  className="hidden md:block w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors"
                    title="Minimize"
                  >
                    <Minus className="w-1.5 h-1.5 md:w-2 md:h-2 text-gray-800 mx-auto" />
                  </button>
                <button
                  onClick={() => handleWindowControl('maximize')}
                  className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors"
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  <Maximize2 className="w-1.5 h-1.5 md:w-2 md:h-2 text-gray-800 mx-auto" />
                </button>
                <button
                  onClick={() => handleWindowControl('close')}
                  className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors"
                  title="Close"
                >
                  <X className="w-1.5 h-1.5 md:w-2 md:h-2 text-gray-800 mx-auto" />
                </button>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 flex flex-col p-2 md:p-4 space-y-2 md:space-y-3 min-h-0">
              {/* Step Header */}
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-1 md:space-x-2 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {steps[currentStep].icon}
                  </div>
                  <span className={`text-xs md:text-sm font-mono ${textGreen} truncate`}>
                    <span className="md:hidden">S{steps[currentStep].id}</span>
                    <span className="hidden md:inline">Step {steps[currentStep].id}: {steps[currentStep].title}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                  <button
                    onClick={handleAutoPlayToggle}
                    className={`p-1 rounded ${
                      isAutoPlaying ? textGreen : textSecondary
                    } hover:text-green-300 transition-colors`}
                    title={isAutoPlaying ? "Pause Auto-play" : "Resume Auto-play"}
                  >
                    <Play className={`w-3 h-3 md:w-4 md:h-4 ${!isAutoPlaying ? 'rotate-90' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleStepNavigation('prev')}
                    disabled={currentStep === 0}
                    className={`p-1 rounded ${textSecondary} hover:${textGreen} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    title="Previous Step"
                  >
                    <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={() => handleStepNavigation('next')}
                    disabled={currentStep === steps.length - 1}
                    className={`p-1 rounded ${textSecondary} hover:${textGreen} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    title="Next Step"
                  >
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={`w-full ${progressBg} rounded-full h-1 flex-shrink-0`} role="progressbar">
                <motion.div
                  className={`${progressFill} h-1 rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Command Line */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-green-500 font-mono text-xs md:text-sm">$</span>
                <span className="text-blue-500 font-mono text-xs md:text-sm truncate">
                  <span className="md:hidden">
                    {steps[currentStep].command.length > 30 
                      ? steps[currentStep].command.substring(0, 30) + '...'
                      : steps[currentStep].command
                    }
                  </span>
                  <span className="hidden md:inline">{steps[currentStep].command}</span>
                </span>
              </div>

              {/* Output Area */}
              <div 
                ref={outputRef}
                className={`flex-1 ${outputBg} rounded p-2 md:p-3 font-mono text-xs ${textColor} overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 min-h-0`}
                style={{ 
                  maxHeight: isMaximized 
                    ? 'calc(100vh - 120px)'
                    : 'clamp(100px, 35vh, 150px)'
                }}
              >
                {steps[currentStep].command.startsWith('vim') ? (
                  <pre className="whitespace-pre-wrap break-words overflow-hidden bg-gray-900 text-green-300 rounded p-2">
                    <code>{steps[currentStep].output}</code>
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
                      return <span key={idx}>{line + '\n'}</span>;
                    })}
                  </pre>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between text-xs flex-shrink-0">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                    steps[currentStep].status === 'success' ? 'bg-green-400' :
                    steps[currentStep].status === 'error' ? 'bg-red-400' :
                    steps[currentStep].status === 'running' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`} />
                  <span className={`${textSecondary} capitalize text-xs`}>
                    {steps[currentStep].status}
                  </span>
                </div>
                <span className={`${textSecondary} text-xs`}>
                  {currentStep + 1} / {steps.length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

FloatingCLI.displayName = 'FloatingCLI';

export default React.memo(FloatingCLI);