// Manual mock for Chrome extension APIs
// Usage: import "./src/__mocks__/chrome" at the top of test files

// --- Storage ---
let storage: Record<string, unknown> = {};

export function resetMockStorage(): void {
  storage = {};
}

// --- Alarms ---
type AlarmListener = (alarm: chrome.alarms.Alarm) => void;
const alarmListeners: AlarmListener[] = [];

export async function fireMockAlarm(name: string): Promise<void> {
  const alarm = { name, scheduledTime: Date.now() } as chrome.alarms.Alarm;
  for (const listener of alarmListeners) {
    await listener(alarm);
  }
}

// --- Global mock ---
(globalThis as unknown as { chrome: typeof chrome }).chrome = {
  storage: {
    local: {
      get: async (keys: Record<string, unknown>) => ({ ...keys, ...storage }),
      set: async (items: Record<string, unknown>) => { Object.assign(storage, items); },
    },
  },
  alarms: {
    create: () => {},
    clear: async () => true,
    onAlarm: {
      addListener: (listener: AlarmListener) => { alarmListeners.push(listener); },
    },
  },
  runtime: {
    sendMessage: async () => {},
    onMessage: { addListener: () => {} },
    getURL: (path: string) => `chrome-extension://mock-id/${path}`,
  },
  tabs: {
    update: async () => ({}),
  },
  declarativeNetRequest: {
    updateDynamicRules: async () => {},
    getDynamicRules: async () => [],
  },
  offscreen: {
    hasDocument: async () => false,
    getContexts: async () => [],
    createDocument: async () => {},
    closeDocument: async () => {},
    Reason: { AUDIO_PLAYBACK: "AUDIO_PLAYBACK" },
  },
} as unknown as typeof chrome;
