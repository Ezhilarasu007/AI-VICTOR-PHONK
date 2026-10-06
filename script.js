// AI Victor Phonk - Optimized JavaScript
// Performance-optimized for all devices

// State Management
const state = {
    currentSection: 'home',
    isPlaying: false,
    currentTrack: null,
    queue: [],
    favorites: [],
    downloads: [],
    playlists: [],
    creations: [],
    recentlyPlayed: [],
    generatedTracks: [],
    shuffle: false,
    repeat: 'none',
    adminLoggedIn: false,
    reduceMotion: false,
    isPremium: false,
    isAdmin: false,
    adsEnabled: false,
    adLoaded: false,
    theme: 'default',
    customWallpaper: null
};

// Sample Music Data
const sampleTracks = [
    {
        id: 1,
        title: "Brazilian Night Drive",
        creator: "AI Victor",
        genre: "Brazilian Phonk",
        bpm: 140,
        duration: "2:45",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 1234
    },
    {
        id: 2,
        title: "Dark Drift Phonk",
        creator: "Phonk Master",
        genre: "Drift Phonk",
        bpm: 145,
        duration: "3:12",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 892
    },
    {
        id: 3,
        title: "Aggressive Bass Drop",
        creator: "Beat Creator",
        genre: "Aggressive Phonk",
        bpm: 150,
        duration: "2:30",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 2105
    },
    {
        id: 4,
        title: "Midnight Cowbells",
        creator: "AI Victor",
        genre: "Phonk",
        bpm: 138,
        duration: "3:00",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 756
    },
    {
        id: 5,
        title: "Neon City Streets",
        creator: "Cyber Beats",
        genre: "Night Drive",
        bpm: 142,
        duration: "2:55",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 1890
    },
    {
        id: 6,
        title: "Gym Energy",
        creator: "Workout Music",
        genre: "Gym Phonk",
        bpm: 155,
        duration: "3:20",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 2456
    },
    {
        id: 7,
        title: "Atmospheric Phonk",
        creator: "AI Victor",
        genre: "Atmospheric Phonk",
        bpm: 130,
        duration: "4:00",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 654
    },
    {
        id: 8,
        title: "Hard Bass Hit",
        creator: "Bass Master",
        genre: "Phonk",
        bpm: 148,
        duration: "2:20",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 1567
    },
    {
        id: 9,
        title: "Cowbell Madness",
        creator: "Phonk Producer",
        genre: "Brazilian Phonk",
        bpm: 146,
        duration: "3:15",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 3421
    },
    {
        id: 10,
        title: "Skele",
        creator: "Drift King",
        genre: "Drift Phonk",
        bpm: 140,
        duration: "2:50",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 2890
    },
    {
        id: 11,
        title: "Murder In My Mind",
        creator: "Phonk Legend",
        genre: "Dark Phonk",
        bpm: 142,
        duration: "3:05",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 4521
    },
    {
        id: 12,
        title: "Space Cowboy",
        creator: "AI Victor",
        genre: "Atmospheric Phonk",
        bpm: 128,
        duration: "4:30",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 1234
    },
    {
        id: 13,
        title: "Memphis Phonk",
        creator: "Beat Master",
        genre: "Phonk",
        bpm: 144,
        duration: "2:40",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 3678
    },
    {
        id: 14,
        title: "Dark Memphis",
        creator: "Shadow Beats",
        genre: "Dark Phonk",
        bpm: 146,
        duration: "3:20",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 2134
    },
    {
        id: 15,
        title: "Cowbell Heaven",
        creator: "Phonk Heaven",
        genre: "Brazilian Phonk",
        bpm: 138,
        duration: "2:55",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 4567
    },
    {
        id: 16,
        title: "Ghost Cowbell",
        creator: "Spectral",
        genre: "Phonk",
        bpm: 135,
        duration: "3:10",
        artwork: null,
        isAIOriginal: true,
        downloadAllowed: true,
        playCount: 1890
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
        try {
            initializeApp();
        } catch (error) {
            console.error('Initialization error:', error);
            const message = document.createElement('p');
            message.className = 'app-error';
            message.setAttribute('role', 'alert');
            message.textContent = 'The app could not finish starting. Reload the page or check the browser console for details.';
            document.body.prepend(message);
        }
    });
});

function initializeApp() {
    updateGreeting();
    setupEventListeners();
    initializeDrumSequencer();
    populateMusicSections();
    checkReduceMotionPreference();
    initializeThemeSwitcher();

    // Debounced greeting update
    let greetingTimeout;
    const updateGreetingDebounced = () => {
        clearTimeout(greetingTimeout);
        greetingTimeout = setTimeout(updateGreeting, 100);
    };

    // Update greeting every minute
    setInterval(updateGreetingDebounced, 60000);

}

