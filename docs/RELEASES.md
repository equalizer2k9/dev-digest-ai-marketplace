# Releases

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

## Rollback

Claude Code has no rollback command. A marketplace serves one version of each plugin at a time, so
rollback means pointing users at a known-good ref.

**Stable channel.** Keep a `stable` branch (or use a release tag) of this repository that only moves to
commits that were released and verified. Users who need stability add the marketplace pinned to it:

```bash
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace#stable
```

or, for a repository/team, in `.claude/settings.json` (or managed settings):

```json
{
  "extraKnownMarketplaces": {
    "dev-digest-ai-marketplace": {
      "source": { "source": "github", "repo": "equalizer2k9/dev-digest-ai-marketplace", "ref": "stable" }
    }
  }
}
```

To roll back, move `stable` back to the last good commit by a reviewed PR/force-update of that branch;
users then run `claude plugin marketplace update dev-digest-ai-marketplace` and
`claude plugin update <plugin>@dev-digest-ai-marketplace`. The plugin version on `stable` must differ
from the bad one, or the update is not detected — so the fix-forward path is usually better:

**Fix forward on `main`.** Revert the bad change in a PR, bump `version` (PATCH), merge, tag. Everyone on
`main` with auto-update or a manual update moves to the fixed version.

**Pinning a single plugin.** A marketplace entry with a `github`, `url` or `git-subdir` source can pin
`ref` and a full 40-character `sha`; relative-path entries (used here) follow the marketplace ref. A
dependent plugin can hold a dependency at a version with an exact range (`"=1.2.0"`).
