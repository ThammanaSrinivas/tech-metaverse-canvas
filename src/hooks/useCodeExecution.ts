import { useState, useCallback } from 'react';
import type { TestCase } from '@/data/challenges';

export interface TestResult {
  label: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
  error?: string;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }
  if (typeof a === 'object' && a !== null && b !== null) {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEqual(objA[key], objB[key]));
  }
  return false;
}

export function useCodeExecution() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = useCallback(
    (code: string, functionName: string, testCases: TestCase[]) => {
      setIsRunning(true);
      const testResults: TestResult[] = [];

      for (const tc of testCases) {
        try {
          const wrappedCode = `${code}\nreturn ${functionName}(...args);`;
          const fn = new Function('args', wrappedCode);

          const start = Date.now();
          const result: unknown = fn(tc.input);
          const elapsed = Date.now() - start;

          if (elapsed > 5000) {
            testResults.push({
              label: tc.label,
              passed: false,
              actual: 'Timeout',
              expected: tc.expected,
              error: 'Execution exceeded 5 second time limit',
            });
          } else {
            testResults.push({
              label: tc.label,
              passed: deepEqual(result, tc.expected),
              actual: result,
              expected: tc.expected,
            });
          }
        } catch (err: unknown) {
          testResults.push({
            label: tc.label,
            passed: false,
            actual: null,
            expected: tc.expected,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      setResults(testResults);
      setIsRunning(false);
      return testResults;
    },
    []
  );

  const clearResults = useCallback(() => setResults([]), []);

  return { results, isRunning, runTests, clearResults };
}
