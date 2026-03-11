# Project Overview

Focus - Monkmode is a Chrome Manifest V3 extension built with the Bun bundler and Typescript.

- Core Features: A customizable Pomodoro timer with a web blocker and a session tracker for reflections. When a user navigates to a restricted website, a reflection page appears, providing meditation instructions and a one-liner form for later reflection.
- Key code-paths:
    - `src/popup/popup.ts` + `src/popup/components/` (Popup UI & Interaction)
    - `src/background/index.ts` (Service Worker: Timer alarms & DNR rule sync)
    - `src/content/index.ts` (Reflection overlay injection on blocked sites)
    - `src/block-page/index.html` (Static block redirect page)
    - `src/shared/` (types, messages, constants — shared across all contexts)

# Repository Guidelines

## Beforehand
- Package manager: pnpm (see packageManager in package.json).
- Dev build: ask the user to run `pnpm run dev`; do not run it automatically.

## More details
- [Project structure](docs/agents/project-structure.md)
- [State management](docs/agents/state-management.md)
- [Timer](docs/agents/timer.md)
- [blocker](docs/agents/blocker.md)
- [Coding style & naming](docs/agents/coding-style.md)
- [UI spec](docs/agents/ui-spec.md)

