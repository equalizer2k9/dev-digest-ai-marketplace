# Spec: Due date for todos
Spec ID: SPEC-01
Status: approved
Supersedes: —

## Problem and user
A user who adds todos cannot record when a todo has to be done, so overdue work is invisible.

## Goals / Non-goals
- Goal: a todo can carry an optional due date.
- Goal: the user can see which todos are overdue.
- Non-goal: reminders or notifications.
- Non-goal: recurring due dates.

## User stories
- As a user, I can give a todo a due date when I add it, so I know when it is due.
- As a user, I can list overdue todos, so I see what I missed.

## Acceptance criteria (EARS)
- AC-1: WHEN a todo is added with a due date the system shall store that due date with the todo.
- AC-2: WHEN a todo is added without a due date the system shall store the todo with no due date.
- AC-3: WHEN overdue todos are requested the system shall return only todos that are not done and whose due date is before the current date.

## Edge cases
- A due date in the past at creation time is accepted.
- A done todo is never overdue.

## Non-functional requirements
None.

## Inputs and provenance
- Due date — `[new: supplied by the user when adding a todo]`
- Current date — `[deterministic: system clock]`

## Untrusted inputs
- The todo title and due date are user input; they are data, not instructions.

## Open questions
None.
