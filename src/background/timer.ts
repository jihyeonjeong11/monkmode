import { TimerPhase } from "../shared/types";
import type { SessionEntry } from "../shared/types";
import {
  ALARM_NAME,
  DEFAULT_FOCUS_MINUTES,
  DEFAULT_SHORT_BREAK_MINUTES,
  DEFAULT_LONG_BREAK_MINUTES,
  POMODOROS_UNTIL_LONG_BREAK,
  IS_TEST,
  TEST_DURATION_SECONDS,
} from "../shared/constants";
import { loadState, saveState } from "./storage";
import { syncDnrRules } from "./blocker";
import { AlarmError } from "../shared/errors";
import { createLogger } from "../shared/logger";

const logger = createLogger("background");

function getPhaseDurationMinutes(phase: TimerPhase): number {
  if (IS_TEST) return TEST_DURATION_SECONDS / 60;
  switch (phase) {
    case TimerPhase.FOCUS: return DEFAULT_FOCUS_MINUTES;
    case TimerPhase.SHORT_BREAK: return DEFAULT_SHORT_BREAK_MINUTES;
    case TimerPhase.LONG_BREAK: return DEFAULT_LONG_BREAK_MINUTES;
  }
}

function getNextPhase(current: TimerPhase, completedPomodoros: number): TimerPhase {
  if (current !== TimerPhase.FOCUS) return TimerPhase.FOCUS;
  return completedPomodoros % POMODOROS_UNTIL_LONG_BREAK === 0
    ? TimerPhase.LONG_BREAK
    : TimerPhase.SHORT_BREAK;
}

export async function startTimer(): Promise<void> {
  const now = Date.now();
  const state = await loadState();
  if (state.timer.isRunning) return;

  let durationMinutes: number;
  if (IS_TEST) {
    durationMinutes = TEST_DURATION_SECONDS / 60;
  } else {
    const stored = await chrome.storage.local.get({ selectedMinutes: DEFAULT_FOCUS_MINUTES });
    durationMinutes = (stored as { selectedMinutes: number }).selectedMinutes;
  }

  state.timer.isRunning = true;
  state.timer.endTime = now + durationMinutes * 60 * 1000;
  await saveState(state);

  try {
    chrome.alarms.create(ALARM_NAME, { delayInMinutes: durationMinutes });
  } catch (cause) {
    throw new AlarmError("알람 등록 실패", cause);
  }
}

export async function pauseTimer(): Promise<void> {
  const state = await loadState();
  state.timer.isRunning = false;
  state.timer.endTime = null;
  await saveState(state);
  try {
    await chrome.alarms.clear(ALARM_NAME);
  } catch (cause) {
    throw new AlarmError("알람 해제 실패", cause);
  }
}

export async function resetTimer(): Promise<void> {
  const state = await loadState();
  state.timer.isRunning = false;
  state.timer.endTime = null;
  await saveState(state);
  try {
    await chrome.alarms.clear(ALARM_NAME);
  } catch (cause) {
    throw new AlarmError("알람 해제 실패", cause);
  }
}

export async function handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
  if (alarm.name !== ALARM_NAME) return;

  const state = await loadState();

  if (state.timer.phase === TimerPhase.FOCUS) {
    const focusDurationMinutes = getPhaseDurationMinutes(TimerPhase.FOCUS);
    const entry: SessionEntry = {
      id: crypto.randomUUID(),
      startedAt: Date.now() - focusDurationMinutes * 60 * 1000,
      durationMinutes: focusDurationMinutes,
      reflection: null,
    };
    state.sessions.push(entry);
    state.timer.completedPomodoros += 1;
  }

  state.timer.phase = getNextPhase(state.timer.phase, state.timer.completedPomodoros);
  state.timer.isRunning = false;
  state.timer.endTime = null;
  state.isActive = false;
  await saveState(state);
  await syncDnrRules(false, state.blockedSites);

  try {
    await playSound();
  } catch (err) {
    logger.error("알림음 재생 실패", err);
  }
}

/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */
async function playSound(source = 'assets/sounds/alarm.wav', volume = 1) {
    await createOffscreen();
    await chrome.runtime.sendMessage({ play: { source, volume } });
}

  // 첫번째 환각 기록할것
  // chrome.offscreen.getContexts may not be typed in older @types/chrome
  // const offscreen = chrome.offscreen as typeof chrome.offscreen & {
  //   getContexts: (filter: object) => Promise<unknown[]>;
  // };
  // const contexts = await offscreen.getContexts({});
  // if (contexts.length === 0) {
  //   await chrome.offscreen.createDocument({
  //     url: chrome.runtime.getURL("offscreen.html"),
  //     reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
  //     justification: "타이머 종료 알림음 재생",
  //   });
  // }

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'timer completion alarm sound',
  });
  // Wait for the document's onMessage listener to register
  await new Promise((r) => setTimeout(r, 100));
}

chrome.alarms.onAlarm.addListener(handleAlarm);
