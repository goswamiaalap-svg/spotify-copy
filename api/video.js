export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'No query' });

    try {
        // Use YOUR Render API first
        const r = await fetch(
            `https://new-youtube-o7cl.onrender.com/search?q=${encodeURIComponent(q + ' official video')}`,
            { signal: AbortSignal.timeout(10000) }
        );
        if (r.ok) {
            const items = await r.json();
            const first = items?.[0];
            if (first?.videoId) {
                return res.json({ videoId: first.videoId, thumbnail: first.thumbnail });
            }
        }
    } catch (e) {
        console.error('Video API error:', e);
    }

    return res.status(404).json({ error: 'Not found' });
}
