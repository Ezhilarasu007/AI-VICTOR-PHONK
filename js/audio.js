// AI VICTOR PHONK — Real synthesis engine.
// All voices are generated with the Web Audio API and work on both a live
// AudioContext and an OfflineAudioContext (used for rendering/export).

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

let _liveCtx = null;
export function liveCtx() {
  if (!_liveCtx) {
    _liveCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_liveCtx.state === 'suspended') _liveCtx.resume();
  return _liveCtx;
}

// Resume the audio context on the first user gesture (browser policy).
if (typeof window !== 'undefined') {
  const kick = () => { if (_liveCtx && _liveCtx.state === 'suspended') _liveCtx.resume(); };
  window.addEventListener('pointerdown', kick, { passive: true });
  window.addEventListener('keydown', kick);
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

const _buffers = new WeakMap();
function ctxCache(ctx) {
  let c = _buffers.get(ctx);
  if (!c) { c = {}; _buffers.set(ctx, c); }
  return c;
}

export function noiseBuffer(ctx, seconds = 2) {
  const c = ctxCache(ctx);
  const key = 'noise' + seconds;
  if (c[key]) return c[key];
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  c[key] = buf;
  return buf;
}

// Vinyl-style crackle: quiet floor noise + sparse pops (used as phonk texture).
export function crackleBuffer(ctx, seconds = 4) {
  const c = ctxCache(ctx);
  if (c.crackle) return c.crackle;
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.018;
  const pops = Math.floor(len * 0.0025);
  for (let p = 0; p < pops; p++) {
    const i = Math.floor(Math.random() * (len - 40));
    const amp = (0.25 + Math.random() * 0.75) * (Math.random() < 0.5 ? 1 : -1);
    const tau = 6 + Math.floor(Math.random() * 20);
    for (let k = 0; k < 40; k++) d[i + k] += amp * Math.exp(-k / tau) * (Math.random() * 2 - 1);
  }
  c.crackle = buf;
  return buf;
}

// Procedural reverb impulse response: exponentially decaying stereo noise.
export function impulseBuffer(ctx, seconds = 2.2, decay = 2.6, preDelay = 0.012) {
  const c = ctxCache(ctx);
  const key = 'ir' + seconds + '_' + decay;
  if (c[key]) return c[key];
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const pre = Math.floor(rate * preDelay);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / (len - pre);
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (1 - t * 0.15);
    }
  }
  c[key] = buf;
  return buf;
}

// Analogue-ish saturation curve (tanh).
export function distCurve(amount = 2, n = 1024) {
  const curve = new Float32Array(n);
  const k = Math.max(0.001, amount);
  const norm = Math.tanh(k);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x) / norm;
  }
  return curve;
}

function gainNode(ctx, v = 1) { const g = ctx.createGain(); g.gain.value = v; return g; }
function filt(ctx, type, freq, q = 1) {
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f;
}
function shaper(ctx, amount) {
  const s = ctx.createWaveShaper(); s.curve = distCurve(amount); s.oversample = '2x'; return s;
}

// Attack/decay envelope on a gain param (safe wrt exponential ramps).
function envAd(param, t, attack, peak, decay, gate = 0) {
  const a = Math.max(0.001, attack);
  param.setValueAtTime(0.0001, t);
  param.linearRampToValueAtTime(peak, t + a);
  const rel = Math.max(0.01, decay);
  if (gate > 0) {
    param.setValueAtTime(peak, t + a + gate);
    param.exponentialRampToValueAtTime(0.0001, t + a + gate + rel);
    param.setValueAtTime(0, t + a + gate + rel + 0.001);
  } else {
    param.exponentialRampToValueAtTime(0.0001, t + a + rel);
    param.setValueAtTime(0, t + a + rel + 0.001);
  }
}

// ---------------------------------------------------------------------------
// Mix rig: buses -> compressor -> saturation -> limiter -> destination
// ---------------------------------------------------------------------------

