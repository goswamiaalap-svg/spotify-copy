import { create } from 'zustand';
import api from '../api/axios';
import useAuthStore from './authStore';
import useToastStore from './toastStore';

const useLibraryStore = create((set, get) => ({
    playlists: [],
    likedSongs: [],
    likedSongIds: new Set(),
    recentlyPlayed: [],
    loadingLibrary: false,

    fetchPlaylists: async () => {
        try {
            const { data } = await api.get('/playlists/my');
            set({ playlists: data });
        } catch (e) {
            console.error('fetchPlaylists error:', e);
        }
    },

    fetchLikedSongs: async () => {
        try {
            const { data } = await api.get('/users/liked-songs');
            const ids = new Set(data.map(s => s.songId));
            set({ likedSongs: data, likedSongIds: ids });
        } catch (e) {
            console.error('fetchLikedSongs error:', e);
        }
    },

    fetchRecentlyPlayed: async () => {
        try {
            const { data } = await api.get('/songs/recently-played');
            set({ recentlyPlayed: data });
        } catch (e) {
            console.error('fetchRecentlyPlayed error:', e);
        }
    },

    toggleLike: async (song) => {
        const auth = useAuthStore.getState();
        const toast = useToastStore.getState();

        if (!auth.token) {
            toast.showToast('Please login to like songs');
            return;
        }

        const songId = song._id || song.id || song.songId;
        if (!songId) return;

        const { likedSongIds, likedSongs } = get();
        const isLiked = likedSongIds.has(songId);

        // Optimistic update
        const newSet = new Set(likedSongIds);
        if (isLiked) {
            newSet.delete(songId);
        } else {
            newSet.add(songId);
        }
        set({ likedSongIds: newSet });

        try {
            const { data } = await api.post('/users/like', {
                songId,
                title: song.title || song.name || '',
                artist: song.artist?.name || song.artist || '',
                albumArt: song.imageUrl || song.albumArt || '',
                duration: song.duration || ''
            });

            if (data.liked) {
                toast.showToast('Added to Liked Songs');
            } else {
                toast.showToast('Removed from Liked Songs');
            }

            // Re-fetch to get accurate timestamps and objects
            await get().fetchLikedSongs();
        } catch (e) {
            console.error('toggleLike error:', e);
            // Revert on fail
            set({ likedSongIds });
            toast.showToast('Something went wrong');
        }
    },

    isLiked: (songId) => get().likedSongIds.has(songId),

    createPlaylist: async (name, description = '') => {
        try {
            const { data } = await api.post('/playlists', { name, description });
            set(s => ({ playlists: [...s.playlists, data] }));
            return data;
        } catch (e) {
            console.error('createPlaylist error:', e);
        }
    },

    deletePlaylist: async (id) => {
        try {
            const { data } = await api.delete(`/playlists/${id}`);
            set(s => ({ playlists: s.playlists.filter(p => p._id !== id) }));
        } catch (e) {
            console.error('deletePlaylist error:', e);
        }
    },

    addSongToPlaylist: async (playlistId, songId) => {
        try {
            await api.post(`/playlists/${playlistId}/songs`, { songId });
        } catch (e) {
            console.error('addSongToPlaylist error:', e);
        }
    },

    fetchAll: async () => {
        const { fetchPlaylists, fetchLikedSongs, fetchRecentlyPlayed } = get();
        await Promise.all([fetchPlaylists(), fetchLikedSongs(), fetchRecentlyPlayed()]);
    },
}));

export default useLibraryStore;