// Dynamic Greeting System - Optimized
function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = document.getElementById('greeting');
    const subtitle = document.getElementById('greeting-subtitle');
    
    if (!greeting || !subtitle) return;
    
    let greetingText, subtitleText, timeOfDay;
    
    if (hour >= 5 && hour < 12) {
        greetingText = "Good Morning, Sir 👋";
        subtitleText = "Ready to create your next Phonk hit?";
        timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
        greetingText = "Good Afternoon, Sir 👋";
        subtitleText = "Let's build something powerful.";
        timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
        greetingText = "Good Evening, Sir 🌆";
        subtitleText = "Your next beat is waiting.";
        timeOfDay = 'evening';
    } else {
        greetingText = "Good Night, Sir 🌙";
        subtitleText = "Turn the night into sound.";
        timeOfDay = 'night';
    }
    
    // Only update if changed
    if (greeting.textContent !== greetingText) {
        greeting.textContent = greetingText;
        subtitle.textContent = subtitleText;
        updateTimeBasedEffects(timeOfDay);
    }
}

function updateTimeBasedEffects(timeOfDay) {
    const body = document.body;
    
    // Remove existing time-based classes
    body.classList.remove('time-morning', 'time-afternoon', 'time-evening', 'time-night');
    
    // Add current time-based class
    body.classList.add(`time-${timeOfDay}`);
}

// Navigation - Optimized with passive event listeners
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionId;
    }
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close mobile menu if open
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
}

// Event Listeners - Optimized with delegation
function setupEventListeners() {
    // Navigation buttons - Use event delegation
    document.querySelector('.nav-menu').addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-btn');
        if (btn) {
            const section = btn.dataset.section;
            if (section) showSection(section);
        }
    }, { passive: true });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.nav-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu, { passive: true });
    }
    
    // Generate button
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', startGeneration, { passive: false });
    }
    
    // Preset cards - Event delegation
    const presetGrid = document.querySelector('.preset-grid');
    if (presetGrid) {
        presetGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.preset-card');
            if (card) {
                const preset = card.dataset.preset;
                if (preset) loadPreset(preset);
            }
        }, { passive: true });
    }
    
    // Model cards - Event delegation
    const modelSelector = document.querySelector('.model-selector');
    if (modelSelector) {
        modelSelector.addEventListener('click', (e) => {
            const card = e.target.closest('.model-card');
            if (card) {
                document.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            }
        }, { passive: true });
    }
    
    // Library tabs - Event delegation
    const libraryTabs = document.querySelector('.library-tabs');
    if (libraryTabs) {
        libraryTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (btn) {
                const tab = btn.dataset.tab;
                if (tab) switchLibraryTab(tab);
            }
        }, { passive: true });
    }
    
    // Category tabs - Event delegation
    const categoryTabs = document.querySelector('.category-tabs');
    if (categoryTabs) {
        categoryTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (btn) {
                document.querySelectorAll('.category-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        }, { passive: true });
    }
    
    // Admin nav - Event delegation
    const adminNav = document.querySelector('.admin-nav');
    if (adminNav) {
        adminNav.addEventListener('click', (e) => {
            const btn = e.target.closest('.admin-nav-btn');
            if (btn) {
                const tab = btn.dataset.adminTab;
                if (tab) switchAdminTab(tab);
            }
        }, { passive: true });
    }
    
    // Star rating - Event delegation
    const starRating = document.querySelector('.star-rating');
    if (starRating) {
        starRating.addEventListener('click', (e) => {
            const star = e.target.closest('.star');
            if (star) {
                const rating = star.dataset.rating;
                highlightStars(rating);
            }
        }, { passive: true });
    }
    
    // Reduce motion preference
    const reduceMotionCheckbox = document.getElementById('reduce-motion');
    if (reduceMotionCheckbox) {
        reduceMotionCheckbox.addEventListener('change', (e) => {
            state.reduceMotion = e.target.checked;
            document.body.classList.toggle('reduced-motion', e.target.checked);
        }, { passive: true });
    }
    
    // Search input - Debounced
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(e.target.value);
            }, 300);
        }, { passive: true });
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Music Card Generation - Optimized
function createMusicCard(track) {
    const card = document.createElement('div');
    card.className = 'music-card';
    card.innerHTML = `
        <div class="music-card-artwork">
            <div class="artwork-placeholder">
                <img src="${track.artwork}" alt="${track.title} cover art" loading="lazy">
            </div>
        </div>
        <div class="music-card-info">
            <h4 class="music-card-title">${track.title}</h4>
            <p class="music-card-creator">${track.creator}</p>
            <div class="music-card-meta">
                <span>${track.genre}</span>
                <span>${track.duration}</span>
                <span>${track.bpm} BPM</span>
            </div>
            <span class="badge">${track.audioUrl ? 'Local Beat' : 'Sample data'}</span>
            <div class="music-card-controls">
                <button class="music-card-btn" data-action="favorite" data-id="${track.id}" aria-label="Favorite">♡</button>
            </div>
        </div>
    `;
    
    // Event delegation for card buttons
    card.addEventListener('click', (e) => {
        const btn = e.target.closest('.music-card-btn');
        if (btn) {
            const action = btn.dataset.action;
            const id = parseInt(btn.dataset.id);
            
            switch (action) {
                case 'favorite':
                    toggleFavorite(id);
                    break;
            }
            e.stopPropagation();
        }
    }, { passive: true });
    
    return card;
}

