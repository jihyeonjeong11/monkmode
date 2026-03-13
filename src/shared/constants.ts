export const ALARM_NAME = "monk-mode-phase-end";

export const MIN_FOCUS_MINUTES = 60;
export const MAX_FOCUS_MINUTES = 240;
export const DEFAULT_FOCUS_MINUTES = 240;
export const DEFAULT_SHORT_BREAK_MINUTES = 30;
export const DEFAULT_LONG_BREAK_MINUTES = 60;
export const POMODOROS_UNTIL_LONG_BREAK = 4;

// --- 인간 테스트용 (pnpm dev:env 시 IS_TEST=true 로 주입됨) ---
export const IS_TEST = process.env.IS_TEST === "true";
export const TEST_DURATION_SECONDS = 10;
