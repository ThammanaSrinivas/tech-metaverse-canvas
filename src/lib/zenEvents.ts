// Tiny window-event bus so the nav, command palette and zen shell can open
// the shell or the coding duel without threading callbacks through the tree.
export type ZenEvent = 'shell' | 'duel';

const name = (e: ZenEvent) => `zen:${e}`;

export const emitZen = (e: ZenEvent) => window.dispatchEvent(new Event(name(e)));

export const onZen = (e: ZenEvent, handler: () => void) => {
  window.addEventListener(name(e), handler);
  return () => window.removeEventListener(name(e), handler);
};
