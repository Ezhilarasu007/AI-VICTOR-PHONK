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
    loadedModels: false,
    isPremium: false,
    isAdmin: false,
    adsEnabled: true,
    adLoaded: false
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
        downloadAllowed: true
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
        downloadAllowed: true
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
        downloadAllowed: true
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
        downloadAllowed: true
    },
    {
        id: 5,
        title: "Neon City Streets",
        creator: "Cyber Beats",
        genre: "Night Drive",
        bpm: 142,
        duration: "2:55",
        artwork: null,
        isAIOriginal: false,
        downloadAllowed: false
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
        downloadAllowed: true
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
        downloadAllowed: true
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
        downloadAllowed: true
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Use requestAnimationFrame for smooth initialization
    requestAnimationFrame(() => {
        initializeApp();
    });
});

function initializeApp() {
    updateGreeting();
    setupEventListeners();
    initializeDrumSequencer();
    populateMusicSections();
    checkReduceMotionPreference();
    initializeAds();
    
    // Debounced greeting update
    let greetingTimeout;
    const updateGreetingDebounced = () => {
        clearTimeout(greetingTimeout);
        greetingTimeout = setTimeout(updateGreeting, 100);
    };
    
    // Update greeting every minute
    setInterval(updateGreetingDebounced, 60000);
    
    // Load Ollama models after initial render
    setTimeout(() => {
        loadOllamaModels();
    }, 1000);
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
                <div class="artwork-gradient"></div>
            </div>
            <div class="music-card-overlay">
                <span class="music-card-play">▶</span>
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
            ${track.isAIOriginal ? '<span class="badge ai-original">AI Original</span>' : ''}
            <div class="music-card-controls">
                <button class="music-card-btn" data-action="play" data-id="${track.id}" aria-label="Play">▶</button>
                <button class="music-card-btn" data-action="favorite" data-id="${track.id}" aria-label="Favorite">♡</button>
                ${track.downloadAllowed ? `<button class="music-card-btn" data-action="download" data-id="${track.id}" aria-label="Download">⬇️</button>` : ''}
                <button class="music-card-btn" data-action="more" data-id="${track.id}" aria-label="More">⋮</button>
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
                case 'play':
                    playTrack(id);
                    break;
                case 'favorite':
                    toggleFavorite(id);
                    break;
                case 'download':
                    downloadTrack(id);
                    break;
                case 'more':
                    // Show more options
                    break;
            }
            e.stopPropagation();
        } else {
            playTrack(track.id);
        }
    }, { passive: true });
    
    return card;
}

// Populate Music Sections - Optimized with document fragment
function populateMusicSections() {
    const sections = {
        'trending-music': sampleTracks.slice(0, 4),
        'new-releases': sampleTracks.slice(2, 6),
        'ai-originals': sampleTracks.filter(t => t.isAIOriginal).slice(0, 4),
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
    if (track && track.downloadAllowed) {
        alert(`Downloading: ${track.title}`);
        
        if (!state.downloads.includes(trackId)) {
            state.downloads.push(trackId);
        }
    } else {
        alert('This track is not available for download.');
    }
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

// Ollama Integration via Backend - Optimized
const BACKEND_API_URL = 'http://localhost:3000/api';

async function fetchOllamaModels() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/models`);
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error('Failed to fetch Ollama models:', error);
        return [];
    }
}

async function loadOllamaModels() {
    if (state.loadedModels) return;
    
    const models = await fetchOllamaModels();
    const modelSelector = document.querySelector('.model-selector');
    
    if (models.length > 0 && modelSelector) {
        // Clear existing model cards except smart model
        const existingCards = modelSelector.querySelectorAll('.model-card:not([data-model="smart"])');
        existingCards.forEach(card => card.remove());
        
        // Add Ollama models with document fragment
        const fragment = document.createDocumentFragment();
        models.forEach(model => {
            const modelName = model.name.split(':')[0];
            const card = document.createElement('div');
            card.className = 'model-card';
            card.dataset.model = modelName;
            card.innerHTML = `
                <h4>${modelName}</h4>
                <p>Ollama Model • ${formatSize(model.size)}</p>
            `;
            fragment.appendChild(card);
        });
        modelSelector.appendChild(fragment);
        
        console.log(`Loaded ${models.length} Ollama models`);
        state.loadedModels = true;
    } else {
        console.log('No Ollama models found. Run "ollama pull <model>" to download models.');
        
        // Add a message to the UI
        if (modelSelector) {
            const message = document.createElement('p');
            message.className = 'model-message';
            message.style.color = 'var(--text-secondary)';
            message.style.marginTop = '1rem';
            message.textContent = 'No Ollama models found. Open PowerShell and run: ollama pull llama3.2';
            modelSelector.appendChild(message);
        }
    }
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

async function generateWithOllama(prompt, model) {
    try {
        const response = await fetch(`${BACKEND_API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                prompt: `Create a detailed music production description for: ${prompt}. Include BPM, key, instrumentation suggestions, and structure.`
            })
        });
        
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Ollama generation failed:', error);
        return null;
    }
}

