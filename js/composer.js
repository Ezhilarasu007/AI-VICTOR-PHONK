// AI VICTOR PHONK — Composer.
// Turns a prompt + settings into a complete arrangement of synthesis events:
//   { v: voiceName, t: absoluteSeconds, o: voiceOptions }
// Deterministic per seed, so every track can be re-rendered identically.

import { midiToFreq, clamp } from './audio.js';

// ---------------------------------------------------------------------------
// Seeded PRNG
// ---------------------------------------------------------------------------

export function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const chance = (rng, p) => rng() < p;
const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const round2 = (n) => Math.max(2, Math.round(n / 2) * 2);

// ---------------------------------------------------------------------------
// Keys and scales
// ---------------------------------------------------------------------------

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11] };
const PENT = [0, 2, 3, 4, 6, 7, 9, 10, 11]; // minor-pentatonic as scale-degree indices

export function keyName(root, scale) {
  return `${NOTES[((root % 12) + 12) % 12]} ${scale === 'major' ? 'Major' : 'Minor'}`;
}

function degToMidi(root, scale, deg, octave) {
  const sc = SCALES[scale] || SCALES.minor;
  const o = Math.floor(deg / 7);
  const d = ((deg % 7) + 7) % 7;
  return 12 * (octave + o + 1) + root + sc[d];
}

function chordMidi(root, scale, deg, octave) {
  return [deg, deg + 2, deg + 4].map((d) => degToMidi(root, scale, d, octave));
}

function chordLabel(midis) {
  const third = ((midis[1] % 12) - (midis[0] % 12) + 12) % 12;
  return NOTES[midis[0] % 12] + (third === 3 ? 'm' : '');
}

// ---------------------------------------------------------------------------
// Musical tables
// ---------------------------------------------------------------------------

const PROGRESSIONS = {
  Dark: [[0, 5, 2, 6], [0, 3, 5, 4], [0, 5, 3, 6]],
  Aggressive: [[0, 6, 5, 6], [0, 0, 5, 6], [0, 4, 5, 6]],
  Chill: [[0, 5, 3, 2], [0, 3, 5, 2], [0, 5, 6, 3]],
  Hype: [[0, 6, 3, 4], [0, 4, 5, 6], [0, 2, 5, 4]],
  Mysterious: [[0, 2, 5, 2], [0, 6, 5, 2], [0, 3, 0, 6]],
  Sad: [[0, 5, 2, 4], [0, 3, 6, 4]],
  Uplifting: [[0, 4, 5, 3], [0, 5, 3, 4]],
  Cyber: [[0, 6, 5, 3], [0, 2, 6, 5]]
};

// 16-step kick patterns (1 char per 16th, 'x' = hit).
const KICK_POOLS = {
  straight: ['x.....x...x.....', 'x.....x.....x...', 'x...x...x...x...'],
  drift: ['x...x..x..x.x...', 'x..x..x...x.x..x', 'x...x...x..x.x..'],
  brazil: ['x...x...x...x...', 'x..x..x..x..x...', 'x...x..x..x...x.'],
  sparse: ['x.......x.......', 'x.....x.....x...'],
  gym: ['x...x...x...x...', 'x..x..x...x.x...', 'x...x.x.x...x.x.']
};

const HAT_ROLL_BARS = 4;

// Cowbell riffs for brazilian phonk: steps and pentatonic degree indices.
const BRAZIL_RIFFS = [
  { steps: [0, 2, 3, 6, 8, 10, 11, 14], degs: [0, 0, 1, 2, 1, 0, 3, 2] },
  { steps: [0, 2, 4, 6, 8, 11, 12, 14], degs: [0, 2, 1, 3, 2, 1, 4, 2] },
  { steps: [2, 4, 6, 8, 10, 12, 14], degs: [1, 0, 2, 1, 3, 2, 0] }
];

// ---------------------------------------------------------------------------
// Genre profiles
// ---------------------------------------------------------------------------

