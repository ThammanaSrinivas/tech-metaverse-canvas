// The coding duel's sandbox: a worker per run, so a stuck loop can be terminated without touching
// the page. Hosting gives this file its own CSP with 'unsafe-eval' (see CLAUDE.md, CodingDuel).
import { runCase, type CaseReply, type RunRequest } from './duelRunner';

self.onmessage = (e: MessageEvent<RunRequest>) => {
  const { code, functionName, testCases } = e.data;
  testCases.forEach((tc, index) => {
    const result = runCase(code, functionName, tc);
    try {
      self.postMessage({ index, result } satisfies CaseReply);
    } catch {
      // a value that can't be cloned (a function, a symbol): send what it looks like instead
      self.postMessage({ index, result: { ...result, actual: String(result.actual) } } satisfies CaseReply);
    }
  });
};
