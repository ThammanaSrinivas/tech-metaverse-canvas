// Runs one coding-duel test case against the player's code. Pure, so it can be tested here; in the
// browser it only ever runs inside duelRunner.worker.ts, whose own CSP allows `new Function()`
// (the page's CSP doesn't, and an infinite loop there would freeze the tab).
import type { TestCase } from '@/data/challenges';

export interface TestResult {
  label: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
  error?: string;
}

/** What the worker is asked to do, and what it sends back for each case, in order. */
export interface RunRequest {
  code: string;
  functionName: string;
  testCases: TestCase[];
}
export interface CaseReply {
  index: number;
  result: TestResult;
}

export function deepEqual(a: unknown, b: unknown): boolean {
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

export function runCase(code: string, functionName: string, tc: TestCase): TestResult {
  try {
    const fn = new Function('args', `${code}\nreturn ${functionName}(...args);`);
    const actual: unknown = fn(tc.input);
    return { label: tc.label, passed: deepEqual(actual, tc.expected), actual, expected: tc.expected };
  } catch (err: unknown) {
    return { label: tc.label, passed: false, actual: null, expected: tc.expected, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/** The verdict for a case the worker never finished: it ran past the limit, or an earlier one did. */
export const timedOut = (tc: TestCase, limitMs: number, first: boolean): TestResult => ({
  label: tc.label,
  passed: false,
  actual: 'Timeout',
  expected: tc.expected,
  error: first ? `Execution exceeded ${limitMs / 1000} second time limit` : 'Not run: an earlier test timed out',
});