const PROFILES = {
  'Phonk': {
    kick: KICK_POOLS.straight, snare: 'both', hats: 0.9, rolls: true, openHat: 0.5,
    perc: 0.8, percStyle: 'shaker', rim: true,
    cowbell: 0.6, cowStyle: 'sparse', bass: '808', slide: 0.35, drive: 3.2,
    lead: 'pluck', piano: 0.4, pad: 0.7, strings: 0.2, choir: 0.3, stab: 0.5,
    crackle: 0.5, riser: true, impact: true
  },
  'Brazilian Phonk': {
    kick: KICK_POOLS.brazil, snare: 'both', hats: 0.75, rolls: true, openHat: 0.5,
    perc: 0.9, percStyle: 'bongo', rim: true,
    cowbell: 0.95, cowStyle: 'riff', bass: '808', slide: 0.4, drive: 3.4,
    lead: 'pluck', piano: 0.2, pad: 0.6, strings: 0.1, choir: 0.2, stab: 0.4,
    crackle: 0.45, riser: true, impact: true
  },
  'Drift Phonk': {
    kick: KICK_POOLS.drift, snare: 'both', hats: 1, rolls: true, openHat: 0.6,
    perc: 0.7, percStyle: 'shaker', rim: false,
    cowbell: 0.5, cowStyle: 'sparse', bass: '808', slide: 0.55, drive: 3.7,
    lead: 'lead', piano: 0.2, pad: 0.6, strings: 0.2, choir: 0.3, stab: 0.7,
    crackle: 0.35, riser: true, impact: true
  },
  'Aggressive Phonk': {
    kick: KICK_POOLS.drift, snare: 'both', hats: 1.05, rolls: true, openHat: 0.55,
    perc: 0.7, percStyle: 'shaker', rim: false,
    cowbell: 0.35, cowStyle: 'sparse', bass: '808', slide: 0.3, drive: 4,
    lead: 'lead', piano: 0.1, pad: 0.5, strings: 0.2, choir: 0.2, stab: 0.8,
    crackle: 0.3, riser: true, impact: true
  },
  'Dark Phonk': {
    kick: KICK_POOLS.sparse, snare: 'snare', hats: 0.7, rolls: false, openHat: 0.4,
    perc: 0.5, percStyle: 'shaker', rim: true,
    cowbell: 0.4, cowStyle: 'sparse', bass: '808', slide: 0.4, drive: 3.4,
    lead: 'pluck', piano: 0.4, pad: 0.9, strings: 0.3, choir: 0.5, stab: 0.3,
    crackle: 0.55, riser: true, impact: true
  },
  'Atmospheric Phonk': {
    kick: KICK_POOLS.sparse, snare: 'clap', hats: 0.5, rolls: false, openHat: 0.45,
    perc: 0.4, percStyle: 'shaker', rim: false,
    cowbell: 0.25, cowStyle: 'sparse', bass: 'sub', slide: 0.15, drive: 2.6,
    lead: 'pluck', piano: 0.5, pad: 1.2, strings: 0.7, choir: 0.7, stab: 0.1,
    crackle: 0.7, riser: true, impact: true
  },
  'Night Drive': {
    kick: KICK_POOLS.straight, snare: 'both', hats: 0.8, rolls: true, openHat: 0.5,
    perc: 0.6, percStyle: 'shaker', rim: false,
    cowbell: 0.35, cowStyle: 'melody', bass: '808', slide: 0.3, drive: 3,
    lead: 'lead', piano: 0.3, pad: 1, strings: 0.3, choir: 0.3, stab: 0.5,
    crackle: 0.4, riser: true, impact: true
  },
  'Gym Phonk': {
    kick: KICK_POOLS.gym, snare: 'both', hats: 1.1, rolls: true, openHat: 0.5,
    perc: 0.7, percStyle: 'shaker', rim: false,
    cowbell: 0.4, cowStyle: 'sparse', bass: '808', slide: 0.25, drive: 3.8,
    lead: 'lead', piano: 0.2, pad: 0.6, strings: 0.3, choir: 0.2, stab: 0.6,
    crackle: 0.25, riser: true, impact: true
  },
  'Chill Phonk': {
    kick: KICK_POOLS.sparse, snare: 'snare', hats: 0.5, rolls: false, openHat: 0.5,
    perc: 0.5, percStyle: 'shaker', rim: true,
    cowbell: 0.3, cowStyle: 'sparse', bass: 'sub', slide: 0.1, drive: 2.4,
    lead: 'piano', piano: 0.8, pad: 1, strings: 0.2, choir: 0.3, stab: 0.1,
    crackle: 0.7, riser: false, impact: false
  },
  'Instrumental': {
    kick: KICK_POOLS.straight, snare: 'snare', hats: 0.8, rolls: true, openHat: 0.5,
    perc: 0.6, percStyle: 'shaker', rim: true,
    cowbell: 0.5, cowStyle: 'sparse', bass: '808', slide: 0.3, drive: 3.2,
    lead: 'pluck', piano: 0.5, pad: 0.8, strings: 0.3, choir: 0.3, stab: 0.4,
    crackle: 0.5, riser: true, impact: true
  }
};

// Mood modifiers applied on top of the genre profile.
const MOODS = {
  'Dark': { hats: 0.9, drive: 0.3, bright: 0.85, scale: 'minor', choir: 0.15 },
  'Aggressive': { hats: 1.15, drive: 0.6, stab: 0.25, scale: 'minor' },
  'Chill': { hats: 0.6, drive: -0.6, piano: 0.3, rolls: false, scale: 'minor' },
  'Hype': { hats: 1.1, bass: 0.15, scale: 'minor' },
  'Mysterious': { choir: 0.25, bright: 0.85, scale: 'minor' },
  'Sad': { piano: 0.3, choir: 0.2, bright: 0.8, scale: 'minor' },
  'Uplifting': { bright: 1.2, scale: 'major' },
  'Cyber': { stab: 0.3, lead: 0.15, bright: 1.3, scale: 'minor' }
};

const MOOD_ORDER = Object.keys(MOODS);

// ---------------------------------------------------------------------------
// Prompt analysis
// ---------------------------------------------------------------------------

