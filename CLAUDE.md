# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read @AGENTS.md for details.
Read @TODO.md for tasks.

## RULES

- **[PRIORITY: CRITICAL] Branch Management:** Always check branching rules in @TODO.md before starting. If on the wrong branch, STOP and ask the user to `git checkout`.
- **[PRIORITY: CRITICAL] Branch Management:** Do not change CLAUDE.md file.
- **[WORKFLOW: MANDATORY] TDD First:** Implementation MUST start with a failing test case. Create stubs first.
- **[WORKFLOW: MANDATORY] @TODO.md Updates:** 
  1. Read @TODO.md before every task.
  2. Immediately after a task is completed and verified, you **MUST** update the status in @TODO.md and commit tests.
  3. Do not proceed to the next task until @TODO.md is updated and tests are passed.
- **Rule Synchronization:** If rules change, commit to `develop` first, then rebase/merge into feature branches.
- **CLAUDE.md Maintenance:** Never append context/logs here. Refer to @AGENT.md instead.


## Commands

```bash
pnpm run dev    # watch build (ask the user to run — do not run automatically)
pnpm run build  # one-off build
pnpm test       # run all tests
pnpm test src/background/timer.test.ts  # run a single test file
```

## Development Notes

- Background script is a service worker (Manifest V3)
- If claude code made some mistakes, write them down in this file.


