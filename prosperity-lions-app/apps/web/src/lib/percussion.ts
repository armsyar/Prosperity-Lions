// Synthesized lion-dance percussion using the Web Audio API.
// No audio files needed yet - see docs/game-concept.md Section 8/11 for the
// real drum/cymbal/gong recordings this should be replaced with.
//
// Scheduling uses the AudioContext's own clock (audioCtx.currentTime) as the
// single source of truth, per Section 10: "use the Web Audio API clock (not
// frame time) as the source of truth for beat timing." Each sound is handed
// an absolute future start time and the browser's own audio scheduler fires
// it sample-accurately - no manual lookahead loop required for this MVP's
// note density.

let noiseBuffer: AudioBuffer | null = null;

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  const length = ctx.sampleRate * 1; // 1 second of noise, reused/looped as needed
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

/** Low "drum" thump for tap notes. */
export function playDrum(ctx: AudioContext, master: GainNode, time: number, accent = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(accent ? 150 : 120, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
  gain.gain.setValueAtTime(accent ? 0.9 : 0.7, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  osc.connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + 0.2);
}

/** Bright noise-burst "cymbal" for swipe notes. */
export function playCymbal(ctx: AudioContext, master: GainNode, time: number) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 5000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
  src.connect(filter).connect(gain).connect(master);
  src.start(time);
  src.stop(time + 0.3);
}

/** Sustained "gong" swell for hold notes. */
export function playGong(ctx: AudioContext, master: GainNode, time: number, durationSec: number) {
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc2.type = "sine";
  osc.frequency.setValueAtTime(180, time);
  osc2.frequency.setValueAtTime(181.5, time); // slight detune for a metallic beat
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.55, time + 0.08);
  gain.gain.setValueAtTime(0.55, time + Math.max(0.1, durationSec - 0.3));
  gain.gain.exponentialRampToValueAtTime(0.001, time + durationSec);
  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc2.start(time);
  osc.stop(time + durationSec + 0.05);
  osc2.stop(time + durationSec + 0.05);
}

/** Short, bright confirmation blip for a Perfect hit. */
export function playPerfectChime(ctx: AudioContext, master: GainNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(880, time);
  gain.gain.setValueAtTime(0.25, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  osc.connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + 0.14);
}

/** Low dull thud for a Miss. */
export function playMissThud(ctx: AudioContext, master: GainNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(90, time);
  gain.gain.setValueAtTime(0.18, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  osc.connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + 0.12);
}
