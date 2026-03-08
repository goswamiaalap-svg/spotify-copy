import { create } from 'zustand';
import api from '../api/axios';
import useLibraryStore from './libraryStore';
import useToastStore from './toastStore';

const usePlaylistStore = create((set, get) => ({
    userPlaylists: [],
    loading: false,

    fetchUserPlaylists: async () => {
        try {
            set({ loading: true });
            /* Use library store playlists or fetch new */
            const libPlaylists = useLibraryStore.getState().playlists;
            if (libPlaylists && libPlaylists.length) {
                set({ userPlaylists: libPlaylists, loading: false });
                return;
            }
            const { data } = await api.get('/playlists/mine');
            set({ userPlaylists: data, loading: false });
        } catch (error) {
            console.error('Fetch playlists failed', error);
            set({ loading: false });
        }
    },

    addToPlaylist: async (playlistId, song, playlistName) => {
        try {
            await api.post(`/playlists/${playlistId}/songs`, { songId: song._id });
            useToastStore.getState().showToast(`Added to ${playlistName}`);
            useLibraryStore.getState().fetchAll(); // refresh local library
        } catch (err) {
            console.error(err);
        }
    },

    createNewPlaylist: async (name, description, isPublic, songToAdd) => {
        try {
            const { data } = await api.post('/playlists', { name, description, isPublic });
            if (songToAdd) {
                await api.post(`/playlists/${data._id}/songs`, { songId: songToAdd._id });
                useToastStore.getState().showToast(`Added to ${name}`);
            } else {
                useToastStore.getState().showToast(`Created ${name}`);
            }
            get().fetchUserPlaylists();
            useLibraryStore.getState().fetchAll();
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}));

export default usePlaylistStore;
