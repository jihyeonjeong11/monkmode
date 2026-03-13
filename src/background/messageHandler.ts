import type { Message } from "../shared/messages";
import { loadState, saveState } from "./storage";
import { syncDnrRules } from "./blocker";

export async function handleMessage(msg: Message | { type: "OFFSCREEN_DONE" }): Promise<unknown> {
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
}
