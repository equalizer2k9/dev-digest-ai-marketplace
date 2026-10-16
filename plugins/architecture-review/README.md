# architecture-review

A read-only `architecture-reviewer` agent that checks whether a change — or a plan before any code
exists — respects the project's **own documented** architecture: layer boundaries, file placement,
coupling, leaking abstractions, duplicated contracts. It never judges against rules the project
hasn't written down; when it finds none, it says so.

## Use case

After an implementation (or on a design), ask "does this respect our layers and boundaries?" and get
one located finding per line with a severity and a `Verdict: BLOCK / PASS`.

## Components

| Component | Type | Tools |
|---|---|---|
| `architecture-review:architecture-reviewer` | agent (sonnet, 25 turns) | Read, Grep, Glob, Skill — read-only, no shell |

Where it looks for rules, in order: `ARCHITECTURE.md`; `AGENTS.md` / `CLAUDE.md` (root and touched
packages); `docs/architecture*` and ADRs; project skills with `architecture` in their name. It loads
`engineering-paved-path` skills for a framework's own structural rules when the project rules refer
to them.

Output format:

```
file:line | CRITICAL / WARNING / SUGGESTION | what is wrong | evidence
Verdict: BLOCK | PASS (counts) — rule documents judged against
```

## Requirements

- Claude Code ≥ 2.1.110 — see [COMPATIBILITY.md](COMPATIBILITY.md).
- Dependency: `engineering-paved-path` `^1.0.0` (installed automatically).
- No MCP servers, hooks, network access or credentials.

## Install

```bash
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace

claude plugin install architecture-review@dev-digest-ai-marketplace                  # user scope
claude plugin install architecture-review@dev-digest-ai-marketplace --scope project  # this repository
```

## Quick start

```text
Use architecture-review:architecture-reviewer on these changed files:
src/orders/service.ts, src/orders/routes.ts, src/db/orders.repo.ts
```

Give it the changed-file list (`git diff --name-only main...HEAD`) — it has no shell.

## Verification

```bash
claude plugin details architecture-review   # Agents (1) architecture-reviewer
claude plugin list                          # engineering-paved-path is installed as its dependency
```

## Support

Owner: [@equalizer2k9](https://github.com/equalizer2k9). Issues:
<https://github.com/equalizer2k9/dev-digest-ai-marketplace/issues>.
