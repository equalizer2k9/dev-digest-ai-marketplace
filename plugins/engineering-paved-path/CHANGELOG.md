# Changelog — engineering-paved-path

All notable changes to this plugin. Versions follow [SemVer](https://semver.org/); see
[docs/RELEASES.md](../../docs/RELEASES.md).

## 1.0.0 — 2026-10-16

Initial release, extracted from the DevDigest harness and de-personalised.

### Added

- Six stack skills: fastify-best-practices, drizzle-orm-patterns, postgresql-table-design, react-best-practices, react-testing-library, zod.

### Changed from the source

- `react-best-practices`: removed another project's stack assumptions (Tailwind, Axios, Vite `manualChunks`, `useApiQuery`, `components/ui/`).
- `zod`: removed references to absent `react-hook-form` / `orval` skills and the project-specific `evals/`; fixed the README file tree.
- `fastify-best-practices`: dropped the `tile.json` packaging file.
