import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart, Shimmer, Play, Pause, SkipBack, SkipForward,
  Search, Settings, Music, Disc, Mic2, ListMusic,
  Share2, MoreVertical, ChevronDown, Repeat, Shuffle,
  PlusCircle, CheckCircle2, Volume2, Globe, Clock, Library
} from 'lucide-react';
import { usePlayerStore, EQ_PRESETS } from '../store/playerStore';
import { useLyrics } from '../hooks/useLyrics';
import { MOCK_DATA } from '../services/mockData';
import SearchPage from '../pages/SearchPage';
import ImportPage from '../pages/ImportPage';
import LikedSongsPage from '../pages/LikedSongsPage';
import RecentlyPlayedPage from '../pages/RecentlyPlayedPage';
import AlbumsPage from '../pages/AlbumsPage';
import ArtistsPage from '../pages/ArtistsPage';
import PlaylistsPage from '../pages/PlaylistsPage';

// ── HELPERS ──

function getImage(url, source) {
  if (!url) return '';
  if (source === 'YouTube') return url;
  if (source === 'iTunes') return url.replace('100x100bb', '600x600bb').replace('100x100', '600x600');
  if (source === 'Deezer') return url.includes('?') ? url : url + '?size=xl';
  if (source === 'Audius') return url;
  if (url.includes('saavn') || url.includes('jiosaavn')) {
    return url.replace('150x150', '500x500').replace('50x50', '500x500');
  }
  return url;
}

