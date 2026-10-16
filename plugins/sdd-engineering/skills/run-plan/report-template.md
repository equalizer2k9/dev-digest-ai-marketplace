# Verification report template

Fill every section, in this order. Copy values from the plan, `git log` and the merged verifier
matrix — never improve them. A cell with no value stays visibly empty (`—`).

---

# Verification: <feature name>

## Inputs

- Spec: `<path>` (SPEC-NN)
- Plan: `<path>`
- Branch: `<branch>` · base `<sha>` · head `<sha>`

## Matrix

One row per AC of the spec, in spec order.

| AC | Task(s) | Test (file › case) | Commit | Evidence (file:line) | Status |
|---|---|---|---|---|---|
| AC-1 | T-1 | `path/to/file.test.ts` › case | `abc1234` | `path/to/file.ts:10-24` | PASS |

## Open rows

Every PARTIAL / MISSING row and what would close it. `None.` only if true.

## Architecture review

- Rule documents judged against (or "no documented architecture rules found"):
- Rounds run:
- Fixed:
- CRITICAL / major still open:
- minor findings, as shown to the user:

## Checks

| Command | Directory | Result |
|---|---|---|

## Deviations

From the implementers' reports, per group.