// Populate Music Sections - Optimized with document fragment
function populateMusicSections() {
    const sections = {
        'trending-music': sampleTracks.slice(0, 4),
        'new-releases': sampleTracks.slice(2, 6),
        'ai-originals': sampleTracks.slice(0, 4),
        'phonk-essentials': sampleTracks.filter(t => t.genre.includes('Phonk')).slice(0, 4),
        'brazilian-phonk': sampleTracks.filter(t => t.genre.includes('Brazilian')),
        'drift-phonk': sampleTracks.filter(t => t.genre.includes('Drift')),
        'night-drive': sampleTracks.filter(t => t.genre.includes('Night')),
        'aggressive-beats': sampleTracks.filter(t => t.genre.includes('Aggressive'))
    };
    
    Object.entries(sections).forEach(([sectionId, tracks]) => {
        const container = document.getElementById(sectionId);
        if (container && tracks.length > 0) {
            const fragment = document.createDocumentFragment();
            tracks.forEach(track => {
                fragment.appendChild(createMusicCard(track));
            });
            container.appendChild(fragment);
        }
    });
}

// Music Player - Optimized
function playTrack(trackId) {
    const track = sampleTracks.find(t => t.id === trackId);
    if (!track) return;
    if (!track.audioUrl) {
        alert('Audio playback is not available for sample catalogue entries.');
        return;
    }
    
    state.currentTrack = track;
    state.isPlaying = true;
    
    // Update mini player
    const miniPlayer = document.getElementById('mini-player');
    if (miniPlayer) {
        miniPlayer.style.display = 'block';
        document.getElementById('mini-player-title').textContent = track.title;
        document.getElementById('mini-player-creator').textContent = track.creator;
        document.getElementById('mini-play-btn').textContent = '⏸';
    }
    
    // Update full player
    const fullPlayerTitle = document.getElementById('full-player-title');
    const fullPlayerCreator = document.getElementById('full-player-creator');
    const fullPlayerDetails = document.getElementById('full-player-details');
    
    if (fullPlayerTitle) fullPlayerTitle.textContent = track.title;
    if (fullPlayerCreator) fullPlayerCreator.textContent = track.creator;
    if (fullPlayerDetails) fullPlayerDetails.textContent = `${track.bpm} BPM • ${track.genre} • ${track.duration}`;
    
    // Add to recently played
    if (!state.recentlyPlayed.includes(trackId)) {
        state.recentlyPlayed.unshift(trackId);
        if (state.recentlyPlayed.length > 20) state.recentlyPlayed.pop();
    }
    
    // Start visualizer animation
    startVisualizer();
}

function togglePlay() {
    state.isPlaying = !state.isPlaying;
    
    const miniPlayBtn = document.getElementById('mini-play-btn');
    const playBtn = document.getElementById('play-btn');
    
    if (miniPlayBtn) miniPlayBtn.textContent = state.isPlaying ? '⏸' : '▶';
    if (playBtn) playBtn.textContent = state.isPlaying ? '⏸' : '▶';
    
    if (state.isPlaying) {
        startVisualizer();
    } else {
        stopVisualizer();
    }
}

function previousTrack() {
    if (state.queue.length > 0) {
        const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
        if (currentIndex > 0) {
            playTrack(state.queue[currentIndex - 1].id);
        }
    }
}

function nextTrack() {
    if (state.queue.length > 0) {
        const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
        if (currentIndex < state.queue.length - 1) {
            playTrack(state.queue[currentIndex + 1].id);
        } else if (state.shuffle) {
            const randomIndex = Math.floor(Math.random() * state.queue.length);
            playTrack(state.queue[randomIndex].id);
        }
    }
}

function toggleShuffle() {
    state.shuffle = !state.shuffle;
    const shuffleBtn = document.getElementById('shuffle-btn');
    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', state.shuffle);
    }
}

function toggleRepeat() {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeat);
    state.repeat = modes[(currentIndex + 1) % modes.length];
    
    const repeatBtn = document.getElementById('repeat-btn');
    if (repeatBtn) {
        repeatBtn.textContent = state.repeat === 'none' ? '🔁' : state.repeat === 'all' ? '🔁' : '🔂';
        repeatBtn.classList.toggle('active', state.repeat !== 'none');
    }
}