export function buildRig(ctx, opts = {}) {
  const master = gainNode(ctx, opts.master ?? 1);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 20; comp.ratio.value = 3.2;
  comp.attack.value = 0.004; comp.release.value = 0.22;
  const sat = shaper(ctx, opts.masterDrive ?? 1.05);
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -4; limiter.knee.value = 0; limiter.ratio.value = 14;
  limiter.attack.value = 0.0012; limiter.release.value = 0.12;

  master.connect(comp); comp.connect(sat); sat.connect(limiter); limiter.connect(ctx.destination);

  const drumBus = gainNode(ctx, opts.drumGain ?? 1.0);
  const bassBus = gainNode(ctx, opts.bassGain ?? 0.95);
  const musicBus = gainNode(ctx, opts.musicGain ?? 0.85);
  const fxBus = gainNode(ctx, opts.fxGain ?? 0.8);
  drumBus.connect(master); bassBus.connect(master); musicBus.connect(master); fxBus.connect(master);

  // Reverb
  const conv = ctx.createConvolver();
  conv.buffer = impulseBuffer(ctx, opts.reverbTime ?? 2.1, opts.reverbDecay ?? 2.7);
  const reverbIn = gainNode(ctx, 1);
  const reverbLevel = gainNode(ctx, opts.reverbLevel ?? 0.55);
  reverbIn.connect(conv); conv.connect(reverbLevel); reverbLevel.connect(master);

  // Tempo-synced delay (time set by the composer/scheduler)
  const delay = ctx.createDelay(2.5);
  delay.delayTime.value = opts.delayTime ?? 0.32;
  const delayFb = gainNode(ctx, 0.34);
  const delayLp = filt(ctx, 'lowpass', 3400);
  const delayIn = gainNode(ctx, 1);
  const delayLevel = gainNode(ctx, 0.4);
  delayIn.connect(delay); delay.connect(delayLp);
  delayLp.connect(delayFb); delayFb.connect(delay);
  delayLp.connect(delayLevel); delayLevel.connect(master);

  return { ctx, master, drumBus, bassBus, musicBus, fxBus, reverbIn, delayIn, delayLevel,
    setDelayTime: (s) => { delay.delayTime.value = clamp(s, 0.01, 2.4); } };
}

let _liveRig = null;
export function liveRig() {
  if (!_liveRig) _liveRig = buildRig(liveCtx());
  return _liveRig;
}

// Send a node into a bus through an amount gain.
function send(node, bus, amt) {
  if (amt <= 0) return;
  const g = gainNode(node.context, amt);
  node.connect(g); g.connect(bus);
}

// ---------------------------------------------------------------------------
// Sidechain ducking (kicks duck bass + music) and master fades
// ---------------------------------------------------------------------------

export function scheduleSidechain(rig, kickTimes, o = {}) {
  const bassDepth = o.bassDepth ?? 0.55;
  const musicDepth = o.musicDepth ?? 0.22;
  const hold = o.hold ?? 0.02;
  const rel = o.release ?? 0.26;
  const bassBase = rig.bassBus.gain.value;
  const musicBase = rig.musicBus.gain.value;
  for (const t of kickTimes) {
    rig.bassBus.gain.setValueAtTime(bassBase, t);
    rig.bassBus.gain.linearRampToValueAtTime(bassBase * (1 - bassDepth), t + hold);
    rig.bassBus.gain.linearRampToValueAtTime(bassBase, t + rel);
    rig.musicBus.gain.setValueAtTime(musicBase, t);
    rig.musicBus.gain.linearRampToValueAtTime(musicBase * (1 - musicDepth), t + hold);
    rig.musicBus.gain.linearRampToValueAtTime(musicBase, t + rel);
  }
}

