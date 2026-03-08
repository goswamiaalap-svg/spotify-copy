export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { videoId } = req.query;
    if (!videoId) return res.status(400).json({ error: 'No videoId' });

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
            const r = await fetch(`${base}/streams/${videoId}`, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(8000)
            });
            if (!r.ok) continue;
            const data = await r.json();

            // Get best audio stream
            const audioStreams = (data.audioStreams || [])
                .filter(s => s.mimeType?.includes('audio'))
                .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

            const bestAudio = audioStreams[0];

            return res.json({
                videoId,
                title: data.title,
                artist: data.uploader,
                thumbnail: data.thumbnailUrl,
                duration: data.duration,
                audioUrl: bestAudio?.url || null,
                audioMime: bestAudio?.mimeType || 'audio/mp4',
                videoUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1`,
                source: base,
            });
        } catch (e) { continue; }
    }
    return res.status(500).json({ error: 'Could not get stream' });
}
