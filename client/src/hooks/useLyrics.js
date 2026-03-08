import { useState, useEffect, useRef } from 'react';

export function useLyrics(currentSong, progress) {
    const [state, setState] = useState({ lines: [], synced: false, loading: false, activeLine: 0, error: false });
    const songIdRef = useRef(null);

    useEffect(() => {
        if (!currentSong?.id || songIdRef.current === currentSong.id) return;
        songIdRef.current = currentSong.id;
        fetch_lyrics(currentSong);
    }, [currentSong?.id]);

    useEffect(() => {
        if (!state.synced || !state.lines.length) return;
        let idx = 0;
        for (let i = 0; i < state.lines.length; i++) {
            if (state.lines[i].time <= progress + 0.5) idx = i; else break;
        }
        if (idx !== state.activeLine) {
            setState(s => ({ ...s, activeLine: idx }));
            // Auto-scroll active line to center
            setTimeout(() => {
                const el = document.getElementById(`lyr-line-${idx}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [Math.floor(progress)]);

    const parseLRC = lrc => {
        const lines = []; const re = /\[(\d{1,2}):(\d{2})[.:'](\d{2,3})\](.*)/g; let m;
        while ((m = re.exec(lrc)) !== null) {
            const t = parseInt(m[1]) * 60 + parseInt(m[2]) + parseInt(m[3].padEnd(3, '0')) / 1000;
            if (m[4].trim()) lines.push({ time: t, text: m[4].trim() });
        }
        return lines;
    };

    const cleanTitle = t => t
        .replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '')
        .replace(/- trending.*/i, '').replace(/- official.*/i, '')
        .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ').trim();

    const fetch_lyrics = async song => {
        setState({ lines: [], synced: false, loading: true, activeLine: 0, error: false });
        const title = cleanTitle(song.title);
        const artist = (song.artist || '').split(',')[0].trim();

        // Try 1: lrclib with artist
        try {
            const r = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`);
            if (r.ok) {
                const data = await r.json();
                for (const item of data || []) {
                    if (item.syncedLyrics?.length > 50) {
                        const lines = parseLRC(item.syncedLyrics);
                        if (lines.length > 3) { setState({ lines, synced: true, loading: false, activeLine: 0, error: false }); return; }
                    }
                }
                for (const item of data || []) {
                    if (item.plainLyrics?.length > 50) {
                        const lines = item.plainLyrics.split('\n').filter(l => l.trim()).map(text => ({ text, time: null }));
                        setState({ lines, synced: false, loading: false, activeLine: 0, error: false }); return;
                    }
                }
            }
        } catch { }

        // Try 2: lrclib title only
        try {
            const r = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}`);
            if (r.ok) {
                const data = await r.json();
                for (const item of data || []) {
                    if (item.syncedLyrics?.length > 50) {
                        const lines = parseLRC(item.syncedLyrics);
                        if (lines.length > 3) { setState({ lines, synced: true, loading: false, activeLine: 0, error: false }); return; }
                    }
                }
                for (const item of data || []) {
                    if (item.plainLyrics?.length > 50) {
                        const lines = item.plainLyrics.split('\n').filter(l => l.trim()).map(text => ({ text, time: null }));
                        setState({ lines, synced: false, loading: false, activeLine: 0, error: false }); return;
                    }
                }
            }
        } catch { }

        // Try 3: lyrics.ovh
        try {
            const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
            if (r.ok) {
                const d = await r.json();
                if (d?.lyrics?.length > 30) {
                    const lines = d.lyrics.split('\n').filter(l => l.trim()).map(text => ({ text, time: null }));
                    setState({ lines, synced: false, loading: false, activeLine: 0, error: false }); return;
                }
            }
        } catch { }

        setState({ lines: [{ text: 'Lyrics not available for this track', time: null }], synced: false, loading: false, activeLine: 0, error: true });
    };

    return state;
}