function toggleFavorite(trackId) {
    const index = state.favorites.indexOf(trackId);
    if (index > -1) {
        state.favorites.splice(index, 1);
    } else {
        state.favorites.push(trackId);
    }
    
    // Update UI
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.textContent = state.favorites.includes(trackId) ? '♥' : '♡';
        favoriteBtn.classList.toggle('active', state.favorites.includes(trackId));
    }
}

function showFullPlayer() {
    const fullPlayer = document.getElementById('full-player');
    if (fullPlayer) {
        fullPlayer.style.display = 'flex';
    }
}

function hideFullPlayer() {
    const fullPlayer = document.getElementById('full-player');
    if (fullPlayer) {
        fullPlayer.style.display = 'none';
    }
}

function downloadTrack(trackId) {
    const track = sampleTracks.find(t => t.id === trackId) || state.currentTrack;
    if (!track || !track.downloadAllowed || !track.audioUrl) {
        alert('No downloadable audio is available for this sample.');
        return;
    }
    const downloadLink = document.createElement('a');
    downloadLink.href = track.audioUrl;
    downloadLink.download = `${track.title}.mp3`;
    downloadLink.click();
    if (!state.downloads.includes(track.id)) state.downloads.push(track.id);
}

function shareTrack() {
    if (state.currentTrack) {
        alert(`Share: ${state.currentTrack.title}`);
    }
}

function showQueue() {
    alert('Queue feature coming soon');
}

// Visualizer - Optimized
function startVisualizer() {
    const visualizerBars = document.querySelectorAll('.visualizer-bar');
    visualizerBars.forEach(bar => {
        bar.style.animationPlayState = 'running';
    });
}

function stopVisualizer() {
    const visualizerBars = document.querySelectorAll('.visualizer-bar');
    visualizerBars.forEach(bar => {
        bar.style.animationPlayState = 'paused';
    });
}

