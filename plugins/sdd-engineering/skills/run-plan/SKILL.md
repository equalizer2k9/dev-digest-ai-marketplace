---
name: run-plan
description: Execute an approved spec + plan — sdd-engineering:implementer per package group → architecture-review:architecture-reviewer → fix rounds → sdd-engineering:plan-verifier → verification report. Invoke only when the user runs /sdd-engineering:run-plan.
argument-hint: <path/to/spec.md> <path/to/plan.md> [report=<path>]
disable-model-invocation: true
---

Run the plan: $ARGUMENTS

You are the main session and you drive the pipeline; the agents do the work. No agent can call
another, so you pass each one's output to the next. This skill does NOT run
`sdd-engineering:spec-creator` or `sdd-engineering:implementation-planner` — those run beforehand —
and there is no separate test writer: the implementer writes the tests its tasks name.

Shared rules — project instructions, artifact paths, check commands, never-touch list — are in
`${CLAUDE_PLUGIN_ROOT}/CONVENTIONS.md`. Read it once at the start.

**Keep your own context small** — you are in every request of the run, so what you read is paid
for at every step. Read the spec once. Never read the plan whole: read the section the current
step needs (`grep -n '^## \|^### ' <plan>` gives the line numbers, then read that range) —
Traceability for step 0, the task list for step 1, nothing for the review. The agents read the
plan themselves.

## 0. Preconditions — stop if any fails

1. Both paths are given and both files exist. Read the spec in full; of the plan, read only its
   headings and its Traceability table.
2. The spec says `Status: approved` and contains no `[NEEDS CLARIFICATION]`.
3. The plan references that spec, and its Traceability table has a row for every `AC-n` of the
   spec, each with a task and a test.
4. `git status` is clean apart from the spec and the plan, and you are not on the default branch.
5. The check commands (CONVENTIONS §3) are known for every package the plan's `Files:` lines
   touch.

A failed precondition is not yours to repair: say which one failed and stop. Do not edit the spec
or the plan to make them pass.

Report path: `report=<path>` from the arguments; otherwise the project instructions' location;
otherwise `verification.md` next to the spec (CONVENTIONS §2).

## 1. Implement — one implementer (or one chain of sessions) per package group

Read the plan's task headings and each task's `Files:` line (not the task bodies) and group the
tasks by the package or top-level module their files are in, as the project instructions define
packages (a repository without packages is one group).

A task that touches several groups (a contract shared between them) goes to the group the others
depend on, together with every copy of that contract, and the dependent groups start after it.

Launch one `sdd-engineering:implementer` per non-empty group, each with the spec path, the plan
path, the list of its task ids, and the instruction: carry out ONLY these tasks, in plan order,
each task's test before its code, and touch no file outside the group.

- **Parallel** when the plan marks groups independent, or when no task depends on an unfinished
  task of another group (the plan's `Depends on:` lines say). Launch them in ONE message.
- **Sequential** otherwise, in dependency order, each after the previous group's checks pass.

**Sessions.** When the plan splits a group into sessions (named task ranges), each session is its
own implementer launch: a new agent with a clean context and only that session's task ids, never a
`SendMessage` to an earlier session. All sessions run inside this one run.

- Within a group, sessions run in plan order. Start the next one only after you have run the
  previous session's checks green and committed it.
- Chains of different groups run in parallel. A session whose tasks depend on another group waits
  until the session holding that task is green and committed.

Wait for the reports.

- A task reported `blocked`, or a deviation that changes what an AC means → stop and ask the user.
  Do not improvise a different design and do not re-plan.
- An implementer that stopped at its turn limit is resumed once (`SendMessage`: continue from
  where it stopped). For a session, launch instead one fresh implementer with the session's
  unfinished task ids. A second stop → show the user what is done and what is not.
- Run the checks of every touched package yourself; do not rely on the reports. If they fail,
  send the failing output back to that group's implementer once; if they still fail, stop and
  show the user.
- Commit locally: one commit per group (per session when the plan has sessions), message per the
  project's convention. Stage only that group's paths — another chain may be writing at the same
  time. Never push.

## 2. Review gate — architecture

Launch `architecture-review:architecture-reviewer` with the changed-file list
(`git diff --name-only <base>...HEAD`) and the plan path. It is read-only and has no shell.

Severities → this skill: `CRITICAL` → CRITICAL · `WARNING` → major · `SUGGESTION` → minor.

If the reviewer reports that the project has no documented architecture rules, record that in the
report as is; do not supply rules of your own.

## 3. Fix rounds — at most 2

While the review holds a CRITICAL or major finding and fewer than 2 rounds have run:

1. Send the implementer of the group the finding is in ONLY the CRITICAL and major findings for
   its files, verbatim, with the plan path. It fixes those and nothing else. When the group ran in
   sessions, launch a fresh implementer for the fix.
2. Re-run the checks of the touched packages yourself.
3. Commit locally (`fix(<scope>): address review`, or the project's convention).
4. Re-review **the fix, not the feature**: launch the reviewer again with (a) the list of its own
   findings sent to the implementer and (b) the files of the fix commit
   (`git diff --name-only <fix-commit>~1 <fix-commit>`) with the changed line ranges
   (`git diff -U0 <fix-commit>~1 <fix-commit>`, hunk headers only). Its instruction: check that
   each listed finding is closed and that the changed lines introduce nothing new.

After the second round, stop fixing whatever the result. CRITICAL or major findings that remain go
into the report as open and are shown to the user — never a third round on your own.

minor findings are never sent to the implementer. Show them to the user as a list, from every
round, and leave the decision to them.

## 4. Verify

Split the ACs by the plan's Traceability table (already read in step 0): an AC whose tasks are all
in one group goes to that group's set; an AC with tasks in several groups goes to each of them,
each verifier checking its own side.

Launch one `sdd-engineering:plan-verifier` per set, all in ONE message, in parallel. Each gets the
spec path, the plan path, the requirements doc if there is one, its AC ids and only its group's
part of the final changed-file list.

Merge the matrices into one, in spec order: an AC checked by several verifiers gets the evidence of
all and the worst status (MISSING < PARTIAL < PASS). Do not send gaps back to the implementer —
verification is the end of this run. A `needs runtime check` item is run by you (the check command,
or the app) and the real result is recorded next to it.

## 5. Report

Write the report yourself (the verifiers are read-only) at the report path from step 0, following
`${CLAUDE_SKILL_DIR}/report-template.md` exactly.

Then tell the user: the report path, the PASS / PARTIAL / MISSING counts, what is still open.
Do not set the spec to `implemented`, do not push and do not open a PR — the user does that.

## If a model call fails

An agent launch that fails with a billing or model error (HTTP 402, 404, model not found, credit
exhausted) is not retried, not rerouted to another model and not done by you inline instead.
Stop where you are, report which agent and which step failed with the exact error, what is
already committed, and ask the user how to proceed.
