# Timer

## Core Rule
**Never use `setInterval` or `setTimeout` for the timer.** The service worker can be terminated by Chrome at any time. Use `chrome.alarms` API exclusively — alarms persist across service worker restarts.
