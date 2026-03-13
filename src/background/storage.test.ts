import { describe, test, expect, beforeEach } from "bun:test";
import { resetMockStorage, simulateStorageError, resetStorageError } from "../__mocks__/chrome";
import { StorageError } from "../shared/errors";

import { loadState, saveState } from "./storage";

beforeEach(() => {
  resetMockStorage();
  resetStorageError();
});

describe("storage", () => {
  describe("loadState", () => {
    test("chrome.storage.get 실패 시 StorageError를 던진다", async () => {
      const cause = new Error("quota exceeded");
      simulateStorageError(cause);
      await expect(loadState()).rejects.toThrow(StorageError);
    });

    test("StorageError는 원인(cause)을 포함한다", async () => {
      const cause = new Error("quota exceeded");
      simulateStorageError(cause);
      try {
        await loadState();
      } catch (err) {
        expect(err).toBeInstanceOf(StorageError);
        expect((err as StorageError).cause).toBe(cause);
      }
    });
  });

  describe("saveState", () => {
    test("chrome.storage.set 실패 시 StorageError를 던진다", async () => {
      simulateStorageError(new Error("storage full"));
      const { TimerPhase } = await import("../shared/types");
      const state = {
        timer: { phase: TimerPhase.FOCUS, endTime: null, isRunning: false, completedPomodoros: 0 },
        blockedSites: [],
        isActive: false,
        sessions: [],
      };
      await expect(saveState(state)).rejects.toThrow(StorageError);
    });
  });
});
