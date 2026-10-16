# HW8 summary — dev-digest-ai-marketplace

The reusable part of the DevDigest Claude Code harness, extracted into a plugin marketplace.
It was released, installed in a separate project, updated, and rolled back. All dates are
2026-10-16, Claude Code 2.1.301.

## What was built

**Four plugins**, with the dependency graph declared in `plugin.json` and resolved by the installer:

```
sdd-engineering ──┬─► engineering-paved-path      (skills: fastify, drizzle, postgresql, react, rtl, zod)
                  ├─► research-tools              (agent: researcher)
                  └─► architecture-review ──► engineering-paved-path
                                                  (agent: architecture-reviewer)
sdd-engineering: agents spec-creator, implementation-planner, implementer, plan-verifier;
                 skills run-plan, workflow-retro, engineering-insights
```

**Catalog:** <https://equalizer2k9.github.io/dev-digest-ai-marketplace/>.

- Static React + Vite site with MiniSearch search and sanitized Markdown.
- Data is generated from the manifests by `scripts/build-index.mjs`.
- Deployed by `pages.yml` on every push to `main` and on every release tag.

**Releases and tags:**

| Tag | Commit | Evidence |
|---|---|---|
| `engineering-paved-path--v1.0.0` | `2349d7e` | [releases/1.0.0.md](releases/1.0.0.md) |
| `research-tools--v1.0.0` | `2349d7e` | 〃 |
| `architecture-review--v1.0.0` | `2349d7e` | 〃 |
| `sdd-engineering--v1.0.0` | `2349d7e` | 〃 |
| `sdd-engineering--v1.1.0` | `2102ece` | [releases/1.1.0.md](releases/1.1.0.md) |

**Stable channel:**

- Branch `stable` is `2349d7e` plus a commit that renames the marketplace to
  `dev-digest-ai-marketplace-stable`.
