// Listen for messages from the extension
chrome.runtime.onMessage.addListener(msg => {
    if ('play' in msg) playAudio(msg.play);
});

// Play sound with access to DOM APIs
function playAudio({ source, volume }: {source: string, volume: number}) {
    const audio = new Audio(source);
    audio.volume = volume;
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 5000);
}