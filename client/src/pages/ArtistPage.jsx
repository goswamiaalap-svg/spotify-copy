import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import api from '../api/axios';
import TopBar from '../components/layout/TopBar';
import SongRow from '../components/SongRow';
import AlbumCard from '../components/AlbumCard';
import usePlayerStore from '../store/playerStore';

export default function ArtistPage() {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playSong, togglePlay, currentSong, isPlaying } = usePlayerStore();

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const [artistRes, songsRes, albumsRes] = await Promise.all([
                    api.get(`/artists/${id}`),
                    api.get(`/artists/${id}/songs`),
                    api.get(`/artists/${id}/albums`),
                ]);
                setArtist(artistRes.data);
                setSongs(songsRes.data || []);
                setAlbums(albumsRes.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchArtist();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col h-full">
            <TopBar />
            <div className="flex-1 flex items-center justify-center"><div className="spinner" /></div>
        </div>
    );
    if (!artist) return (
        <div className="flex flex-col h-full">
            <TopBar />
            <div className="flex-1 flex items-center justify-center"><p className="text-[#A7A7A7]">Artist not found.</p></div>
        </div>
    );

    const isArtistPlaying = currentSong && songs.some(s => s._id === currentSong._id) && isPlaying;

    const handlePlay = () => {
        if (!songs.length) return;
        if (isArtistPlaying) togglePlay();
        else playSong(songs[0], songs);
    };

    const monthlyListeners = artist.monthlyListeners
        ? artist.monthlyListeners.toLocaleString()
        : null;

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
            <div className="flex-1 overflow-y-auto animate-fadeIn">
                <TopBar />
                {/* Banner */}
                <div className="relative h-80 flex items-end">
                    <img
                        src={artist.imageUrl || 'https://placehold.co/1200x288/282828/ffffff?text=Artist'}
                        alt={artist.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="relative px-[var(--content-padding)] pb-8">
                        <div className="flex items-center gap-2 text-white font-bold mb-3 drop-shadow-lg">
                            <span className="bg-[#1DB954] p-1 rounded-full shadow-lg">
                                <Play size={12} fill="black" />
                            </span>
                            <span className="text-[12px] uppercase tracking-wider">Verified Artist</span>
                        </div>
                        <h1 className="hero-title my-0 leading-tight">
                            {artist.name}
                        </h1>
                        <p className="text-white text-sm font-semibold mt-6 drop-shadow-md">
                            {monthlyListeners ? `${monthlyListeners} monthly listeners` : 'Artist'}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8 px-[var(--content-padding)] py-6 bg-gradient-to-b from-[rgba(0,0,0,0.2)] to-transparent">
                    <button
                        className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                        onClick={handlePlay}
                        id="artist-play-btn"
                    >
                        {isArtistPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                    </button>
                    <button className="border border-[#ffffff4d] hover:border-white text-white font-bold text-sm px-6 py-2 rounded-full transition-colors uppercase tracking-wider">
                        Follow
                    </button>
                </div>

                {/* Popular songs */}
                {songs.length > 0 && (
                    <section className="px-[var(--content-padding)] mb-14">
                        <h2 className="section-heading mt-0 mb-6">Popular</h2>
                        <div className="flex flex-col">
                            {songs.slice(0, 10).map((song, i) => (
                                <SongRow key={song._id} song={song} index={i} songs={songs} showAlbum={true} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Discography */}
                {albums.length > 0 && (
                    <section className="px-[var(--content-padding)] mb-14">
                        <h2 className="section-heading mt-0 mb-6">Discography</h2>
                        <div className="cards-row">
                            {albums.map(album => <AlbumCard key={album._id} album={album} />)}
                        </div>
                    </section>
                )}

                {/* Bio */}
                {artist.bio && (
                    <section className="px-[var(--content-padding)] mb-16">
                        <h2 className="section-heading mt-0 mb-6">About</h2>
                        <div className="bg-[#1c1c1c] hover:bg-[#282828] rounded-2xl p-8 max-w-4xl cursor-pointer transition-colors group shadow-lg">
                            <p className="description-text !max-w-none line-clamp-4 group-hover:text-white transition-colors">{artist.bio}</p>
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
