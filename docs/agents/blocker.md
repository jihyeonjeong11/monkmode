# Web Blocker

- Use `declarativeNetRequest` dynamic rules — never `chrome.tabs.onUpdated`
- When `isActive` toggles: clear all dynamic rules (off) or repopulate from `blockedSites` (on)
- Rule action: `REDIRECT` → `extensionPath: "/block-page.html"`
- Rule condition: `urlFilter: "||{site}"`, resourceType: `MAIN_FRAME`
