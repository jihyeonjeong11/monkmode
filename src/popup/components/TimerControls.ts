export function renderTimerControls(opts: {
  startEl: HTMLElement;
  stopEl: HTMLElement;
  isRunning: boolean;
}): void {
  opts.startEl.style.display = opts.isRunning ? "none" : "";
  opts.stopEl.style.display = opts.isRunning ? "" : "none";
}