- A ruleset protects it.
- Users add it with `claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace#stable`.
- Rollback and promotion procedures: [RELEASES.md](RELEASES.md#rollback).

**Consumer project:** [equalizer2k9/bookmarks-api](https://github.com/equalizer2k9/bookmarks-api)
(Fastify 5 + Zod + TypeScript on Node 24).

## Acceptance criteria → evidence

| Criterion | Evidence |
|---|---|
| 1.0.0 ships no DevDigest files | [PR #2](https://github.com/equalizer2k9/dev-digest-ai-marketplace/pull/2): de-personalisation table. A grep of components for `DevDigest`, `server/`, `client/`, `reviewer-core`, `vendor/shared`, `docs/hw` is empty; remaining mentions are provenance lines in README/CHANGELOG. CI blocks absolute paths and secrets in `plugins/` |
| Dependencies with no errors in `claude plugin list --json` | [bookmarks-api PR #1](https://github.com/equalizer2k9/bookmarks-api/pull/1): the installer added 3 dependencies itself, all `1.0.0-2349d7e28a33`, enabled, 0 dependency-error lines. The same holds after the update ([#3](https://github.com/equalizer2k9/bookmarks-api/pull/3)) and in the rollback ([#4](https://github.com/equalizer2k9/bookmarks-api/pull/4)) |
| Catalog UI shows the current plugins and versions | Live site: 4 plugins; `sdd-engineering` 1.1.0; What's new lists 4 × 1.0.0 + 1.1.0 with tags. [PR #4](https://github.com/equalizer2k9/dev-digest-ai-marketplace/pull/4) adds the catalog, with a unit test that checks versions and dependencies against `plugin.json` |
| trace / init confirms the version | `system/init` plugin paths `…/sdd-engineering/1.0.0`, `…/1.1.0` and `…-stable/sdd-engineering/1.0.0` in [evidence 1.0.0](https://github.com/equalizer2k9/bookmarks-api/blob/main/docs/evidence/sdd-engineering-1.0.0.md), [evidence 1.1.0](https://github.com/equalizer2k9/bookmarks-api/blob/main/docs/evidence/sdd-engineering-1.1.0.md) and [rollback rehearsal](https://github.com/equalizer2k9/bookmarks-api/blob/main/docs/evidence/rollback-rehearsal.md) |
| 1.1.0 passes its eval | New case `spec-requires-ac`: 1.0.0 **0/1**, 1.1.0 **2/2**. Regressions 3/3 green. [PR #8](https://github.com/equalizer2k9/dev-digest-ai-marketplace/pull/8), [releases/1.1.0.md](releases/1.1.0.md) |
| Cost per successful workflow, before / after | $0.404 → $0.377 (−6.7 %), verdict **not confirmed, within noise**. [COST-BASELINE.md](COST-BASELINE.md#sdd-engineering-prompt-dedup-100-pre-release), [PR #5](https://github.com/equalizer2k9/dev-digest-ai-marketplace/pull/5) |
| Stable brings back 1.0.0, smoke green | Switch 34 s, init `…-stable/sdd-engineering/1.0.0`, clean headless smoke shows 1.0.0 behaviour, back to latest in 11 s. [bookmarks-api PR #4](https://github.com/equalizer2k9/bookmarks-api/pull/4), [PR #10](https://github.com/equalizer2k9/dev-digest-ai-marketplace/pull/10), [PR #11](https://github.com/equalizer2k9/dev-digest-ai-marketplace/pull/11) |

The full SDD workflow in the consumer project produced:

- an approved spec;
- a plan with 30/30 AC traced;
- an implementation with 39/39 tests and a green typecheck;
- an architecture review against `CLAUDE.md`;
- 30/30 AC PASS from plan-verifier;
- a manual retro.

See [bookmarks-api PR #2](https://github.com/equalizer2k9/bookmarks-api/pull/2) and the
[evidence](https://github.com/equalizer2k9/bookmarks-api/blob/main/docs/evidence/sdd-engineering-1.0.0.md).

## Cost

**Prompt-dedup experiment** ([COST-BASELINE.md](COST-BASELINE.md)): baseline at `e80889f`,
`claude-opus-5-5`, 3 runs per case.

- **Result:** cost per successful workflow $0.404 → $0.377. Both medians moved by less than the
  baseline spread, so the verdict is *not confirmed — within noise*.
- **Why:** the duplicates removed were ≈125–162 prompt tokens per run, under 0.3 % of a run.
- **Where the tokens go:** session context re-read from cache. A plan run reads ≈80k tokens from
  cache, against ≈21k cache-write and ≈9.6k output.

**Spend on the homework** (list-price estimates from each run's result record):

| Step | Cost |
|---|---|
| Behavior evals, incl. $1.38 of runs invalidated by the dependency finding | $4.47 |
| Cost experiment (baseline + after) | $4.29 |
| Release fix (spec-creator) | $1.23 |
| SDD workflow in bookmarks-api | $4.28 |
| sdd-engineering 1.1.0 | $2.23 |
| Rollback rehearsal | $1.28 |
| **Total** | **$17.79** |

## Findings

1. **An eval run from a plugin's own directory silently disables a plugin with `dependencies`.**
   The dependency is not loaded, and the "plugin under test" line still prints. The fix is to run
   from the repository root with `--eval-dir` and list the dependencies under `plugins:`, because
   the containment root must include them.
2. **`spec-creator` cited code as provenance** (`src/store.ts:1-5`) in 1 of 3 runs. It read code for
   context and treated the file as a "data source". Fixed with "read code, never cite it": 2/3 → 3/3.
3. **`implementation-planner` is not picked up by a natural "plan the implementation of …".** The
   main session planned inline, without traceability. Naming the agent works. Open as a known issue.
4. **Headless sessions that commit add `Co-Authored-By: Claude …`.** This is Claude Code's default
   commit attribution, not the plugin's. Check the trailers before every push.
5. **A behaviour smoke can leak through artifacts of the newer version.** On stable 1.0.0,
   spec-creator copied the format of a spec that 1.1.0 had written in the same repository. Version
   proof is the init path and the loaded prompt; behaviour checks need a tree without newer
   artifacts.
6. **Two channels need two marketplace `name`s.** One user can't register the same name twice. Our
   first rollback doc reused the name with `ref: stable` and had to be corrected.
7. **Stable pins the consumer, not its dependencies.** Plugins come from the `stable` branch, but
   dependency ranges (`^1.0.0`) resolve to the highest matching tag, so a later compatible
   dependency release reaches stable too.

## Known issues and not done

**Known issues:**

- `implementation-planner`:
  - not triggered by natural phrasing;
  - can write the absolute repository path into `Verify`.
- `claude plugin eval <installed plugin>` can't load our cases: `plugins:` paths assume the repo
  layout.
- `run-plan-not-auto` only re-checks the `disable-model-invocation` flag.
- No behaviour evals for `engineering-paved-path` and `research-tools`.
- Claude Code ≥ 2.1.110 is declared but not tested below 2.1.301.
- Install was tested on Linux only.
- No security gate in `run-plan`.
- A browser that already opened the catalog can show stale data for up to 10 minutes after a deploy.
- The bookmark-tags feature has an accepted architecture WARNING: duplicate tag normalisation in
  route and service.

**Not done:**

- Agent Performance Dashboard (per-agent cost and latency trends from evals and retros).
- sdd-engineering 1.1.1 for the two planner issues.
- Evals in CI (they are paid and need credentials).
