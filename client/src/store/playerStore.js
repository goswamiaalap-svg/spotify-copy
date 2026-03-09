import { create } from 'zustand';
import axios from 'axios';

const audio = new Audio();
audio.volume = 1.0;
audio.crossOrigin = "anonymous";

let audioCtx = null;
let analyser = null;
let source = null;
let filters = [];

const initAudioContext = () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source = audioCtx.createMediaElementSource(audio);

    // Create EQ Filters (Simplified 3-band)
    const frequencies = [60, 1000, 8000]; // Low, Mid, High
    filters = frequencies.map(freq => {
        const filter = audioCtx.createBiquadFilter();
        filter.type = freq === 1000 ? 'peaking' : (freq < 1000 ? 'lowshelf' : 'highshelf');
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
    });

    source.connect(analyser);
    analyser.connect(filters[0]);
    filters[0].connect(filters[1]);
    filters[1].connect(filters[2]);
    filters[2].connect(audioCtx.destination);
};

const SAAVN = 'https://jiosaavn-api-privatecvc2.vercel.app';

const setupMediaSession = (song, handlers) => {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: song.album || 'Spotify Clone',
            artwork: [
                { src: song.albumArt, sizes: '96x96', type: 'image/jpeg' },
                { src: song.albumArt, sizes: '128x128', type: 'image/jpeg' },
                { src: song.albumArt, sizes: '192x192', type: 'image/jpeg' },
                { src: song.albumArt, sizes: '256x256', type: 'image/jpeg' },
                { src: song.albumArt, sizes: '384x384', type: 'image/jpeg' },
                { src: song.albumArt, sizes: '512x512', type: 'image/jpeg' },
            ]
        });

        navigator.mediaSession.setActionHandler('play', handlers.play);
        navigator.mediaSession.setActionHandler('pause', handlers.pause);
        navigator.mediaSession.setActionHandler('previoustrack', handlers.prev);
        navigator.mediaSession.setActionHandler('nexttrack', handlers.next);
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime !== undefined) handlers.seek(details.seekTime);
        });
    }
};

const saveToRecent = (song) => {
    const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    const filtered = recent.filter(s => s.id !== song.id);
    const updated = [song, ...filtered].slice(0, 50);
    localStorage.setItem('recentlyPlayed', JSON.stringify(updated));
};

const usePlayerStore = create((set, get) => ({
    currentSong: null,
    isPlaying: false,
    isLoading: false,
    queue: [],
    currentIndex: 0,
    progress: 0,
    duration: 0,
    volume: 1.0,

    playSong: async (song, queue = []) => {
        initAudioContext();
        console.log('▶ Playing:', song.title);
        set({ currentSong: song, isLoading: true, isPlaying: false });

        // Instant global references for components
        window.__currentVideoId = song.videoId || null;
        window.__audioEl = audio;

        if (queue.length > 0) {
            const idx = queue.findIndex(s => s.id === song.id);
            set({ queue, currentIndex: idx >= 0 ? idx : 0 });
        }

        const tryPlay = async (songData) => {
            try {
                let audioUrl = songData.audioUrl || null;

                // Handle direct downloadUrl (JioSaavn / YouTube Render API / Generic)
                if (!audioUrl && songData.downloadUrl && Array.isArray(songData.downloadUrl)) {
                    const download = songData.downloadUrl;
                    const best = download.find(u => u.quality === 'full') ||
                        download.find(u => u.quality === '320kbps') ||
                        download.find(u => u.quality === '160kbps') ||
                        download[download.length - 1];
                    if (best?.link || best?.url) audioUrl = decodeURIComponent(best.link || best.url || '');
                }

                // Handle YouTube: fetch stream URL on demand if not already resolved
                if (!audioUrl && songData.source === 'YouTube' && songData.videoId) {
                    audioUrl = `https://new-youtube-o7cl.onrender.com/audio?videoId=${songData.videoId}`;
                }

                if (!audioUrl) throw new Error('Could not resolve audio link');

                audio.pause();
                audio.src = '';
                audio.load();
                audio.src = audioUrl;
                audio.crossOrigin = "anonymous";
                audio.volume = get().volume;

                audio.ontimeupdate = () => set({ progress: audio.currentTime });
                audio.onloadedmetadata = () => set({ duration: audio.duration });
                audio.onended = () => get().playNext();
                audio.onerror = () => { throw new Error('Playback error'); };

                await audio.play();
                set({ isPlaying: true, isLoading: false });
                saveToRecent(song);

                // Sync Media Session
                setupMediaSession(song, {
                    play: () => get().togglePlay(),
                    pause: () => get().togglePlay(),
                    prev: () => get().playPrev(),
                    next: () => get().playNext(),
                    seek: (t) => get().seekTo(t)
                });
                if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';

                return true;
            } catch (err) {
                console.warn('Playback attempt failed:', err.message);
                return false;
            }
        };

        const success = await tryPlay(song);

        // EXTRA SMART FALLBACK: If song fails, search YouTube automatically for title + artist
        if (!success) {
            console.log('🔍 Song failed. Searching YouTube fallback...');
            try {
                const q = `${song.title} ${song.artist}`;
                const r = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}`);
                const d = await r.json();
                const ytSong = d?.songs?.[0];
                if (ytSong) {
                    console.log('✅ Found YouTube fallback:', ytSong.title);
                    window.__currentVideoId = ytSong.videoId;
                    const fallbackSuccess = await tryPlay({ ...ytSong, source: 'YouTube' });
                    if (fallbackSuccess) return;
                }
            } catch (err) {
                console.error('Fallback search failed');
            }
            set({ isLoading: false, isPlaying: false });
        }
    },

    togglePlay: () => {
        if (audio.paused) {
            audio.play().catch(console.error);
            set({ isPlaying: true });
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
        } else {
            audio.pause();
            set({ isPlaying: false });
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        }
    },

    playNext: () => {
        const { queue, currentIndex } = get();
        if (currentIndex < queue.length - 1) {
            get().playSong(queue[currentIndex + 1], queue);
            set({ currentIndex: currentIndex + 1 });
        }
    },

    playPrev: () => {
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        const { queue, currentIndex } = get();
        if (currentIndex > 0) {
            get().playSong(queue[currentIndex - 1], queue);
            set({ currentIndex: currentIndex - 1 });
        }
    },

    seekTo: (t) => {
        if (!isNaN(t)) {
            audio.currentTime = t;
            set({ progress: t });
        }
    },

    setVolume: (v) => {
        audio.volume = v;
        set({ volume: v });
    },

    getFrequencyData: () => {
        if (!analyser) return new Uint8Array(0);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        return dataArray;
    },

    setEQ: (gains) => {
        if (!filters.length) return;
        gains.forEach((gain, i) => {
            if (filters[i]) filters[i].gain.value = gain;
        });
    }
}));

export const EQ_PRESETS = {
    Flat: [0, 0, 0],
    Bass: [6, 0, -2],
    Electronic: [4, 2, 4],
    Pop: [-2, 4, 2],
    Vocal: [-4, 6, 0]
};

export { usePlayerStore };
export default usePlayerStore;
