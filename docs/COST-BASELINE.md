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
