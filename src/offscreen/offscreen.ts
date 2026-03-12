const ctx = new AudioContext();
const osc = ctx.createOscillator();
const gain = ctx.createGain();

osc.connect(gain);
gain.connect(ctx.destination);
osc.type = "sine";
osc.frequency.setValueAtTime(880, ctx.currentTime);
osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
gain.gain.setValueAtTime(0.6, ctx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
osc.start(ctx.currentTime);
osc.stop(ctx.currentTime + 1.2);

// 재생 완료 후 백그라운드에 닫기 요청
setTimeout(() => {
  chrome.runtime.sendMessage({ type: "OFFSCREEN_DONE" });
}, 1500);
