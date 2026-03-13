import { describe, test, expect, beforeEach } from "bun:test";
import { resetMockStorage, resetStorageError, resetAlarmError, resetDnrError, simulateRuntimeError, resetRuntimeError } from "../__mocks__/chrome";
import { MessageError } from "./errors";

import { sendMessage } from "./messages";

beforeEach(() => {
  resetMockStorage();
  resetStorageError();
  resetAlarmError();
  resetDnrError();
  resetRuntimeError();
});

describe("sendMessage", () => {
  test("chrome.runtime.sendMessage 실패 시 MessageError를 던진다", async () => {
    const cause = new Error("extension context invalidated");
    simulateRuntimeError(cause);
    await expect(sendMessage({ type: "START_TIMER" })).rejects.toThrow(MessageError);
  });

  test("MessageError는 원인(cause)을 포함한다", async () => {
    const cause = new Error("extension context invalidated");
    simulateRuntimeError(cause);
    try {
      await sendMessage({ type: "START_TIMER" });
    } catch (err) {
      expect(err).toBeInstanceOf(MessageError);
      expect((err as MessageError).cause).toBe(cause);
    }
  });
});
