// Manual mock for Chrome extension APIs
// Usage: import "./src/__mocks__/chrome" at the top of test files

const storage: Record<string, unknown> = {};

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
    onAlarm: { addListener: () => {} },
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
} as unknown as typeof chrome;
