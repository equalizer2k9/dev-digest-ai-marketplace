# Changelog — architecture-review

All notable changes to this plugin. Versions follow [SemVer](https://semver.org/); see
[docs/RELEASES.md](../../docs/RELEASES.md).

## 1.0.0 — 2026-10-16

Initial release, extracted from the DevDigest harness and de-personalised.

### Added

- Agent `architecture-reviewer` (read-only).

### Changed from the source

- Replaced the fixed onion / file-placement / shared-copy checks with discovery of the project's own rules (`ARCHITECTURE.md`, `AGENTS.md` / `CLAUDE.md`, `docs/architecture*`, ADRs, project architecture skills).
- Reports "No documented architecture rules found" instead of inventing rules.
- Depends on `engineering-paved-path` `^1.0.0` for framework structural rules.
