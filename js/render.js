// AI VICTOR PHONK — Offline renderer.
// Renders composer event lists into real AudioBuffers (Web Audio
// OfflineAudioContext), reports genuine progress, normalizes, extracts
// waveform peaks, exports 16-bit WAV, and applies editor edits.

import { buildRig, playEvent, scheduleSidechain, masterFades, clamp } from './audio.js';
import { composeTrack, demoComposeInput, hashSeed } from './composer.js';

const SAMPLE_RATE = 44100;
const TAIL = 2.5; // seconds of reverb/delay tail rendered past the track end

// ---------------------------------------------------------------------------
// Core offline render
// ---------------------------------------------------------------------------

export async function renderEvents({ events, kickTimes, durationSec, bpm, mix, onProgress }) {
  const renderDur = durationSec + TAIL;
  const frames = Math.ceil(renderDur * SAMPLE_RATE);
  const ctx = new OfflineAudioContext(2, frames, SAMPLE_RATE);
  const rig = buildRig(ctx, mix);
  rig.setDelayTime((60 / bpm) * 0.75); // dotted-8th delay

  scheduleSidechain(rig, kickTimes.filter((t) => t < durationSec), {});
  masterFades(rig, durationSec + 1.9, 0.06, 1.6);

  for (const ev of events) {
    if (ev.t < renderDur) playEvent(rig, ev);
  }

  // Real progress: the offline context suspends at checkpoints while rendering.
  const steps = 30;
  let done = 0;
  const checkpoints = [];
  for (let k = 1; k < steps; k++) {
    checkpoints.push(
      ctx.suspend((k / steps) * renderDur).then(() => {
        done++;
        try { onProgress && onProgress(done / steps); } catch { /* UI callback */ }
        ctx.resume();
      })
    );
  }

  const buffer = await ctx.startRendering();
  await Promise.allSettled(checkpoints);
  return buffer;
}

// One-shot helper: composition input -> rendered, normalized audio + data.
export async function renderComposition(input, onProgress) {
  const comp = composeTrack(input);
  const buffer = await renderEvents({
    events: comp.events,
    kickTimes: comp.kickTimes,
    durationSec: comp.meta.durationSec,
    bpm: comp.meta.bpm,
    onProgress
  });
  normalizeBuffer(buffer, 0.92);
  return { comp, buffer, peaks: computePeaks(buffer) };
}

// ---------------------------------------------------------------------------
// Analysis / post-processing
// ---------------------------------------------------------------------------

export function normalizeBuffer(buffer, target = 0.92) {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const d = buffer.getChannelData(ch);
    for (let i = 0; i < d.length; i += 16) { // stride is plenty for peak detection
      const a = Math.abs(d[i]);
      if (a > peak) peak = a;
    }
  }
  if (peak < 1e-4 || peak >= target) return buffer; // silence or already hot
  const g = target / peak;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const d = buffer.getChannelData(ch);
    for (let i = 0; i < d.length; i++) d[i] *= g;
  }
  return buffer;
}

export function computePeaks(buffer, buckets = 1600) {
  const chans = [];
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) chans.push(buffer.getChannelData(ch));
  const left = new Float32Array(buckets);
  const right = new Float32Array(buckets);
  const per = Math.max(1, Math.floor(buffer.length / buckets));
  for (let b = 0; b < buckets; b++) {
    const start = b * per;
    const end = Math.min(buffer.length, start + per);
    let l = 0, r = 0;
    for (let i = start; i < end; i += 4) {
      const a = Math.abs(chans[0][i]);
      if (a > l) l = a;
      if (chans[1]) {
        const c = Math.abs(chans[1][i]);
        if (c > r) r = c;
      } else r = l;
    }
    left[b] = l; right[b] = r;
  }
  return { left, right, buckets };
}

