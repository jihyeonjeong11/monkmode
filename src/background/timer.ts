import type { AppState } from "../shared/types";

export async function startTimer(): Promise<void> {}

export async function pauseTimer(): Promise<void> {}

export async function resetTimer(): Promise<void> {}

export async function handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {}
