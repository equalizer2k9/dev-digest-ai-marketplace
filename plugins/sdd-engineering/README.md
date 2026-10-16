# sdd-engineering

A spec-driven development pipeline: a request becomes an EARS spec, the spec becomes a traceable
plan, the plan is implemented with tests, reviewed against the project's architecture rules, and
verified criterion by criterion — plus a retro of the run's cost and an insight log of what was
learned.

## Use case

You want a feature built in a way that can be checked: every acceptance criterion has an ID, a
task, a test and `file:line` evidence in a final verification report.

## Components

| Component | Type | What it does |
|---|---|---|
| `sdd-engineering:spec-creator` | agent (opus) · Read, Grep, Glob, Write | Request → `specs/<feature>/spec.md` with EARS AC; asks blocking questions first |
| `sdd-engineering:implementation-planner` | agent (opus) · Read, Grep, Glob | Approved spec → plan with tasks, tests, check commands, traceability; read-only |
| `sdd-engineering:implementer` | agent (sonnet) · Read, Grep, Glob, Edit, Write, Bash, Skill | Executes plan tasks, loads `engineering-paved-path` skills by stack, runs the project's checks |
| `sdd-engineering:plan-verifier` | agent (opus) · Read, Grep, Glob | AC/plan → PASS / PARTIAL / MISSING matrix with evidence; read-only |
| `/sdd-engineering:run-plan` | skill (user-invoked only) | Drives implementer → `architecture-review:architecture-reviewer` → ≤2 fix rounds → plan-verifier → `verification.md` |
| `/sdd-engineering:workflow-retro` | skill (user-invoked only) | Tokens, timing and waste of one run from local session logs → one ledger row |
| `sdd-engineering:engineering-insights` | skill | Appends verified, non-obvious findings to the module's `INSIGHTS.md` |

Shared rules (artifact paths, how check commands are found, never-touch list) live in one place:
[CONVENTIONS.md](CONVENTIONS.md).

```
research-tools:researcher → spec-creator → implementation-planner → /run-plan
   run-plan: implementer → architecture-review:architecture-reviewer → fix rounds → plan-verifier
```

**Defaults, overridable by the project's `CLAUDE.md` / `AGENTS.md`:** spec, plan and report at
`specs/<feature>/{spec,plan,verification}.md`; retro ledger at `docs/retros/ledger.md`; insights in
`<module>/INSIGHTS.md`. Typecheck/test commands come from the project instructions or
`package.json` scripts — if none are found, the agents stop and say so instead of guessing.

**Not included:** DevDigest's `security-reviewer` stays in DevDigest (its threat model is specific to
that product), so `run-plan` has no security gate. Run your own security review separately.

## Requirements

- Claude Code ≥ 2.1.110 — see [COMPATIBILITY.md](COMPATIBILITY.md).
- Dependencies (installed automatically): `engineering-paved-path`, `research-tools`,
  `architecture-review`, each `^1.0.0`.
- `git` for `run-plan` (status, diff, local commits — it never pushes).
- `node` for `workflow-retro` (`scripts/collect.mjs`, no npm dependencies). It reads this machine's
  Claude Code session logs under `~/.claude/projects/` — local data, nothing is sent anywhere.
- No MCP servers, hooks or credentials.

## Install

```bash
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace

claude plugin install sdd-engineering@dev-digest-ai-marketplace                  # user scope
claude plugin install sdd-engineering@dev-digest-ai-marketplace --scope project  # this repository
```

## Quick start

```text
Use sdd-engineering:spec-creator: users should be able to export their invoices as CSV from the
invoices page, filtered by the current date range.
```

Answer its blocking questions, review the spec, set `Status: approved`, then:

```text
Use sdd-engineering:implementation-planner on specs/invoice-csv-export/spec.md
```

Save the plan to `specs/invoice-csv-export/plan.md`, then on a feature branch:

```text
/sdd-engineering:run-plan specs/invoice-csv-export/spec.md specs/invoice-csv-export/plan.md
```

Afterwards: `/sdd-engineering:workflow-retro deep` for the cost of the run.

## Verification

```bash
claude plugin details sdd-engineering   # Agents (4), Skills (3)
claude plugin list                      # the three dependencies are installed and enabled
```

## Support

Owner: [@equalizer2k9](https://github.com/equalizer2k9). Issues:
<https://github.com/equalizer2k9/dev-digest-ai-marketplace/issues>.