export function masterFades(rig, endTime, fadeIn = 0.12, fadeOut = 1.4) {
  const g = rig.master.gain;
  const base = g.value;
  g.setValueAtTime(0, 0);
  g.linearRampToValueAtTime(base, fadeIn);
  const outStart = Math.max(fadeIn + 0.1, endTime - fadeOut);
  g.setValueAtTime(base, outStart);
  g.linearRampToValueAtTime(0, endTime);
}

// ---------------------------------------------------------------------------
// Voices — every voice schedules itself into a bus at an absolute time.
// ---------------------------------------------------------------------------

function kick(rig, t, o = {}) {
  const ctx = rig.ctx;
  const g = o.gain ?? 1, tune = o.tune ?? 1;
  const out = gainNode(ctx, 1);
  const osc = ctx.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(150 * tune, t);
  osc.frequency.exponentialRampToValueAtTime(42 * tune, t + 0.11);
  const og = gainNode(ctx, 0);
  envAd(og.gain, t, 0.002, g, 0.40);
  osc.connect(og);
  const click = ctx.createBufferSource(); click.buffer = noiseBuffer(ctx);
  const cf = filt(ctx, 'highpass', 1100);
  const cg = gainNode(ctx, 0);
  envAd(cg.gain, t, 0.001, 0.5 * g * (o.punch ?? 0.6), 0.02);
  click.connect(cf); cf.connect(cg);
  const s = shaper(ctx, 1.7);
  og.connect(s); cg.connect(s); s.connect(out); out.connect(rig.drumBus);
  osc.start(t); osc.stop(t + 0.5); click.start(t); click.stop(t + 0.04);
}

function snare(rig, t, o = {}) {
  const ctx = rig.ctx;
  const g = o.gain ?? 1, tune = o.tune ?? 1;
  const out = gainNode(ctx, g);
  const body = ctx.createOscillator(); body.type = 'triangle';
  body.frequency.setValueAtTime(196 * tune, t);
  const bg = gainNode(ctx, 0); envAd(bg.gain, t, 0.001, 0.5, 0.085);
  body.connect(bg);
  const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx);
  const nf = filt(ctx, 'bandpass', 1750 * tune, 0.85);
  const ng = gainNode(ctx, 0); envAd(ng.gain, t, 0.001, 0.85, 0.17);
  n.connect(nf); nf.connect(ng);
  const s = shaper(ctx, 1.3);
  bg.connect(s); ng.connect(s); s.connect(out); out.connect(rig.drumBus);
  send(out, rig.reverbIn, 0.12);
  body.start(t); body.stop(t + 0.14); n.start(t); n.stop(t + 0.22);
}

function clap(rig, t, o = {}) {
  const ctx = rig.ctx;
  const g = o.gain ?? 1;
  const out = gainNode(ctx, g);
  const bp = filt(ctx, 'bandpass', 1150, 1.1);
  bp.connect(out); out.connect(rig.drumBus); send(out, rig.reverbIn, 0.16);
  const offs = [0, 0.009, 0.018, 0.03];
  offs.forEach((off, i) => {
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx);
    const ng = gainNode(ctx, 0);
    envAd(ng.gain, t + off, 0.001, i === 3 ? 0.5 : 0.75, i === 3 ? 0.16 : 0.035);
    n.connect(ng); ng.connect(bp);
    n.start(t + off); n.stop(t + off + 0.2);
  });
}

function hat(rig, t, o = {}) {
  const ctx = rig.ctx;
  const open = o.open ?? false;
  const out = gainNode(ctx, o.gain ?? 1);
  const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx);
  const hp = filt(ctx, 'highpass', open ? 6800 : 7800);
  const ng = gainNode(ctx, 0);
  envAd(ng.gain, t, 0.001, 0.8, open ? 0.30 : (o.decay ?? 0.045));
  n.connect(hp); hp.connect(ng); ng.connect(out); out.connect(rig.drumBus);
  n.start(t); n.stop(t + (open ? 0.36 : 0.08));
}

