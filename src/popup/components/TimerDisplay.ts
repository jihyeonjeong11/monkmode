export function renderTimerDisplay(el: HTMLElement, seconds: number | null): void {
  if (seconds === null) {
    el.textContent = "--:--";
    return;
  }
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    el.textContent = `${h}:${m}:${s}`;
  } else {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    el.textContent = `${m}:${s}`;
  }
}
