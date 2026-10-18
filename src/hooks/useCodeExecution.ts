import { useState, useCallback, useEffect, useRef } from 'react';
import type { TestCase } from '@/data/challenges';
import { timedOut, type CaseReply, type RunRequest, type TestResult } from '@/lib/duelRunner';

export type { TestResult };

/** Each test case gets this long; a stuck one is cut off by terminating its worker. */
export const CASE_LIMIT_MS = 5000;

export function useCodeExecution() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  // the run in flight, so a newer run, a reset or unmount can stop it and ignore its late replies
  const live = useRef<{ worker: Worker; timer: number } | null>(null);

  const stop = useCallback(() => {
    if (!live.current) return;
    window.clearTimeout(live.current.timer);
    live.current.worker.terminate();
    live.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const runTests = useCallback(
    (code: string, functionName: string, testCases: TestCase[]) =>
      new Promise<TestResult[]>((resolve) => {
        stop();
        setIsRunning(true);
        const out: TestResult[] = [];
        const worker = new Worker(new URL('../lib/duelRunner.worker.ts', import.meta.url), { type: 'module' });
        const run = { worker, timer: 0 };
        live.current = run;

        const finish = () => {
          stop();
          setResults(out);
          setIsRunning(false);
          resolve(out);
        };
        // restarted after every reply: only the case currently running is on the clock
        const watch = () => {
          window.clearTimeout(run.timer);
          run.timer = window.setTimeout(() => {
            if (live.current !== run) return;
            testCases.slice(out.length).forEach((tc, i) => out.push(timedOut(tc, CASE_LIMIT_MS, i === 0)));
            finish();
          }, CASE_LIMIT_MS);
        };

        worker.onmessage = (e: MessageEvent<CaseReply>) => {
          if (live.current !== run || e.data?.index !== out.length) return;
          out.push(e.data.result);
          if (out.length === testCases.length) finish();
          else watch();
        };
        // the worker itself failed to load or crashed: every unfinished case fails with that
        worker.onerror = (e) => {
          if (live.current !== run) return;
          e.preventDefault();
          const error = e.message || 'The test runner could not start';
          testCases.slice(out.length).forEach((tc) => out.push({ label: tc.label, passed: false, actual: null, expected: tc.expected, error }));
          finish();
        };

        watch();
        worker.postMessage({ code, functionName, testCases } satisfies RunRequest);
      }),
    [stop]
  );

  const clearResults = useCallback(() => {
    stop();
    setIsRunning(false);
    setResults([]);
  }, [stop]);

  return { results, isRunning, runTests, clearResults };
}
