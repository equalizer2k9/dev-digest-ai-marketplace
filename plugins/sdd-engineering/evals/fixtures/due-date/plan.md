# Plan: Due date for todos
Spec: specs/due-date/spec.md (SPEC-01)

## Goal
Add an optional due date to todos and a query for overdue todos.

## Files
| path | new/modify | what changes | AC |
|---|---|---|---|
| src/store.ts | modify | `dueDate?` on `Todo`; `addTodo(title, dueDate?)`; `listOverdue(now)` | AC-1, AC-2, AC-3 |
| test/store.test.ts | modify | cases for due date and overdue | AC-1, AC-2, AC-3 |

## Tasks
### T-1 — Store an optional due date
AC: AC-1, AC-2
Files: src/store.ts, test/store.test.ts
Test: test/store.test.ts — stores the given due date; stores none when omitted
Verify: `npm test` and `npm run typecheck` in the repo root
Depends on: —

### T-2 — List overdue todos
AC: AC-3
Files: src/store.ts, test/store.test.ts
Test: test/store.test.ts — returns only not-done todos due before now
Verify: `npm test` and `npm run typecheck` in the repo root
Depends on: T-1

## Traceability
| AC | task(s) | test (file › case) |
|---|---|---|
| AC-1 | T-1 | test/store.test.ts › stores the given due date |
| AC-2 | T-1 | test/store.test.ts › stores none when omitted |
| AC-3 | T-2 | test/store.test.ts › returns only not-done todos due before now |

## Skills for the implementer
None.

## Risks
None.

## Out of scope
Reminders and recurring due dates (spec non-goals).
