// The synthesiser behind every sound on the site. Pure Web Audio, no files: each voice is a few
// oscillators or a noise burst with an envelope. The same code plays live (engine.ts) and renders
// offline (renderOffline, used to make the video soundtrack), so the two always match.
// Values come from src/theme/sound.json (SOURCE OF TRUTH for the sonic brand).
import SOUND from '@/theme/sound.json';

export type CueName = keyof typeof SOUND.cues;
type VoiceName = keyof typeof SOUND.voices;

interface NoteDef {
  voice: VoiceName;
  /** Scale degree in the key (0 = root); PlayOpts.step shifts it. */
  deg?: number;
  oct?: number;
  /** Seconds after the cue starts. */
  at?: number;
  gain?: number;
  decay?: number;
  freq?: number;
  from?: number;
  to?: number;
  /** Repeat the note, spaced like an ease-out count (dense first, then settling). */
  repeat?: number;
  span?: number;
}
interface CueDef {
  minGap?: number;
  notes: NoteDef[];
}

export const CUES = SOUND.cues as unknown as Record<CueName, CueDef>;
const V = SOUND.voices;

export interface PlayOpts {
  /** Scale steps to shift every note by (e.g. one note per worker). */
  step?: number;
  gain?: number;
  /** -1 left … 1 right */
  pan?: number;
  /** Seconds from now. */
  delay?: number;
}

/** Frequency of a scale degree: degrees past the scale wrap into the next octave. */
export function noteFreq(deg: number, oct = 0): number {
  const { root, scale } = SOUND.key;
  const n = scale.length;
  const o = oct + Math.floor(deg / n);
  return root * Math.pow(2, o + scale[((deg % n) + n) % n] / 12);
}

export interface Chain {
  ac: BaseAudioContext;
  input: AudioNode;
  noise: AudioBuffer;
  drone?: { gain: GainNode; hiss: GainNode; filter: BiquadFilterNode; wobble: GainNode };
}

