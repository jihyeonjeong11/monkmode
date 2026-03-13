export function renderTimerDisplay(el: HTMLElement, seconds: number | null): void {
  if (seconds === null) {
    el.textContent = "--:--";
    return;
  }
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  el.textContent = `${m}:${s}`;
}
