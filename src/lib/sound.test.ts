import { beforeEach, describe, expect, it, vi } from 'vitest';
import SOUND from '@/theme/sound.json';
import { CUES, buildChain, noteFreq, scheduleCue, setPressure, type CueName } from '@/lib/sound/synth';

/** Stands in for Web Audio (jsdom has none): every node, param and method is a harmless no-op. */
function fakeAudio(): unknown {
  const node: unknown = new Proxy(function () {}, {
    get: (_t, k) =>
      k === Symbol.toPrimitive
        ? () => 0
        : k === 'currentTime' || k === 'length'
          ? 0
          : k === 'sampleRate'
            ? 48000
            : k === 'state'
              ? 'running'
              : k === 'then'
                ? undefined
                : node,
    apply: () => node,
    construct: () => node as object,
    set: () => true,
  });
  return node;
}

describe('sonic brand (sound.json)', () => {
  it('every cue uses a defined voice, a quiet gain, and is over within 2.5 s', () => {
    for (const [name, def] of Object.entries(CUES)) {
      expect(def.notes.length, name).toBeGreaterThan(0);
      for (const n of def.notes) {
        expect(Object.keys(SOUND.voices), name).toContain(n.voice);
        expect(n.gain ?? 0.5, name).toBeGreaterThan(0);
        expect(n.gain ?? 0.5, name).toBeLessThanOrEqual(0.6);
        const end = (n.at ?? 0) + (n.span ?? 0) + (n.decay ?? SOUND.voices[n.voice].decay);
        expect(end, name).toBeLessThan(2.5);
      }
    }
  });

  it('keeps every pitched note between 80 Hz and 6 kHz, even shifted by the largest step used (9)', () => {
    for (const [name, def] of Object.entries(CUES))
      for (const n of def.notes) {
        if (n.voice !== 'wood' && n.voice !== 'glass') continue;
        for (const step of [0, 9]) {
          const f = noteFreq((n.deg ?? 0) + step, n.oct ?? 0);
          expect(f, name).toBeGreaterThan(80);
          expect(f, name).toBeLessThan(6000);
        }
      }
  });

  it('stays in the key: degree 0 is the root, five degrees up is the octave', () => {
    expect(noteFreq(0)).toBeCloseTo(SOUND.key.root);
    expect(noteFreq(5)).toBeCloseTo(SOUND.key.root * 2);
    expect(noteFreq(-5)).toBeCloseTo(SOUND.key.root / 2);
  });
});

describe('synth', () => {
  it('builds the bus and schedules every cue and the pressure layer without errors', () => {
    const chain = buildChain(fakeAudio() as BaseAudioContext);
    expect(() => {
      for (const name of Object.keys(CUES) as CueName[]) scheduleCue(chain, name, 0, { step: 3, pan: 0.4, delay: 0.1, gain: 0.8 });
      setPressure(chain, 0.7, 0);
      setPressure(chain, 0, 1);
    }).not.toThrow();
  });
});

describe('sound engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('is off by default and creates no audio at all until the visitor turns it on', async () => {
    const AC = vi.fn(function () {
      return fakeAudio();
    });
    vi.stubGlobal('AudioContext', AC);
    const { sound } = await import('@/lib/sound');
    const heard: string[] = [];
    sound.tap((e) => 'cue' in e && heard.push(e.cue));

    expect(sound.enabled).toBe(false);
    sound.play('page');
    sound.level(0.5);
    expect(heard).toEqual(['page']);
    expect(AC).not.toHaveBeenCalled();

    sound.set(true);
    expect(AC).toHaveBeenCalledTimes(1);
    expect(heard).toContain('logo');
    expect(localStorage.getItem('zen-sound')).toBe('on');
    expect(() => {
      sound.play('switch');
      sound.play('ack', { step: 3, pan: 0.5, delay: 0.1 });
      sound.level(1);
    }).not.toThrow();

    sound.set(false);
    expect(localStorage.getItem('zen-sound')).toBe('off');
    expect(AC).toHaveBeenCalledTimes(1);
  });

  it('remembers the choice on this device', async () => {
    localStorage.setItem('zen-sound', 'on');
    const { sound } = await import('@/lib/sound');
    expect(sound.enabled).toBe(true);
  });

  it('lets a burst of the same cue through once (minGap)', async () => {
    const { sound } = await import('@/lib/sound');
    const heard: string[] = [];
    sound.tap((e) => 'cue' in e && heard.push(e.cue));
    sound.play('palette');
    sound.play('palette');
    sound.play('enter');
    sound.play('enter');
    expect(heard).toEqual(['palette', 'enter', 'enter']);
  });
});
