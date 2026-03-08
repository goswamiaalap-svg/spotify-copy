const fs = require('fs');

function fixMobileApp() {
    const file = 'client/src/components/MobileApp.jsx';
    let content = fs.readFileSync(file, 'utf8');

    // Let's use string operations instead of complex regexes or eval to be safe
    const targetIndex = content.indexOf('<SongImage\n            src={currentSong.albumArt}\n            source={currentSong.source}\n            size={42}\n            radius={6}\n          />');

    if (targetIndex !== -1) {
        const nextDiv = content.indexOf('<div style={{ flex: 1, minWidth: 0 }}>', targetIndex + 140);
        if (nextDiv !== -1) {
            // we might have some unexpected characters between SongImage and nextDiv.
            // let's just replace the exact problematic section.

            const replaceString = `<SongImage src={currentSong.albumArt} source={currentSong.source} size={42} radius={6} />
                    <div style={{ flex: 1, minWidth: 0 }}>`;

            content = content.substring(0, targetIndex) + replaceString + content.substring(nextDiv + 38);
        }
    }

    // Actually, wait, looking at the error:
    // C:/Users/AALAP GOSWAMI/OneDrive/Desktop/spotify copy/client/src/components/MobileApp.jsx:107:18: ERROR: Unterminated regular expression
    // Let's view the file properly first. I'll just save this file and then use view_file to be absolutely sure.
}

fixMobileApp();
