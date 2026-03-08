const fs = require('fs');

function applyToPlayerStore() {
    const file = 'client/src/store/playerStore.js';
    let content = fs.readFileSync(file, 'utf8');

    const helperCode = `  getAudioUrl: (song) => {
    // Direct audioUrl (Deezer preview, iTunes preview, Audius stream)
    if (song.audioUrl) return song.audioUrl;
    // JioSaavn downloadUrl array
    if (song.downloadUrl?.length) {
      const best = song.downloadUrl.find(u=>u.quality==='320kbps')
        || song.downloadUrl.find(u=>u.quality==='160kbps')
        || song.downloadUrl[song.downloadUrl.length-1];
      return best?.url || null;
    }
    return null;
  },`;

    if (!content.includes('getAudioUrl: (song) => {')) {
        content = content.replace(/setVolume:\s*\(v\)\s*=>[^{]*\{[^}]*\},\s*/, match => match + helperCode + '\n\n  ');
    }

    // replace \`audio.src = song.audioUrl\` with \`audio.src = get().getAudioUrl(song) || song.audioUrl\`
    content = content.replace(/audio\.src\s*=\s*(?:song\.downloadUrl\[[^\]]+\]\.url\s*\|\|\s*)?song\.audioUrl/g, "audio.src = get().getAudioUrl(song) || song.audioUrl");

    fs.writeFileSync(file, content, 'utf8');
}

applyToPlayerStore();
console.log('playerStore updated successfully');
