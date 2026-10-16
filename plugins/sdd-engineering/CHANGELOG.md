# Changelog — sdd-engineering

All notable changes to this plugin. Versions follow [SemVer](https://semver.org/); see
[docs/RELEASES.md](../../docs/RELEASES.md).

## 1.1.0 — 2026-10-16

Backward compatible: specs that already trace every requirement are unaffected; dependencies unchanged.

### Added

- `spec-creator` requirement coverage gate: user stories and non-functional requirements are numbered (`US-n`, `NFR-n`), every AC names the requirements it covers (`AC-9 (NFR-1)`), and a requirement no verifiable AC can cover is listed under Open questions as `requirement without AC` — the spec stays `draft` and is reported as not ready for planning. New self-check line.
- Eval case `spec-requires-ac` ("search should be fast" next to functional requirements): fails on 1.0.0, passes on 1.1.0.

### Known issues

- `implementation-planner` is not picked up by a natural "plan the implementation of …" request — the main session plans inline. Name the agent explicitly (`Use sdd-engineering:implementation-planner on …`).
- `implementation-planner` can write the absolute repository path into a task's `Verify` line.

## 1.0.0 — 2026-10-16

Initial release, extracted from the DevDigest harness and de-personalised.

### Added

- Agents `spec-creator`, `implementation-planner`, `implementer`, `plan-verifier`; skills `run-plan`, `workflow-retro`, `engineering-insights`; shared `CONVENTIONS.md`.

### Changed from the source

- `run-plan` converted from a command to a user-invoked skill (`disable-model-invocation: true`) with `report-template.md` beside it; review gate is `architecture-review:architecture-reviewer`; no security gate.
- `engineering-insights` shipped as a skill only; the command wrapper's argument handling moved into the skill.
- `workflow-retro` runs `scripts/collect.mjs` via `${CLAUDE_SKILL_DIR}`; ledger path is an argument with default `docs/retros/ledger.md`.
- Artifact paths default to `specs/<feature>/{spec,plan,verification}.md`; check commands come from project instructions or `package.json`, otherwise the agents stop.
- `implementer` picks `engineering-paved-path` skills by the stack of the files it changes.
- Moved duplicated agent instructions to the shared `CONVENTIONS.md` and the planner's rarely used `BLOCKED` report formats to `references/blocked.md`; the pipeline diagram lives only in the README. No behaviour change.
- `spec-creator`: may read code to understand current behaviour but never cites it — no file paths, `file:line` or code identifiers in a spec, with a "not this / this" example and a self-check line.