export function computeRms(buffer) {
  let sum = 0, n = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const d = buffer.getChannelData(ch);
    for (let i = 0; i < d.length; i += 8) { sum += d[i] * d[i]; n++; }
  }
  return Math.sqrt(sum / Math.max(1, n));
}

// ---------------------------------------------------------------------------
// WAV export (16-bit PCM stereo)
// ---------------------------------------------------------------------------

export function encodeWav(buffer) {
  const numCh = Math.min(2, buffer.numberOfChannels);
  const len = buffer.length;
  const bytesPerSample = 2;
  const dataSize = len * numCh * bytesPerSample;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);              // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * numCh * bytesPerSample, true);
  view.setUint16(32, numCh * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const chans = [];
  for (let ch = 0; ch < numCh; ch++) chans.push(buffer.getChannelData(ch));
  let off = 44;
  for (let i = 0; i < len; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = clamp(chans[ch][i], -1, 1);
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ---------------------------------------------------------------------------
// Track audio cache (LRU, cap 6 rendered tracks in memory)
// ---------------------------------------------------------------------------

const audioCache = new Map();
const CACHE_CAP = 6;

function cacheSet(key, val) {
  if (audioCache.has(key)) audioCache.delete(key);
  audioCache.set(key, val);
  while (audioCache.size > CACHE_CAP) {
    const oldest = audioCache.keys().next().value;
    audioCache.delete(oldest);
  }
}

export function cacheGet(key) { return audioCache.get(key); }
export function cachePeek(key) { return audioCache.has(key); }

// Deterministic key for a track's current audio state (seed + edits).
export function trackAudioKey(track) {
  const base = track.kind === 'demo' ? `demo:${track.seed}` : `gen:${track.seed}`;
  return base + (track.edits ? ':' + hashSeed(JSON.stringify(track.edits)) : '');
}

// Return (rendering if needed) the AudioBuffer + composition + peaks for a track.
export async function ensureTrackAudio(track, onProgress) {
  const key = trackAudioKey(track);
  const hit = audioCache.get(key);
  if (hit) return hit;

  const input = track.kind === 'demo' ? demoComposeInput(track) : track.gen;
  const { comp, buffer, peaks } = await renderComposition(input, onProgress);
  let finalBuffer = buffer;
  let finalPeaks = peaks;
  if (track.edits) {
    finalBuffer = await applyEditsToBuffer(buffer, track.edits);
    finalPeaks = computePeaks(finalBuffer);
  }
  const audio = { key, comp, buffer: finalBuffer, peaks: finalPeaks };
  cacheSet(key, audio);
  return audio;
}

// ---------------------------------------------------------------------------
// Editor DSP: trim / fade / gain / tempo / pitch on a rendered buffer
// ---------------------------------------------------------------------------

function sliceBuffer(buffer, startFrame, endFrame) {
  const len = Math.max(1, endFrame - startFrame);
  const out = new AudioBuffer({ length: len, sampleRate: buffer.sampleRate, numberOfChannels: buffer.numberOfChannels });
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    out.getChannelData(ch).set(buffer.getChannelData(ch).subarray(startFrame, endFrame));
  }
  return out;
}

// OLA time-stretch (Hann grains at 50% overlap). Preserves pitch.
function stretchBuffer(buffer, factor) {
  const f = clamp(factor, 0.4, 3);
  if (Math.abs(f - 1) < 0.001) return buffer;
  const sr = buffer.sampleRate;
  const G = Math.floor(sr * 0.05) | 0;      // 50 ms grain
  const Hs = Math.floor(G / 2) | 0;         // synthesis hop
  const Ha = Hs / f;                        // analysis hop
  const outLen = Math.max(G, Math.round(buffer.length * f));
  const out = new AudioBuffer({ length: outLen, sampleRate: sr, numberOfChannels: buffer.numberOfChannels });
  const win = new Float32Array(G);
  for (let i = 0; i < G; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (G - 1));
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    const grains = Math.ceil(outLen / Hs) + 1;
    for (let g = 0; g < grains; g++) {
      const outPos = g * Hs;
      const inPos = g * Ha;
      for (let a = 0; a < G; a++) {
        const o = outPos + a;
        if (o >= outLen) break;
        const ip = inPos + a;
        const i0 = Math.floor(ip);
        if (i0 >= src.length - 1) break;
        const frac = ip - i0;
        const s = src[i0] * (1 - frac) + src[i0 + 1] * frac;
        dst[o] += s * win[a];
      }
    }
  }
  return out;
}

