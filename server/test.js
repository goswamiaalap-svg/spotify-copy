const play = require('play-dl');

async function test() {
    try {
        const info = await play.video_info('https://www.youtube.com/watch?v=rCZrYEEUXhw');
        const format = info.format.find(f => f.hasAudio && !f.hasVideo) || info.format[0];
        console.log("SUCCESS:", format.url);
    } catch (e) {
        console.error("FAIL:", e.message);
    }
}
test();

