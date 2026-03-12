import type { AppState } from "../shared/types";
import { TimerPhase } from "../shared/types";
import { DEFAULT_FOCUS_MINUTES } from "../shared/constants";

const DEFAULT_STATE: AppState = {
  timer: {
    phase: TimerPhase.FOCUS,
    endTime: null,
    isRunning: false,
    completedPomodoros: 0,
  },
  blockedSites: [],
  isActive: false,
  sessions: [],
};

export async function loadState(): Promise<AppState> {
  const data = await chrome.storage.local.get(DEFAULT_STATE as unknown as Record<string, unknown>);
  return data as unknown as AppState;
}

export async function saveState(state: AppState): Promise<void> {
  await chrome.storage.local.set(state);
}