async function startGeneration() {
    const prompt = document.getElementById('track-prompt').value.trim();
    const bpm = Number(document.getElementById('bpm-input').value);
    const duration = Number(document.getElementById('duration-input').value);
    const genre = document.getElementById('genre-select').value;
    const mood = document.getElementById('mood-select').value;
    const key = document.getElementById('key-select').value;
    const instruments = [...document.querySelectorAll('.instrument-option input:checked')].map(input => input.value);
    const status = document.getElementById('generation-status');
    const generateButton = document.getElementById('generate-btn');

    if (!prompt) {
        status.textContent = 'Describe the beat you want before generating it.';
        return;
    }
    if (!Number.isInteger(bpm) || bpm < 60 || bpm > 200) {
        status.textContent = 'Set the tempo between 60 and 200 BPM.';
        return;
    }
    if (!Number.isInteger(duration) || duration < 30 || duration > 300) {
        status.textContent = 'Set the duration between 30 and 300 seconds.';
        return;
    }
    if (instruments.length === 0) {
        status.textContent = 'Select at least one instrument.';
        return;
    }

    generateButton.disabled = true;
    status.textContent = 'Synthesizing your beat locally…';
    try {
        const audioBuffer = await renderPhonkBeat({
            bpm,
            duration,
            genre,
            mood,
            key,
            instruments,
            seed: `${prompt}-${Date.now()}`
        });
        const wav = encodeWav(audioBuffer);
        const audioUrl = URL.createObjectURL(wav);
        const audio = document.getElementById('generated-audio');
        const download = document.getElementById('download-generated');
        const result = document.getElementById('generated-result');
        const title = prompt.split(/\s+/).slice(0, 6).join(' ').replace(/[<>]/g, '') || 'Phonk Beat';

        if (state.generatedAudioUrl) URL.revokeObjectURL(state.generatedAudioUrl);
        state.generatedAudioUrl = audioUrl;
        audio.src = audioUrl;
        download.href = audioUrl;
        download.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'phonk-beat'}.wav`;
        document.getElementById('generated-title').textContent = title;
        document.getElementById('generated-details').textContent =
            `${genre.replace('-', ' ')} • ${mood} • ${bpm} BPM • ${key.replace('-', ' ')} • ${duration}s`;
        result.hidden = false;
        status.textContent = 'Beat rendered locally. Preview it or download the WAV file.';
        state.generatedTracks.push({
            id: Date.now(),
            title,
            creator: 'You',
            genre,
            bpm,
            duration: `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`,
            artwork: 'assets/cover-dark.png',
            audioUrl,
            downloadAllowed: true
        });
    } catch (error) {
        console.error('Local beat rendering failed:', error);
        status.textContent = `Beat rendering failed: ${error.message}`;
    } finally {
        generateButton.disabled = false;
    }
}

async function renderPhonkBeat({ bpm, duration, genre, mood, key, instruments, seed: seedText }) {
    const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineContext) throw new Error('Offline audio rendering is not supported by this browser.');

    let seed = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
        seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619);
    }
    const random = () => {
        seed += 0x6D2B79F5;
        let value = seed;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };

    const sampleRate = 22050;
    const loopDuration = 60 / bpm * 16;
    const context = new OfflineContext(2, Math.ceil(sampleRate * loopDuration), sampleRate);
    const master = context.createDynamicsCompressor();
    const masterGain = context.createGain();
    const bassIntensity = Number(document.getElementById('bass-slider').value) / 100;
    const drumIntensity = Number(document.getElementById('drum-slider').value) / 100;
    const energy = Number(document.getElementById('energy-slider').value) / 100;
    const loudness = mood === 'chill' || mood === 'atmospheric' ? 0.42 : 0.62;
    master.threshold.value = -12;
    master.ratio.value = 4;
    masterGain.gain.value = loudness;
    master.connect(masterGain).connect(context.destination);

    const noise = context.createBuffer(1, sampleRate, sampleRate);
    const noiseData = noise.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = random() * 2 - 1;

    const rootNotes = { 'c-minor': 36, 'd-minor': 38, 'e-minor': 40, 'f-minor': 41, 'g-minor': 43, 'a-minor': 45, 'b-minor': 47 };
    const scale = [0, 3, 5, 7, 10, 12, 15];
    const root = rootNotes[key] || 36;
    const beatSeconds = 60 / bpm;
    const pattern = genre === 'brazilian-phonk' ? [0, 3, 6, 8, 11, 14]
        : genre === 'drift-phonk' ? [0, 4, 8, 12, 14]
        : genre === 'trap' ? [0, 7, 8, 11]
        : [0, 6, 8, 12];
    const bars = 4;

    function envelope(node, time, length, peak) {
        node.gain.setValueAtTime(0.0001, time);
        node.gain.linearRampToValueAtTime(peak, time + 0.004);
        node.gain.exponentialRampToValueAtTime(0.0001, time + length);
    }

    function oscillator(time, frequency, length, wave, volume, endFrequency) {
        const source = context.createOscillator();
        const gain = context.createGain();
        source.type = wave;
        source.frequency.setValueAtTime(frequency, time);
        if (endFrequency) source.frequency.exponentialRampToValueAtTime(endFrequency, time + length);
        envelope(gain, time, length, volume);
        source.connect(gain).connect(master);
        source.start(time);
        source.stop(time + length + 0.01);
    }

    function noiseHit(time, length, volume, frequency, filterType) {
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        source.buffer = noise;
        filter.type = filterType;
        filter.frequency.value = frequency;
        envelope(gain, time, length, volume);
        source.connect(filter).connect(gain).connect(master);
        source.start(time);
        source.stop(time + length + 0.01);
    }

    for (let bar = 0; bar < bars; bar++) {
        for (let step = 0; step < 16; step++) {
            const time = bar * beatSeconds * 4 + step * beatSeconds / 4;
            if (time >= duration) break;
            const kick = pattern.includes(step) || (step === 10 && bar % 2 === 1);

            if (kick && (instruments.includes('kick') || instruments.includes('808'))) {
                oscillator(time, 145, 0.28, 'sine', drumIntensity * 0.85, 48);
            }
            if ([4, 12].includes(step) && instruments.includes('snare')) {
                noiseHit(time, 0.19, drumIntensity * 0.32, 4200, 'highpass');
                oscillator(time, 185, 0.11, 'triangle', drumIntensity * 0.19, 95);
            }
            if ([4, 12].includes(step) && instruments.includes('clap')) {
                noiseHit(time + 0.012, 0.12, drumIntensity * 0.28, 1800, 'bandpass');
                noiseHit(time + 0.034, 0.13, drumIntensity * 0.21, 2400, 'bandpass');
            }
            if (instruments.includes('hihat') && (step % 2 === 0 || random() < energy * 0.55)) {
                noiseHit(time, 0.045, drumIntensity * (step % 4 === 0 ? 0.14 : 0.08), 7500, 'highpass');
            }
            if (kick && instruments.includes('808')) {
                oscillator(time, 66, beatSeconds * 0.82, 'sine', bassIntensity * 0.52, 38);
            }
            if (kick && instruments.includes('bass')) {
                oscillator(time, 55, beatSeconds * 0.72, 'sawtooth', bassIntensity * 0.18, 42);
            }
            if (instruments.includes('cowbell') && [0, 3, 6, 8, 10, 12, 14].includes(step)) {
                const note = root + scale[Math.floor(random() * scale.length)] + 24;
                oscillator(time, 560 + (note % 7) * 29, 0.13, 'square', energy * 0.095, 470);
                oscillator(time, 820 + (note % 5) * 33, 0.11, 'square', energy * 0.055, 690);
            }
            if (instruments.some(name => ['synth', 'piano', 'lead', 'strings', 'pads', 'guitar'].includes(name))
                && [0, 3, 6, 8, 11, 14].includes(step)) {
                const note = root + scale[Math.floor(random() * scale.length)] + 12;
                const wave = instruments.includes('piano') ? 'triangle' : 'sawtooth';
                const length = instruments.includes('pads') ? 0.48 : instruments.includes('strings') ? 0.32 : 0.2;
                const volume = energy * (mood === 'chill' ? 0.07 : 0.1);
                oscillator(time, 440 * Math.pow(2, (note - 69) / 12), length, wave, volume, null);
            }
            if (instruments.includes('percussion') && [7, 15].includes(step)) {
                noiseHit(time, 0.07, drumIntensity * 0.18, 3200, 'bandpass');
            }
            if (instruments.includes('fx') && step === 15 && bar % 4 === 3) {
                noiseHit(time, 0.35, energy * 0.12, 1500, 'lowpass');
            }
        }
    }

    const loop = await context.startRendering();
    const outputContext = new OfflineContext(2, Math.ceil(sampleRate * duration), sampleRate);
    const loopSource = outputContext.createBufferSource();
    loopSource.buffer = loop;
    loopSource.loop = true;
    loopSource.connect(outputContext.destination);
    loopSource.start(0);
    loopSource.stop(duration);
    return outputContext.startRendering();
}

function encodeWav(audioBuffer) {
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const frameCount = audioBuffer.length;
    const bytesPerSample = 2;
    const dataSize = frameCount * channels * bytesPerSample;
    const output = new ArrayBuffer(44 + dataSize);
    const view = new DataView(output);
    const writeString = (offset, value) => {
        for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bytesPerSample, true);
    view.setUint16(32, channels * bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const channelData = Array.from({ length: channels }, (_, channel) => audioBuffer.getChannelData(channel));
    let offset = 44;
    for (let frame = 0; frame < frameCount; frame++) {
        for (let channel = 0; channel < channels; channel++) {
            const sample = Math.max(-1, Math.min(1, channelData[channel][frame]));
            view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
            offset += bytesPerSample;
        }
    }
    return new Blob([output], { type: 'audio/wav' });
}

function loadPreset(preset) {
    const prompts = {
        'brazilian-night': 'Create a dark Brazilian Phonk track with aggressive 808 bass, punchy drums, distorted cowbells and a futuristic night-drive atmosphere.',
        'dark-drift': 'Create an aggressive drift phonk track with heavy bass, fast drums, and dark atmospheric elements.',
        'aggressive-bass': 'Create a phonk track with extremely aggressive bass, punchy kicks, and high-energy drums.',
        'midnight-phonk': 'Create an atmospheric phonk track perfect for late-night driving with subtle melodies and deep bass.',
        'neon-drive': 'Create a cyber-inspired phonk track with neon aesthetics, synth leads, and energetic beats.',
        'gym-energy': 'Create a high-energy phonk track perfect for workouts with fast tempo and powerful drums.',
        'atmospheric-phonk': 'Create a cinematic phonk track with ambient textures, slow builds, and atmospheric elements.',
        'hard-bass': 'Create a bass-focused phonk track with intense 808 patterns and heavy low-end.',
        'instrumental-phonk': 'Create a pure instrumental phonk composition without vocals, focusing on melody and rhythm.',
        'vocal-phonk': 'Create a phonk track with vocal samples and chopped vocal elements.',
        'cyber-phonk': 'Create a futuristic cyber-themed phonk track with electronic elements and sci-fi aesthetics.',
        'experimental-phonk': 'Create an experimental phonk track with unique sound design and unconventional elements.'
    };
    
    const promptInput = document.getElementById('track-prompt');
    if (promptInput && prompts[preset]) {
        promptInput.value = prompts[preset];
    }
}

// Library - Optimized
function switchLibraryTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.library-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.library-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabId}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Populate tab content
    populateLibraryTab(tabId);
}

function populateLibraryTab(tabId) {
    const container = document.getElementById(`${tabId}-grid`);
    if (!container) return;
    
    let tracks = [];
    
    switch (tabId) {
        case 'favorites':
            tracks = sampleTracks.filter(t => state.favorites.includes(t.id));
            break;
        case 'downloads':
            tracks = sampleTracks.filter(t => state.downloads.includes(t.id));
            break;
        case 'creations':
            tracks = state.creations.map(id => sampleTracks.find(t => t.id === id)).filter(Boolean);
            break;
        case 'recent':
            tracks = state.recentlyPlayed.map(id => sampleTracks.find(t => t.id === id)).filter(Boolean);
            break;
        case 'generated':
            tracks = state.generatedTracks;
            break;
    }
    
    if (tracks.length > 0) {
        const fragment = document.createDocumentFragment();
        tracks.forEach(track => {
            fragment.appendChild(createMusicCard(track));
        });
        container.innerHTML = '';
        container.appendChild(fragment);
    } else {
        container.innerHTML = '<p class="empty-state">No tracks yet.</p>';
    }
}

function createPlaylist() {
    const name = prompt('Enter playlist name:');
    if (name) {
        state.playlists.push({
            id: Date.now(),
            name: name,
            tracks: []
        });
        alert(`Playlist "${name}" created`);
    }
}

// Drum Lab - Optimized
function initializeDrumSequencer() {
    const instruments = ['kick', 'snare', 'clap', 'hihat', 'openhat', 'cowbell', 'percussion', '808', 'fx'];
    const patternLength = 16;
    
    const fragment = document.createDocumentFragment();
    
    instruments.forEach(instrument => {
        const container = document.getElementById(`${instrument}-steps`);
        if (container) {
            container.innerHTML = '';
            for (let i = 0; i < patternLength; i++) {
                const step = document.createElement('div');
                step.className = 'step';
                step.dataset.step = i;
                step.addEventListener('click', () => {
                    step.classList.toggle('active');
                }, { passive: true });
                container.appendChild(step);
            }
        }
    });
}

function playDrumPattern() {
    alert('Playing drum pattern');
}

function stopDrumPattern() {
    alert('Stopping drum pattern');
}

function randomizeDrums() {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.toggle('active', Math.random() > 0.7);
    });
}

function clearDrums() {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
}

function saveDrumPattern() {
    alert('Drum pattern saved');
}

function exportDrumPattern() {
    alert('Exporting drum pattern');
}

// Beat Lab
function playBeat() {
    alert('Playing beat');
}

function stopBeat() {
    alert('Stopping beat');
}

function saveBeat() {
    alert('Beat saved');
}

// Editor
function playEditedTrack() {
    alert('Playing edited track');
}

function stopEditedTrack() {
    alert('Stopping edited track');
}

function undoEdit() {
    alert('Undo');
}

function redoEdit() {
    alert('Redo');
}

function resetEdit() {
    alert('Reset edits');
}

function saveEdit() {
    alert('Saving as new version');
}

// Admin
function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username && password) {
        state.adminLoggedIn = true;
        showSection('admin-dashboard');
    } else {
        alert('Access Denied');
    }
}

function adminLogout() {
    state.adminLoggedIn = false;
    showSection('settings');
}

function switchAdminTab(tabId) {
    // Update nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.adminTab === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`admin-${tabId}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Account Deletion
function showDeleteAccount() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideDeleteAccount() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function confirmDeleteAccount() {
    alert('Account deletion initiated. You will receive a confirmation email.');
    hideDeleteAccount();
}

// Star Rating
function highlightStars(rating) {
    document.querySelectorAll('.star').forEach(star => {
        const starRating = star.dataset.rating;
        if (starRating <= rating) {
            star.style.color = '#FFD700';
        } else {
            star.style.color = 'inherit';
        }
    });
}

// Search - Optimized
function handleSearch(query) {
    if (!query.trim()) {
        populateMusicSections();
        return;
    }
    
    const filteredTracks = sampleTracks.filter(track => 
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.creator.toLowerCase().includes(query.toLowerCase()) ||
        track.genre.toLowerCase().includes(query.toLowerCase())
    );
    
    // Update all music grids with filtered results
    document.querySelectorAll('.music-grid').forEach(grid => {
        grid.innerHTML = '';
        if (filteredTracks.length > 0) {
            const fragment = document.createDocumentFragment();
            filteredTracks.forEach(track => {
                fragment.appendChild(createMusicCard(track));
            });
            grid.appendChild(fragment);
        } else {
            grid.innerHTML = '<p class="empty-state">No tracks found.</p>';
        }
    });
}

// Accessibility
function checkReduceMotionPreference() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        state.reduceMotion = true;
        document.body.classList.add('reduced-motion');

        const reduceMotionCheckbox = document.getElementById('reduce-motion');
        if (reduceMotionCheckbox) {
            reduceMotionCheckbox.checked = true;
        }
    }
}

