const fs = require('fs');

function applyToPlayerBar() {
    const file = 'client/src/components/layout/PlayerBar.jsx';
    let content = fs.readFileSync(file, 'utf8');

    const helperCode = `
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
`;

    if (!content.includes('function getImage(')) {
        const regexImports = /(import.*from 'react-router-dom';)/;
        content = content.replace(regexImports, "$1\n" + helperCode);
    }

    const tagTarget = /<img[\s\S]*?src=\{currentSong\.albumArt\}[\s\S]*?onError=\{[\s\S]*?\}[\s\S]*?\/>/;
    content = content.replace(tagTarget, `<SongImage
                            src={currentSong.albumArt}
                            source={currentSong.source}
                            size={56}
                            radius={6}
                        />`);

    fs.writeFileSync(file, content, 'utf8');
}

applyToPlayerBar();
console.log('PlayerBar updated successfully');