function noiseBuffer(ac: BaseAudioContext): AudioBuffer {
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 1.5), ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** A small, soft room: decaying stereo noise as the reverb's impulse response. */
function impulse(ac: BaseAudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    const pre = Math.floor(ac.sampleRate * 0.012);
    for (let i = pre; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  return buf;
}

/** Master bus: everything → (dry + soft reverb) → gentle compressor → speakers. */
export function buildChain(ac: BaseAudioContext): Chain {
  const input = ac.createGain();
  const master = ac.createGain();
  master.gain.value = SOUND.master.gain;
  const verb = ac.createConvolver();
  verb.buffer = impulse(ac, SOUND.master.reverbSeconds);
  const wet = ac.createGain();
  wet.gain.value = SOUND.master.reverbWet;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 12;
  comp.ratio.value = 3;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;
  input.connect(master);
  input.connect(verb);
  verb.connect(wet);
  wet.connect(master);
  master.connect(comp);
  comp.connect(ac.destination);
  return { ac, input, noise: noiseBuffer(ac) };
}

const SILENT = 0.0001;
/** Exponential attack/decay envelope on a gain param. */
function envelope(p: AudioParam, when: number, peak: number, attack: number, decay: number) {
  p.setValueAtTime(SILENT, when);
  p.exponentialRampToValueAtTime(Math.max(SILENT, peak), when + attack);
  p.exponentialRampToValueAtTime(SILENT, when + attack + decay);
}

function out(c: Chain, pan: number): AudioNode {
  if (!pan) return c.input;
  const p = c.ac.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  p.connect(c.input);
  return p;
}

function noiseSource(c: Chain, when: number, dur: number) {
  const src = c.ac.createBufferSource();
  src.buffer = c.noise;
  src.start(when, Math.random() * 0.5, dur + 0.05);
  return src;
}

// ---- voices
function wood(c: Chain, dest: AudioNode, when: number, f: number, gain: number, n: NoteDef) {
  const decay = n.decay ?? V.wood.decay;
  const g = c.ac.createGain();
  envelope(g.gain, when, gain, 0.002, decay);
  g.connect(dest);
  const body = c.ac.createOscillator();
  body.frequency.value = f;
  body.connect(g);
  // the marimba's bright overtone, gone quickly
  const over = c.ac.createOscillator();
  over.frequency.value = f * V.wood.partial;
  const og = c.ac.createGain();
  envelope(og.gain, when, gain * V.wood.partialGain, 0.001, decay * 0.3);
  over.connect(og).connect(dest);
  // the mallet: a 4 ms tap of filtered noise
  const tap = noiseSource(c, when, 0.01);
  const bp = c.ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = Math.min(9000, f * 6);
  const tg = c.ac.createGain();
  envelope(tg.gain, when, gain * V.wood.mallet, 0.0005, 0.004);
  tap.connect(bp).connect(tg).connect(dest);
  for (const o of [body, over]) {
    o.start(when);
    o.stop(when + decay + 0.1);
  }
}

function glass(c: Chain, dest: AudioNode, when: number, f: number, gain: number, n: NoteDef) {
  const decay = n.decay ?? V.glass.decay;
  const g = c.ac.createGain();
  envelope(g.gain, when, gain, 0.002, decay);
  g.connect(dest);
  // FM bell: the modulator's depth fades faster than the tone, so it starts bright and mellows
  const car = c.ac.createOscillator();
  car.frequency.value = f;
  const mod = c.ac.createOscillator();
  mod.frequency.value = f * V.glass.ratio;
  const depth = c.ac.createGain();
  envelope(depth.gain, when, f * V.glass.index, 0.001, decay * 0.4);
  mod.connect(depth).connect(car.frequency);
  car.connect(g);
  for (const o of [car, mod]) {
    o.start(when);
    o.stop(when + decay + 0.1);
  }
}

function tick(c: Chain, dest: AudioNode, when: number, gain: number, n: NoteDef) {
  const decay = n.decay ?? V.tick.decay;
  const src = noiseSource(c, when, decay);
  const bp = c.ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = (n.freq ?? V.tick.freq) * (0.88 + Math.random() * 0.24);
  bp.Q.value = V.tick.q;
  const g = c.ac.createGain();
  envelope(g.gain, when, gain, 0.0008, decay);
  src.connect(bp).connect(g).connect(dest);
}

function air(c: Chain, dest: AudioNode, when: number, gain: number, n: NoteDef) {
  const decay = n.decay ?? V.air.decay;
  const src = noiseSource(c, when, decay);
  const bp = c.ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = V.air.q;
  bp.frequency.setValueAtTime(n.from ?? V.air.from, when);
  bp.frequency.exponentialRampToValueAtTime(n.to ?? V.air.to, when + decay);
  const g = c.ac.createGain();
  envelope(g.gain, when, gain, decay * 0.4, decay * 0.6);
  src.connect(bp).connect(g).connect(dest);
}

function thump(c: Chain, dest: AudioNode, when: number, gain: number, n: NoteDef) {
  const decay = n.decay ?? V.thump.decay;
  const o = c.ac.createOscillator();
  o.frequency.setValueAtTime(n.from ?? V.thump.from, when);
  o.frequency.exponentialRampToValueAtTime(n.to ?? V.thump.to, when + decay);
  const g = c.ac.createGain();
  envelope(g.gain, when, gain, 0.002, decay);
  o.connect(g).connect(dest);
  o.start(when);
  o.stop(when + decay + 0.05);
}

/** Schedules every note of a cue at `when` (seconds on the chain's clock). */
export function scheduleCue(c: Chain, name: CueName, when: number, o: PlayOpts = {}) {
  const def = CUES[name];
  const dest = out(c, o.pan ?? 0);
  const start = when + (o.delay ?? 0);
  for (const n of def.notes) {
    const reps = n.repeat ?? 1;
    for (let k = 0; k < reps; k++) {
      // repeats follow the CountUp curve (1 - (1-p)^3): equal steps of value, so dense, then slow
      const at = (n.at ?? 0) + (reps > 1 ? (n.span ?? 1) * (1 - Math.pow(1 - k / reps, 1 / 3)) : 0);
      const t = start + at;
      const gain = (n.gain ?? 0.5) * (o.gain ?? 1);
      const f = noteFreq((n.deg ?? 0) + (o.step ?? 0), n.oct ?? 0);
      if (n.voice === 'wood') wood(c, dest, t, f, gain, n);
      else if (n.voice === 'glass') glass(c, dest, t, f, gain, n);
      else if (n.voice === 'tick') tick(c, dest, t, gain, n);
      else if (n.voice === 'air') air(c, dest, t, gain, n);
      else thump(c, dest, t, gain, n);
    }
  }
}

/**
 * A continuous layer: a low, filtered drone with hiss and a slow wobble that rises with pressure
 * (0 calm … 1 flooded). The wobble runs at the same rate as the diagram's strained queue outline.
 */
export function setPressure(c: Chain, value: number, when: number) {
  const P = SOUND.pressure;
  if (!c.drone) {
    const filter = c.ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = P.cutoff[0];
    const gain = c.ac.createGain();
    gain.gain.value = 0;
    filter.connect(gain).connect(c.input);
    for (const [ratio, detune] of [
      [0.25, 0],
      [0.375, 7],
    ] as const) {
      const o = c.ac.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = SOUND.key.root * ratio;
      o.detune.value = detune;
      o.connect(filter);
      o.start(when);
    }
    const hissSrc = c.ac.createBufferSource();
    hissSrc.buffer = c.noise;
    hissSrc.loop = true;
    const hbp = c.ac.createBiquadFilter();
    hbp.type = 'bandpass';
    hbp.frequency.value = 700;
    hbp.Q.value = 0.8;
    const hiss = c.ac.createGain();
    hiss.gain.value = 0;
    hissSrc.connect(hbp).connect(hiss).connect(c.input);
    hissSrc.start(when);
    const lfo = c.ac.createOscillator();
    lfo.frequency.value = P.wobbleHz;
    const wobble = c.ac.createGain();
    wobble.gain.value = 0;
    lfo.connect(wobble).connect(gain.gain);
    lfo.start(when);
    c.drone = { gain, hiss, filter, wobble };
  }
  const v = Math.max(0, Math.min(1, value));
  const d = c.drone;
  d.gain.gain.setTargetAtTime(v * P.gain, when, 0.25);
  d.wobble.gain.setTargetAtTime(v * P.gain * P.wobble, when, 0.25);
  d.hiss.gain.setTargetAtTime(v * P.hiss, when, 0.25);
  d.filter.frequency.setTargetAtTime(P.cutoff[0] + v * (P.cutoff[1] - P.cutoff[0]), when, 0.25);
}

export interface CueEvent {
  /** seconds */
  t: number;
  cue: CueName;
  opts?: PlayOpts;
}
export interface LevelEvent {
  t: number;
  value: number;
}

/** Renders a timeline of cues (and pressure changes) to audio, e.g. a video soundtrack. */
export async function renderOffline(events: CueEvent[], levels: LevelEvent[], seconds: number, sampleRate = 48000): Promise<AudioBuffer> {
  const ac = new OfflineAudioContext(2, Math.ceil(seconds * sampleRate), sampleRate);
  const chain = buildChain(ac);
  for (const l of levels) if (l.t < seconds) setPressure(chain, l.value, l.t);
  for (const e of events) if (e.t < seconds) scheduleCue(chain, e.cue, e.t, e.opts);
  return ac.startRendering();
}

/** 16-bit PCM WAV bytes for an AudioBuffer. */
export function toWav(buf: AudioBuffer): ArrayBuffer {
  const ch = buf.numberOfChannels;
  const len = buf.length * ch * 2;
  const view = new DataView(new ArrayBuffer(44 + len));
  const str = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, ch, true);
  view.setUint32(24, buf.sampleRate, true);
  view.setUint32(28, buf.sampleRate * ch * 2, true);
  view.setUint16(32, ch * 2, true);
  view.setUint16(34, 16, true);
  str(36, 'data');
  view.setUint32(40, len, true);
  const data = [...Array(ch)].map((_, i) => buf.getChannelData(i));
  let o = 44;
  for (let i = 0; i < buf.length; i++)
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, data[c][i]));
      view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  return view.buffer;
}