const GENRE_WORDS = [
  ['brazil', 'Brazilian Phonk'], ['automotivo', 'Brazilian Phonk'], ['favela', 'Brazilian Phonk'], ['baile', 'Brazilian Phonk'],
  ['drift', 'Drift Phonk'], ['tokyo', 'Drift Phonk'], ['slide', 'Drift Phonk'],
  ['aggressive', 'Aggressive Phonk'], ['angry', 'Aggressive Phonk'], ['rage', 'Aggressive Phonk'], ['hard', 'Aggressive Phonk'],
  ['atmospheric', 'Atmospheric Phonk'], ['ambient', 'Atmospheric Phonk'], ['cinematic', 'Atmospheric Phonk'], ['dreamy', 'Atmospheric Phonk'], ['space', 'Atmospheric Phonk'],
  ['night', 'Night Drive'], ['drive', 'Night Drive'], ['city', 'Night Drive'], ['neon', 'Night Drive'],
  ['gym', 'Gym Phonk'], ['workout', 'Gym Phonk'], ['training', 'Gym Phonk'], ['energy', 'Gym Phonk'],
  ['chill', 'Chill Phonk'], ['lofi', 'Chill Phonk'], ['lo-fi', 'Chill Phonk'], ['relax', 'Chill Phonk'], ['sleep', 'Chill Phonk'],
  ['dark', 'Dark Phonk'], ['evil', 'Dark Phonk'], ['haunt', 'Dark Phonk'], ['horror', 'Dark Phonk'], ['occult', 'Dark Phonk'],
  ['instrumental', 'Instrumental']
];

const MOOD_WORDS = [
  ['dark', 'Dark'], ['evil', 'Dark'], ['haunt', 'Dark'], ['night', 'Dark'], ['shadow', 'Dark'], ['noir', 'Dark'],
  ['sad', 'Sad'], ['cry', 'Sad'], ['melancholy', 'Sad'], ['rain', 'Sad'], ['lonely', 'Sad'], ['blue', 'Sad'],
  ['aggressive', 'Aggressive'], ['hard', 'Aggressive'], ['angry', 'Aggressive'], ['rage', 'Aggressive'], ['brutal', 'Aggressive'],
  ['chill', 'Chill'], ['calm', 'Chill'], ['soft', 'Chill'], ['relax', 'Chill'], ['smooth', 'Chill'],
  ['hype', 'Hype'], ['energy', 'Hype'], ['party', 'Hype'], ['turbo', 'Hype'], ['wild', 'Hype'],
  ['mysterious', 'Mysterious'], ['ritual', 'Mysterious'], ['cipher', 'Mysterious'], ['enigma', 'Mysterious'],
  ['uplifting', 'Uplifting'], ['happy', 'Uplifting'], ['hope', 'Uplifting'], ['sun', 'Uplifting'], ['rise', 'Uplifting'],
  ['cyber', 'Cyber'], ['neon', 'Cyber'], ['futuristic', 'Cyber'], ['digital', 'Cyber'], ['synth', 'Cyber']
];

export function analyzePrompt(text = '') {
  const t = String(text).toLowerCase();
  let genre = '';
  for (const [w, g] of GENRE_WORDS) { if (t.includes(w)) { genre = g; break; } }
  let mood = '';
  for (const [w, m] of MOOD_WORDS) { if (t.includes(w)) { mood = m; break; } }
  const bpmMatch = t.match(/(\d{2,3})\s*bpm/);
  const hints = {
    cowbell: /cowbell|cow bell/.test(t),
    vocal: /vocal|choir|voice|chant/.test(t),
    dark: /dark|evil|haunt|shadow/.test(t),
    heavy: /heavy|hard|bass drop|punch/.test(t)
  };
  return { genre, mood, bpm: bpmMatch ? clamp(parseInt(bpmMatch[1], 10), 60, 200) : 0, hints };
}

// ---------------------------------------------------------------------------
// Section planning
// ---------------------------------------------------------------------------

const SECTION_DEFS = [
  ['Intro', 0.10, 0.30],
  ['Build', 0.15, 0.55],
  ['Main', 0.25, 1.00],
  ['Break', 0.13, 0.42],
  ['Final', 0.25, 1.05],
  ['Outro', 0.12, 0.25]
];

function planSections(totalBars) {
  let rem = totalBars;
  const secs = [];
  SECTION_DEFS.forEach(([name, frac, energy], i) => {
    let bars;
    if (i === SECTION_DEFS.length - 1) bars = Math.max(2, rem);
    else bars = clamp(round2(totalBars * frac), 2, rem - 2 * (SECTION_DEFS.length - 1 - i));
    rem -= bars;
    secs.push({ name, bars, energy, startBar: 0, start: 0, dur: 0 });
  });
  let bar = 0;
  for (const s of secs) { s.startBar = bar; bar += s.bars; }
  return secs;
}

function layersFor(name, profile) {
  const L = {};
  switch (name) {
    case 'Intro':
      L.kick = false; L.snare = 0; L.hats = 0; L.bass = false; L.perc = 0;
      L.pad = 1; L.cowbell = profile.cowbell * 0.5;
      L.lead = profile.lead !== 'none' ? 0.5 : 0; L.choir = profile.choir; L.stab = 0; L.rim = false;
      break;
    case 'Build':
      L.kick = true; L.snare = 'half'; L.hats = 0.7; L.bass = true; L.perc = profile.perc * 0.7;
      L.pad = 1; L.cowbell = profile.cowbell * 0.7; L.lead = 0; L.choir = 0; L.stab = 0; L.rim = false;
      break;
    case 'Main':
      L.kick = true; L.snare = 1; L.hats = 1; L.bass = true; L.perc = profile.perc;
      L.pad = 1; L.cowbell = profile.cowbell; L.lead = profile.lead !== 'none' ? 1 : 0;
      L.choir = 0; L.stab = profile.stab; L.rim = profile.rim;
      break;
    case 'Break':
      L.kick = false; L.snare = 0; L.hats = 0.35; L.bass = false; L.perc = 0;
      L.pad = 1; L.cowbell = profile.cowbell * 0.4; L.lead = 0.6;
      L.choir = Math.max(profile.choir, 0.7); L.stab = 0; L.rim = false;
      break;
    case 'Final':
      L.kick = true; L.snare = 1; L.hats = 1.15; L.bass = true; L.perc = Math.min(1, profile.perc + 0.2);
      L.pad = 1; L.cowbell = Math.min(1, profile.cowbell + 0.15); L.lead = 1;
      L.choir = 0; L.stab = profile.stab; L.rim = profile.rim;
      break;
    default: // Outro
      L.kick = false; L.snare = 0; L.hats = 0.15; L.bass = false; L.perc = 0;
      L.pad = 1; L.cowbell = profile.cowbell * 0.3; L.lead = 0.4; L.choir = profile.choir; L.stab = 0; L.rim = false;
  }
  return L;
}

