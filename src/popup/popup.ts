import type { AppState, SessionEntry } from "../shared/types";
import { TimerPhase } from "../shared/types";
import { DEFAULT_FOCUS_MINUTES } from "../shared/constants";
import { sendMessage } from "../shared/messages";
import { renderTimerDisplay } from "./components/TimerDisplay";
import { renderPhaseIndicator } from "./components/PhaseIndicator";
import { renderTimerControls } from "./components/TimerControls";
import { initSiteInput } from "./components/SiteInput";
import { renderSiteList } from "./components/SiteList";
import { renderSessionsView } from "./components/SessionsView";

// --- Stop confirmation phrase ---
const STOP_PHRASE = "메시지를 수정해주세요";

// --- DOM refs ---
const phaseLabel = document.getElementById("phase-label") as HTMLElement;
const timerDisplay = document.getElementById("timer-display") as HTMLElement;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
const stopBtn = document.getElementById("stop-btn") as HTMLButtonElement;

const durationPicker = document.getElementById("duration-picker") as HTMLElement;
const durationBtns = durationPicker.querySelectorAll<HTMLButtonElement>("button[data-hours]");

const stopConfirm = document.getElementById("stop-confirm") as HTMLElement;
const stopPhraseEl = document.getElementById("stop-phrase") as HTMLElement;
const stopInput = document.getElementById("stop-input") as HTMLInputElement;
const stopCancelBtn = document.getElementById("stop-cancel-btn") as HTMLButtonElement;
const stopOkBtn = document.getElementById("stop-ok-btn") as HTMLButtonElement;

const siteInput = document.getElementById("site-input") as HTMLInputElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const siteList = document.getElementById("site-list") as HTMLUListElement;

const sessionsSummary = document.getElementById("sessions-summary") as HTMLElement;
const sessionsList = document.getElementById("sessions-list") as HTMLElement;

const navTimer = document.getElementById("nav-timer") as HTMLButtonElement;
const navBlocklist = document.getElementById("nav-blocklist") as HTMLButtonElement;
const navSessions = document.getElementById("nav-sessions") as HTMLButtonElement;

const tabTimer = document.getElementById("tab-timer") as HTMLElement;
const tabBlocklist = document.getElementById("tab-blocklist") as HTMLElement;
const tabSessions = document.getElementById("tab-sessions") as HTMLElement;

// --- State ---
let selectedMinutes = DEFAULT_FOCUS_MINUTES;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let appState: AppState | null = null;

// --- Tabs ---
function activateTab(tab: "timer" | "blocklist" | "sessions") {
  for (const [el, id] of [
    [tabTimer, "timer"],
    [tabBlocklist, "blocklist"],
    [tabSessions, "sessions"],
  ] as const) {
    el.classList.toggle("active", id === tab);
  }
  for (const [btn, id] of [
    [navTimer, "timer"],
    [navBlocklist, "blocklist"],
    [navSessions, "sessions"],
  ] as const) {
    btn.classList.toggle("active", id === tab);
  }
}

navTimer.addEventListener("click", () => activateTab("timer"));
navBlocklist.addEventListener("click", () => activateTab("blocklist"));
navSessions.addEventListener("click", () => activateTab("sessions"));

// --- Duration picker ---
function renderDurationPicker(isRunning: boolean) {
  for (const btn of durationBtns) {
    const hours = Number(btn.dataset.hours);
    btn.classList.toggle("selected", hours * 60 === selectedMinutes);
    btn.disabled = isRunning;
  }
}

for (const btn of durationBtns) {
  btn.addEventListener("click", () => {
    selectedMinutes = Number(btn.dataset.hours) * 60;
    chrome.storage.local.set({ selectedMinutes });
    renderDurationPicker(false);
  });
}

// --- Timer render ---
function renderTimer(state: AppState) {
  const { phase, endTime, isRunning } = state.timer;

  if (isRunning) {
    renderPhaseIndicator(phaseLabel, phase);
  } else {
    phaseLabel.textContent = "";
  }

  if (isRunning && endTime != null) {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    renderTimerDisplay(timerDisplay, remaining);
    startTick(endTime);
  } else {
    renderTimerDisplay(timerDisplay, null);
    stopTick();
  }

  renderTimerControls({ startEl: startBtn, stopEl: stopBtn, isRunning });
  renderDurationPicker(isRunning);

  // hide stop confirm when not running
  if (!isRunning) {
    stopConfirm.style.display = "none";
    stopBtn.style.display = "none";
    startBtn.style.display = "";
  }
}

// --- Tick ---
function startTick(endTime: number) {
  stopTick();
  tickInterval = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    renderTimerDisplay(timerDisplay, remaining);
    if (remaining <= 0) stopTick();
  }, 500);
}

function stopTick() {
  if (tickInterval != null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// --- Timer controls ---
startBtn.addEventListener("click", () => {
  sendMessage({ type: "START_TIMER" });
});

stopBtn.addEventListener("click", () => {
  stopConfirm.style.display = "block";
  stopBtn.style.display = "none";
  stopPhraseEl.textContent = `"${STOP_PHRASE}"`;
  stopInput.value = "";
  stopInput.focus();
});

stopCancelBtn.addEventListener("click", () => {
  stopConfirm.style.display = "none";
  stopBtn.style.display = "";
  stopInput.value = "";
});

stopOkBtn.addEventListener("click", confirmStop);
stopInput.addEventListener("keydown", (e) => { if (e.key === "Enter") confirmStop(); });

function confirmStop() {
  if (stopInput.value.trim() !== STOP_PHRASE) return;
  stopConfirm.style.display = "none";
  stopInput.value = "";
  sendMessage({ type: "RESET_TIMER" });
}

// --- Blocklist ---
initSiteInput({
  inputEl: siteInput,
  addBtnEl: addBtn,
  onAdd: (site) => sendMessage({ type: "ADD_SITE", site }),
});

function renderBlocklist(sites: string[]) {
  renderSiteList({
    containerEl: siteList,
    sites,
    onRemove: (site) => sendMessage({ type: "REMOVE_SITE", site }),
  });
}

// --- Sessions ---
function renderSessions(sessions: SessionEntry[]) {
  renderSessionsView({ summaryEl: sessionsSummary, listEl: sessionsList, sessions });
}

// --- Storage change listener ---
chrome.storage.onChanged.addListener(() => {
  chrome.storage.local.get(null).then((data) => {
    const state = data as unknown as AppState;
    appState = state;
    renderTimer(state);
    renderBlocklist(state.blockedSites ?? []);
    renderSessions(state.sessions ?? []);
  });
});

// --- Initial load ---
async function load() {
  const stored = await chrome.storage.local.get(null);
  const data = stored as unknown as AppState & { selectedMinutes?: number };

  if (data.selectedMinutes) selectedMinutes = data.selectedMinutes;

  appState = data as AppState;
  renderTimer(appState);
  renderBlocklist(appState.blockedSites ?? []);
  renderSessions(appState.sessions ?? []);
}

load();
