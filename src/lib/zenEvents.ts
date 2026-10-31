// Tiny window-event bus so the nav, command palette and zen shell can open
// the shell or the coding duel without threading callbacks through the tree.
// 'dot': the hero's full stop just landed; the header logo's dot lands with it.
export type ZenEvent = 'shell' | 'duel' | 'dot';

const name = (e: ZenEvent) => `zen:${e}`;

export const emitZen = (e: ZenEvent) => window.dispatchEvent(new Event(name(e)));

export const onZen = (e: ZenEvent, handler: () => void) => {
  window.addEventListener(name(e), handler);
  return () => window.removeEventListener(name(e), handler);
};
