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

// Mutable state object — avoids closure-over-let issues in Bun's transpiler
const mockErrors = {
  alarm: null as Error | null,
  storage: null as Error | null,
  dnr: null as Error | null,
  runtime: null as Error | null,
};

export async function fireMockAlarm(name: string): Promise<void> {
  const alarm = { name, scheduledTime: Date.now() } as chrome.alarms.Alarm;
  for (const listener of alarmListeners) {
    await listener(alarm);
  }
}

export function simulateAlarmError(err: Error): void {
  mockErrors.alarm = err;
}

export function resetAlarmError(): void {
  mockErrors.alarm = null;
}

export function simulateStorageError(err: Error): void {
  mockErrors.storage = err;
}

export function resetStorageError(): void {
  mockErrors.storage = null;
}

export function simulateDnrError(err: Error): void {
  mockErrors.dnr = err;
}

export function resetDnrError(): void {
  mockErrors.dnr = null;
}

export function simulateRuntimeError(err: Error): void {
  mockErrors.runtime = err;
}

export function resetRuntimeError(): void {
  mockErrors.runtime = null;
}

// --- Global mock ---
(globalThis as unknown as { chrome: typeof chrome }).chrome = {
  storage: {
    local: {
      get: async (keys: Record<string, unknown>) => {
        if (mockErrors.storage) throw mockErrors.storage;
        return structuredClone({ ...keys, ...storage });
      },
      set: async (items: Record<string, unknown>) => {
        if (mockErrors.storage) throw mockErrors.storage;
        Object.assign(storage, structuredClone(items));
      },
    },
  },
  alarms: {
    create: () => { if (mockErrors.alarm) throw mockErrors.alarm; },
    clear: async () => { if (mockErrors.alarm) throw mockErrors.alarm; return true; },
    onAlarm: {
      addListener: (listener: AlarmListener) => { alarmListeners.push(listener); },
    },
  },
  runtime: {
    sendMessage: async () => { if (mockErrors.runtime) throw mockErrors.runtime; },
    onMessage: { addListener: () => {} },
    getURL: (path: string) => `chrome-extension://mock-id/${path}`,
  },
  tabs: {
    update: async () => ({}),
  },
  declarativeNetRequest: {
    updateDynamicRules: async () => { if (mockErrors.dnr) throw mockErrors.dnr; },
    getDynamicRules: async () => { if (mockErrors.dnr) throw mockErrors.dnr; return []; },
  },
  offscreen: {
    hasDocument: async () => false,
    getContexts: async () => [],
    createDocument: async () => {},
    closeDocument: async () => {},
    Reason: { AUDIO_PLAYBACK: "AUDIO_PLAYBACK" },
  },
} as unknown as typeof chrome;
