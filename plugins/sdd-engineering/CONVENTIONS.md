# sdd-engineering conventions

The single source for the rules every agent and skill of this plugin shares. Agents and skills
point here instead of restating them.

## 1. Project instructions

"Project instructions" means, in this order: root `CLAUDE.md` and `AGENTS.md`, then `CLAUDE.md` /
`AGENTS.md` of each package or module the work touches, then any document they point to for the
topic at hand (contributing guide, `docs/`, testing guide). Read the ones that exist; a missing
file is not an error. Project instructions override every default below.

## 2. Artifact paths

| Artifact | Default path | Written by |
|---|---|---|
| Spec | `specs/<feature>/spec.md` | `sdd-engineering:spec-creator` |
| Plan | `specs/<feature>/plan.md` | the main session, from `sdd-engineering:implementation-planner`'s output |
| Verification report | `specs/<feature>/verification.md` | `/sdd-engineering:run-plan` |

`<feature>` is kebab-case. If the project instructions name a different location or layout for
specs, plans or reports (for example per-package spec folders), use theirs and say which rule you
followed. An explicit path given in the request wins over both.

## 3. Check commands (typecheck, test, lint)

Take them from, in this order:

1. the project instructions;
2. the `scripts` of the `package.json` (or the equivalent manifest: `Makefile`, `pyproject.toml`,
   `Cargo.toml`, …) of each package the work touches.

Run each check in the directory the instructions or manifest imply, with the package manager the
project already uses (its lock file shows which). If no command for a needed check can be found,
**say so and stop** — name where you looked. Never guess a command, never substitute a different
tool, never treat a missing check as passed.

## 4. Never touch

Unless the project instructions explicitly say otherwise:

- lock files — dependencies change only through the project's own package manager;
- generated files and applied database migrations — a schema change goes through the project's
  migration generator, and its output is committed unchanged;
- anything the project instructions list as do-not-touch, destructive, or local-only (runtime
  checkouts, data volumes, caches).

Never weaken, skip or delete a test to make it pass. Agents never commit, push or open a PR.

## 5. Pipeline

```
research-tools:researcher        (optional, facts with evidence)
  → sdd-engineering:spec-creator          spec.md   (Status: draft → user approves)
  → sdd-engineering:implementation-planner plan.md
  → /sdd-engineering:run-plan             implementer → architecture-review:architecture-reviewer
                                          → fix rounds → sdd-engineering:plan-verifier → verification.md
```

Refer to every component by its namespaced name. Stack skills come from `engineering-paved-path`
(`engineering-paved-path:<skill>`); project skills under `.claude/skills/` are used as well when
they cover the touched area.
