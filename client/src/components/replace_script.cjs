const fs = require('fs');
const file = 'c:/Users/AALAP GOSWAMI/OneDrive/Desktop/spotify copy/client/src/components/MobileApp.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /    return \([\s\S]*?    \);\n}/;

const newReturn = `    return (
  <div style={{
    position:'fixed', inset:0, zIndex:9999,
    background:'#121212',
    display:'flex', flexDirection:'column',
    paddingTop:'var(--status-bar-height, 28px)',
    animation:'slideUp 0.32s cubic-bezier(0.32,0.72,0,1)',
  }}>

    {/* ── HEADER ── */}
    <div style={{display:'flex', alignItems:'center', padding:'10px 16px 0', flexShrink:0}}>
      <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', padding:'8px'}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
      </button>
      <div style={{flex:1, textAlign:'center'}}>
        <div style={{color:'rgba(255,255,255,0.6)', fontSize:'11px', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase'}}>Now Playing</div>
        <div style={{color:'white', fontSize:'13px', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', padding:'0 8px'}}>{currentSong.album || currentSong.artist}</div>
      </div>
      <button style={{background:'none', border:'none', cursor:'pointer', padding:'8px'}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </button>
    </div>

    {/* ── TABS ── */}
    <div style={{display:'flex', padding:'8px 16px 0', gap:'0', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
      {[['player','🎵 Player'],['lyrics','🎤 Lyrics'],['queue','📋 Queue']].map(([t,label])=>(
        <button key={t} onClick={()=>setTab(t)}
          style={{flex:1, padding:'10px 0', background:'none', border:'none', borderBottom:\`2px solid \${tab===t?'#1DB954':'transparent'}\`, cursor:'pointer', color:tab===t?'white':'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:tab===t?700:500, transition:'all 0.2s', marginBottom:'-1px'}}>
          {label}
        </button>
      ))}
    </div>

    {/* ── SCROLLABLE CONTENT ── */}
    <div style={{flex:1, overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch'}}>

      {/* ════ PLAYER TAB ════ */}
      {tab==='player' && (
        <div style={{padding:'16px 20px 32px'}}>

          {/* Album Art / Video */}
          <div style={{position:'relative', marginBottom:'20px'}}>
            {showVideo && videoId ? (
              <div style={{width:'100%', aspectRatio:'16/9', borderRadius:'12px', overflow:'hidden', background:'#000', position:'relative'}}>
                <iframe
                  src={videoId?.startsWith('search:') ? \`https://www.youtube.com/results?search_query=\${videoId.replace('search:','')}\` : \`https://www.youtube-nocookie.com/embed/\${videoId}?autoplay=1&controls=1&rel=0&showinfo=0\`}
                  style={{width:'100%', height:'100%', border:'none', display:'block'}}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
                <button onClick={()=>setShowVideo(false)}
                  style={{position:'absolute', top:'10px', right:'10px', background:'rgba(0,0,0,0.85)', border:'none', borderRadius:'500px', color:'white', padding:'8px 14px', fontSize:'12px', fontWeight:700, cursor:'pointer', zIndex:10}}>
                  ← Artwork
                </button>
              </div>
            ) : (
              <div style={{position:'relative'}}>
                <div style={{width:'100%', aspectRatio:'1/1', borderRadius:'12px', overflow:'hidden', background:'linear-gradient(135deg,#282828,#1a1a1a)', boxShadow:'0 24px 80px rgba(0,0,0,0.8)', transform:isPlaying?'scale(1.02)':'scale(0.97)', transition:'transform 0.4s ease', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {currentSong?.albumArt ? (
                    <img
                      src={currentSong.albumArt}
                      alt=""
                      style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  {/* Fallback when image fails */}
                  <div style={{display: currentSong?.albumArt ? 'none' : 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:'100%', height:'100%'}}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    <span style={{color:'rgba(255,255,255,0.3)', fontSize:'13px', marginTop:'12px'}}>No artwork</span>
                  </div>
                </div>
                <button onClick={fetchVideo} disabled={videoLoading}
                  style={{position:'absolute', bottom:'14px', right:'14px', background:'rgba(0,0,0,0.82)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'500px', color:'white', padding:'9px 16px', fontSize:'12px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'7px', zIndex:10, boxShadow:'0 4px 16px rgba(0,0,0,0.5)'}}>
                  {videoLoading
                    ? <><div style={{width:'12px',height:'12px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>Loading…</>
                    : <><svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>Switch to video</>
                  }
                </button>
              </div>
            )}
          </div>

          {/* Song info + like */}
          <div style={{display:'flex', alignItems:'center', marginBottom:'16px'}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{color:'white', fontSize:'22px', fontWeight:900, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.3px'}}>{currentSong.title}</div>
              <div style={{color:'#b3b3b3', fontSize:'14px', marginTop:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{currentSong.artist}</div>
            </div>
            <button onClick={toggleLike} style={{background:'none', border:'none', cursor:'pointer', padding:'10px 8px', flexShrink:0}}>
              {liked
                ? <svg width="26" height="26" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              }
            </button>
          </div>

          {/* Progress bar */}
          <div style={{marginBottom:'16px'}}>
            <div
              onClick={e=>{const r=e.currentTarget.getBoundingClientRect();seekTo(((e.clientX-r.left)/r.width)*duration);}}
              style={{height:'28px', display:'flex', alignItems:'center', cursor:'pointer'}}>
              <div style={{width:'100%', height:'3px', background:'rgba(255,255,255,0.2)', borderRadius:'3px', position:'relative', transition:'height 0.1s'}}>
                <div style={{height:'100%', width:\`\${pct}%\`, background:'white', borderRadius:'3px', position:'relative'}}>
                  <div style={{position:'absolute', right:'-7px', top:'50%', transform:'translateY(-50%)', width:'12px', height:'12px', borderRadius:'50%', background:'white', transition:'all 0.1s'}}/>
                </div>
              </div>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:'-4px'}}>
              <span style={{color:'#b3b3b3', fontSize:'11px'}}>{fmt(progress)}</span>
              <span style={{color:'#b3b3b3', fontSize:'11px'}}>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
            <button style={{background:'none',border:'none',cursor:'pointer',padding:'8px',position:'relative'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
            </button>
            <button onClick={playPrev} style={{background:'none',border:'none',cursor:'pointer',padding:'8px'}}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="white"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button onClick={togglePlay}
              style={{width:'68px',height:'68px',borderRadius:'50%',background:'white',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}
              onTouchStart={e=>e.currentTarget.style.transform='scale(0.94)'}
              onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}>
              {isPlaying
                ? <svg width="30" height="30" viewBox="0 0 24 24" fill="#121212"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                : <svg width="30" height="30" viewBox="0 0 24 24" fill="#121212"><path d="M8 5v14l11-7z"/></svg>
              }
            </button>
            <button onClick={playNext} style={{background:'none',border:'none',cursor:'pointer',padding:'8px'}}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="white"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <button style={{background:'none',border:'none',cursor:'pointer',padding:'8px',position:'relative'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
            </button>
          </div>

          {/* Volume */}
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
            <input type="range" min="0" max="100" defaultValue="80"
              onChange={e=>usePlayerStore.getState().setVolume(e.target.value/100)}
              style={{flex:1,accentColor:'white',cursor:'pointer'}}/>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </div>

          {/* Action buttons row */}
          <div style={{display:'flex', justifyContent:'space-around', marginBottom:'24px', padding:'0 8px'}}>
            {[
              {svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>, label:'Share', action:()=>navigator.clipboard?.writeText(\`\${currentSong.title} — \${currentSong.artist}\`)},
              {svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, label:'Radio', action:()=>{}},
              {svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, label:'Queue', action:()=>setTab('queue')},
              {svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>, label:'Lyrics', action:()=>setTab('lyrics')},
            ].map(item=>(
              <button key={item.label} onClick={item.action}
                style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',padding:'8px'}}>
                {item.svg}
                <span style={{color:'#b3b3b3',fontSize:'11px',fontWeight:600}}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Lyrics preview card */}
          <div style={{background:'linear-gradient(135deg,#4a1a6b,#8B1A8B)',borderRadius:'16px',padding:'18px',marginBottom:'8px',position:'relative',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
              <span style={{color:'rgba(255,255,255,0.65)',fontSize:'13px',fontWeight:700}}>Lyrics</span>
              <span style={{color:lyrics.synced?'#1DB954':'rgba(255,255,255,0.4)',fontSize:'11px',fontWeight:700,background:'rgba(0,0,0,0.25)',padding:'3px 10px',borderRadius:'500px'}}>
                {lyrics.synced?'⚡ SYNCED':lyrics.loading?'Loading…':'STATIC'}
              </span>
            </div>
            {lyrics.loading ? (
              <div style={{display:'flex',justifyContent:'center',padding:'12px'}}>
                <div style={{width:'22px',height:'22px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
              </div>
            ) : (
              <div style={{cursor:'pointer'}} onClick={()=>setTab('lyrics')}>
                {lyrics.lines.slice(Math.max(0,lyrics.activeLine-1),lyrics.activeLine+5).map((line,i)=>{
                  const isActive = lyrics.activeLine>0 ? i===1 : i===0;
                  return (
                    <div key={i} style={{color:isActive?'white':'rgba(255,255,255,0.4)',fontSize:isActive?'17px':'15px',fontWeight:isActive?800:500,lineHeight:'1.6',marginBottom:'2px',transition:'all 0.3s'}}>
                      {line.text||' '}
                    </div>
                  );
                })}
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginTop:'12px',fontWeight:600}}>See full lyrics →</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ LYRICS TAB ════ */}
      {tab==='lyrics' && (
        <div style={{padding:'16px 24px 40px'}}>
          {lyrics.loading ? (
            <div style={{textAlign:'center',padding:'80px 0'}}>
              <div style={{width:'36px',height:'36px',border:'3px solid rgba(29,185,84,0.2)',borderTopColor:'#1DB954',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 0.8s linear infinite'}}/>
              <p style={{color:'#b3b3b3',fontSize:'13px'}}>Finding lyrics…</p>
            </div>
          ) : (
            <>
              <div style={{display:'flex',gap:'8px',marginBottom:'24px',alignItems:'center'}}>
                <span style={{fontSize:'11px',padding:'4px 12px',borderRadius:'500px',background:lyrics.synced?'rgba(29,185,84,0.15)':'rgba(255,255,255,0.08)',color:lyrics.synced?'#1DB954':'#b3b3b3',fontWeight:700}}>
                  {lyrics.synced?'⚡ SYNCED':lyrics.error?'NOT FOUND':'STATIC'}
                </span>
                <span style={{color:'#535353',fontSize:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{currentSong.title}</span>
              </div>
              {lyrics.lines.map((line,i)=>{
                const isActive = i===lyrics.activeLine && lyrics.synced;
                const isNear = Math.abs(i-(lyrics.activeLine||0))<=2;
                return (
                  <div key={i}
                    onClick={()=>lyrics.synced && line.time && seekTo(line.time)}
                    style={{padding:'4px 0',marginBottom:'10px',fontSize:isActive?'22px':'17px',fontWeight:isActive?900:isNear?500:400,color:isActive?'white':isNear?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.18)',lineHeight:'1.5',transition:'all 0.35s ease',textShadow:isActive?'0 0 40px rgba(29,185,84,0.5)':'none',cursor:lyrics.synced?'pointer':'default'}}>
                    {line.text||' '}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ════ QUEUE TAB ════ */}
      {tab==='queue' && (
        <div style={{padding:'12px 16px 40px'}}>
          <div style={{color:'#1DB954',fontSize:'11px',fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'10px'}}>Now Playing</div>
          <div style={{display:'flex',gap:'12px',alignItems:'center',padding:'10px 12px',background:'rgba(29,185,84,0.08)',borderRadius:'10px',border:'1px solid rgba(29,185,84,0.12)',marginBottom:'20px'}}>
            <img src={currentSong.albumArt} style={{width:'46px',height:'46px',borderRadius:'6px',objectFit:'cover',background:'#282828'}} onError={e=>e.target.style.background='#282828'}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:'#1DB954',fontSize:'14px',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{currentSong.title}</div>
              <div style={{color:'#b3b3b3',fontSize:'12px',marginTop:'2px'}}>{currentSong.artist}</div>
            </div>
          </div>
          <div style={{color:'#b3b3b3',fontSize:'11px',fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'10px'}}>Next Up</div>
          {(queue||[]).slice((currentIndex||0)+1,(currentIndex||0)+20).map((song,i)=>(
            <div key={\`\${song.id}-\${i}\`} onClick={()=>usePlayerStore.getState().playSong(song,queue)}
              style={{display:'flex',gap:'12px',alignItems:'center',padding:'10px 8px',borderRadius:'8px',cursor:'pointer'}}
              onTouchStart={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
              onTouchEnd={e=>e.currentTarget.style.background='transparent'}>
              <span style={{color:'#535353',fontSize:'12px',width:'18px',textAlign:'center',flexShrink:0}}>{i+1}</span>
              <img src={song.albumArt} style={{width:'42px',height:'42px',borderRadius:'5px',objectFit:'cover',background:'#282828'}} onError={e=>e.target.style.background='#282828'}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:'white',fontSize:'13px',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{song.title}</div>
                <div style={{color:'#b3b3b3',fontSize:'12px',marginTop:'2px'}}>{song.artist}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}
`;

const replaced = content.replace(regex, newReturn);
fs.writeFileSync(file, replaced, 'utf8');
console.log('Done!');
