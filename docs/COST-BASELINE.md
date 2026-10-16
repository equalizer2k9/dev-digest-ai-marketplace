# Cost baseline

Context cost of each plugin, so a change that bloats always-on context shows up in review.
Measure with `claude plugin details <plugin>` after installing the version being released, or
without installing: `claude --plugin-dir ./plugins/<plugin> plugin details <plugin>`. Claude Code 2.1.301.

| Plugin | Version | Date | Always-on tokens | Largest component (tokens) | Skills | Agents | Commands | Hooks | MCP servers | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| engineering-paved-path | 1.0.0 | 2026-10-16 | ~789 | react-testing-library (~7.6k on invoke) | 6 | 0 | 0 | 0 | 0 | always-on = skill descriptions; fastify ~250 is the largest |
| research-tools | 1.0.0 | 2026-10-16 | ~144 | researcher (~1k on invoke) | 0 | 1 | 0 | 0 | 0 | |
| architecture-review | 1.0.0 | 2026-10-16 | ~159 | architecture-reviewer (~1.6k on invoke) | 0 | 1 | 0 | 0 | 0 | + engineering-paved-path as dependency |
| sdd-engineering | 1.0.0 | 2026-10-16 | ~904 | run-plan (~2.7k on invoke) | 3 | 4 | 0 | 0 | 0 | + all three dependencies; full set ≈ 2.0k always-on |

## Eval run, 1.0.0-pre

Behavior evals (`claude plugin eval`) on the plugin code of commit `5444a28` (no plugin changes since;
suite from `feat/evals-v1`). Claude Code 2.1.301 · agent model `claude-opus-5-5` (default; the
plugins' sonnet agents run on `claude-sonnet-5-5`) · `--runs 2` · run from the repo root with
`--eval-dir` so dependencies load. Cost is the list-price estimate from `aggregate-result.json`;
tokens are from each run's `trace.jsonl` result record (`aggregate-result.json` has no token
fields) — fresh input (input + cache write) / cache read / output, averaged per run.

| Case | Plugin | Score with | Score without | Δ | Cost / run (with) | Tokens / run (with) | Duration / run (with) |
|---|---|---|---|---|---|---|---|
| spec-due-date | sdd-engineering | 1.00 | 0.33 | +0.67 | $0.29 | 19.8k / 44.5k / 7.7k | 76 s |
| negative-unrelated | sdd-engineering | 1.00 | 1.00 | 0.00 | $0.07 | 6.9k / 5.9k / 0.4k | 6 s |
| plan-from-spec | sdd-engineering | 1.00 | — | — | $0.38 | 25.6k / 79.5k / 9.6k | 86 s |
| run-plan-not-auto | sdd-engineering | 1.00 | — | — | $0.21 | 27.1k / 118.9k / 4.7k | 52 s |
| deps-available | sdd-engineering | 1.00 | — | — | $0.06 | 7.0k / 5.9k / 0.03k | 2 s |
| rule-violation | architecture-review | 1.00 | — | — | $0.11 | 12.9k / 52.7k / 2.1k | 27 s |
| no-rules | architecture-review | 1.00 | — | — | $0.11 | 13.0k / 61.8k / 2.2k | 30 s |

Without-arm (baseline) cost per run: spec-due-date $0.14 (8.5k / 40.2k / 3.1k, 33 s),
negative-unrelated $0.05. Suite totals: sdd-engineering $1.08 (ablation cases) + $1.30 (single-arm
cases), architecture-review $0.48 + $0.23 (re-run of `no-rules` after a grader fix) = **$3.09**.

## sdd-engineering: prompt dedup (1.0.0, pre-release)

### Baseline

- Plugin code: `main` at `e80889f`.
- Agent under test: `claude-opus-5-5` (pinned with `--model`). Agents with `model: opus`
  (`spec-creator`, `implementation-planner`) also ran on `claude-opus-5-5`; no `model: sonnet` agent
  is dispatched in these three cases (`claude-sonnet-5-5` would be used for `implementer`).
- Claude Code 2.1.301, 3 runs per case, single arm. Suite cost $2.21.

| Case | Pass | Median cost | Cost range | Median latency | Latency range | Median tokens in / out / cache read / cache write | Median API calls | Median tool calls | Critical errors |
|---|---|---|---|---|---|---|---|---|---|
| spec-due-date | 2/3 | $0.294 | $0.284–0.353 | 81 s | 72–99 s | 12 / 8.0k / 46.6k / 20.2k | 9 | 15 | none |
| plan-from-spec | 3/3 | $0.352 | $0.348–0.387 | 87 s | 85–89 s | 16 / 9.3k / 80.3k / 20.9k | 11 | 22 | none |
| negative-unrelated | 3/3 | $0.066 | $0.065–0.066 | 6 s | 6–7 s | 2 / 0.5k / 5.9k / 6.9k | 1 | 0 | none |

