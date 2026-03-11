# State Management

All persistent state lives in `chrome.storage.local`. No in-memory state in the service worker — it will be lost when the worker is terminated.
