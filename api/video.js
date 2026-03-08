export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'No query' });

    const PIPED_INSTANCES = [
        'https://pipedapi.kavin.rocks',
        'https://piped-api.garudalinux.org',
        'https://api.piped.projectsegfau.lt',
    ];

    for (const base of PIPED_INSTANCES) {
        try {
            const r = await fetch(
                `${base}/search?q=${encodeURIComponent(q + ' official video')}&filter=videos`,
                { signal: AbortSignal.timeout(6000) }
            );
            if (!r.ok) continue;
            const data = await r.json();
            const first = (data?.items || []).find(i => i.url || i.videoId);
            if (first) {
                const videoId = first.url?.replace('/watch?v=', '') || first.videoId;
                return res.json({ videoId });
            }
        } catch { continue; }
    }
    return res.status(404).json({ error: 'Not found' });
}
