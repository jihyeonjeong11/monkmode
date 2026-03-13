import { describe, test, expect, beforeEach } from "bun:test";
import { resetMockStorage, fireMockAlarm } from "../__mocks__/chrome";
import { TimerPhase } from "../shared/types";
import { ALARM_NAME, DEFAULT_FOCUS_MINUTES, IS_TEST, TEST_DURATION_SECONDS } from "../shared/constants";

const EFFECTIVE_FOCUS_MINUTES = IS_TEST ? TEST_DURATION_SECONDS / 60 : DEFAULT_FOCUS_MINUTES;
const EFFECTIVE_FOCUS_MS = EFFECTIVE_FOCUS_MINUTES * 60 * 1000;

// 구현 전 import — 테스트 작성 후 구현
import { startTimer, pauseTimer, resetTimer, handleAlarm } from "./timer";
import { loadState } from "./storage";

beforeEach(() => {
  resetMockStorage();
});

// --- startTimer ---

describe("startTimer", () => {
  test("isRunning을 true로 설정한다", async () => {
    await startTimer();
    const state = await loadState();
    expect(state.timer.isRunning).toBe(true);
  });

  test("endTime을 현재 시각 + 포커스 시간으로 설정한다", async () => {
    const before = Date.now();
    await startTimer();
    const after = Date.now();
    const state = await loadState();

    const tolerance = 10; // Bun cold-start timing jitter
    expect(state.timer.endTime).toBeGreaterThanOrEqual(before + EFFECTIVE_FOCUS_MS - tolerance);
    expect(state.timer.endTime).toBeLessThanOrEqual(after + EFFECTIVE_FOCUS_MS);
  });

  test("이미 실행 중이면 아무것도 하지 않는다", async () => {
    await startTimer();
    const first = (await loadState()).timer.endTime;
    await startTimer();
    const second = (await loadState()).timer.endTime;
    expect(second).toBe(first);
  });
});

// --- pauseTimer ---

describe("pauseTimer", () => {
  test("isRunning을 false로 설정한다", async () => {
    await startTimer();
    await pauseTimer();
    const state = await loadState();
    expect(state.timer.isRunning).toBe(false);
  });

  test("endTime을 null로 설정한다", async () => {
    await startTimer();
    await pauseTimer();
    const state = await loadState();
    expect(state.timer.endTime).toBeNull();
  });
});

// --- resetTimer ---

describe("resetTimer", () => {
  test("isRunning을 false로 설정한다", async () => {
    await startTimer();
    await resetTimer();
    const state = await loadState();
    expect(state.timer.isRunning).toBe(false);
  });

  test("endTime을 null로 설정한다", async () => {
    await startTimer();
    await resetTimer();
    const state = await loadState();
    expect(state.timer.endTime).toBeNull();
  });

  test("페이즈와 completedPomodoros는 유지한다", async () => {
    await startTimer();
    await resetTimer();
    const state = await loadState();
    expect(state.timer.phase).toBe(TimerPhase.FOCUS);
    expect(state.timer.completedPomodoros).toBe(0);
  });
});


// --- handleAlarm ---

describe("handleAlarm", () => {
  test("FOCUS 알람 완료 시 SessionEntry가 저장된다", async () => {
    await startTimer();
    await fireMockAlarm(ALARM_NAME);
    const state = await loadState();
    expect(state.sessions.length).toBe(1);
    expect(state.sessions[0].durationMinutes).toBe(EFFECTIVE_FOCUS_MINUTES);
  });

  test("알람 완료 후 타이머가 정지 상태가 된다", async () => {
    await startTimer();
    await fireMockAlarm(ALARM_NAME);
    const state = await loadState();
    expect(state.timer.isRunning).toBe(false);
    expect(state.timer.endTime).toBeNull();
  });

  test("알람 완료 후 isActive가 false가 된다", async () => {
    await startTimer();
    await fireMockAlarm(ALARM_NAME);
    const state = await loadState();
    expect(state.isActive).toBe(false);
  });

});
