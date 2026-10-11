import { composeTrack, NOTES } from './composer.js';
import { renderEvents, normalizeBuffer, encodeWav } from './render.js';

const byId = (id) => document.getElementById(id);
const voiceLayer = {
  kick: ['kick'],
  snare: ['snare'],
  clap: ['clap'],
  hat: ['hihat'],
  openhat: ['hihat'],
  cowbell: ['cowbell'],
  perc: ['percussion'],
  rim: ['percussion'],
  fx808: ['808', 'bass'],
  lead: ['lead', 'synth'],
  pluck: ['lead', 'synth'],
  piano: ['piano', 'synth'],
  pad: ['pads', 'synth'],
  strings: ['strings', 'synth'],
  choir: ['synth'],
  stab: ['synth'],
  crackle: ['fx'],
  riser: ['fx'],
  impact: ['fx']
};
const genres = {
  phonk: 'Phonk',
  'drift-phonk': 'Drift Phonk',
  'brazilian-phonk': 'Brazilian Phonk',
  'aggressive-phonk': 'Aggressive Phonk',
  'dark-phonk': 'Dark Phonk',
  'atmospheric-phonk': 'Atmospheric Phonk',
  'night-drive': 'Night Drive',
  'gym-phonk': 'Gym Phonk',
  'chill-phonk': 'Chill Phonk',
  instrumental: 'Instrumental'
};
const moods = {
  dark: 'Dark',
  aggressive: 'Aggressive',
  energetic: 'Hype',
  chill: 'Chill',
  mysterious: 'Mysterious',
  cinematic: 'Mysterious',
  atmospheric: 'Mysterious',
  powerful: 'Aggressive'
};
const roots = Object.fromEntries(NOTES.map((note, index) => [note.toLowerCase(), index]));
let currentUrl = '';
const modelSelect = byId('ollama-model');

function setModelOptions(models, message) {
  modelSelect.replaceChildren();
  for (const model of models) {
    const option = document.createElement('option');
    option.value = model.name;
    option.textContent = model.name;
    modelSelect.appendChild(option);
  }
  if (!models.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No local model installed';
    modelSelect.appendChild(option);
  }
  modelSelect.disabled = models.length === 0;
  byId('ollama-status').textContent = message;
}

async function discoverLocalModels() {
  try {
    const response = await fetch('/ollama/api/tags', { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error('Ollama is not responding');
    const result = await response.json();
    const models = Array.isArray(result.models) ? result.models : [];
    setModelOptions(models, models.length
      ? 'Connected to Ollama on this PC. Choose a model to direct the local composition.'
      : 'Ollama is running, but no model is installed. Run: ollama pull qwen2.5:3b');
  } catch {
    setModelOptions([], 'Ollama is not reachable. Start Ollama locally to enable private model direction; offline generation still works.');
  }
}

async function getLocalDirection({ prompt, genre, mood, bpm, key, selected }) {
  const model = modelSelect.value;
  if (!model) return null;

  const response = await fetch('/ollama/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(90000),
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      options: { temperature: 0.7, num_predict: 180 },
      prompt: [
        'Act as a phonk music producer. Return JSON only with keys title, energy, featuredLayer.',
        'title: original short track title, maximum 48 characters.',
        'energy: number from 0.75 to 1.25; featuredLayer: choose exactly one available layer.',
        `User request: ${prompt.slice(0, 700)}`,
        `Keep these selected settings: genre=${genre}; mood=${mood}; bpm=${bpm}; key=${key}.`,
        `Available layers: ${selected.join(', ')}.`
      ].join('\n')
    })
  });
  if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
  const result = await response.json();
  const direction = JSON.parse(result.response || '{}');
  const title = typeof direction.title === 'string'
    ? direction.title.replace(/[<>\r\n]/g, '').trim().slice(0, 48)
    : '';
  const energy = Number(direction.energy);
  return {
    title,
    energy: Number.isFinite(energy) ? Math.min(1.25, Math.max(0.75, energy)) : 1,
    featuredLayer: selected.includes(direction.featuredLayer) ? direction.featuredLayer : ''
  };
}

function setStatus(message) {
  const status = byId('generation-status');
  if (status) status.textContent = message;
}

