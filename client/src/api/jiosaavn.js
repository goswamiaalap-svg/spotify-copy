/**
 * Frontend helper for all JioSaavn (saavn.dev) calls.
 * All requests go through our own Node.js proxy at /api/jiosaavn
 * to avoid CORS and keep auth logic server-side.
 */
import api from './axios';

const jio = {
    /** Full text search — returns { songs, albums, artists } */
    search: (q, limit = 20) =>
        api.get('/jiosaavn/search', { params: { q, limit } }).then(r => r.data),

    /** Curated home page feed */
    home: () =>
        api.get('/jiosaavn/home').then(r => r.data),

    /** Songs by genre name */
    genre: (name, limit = 20) =>
        api.get('/jiosaavn/genre', { params: { name, limit } }).then(r => r.data),

    /** Single song details */
    song: (id) =>
        api.get(`/jiosaavn/songs/${id}`).then(r => r.data),

    /** Full album with song list */
    album: (id) =>
        api.get(`/jiosaavn/albums/${id}`).then(r => r.data),

    /** Artist profile + songs + albums */
    artist: (id) =>
        api.get(`/jiosaavn/artists/${id}`).then(r => r.data),
};

export default jio;