function cowbell(rig, t, o = {}) {
  const ctx = rig.ctx;
  const f = o.freq ?? 620;
  const g = o.gain ?? 1;
  const out = gainNode(ctx, g);
  const o1 = ctx.createOscillator(); o1.type = 'square'; o1.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = f * 1.48;
  const mix = gainNode(ctx, 0.32);
  o1.connect(mix); o2.connect(mix);
  const s = shaper(ctx, 2.4);
  const bp = filt(ctx, 'bandpass', clamp(f * 2.4, 900, 6200), 0.9);
  const eg = gainNode(ctx, 0);
  envAd(eg.gain, t, 0.002, 1, o.dur ?? 0.13);
  mix.connect(s); s.connect(bp); bp.connect(eg); eg.connect(out); out.connect(rig.musicBus);
  send(out, rig.reverbIn, 0.10);
  o1.start(t); o2.start(t); o1.stop(t + 0.3); o2.stop(t + 0.3);
}

function perc(rig, t, o = {}) {
  const ctx = rig.ctx;
  const variant = o.variant ?? 0;
  const out = gainNode(ctx, o.gain ?? 1);
  if (variant === 0) { // bongo / tom-ish
    const osc = ctx.createOscillator(); osc.type = 'sine';
    const f = o.freq ?? 300;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 0.72, t + 0.06);
    const eg = gainNode(ctx, 0); envAd(eg.gain, t, 0.001, 0.8, 0.11);
    osc.connect(eg); eg.connect(out);
    osc.start(t); osc.stop(t + 0.16);
  } else { // shaker / tamb
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx);
    const bp = filt(ctx, 'bandpass', 5900, 0.9);
    const eg = gainNode(ctx, 0); envAd(eg.gain, t, 0.004, 0.55, 0.06);
    n.connect(bp); bp.connect(eg); eg.connect(out);
    n.start(t); n.stop(t + 0.1);
  }
  out.connect(rig.drumBus);
}

function rim(rig, t, o = {}) {
  const ctx = rig.ctx;
  const out = gainNode(ctx, o.gain ?? 1);
  const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 480;
  const eg = gainNode(ctx, 0); envAd(eg.gain, t, 0.001, 0.7, 0.045);
  const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx);
  const hp = filt(ctx, 'highpass', 2500);
  const ng = gainNode(ctx, 0); envAd(ng.gain, t, 0.001, 0.35, 0.02);
  osc.connect(eg); n.connect(hp); hp.connect(ng);
  eg.connect(out); ng.connect(out); out.connect(rig.drumBus);
  osc.start(t); osc.stop(t + 0.08); n.start(t); n.stop(t + 0.04);
}

function fx808(rig, t, o = {}) {
  const ctx = rig.ctx;
  const f = o.freq, from = o.from;
  const dur = o.dur ?? 0.5, g = o.gain ?? 1, drive = o.drive ?? 3.2;
  const out = gainNode(ctx, 1);
  const osc = ctx.createOscillator(); osc.type = 'sine';
  if (from && from > 0) {
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(f, t + Math.min(0.16, Math.max(0.05, dur * 0.5)));
  } else {
    osc.frequency.setValueAtTime(f, t);
  }
  const eg = gainNode(ctx, 0);
  const a = 0.006;
  eg.gain.setValueAtTime(0.0001, t);
  eg.gain.linearRampToValueAtTime(g, t + a);
  eg.gain.setValueAtTime(g, t + a + dur);
  eg.gain.exponentialRampToValueAtTime(0.0001, t + a + dur + 0.09);
  eg.gain.setValueAtTime(0, t + a + dur + 0.1);
  const s = shaper(ctx, drive);
  const lp = filt(ctx, 'lowpass', 460, 0.9);
  osc.connect(eg); eg.connect(s); s.connect(lp); lp.connect(out); out.connect(rig.bassBus);
  osc.start(t); osc.stop(t + a + dur + 0.16);
}

