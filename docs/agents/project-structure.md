# Project Structure

## Source → Build mapping

Bun bundles each entry point separately. Output must match paths in `manifest.json`.

| Source | Output | Manifest ref |
|--------|--------|-------------|
| `src/background/index.ts` | `dist/background.js` | `background.service_worker` |
| `src/popup/popup.ts` | `dist/popup/popup.js` | `action.default_popup` |
| `src/popup/popup.html` | `dist/popup/popup.html` | (copied as-is) |
| `src/content/index.ts` | `dist/content.js` | `content_scripts` |
| `src/block-page/index.html` | `dist/block-page.html` | `web_accessible_resources` |

## File Tree

```
src/
├── background/
│   └── index.ts               # Service worker entry point
├── popup/
│   ├── popup.html
│   ├── popup.ts               # Entry point — mounts components
│   └── components/
│       ├── TimerDisplay.ts
│       ├── TimerControls.ts
│       ├── PhaseIndicator.ts
│       ├── SiteInput.ts
│       └── SiteList.ts
├── content/
│   └── index.ts               # Reflection overlay injection
├── block-page/
│   └── index.html             # Static block redirect page
└── shared/
    ├── types.ts               # AppState, TimerState, SessionEntry
    ├── messages.ts            # Message union type + sendMessage helpers
    └── constants.ts           # Default durations, alarm name
```

## More details
- See `docs/agents/ui-spec.md` for screen layouts and tab structure

## Notes
- `src/shared/` is imported by all contexts — keep it free of browser-context-specific APIs
- Components in `src/popup/components/` are plain TS functions that return/mutate DOM elements (no framework)
