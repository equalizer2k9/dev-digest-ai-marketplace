# dev-digest-ai-marketplace

A [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugins/create-marketplace) with the
reusable part of the [DevDigest](https://github.com/equalizer2k9/dev-digest) AI harness: spec-driven
workflow agents (spec → plan → implement → verify), engineering-insight logging, and technical skills.

**HW8 summary:** [docs/HW8-SUMMARY.md](docs/HW8-SUMMARY.md) — what was built, acceptance evidence, cost, findings.

**Catalog:** <https://equalizer2k9.github.io/dev-digest-ai-marketplace/> — search plugins, skills
and agents, read their docs, copy the install command ([spec](docs/SITE-SPEC.md)).

Project-specific rules stay in DevDigest. Everything here must work in any repository — see
[docs/PLUGIN-GUIDELINES.md](docs/PLUGIN-GUIDELINES.md).

## Plugins

| Plugin | What it gives you | Depends on |
|---|---|---|
| [engineering-paved-path](plugins/engineering-paved-path/) | Stack skills: Fastify, Drizzle, PostgreSQL table design, React, React Testing Library, Zod | — |
| [research-tools](plugins/research-tools/) | Read-only `researcher` agent with file:line / URL evidence | — |
| [architecture-review](plugins/architecture-review/) | Read-only `architecture-reviewer` agent that judges against the project's own documented rules | engineering-paved-path |
| [sdd-engineering](plugins/sdd-engineering/) | Spec → plan → implement → review → verify pipeline, workflow retro, engineering insights | all three above |

Installing `sdd-engineering` installs the other three as dependencies.

## Layout

```text
.claude-plugin/marketplace.json   # the catalog: name, owner, plugins[]
plugins/<plugin-name>/            # one directory per plugin (relative-path source)
docs/                             # guidelines, security, releases, cost baseline
.github/workflows/validate.yml    # CI: claude plugin validate --strict + path/secret checks
scripts/build-index.mjs           # catalog data from the manifests (no dependencies)
site/                             # catalog site: React + Vite, deployed by .github/workflows/pages.yml
```

## Add the marketplace

In a Claude Code session:

```text
/plugin marketplace add equalizer2k9/dev-digest-ai-marketplace
```

Or from your shell:

```bash
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace
```

To share it with everyone working in a repository, run this once in that repository and commit the
`.claude/settings.json` it writes. Teammates get the marketplace after they trust the folder:

```bash
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace --scope project
```

To stay on a fixed branch or tag of the catalog, append `#<ref>`:

```bash
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace#<tag-or-branch>
```

## Install a plugin

```bash
claude plugin install <plugin>@dev-digest-ai-marketplace                  # user scope (default)
claude plugin install <plugin>@dev-digest-ai-marketplace --scope project  # .claude/settings.json
claude plugin install <plugin>@dev-digest-ai-marketplace --scope local    # .claude/settings.local.json
```

In a session, `/plugin install <plugin>@dev-digest-ai-marketplace` opens the plugin's details, where you
choose the scope. Plugin skills and agents are namespaced: `/<plugin>:<skill>`, `<plugin>:<agent>`.

Project scope writes `enabledPlugins` to the committed `.claude/settings.json`. That turns the plugin on
for collaborators but doesn't download it; each collaborator runs the same install command once.

## Updates

Auto-update is **off** by default for third-party marketplaces, including this one. Turn it on per user in
`/plugin` → **Marketplaces** → **Enable auto-update**, or update manually:

```bash
claude plugin marketplace update dev-digest-ai-marketplace   # refresh the catalog only
claude plugin update <plugin>@dev-digest-ai-marketplace      # update one installed plugin
```

`claude plugin marketplace update` refreshes the listing but leaves installed plugins at their current
version. Run `/reload-plugins` (or restart) to load an update in an open session.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [docs/SECURITY.md](docs/SECURITY.md) and
[docs/RELEASES.md](docs/RELEASES.md).
