const fs = require('fs');
const file = 'client/src/components/MobileApp.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = '<SongImage src={currentSong.albumArt} source={currentSong.source} size={42} radius={6} />';

const brokenIndex = content.lastIndexOf(targetStr);
const nextDivIndex = content.indexOf('<div style={{ flex: 1, minWidth: 0 }}>', brokenIndex);

if (brokenIndex !== -1 && nextDivIndex !== -1) {
    const endStr = '</div>\n        </div>\n    );\n}';
    let endIndex = content.indexOf(endStr, brokenIndex);

    if (endIndex === -1) {
        endIndex = content.indexOf('</div>\r\n        </div>\r\n    );\r\n}', brokenIndex);
    }

    // Fallback if formatting is slightly different
    if (endIndex === -1 && content.indexOf('    );\n}', brokenIndex) !== -1) {
        endIndex = content.indexOf('    );\n}', brokenIndex) - 20; // approximated start of div closes
        // let's just find the closing brace of MiniPlayer
    }

    const endOfMiniPlayer = content.indexOf('\n// ─────────────────────────────────────\n// FULL SCREEN NOW PLAYING', brokenIndex);
    let replaceEndIndex = -1;

    if (endOfMiniPlayer !== -1) {
        replaceEndIndex = endOfMiniPlayer;
    } else {
        const nextHeader = content.indexOf('\n// ─────────────────────────────────────\r\n// FULL SCREEN NOW PLAYING', brokenIndex);
        if (nextHeader !== -1) replaceEndIndex = nextHeader;
    }

    if (replaceEndIndex !== -1) {
        // Find the last closing brace before replaceEndIndex
        let lastBrace = content.lastIndexOf('}', replaceEndIndex);

        const replacementStr = targetStr + `
      <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title}</div>
          <div style={{ color: '#a7a7a7', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.artist}</div>
      </div>
      {/* Like */}
      <button onClick={e => {
          e.stopPropagation();
          const list = JSON.parse(localStorage.getItem('likedSongs') || '[]');
          const liked = list.some(s => s.id === currentSong.id);
          if (liked) localStorage.setItem('likedSongs', JSON.stringify(list.filter(s => s.id !== currentSong.id)));
          else { list.unshift(currentSong); localStorage.setItem('likedSongs', JSON.stringify(list)); }
      }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
      </button>
      {/* Play/Pause */}
      <button onClick={e => { e.stopPropagation(); togglePlay(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', flexShrink: 0 }}>
          {isPlaying
              ? <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              : <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
          }
      </button>
      {/* Next */}
      <button onClick={e => { e.stopPropagation(); playNext(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
      </button>
    </div>
  );
}`;

        content = content.substring(0, brokenIndex) + replacementStr + content.substring(lastBrace + 1);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed syntax error!');
    } else {
        console.log('Could not find end of function');
    }
} else {
    console.log('Could not find target strings');
}
