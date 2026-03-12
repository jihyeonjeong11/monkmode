export enum TimerPhase {
  FOCUS = "FOCUS",
  SHORT_BREAK = "SHORT_BREAK",
  LONG_BREAK = "LONG_BREAK",
}

export interface TimerState {
  phase: TimerPhase;
  endTime: number | null;   // Date.now() + remaining ms, null이면 정지 중
  isRunning: boolean;
  completedPomodoros: number;
}

export interface SessionEntry {
  id: string;
  startedAt: number;        // timestamp (ms)
  durationMinutes: number;
  reflection: string | null;
}

export interface AppState {
  timer: TimerState;
  blockedSites: string[];
  isActive: boolean;
  sessions: SessionEntry[];
}