async function generateTrack() {
  const prompt = byId('track-prompt').value.trim();
  const selected = [...document.querySelectorAll('.instrument-option input:checked')].map((input) => input.value);
  const button = byId('generate-btn');
  if (!prompt) {
    setStatus('Describe the beat you want before generating it.');
    return;
  }
  if (!selected.length) {
    setStatus('Select at least one instrument layer.');
    return;
  }

  const bpm = Number(byId('bpm-input').value);
  const duration = Number(byId('duration-input').value);
  if (!Number.isInteger(bpm) || bpm < 60 || bpm > 200 || !Number.isInteger(duration) || duration < 30 || duration > 300) {
    setStatus('Set tempo from 60–200 BPM and duration from 30–300 seconds.');
    return;
  }

  const [note, scale = 'minor'] = byId('key-select').value.split('-');
  const input = {
    prompt,
    genre: genres[byId('genre-select').value] || 'Phonk',
    mood: moods[byId('mood-select').value] || 'Dark',
    bpm,
    duration,
    keyRoot: roots[note] ?? 0,
    keyScale: scale,
    intensity: 0.5 + Number(byId('energy-slider').value) / 100,
    seed: (Math.random() * 0xffffffff) >>> 0
  };

  button.disabled = true;
  setStatus('Composing original layers and rendering your mix locally…');
  try {
    let direction = null;
    if (modelSelect.value) {
      byId('ollama-status').textContent = `Asking ${modelSelect.value} for local producer direction…`;
      try {
        direction = await getLocalDirection({
          prompt,
          genre: input.genre,
          mood: input.mood,
          bpm,
          key: `${note} ${scale}`,
          selected
        });
        byId('ollama-status').textContent = `Local model guided ${direction.featuredLayer || 'overall'} emphasis and title.`;
      } catch (error) {
        byId('ollama-status').textContent = `Local model unavailable (${error.message}); using offline composition.`;
      }
    }

    if (direction) {
      input.title = direction.title;
      input.intensity = Math.min(1.5, input.intensity * direction.energy);
    }
    const composition = composeTrack(input);
    const events = composition.events
      .filter((event) => (voiceLayer[event.v] || []).some((layer) => selected.includes(layer)))
      .map((event) => {
        const eventCopy = { ...event, o: { ...event.o } };
        if (direction?.featuredLayer && (voiceLayer[event.v] || []).includes(direction.featuredLayer)) {
          eventCopy.o.gain = (eventCopy.o.gain ?? 1) * 1.2;
        }
        if (event.v === 'fx808') eventCopy.o.drive = 1.5 + (Number(byId('808-drive').value) / 100) * 3.5;
        if (['kick', 'snare', 'clap', 'hat', 'openhat', 'perc', 'rim'].includes(event.v)) {
          eventCopy.o.gain = (eventCopy.o.gain ?? 1) * (Number(byId('drum-slider').value) / 75);
        }
        return eventCopy;
      });

    if (!events.length) throw new Error('The selected layers produced no audio. Choose another instrument or style.');
    const audioBuffer = await renderEvents({
      events,
      kickTimes: events.filter((event) => event.v === 'kick').map((event) => event.t),
      durationSec: composition.meta.durationSec,
      bpm,
      mix: {
        bassGain: Number(byId('bass-slider').value) / 80,
        drumGain: Number(byId('drum-slider').value) / 75,
        masterDrive: 1.05 + Number(byId('master-drive').value) / 100 * 2.95,
        reverbLevel: Number(byId('reverb-mix').value) / 100
      },
      onProgress: (progress) => setStatus(`Rendering arrangement… ${Math.round(progress * 100)}%`)
    });
    normalizeBuffer(audioBuffer, 0.92);

    const blob = encodeWav(audioBuffer);
    const url = URL.createObjectURL(blob);
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = url;

    const filename = composition.meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'phonk-track';
    byId('generated-audio').src = url;
    byId('download-generated').href = url;
    byId('download-generated').download = `${filename}.wav`;
    byId('generated-title').textContent = composition.meta.title;
    byId('generated-details').textContent = `${composition.meta.genre} • ${composition.meta.mood} • ${bpm} BPM • ${composition.meta.keyName} • ${Math.round(audioBuffer.duration)}s • ${events.length} events`;
    byId('generated-result').hidden = false;
    window.dispatchEvent(new CustomEvent('phonk:generated', {
      detail: {
        id: Date.now(),
        title: composition.meta.title,
        creator: 'You',
        genre: composition.meta.genre,
        bpm,
        duration: `${Math.floor(audioBuffer.duration / 60)}:${String(Math.floor(audioBuffer.duration % 60)).padStart(2, '0')}`,
        artwork: 'assets/images/hero-4k.svg',
        audioUrl: url,
        downloadAllowed: true
      }
    }));
    setStatus('Original track rendered and mastered in your browser. Preview it or download the WAV.');
  } catch (error) {
    console.error('Track render failed:', error);
    setStatus(`Track render failed: ${error.message}`);
  } finally {
    button.disabled = false;
  }
}

const generateButton = byId('generate-btn');
if (generateButton) {
  generateButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    generateTrack();
  });
}

discoverLocalModels();

for (const id of ['energy-slider', 'bass-slider', 'drum-slider', '808-drive', 'master-drive', 'reverb-mix']) {
  const slider = byId(id);
  slider?.addEventListener('input', () => {
    slider.setAttribute('aria-valuetext', `${slider.value}%`);
  });
}