import type { AppState } from "../shared/types";
import { TimerPhase } from "../shared/types";
import { DEFAULT_FOCUS_MINUTES } from "../shared/constants";
import { StorageError } from "../shared/errors";

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
  try {
    const data = await chrome.storage.local.get(DEFAULT_STATE as unknown as Record<string, unknown>);
    return data as unknown as AppState;
  } catch (cause) {
    throw new StorageError("loadState 실패", cause);
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await chrome.storage.local.set(state);
  } catch (cause) {
    throw new StorageError("saveState 실패", cause);
  }
}