// Theme Switcher - Red, Black, Blue, Pink
function initializeThemeSwitcher() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            setTheme(theme);
        }, { passive: true });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'default';
    setTheme(savedTheme);

    // Load saved wallpaper
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
        setWallpaperFromURL(savedWallpaper);
    }
}

function setTheme(theme) {
    state.theme = theme;
    localStorage.setItem('theme', theme);

    const body = document.body;
    body.classList.remove('theme-red', 'theme-black', 'theme-blue', 'theme-pink', 'theme-default');

    if (theme !== 'default') {
        body.classList.add(`theme-${theme}`);
    }

    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

// Wallpaper Functions
function setWallpaper(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const wallpaperUrl = e.target.result;
        localStorage.setItem('wallpaper', wallpaperUrl);
        setWallpaperFromURL(wallpaperUrl);
    };
    reader.readAsDataURL(file);
}

function setWallpaperFromURL(url) {
    const body = document.body;
    body.classList.add('has-wallpaper');
    body.style.setProperty('--wallpaper-image', `url(${url})`);
    body.style.backgroundImage = `url(${url})`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
}

function clearWallpaper() {
    localStorage.removeItem('wallpaper');
    const body = document.body;
    body.classList.remove('has-wallpaper');
    body.style.backgroundImage = '';
    body.style.removeProperty('--wallpaper-image');
}

