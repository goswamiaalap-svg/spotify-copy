const fs = require('fs');
const file = 'client/src/components/MobileApp.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                    {currentSong.albumArt && !imgFailed ? (
                      <SongImage
            src={currentSong.albumArt}
            source={currentSong.source}
            size={42}
            radius={6}
          />
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:'#1DB954',fontSize:'14px',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{currentSong.title}</div>
                <div style={{color:'#b3b3b3',fontSize:'12px',marginTop:'2px'}}>{currentSong.artist}</div>
              </div>
            </div>`;

const replacement = `                    {currentSong.albumArt && !imgFailed ? (
                      <img
                        src={getImage(currentSong.albumArt, currentSong.source)}
                        alt={currentSong.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={() => setImgFailed(true)}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      /* Fallback — animated music note */
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600 }}>{currentSong.source}</span>
                      </div>
                    )}

                    {/* EQ animation overlay when playing */}
                    {isPlaying && (
                      <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '22px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '4px 6px' }}>
                        {[10,18,13,20,8].map((h,i) => (
                          <div key={i} style={{ width: '3px', background: '#1DB954', borderRadius: '2px', height: \`\${h}px\`, animation: \`eq\${(i%3)+1} \${0.35+i*0.08}s ease infinite alternate\` }}/>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Source badge on artwork */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', borderRadius: '6px', padding: '4px 10px' }}>
                    <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>{currentSong.source || 'JioSaavn'}</span>
                  </div>

                  {/* ── SWITCH TO VIDEO button ── */}
                  <button
                    onClick={fetchVideo}
                    disabled={videoLoading}
                    style={{
                      position: 'absolute', bottom: '14px', right: '14px',
                      background: 'rgba(0,0,0,0.82)',
                      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '500px', color: 'white',
                      padding: '9px 16px', fontSize: '12px', fontWeight: 700,
                      cursor: videoLoading ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '7px',
                      zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                      opacity: videoLoading ? 0.7 : 1,
                      transition: 'opacity 0.2s',
                    }}>
                    {videoLoading ? (
                      <>
                        <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                        Finding video…
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                        Switch to video
                      </>
                    )}
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
            
            {/* queue tab stuff that got overwritten was this, but this is inside PLAYER tab check: tab === 'player' */}`;

// Let's do a more robust fix by just completely re-writing MobileApp.jsx again with apply_mobileapp.js
// since it got mangled with multiple failed replaces
