export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'No query' });

    const PIPED_INSTANCES = [
        'https://pipedapi.kavin.rocks',
        'https://piped-api.lunar.icu',
        'https://piped-api.garudalinux.org',
        'https://api.piped.projectsegfau.lt',
        'https://piped-api.moomoo.me',
        'https://pipedapi.in.projectsegfau.lt',
    ];

    for (const base of PIPED_INSTANCES) {
        try {
            const r = await fetch(
                `${base}/search?q=${encodeURIComponent(q)}&filter=music_songs`,
                { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(6000) }
            );
            if (!r.ok) continue;
            const data = await r.json();
            const items = (data?.items || data || []).filter(i => i.type === 'stream' || i.videoId || i.url);
            if (!items.length) continue;

            const songs = items.slice(0, 20).map(i => {
                const vid = i.videoId || i.url?.split('v=')[1] || i.url?.split('/').pop();
                return {
                    videoId: vid,
                    title: i.title,
                    artist: i.uploaderName || i.uploader || 'Unknown',
                    duration: i.duration,
                    thumbnail: i.thumbnail || i.thumbnails?.[0]?.url || '',
                };
            }).filter(s => s.videoId && s.title);
            return res.json({ songs, source: base });
        } catch (e) { continue; }
    }
    return res.json({ songs: [], error: 'All instances failed' });
}
