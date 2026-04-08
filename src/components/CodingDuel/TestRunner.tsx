import React from 'react';
import { CheckCircle, XCircle, Circle } from 'lucide-react';
import type { TestResult } from '@/hooks/useCodeExecution';

interface TestRunnerProps {
  results: TestResult[];
  totalTests: number;
}

const TestRunner: React.FC<TestRunnerProps> = ({ results, totalTests }) => {
  return (
    <div className="border-t border-primary/10 px-4 py-3 max-h-40 overflow-y-auto">
      <p className="text-xs font-medium text-muted-foreground mb-2">Test Results</p>
      <div className="space-y-1.5">
        {results.length === 0
          ? Array.from({ length: totalTests }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <Circle className="w-3.5 h-3.5" />
                <span>Test {i + 1} — not run</span>
              </div>
            ))
          : results.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-xs ${r.passed ? 'text-green-500' : 'text-red-500'}`}
              >
                {r.passed ? (
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-mono">{r.label}</span>
                  {r.error && (
                    <p className="text-red-400 mt-0.5">{r.error}</p>
                  )}
                  {!r.passed && !r.error && (
                    <p className="text-red-400 mt-0.5">
                      Got: {JSON.stringify(r.actual)}
                    </p>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default TestRunner;
