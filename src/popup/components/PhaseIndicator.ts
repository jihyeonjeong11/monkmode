import { TimerPhase } from "../../shared/types";

const PHASE_LABELS: Record<TimerPhase, string> = {
  [TimerPhase.FOCUS]: "FOCUS",
  [TimerPhase.SHORT_BREAK]: "SHORT BREAK",
  [TimerPhase.LONG_BREAK]: "LONG BREAK",
};

export function renderPhaseIndicator(el: HTMLElement, phase: TimerPhase): void {
  el.textContent = PHASE_LABELS[phase];
}