function bass(rig, t, o = {}) {
  const ctx = rig.ctx;
  const f = o.freq, dur = o.dur ?? 0.24, g = o.gain ?? 1;
  const out = gainNode(ctx, 1);
  const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f;
  const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = f / 2;
  const lp = filt(ctx, 'lowpass', 900, 0.7);
  lp.frequency.setValueAtTime(900, t);
  lp.frequency.exponentialRampToValueAtTime(170, t + 0.16);
  const eg = gainNode(ctx, 0);
  envAd(eg.gain, t, 0.004, g * 0.8, Math.max(0.08, dur * 0.5), dur * 0.4);
  const sg = gainNode(ctx, 0.5);
  osc.connect(lp); lp.connect(eg); sub.connect(sg); sg.connect(eg);
  eg.connect(out); out.connect(rig.bassBus);
  osc.start(t); sub.start(t); osc.stop(t + dur + 0.5); sub.stop(t + dur + 0.5);
}

function lead(rig, t, o = {}) {
  const ctx = rig.ctx;
  const f = o.freq, dur = o.dur ?? 0.22, g = o.gain ?? 1;
  const out = gainNode(ctx, 1);
  const o1 = ctx.createOscillator(); o1.type = o.type ?? 'sawtooth'; o1.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = o.type ?? 'sawtooth'; o2.frequency.value = f;
  o1.detune.value = -6; o2.detune.value = 6;
  const lp = filt(ctx, 'lowpass', 2600, 0.9);
  const eg = gainNode(ctx, 0);
  envAd(eg.gain, t, 0.01, g * 0.5, Math.max(0.1, dur * 0.35), dur * 0.55);
  o1.connect(lp); o2.connect(lp); lp.connect(eg); eg.connect(out); out.connect(rig.musicBus);
  send(out, rig.delayIn, 0.22); send(out, rig.reverbIn, 0.12);
  o1.start(t); o2.start(t); o1.stop(t + dur + 0.6); o2.stop(t + dur + 0.6);
}

function pluck(rig, t, o = {}) {
  const ctx = rig.ctx;
  const f = o.freq, g = o.gain ?? 1;
  const out = gainNode(ctx, g);
  const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = f;
  const bp = filt(ctx, 'bandpass', clamp(f * 2, 400, 8000), 1.2);
  const eg = gainNode(ctx, 0); envAd(eg.gain, t, 0.002, 0.9, o.dur ?? 0.24);
  osc.connect(bp); bp.connect(eg); eg.connect(out); out.connect(rig.musicBus);
  send(out, rig.reverbIn, 0.18);
  osc.start(t); osc.stop(t + 0.6);
}

function piano(rig, t, o = {}) {
  const ctx = rig.ctx;
  const f = o.freq, dur = o.dur ?? 0.9, g = o.gain ?? 1;
  const out = gainNode(ctx, g * 0.7);
  const carrier = ctx.createOscillator(); carrier.type = 'sine'; carrier.frequency.value = f;
  const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.value = f * 2.01;
  const modG = gainNode(ctx, 0);
  modG.gain.setValueAtTime(f * 1.6, t);
  modG.gain.exponentialRampToValueAtTime(f * 0.08, t + 0.14);
  mod.connect(modG); modG.connect(carrier.frequency);
  const eg = gainNode(ctx, 0); envAd(eg.gain, t, 0.002, 1, dur);
  carrier.connect(eg); eg.connect(out); out.connect(rig.musicBus);
  send(out, rig.reverbIn, 0.14);
  carrier.start(t); mod.start(t); carrier.stop(t + dur + 0.4); mod.stop(t + dur + 0.4);
}

