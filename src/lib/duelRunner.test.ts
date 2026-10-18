import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { deepEqual, runCase, type RunRequest } from './duelRunner';
import { CASE_LIMIT_MS, useCodeExecution } from '@/hooks/useCodeExecution';
import type { TestCase } from '@/data/challenges';

const cases: TestCase[] = [
  { input: ['hello'], expected: 'olleh', label: 'a' },
  { input: [''], expected: '', label: 'b' },
];
const reverse = 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}';

describe('duel runner', () => {
  it('compares results structurally', () => {
    expect(deepEqual([1, [2, { a: 3 }]], [1, [2, { a: 3 }]])).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual('1', 1)).toBe(false);
  });

  it('runs one case: a pass, a wrong answer, a throw', () => {
    expect(runCase(reverse, 'reverseString', cases[0])).toMatchObject({ passed: true, actual: 'olleh' });
    expect(runCase('function reverseString(s) { return s; }', 'reverseString', cases[0])).toMatchObject({ passed: false, actual: 'hello' });
    expect(runCase('function reverseString() { throw new Error("nope"); }', 'reverseString', cases[0])).toMatchObject({ passed: false, error: 'nope' });
    expect(runCase('function reverseString( {', 'reverseString', cases[0]).passed).toBe(false);
  });
});

// jsdom has no Worker: a stand-in that either answers like duelRunner.worker.ts or hangs like `while (true) {}`
const workers: FakeWorker[] = [];
class FakeWorker {
  static hang = false;
  onmessage: ((e: { data: unknown }) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  terminated = false;
  constructor() {
    workers.push(this);
  }
  postMessage({ code, functionName, testCases }: RunRequest) {
    if (FakeWorker.hang) return;
    testCases.forEach((tc, index) => queueMicrotask(() => !this.terminated && this.onmessage?.({ data: { index, result: runCase(code, functionName, tc) } })));
  }
  terminate() {
    this.terminated = true;
  }
}

describe('useCodeExecution', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    FakeWorker.hang = false;
    workers.length = 0;
  });

  it('runs the cases in a worker and shuts it down when they are done', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const { result } = renderHook(() => useCodeExecution());
    let out;
    await act(async () => {
      out = await result.current.runTests(reverse, 'reverseString', cases);
    });
    expect(out.map((r) => r.passed)).toEqual([true, true]);
    expect(result.current.results).toHaveLength(2);
    expect(result.current.isRunning).toBe(false);
    expect(workers[0].terminated).toBe(true);
  });

  it('cuts off an endless loop at the time limit, failing that case and the ones after it', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('Worker', FakeWorker);
    FakeWorker.hang = true;
    const { result } = renderHook(() => useCodeExecution());
    let done: Promise<unknown>;
    act(() => {
      done = result.current.runTests('function reverseString() { while (true) {} }', 'reverseString', cases);
    });
    expect(result.current.isRunning).toBe(true);
    await act(async () => {
      vi.advanceTimersByTime(CASE_LIMIT_MS);
      await done;
    });
    expect(workers[0].terminated).toBe(true);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.results.map((r) => r.error)).toEqual(['Execution exceeded 5 second time limit', 'Not run: an earlier test timed out']);
  });

  it('a reset stops the run in flight and ignores whatever it says later', () => {
    vi.stubGlobal('Worker', FakeWorker);
    FakeWorker.hang = true;
    const { result } = renderHook(() => useCodeExecution());
    act(() => {
      result.current.runTests(reverse, 'reverseString', cases);
    });
    act(() => result.current.clearResults());
    act(() => workers[0].onmessage?.({ data: { index: 0, result: runCase(reverse, 'reverseString', cases[0]) } }));
    expect(workers[0].terminated).toBe(true);
    expect(result.current.results).toEqual([]);
    expect(result.current.isRunning).toBe(false);
  });
});