// ---------------------------------------------------------------------------
// Title generation
// ---------------------------------------------------------------------------

const TITLE_ADJ = {
  Dark: ['Midnight', 'Obsidian', 'Shadow', 'Phantom', 'Noir', 'Blackout', 'Void', 'Grim'],
  Aggressive: ['Savage', 'Brutal', 'Rampage', 'Fury', 'Vendetta', 'Hard', 'Iron'],
  Chill: ['Velvet', 'Silk', 'Mellow', 'Amber', 'Faded', 'Slow', 'Golden'],
  Hype: ['Turbo', 'Adrenal', 'Wildfire', 'Prime', 'Apex', 'Hyper', 'Voltage'],
  Mysterious: ['Eclipse', 'Enigma', 'Mirage', 'Cipher', 'Veil', 'Ritual', 'Hollow'],
  Sad: ['Rainy', 'Tears', 'Fading', 'Blue', 'Echo', 'Lonely', 'Winter'],
  Uplifting: ['Sunrise', 'Golden', 'Rising', 'Dawn', 'Bright', 'Sky', 'Gloria'],
  Cyber: ['Neon', 'Chrome', 'Digital', 'Vector', 'Laser', 'Circuit', 'Wired']
};

const TITLE_NOUN = {
  'Phonk': ['Phonk', 'Cowbells', '808', 'Reverb', 'Smoke', 'Boulevard', 'District', 'Maneuver'],
  'Brazilian Phonk': ['Brazil', 'Automotivo', 'Favela', 'Baile', 'Rio', 'Copacabana', 'Selvagem'],
  'Drift Phonk': ['Drift', 'Slide', 'Tires', 'Corner', 'Tokyo', 'Apex', 'Skid'],
  'Aggressive Phonk': ['Rampage', 'Assault', 'Pressure', 'Collision', 'Dominance', 'Impact'],
  'Dark Phonk': ['Shadows', 'Ritual', 'Catacombs', 'Eclipse', 'Abyss', 'Requiem'],
  'Atmospheric Phonk': ['Nebula', 'Horizon', 'Voyage', 'Aurora', 'Stratosphere', 'Dreams'],
  'Night Drive': ['Drive', 'Highway', 'Streets', 'City', 'Cruise', 'Skyline'],
  'Gym Phonk': ['Power', 'Grind', 'Beast', 'Reps', 'Iron', 'Momentum'],
  'Chill Phonk': ['Evening', 'Sundown', 'Coffee', 'Breeze', 'Memory', 'Sunday'],
  'Instrumental': ['Study', 'Canvas', 'Signal', 'Framework', 'Structure', 'Motion']
};

function makeTitle(genre, mood, rng) {
  const adjs = TITLE_ADJ[mood] || TITLE_ADJ.Dark;
  const nouns = TITLE_NOUN[genre] || TITLE_NOUN['Phonk'];
  const a = pick(rng, adjs);
  const n = pick(rng, nouns);
  return rng() < 0.3 ? `${n} ${pick(rng, adjs)}` : `${a} ${n}`;
}

// ---------------------------------------------------------------------------
// Producer notes
// ---------------------------------------------------------------------------

const MOOD_DESC = {
  Dark: 'brooding low-end and wide haunted space',
  Aggressive: 'maximum pressure, hard clipped drums',
  Chill: 'laid-back swing with warm tape texture',
  Hype: 'peak-time energy, relentless drive',
  Mysterious: 'cinematic tension with an occult edge',
  Sad: 'melancholic keys over slow-burning 808s',
  Uplifting: 'bright, open and triumphant',
  Cyber: 'futuristic synth tension, neon glare'
};

const MIX_TIPS = [
  'Keep the 808 mono and let the kick breathe at +2 dB — the sidechain is already ducking the melody.',
  'Ride the cowbell back 3 dB in the break so the pads open up.',
  'The hats carry the groove — automate the roll into every 4th bar for lift.',
  'If it feels crowded, high-pass the reverb send around 300 Hz.',
  'Loop the last half of Main for an 8-bar DJ blend.'
];

// ---------------------------------------------------------------------------
// The composer
// ---------------------------------------------------------------------------