function choir(rig, t, o = {}) {
  const ctx = rig.ctx;
  const f = o.freq, dur = o.dur ?? 2, g = o.gain ?? 1;
  const out = gainNode(ctx, 0);
  const formants = [[700, 1.0], [1150, 0.55], [2650, 0.28]];
  const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f;
  o2.detune.value = 9;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 4.6;
  const lfoG = gainNode(ctx, 5); lfo.connect(lfoG); lfoG.connect(o1.detune); lfoG.connect(o2.detune);
  for (const [ff, amp] of formants) {
    const bp = filt(ctx, 'bandpass', ff, 4.5);
    const fg = gainNode(ctx, amp);
    o1.connect(bp); o2.connect(bp); bp.connect(fg); fg.connect(out);
  }
  const eg = out.gain;
  const a = 0.28;
  eg.setValueAtTime(0.0001, t);
  eg.linearRampToValueAtTime(g * 0.5, t + a);
  eg.setValueAtTime(g * 0.5, t + dur);
  eg.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
  eg.setValueAtTime(0, t + dur + 0.62);
  out.connect(rig.musicBus);
  send(out, rig.reverbIn, 0.35);
  o1.start(t); o2.start(t); lfo.start(t);
  o1.stop(t + dur + 0.8); o2.stop(t + dur + 0.8); lfo.stop(t + dur + 0.8);
}

function pad(rig, t, o = {}) {
  const ctx = rig.ctx;
  const freqs = o.freqs ?? [o.freq];
  const dur = o.dur ?? 3.6, g = (o.gain ?? 1) * (0.22 / Math.max(1, freqs.length / 3));
  const out = gainNode(ctx, 0);
  const lp = filt(ctx, 'lowpass', o.bright ? 1900 : 1250, 0.6);
  const oscs = [];
  for (const f of freqs) {
    for (const det of [-8, 7]) {
      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.value = f; osc.detune.value = det;
      osc.connect(lp); oscs.push(osc);
    }
  }
  lp.connect(out); out.connect(rig.musicBus);
  send(out, rig.reverbIn, 0.35);
  const a = o.attack ?? 0.9;
  const eg = out.gain;
  eg.setValueAtTime(0.0001, t);
  eg.linearRampToValueAtTime(g, t + a);
  eg.setValueAtTime(g, t + dur);
  eg.exponentialRampToValueAtTime(0.0001, t + dur + 1.2);
  eg.setValueAtTime(0, t + dur + 1.22);
  for (const osc of oscs) { osc.start(t); osc.stop(t + dur + 1.4); }
}

function strings(rig, t, o = {}) {
  const ctx = rig.ctx;
  const freqs = o.freqs ?? [o.freq];
  const dur = o.dur ?? 3, g = (o.gain ?? 1) * (0.16 / Math.max(1, freqs.length / 3));
  const out = gainNode(ctx, 0);
  const lp = filt(ctx, 'lowpass', 2300, 0.5);
  const oscs = [];
  for (const f of freqs) {
    for (const det of [-10, 0, 9]) {
      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.value = f; osc.detune.value = det;
      osc.connect(lp); oscs.push(osc);
    }
  }
  const lfo = ctx.createOscillator(); lfo.frequency.value = 5.2;
  const lfoG = gainNode(ctx, 4);
  lfo.connect(lfoG);
  lp.connect(out); out.connect(rig.musicBus);
  send(out, rig.reverbIn, 0.3);
  const a = 0.4;
  const eg = out.gain;
  eg.setValueAtTime(0.0001, t);
  eg.linearRampToValueAtTime(g, t + a);
  eg.setValueAtTime(g, t + dur);
  eg.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
  eg.setValueAtTime(0, t + dur + 0.92);
  for (const osc of oscs) { osc.start(t); osc.stop(t + dur + 1.1); lfoG.connect(osc.detune); }
  lfo.start(t); lfo.stop(t + dur + 1.2);
}