// Close modals on outside click - Optimized with event delegation
document.addEventListener('click', (e) => {
    // Delete account modal
    const deleteModal = document.getElementById('delete-account-modal');
    if (deleteModal && e.target === deleteModal) {
        hideDeleteAccount();
    }
    
    // Full player
    const fullPlayer = document.getElementById('full-player');
    if (fullPlayer && e.target.classList.contains('full-player-overlay')) {
        hideFullPlayer();
    }
}, { passive: true });

// Keyboard shortcuts - Optimized
document.addEventListener('keydown', (e) => {
    // Ignore if typing in input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':
            previousTrack();
            break;
        case 'ArrowRight':
            nextTrack();
            break;
        case 'KeyF':
            if (state.currentTrack) {
                toggleFavorite(state.currentTrack.id);
            }
            break;
    }
}, { passive: false });

// Performance: Lazy load images when implemented
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Load image logic here
                observer.unobserve(img);
            }
        });
    });
}

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    // Register service worker here for PWA support
    // navigator.serviceWorker.register('/sw.js');
}

function removeAds() {
    state.adsEnabled = false;
}

// ---------- Subscription Management ----------
function showSubscriptionModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    modal.innerHTML = `
        <div style="background: #1a1a24; border: 1px solid #2a2a3a; border-radius: 20px; padding: 2rem; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <button id="close-sub-modal" style="position: absolute; top: 1rem; right: 1rem; background: none; color: #a0a0b0; font-size: 1.5rem; cursor: pointer;">✕</button>
            <h2 style="margin-bottom: 0.5rem; background: linear-gradient(135deg, #9b59b6, #e91e63); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Go Premium</h2>
            <p style="color: #a0a0b0; margin-bottom: 2rem;">Unlock unlimited music generation and remove all ads</p>
            
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #2a2a3a; padding: 1.5rem; border-radius: 12px; border: 2px solid #9b59b6; cursor: pointer; transition: all 0.3s ease;" onclick="selectSubscription('monthly')">
                    <h3 style="margin-bottom: 0.5rem;">Monthly</h3>
                    <p style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">$4.99/mo</p>
                    <p style="color: #a0a0b0; font-size: 0.875rem;">Unlimited generations • No ads • All features</p>
                </div>
                
                <div style="background: #2a2a3a; padding: 1.5rem; border-radius: 12px; border: 2px solid #e91e63; cursor: pointer; transition: all 0.3s ease; position: relative;" onclick="selectSubscription('yearly')">
                    <span style="position: absolute; top: -10px; right: 1rem; background: #e91e63; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">BEST VALUE</span>
                    <h3 style="margin-bottom: 0.5rem;">Yearly</h3>
                    <p style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">$39.99/yr</p>
                    <p style="color: #a0a0b0; font-size: 0.875rem;">Save 33% • Unlimited generations • No ads • All features</p>
                </div>
            </div>
            
            <button id="free-trial-btn" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #9b59b6, #e91e63); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 1rem;">Start 7-Day Free Trial</button>
            <p style="text-align: center; color: #a0a0b0; font-size: 0.75rem;">Cancel anytime. No commitment.</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('close-sub-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function selectSubscription(plan) {
    console.log('Selected subscription plan:', plan);
    // In a real implementation, this would initiate the purchase flow
    alert(`Selected ${plan} plan. Purchase flow would be initiated here.`);
}

function activatePremium() {
    state.isPremium = true;
    removeAds();
    document.body.classList.add('ads-free');
    console.log('Premium activated');
}

// ---------- Admin Benefits ----------
function activateAdmin() {
    state.isAdmin = true;
    state.isPremium = true;
    removeAds();
    document.body.classList.add('ads-free');
    console.log('Admin activated - unlimited access');
}