// Builds all {v, t, o} events for the track. Pure data — no audio nodes here.
export function composeTrack(input = {}) {
  const analysis = analyzePrompt(input.prompt || '');
  const dir = input.direction || {};

  const genre = [input.genre, dir.genre, analysis.genre, 'Phonk'].find((g) => g && PROFILES[g]) || 'Phonk';
  const mood = [input.mood, dir.mood, analysis.mood, 'Dark'].find((m) => m && MOODS[m]) || 'Dark';
  const profile = { ...PROFILES[genre] };
  const moodM = MOODS[mood];

  const bpm = clamp(Math.round(input.bpm || dir.bpm || analysis.bpm || 140), 60, 200);
  const scale = input.keyScale || dir.keyScale || moodM.scale || 'minor';
  const root = clamp((input.keyRoot ?? dir.keyRoot ?? 0) | 0, 0, 11);
  const duration = clamp(input.duration || 120, 40, 300);
  const intensity = clamp(input.intensity ?? dir.energy ?? 1, 0.5, 1.5);
  const seed = (input.seed || hashSeed(`${input.prompt || 'phonk'}|${genre}|${mood}|${bpm}|${root}|${scale}|${duration}`)) >>> 0;
  const rng = mulberry32(seed);

  // Apply mood modifiers to the profile.
  profile.hats = (profile.hats + (moodM.hats ?? 1) - 1) * 0.5 + 0.5;
  profile.drive = clamp(profile.drive + (moodM.drive ?? 0), 2, 4.5);
  if (moodM.rolls === false) profile.rolls = false;
  if (moodM.piano && profile.piano < moodM.piano) profile.piano = moodM.piano;
  if (moodM.choir && profile.choir < moodM.choir) profile.choir = moodM.choir;
  if (moodM.stab && profile.stab < moodM.stab) profile.stab = moodM.stab;
  if (analysis.hints.cowbell) profile.cowbell = Math.max(profile.cowbell, 0.8);
  if (analysis.hints.dark) profile.pad = Math.max(profile.pad, 0.9);
  if (analysis.hints.heavy) profile.drive = Math.min(4.5, profile.drive + 0.4);
  if (analysis.hints.vocal) profile.choir = Math.max(profile.choir, 0.7);
  if (analysis.hints.cowbell && genre === 'Brazilian Phonk') profile.cowStyle = 'riff';

  const barSec = 240 / bpm;
  const stepSec = barSec / 16;
  const totalBars = Math.max(16, Math.round(duration / barSec / 2) * 2);
  const sections = planSections(totalBars);
  for (const s of sections) { s.dur = s.bars * barSec; }

  // Chords: progression A for the first half, variation B for the second.
  const progPool = PROGRESSIONS[mood] || PROGRESSIONS.Dark;
  const progA = pick(rng, progPool);
  let progB = pick(rng, progPool);
  if (progB === progA) progB = [progA[0], progA[3], progA[1], progA[2]];
  const halfBar = sections[0].bars + sections[1].bars + sections[2].bars;

  const chords = [];
  for (let b = 0; b < totalBars; b++) {
    const deg = (b < halfBar ? progA : progB)[b % 4];
    chords.push({
      deg,
      notes: chordMidi(root, scale, deg, 4),
      bass: degToMidi(root, scale, deg, 1),
      bass2: degToMidi(root, scale, deg, 2)
    });
  }

  const events = [];
  const kickTimes = [];
  const emit = (v, t, o) => events.push({ v, t: Math.max(0, t), o });
  const dr = clamp(0.7 + 0.5 * intensity, 0.7, 1.35); // drum level scale

  // ---- helpers ----
  const stepT = (bar, step) => (bar * 16 + step) * stepSec;
  const pentMidi = (absDeg, oct) => degToMidi(root, scale, absDeg, oct);

  for (const sec of sections) {
    const L = layersFor(sec.name, profile);
    const s0 = sec.startBar;
    const barT = (b) => b * barSec;
    const eScale = clamp(0.55 + 0.5 * sec.energy, 0.55, 1.15);

    // ---- crackle bed ----
    if (profile.crackle > 0 && sec.name !== 'Outro') {
      emit('crackle', barT(s0), { dur: sec.dur + barSec, gain: profile.crackle * 0.5 });
    } else if (profile.crackle > 0) {
      emit('crackle', barT(s0), { dur: sec.dur, gain: profile.crackle * 0.4 });
    }

    // ---- FX ----
    if (profile.riser && (sec.name === 'Build' || sec.name === 'Break') && sec.bars >= 3) {
      const rt = barT(s0 + sec.bars - 2);
      emit('riser', rt, { dur: 2 * barSec, gain: 0.5 });
    }
    if (profile.impact && (sec.name === 'Break' || sec.name === 'Final')) {
      emit('impact', barT(s0), { gain: 0.7 * eScale });
    }

    // ---- PAD + strings ----
    if (profile.pad > 0 && L.pad) {
      for (let b = s0; b < s0 + sec.bars; b++) {
        const c = chords[b];
        const freqs = c.notes.map(midiToFreq);
        if (moodM.bright !== undefined && moodM.bright > 1) freqs.push(midiToFreq(c.notes[0] + 12));
        emit('pad', barT(b), {
          freqs, dur: barSec * 0.98,
          gain: clamp(profile.pad * 0.8 * eScale, 0.15, 1.4),
          bright: moodM.bright > 1,
          attack: sec.name === 'Intro' ? 1.4 : 0.9
        });
      }
    }
    if (profile.strings > 0 && (sec.name === 'Main' || sec.name === 'Final' || sec.name === 'Intro')) {
      for (let b = s0; b < s0 + sec.bars; b += 2) {
        emit('strings', barT(b), {
          freqs: chords[b].notes.map(midiToFreq),
          dur: barSec * 2, gain: profile.strings * 0.9 * eScale
        });
      }
    }

    // ---- CHOIR (breaks, intro, outro) ----
    if (profile.choir > 0 && L.choir > 0) {
      for (let b = s0; b < s0 + sec.bars; b += 2) {
        emit('choir', barT(b), {
          freq: midiToFreq(chords[b].notes[0] + 12),
          dur: barSec * 1.8, gain: clamp(0.5 * L.choir, 0.2, 0.8) * eScale
        });
      }
    }

    // ---- drums ----
    for (let b = s0; b < s0 + sec.bars; b++) {
      const local = b - s0;
      const isFill = profile.rolls && local % HAT_ROLL_BARS === HAT_ROLL_BARS - 1 && chance(rng, sec.name === 'Final' ? 0.9 : 0.6);

      if (L.kick) {
        const pat = pick(rng, profile.kick);
        for (let s = 0; s < 16; s++) {
          if (pat[s] !== 'x') continue;
          const accent = s === 0 ? 1 : s === 8 ? 0.95 : 0.82;
          const t = stepT(b, s);
          emit('kick', t, { gain: clamp(accent * eScale * dr, 0.4, 1.2) });
          kickTimes.push(t);
        }
        // extra kick pickup before the final section or section end
        const nextSec = sections.find((x) => x.startBar === s0 + sec.bars);
        if (isFill && (sec.name === 'Build' || sec.name === 'Main')) {
          emit('kick', stepT(b, 14), { gain: 0.7 * eScale * dr });
          kickTimes.push(stepT(b, 14));
        }
        if (nextSec && nextSec.name === 'Final') {
          emit('kick', stepT(b, 15), { gain: 0.8 * eScale * dr });
          kickTimes.push(stepT(b, 15));
        }
      }

      // ---- snare / clap ----
      if (L.snare) {
        const half = L.snare === 'half';
        const hit = !half || (local % 2 === 1);
        if (hit && !(sec.name === 'Build' && local === sec.bars - 1)) {
          const t = stepT(b, 8);
          if (profile.snare === 'snare' || profile.snare === 'both') emit('snare', t, { gain: 0.85 * eScale, tune: profile.drive > 3.5 ? 1.05 : 1 });
          if (profile.snare === 'clap' || profile.snare === 'both') emit('clap', t, { gain: 0.7 * eScale });
        }
        // build: accel snare roll in the final bar
        if (sec.name === 'Build' && profile.rolls && local === sec.bars - 1) {
          for (let s = 8; s < 16; s++) {
            emit('snare', stepT(b, s), { gain: 0.3 + (s - 8) * 0.06, tune: 1.02 });
          }
        }
        if (isFill && (sec.name === 'Final')) {
          emit('snare', stepT(b, 15), { gain: 0.5 });
          emit('clap', stepT(b, 15), { gain: 0.4 });
        }
      }

      // ---- hats ----
      if (L.hats > 0) {
        const hats = profile.hats * L.hats;
        if (hats > 0.45) {
          for (let s = 0; s < 16; s += 2) {
            const t = stepT(b, s) + (s % 4 === 2 ? stepSec * 0.04 : 0);
            const accent = s % 4 === 2 ? 0.6 : 0.42;
            emit('hat', t, { gain: accent * hats * eScale });
          }
        } else {
          for (let s = 2; s < 16; s += 4) emit('hat', stepT(b, s), { gain: 0.4 * hats * eScale });
        }
        if (profile.rolls && isFill) {
          for (let s = 12; s < 16; s++) {
            emit('hat', stepT(b, s), { gain: 0.32 * hats * eScale });
            emit('hat', stepT(b, s) + stepSec * 0.5, { gain: 0.32 + (s - 12) * 0.09 });
          }
        }
        if (profile.openHat > 0 && chance(rng, profile.openHat * 0.5)) {
          emit('openhat', stepT(b, 14), { gain: 0.35 * eScale });
        }
      }

      // ---- rim ghosts ----
      if (L.rim && chance(rng, 0.5)) {
        emit('rim', stepT(b, pick(rng, [5, 13])), { gain: 0.22 * eScale });
      }

      // ---- perc ----
      if (L.perc > 0) {
        if (profile.percStyle === 'bongo') {
          for (const s of [3, 6, 11, 14]) {
            emit('perc', stepT(b, s), { variant: 0, freq: 240 + randInt(rng, 0, 90), gain: 0.35 * L.perc * eScale });
          }
        } else {
          for (let s = 1; s < 16; s += 2) {
            emit('perc', stepT(b, s), { variant: 1, gain: (s % 4 === 1 ? 0.28 : 0.2) * L.perc * eScale });
          }
        }
      }

      // ---- cowbell ----
      if (L.cowbell > 0) {
        if (profile.cowStyle === 'riff') {
          const riff = BRAZIL_RIFFS[(b + seed) % BRAZIL_RIFFS.length];
          riff.steps.forEach((s, i) => {
            const deg = PENT[riff.degs[i] % PENT.length];
            emit('cowbell', stepT(b, s), {
              freq: midiToFreq(pentMidi(deg, 5)),
              dur: 0.12, gain: 0.45 * L.cowbell * eScale
            });
          });
        } else if (profile.cowStyle === 'melody') {
          const tones = [0, 2, 4];
          for (let s = 0; s < 16; s += 4) {
            const c = chords[b];
            emit('cowbell', stepT(b, s), {
              freq: midiToFreq(c.notes[(s / 4) % 3] + 12),
              dur: 0.1, gain: 0.35 * L.cowbell * eScale
            });
          }
        } else if (chance(rng, 0.75)) {
          const c = chords[b];
          emit('cowbell', stepT(b, 8), { freq: midiToFreq(c.notes[0]), dur: 0.14, gain: 0.45 * L.cowbell * eScale });
          if (chance(rng, 0.5)) emit('cowbell', stepT(b, 14), { freq: midiToFreq(c.notes[1]), dur: 0.12, gain: 0.4 * L.cowbell * eScale });
        }
      }

      // ---- stabs ----
      if (L.stab > 0 && chance(rng, 0.8)) {
        const steps = mood === 'Aggressive' ? [0, 3, 10] : [0, 6, 10];
        for (const s of steps) {
          emit('stab', stepT(b, s), {
            freqs: chords[b].notes.map(midiToFreq),
            dur: 0.24, gain: 0.4 * L.stab * eScale
          });
        }
      }
    }

    // ---- lead melody ----
    if (profile.lead !== 'none' && L.lead > 0) {
      const level = L.lead * eScale;
      if (profile.lead === 'piano') {
        const shape = [0, 1, 2, 1, 2, 0, 1, 2];
        for (let b = s0; b < s0 + sec.bars; b++) {
          const c = chords[b];
          for (let i = 0; i < 8; i++) {
            emit('piano', stepT(b, i * 2), {
              freq: midiToFreq(c.notes[shape[i]] + 12),
              dur: 0.8, gain: 0.4 * level
            });
          }
        }
      } else {
        for (let b = s0; b < s0 + sec.bars; b += 2) {
          const transpose = Math.floor((b - s0) / 2) % 2 === 1;
          const rhythm = pick(rng, [[0, 3, 6, 10, 12], [0, 2, 4, 7, 10, 12, 14], [0, 4, 6, 11, 14]]);
          let p = randInt(rng, 2, 4);
          for (let i = 0; i < rhythm.length; i++) {
            const s = rhythm[i];
            p = clamp(p + randInt(rng, -2, 2), 0, 8);
            const deg = chords[b].deg + PENT[p] + (transpose ? 2 : 0);
            const nextS = rhythm[i + 1] ?? s + 4;
            const gap = (nextS - s) * stepSec;
            emit(profile.lead, stepT(b, s), {
              freq: midiToFreq(pentMidi(deg, profile.lead === 'lead' ? 4 : 5)),
              dur: profile.lead === 'lead' ? clamp(gap * 0.9, 0.15, 0.7) : 0.26,
              gain: 0.45 * level * (i === 0 ? 1 : 0.85)
            });
          }
        }
      }
    }

    // ---- 808 / bass ----
    if (L.bass) {
      const bScale = clamp(0.75 + 0.4 * sec.energy, 0.6, 1.15) * clamp(0.7 + 0.45 * intensity, 0.7, 1.25);
      let prevFreq = 0;
      for (let b = s0; b < s0 + sec.bars; b++) {
        const c = chords[b];
        const kicks = [];
        const pat = profile.kick[0];
        for (let s = 0; s < 16; s++) if (pat[s] === 'x') kicks.push(s);

        let hits;
        if (profile.bass === 'sub') hits = [0, 10];
        else if (profile.bass === '808' && kicks.length > 4) hits = kicks.filter((_, i) => i % 2 === 0);
        else hits = kicks;

        for (let i = 0; i < hits.length; i++) {
          const s = hits[i];
          const t = stepT(b, s);
          const nextS = hits[i + 1] ?? 16;
          const dur = clamp((nextS - s) * stepSec - stepSec * 0.4, 0.25, profile.bass === 'sub' ? 1.6 : 1.1);
          const freq = midiToFreq(profile.bass === 'sub' ? c.bass2 : c.bass);
          const o = { freq, dur, gain: 0.95 * bScale, drive: profile.drive };
          if (profile.slide > 0 && prevFreq > 0 && chance(rng, profile.slide * 0.5)) {
            o.from = prevFreq * (chance(rng, 0.5) ? 1.5 : 0.667);
          }
          emit('fx808', t, o);
          prevFreq = freq;
        }
        // final-section octave pickup
        if (sec.name === 'Final' && chance(rng, 0.35)) {
          emit('fx808', stepT(b, 15), { freq: midiToFreq(c.bass + 12), dur: 0.28, gain: 0.7 * bScale, drive: profile.drive });
        }
      }
    }
  }

  events.sort((a, b) => a.t - b.t);

  // ---- meta + notes ----
  const title = input.title || makeTitle(genre, mood, rng);
  const chordNames = progA.map((d) => chordLabel(chordMidi(root, scale, d, 4)));
  const structureLine = 'Structure: ' + sections.map((s) => `${s.name} ${s.bars} bars`).join(' · ');
  const notes = [
    `${genre} · ${bpm} BPM · ${keyName(root, scale)} — ${MOOD_DESC[mood] || MOOD_DESC.Dark}.`,
    structureLine,
    `Harmony: ${chordNames.join(' – ')} (cycles, shifts to a variation halfway).`,
    pick(rng, MIX_TIPS)
  ];

  return {
    events,
    kickTimes,
    plan: sections,
    meta: {
      title, genre, mood, bpm, root, scale,
      keyName: keyName(root, scale),
      durationSec: totalBars * barSec,
      bars: totalBars,
      seed,
      chords: chordNames,
      intensity
    },
    notes
  };
}