The failed `spec-due-date` run broke `no-implementation-detail`: `spec-creator` cited
`src/store.ts:…` lines in the spec despite its "no file paths" rule — a quality failure, not a crash.

**Cost per successful workflow** (sum of spec + plan run costs / runs that passed): $2.018 / 5 = **$0.404**.

### Change

Moved text, not behaviour. Model, tools and routing are unchanged.

| What was duplicated or rarely needed | Where it already was | Size |
|---|---|---|
| `spec-creator` — spec-path precedence (request > project instructions > default) | `CONVENTIONS.md` §2 | ≈46 tok → one line |
| `implementation-planner` — default plan path | `CONVENTIONS.md` §2 | ≈12 tok |
| `implementation-planner` — "no check command → stop" paragraph | `CONVENTIONS.md` §3 | ≈44 tok |
| `implementation-planner` — `BLOCKED` report formats (only on an unplannable spec) | — | ≈39 tok → `references/blocked.md`, read on demand |
| `implementation-planner` — never-touch rule repeated in Rules | its own Risks section + `CONVENTIONS.md` §4 | ≈18 tok |
| `CONVENTIONS.md` §5 pipeline diagram, read by every agent | plugin README | ≈162 tok → 3-line naming rule |

Measured by file size (chars / 4): `spec-creator` 1607 → 1578 tok, `implementation-planner`
1339 → 1273, `CONVENTIONS.md` 745 → 648. Per run that is ≈125 fewer prompt tokens for a spec and
≈162 for a plan — under 0.3 % of the ~60–110k tokens a run processes. The spec template (~600 tok)
stays inline because every successful spec run needs it.

`claude plugin details sdd-engineering`, before → after: `spec-creator` on-invoke ~2.2k → ~2.1k,
`implementation-planner` ~1.8k → ~1.7k, always-on ~904 → ~904 (descriptions untouched).

### After

The same three cases run the same way on the changed plugin. Suite cost $2.08.

| Case | Pass | Median cost | Cost range | Median latency | Latency range | Median tokens in / out / cache read / cache write | Median API calls | Median tool calls | Critical errors |
|---|---|---|---|---|---|---|---|---|---|
| spec-due-date | 2/3 | $0.286 | $0.230–0.294 | 80 s | 56–92 s | 12 / 7.9k / 46.3k / 17.1k | 9 | 15 | none |
| plan-from-spec | 3/3 | $0.362 | $0.342–0.370 | 85 s | 78–97 s | 16 / 9.7k / 80.2k / 21.2k | 12 | 21 | none |
| negative-unrelated | 3/3 | $0.066 | $0.065–0.066 | 7 s | 7 s | 2 / 0.5k / 5.9k / 6.9k | 1 | 0 | none |

The failed `spec-due-date` run failed the same grader for the same reason (`src/`, `store.ts` in
the spec).

**Cost per successful workflow:** $1.885 / 5 = **$0.377**.

### Verdict — not confirmed (within noise)

- **Quality gate: not met — before or after.** `spec-due-date` passes 2/3 in both runs. The
  failure is pre-existing and the same in both, so the change introduced no new failure; but the
  suite isn't all green, so the optimisation can't be counted.
- **Cost:** spec median −$0.008 and plan median +$0.010, both inside the baseline spread ($0.069
  and $0.039). Cost per successful workflow $0.404 → $0.377 (**−6.7 %**). That gap comes mainly
  from one cheap after-run ($0.230) and is smaller than the run-to-run spread.
- **Latency:** spec −1 s against a 27 s spread; plan −2 s against a 4 s spread — within noise.
- **Expectation:** the change removes ≈125–162 prompt tokens per run (<0.3 %), so it can't move cost
  measurably at this sample size.

The edit is kept as a maintenance change: each rule now lives in one place. It is not claimed as a
cost win. The real quality issue it surfaced — `spec-creator` sometimes citing file paths — is a
separate behaviour fix for a later change.

### Method

```bash
claude plugin eval . --eval-dir plugins/sdd-engineering/evals --tag write --runs 3 --ablation none \
  --model claude-opus-5-5 --allow-tools Write --scaffold --trust-plugin --keep-temp --no-publish \
  --max-cost-usd 2.8 -j 3 --output-dir <dir>
```

Run from the repo root so dependencies load. `--tag write` selects exactly `spec-due-date`,
`plan-from-spec` and `negative-unrelated`.

Where each number comes from:

- **Pass, cost, latency:** per run, from `aggregate-result.json` (`passed`, `costUsd`,
  `durationSeconds`).
- **Tokens:** the `modelUsage` of the `result` record in each run's `trace.jsonl`, which covers
  subagents.
- **API calls:** distinct assistant message ids in the main trace plus the subagent transcripts
  (`config/projects/*/*/subagents/*.jsonl` in the kept temp dir).
- **Tool calls:** distinct `tool_use` ids in the same files.

n = 3 per case is a small sample: medians and min–max ranges are reported, and a difference
smaller than the baseline range is treated as noise.
