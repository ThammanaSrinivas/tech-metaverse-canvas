// Site sound. Off by default and only ever turned on by the visitor (the speaker button, or
// `sound on` in the zen shell); the choice is remembered on this device. Nothing is created until
// then: no AudioContext, no work, so a silent visit costs nothing. Components call
// `sound.play(cue)` freely; it is a no-op while sound is off.
import { useSyncExternalStore } from 'react';
import { CUES, buildChain, renderOffline, scheduleCue, setPressure, toWav, type Chain, type CueName, type PlayOpts } from './synth';

export type { CueName, PlayOpts } from './synth';

const KEY = 'zen-sound';

const readPref = () => {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
};
const writePref = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* private mode: the choice lasts this visit */
  }
};

/** What a component asked for; recorded by taps even while sound is off (tests, video recorder). */
export type SoundEvent = { cue: CueName; opts?: PlayOpts } | { level: number };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private chain: Chain | null = null;
  private on = readPref();
  private last = new Map<CueName, number>();
  private lastLevel = 0;
  private listeners = new Set<() => void>();
  private taps = new Set<(e: SoundEvent) => void>();
  private unlockBound = false;

  get enabled() {
    return this.on;
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  tap(fn: (e: SoundEvent) => void) {
    this.taps.add(fn);
    return () => this.taps.delete(fn);
  }

  set(on: boolean) {
    if (on === this.on) return;
    if (on) {
      this.on = true;
      this.ensure();
      this.play('logo');
    } else {
      this.play('off');
      this.level(0);
      this.on = false;
      const ctx = this.ctx;
      setTimeout(() => !this.on && ctx?.suspend(), 450);
    }
    writePref(on);
    this.listeners.forEach((fn) => fn());
  }

  toggle = () => this.set(!this.on);

  play(cue: CueName, opts?: PlayOpts) {
    const now = performance.now() / 1000;
    const gap = CUES[cue].minGap ?? 0;
    if (gap && now - (this.last.get(cue) ?? -Infinity) < gap) return;
    this.last.set(cue, now);
    this.taps.forEach((fn) => fn({ cue, opts }));
    if (!this.on) return;
    const ctx = this.ensure();
    if (!ctx || !this.chain) return;
    try {
      scheduleCue(this.chain, cue, ctx.currentTime + 0.005, opts);
    } catch {
      /* a sound must never break the page */
    }
  }

  /** The continuous pressure layer (0 calm … 1 flooded). Cheap to call every frame. */
  level(value: number) {
    const v = Math.round(Math.max(0, Math.min(1, value)) * 100) / 100;
    if (v === this.lastLevel) return;
    this.lastLevel = v;
    this.taps.forEach((fn) => fn({ level: v }));
    if (!this.on || !this.ctx || !this.chain) return;
    try {
      setPressure(this.chain, v, this.ctx.currentTime);
    } catch {
      /* ignore */
    }
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC({ latencyHint: 'interactive' });
      this.chain = buildChain(this.ctx);
      // pause the audio clock with the tab; resume when it is back and sound is still on
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) void this.ctx?.suspend();
        else if (this.on) void this.ctx?.resume();
      });
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  /**
   * Browsers only start audio inside a user gesture. If sound was left on from an earlier visit,
   * wake it on the visitor's first tap or key press.
   */
  bindUnlock() {
    if (this.unlockBound || typeof window === 'undefined') return;
    this.unlockBound = true;
    const wake = () => {
      if (this.on) this.ensure();
    };
    for (const ev of ['pointerup', 'touchend', 'keydown']) window.addEventListener(ev, wake, { capture: true, passive: true });
  }
}

export const sound = new SoundEngine();
sound.bindUnlock();

/** [on, toggle] for UI. */
export function useSound(): [boolean, () => void] {
  const on = useSyncExternalStore(sound.subscribe, () => sound.enabled, () => false);
  return [on, sound.toggle];
}

// Dev builds only: lets tooling (the video recorder) tap cues and render them offline.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __zenSound?: unknown }).__zenSound = { sound, renderOffline, toWav };
}
