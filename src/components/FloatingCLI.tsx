import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, XCircle, Play, Code, TestTube, Rocket, BarChart3 } from 'lucide-react';

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

  const steps: CLIStep[] = [
    {
      id: 1,
      title: "Write Code",
      command: "vim src/components/Feature.tsx",
      output: `import React, { useState } from 'react';

const Feature = () => {
  const [data, setData] = useState(null);
  
  return (
    <div className="feature">
      <h2>New Feature</h2>
      <button onClick={() => setData('test')}>
        Click me
      </button>
    </div>
  );
};

export default Feature;`,
      status: 'success',
      icon: <Code className="w-4 h-4" />,
      delay: 0
    },
    {
      id: 2,
      title: "Run Unit & Functional Tests",
      command: "npm run test && npm run test:e2e",
      output: `$ npm run test
  ✓ Component renders correctly
  ✓ Button click handler works
  ✓ State updates properly
  3 tests passing

$ npm run test:e2e
  ✓ Feature integration test
  ✓ User workflow test
  ✗ API integration test FAILED
  2 tests passing, 1 failed`,
      status: 'error',
      icon: <TestTube className="w-4 h-4" />,
      delay: 2000
    },
    {
      id: 3,
      title: "1 FT Failed",
      command: "npm run test:e2e -- --verbose",
      output: `FAIL  src/__tests__/Feature.e2e.test.ts
  ● API integration test

    Expected: "success"
    Received: "error"

    at Object.<anonymous> (src/__tests__/Feature.e2e.test.ts:15:8)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)

Test Suites: 1 failed, 2 passed`,
      status: 'error',
      icon: <XCircle className="w-4 h-4" />,
      delay: 4000
    },
    {
      id: 4,
      title: "Write Some Other Code",
      command: "vim src/components/Feature.tsx",
      output: `import React, { useState, useEffect } from 'react';

const Feature = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result.status);
    } catch (error) {
      setData('error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="feature">
      <h2>New Feature</h2>
      <button 
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Click me'}
      </button>
    </div>
  );
};

export default Feature;`,
      status: 'success',
      icon: <Code className="w-4 h-4" />,
      delay: 6000
    },
    {
      id: 5,
      title: "Now All Tests Pass",
      command: "npm run test && npm run test:e2e",
      output: `$ npm run test
  ✓ Component renders correctly
  ✓ Button click handler works
  ✓ State updates properly
  ✓ Loading state works
  4 tests passing

$ npm run test:e2e
  ✓ Feature integration test
  ✓ User workflow test
  ✓ API integration test
  3 tests passing

All tests passed! 🎉`,
      status: 'success',
      icon: <CheckCircle className="w-4 h-4" />,
      delay: 8000
    },
    {
      id: 6,
      title: "Deploy & Check Coverage",
      command: "npm run deploy && npm run test:coverage",
      output: `$ npm run deploy
  ✓ Building project...
  ✓ Deploying to production...
  ✓ Deployment successful!

$ npm run test:coverage
  ✓ All tests passing
  ✓ Coverage: 94.2%
  ✓ Lines: 94.2%
  ✓ Functions: 94.2%
  ✓ Branches: 94.2%
  ✓ Statements: 94.2%

Deployment successful with 94% coverage! 🚀`,
      status: 'success',
      icon: <Rocket className="w-4 h-4" />,
      delay: 10000
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          // Reset after showing all steps
          setTimeout(() => setCurrentStep(0), 3000);
          return prev;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, steps.length]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-8 w-96 h-96 z-20 pointer-events-none"
    >
      <div className="bg-black/90 backdrop-blur-sm border border-primary/30 rounded-lg shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300 font-mono">Development Workflow</span>
          </div>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-4 h-80 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              {/* Step Header */}
              <div className="flex items-center gap-2 mb-3">
                {steps[currentStep].icon}
                <span className="text-sm font-semibold text-primary">
                  Step {steps[currentStep].id}: {steps[currentStep].title}
                </span>
              </div>

              {/* Command */}
              <div className="mb-3">
                <div className="text-green-400 text-sm font-mono">
                  $ {steps[currentStep].command}
                </div>
              </div>

              {/* Output */}
              <div className="bg-gray-900/50 rounded p-3 h-56 overflow-y-auto">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                  {steps[currentStep].output}
                </pre>
              </div>

              {/* Status Indicator */}
              <div className="mt-3 flex items-center gap-2">
                {steps[currentStep].status === 'success' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-green-400"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Success</span>
                  </motion.div>
                )}
                {steps[currentStep].status === 'error' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-red-400"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs">Error</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">
            {currentStep + 1} / {steps.length}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingCLI; 