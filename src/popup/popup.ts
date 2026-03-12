// @ts-nocheck — 임시 스캐폴드, Branch 3(feat/popup-timer-ui)에서 전면 교체 예정
import type { AppState } from "../shared/types";
import { TimerPhase } from "../shared/types";

// --- Timer UI ---
const phaseLabel = document.getElementById("phase-label");
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

let tickInterval: ReturnType<typeof setInterval> | null = null;
let prevPhase: TimerPhase | null = null;

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderTimer(state: AppState) {
  const { phase, endTime, isRunning } = state.timer;

  const phaseNames: Record<TimerPhase, string> = {
    [TimerPhase.FOCUS]: "FOCUS",
    [TimerPhase.SHORT_BREAK]: "SHORT BREAK",
    [TimerPhase.LONG_BREAK]: "LONG BREAK",
  };
  phaseLabel.textContent = phaseNames[phase];

  if (isRunning && endTime != null) {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    timerDisplay.textContent = formatSeconds(remaining);
  } else {
    timerDisplay.textContent = "--:--";
  }
}

function startTick(endTime: number) {
  stopTick();
  tickInterval = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    timerDisplay.textContent = formatSeconds(remaining);
    if (remaining <= 0) stopTick();
  }, 500);
}

function stopTick() {
  if (tickInterval != null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function playDing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch {}
}

startBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "START_TIMER" });
});
pauseBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "PAUSE_TIMER" });
  stopTick();
  timerDisplay.textContent = "--:--";
});
resetBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "RESET_TIMER" });
  stopTick();
  timerDisplay.textContent = "--:--";
});

// --- Blocker UI ---
const toggleBtn = document.getElementById("toggle-btn");
const siteInput = document.getElementById("site-input") as HTMLInputElement;
const addBtn = document.getElementById("add-btn");
const siteList = document.getElementById("site-list");

let isActive = false;
let blockedSites: string[] = [];

function renderBlocker() {
  toggleBtn.textContent = isActive ? "ON — 집중 중" : "OFF — 시작하기";
  toggleBtn.style.background = isActive ? "#e53e3e" : "#38a169";

  siteList.innerHTML = "";
  if (blockedSites.length === 0) {
    siteList.innerHTML = '<li class="empty">차단할 사이트를 추가하세요</li>';
    return;
  }
  for (const site of blockedSites) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `<span>${site}</span><button class="remove-btn" data-site="${site}">✕</button>`;
    siteList.appendChild(li);
  }
}

toggleBtn.addEventListener("click", async () => {
  isActive = !isActive;
  await chrome.storage.local.set({ isActive });
  renderBlocker();
});

addBtn.addEventListener("click", addSite);
siteInput.addEventListener("keydown", (e) => e.key === "Enter" && addSite());

async function addSite() {
  const site = siteInput.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!site || blockedSites.includes(site)) { siteInput.value = ""; return; }
  blockedSites = [...blockedSites, site];
  siteInput.value = "";
  await chrome.storage.local.set({ blockedSites });
  renderBlocker();
}

siteList.addEventListener("click", async (e) => {
  const btn = (e.target as HTMLElement).closest(".remove-btn") as HTMLElement | null;
  if (!btn) return;
  const site = btn.dataset.site;
  blockedSites = blockedSites.filter((s) => s !== site);
  await chrome.storage.local.set({ blockedSites });
  renderBlocker();
});

// --- Storage change listener (real-time updates) ---
chrome.storage.onChanged.addListener((changes) => {
  if (!("timer" in changes) && !("sessions" in changes)) return;

  chrome.storage.local.get(DEFAULT_STORAGE).then((data) => {
    const state = data as AppState;

    if (prevPhase != null && prevPhase !== state.timer.phase) playDing();
    prevPhase = state.timer.phase;

    renderTimer(state);
    if (state.timer.isRunning && state.timer.endTime != null) {
      startTick(state.timer.endTime);
    } else {
      stopTick();
    }
  });
});

// --- Initial load ---
const DEFAULT_STORAGE = {
  timer: { phase: TimerPhase.FOCUS, endTime: null, isRunning: false, completedPomodoros: 0 },
  blockedSites: [] as string[],
  isActive: false,
  sessions: [] as unknown[],
};

async function load() {
  const data = await chrome.storage.local.get(DEFAULT_STORAGE);
  const state = data as AppState;

  prevPhase = state.timer.phase;
  renderTimer(state);
  if (state.timer.isRunning && state.timer.endTime != null) {
    startTick(state.timer.endTime);
  }
  isActive = state.isActive;
  blockedSites = state.blockedSites;
  renderBlocker();
}

load();
