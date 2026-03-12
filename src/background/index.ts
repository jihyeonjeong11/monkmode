import type { Message } from "../shared/messages";
import { loadState } from "./storage";
import "./timer"; // registers chrome.alarms.onAlarm listener

chrome.runtime.onMessage.addListener(
  (msg: Message, _sender, sendResponse) => {
    handleMessage(msg).then(sendResponse);
    return true; // keep channel open for async response
  }
);

async function handleMessage(msg: Message | { type: "OFFSCREEN_DONE" }): Promise<unknown> {
  const { startTimer, pauseTimer, resetTimer } = await import("./timer");

  switch (msg.type) {
    case "START_TIMER":
      await startTimer();
      break;
    case "PAUSE_TIMER":
      await pauseTimer();
      break;
    case "RESET_TIMER":
      await resetTimer();
      break;
    case "GET_STATE":
      return loadState();
    case "OFFSCREEN_DONE":
      await chrome.offscreen.closeDocument();
      break;
  }
}
