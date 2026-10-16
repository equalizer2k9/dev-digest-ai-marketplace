# Catalog site — spec

A static, read-only catalog of this marketplace on GitHub Pages:
<https://equalizer2k9.github.io/dev-digest-ai-marketplace/>. Built from the repository on every push
to `main`; everything it shows comes from the files in this repository — no mock data.

## Routes (hash routing)

| Route | Shows |
|---|---|
| `#/` | Search box and plugin cards (name, version, description, category, skill/agent counts); with a query, matching plugins and artifacts |
| `#/plugin/<name>` | Version, owner, license, compatibility, dependencies (linked), components (skills/agents → artifact pages), README, **Copy install** (`/plugin install <name>@dev-digest-ai-marketplace`) |
| `#/artifact/<plugin>:<name>` | Type (skill/agent), plugin, namespaced name, invocation or model/tools, body (SKILL.md / agent prompt) |
| `#/whats-new` | Releases, newest first, from each `CHANGELOG.md`; marked tagged when a `{name}--v{version}` tag exists |
| `#/getting-started` | Add the marketplace, install, update, verify — commands only |

## Data — `scripts/build-index.mjs` → `site/public/`

| File | Content |
|---|---|
| `index.json` | `marketplace` {name, description, owner, repository, addCommand}; `plugins[]` {name, version, description, category, keywords, author, license, homepage, repository, dependencies[{name, version}], compatibility (COMPATIBILITY.md table), claudeCode, installCommand, source, artifacts[ids], readmePath, text}; `artifacts[]` {id `<plugin>:<name>`, plugin, type, name, description, source, bodyPath, text, skill: argumentHint/userInvocable/modelInvocable/allowedTools, agent: model/tools/maxTurns}; `commit` |
| `releases.json` | `[{plugin, version, date, tag, notes}]` |
| `stats.json` | `{plugins, skills, agents}` |
| `bodies/*.md` | Plugin READMEs and artifact bodies without frontmatter; relative links rewritten to GitHub |

Sources: `.claude-plugin/marketplace.json`, each `plugin.json`, `README.md`, `CHANGELOG.md`,
`COMPATIBILITY.md`, and the frontmatter + body of every `skills/*/SKILL.md` and `agents/*.md`.
Generated files are git-ignored.

## Behaviour

- Search: MiniSearch over name, description, keywords and text (README for plugins, SKILL.md /
  agent body for artifacts); prefix + light fuzzy matching, name boosted.
- Markdown: `marked` → `DOMPurify` before every render.
- UI strings live only in `site/src/i18n/en.json`.
- Dark theme only.

## Not doing

Backend or API, accounts, ratings, reviews, comments, download or install counters, analytics,
light theme, in-browser install. The catalog reads; installing happens in Claude Code.
