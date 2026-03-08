const fs = require('fs');

function applyToSearchPage() {
    const file = 'client/src/pages/SearchPage.jsx';

    const newContent = `import { useState, useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';

// Add this function at the top of both files (outside components):
function getImage(url, source) {
  if (!url) return '';
  // iTunes — upgrade to highest res
  if (source === 'iTunes') return url.replace('100x100bb', '600x600bb').replace('100x100', '600x600');
  // Deezer — use xl cover
  if (source === 'Deezer') return url.includes('?') ? url : url + '?size=xl';
  // Audius — already high res
  if (source === 'Audius') return url;
  // JioSaavn — use highest quality
  if (url.includes('saavn') || url.includes('jiosaavn')) {
    return url.replace('150x150', '500x500').replace('50x50', '500x500');
  }
  return url;
}

// Fallback gradient colors per source:
function getSourceGradient(source) {
  const g = {
    JioSaavn: 'linear-gradient(135deg, #1a472a, #1DB954)',
    Deezer:   'linear-gradient(135deg, #4a0080, #A238FF)',
    iTunes:   'linear-gradient(135deg, #7d0000, #FC3C44)',
    Audius:   'linear-gradient(135deg, #5a0000, #CC0000)',
  };
  return g[source] || 'linear-gradient(135deg, #282828, #1a1a1a)';
}

// Reusable SongImage component — use this EVERYWHERE instead of raw <img>:
function SongImage({ src, source, size = 46, radius = 4, style = {} }) {
  const [failed, setFailed] = useState(false);
  const finalSrc = getImage(src, source);
  const noteIcon = (
    <svg width={size*0.45} height={size*0.45} viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: getSourceGradient(source),
      overflow: 'hidden', display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', ...style
    }}>
      {!failed && finalSrc ? (
        <img
          src={finalSrc}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setFailed(true)}
          crossOrigin="anonymous"
        />
      ) : noteIcon}
    </div>
  );
}

const GENRES = [
  {name:'Bollywood',color:'#e91429'},{name:'Phonk',color:'#1a1a2e'},
  {name:'Hollywood',color:'#1e3264'},{name:'K-Pop',color:'#dc148c'},
  {name:'Hip Hop',color:'#ba5d07'},{name:'Party',color:'#e8115b'},
  {name:'Lofi',color:'#0d73ec'},{name:'Punjabi',color:'#503750'},
  {name:'Workout',color:'#148a08'},{name:'Classical',color:'#27856a'},
  {name:'Devotional',color:'#e8a029'},{name:'Trending',color:'#1DB954'},
];

// ═══════════════════════════════════════════════════
// MULTI-PLATFORM SEARCH — runs all APIs in parallel
// ═══════════════════════════════════════════════════
async function searchEverywhere(query) {
  const seen = new Set();
  const all = [];

  const add = (song) => {
    const key = \`\${song.title?.toLowerCase()}-\${song.artist?.toLowerCase()}\`;
    if (!seen.has(key) && song.title && (song.audioUrl || song.downloadUrl?.length)) {
      seen.add(key);
      all.push(song);
    }
  };

  // Run all APIs simultaneously
  const [saavn1, saavn2, deezer, itunes, audius] = await Promise.allSettled([

    // ── API 1: JioSaavn primary ──
    fetch(\`https://saavn.dev/api/search/songs?query=\${encodeURIComponent(query)}&limit=20\`, {signal:AbortSignal.timeout(8000)})
      .then(r=>r.json()).then(d=>{
        (d?.data?.results||[]).forEach(s=>{
          const urls = s.downloadUrl||[];
          const best = urls.find(u=>u.quality==='320kbps')||urls.find(u=>u.quality==='160kbps')||urls[urls.length-1];
          if(best?.url) add({
            id:\`saavn-\${s.id}\`, title:s.name,
            artist:s.artists?.primary?.map(a=>a.name).join(', ')||'Unknown',
            album:s.album?.name||'',
            albumArt:s.image?.[2]?.url||s.image?.[1]?.url||'',
            duration:s.duration, audioUrl:best.url,
            downloadUrl:s.downloadUrl, source:'JioSaavn', quality:'320kbps'
          });
        });
      }),

    // ── API 2: JioSaavn mirror ──
    fetch(\`https://saavn.me/api/search/songs?query=\${encodeURIComponent(query)}&limit=20\`, {signal:AbortSignal.timeout(6000)})
      .then(r=>r.json()).then(d=>{
        (d?.data?.results||[]).forEach(s=>{
          const urls = s.downloadUrl||[];
          const best = urls.find(u=>u.quality==='320kbps')||urls[urls.length-1];
          if(best?.url) add({
            id:\`saavn2-\${s.id}\`, title:s.name,
            artist:s.artists?.primary?.map(a=>a.name).join(', ')||'Unknown',
            album:s.album?.name||'', albumArt:s.image?.[2]?.url||'',
            duration:s.duration, audioUrl:best.url,
            downloadUrl:s.downloadUrl, source:'JioSaavn', quality:'320kbps'
          });
        });
      }),

    // ── API 3: Deezer (international — all genres including Phonk) ──
    fetch(\`https://api.deezer.com/search?q=\${encodeURIComponent(query)}&limit=25&output=json\`, {signal:AbortSignal.timeout(8000)})
      .then(r=>r.json()).then(d=>{
        (d?.data||[]).forEach(s=>{
          if(s.preview) add({
            id:\`deezer-\${s.id}\`, title:s.title,
            artist:s.artist?.name||'Unknown',
            album:s.album?.title||'',
            albumArt:s.album?.cover_xl||s.album?.cover_big||s.album?.cover_medium||'',
            duration:s.duration, audioUrl:s.preview,
            downloadUrl:[{url:s.preview,quality:'preview'}],
            source:'Deezer', quality:'preview (30s)'
          });
        });
      }),

    // ── API 4: iTunes (Apple Music previews — ALL international songs) ──
    fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(query)}&media=music&limit=25&entity=song\`, {signal:AbortSignal.timeout(8000)})
      .then(r=>r.json()).then(d=>{
        (d?.results||[]).forEach(s=>{
          if(s.previewUrl) add({
            id:\`itunes-\${s.trackId}\`, title:s.trackName,
            artist:s.artistName||'Unknown',
            album:s.collectionName||'',
            albumArt:(s.artworkUrl100||'').replace('100x100','600x600'),
            duration:Math.round((s.trackTimeMillis||30000)/1000),
            audioUrl:s.previewUrl,
            downloadUrl:[{url:s.previewUrl,quality:'preview'}],
            source:'iTunes', quality:'preview (30s)'
          });
        });
      }),

    // ── API 5: Audius (decentralized — indie, electronic, Phonk, underground) ──
    fetch(\`https://discoveryprovider.audius.co/v1/tracks/search?query=\${encodeURIComponent(query)}&limit=20&app_name=SpotifyClone\`, {signal:AbortSignal.timeout(8000)})
      .then(r=>r.json()).then(d=>{
        (d?.data||[]).forEach(s=>{
          const streamUrl = \`https://discoveryprovider.audius.co/v1/tracks/\${s.id}/stream?app_name=SpotifyClone\`;
          add({
            id:\`audius-\${s.id}\`, title:s.title,
            artist:s.user?.name||s.user?.handle||'Unknown',
            album:s.album||'',
            albumArt:s.artwork?.['1000x1000']||s.artwork?.['480x480']||s.artwork?.['150x150']||'',
            duration:s.duration,
            audioUrl:streamUrl,
            downloadUrl:[{url:streamUrl,quality:'full'}],
            source:'Audius', quality:'full'
          });
        });
      }),
  ]);

  return all;
}

// ── Song source badge ──
function SourceBadge({ source, quality }) {
  const colors = { JioSaavn:'#1DB954', Deezer:'#A238FF', iTunes:'#FC3C44', Audius:'#CC0000' };
  return (
    <span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'4px',background:\`\${colors[source]||'#535353'}22\`,color:colors[source]||'#b3b3b3',fontWeight:700,flexShrink:0,border:\`1px solid \${colors[source]||'#535353'}44\`}}>
      {source}
    </span>
  );
}

// ── Song bottom sheet ──
function SongSheet({ song, songs, onClose }) {
  const { playSong } = usePlayerStore();
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:19998}}/>
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#282828',borderRadius:'16px 16px 0 0',zIndex:19999,paddingBottom:'32px',animation:'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'10px 0 4px'}}>
          <div style={{width:'32px',height:'3px',borderRadius:'2px',background:'rgba(255,255,255,0.2)'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'14px',padding:'10px 20px 14px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <SongImage src={song.albumArt} source={song.source} size={54} radius={8} />
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:'white',fontSize:'15px',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{song.title}</div>
            <div style={{color:'#b3b3b3',fontSize:'13px',marginTop:'2px'}}>{song.artist}</div>
            <SourceBadge source={song.source} quality={song.quality}/>
          </div>
        </div>
        {[
          {icon:'▶️', label:'Play now', fn:()=>{playSong(song,songs);onClose();}},
          {icon:'❤️', label:'Like', fn:()=>{const l=JSON.parse(localStorage.getItem('likedSongs')||'[]');if(!l.some(s=>s.id===song.id)){l.unshift(song);localStorage.setItem('likedSongs',JSON.stringify(l));}onClose();}},
          {icon:'➕', label:'Add to playlist', fn:()=>{const n=prompt('Playlist name?');if(!n)return;const p=JSON.parse(localStorage.getItem('playlists')||'[]');const e=p.find(x=>x.name===n);if(e)e.songs.push(song);else p.push({id:Date.now(),name:n,songs:[song]});localStorage.setItem('playlists',JSON.stringify(p));onClose();}},
          {icon:'📤', label:'Share', fn:()=>{navigator.clipboard?.writeText(\`\${song.title} — \${song.artist}\`);onClose();}},
        ].map(o=>(
          <button key={o.label} onClick={o.fn}
            style={{width:'100%',display:'flex',alignItems:'center',gap:'16px',padding:'14px 20px',background:'none',border:'none',color:'white',cursor:'pointer',fontSize:'14px'}}>
            <span style={{fontSize:'20px',width:'40px',textAlign:'center'}}>{o.icon}</span>{o.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedSong, setSelectedSong] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); setLoading(false); return; }
    setLoading(true); setSearched(true); setFilter('All');
    try {
      const songs = await searchEverywhere(q.trim());
      setResults(songs);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  const handleInput = val => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setLoading(false); setSearched(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(val), 600);
  };

  const fmt = s => s ? \`\${Math.floor(s/60)}:\${String(Math.floor(s)%60).padStart(2,'0')}\` : '';
  const sources = ['All', 'JioSaavn', 'Deezer', 'iTunes', 'Audius'];
  const filtered = filter==='All' ? results : results.filter(s=>s.source===filter);

  return (
    <div style={{background:'#121212',minHeight:'100vh',paddingBottom:'140px'}}>

      {/* ── HEADER ── */}
      <div style={{padding:'0 16px 8px',paddingTop:'calc(env(safe-area-inset-top,28px) + 12px)',position:'sticky',top:0,background:'#121212',zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#450af5,#c4efd9)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{color:'white',fontSize:'13px',fontWeight:900}}>A</span>
            </div>
            <h1 style={{color:'white',fontSize:'22px',fontWeight:900}}>Search</h1>
          </div>
          <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
            {results.length>0 && (
              <div style={{background:'rgba(29,185,84,0.15)',border:'1px solid rgba(29,185,84,0.3)',borderRadius:'500px',padding:'4px 10px',color:'#1DB954',fontSize:'12px',fontWeight:700}}>
                {results.length} songs
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div style={{position:'relative',marginBottom:searched&&results.length>0?'10px':'0'}}>
          <svg style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#535353" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input ref={inputRef} type="text" inputMode="search" value={query}
            onChange={e=>handleInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&(clearTimeout(debounceRef.current),doSearch(query))}
            placeholder="Songs, artists, albums"
            autoComplete="off" autoCorrect="off" spellCheck={false}
            style={{width:'100%',height:'46px',padding:'0 44px',background:'white',border:'none',borderRadius:'6px',color:'#121212',fontSize:'15px',fontWeight:500,outline:'none',boxSizing:'border-box',WebkitAppearance:'none'}}
          />
          {query && (
            <button onClick={()=>{setQuery('');setResults([]);setSearched(false);inputRef.current?.focus();}}
              style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:'4px',display:'flex'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#535353"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          )}
        </div>

        {/* Source filter tabs */}
        {searched && results.length > 0 && (
          <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'8px',WebkitOverflowScrolling:'touch',scrollbarWidth:'none'}}>
            {sources.map(s=>{
              const count = s==='All' ? results.length : results.filter(r=>r.source===s).length;
              if(s!=='All' && count===0) return null;
              return (
                <button key={s} onClick={()=>setFilter(s)}
                  style={{flexShrink:0,padding:'6px 14px',borderRadius:'500px',border:'1px solid',borderColor:filter===s?'white':'rgba(255,255,255,0.15)',background:filter===s?'white':'transparent',color:filter===s?'#121212':'white',fontSize:'13px',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
                  {s} {count>0&&\`(\${count})\`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{textAlign:'center',padding:'60px 24px'}}>
          <div style={{position:'relative',width:'60px',height:'60px',margin:'0 auto 20px'}}>
            <div style={{position:'absolute',inset:0,border:'3px solid rgba(29,185,84,0.1)',borderTopColor:'#1DB954',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
            <div style={{position:'absolute',inset:'8px',border:'3px solid rgba(162,56,255,0.1)',borderTopColor:'#A238FF',borderRadius:'50%',animation:'spin 1.1s linear infinite reverse'}}/>
            <div style={{position:'absolute',inset:'16px',border:'3px solid rgba(252,60,68,0.1)',borderTopColor:'#FC3C44',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}/>
          </div>
          <p style={{color:'white',fontSize:'15px',fontWeight:700,marginBottom:'6px'}}>Searching everywhere…</p>
          <p style={{color:'#b3b3b3',fontSize:'13px'}}>JioSaavn · Deezer · iTunes · Audius</p>
        </div>
      )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <div style={{padding:'4px 16px'}}>
          {filtered.map((song,idx) => {
            const active = currentSong?.id === song.id;
            return (
              <div key={\`\${song.id}-\${idx}\`}
                onClick={()=>playSong(song,filtered)}
                style={{display:'flex',alignItems:'center',gap:'12px',padding:'9px 0',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.04)',background:active?'rgba(29,185,84,0.06)':'transparent'}}
                onTouchStart={e=>{if(!active)e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
                onTouchEnd={e=>{if(!active)e.currentTarget.style.background=active?'rgba(29,185,84,0.06)':'transparent';}}>
                <div style={{position:'relative',flexShrink:0}}>
                  <SongImage src={song.albumArt} source={song.source} size={46} radius={4} />
                  {active && isPlaying && (
                    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <div style={{display:'flex',gap:'2px',alignItems:'flex-end',height:'14px'}}>
                        {[6,12,8].map((h,i)=><div key={i} style={{width:'3px',background:'#1DB954',height:\`\${h}px\`,borderRadius:'2px',animation:\`eq\${i+1} \${0.4+i*0.1}s ease infinite alternate\`}}/>)}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:active?'#1DB954':'white',fontSize:'14px',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{song.title}</div>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'3px'}}>
                    <span style={{color:'#b3b3b3',fontSize:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{song.artist}</span>
                    <SourceBadge source={song.source} quality={song.quality}/>
                  </div>
                </div>
                <span style={{color:'#535353',fontSize:'11px',flexShrink:0}}>{fmt(song.duration)}</span>
                <button onClick={e=>{e.stopPropagation();setSelectedSong(song);}}
                  style={{background:'none',border:'none',padding:'8px',cursor:'pointer',flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#b3b3b3"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                </button>
              </div>
            );
          })}

          {/* Preview warning for Deezer/iTunes */}
          {filtered.some(s=>s.quality?.includes('preview')) && (
            <div style={{margin:'16px 0',padding:'12px 16px',background:'rgba(255,255,255,0.04)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)'}}>
              <p style={{color:'#b3b3b3',fontSize:'12px',lineHeight:'1.5'}}>
                ⚡ <strong style={{color:'white'}}>Deezer & iTunes</strong> songs play a 30-second preview. <strong style={{color:'#1DB954'}}>JioSaavn & Audius</strong> songs play in full.
              </p>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length===0 && (
        <div style={{textAlign:'center',padding:'60px 24px'}}>
          <div style={{fontSize:'56px',marginBottom:'16px'}}>🔍</div>
          <p style={{color:'white',fontSize:'18px',fontWeight:800,marginBottom:'8px'}}>No results for "{query}"</p>
          <p style={{color:'#b3b3b3',fontSize:'14px',marginBottom:'28px'}}>Searched JioSaavn, Deezer, iTunes, and Audius</p>
          <button onClick={()=>window.open(\`https://music.youtube.com/search?q=\${encodeURIComponent(query)}\`, '_blank')}
            style={{width:'100%',padding:'14px',background:'#FF0000',border:'none',borderRadius:'500px',color:'white',fontSize:'14px',fontWeight:800,cursor:'pointer',marginBottom:'10px'}}>
            🎬 Search on YouTube Music
          </button>
          <button onClick={()=>window.open(\`https://soundcloud.com/search?q=\${encodeURIComponent(query)}\`, '_blank')}
            style={{width:'100%',padding:'14px',background:'#FF5500',border:'none',borderRadius:'500px',color:'white',fontSize:'14px',fontWeight:800,cursor:'pointer'}}>
            🎵 Search on SoundCloud
          </button>
        </div>
      )}

      {/* Browse grid */}
      {!query && !loading && (
        <div style={{padding:'8px 16px'}}>
          <h2 style={{color:'white',fontSize:'16px',fontWeight:800,marginBottom:'14px'}}>Browse all</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {GENRES.map(g=>(
              <div key={g.name} onClick={()=>{setQuery(g.name);doSearch(g.name);}}
                style={{background:g.color,borderRadius:'8px',padding:'16px 14px',minHeight:'80px',cursor:'pointer'}}
                onTouchStart={e=>e.currentTarget.style.opacity='0.85'}
                onTouchEnd={e=>e.currentTarget.style.opacity='1'}>
                <span style={{color:'white',fontSize:'14px',fontWeight:800}}>{g.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSong && <SongSheet song={selectedSong} songs={filtered} onClose={()=>setSelectedSong(null)}/>}
    </div>
  );
}`;
    fs.writeFileSync(file, newContent, 'utf8');
}

applyToSearchPage();
console.log('SearchPage updated successfully');
