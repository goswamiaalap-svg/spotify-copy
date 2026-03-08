const fs = require('fs');

function applyToMobileApp() {
    const file = 'client/src/components/MobileApp.jsx';
    let content = fs.readFileSync(file, 'utf8');

    // Fix 1: The broken SongImage definition
    const regexImage = /\/\/ Reusable SongImage component — use this EVERYWHERE instead of raw <SongImage[\s\S]*?radius=\{6\}\s*\/>/;

    const replacementImage = `// Reusable SongImage component — use this EVERYWHERE instead of raw <img>:
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

// ─────────────────────────────────────
// MINI PLAYER (sticky at bottom)
function MiniPlayer({ onExpand }) {
  const { currentSong, isPlaying, togglePlay } = usePlayerStore();
  if (!currentSong) return null;

  return (
    <div
      onClick={onExpand}
      style={{
        position: 'fixed', bottom: 'calc(50px + var(--bottom-inset, 8px))', left: '8px', right: '8px',
        background: 'rgba(30,30,30,0.95)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '8px', padding: '8px 12px', zIndex: 9000,
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
      <SongImage src={currentSong.albumArt} source={currentSong.source} size={42} radius={6} />`;

    content = content.replace(regexImage, replacementImage);

    // Fix 2: The remaining <SongImage .../>  <div> loop from earlier mistakes.
    content = content.replace(/<SongImage\s*src=\{currentSong\.albumArt\}\s*source=\{currentSong\.source\}\s*size=\{42\}\s*radius=\{6\}\s*\/>\s*(<div[^>]*>)\s*<div[^>]*>\{currentSong\.title\}<\/div>\s*<div[^>]*>\{currentSong\.artist\}<\/div>\s*<\/div>\s*<\/div>/g, '<SongImage src={currentSong.albumArt} source={currentSong.source} size={42} radius={6} />$1\n<div style={{color:"white", fontSize:"13px", fontWeight:700}}>{currentSong.title}</div><div style={{color:"#a7a7a7", fontSize:"11px"}}>{currentSong.artist}</div></div>');

    fs.writeFileSync(file, content, 'utf8');
}

applyToMobileApp();
console.log('MobileApp updated successfully');