function SongImage({ src, source, size = 46, radius = 4, className = "" }) {
  const [failed, setFailed] = useState(false);
  const finalSrc = getImage(src, source);

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center overflow-hidden bg-zinc-800 ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {!failed && finalSrc ? (
        <img
          src={finalSrc}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Music size={size * 0.4} className="text-zinc-600" />
      )}
    </div>
  );
}
// REPLACE SongBottomSheet component entirely:
export function SongBottomSheet({ song, songs, onClose }) {
  const { playSong, queue, addToQueue } = usePlayerStore();
  const [liked, setLiked] = useState(() => {
    const l = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    return l.some(s => s.id === song?.id);
  });

  if (!song) return null;

  const toggleLike = () => {
    const list = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    if (liked) {
      localStorage.setItem('likedSongs', JSON.stringify(list.filter(s => s.id !== song.id)));
      setLiked(false);
    } else {
      list.unshift(song);
      localStorage.setItem('likedSongs', JSON.stringify(list));
      setLiked(true);
    }
  };

  const options = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={liked ? '#1DB954' : 'none'} stroke={liked ? '#1DB954' : 'white'} /></svg>,
      label: liked ? 'Remove from Liked Songs' : 'Save to Liked Songs',
      sublabel: liked ? 'Remove from your collection' : 'Add to your collection',
      action: toggleLike,
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
      label: 'Add to playlist',
      sublabel: 'Save to one of your playlists',
      action: () => {
        const name = prompt('Playlist name?');
        if (!name) return;
        const p = JSON.parse(localStorage.getItem('playlists') || '[]');
        const existing = p.find(x => x.name === name);
        if (existing) existing.songs = [...(existing.songs || []), song];
        else p.push({ id: Date.now(), name, songs: [song] });
        localStorage.setItem('playlists', JSON.stringify(p));
        onClose();
      },
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
      label: 'Add to queue',
      sublabel: 'Play next in queue',
      action: () => {
        if (addToQueue) addToQueue(song);
        else {
          const store = usePlayerStore.getState();
          if (store.queue) store.queue.push(song);
        }
        onClose();
      },
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
      label: 'Share',
      sublabel: 'Share to friends',
      action: () => {
        if (navigator.share) {
          navigator.share({ title: song.title, text: `${song.title} by ${song.artist}` });
        } else {
          navigator.clipboard?.writeText(`🎵 ${song.title} — ${song.artist}`);
        }
        onClose();
      },
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
      label: 'View artist',
      sublabel: song.artist?.split(',')[0]?.trim(),
      action: onClose,
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
      label: 'Go to song radio',
      sublabel: 'Start a radio based on this song',
      action: onClose,
    },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 19998, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#282828', borderRadius: '12px 12px 0 0',
        zIndex: 19999, paddingBottom: 'calc(env(safe-area-inset-bottom, 8px) + 16px)',
        animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: '32px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SongImage src={song.albumArt} source={song.source} size={52} radius={6} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
            <div style={{ color: '#b3b3b3', fontSize: '13px', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.artist}</div>
          </div>
          <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#1DB954' : 'none'} stroke={liked ? '#1DB954' : 'white'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => { playSong(song, songs || [song]); onClose(); }}
          style={{ width: 'calc(100% - 40px)', margin: '14px 20px 4px', padding: '15px', background: '#1DB954', border: 'none', borderRadius: '500px', color: 'black', fontSize: '15px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z" /></svg>
          Play now
        </button>
        <div style={{ padding: '8px 0' }}>
          {options.map((opt, i) => (
            <button key={i} onClick={opt.action}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left' }}
              onTouchStart={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onTouchEnd={e => e.currentTarget.style.background = 'none'}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {opt.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{opt.label}</div>
                {opt.sublabel && <div style={{ color: '#b3b3b3', fontSize: '12px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.sublabel}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── COMPONENTS ──

function BottomNav() {
  const nav = useNavigate();
  const loc = useLocation();
  const items = [
    { label: 'Home', icon: loc.pathname === '/' ? '🏠' : '🏠', path: '/' },
    { label: 'Search', icon: loc.pathname === '/search' ? '🔍' : '🔍', path: '/search' },
    { label: 'Library', icon: loc.pathname === '/library' ? '📚' : '📚', path: '/library' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      height: 'calc(60px + var(--bottom-inset, 8px))', display: 'flex',
      justifyContent: 'space-around', alignItems: 'center',
      paddingBottom: 'var(--bottom-inset, 8px)', borderTop: '1px solid rgba(255,255,255,0.05)', zIndex: 8000
    }}>
      {items.map(i => (
        <button key={i.path} onClick={() => nav(i.path)}
          style={{ background: 'none', border: 'none', color: loc.pathname === i.path ? 'white' : '#b3b3b3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>{i.icon}</span>
          <span style={{ fontSize: '10px', fontWeight: loc.pathname === i.path ? 700 : 500 }}>{i.label}</span>
        </button>
      ))}
    </div>
  );
}

function Visualizer() {
  const canvasRef = useRef(null);
  const { isPlaying, getFrequencyData } = usePlayerStore();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationId = requestAnimationFrame(render);
        return;
      }

      const data = getFrequencyData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / data.length) * 2.5;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * canvas.height;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#1DB954');
        gradient.addColorStop(1, '#191414');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, getFrequencyData]);

  return <canvas ref={canvasRef} width={300} height={100} className="w-full h-24 mb-8 opacity-40" />;
}

function MiniPlayer({ onExpand }) {
  const { currentSong, isPlaying, togglePlay, playNext, progress, duration } = usePlayerStore();
  if (!currentSong) return null;

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      onClick={onExpand}
      className="fixed bottom-[70px] left-2 right-2 bg-zinc-900/95 backdrop-blur-xl rounded-lg p-2 flex items-center gap-3 z-[9000] shadow-2xl border border-white/5 animate-in slide-in-from-bottom-2 duration-500 active:scale-[0.98] transition-all"
    >
      <SongImage src={currentSong.albumArt} source={currentSong.source} size={44} radius={6} className="shadow-lg" />

      <div className="flex-1 min-w-0 pr-2 relative">
        <div className="flex items-center gap-1.5">
          <h4 className="text-[13px] font-bold text-white truncate leading-tight tracking-tight">{currentSong.title}</h4>
          {isPlaying && (
            <div className="flex items-end gap-[1px] h-2.5 mb-0.5">
              <div className="w-[1.5px] bg-[#1DB954] animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
              <div className="w-[1.5px] bg-[#1DB954] animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
              <div className="w-[1.5px] bg-[#1DB954] animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '80%' }} />
            </div>
          )}
        </div>
        <p className="text-[11px] font-medium text-zinc-400 truncate mt-0.5 uppercase tracking-wide">{currentSong.artist}</p>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={e => { e.stopPropagation(); togglePlay(); }} className="p-2 text-white active:scale-90 transition-transform">
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
        </button>
        <button onClick={e => { e.stopPropagation(); playNext(); }} className="p-2 text-zinc-400 active:scale-90 transition-transform">
          <SkipForward size={20} fill="currentColor" />
        </button>
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-zinc-800 rounded-full w-[calc(100%-16px)] mx-2 mb-0.5 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
function NowPlayingScreen({ onClose }) {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, progress, duration, seekTo, queue, currentIndex, setEQ, getFrequencyData } = usePlayerStore();
  const [tab, setTab] = useState('player'); // player | lyrics | queue
  const [showOptions, setShowOptions] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoTransitioning, setVideoTransitioning] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null); // null | minutes
  const timerRef = useRef(null);
  const { lyrics, seekTo: seekToLyrics } = useLyrics(currentSong);

  const YOUR_API = 'https://new-youtube-o7cl.onrender.com';

  const fetchVideo = async () => {
    setVideoTransitioning(true);

    // YouTube songs — videoId already stored, INSTANT switch
    const vid = currentSong.videoId || window.__currentVideoId;
    if (vid) {
      setVideoId(vid);
      // Pause audio, video takes over
      if (window.__audioEl) {
        window.__audioEl.pause();
        window.__audioEl.muted = true;
      }
      setShowVideo(true);
      setVideoTransitioning(false);
      return;
    }

    // Existing videoId logic (from previous searches)
    if (videoId) {
      if (window.__audioEl) {
        window.__audioEl.pause();
        window.__audioEl.muted = true;
      }
      setShowVideo(true);
      setVideoTransitioning(false);
      return;
    }

    setVideoLoading(true);
    try {
      const q = `${currentSong.title} ${currentSong.artist} official video`;
      const r = await fetch(`${YOUR_API}/search?q=${encodeURIComponent(q)}`);
      if (r.ok) {
        const items = await r.json();
        const vid = items?.[0]?.videoId;
        if (vid) {
          setVideoId(vid);
          if (window.__audioEl) {
            window.__audioEl.pause();
            window.__audioEl.muted = true;
          }
          setShowVideo(true);
        } else {
          alert('Video not found');
        }
      }
    } catch {
      alert('Could not load video');
    }

    setVideoLoading(false);
    setVideoTransitioning(false);
  };

  const switchToAudio = () => {
    // Resume audio
    if (window.__audioEl) {
      window.__audioEl.muted = false;
      window.__audioEl.play().catch(() => { });
    }
    setShowVideo(false);
    setVideoTransitioning(false);
  };

  useEffect(() => {
    setVideoId(null);
    setShowVideo(false);
    setTranslated(false);
  }, [currentSong?.id]);

  useEffect(() => {
    if (sleepTimer !== null) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        togglePlay();
        setSleepTimer(null);
        alert('Sleep timer finished. Music stopped.');
      }, sleepTimer * 60000);
    }
    return () => clearTimeout(timerRef.current);
  }, [sleepTimer]);

  if (!currentSong) return null;

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
  const audioTime = Math.floor(window.__audioEl?.currentTime || 0);

  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col animate-in slide-in-from-bottom duration-500">
      {/* 🔴 HEADER */}
      <header className="flex items-center justify-between p-6">
        <button onClick={onClose} className="p-2 -ml-2 text-white active:scale-95 transition-transform"><ChevronDown size={28} /></button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Now Playing</span>
          <span className="text-xs font-bold text-white truncate max-w-[200px] mt-0.5">{currentSong.album || currentSong.title}</span>
        </div>
        <button onClick={() => setShowOptions(true)} className="p-2 -mr-2 text-white active:scale-95 transition-transform"><MoreVertical size={24} /></button>
      </header>

      {/* 🔴 TABS */}
      <div className="flex px-6 border-b border-white/5">
        {['player', 'lyrics', 'queue'].map(t => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'text-white border-b-2 border-white' : 'text-zinc-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {tab === 'player' && (
          <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Album Art / Video Container */}
            <div className={`relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl mb-12 transition-transform duration-700 ${isPlaying ? 'scale-100' : 'scale-[0.92] opacity-80'}`}>
              {showVideo && videoId ? (
                <div className="w-full h-full bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1&start=${audioTime}`}
                    className="w-full h-full border-none"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={switchToAudio}
                    className="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2"
                  >
                    <Disc size={14} /> Switch to Audio
                  </button>
                </div>
              ) : (
                <>
                  <img src={getImage(currentSong.albumArt, currentSong.source)} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={fetchVideo}
                    disabled={videoLoading || videoTransitioning}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {videoLoading ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Play size={14} fill="currentColor" />
                    )}
                    {videoLoading ? 'Searching...' : 'Watch Video'}
                  </button>
                </>
              )}
            </div>

            {/* Title & Info */}
            <div className="flex items-center justify-between mb-8">
              <div className="min-w-0 pr-4">
                <h2 className="text-2xl font-black text-white truncate tracking-tight">{currentSong.title}</h2>
                <p className="text-base font-bold text-zinc-400 mt-1 truncate uppercase tracking-tight">{currentSong.artist}</p>
              </div>
              <button className="text-zinc-400 hover:text-[#1DB954] transition-colors"><Heart size={28} /></button>
            </div>

            <Visualizer />

            {/* Progress Bar */}
            <div className="mb-8 group">
              <div
                className="relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const p = (e.clientX - r.left) / r.width;
                  seekTo(p * duration);
                }}
              >
                <div className="absolute h-full bg-white rounded-full" style={{ width: `${progressPct}%` }} />
                <div className="absolute w-4 h-4 bg-white rounded-full -top-[5px] shadow-xl" style={{ left: `calc(${progressPct}% - 8px)` }} />
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-black text-zinc-500 tabular-nums uppercase tracking-widest">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-2 mb-12">
              <button className="text-zinc-500 hover:text-white transition-colors"><Shuffle size={20} /></button>
              <button onClick={playPrev} className="text-white active:scale-90 transition-transform"><SkipBack size={36} fill="currentColor" /></button>
              <button
                onClick={togglePlay}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-2xl active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1.5" />}
              </button>
              <button onClick={playNext} className="text-white active:scale-90 transition-transform"><SkipForward size={36} fill="currentColor" /></button>
              <button className="text-zinc-500 hover:text-white transition-colors"><Repeat size={20} /></button>
            </div>

            {/* EQ Selector */}
            <div className="mb-10 animate-in fade-in duration-1000">
              <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Sound Profile</div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                {Object.keys(EQ_PRESETS).map(name => (
                  <button
                    key={name}
                    onClick={() => setEQ(EQ_PRESETS[name])}
                    className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 active:bg-[#1DB954] active:text-black transition-all whitespace-nowrap"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Device / Share Row */}
            <div className="flex items-center justify-between text-zinc-400">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Globe size={18} /> AirPlay</button>
              <button className="p-2"><Share2 size={20} /></button>
            </div>
          </div>
        )}

        {tab === 'lyrics' && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 pb-20 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-[#1DB954] uppercase tracking-widest">Enhanced Synced Lyrics</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setTranslated(!translated)}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${translated ? 'text-[#1DB954]' : 'text-zinc-500 hover:text-white'}`}
                >
                  {translated ? 'Show Original' : 'Translator'}
                </button>
                <button className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Meaning</button>
                <button
                  onClick={() => {
                    const mins = prompt('Enter minutes for sleep timer (e.g. 15):');
                    if (mins) setSleepTimer(parseInt(mins));
                  }}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${sleepTimer ? 'text-purple-400' : 'text-zinc-500'}`}
                >
                  {sleepTimer ? `Timer: ${sleepTimer}m` : <Clock size={14} className="inline mr-1" />}
                </button>
              </div>
            </div>

            {lyrics.loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-[#1DB954] rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest">Hydrating lyrics...</span>
              </div>
            ) : lyrics.lines.length > 0 ? (
              <div className="space-y-8">
                {lyrics.lines.map((l, i) => {
                  const active = i === lyrics.activeLine;
                  return (
                    <div
                      key={i}
                      onClick={() => l.time && seekToLyrics(l.time)}
                      className={`group relative py-2 transition-all duration-700 cursor-pointer ${active ? 'opacity-100 scale-105' : 'opacity-30 scale-100 hover:opacity-60'}`}
                    >
                      <div
                        className={`text-3xl font-black leading-tight tracking-tighter ${active ? 'text-white' : 'text-zinc-400'}`}
                        style={{ textShadow: active ? '0 0 40px rgba(255,255,255,0.4)' : 'none' }}
                      >
                        {translated ? `${l.text} (Translated)` : l.text}
                      </div>

                      {active && (
                        <div className="flex gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigator.share?.({ text: l.text }); }}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1"
                          >
                            <Share2 size={12} /> Share
                          </button>
                          <button
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1"
                          >
                            <Mic2 size={12} /> Meaning
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-zinc-500 uppercase font-black text-xs tracking-widest italic flex flex-col items-center gap-4">
                <Music size={40} className="opacity-20" />
                No lyrics found for this track
              </div>
            )}
          </div>
        )}

        {tab === 'queue' && (
          <div className="animate-in fade-in duration-500 pb-20">
            <h3 className="text-[10px] font-black text-[#1DB954] uppercase tracking-widest mb-6">Now Playing</h3>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl mb-10 shadow-lg ring-1 ring-white/5">
              <SongImage src={currentSong.albumArt} source={currentSong.source} size={56} radius={8} />
              <div className="min-w-0 pr-2">
                <div className="text-sm font-bold text-white truncate">{currentSong.title}</div>
                <div className="text-xs font-medium text-zinc-400 mt-1 uppercase truncate tracking-tight">{currentSong.artist}</div>
              </div>
            </div>

            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Next From Queue</h3>
            <div className="space-y-4">
              {queue.slice(currentIndex + 1, currentIndex + 21).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-2 rounded-lg active:bg-white/5 transition-colors">
                  <SongImage src={s.albumArt} source={s.source} size={48} radius={6} />
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-sm font-bold text-white truncate">{s.title}</div>
                    <div className="text-xs font-medium text-zinc-500 mt-0.5 truncate uppercase tracking-tight">{s.artist}</div>
                  </div>
                  <button className="text-zinc-600"><ListMusic size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showOptions && <SongBottomSheet song={currentSong} onClose={() => setShowOptions(false)} />}
    </div>
  );
}

// ── PAGES ──

function MobileLibrary() {
  const navigate = useNavigate();
  const sections = [
    { label: 'Liked Songs', path: '/liked-songs', icon: '❤️', color: '#5038a0' },
    { label: 'Recently Played', path: '/recently-played', icon: '🕐', color: '#1e3264' },
    { label: 'Albums', path: '/albums', icon: '💿', color: '#27856a' },
    { label: 'Artists', path: '/artists', icon: '🎤', color: '#e91429' },
    { label: 'Playlists', path: '/playlists', icon: '🎵', color: '#ba5d07' },
    {
      label: 'Import from Spotify', sub: 'Bring your playlists', path: '/import',
      bg: 'linear-gradient(135deg,#1DB954,#158a3e)',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
    },
  ];
  return (
    <div style={{ padding: '16px', paddingTop: '48px' }}>
      <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, marginBottom: '24px' }}>Your Library</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map(s => (
          <div key={s.path} onClick={() => navigate(s.path)}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', cursor: 'pointer' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: s.bg || s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{s.label}</div>
              <div style={{ color: '#a7a7a7', fontSize: '12px', marginTop: '2px' }}>{s.sub || 'Tap to browse'}</div>
            </div>
            <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="#a7a7a7"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileHomePage() {
  const { playSong } = usePlayerStore();
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 12 && hours < 17) setGreeting('Good afternoon');
    else if (hours >= 17 || hours < 5) setGreeting('Good evening');
  }, []);

  const [activeCategory, setActiveCategory] = useState('Music');

  const categories = ['Music', 'Podcasts', 'Audiobooks', 'Concerts', 'Charts'];

  const renderContent = () => {
    if (activeCategory === 'Podcasts') {
      return (
        <section className="animate-in fade-in duration-500">
          <h2 className="text-xl font-black text-white mb-4 tracking-tighter">Popular Podcasts</h2>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_DATA.podcasts.map(pod => (
              <div key={pod.id} className="flex flex-col gap-2 active:scale-95 transition-transform" onClick={() => playSong(pod, MOCK_DATA.podcasts)}>
                <SongImage src={pod.albumArt} source="Mock" size={160} radius={12} className="w-full aspect-square shadow-xl" />
                <div className="text-sm font-bold text-white line-clamp-1">{pod.title}</div>
                <div className="text-xs font-medium text-zinc-500 line-clamp-1">{pod.artist}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeCategory === 'Audiobooks') {
      return (
        <section className="animate-in fade-in duration-500">
          <h2 className="text-xl font-black text-white mb-4 tracking-tighter">Trending Audiobooks</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {MOCK_DATA.audiobooks.map(book => (
              <div key={book.id} className="shrink-0 w-40 active:scale-95 transition-transform" onClick={() => playSong(book, MOCK_DATA.audiobooks)}>
                <SongImage src={book.albumArt} source="Mock" size={160} radius={8} className="shadow-2xl mb-2" />
                <div className="text-[13px] font-bold text-white line-clamp-1">{book.title}</div>
                <div className="text-[11px] font-medium text-zinc-400 mt-1">{book.artist}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    // Default: Music
    return (
      <>
        {/* 🔴 TOP MIXES (2x4 Grid) */}
        <section className="mb-10 animate-in slide-in-from-bottom-2 duration-700">
          <div className="grid grid-cols-2 gap-2">
            {MOCK_DATA.recentlyPlayed.slice(0, 6).map(song => (
              <div
                key={song.id}
                onClick={() => playSong(song, MOCK_DATA.recentlyPlayed)}
                className="flex items-center bg-white/10 rounded-md overflow-hidden active:scale-95 transition-transform"
              >
                <SongImage src={song.albumArt} source={song.source} size={56} radius={0} />
                <div className="px-3 flex-1 min-w-0">
                  <span className="text-[11px] font-black text-white leading-tight line-clamp-2">{song.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🔴 TRENDING NOW (Horizontal Scroll) */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-white mb-4 tracking-tighter">Trending Now</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
            {MOCK_DATA.trending.map(song => (
              <div
                key={song.id}
                onClick={() => playSong(song, MOCK_DATA.trending)}
                className="shrink-0 w-36 active:scale-95 transition-transform group"
              >
                <div className="relative mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <SongImage src={song.albumArt} source={song.source} size={144} radius={8} />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-black shadow-lg">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="text-[12px] font-bold text-white truncate">{song.title}</div>
                <div className="text-[11px] font-medium text-zinc-400 mt-1 truncate uppercase tracking-tighter">{song.artist}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 🔴 MADE FOR YOU (Circles Mix) */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-white mb-4 tracking-tighter">Made For You</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
            {MOCK_DATA.madeForYou.map(song => (
              <div
                key={song.id}
                onClick={() => playSong(song, MOCK_DATA.madeForYou)}
                className="shrink-0 w-32 text-center active:scale-95 transition-transform"
              >
                <div className="relative inline-block mb-3">
                  <SongImage src={song.albumArt} source={song.source} size={128} radius={64} className="ring-1 ring-white/10" />
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-black border-2 border-zinc-950 shadow-xl">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>
                <div className="text-[11px] font-bold text-white line-clamp-1">{song.title}</div>
                <div className="text-[10px] font-medium text-zinc-500 mt-1 uppercase">Spotify Mix</div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="px-4 pt-12 pb-32 min-h-screen bg-gradient-to-b from-zinc-900 to-black overflow-x-hidden">
      {/* 🔴 HEADER & CATEGORIES */}
      <header className="mb-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white tracking-tight">{greeting}</h1>
          <div className="flex items-center gap-4">
            <button className="text-zinc-400 hover:text-white transition-colors"><Globe size={20} /></button>
            <button className="text-zinc-400 hover:text-white transition-colors"><Clock size={20} /></button>
            <button className="text-zinc-400 hover:text-white transition-colors"><Settings size={20} /></button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* 🔴 JUMP BACK IN / NEW SECTION */}
      <section className="mb-10 animate-in slide-in-from-left duration-700">
        <div className="flex items-center gap-4 bg-gradient-to-r from-zinc-800 to-zinc-900 p-4 rounded-xl shadow-2xl border border-white/5 group active:scale-95 transition-all">
          <SongImage
            src={MOCK_DATA.recentlyPlayedLarge[activeCategory === 'Podcasts' ? 1 : 0].albumArt}
            source="Mock" size={80} radius={8}
            className="shadow-xl ring-2 ring-white/10 group-hover:scale-105 transition-transform"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">Jump back in</div>
            <div className="text-lg font-black text-white truncate tracking-tight">{MOCK_DATA.recentlyPlayedLarge[activeCategory === 'Podcasts' ? 1 : 0].title}</div>
            <div className="text-sm font-medium text-zinc-400 truncate mt-0.5">{MOCK_DATA.recentlyPlayedLarge[activeCategory === 'Podcasts' ? 1 : 0].artist}</div>
          </div>
          <button
            onClick={() => playSong(MOCK_DATA.recentlyPlayedLarge[activeCategory === 'Podcasts' ? 1 : 0])}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl active:scale-90 transition-transform"
          >
            <Play size={20} fill="currentColor" className="ml-1" />
          </button>
        </div>
      </section>

      {renderContent()}

      {/* 🔴 REMAINING SECTIONS */}
      <section className="mb-12 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white tracking-tighter">New Releases</h2>
          <button className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">See all</button>
        </div>
        <div className="flex flex-col gap-4">
          {MOCK_DATA.trending.slice(0, 4).map(song => (
            <div
              key={song.id}
              onClick={() => playSong(song, MOCK_DATA.trending)}
              className="flex items-center gap-4 bg-white/5 p-2 rounded-lg active:bg-white/10 transition-colors"
            >
              <SongImage src={song.albumArt} source={song.source} size={56} radius={6} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate tracking-tight">{song.title}</div>
                <div className="text-xs font-medium text-zinc-500 mt-0.5 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#1DB954]" />
                  {song.artist}
                </div>
              </div>
              <button className="p-2 text-zinc-400 hover:text-white"><PlusCircle size={20} /></button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔴 EDITORIAL / SMART FEED */}
      <section className="mb-20">
        <h2 className="text-xl font-black text-white mb-6 tracking-tighter">Editor's Choice</h2>
        <div className="space-y-6">
          <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-2xl group active:scale-[0.98] transition-all">
            <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
              <span className="text-[10px] font-black text-[#1DB954] uppercase tracking-[0.2em] mb-2">Exclusive</span>
              <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Night Drive Essentials</h3>
              <p className="text-xs font-medium text-zinc-300">The perfect companion for late night city lights.</p>
            </div>
          </div>

          <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-2xl group active:scale-[0.98] transition-all bg-[#2e3137]">
            <div className="absolute inset-0 flex items-center justify-around opacity-20">
              <Disc size={120} className="animate-spin-slow" />
              <Music size={120} className="animate-pulse" />
            </div>
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2">New Release</span>
              <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Synthwave 2024</h3>
              <p className="text-xs font-medium text-zinc-300">Retro futuristic beats for your workspace.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── MAIN APP ──

export default function MobileApp() {
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const { currentSong } = usePlayerStore();

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#121212', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Routes>
          <Route path="/" element={<MobileHomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<MobileLibrary />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/liked-songs" element={<LikedSongsPage />} />
          <Route path="/recently-played" element={<RecentlyPlayedPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
        </Routes>
      </div>
      <MiniPlayer onExpand={() => setShowNowPlaying(true)} />
      <BottomNav />
      {showNowPlaying && <NowPlayingScreen onClose={() => setShowNowPlaying(false)} />}
    </div>
  );
}