// ---------------------------------------------------------------------------
// Presets (the Quick Start cards)
// ---------------------------------------------------------------------------

export const PRESETS = [
  { id: 'brazilian-night', name: 'Brazilian Night', desc: 'Dark Brazilian Phonk with 808 bass', prompt: 'dark brazilian phonk night drive with cowbell riff and 808 slides', genre: 'Brazilian Phonk', mood: 'Dark', bpm: 140 },
  { id: 'dark-drift', name: 'Dark Drift', desc: 'Aggressive drift phonk beats', prompt: 'dark drift phonk aggressive slides tokyo street', genre: 'Drift Phonk', mood: 'Dark', bpm: 145 },
  { id: 'aggressive-bass', name: 'Aggressive Bass', desc: 'Heavy bass and punchy drums', prompt: 'aggressive hard bass drop punchy drums', genre: 'Aggressive Phonk', mood: 'Aggressive', bpm: 150 },
  { id: 'midnight-phonk', name: 'Midnight Phonk', desc: 'Atmospheric night drive vibes', prompt: 'midnight phonk cowbells dark atmosphere', genre: 'Phonk', mood: 'Dark', bpm: 138 },
  { id: 'neon-drive', name: 'Neon Drive', desc: 'Cyber-inspired neon sounds', prompt: 'neon cyber night drive futuristic synth phonk', genre: 'Night Drive', mood: 'Cyber', bpm: 142 },
  { id: 'gym-energy', name: 'Gym Energy', desc: 'High-energy workout beats', prompt: 'gym workout energy hard phonk powerful', genre: 'Gym Phonk', mood: 'Hype', bpm: 155 },
  { id: 'atmospheric-phonk', name: 'Atmospheric Phonk', desc: 'Cinematic ambient textures', prompt: 'atmospheric cinematic dreamy phonk space pad', genre: 'Atmospheric Phonk', mood: 'Mysterious', bpm: 130 },
  { id: 'hard-bass', name: 'Hard Bass', desc: 'Intense bass-focused tracks', prompt: 'hard bass heavy 808 hit brutal', genre: 'Phonk', mood: 'Aggressive', bpm: 148 },
  { id: 'instrumental-phonk', name: 'Instrumental Phonk', desc: 'Pure instrumental compositions', prompt: 'instrumental phonk clean melody focused', genre: 'Instrumental', mood: 'Dark', bpm: 140 },
  { id: 'vocal-phonk', name: 'Vocal Phonk', desc: 'Vocal-infused phonk tracks', prompt: 'vocal phonk choir chants haunted', genre: 'Dark Phonk', mood: 'Mysterious', bpm: 136 },
  { id: 'cyber-phonk', name: 'Cyber Phonk', desc: 'Futuristic cyber aesthetics', prompt: 'cyber phonk digital neon laser stabs', genre: 'Night Drive', mood: 'Cyber', bpm: 146 },
  { id: 'experimental-phonk', name: 'Experimental Phonk', desc: 'Avant-garde sound design', prompt: 'experimental phonk weird texture abstract', genre: 'Atmospheric Phonk', mood: 'Cyber', bpm: 128 }
];