function stab(rig, t, o = {}) {
  const ctx = rig.ctx;
  const freqs = o.freqs ?? [o.freq];
  const g = o.gain ?? 1;
  const out = gainNode(ctx, g * 0.5);
  const lp = filt(ctx, 'lowpass', 2100, 1.0);
  const oscs = [];
  for (const f of freqs) {
    const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f;
    osc.connect(lp); oscs.push(osc);
  }
  const eg = gainNode(ctx, 0); envAd(eg.gain, t, 0.004, 1, o.dur ?? 0.26);
  lp.connect(eg); eg.connect(out); out.connect(rig.musicBus);
  send(out, rig.delayIn, 0.16);
  for (const osc of oscs) { osc.start(t); osc.stop(t + 0.8); }
}

function riser(rig, t, o = {}) {
  const ctx = rig.ctx;
  const dur = o.dur ?? 1.8, g = o.gain ?? 1;
  const out = gainNode(ctx, 0);
  const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx, 3);
  n.loop = true;
  const bp = filt(ctx, 'bandpass', 300, 2.2);
  bp.frequency.setValueAtTime(260, t);
  bp.frequency.exponentialRampToValueAtTime(6200, t + dur);
  const eg = out.gain;
  eg.setValueAtTime(0.0001, t);
  eg.linearRampToValueAtTime(g * 0.5, t + dur * 0.86);
  eg.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
  eg.setValueAtTime(0, t + dur + 0.03);
  n.connect(bp); bp.connect(out); out.connect(rig.fxBus);
  send(out, rig.reverbIn, 0.25);
  n.start(t); n.stop(t + dur + 0.1);
}

function impact(rig, t, o = {}) {
  const ctx = rig.ctx;
  const g = o.gain ?? 1;
  const out = gainNode(ctx, g);
  const osc = ctx.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(72, t);
  osc.frequency.exponentialRampToValueAtTime(36, t + 0.5);
  const eg = gainNode(ctx, 0); envAd(eg.gain, t, 0.002, 0.9, 0.65);
  osc.connect(eg);
  const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx);
  const lp = filt(ctx, 'lowpass', 900, 0.8);
  const ng = gainNode(ctx, 0); envAd(ng.gain, t, 0.002, 0.5, 0.45);
  n.connect(lp); lp.connect(ng);
  eg.connect(out); ng.connect(out); out.connect(rig.fxBus);
  send(out, rig.reverbIn, 0.5);
  osc.start(t); osc.stop(t + 0.9); n.start(t); n.stop(t + 0.7);
}

function crackle(rig, t, o = {}) {
  const ctx = rig.ctx;
  const dur = o.dur ?? 8, g = o.gain ?? 0.5;
  const n = ctx.createBufferSource(); n.buffer = crackleBuffer(ctx); n.loop = true;
  const hp = filt(ctx, 'highpass', 900);
  const eg = gainNode(ctx, 0);
  const a = 0.8;
  eg.gain.setValueAtTime(0.0001, t);
  eg.gain.linearRampToValueAtTime(g, t + a);
  eg.gain.setValueAtTime(g, t + dur);
  eg.gain.linearRampToValueAtTime(0.0001, t + dur + 1);
  eg.gain.setValueAtTime(0, t + dur + 1.01);
  n.connect(hp); hp.connect(eg); eg.connect(rig.fxBus);
  n.start(t); n.stop(t + dur + 1.1);
}

export const VOICES = { kick, snare, clap, hat, openhat: (r, t, o) => hat(r, t, { ...o, open: true }),
  cowbell, perc, rim, fx808, bass, lead, pluck, piano, choir, pad, strings, stab, riser, impact, crackle };

export function playEvent(rig, ev) {
  const fn = VOICES[ev.v];
  if (fn) fn(rig, ev.t, ev.o || {});
}

// Audition a single hit immediately (used by the sequencer UI).
export function audition(voice, o = {}) {
  const rig = liveRig();
  const t = liveCtx().currentTime + 0.02;
  playEvent(rig, { v: voice, t, o });
}
