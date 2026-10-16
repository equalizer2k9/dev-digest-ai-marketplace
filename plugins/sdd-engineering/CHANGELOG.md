# Changelog — sdd-engineering

All notable changes to this plugin. Versions follow [SemVer](https://semver.org/); see
[docs/RELEASES.md](../../docs/RELEASES.md).

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
