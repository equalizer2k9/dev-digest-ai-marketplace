# Plugin guidelines

## Where a plugin ends

A plugin is a unit someone installs on its own and that works in **any** repository.

- One plugin = one job a user would ask for by name (e.g. "spec-driven workflow", "engineering insights",
  "fastify skill"). Split when two parts are useful apart; merge when one never works without the other.
- A plugin carries **how to work**, not **what this project is**. Project facts (module names, layers,
  commands, ports, file layout) come from the host repository at run time: its `CLAUDE.md`, `AGENTS.md`,
  `README.md`, specs — read, not hard-coded.
- If a component can't be written without naming a specific repository's paths or modules, it stays in
  that repository.
- Shared pieces go in their own plugin and are pulled in through `dependencies`, not copied.

## What never goes into a plugin

| Don't ship | Why | Instead |
|---|---|---|
| Secrets — tokens, API keys, passwords, private keys, `.env` | Public repo; plugins are copied to every user's cache | `userConfig` with `"sensitive": true`, or the user's own env |
| Absolute paths — `/Users/…`, `/home/…`, `C:\…` | Break on every other machine | `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_PROJECT_DIR}` |
| Private memory — `MEMORY.md`, auto-memory, session notes, personal preferences | Personal data; not reusable | Keep in `~/.claude` |
| Project-specific rules — module names, onion layers of one codebase, package managers of one repo, specific `AGENTS.md` paths | Wrong in every other repo | Leave in the project's `CLAUDE.md`/`AGENTS.md`; the plugin tells the agent to read them |
| `settings.local.json`, transcripts, eval outputs, caches | Local leftovers | `.gitignore` |
| A top-level `bin/` | claude.ai org sync rejects it | `scripts/` + `${CLAUDE_PLUGIN_ROOT}/scripts/<name>` |
| A `CLAUDE.md` at the plugin root | Not loaded as context; validator warns | Put instructions in a skill |
| Files outside the plugin dir (`../shared`) | Not copied to the cache; path rejected | Copy in, or depend on another plugin |

## Path variables

Use these instead of literal paths. They are substituted in skill, command and agent Markdown, and in
hook/MCP/LSP commands.

| Variable | Resolves to | Use for |
|---|---|---|
| `${CLAUDE_PLUGIN_ROOT}` | the installed plugin version's directory (changes on every update) | bundled scripts, templates, config — read-only |
| `${CLAUDE_SKILL_DIR}` | the directory holding this skill's `SKILL.md` (the skill's subdirectory, not the plugin root) | files next to a skill: `references/`, `templates/` |
| `${CLAUDE_PLUGIN_DATA}` | `~/.claude/plugins/data/<id>/`, kept across updates | caches, installed deps, state |
| `${CLAUDE_PROJECT_DIR}` | the user's project root | reading the host project's files |

Rules:

- Never write state into `${CLAUDE_PLUGIN_ROOT}` — it is replaced on update.
- In shell-form hooks quote the variable: `"${CLAUDE_PLUGIN_ROOT}"/scripts/x.sh`; prefer exec form with `args`.
- These variables are **not** set in the Bash tool's environment. Write them in the Markdown body so
  Claude Code substitutes them when it loads the skill.
- Use forward slashes in every path.

## De-personalising a component from DevDigest

1. Replace repository paths (`server/src/…`, `client/…`, `reviewer-core/…`) with "the package/module
   being changed" and an instruction to discover layout from the host repo's docs.
2. Replace named DevDigest skills/agents with namespaced plugin components or declared dependencies.
3. Replace fixed commands (`pnpm test`, `npm run typecheck`) with "the project's test/typecheck command
   from its docs".
4. Remove references to `INSIGHTS.md` locations, `specs/` layout, port numbers, unless made configurable.
5. Run `claude plugin validate plugins/<name>` and grep for leftovers (`dev-digest`, `DevDigest`,
   `server/`, `client/`).
