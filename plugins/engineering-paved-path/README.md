# engineering-paved-path

Stack skills — the "paved path" for each technology — that the agents of `architecture-review` and
`sdd-engineering` load by name while they plan, implement and review code. Each skill is general
best practice for its library; project rules (in the project's own `CLAUDE.md`, `AGENTS.md` or
project skills) win where they differ.

## Use case

You write or review TypeScript code on Fastify, Drizzle/PostgreSQL, React or Zod and want the agent
to follow established patterns for that library instead of improvising.

## Components

| Skill | Use it for | Loaded by |
|---|---|---|
| `engineering-paved-path:fastify-best-practices` | Fastify routes, plugins, hooks, schemas, errors | `sdd-engineering:implementer`, `architecture-review:architecture-reviewer` |
| `engineering-paved-path:drizzle-orm-patterns` | Drizzle schema, queries, relations, transactions, migrations | `sdd-engineering:implementer`, `architecture-review:architecture-reviewer` |
| `engineering-paved-path:postgresql-table-design` | PostgreSQL tables, types, indexes, constraints | `sdd-engineering:implementer` |
| `engineering-paved-path:react-best-practices` | React components, hooks, state, data fetching | `sdd-engineering:implementer`, `architecture-review:architecture-reviewer` |
| `engineering-paved-path:react-testing-library` | Component and hook tests with RTL + Vitest | `sdd-engineering:implementer` |
| `engineering-paved-path:zod` | Zod schemas, parsing, inferred types | `sdd-engineering:implementer`, `architecture-review:architecture-reviewer` |

Every skill is also model-invocable on its own: Claude loads it when the task matches its description.

### Not taken from the DevDigest harness

Only skills with a consumer in the other three plugins are shipped.

| Skill | Why not |
|---|---|
| `next-best-practices` | Would have a consumer (Next.js files in `sdd-engineering:implementer`), but its upstream (`vercel-labs/next-skills`) has no license file, so it can't be redistributed |
| `typescript-expert` | No consumer; points to subagents that don't exist; its diagnostic script runs shell commands with `shell=True` |
| `security` | Only consumer is DevDigest's `security-reviewer`, which stays in DevDigest; also carries another project's stack (Express/MongoDB) |
| `mermaid-diagram` | Only consumer is DevDigest's `doc-writer`, which stays in DevDigest |
| `onion-architecture`, `frontend-architecture` | Project-specific rules of DevDigest; `architecture-review` reads a project's own rules instead |
| `pr-self-review` | Project-specific routing and guardrails |

## Requirements

- Claude Code ≥ 2.1.110 — see [COMPATIBILITY.md](COMPATIBILITY.md).
- No MCP servers, hooks, network access or credentials.

## Install

```bash
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace

claude plugin install engineering-paved-path@dev-digest-ai-marketplace                  # user scope
claude plugin install engineering-paved-path@dev-digest-ai-marketplace --scope project  # this repository
```

It is installed automatically as a dependency of `architecture-review` and `sdd-engineering`.

## Quick start

```text
Add a POST /invoices route to the Fastify API with a Zod-validated body and a Drizzle insert.
```

Claude loads `engineering-paved-path:fastify-best-practices`, `engineering-paved-path:zod` and
`engineering-paved-path:drizzle-orm-patterns` as it works. To load one explicitly:
`/engineering-paved-path:zod`.

## Verification

```bash
claude plugin list                            # engineering-paved-path@dev-digest-ai-marketplace ✔ enabled
claude plugin details engineering-paved-path  # Skills (6)
```

## Support

Owner: [@equalizer2k9](https://github.com/equalizer2k9). Issues:
<https://github.com/equalizer2k9/dev-digest-ai-marketplace/issues>. Third-party sources and licenses:
[NOTICE.md](NOTICE.md).
