import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const searchAllSources = async (query) => {
    try {
        const response = await api.get(`/resolver/search?q=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error('Error searching across sources:', error);
        return { success: false, data: { saavn: [], youtube: [], deezer: [], soundcloud: [] } };
    }
};

export const getStreamUrl = (song) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    if (song.source === 'youtube' || song.videoId || (song._id && song._id.startsWith('yt_'))) {
        const vid = song.videoId || (song._id && song._id.replace('yt_', '')) || song.id;
        return `${apiUrl}/youtube/audio-url/${vid}`;
    }


    if (song.source === 'deezer' || song.previewUrl) {
        return song.previewUrl;
    }

    if (song.source === 'soundcloud') {
        return `${apiUrl}/soundcloud/stream?url=${encodeURIComponent(song.url)}`;
    }

    // Default to Saavn (handled in playerStore usually, but here for consistency)
    if (song.downloadUrl) return null; // PlayerStore picks from array

    return song.audioUrl || null;
};
