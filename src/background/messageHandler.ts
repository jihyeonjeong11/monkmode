import type { Message } from "../shared/messages";
import { loadState, saveState } from "./storage";
import { syncDnrRules } from "./blocker";
import { createLogger } from "../shared/logger";

const logger = createLogger("background");

export async function handleMessage(msg: Message | { type: "OFFSCREEN_DONE" }): Promise<unknown> {
  const { startTimer, pauseTimer, resetTimer } = await import("./timer");
  try {
    switch (msg.type) {
      case "START_TIMER": {
        await startTimer();
        const s = await loadState();
        s.isActive = true;
        await saveState(s);
        await syncDnrRules(true, s.blockedSites);
        break;
      }
      case "PAUSE_TIMER": {
        await pauseTimer();
        const s = await loadState();
        s.isActive = false;
        await saveState(s);
        await syncDnrRules(false, s.blockedSites);
        break;
      }
      case "RESET_TIMER": {
        await resetTimer();
        const s = await loadState();
        s.isActive = false;
        await saveState(s);
        await syncDnrRules(false, s.blockedSites);
        break;
      }
      case "GET_STATE":
        return loadState();
      case "OFFSCREEN_DONE":
        await chrome.offscreen.closeDocument();
        break;
      case "TOGGLE_BLOCKER": {
        const state = await loadState();
        state.isActive = msg.isActive;
        await saveState(state);
        await syncDnrRules(state.isActive, state.blockedSites);
        break;
      }
      case "ADD_SITE": {
        const state = await loadState();
        if (!state.blockedSites.includes(msg.site)) {
          state.blockedSites.push(msg.site);
          await saveState(state);
          await syncDnrRules(state.isActive, state.blockedSites);
        }
        break;
      }
      case "REMOVE_SITE": {
        const state = await loadState();
        state.blockedSites = state.blockedSites.filter((s) => s !== msg.site);
        await saveState(state);
        await syncDnrRules(state.isActive, state.blockedSites);
        break;
      }
    }
  } catch (err) {
    logger.error(`handleMessage(${msg.type}) 실패`, err);
    throw err;
  }
}