export const GENRE_LIST = Object.keys(PROFILES);
export const MOOD_LIST = MOOD_ORDER;

// ---------------------------------------------------------------------------
// Demo catalog — 8 real tracks, synthesized on demand from these parameters.
// ---------------------------------------------------------------------------

const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function demoTrack(id, title, creator, genre, prompt, bpm, root, scale, durSec) {
  return {
    id, title, creator, genre, prompt, bpm, keyRoot: root, keyScale: scale,
    durationSec: durSec, duration: fmtDur(durSec),
    seed: hashSeed('avp-demo:' + title), isOriginal: true
  };
}

export const DEMO_CATALOG = [
  demoTrack(1, 'Brazilian Night Drive', 'AI Victor', 'Brazilian Phonk', 'dark brazilian phonk night drive cowbell 808 swing', 140, 0, 'minor', 165),
  demoTrack(2, 'Dark Drift Phonk', 'Phonk Master', 'Drift Phonk', 'dark drift phonk aggressive slide 808 tokyo', 145, 3, 'minor', 192),
  demoTrack(3, 'Aggressive Bass Drop', 'Beat Creator', 'Aggressive Phonk', 'aggressive hard bass drop punchy brutal', 150, 5, 'minor', 150),
  demoTrack(4, 'Midnight Cowbells', 'AI Victor', 'Phonk', 'midnight cowbell phonk dark atmospheric', 138, 8, 'minor', 180),
  demoTrack(5, 'Neon City Streets', 'Cyber Beats', 'Night Drive', 'neon city night drive cyber synth lead', 142, 7, 'minor', 175),
  demoTrack(6, 'Gym Energy', 'Workout Music', 'Gym Phonk', 'gym workout energy hard phonk powerful', 155, 2, 'minor', 200),
  demoTrack(7, 'Atmospheric Phonk', 'AI Victor', 'Atmospheric Phonk', 'atmospheric cinematic dreamy phonk space', 130, 9, 'minor', 240),
  demoTrack(8, 'Hard Bass Hit', 'Bass Master', 'Phonk', 'hard bass hit heavy 808 drop', 148, 1, 'minor', 140)
];

// Convenient single entry for a demo track's composition input.
export function demoComposeInput(t) {
  return {
    prompt: t.prompt, title: t.title, genre: t.genre,
    bpm: t.bpm, keyRoot: t.keyRoot, keyScale: t.keyScale,
    duration: t.durationSec, seed: t.seed
  };
}

export { makeTitle };
