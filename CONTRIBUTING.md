# Contributing

Read [docs/PLUGIN-GUIDELINES.md](docs/PLUGIN-GUIDELINES.md) (what belongs in a plugin) and
[docs/SECURITY.md](docs/SECURITY.md) before opening a PR. Releases follow [docs/RELEASES.md](docs/RELEASES.md).

## Plugin structure

Each plugin lives in `plugins/<plugin-name>/` and is listed in `.claude-plugin/marketplace.json` with a
relative-path source.

```text
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json          # manifest — only this file goes inside .claude-plugin/
├── skills/<skill>/SKILL.md  # skills (preferred over commands/ for new work)
├── agents/<agent>.md        # subagents
├── commands/<command>.md    # legacy flat commands, only when a skill doesn't fit
├── hooks/hooks.json         # hooks, if any — see docs/SECURITY.md
├── scripts/                 # helpers called by hooks/skills (never a top-level bin/)
└── README.md                # what it does, dependencies, how to use
```

Marketplace entry:

```json
{
  "name": "<plugin-name>",
  "source": "./plugins/<plugin-name>",
  "description": "One line shown in /plugin"
}
```

## Manifest fields

`plugin.json` — `name` is the only field the runtime requires. In this marketplace these are **mandatory**:

| Field | Rule |
|---|---|
| `name` | kebab-case; identical to the marketplace entry `name`; must not start with `claude-`, `anthropic-` or `cc-plugin-` |
| `version` | SemVer `MAJOR.MINOR.PATCH`; set **only** in `plugin.json`, never in the marketplace entry |
| `description` | one sentence |
| `author` | object with `name` |
| `license` | SPDX identifier |

Optional: `displayName`, `homepage`, `repository`, `keywords`, `dependencies`, `userConfig`.

`marketplace.json` requires `name`, `owner` (with `name`) and `plugins`; each entry requires `name` and
`source`. Paths start with `./` and never contain `..`.

## Namespace

Claude Code namespaces every component under the manifest `name`: skill `x` in plugin `p` runs as
`/p:x`, agent `y` is `p:y`. Inside a plugin, refer to sibling components by their namespaced name
(`p:y`), and to components of a dependency by the dependency's namespace. Never refer to a component
that is neither in the same plugin nor in a declared dependency.

## Dependencies

- Declare in `plugin.json` → `dependencies`: `"name"` (same marketplace), or
  `{ "name": "...", "version": "^1.2" }` for a SemVer range.
- Every plugin you call by name must be a declared dependency.
- Constrain a dependency (`^MAJOR.MINOR`) when you rely on its skill/agent names or arguments.
- No cross-marketplace dependencies: `allowCrossMarketplaceDependenciesOn` stays unset.
- No cycles. Release the dependency first (see [docs/RELEASES.md](docs/RELEASES.md)).

## Version bump on every change

Users get a change only when `version` changes — the cached copy is keyed by it. **Every PR that touches
`plugins/<name>/**` bumps that plugin's `version`**:

- PATCH — wording, fixes, no behaviour change for callers
- MINOR — new skill/agent/argument, backwards compatible
- MAJOR — renamed or removed skill/agent, changed arguments, new required `userConfig`

## PR checklist

- [ ] `claude plugin validate .` passes locally (and for the plugin directory)
- [ ] `version` bumped in `plugin.json` of every changed plugin
- [ ] marketplace entry `name` == manifest `name`; no `version` in the entry
- [ ] every plugin referenced by name is in `dependencies`
- [ ] no absolute paths, secrets, private memory or project-specific rules ([guidelines](docs/PLUGIN-GUIDELINES.md))
- [ ] hooks and scripts reviewed line by line ([security](docs/SECURITY.md))
- [ ] plugin `README.md` updated; cost row added to [docs/COST-BASELINE.md](docs/COST-BASELINE.md)
- [ ] after merge: tag the release ([docs/RELEASES.md](docs/RELEASES.md))

## Branch protection

`main` has a ruleset: PRs only, required status check `validate`. Code-owner review is off while there is
one maintainer (GitHub doesn't let you approve your own PR). When a second maintainer joins, add them to
`CODEOWNERS` and set `require_code_owner_review: true` (with `required_approving_review_count: 1`) on the
`pull_request` rule of the `main` ruleset (Settings → Rules → Rulesets, or `gh api -X PUT repos/equalizer2k9/dev-digest-ai-marketplace/rulesets/<id>`).