// Pitch shift = stretch by r (pitch preserved) then resample at rate r.
async function pitchShiftBuffer(buffer, semis) {
  if (!semis) return buffer;
  const r = Math.pow(2, semis / 12);
  const stretched = stretchBuffer(buffer, r);
  const ctx = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const src = ctx.createBufferSource();
  src.buffer = stretched;
  src.playbackRate.value = r;
  src.connect(ctx.destination);
  src.start();
  return ctx.startRendering();
}

// edits = { trimStart (0-100 %), trimEnd (0-100 %), fadeIn (0-100),
//           fadeOut (0-100), gain (0-200 %), tempo (50-200 %), pitch (-12..12 st) }
export async function applyEditsToBuffer(buffer, edits = {}) {
  const trimStart = clamp((edits.trimStart ?? 0) / 100, 0, 0.98);
  const trimEnd = clamp((edits.trimEnd ?? 100) / 100, trimStart + 0.02, 1);

  let b = buffer;
  const startFrame = Math.floor(b.length * trimStart);
  const endFrame = Math.floor(b.length * trimEnd);
  if (startFrame > 0 || endFrame < b.length) b = sliceBuffer(b, startFrame, endFrame);

  if (edits.pitch) b = await pitchShiftBuffer(b, clamp(edits.pitch, -12, 12));

  const tempo = clamp((edits.tempo ?? 100) / 100, 0.5, 2);
  if (Math.abs(tempo - 1) > 0.001) b = stretchBuffer(b, 1 / tempo);

  const sr = b.sampleRate;
  const fadeInS = clamp((edits.fadeIn ?? 0) / 100 * 4, 0, b.length / sr);
  const fadeOutS = clamp((edits.fadeOut ?? 0) / 100 * 4, 0, b.length / sr);
  const gain = clamp((edits.gain ?? 100) / 100, 0, 2);
  const inN = Math.floor(fadeInS * sr);
  const outN = Math.floor(fadeOutS * sr);
  // The fade/gain stage writes in place. If trim/pitch/tempo were all no-ops,
  // b is still the caller's buffer (possibly shared/cached) — copy before writing.
  if (b === buffer && (inN > 0 || outN > 0 || gain !== 1)) {
    const copy = new AudioBuffer({ length: b.length, sampleRate: sr, numberOfChannels: b.numberOfChannels });
    for (let ch = 0; ch < b.numberOfChannels; ch++) copy.getChannelData(ch).set(b.getChannelData(ch));
    b = copy;
  }
  for (let ch = 0; ch < b.numberOfChannels; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < inN; i++) d[i] *= i / Math.max(1, inN);
    for (let i = 0; i < outN; i++) {
      const idx = b.length - 1 - i;
      if (idx >= 0) d[idx] *= i / Math.max(1, outN);
    }
    if (gain !== 1) for (let i = 0; i < d.length; i++) d[i] *= gain;
  }
  return b;
}

// ---------------------------------------------------------------------------
// Export helpers for the labs (pattern loops)
// ---------------------------------------------------------------------------

export async function renderLoopToWav({ events, bpm, bars = 2, onProgress }) {
  const barSec = 240 / bpm;
  const durationSec = bars * barSec;
  const buffer = await renderEvents({
    events, kickTimes: events.filter((e) => e.v === 'kick').map((e) => e.t),
    durationSec, bpm, onProgress
  });
  normalizeBuffer(buffer, 0.9);
  return encodeWav(buffer);
}
