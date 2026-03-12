# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read @AGENTS.md for details.
Read @TODO.md for tasks.

## RULES

- **[PRIORITY: CRITICAL] Branch Management:** Always check branching rules in @TODO.md before starting. If on the wrong branch, STOP and ask the user to `git checkout`.
- **[PRIORITY: CRITICAL] Branch Management:** Do not change CLAUDE.md file.
- **Rule Synchronization:** If rules change, commit to `develop` first, then rebase/merge into feature branches.
- **CLAUDE.md Maintenance:** Never append context/logs here. Refer to @AGENT.md instead.

## Atomic Workflow (Strict Enforcement)
To ensure stability and progress tracking, you MUST follow these steps in order for every single task. Do not skip any step.

## Step 1: Initialize (TDD & Branch)
Check Branch: Verify your current branch against the rules in @TODO.md. If mismatched, ask the user to switch branches immediately.

TDD First: You are PROHIBITED from writing implementation code without a test.

Create a stub file with empty functions.

Write a failing test case in src/**/*.test.ts.

Run the test and confirm it fails.

## Step 2: Execute (One Task at a Time)
Single Focus: Pick exactly one task from @TODO.md. Do not attempt multiple tasks simultaneously.

Implementation: Write the minimal code necessary to make the test pass.

## Step 3: Verify & Sync (The Update Gate)
User Approval: After implementation, present the results to the user.

Verification: Run all related tests. If any test fails, you MUST NOT proceed or update documentation.

Update @TODO.md: Only after the user approves and tests pass, update the status in @TODO.md (e.g., mark as [x]).

NO PASS, NO NEXT: Do not move to the next task if @TODO.md is not updated or tests are failing.

## Step 4: Finalize (Commit)
Atomic Commit: Once the task is complete and documented, commit the changes (implementation + tests).

Rule Sync: If this task involved a rule change, ensure it is committed to develop as per the core rules.


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


