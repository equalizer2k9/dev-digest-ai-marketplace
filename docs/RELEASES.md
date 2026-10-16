# Releases

Release evidence (tags, commit, eval results, known limitations): [1.0.0](releases/1.0.0.md) · [sdd-engineering 1.1.0](releases/1.1.0.md).

## Versioning

- SemVer `MAJOR.MINOR.PATCH` in each plugin's `plugin.json` → `version` (see
  [CONTRIBUTING.md](../CONTRIBUTING.md#version-bump-on-every-change) for what bumps which part).
- `version` lives **only** in `plugin.json`. If the marketplace entry also sets it, `plugin.json` wins and
  `claude plugin validate` warns.
- Users receive a change only when the computed version changes. Same `version` + new commits = no update.

## Tags

Each plugin release is a git tag on this repository:

```text
{plugin-name}--v{version}        e.g.  spec-workflow--v1.2.0
```

Plugins here use relative-path sources, so the tags live on the marketplace repository. Dependency
ranges (`"version": "^1.2"`) resolve to the highest matching tag.

Create tags with the CLI — it validates the plugin, checks that `plugin.json` and the marketplace entry
agree, requires a clean tree and refuses an existing tag:

```bash
cd plugins/<plugin-name>
claude plugin tag --dry-run      # show the tag it would create
claude plugin tag --push         # create {name}--v{version} and push it to origin
```

Never move or delete a published tag.

## Release order

1. Merge the PR (CI green) that bumps `version`.
2. Release **dependencies first**: tag every plugin whose new version others now require, before tagging
   the plugins that depend on it. A dependent's range can only resolve to tags that already exist.
3. Tag the dependent plugins.
4. Note the release in the PR or a GitHub release.

## How users update

| Command | Effect |
|---|---|
| `claude plugin marketplace update dev-digest-ai-marketplace` | refreshes the catalog; installed plugins stay at their version |
| `claude plugin update <plugin>@dev-digest-ai-marketplace` | updates one plugin (restart or `/reload-plugins` to apply) |
| `/plugin` → Marketplaces → **Update marketplace** | refreshes the catalog and updates its installed plugins |
| `/plugin` → Marketplaces → **Enable auto-update** | background refresh + update after session start |

Auto-update is off by default for this (third-party) marketplace. `DISABLE_AUTOUPDATER=1`,
`DISABLE_UPDATES=1` or `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` turn the pass off unless
`FORCE_AUTOUPDATE_PLUGINS=1` is set.

## Channels

| Channel | Add with | Marketplace name | What it serves |
|---|---|---|---|
| latest | `equalizer2k9/dev-digest-ai-marketplace` | `dev-digest-ai-marketplace` | `main` — every release as soon as it is tagged |
| stable | `equalizer2k9/dev-digest-ai-marketplace#stable` | `dev-digest-ai-marketplace-stable` | branch `stable` — the last release that passed a smoke eval on latest |

- **Two names.** A user can't register two marketplaces with the same name, so the channels use
  different names.
- **Branch `stable`.** It is the release commit plus one commit that renames the marketplace.
  Plugin entries are relative paths, so plugin files come from that branch.
- **Dependencies in stable.** Bare dependency names resolve in the same channel. Ranges like
  `^1.0.0` resolve to the highest matching `<name>--v*` tag in the repository, so a newer
  compatible dependency release is picked up even in stable.
- **Protection.** A ruleset protects `stable`: changes go through a PR with a green `validate`,
  and force-push and deletion are blocked.

Today `stable` = `2349d7e` (all four plugins 1.0.0) + the rename commit.

## Rollback

Claude Code has no rollback command. Rolling back means switching a project from latest to stable.
Plugin names are the same in both channels, so only one channel may be enabled at a time.

Run these in the project, at project scope:

```bash
# 1. Disable latest — consumers first (disable refuses while an enabled plugin depends on the target)
claude plugin disable sdd-engineering@dev-digest-ai-marketplace --scope project
claude plugin disable architecture-review@dev-digest-ai-marketplace --scope project
claude plugin disable research-tools@dev-digest-ai-marketplace --scope project
claude plugin disable engineering-paved-path@dev-digest-ai-marketplace --scope project

# 2. Register stable and install from it (its dependencies come from stable too)
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace#stable --scope project
claude plugin install sdd-engineering@dev-digest-ai-marketplace-stable --scope project

# 3. Check
claude plugin list --json   # *@dev-digest-ai-marketplace-stable enabled, sdd-engineering 1.0.0; latest disabled
```

Then start a new session, or run `/reload-plugins` in an open one. **Smoke check:** the session's
init lists `…/dev-digest-ai-marketplace-stable/sdd-engineering/1.0.0`, and a short spec request
behaves like 1.0.0.

**Back to latest:**

```bash
claude plugin disable sdd-engineering@dev-digest-ai-marketplace-stable --scope project
claude plugin disable architecture-review@dev-digest-ai-marketplace-stable --scope project
claude plugin disable research-tools@dev-digest-ai-marketplace-stable --scope project
claude plugin disable engineering-paved-path@dev-digest-ai-marketplace-stable --scope project
claude plugin enable sdd-engineering@dev-digest-ai-marketplace --scope project   # also re-enables its disabled dependencies
claude plugin list --json   # latest enabled again; stable stays registered but disabled
```

Then start a new session.

The plugins keep no state in `${CLAUDE_PLUGIN_DATA}` and ship no hooks, MCP servers or background
processes, so switching channels loses nothing.

**Fix forward on `main`** when a rollback is not needed: revert the bad change in a PR, bump
`version` (PATCH), merge and tag. Users on latest get it with `claude plugin update`.

**Pinning a single plugin:** a `github`, `url` or `git-subdir` entry can pin `ref` and a full
40-character `sha`. Relative-path entries (used here) follow the marketplace ref.

## Promotion

`stable` moves only to a tagged release that passed on latest:

1. The release is tagged, and its CI is green on the tagged commit.
2. Run a smoke eval on latest for every plugin that changed in the release. Use the
   [behavior evals](../CONTRIBUTING.md#behavior-evals) command with `--runs 1`. Record the
   result in `docs/releases/<version>.md`.
3. Open a PR into `stable` from the release tag, keeping the stable name:
   ```bash
   git checkout -b promote/<plugin>-<version> <plugin>--v<version>
   git merge origin/stable      # keep "name": "dev-digest-ai-marketplace-stable" if marketplace.json conflicts
   git push -u origin promote/<plugin>-<version>   # PR base: stable
   ```
4. Merge after `validate` passes. Users on stable then run
   `claude plugin marketplace update dev-digest-ai-marketplace-stable` and
   `claude plugin update <plugin>@dev-digest-ai-marketplace-stable --scope project`.