// AI Generation - Optimized
async function startGeneration() {
    const prompt = document.getElementById('track-prompt').value;
    const genre = document.getElementById('genre-select').value;
    const mood = document.getElementById('mood-select').value;
    const bpm = document.getElementById('bpm-input').value;
    const key = document.getElementById('key-select').value;
    const duration = document.getElementById('duration-input').value;
    
    // Get selected model
    const selectedModelCard = document.querySelector('.model-card.selected');
    const selectedModel = selectedModelCard ? selectedModelCard.dataset.model : 'smart';
    
    if (!prompt.trim()) {
        alert('Please describe your track');
        return;
    }
    
    // Show progress
    const progressSection = document.getElementById('generation-progress');
    const resultSection = document.getElementById('generated-result');
    
    if (progressSection) progressSection.style.display = 'block';
    if (resultSection) resultSection.style.display = 'none';
    
    const progressFill = document.getElementById('progress-fill');
    const progressStatus = document.querySelector('.progress-status');
    
    // If using Ollama model, generate with it
    if (selectedModel !== 'smart') {
        progressStatus.textContent = 'Connecting to Ollama...';
        
        const ollamaResponse = await generateWithOllama(prompt, selectedModel);
        
        if (ollamaResponse) {
            progressStatus.textContent = 'AI response received. Processing...';
            console.log('Ollama Response:', ollamaResponse);
        }
    }
    
    // Simulate generation progress
    const stages = [
        'Analyzing your request',
        'Validating parameters',
        'Routing to AI model',
        'Generating audio',
        'Processing waveform',
        'Adding effects',
        'Finalizing track'
    ];
    
    let stageIndex = 0;
    const progressInterval = setInterval(() => {
        if (stageIndex < stages.length) {
            if (progressStatus) progressStatus.textContent = stages[stageIndex];
            if (progressFill) {
                progressFill.style.width = `${((stageIndex + 1) / stages.length) * 100}%`;
            }
            stageIndex++;
        } else {
            clearInterval(progressInterval);
            showGenerationResult(prompt, genre, bpm, key, duration, selectedModel);
        }
    }, 800);
}

function showGenerationResult(prompt, genre, bpm, key, duration, model = 'smart') {
    const progressSection = document.getElementById('generation-progress');
    const resultSection = document.getElementById('generated-result');
    
    if (progressSection) progressSection.style.display = 'none';
    if (resultSection) resultSection.style.display = 'block';
    
    // Update result details
    document.getElementById('result-title').textContent = 'Your Phonk Track';
    document.getElementById('result-details').textContent = `${bpm} BPM • ${key} • ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
    document.getElementById('result-model').textContent = `Model: ${model === 'smart' ? 'Smart Model' : model}`;
    document.getElementById('result-prompt').textContent = `"${prompt}"`;
    
    // Add to generated tracks
    const newTrack = {
        id: Date.now(),
        title: 'Your Phonk Track',
        creator: 'You',
        genre: genre,
        bpm: parseInt(bpm),
        duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
        isAIOriginal: true,
        downloadAllowed: true,
        model: model
    };
    
    state.generatedTracks.push(newTrack);
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

function playGeneratedTrack() {
    const lastGenerated = state.generatedTracks[state.generatedTracks.length - 1];
    if (lastGenerated) {
        playTrack(lastGenerated.id);
    }
}

function saveTrack() {
    alert('Track saved to your library');
}

function createVariation() {
    alert('Creating variation of your track...');
}

function regenerateTrack() {
    startGeneration();
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

// ---------- AdMob Integration ----------
const AdMobConfig = {
    appId: 'ca-app-pub-6751037211810646~6370835710',
    bannerId: 'ca-app-pub-6751037211810646/7948650423',
    interstitialId: 'ca-app-pub-6751037211810646/1514094858',
    rewardedId: 'ca-app-pub-6751037211810646/2029100178',
    nativeId: 'ca-app-pub-6751037211810646/3685048341',
    openId: 'ca-app-pub-6751037211810646/2496089751',
    testMode: true
};

// Check if user should see ads
function shouldShowAds() {
    // Admins never see ads
    if (state.isAdmin) return false;
    
    // Premium users never see ads
    if (state.isPremium) return false;
    
    // Free users see ads
    return true;
}

// Load banner ad
function loadBannerAd() {
    if (!shouldShowAds()) return;
    
    // In a real implementation, this would use the AdMob SDK
    console.log('Loading banner ad:', AdMobConfig.bannerId);
    
    // Create banner ad container
    const bannerContainer = document.createElement('div');
    bannerContainer.id = 'banner-ad-container';
    bannerContainer.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 0;
        right: 0;
        height: 50px;
        background: #1a1a24;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 998;
        border-top: 1px solid #2a2a3a;
    `;
    bannerContainer.innerHTML = `
        <div style="color: #a0a0b0; font-size: 0.875rem;">
            ${AdMobConfig.testMode ? 'TEST AD - Banner' : 'Advertisement'}
        </div>
    `;
    
    // Only add if not already present
    if (!document.getElementById('banner-ad-container')) {
        document.body.appendChild(bannerContainer);
        state.adLoaded = true;
    }
}

// Load interstitial ad
function loadInterstitialAd() {
    if (!shouldShowAds()) return Promise.resolve(true);
    
    console.log('Loading interstitial ad:', AdMobConfig.interstitialId);
    
    // Simulate ad loading
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 500);
    });
}

// Show interstitial ad
function showInterstitialAd() {
    if (!shouldShowAds()) return Promise.resolve(true);
    
    console.log('Showing interstitial ad');
    
    // Show ad modal
    const adModal = document.createElement('div');
    adModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    adModal.innerHTML = `
        <div style="background: #1a1a24; padding: 2rem; border-radius: 16px; max-width: 400px; text-align: center;">
            <h3 style="margin-bottom: 1rem;">Advertisement</h3>
            <div style="height: 250px; background: #2a2a3a; border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; color: #a0a0b0;">
                ${AdMobConfig.testMode ? 'TEST AD - Interstitial' : 'Ad Content'}
            </div>
            <button id="close-ad-btn" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #9b59b6, #e91e63); color: white; border: none; border-radius: 8px; cursor: pointer;">Close Ad</button>
        </div>
    `;
    
    document.body.appendChild(adModal);
    
    return new Promise((resolve) => {
        const closeBtn = document.getElementById('close-ad-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(adModal);
            resolve(true);
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(adModal)) {
                document.body.removeChild(adModal);
                resolve(true);
            }
        }, 5000);
    });
}

// Load rewarded ad
function loadRewardedAd() {
    if (!shouldShowAds()) return Promise.resolve(true);
    
    console.log('Loading rewarded ad:', AdMobConfig.rewardedId);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 500);
    });
}

// Show rewarded ad
function showRewardedAd(callback) {
    if (!shouldShowAds()) {
        if (callback) callback(true);
        return;
    }
    
    console.log('Showing rewarded ad');
    
    const adModal = document.createElement('div');
    adModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    adModal.innerHTML = `
        <div style="background: #1a1a24; padding: 2rem; border-radius: 16px; max-width: 400px; text-align: center;">
            <h3 style="margin-bottom: 1rem;">Watch Ad for Free Generation</h3>
            <div style="height: 250px; background: #2a2a3a; border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; color: #a0a0b0;">
                ${AdMobConfig.testMode ? 'TEST AD - Rewarded' : 'Ad Content'}
            </div>
            <button id="claim-reward-btn" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #9b59b6, #e91e63); color: white; border: none; border-radius: 8px; cursor: pointer;">Claim Reward</button>
        </div>
    `;
    
    document.body.appendChild(adModal);
    
    const claimBtn = document.getElementById('claim-reward-btn');
    claimBtn.addEventListener('click', () => {
        document.body.removeChild(adModal);
        if (callback) callback(true);
    });
}

// Load native ad
function loadNativeAd(containerId) {
    if (!shouldShowAds()) return;
    
    console.log('Loading native ad:', AdMobConfig.nativeId);
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div style="background: #1a1a24; border: 1px solid #2a2a3a; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="width: 60px; height: 60px; background: #2a2a3a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #a0a0b0; font-size: 0.75rem;">
                        Ad
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 0.25rem; font-size: 0.875rem;">Sponsored</h4>
                        <p style="color: #a0a0b0; font-size: 0.75rem;">${AdMobConfig.testMode ? 'TEST AD - Native' : 'Ad content here'}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Remove ads (for premium/admin)
function removeAds() {
    const bannerContainer = document.getElementById('banner-ad-container');
    if (bannerContainer) {
        bannerContainer.remove();
    }
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
    console.log('Premium activated');
}

// ---------- Admin Benefits ----------
function activateAdmin() {
    state.isAdmin = true;
    state.isPremium = true;
    removeAds();
    console.log('Admin activated - unlimited access');
}

// Initialize ads on app load
function initializeAds() {
    if (shouldShowAds()) {
        loadBannerAd();
    }
}
