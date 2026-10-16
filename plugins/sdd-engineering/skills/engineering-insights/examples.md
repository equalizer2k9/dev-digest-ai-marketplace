# Examples — noise vs insight

Shape illustrations, one pair per section, for an imaginary repository with an `api/` package, a
`web/` package and browser tests in `e2e/`. Paths and commands are invented — copy the shape, not
the facts.

## What Works

❌ `- Used the other script and it worked`

✅
```markdown
- **2026-09-17** · To run e2e flows, ALWAYS use `./scripts/e2e.sh` (hermetic DB), not the test runner against the dev DB
  - Why: on a normal dev DB the flows follow the redirect to the FIRST project, not the seeded one
  - Evidence: `e2e/flows/02-*.json` · `./scripts/e2e.sh`
```

## What Doesn't Work

❌ `- Resetting the database didn't help`

✅
```markdown
- **2026-09-17** · NEVER delete the database volume to reset e2e state — use `./scripts/e2e.sh` instead
  - Why: the volume holds every imported dataset; the e2e script uses its own throwaway DB
  - Evidence: `docker-compose.yml` volume `app_pgdata`
```

## Codebase Patterns

❌ `- Translations are in JSON files`

✅
```markdown
- **2026-09-17** · New UI feature text → new `web/messages/en/<ns>.json`; no registration step
  - Why: `web/src/i18n/request.ts` auto-merges every `messages/en/*.json` namespace file
  - Evidence: `web/src/i18n/request.ts`
```

## Tool & Library Notes

❌ `- The browser test tool has some quirks`

✅
```markdown
- **2026-09-17** · In e2e flows, `wait --text` / `wait --url` ARE the assertions — do not add a separate check step after them
  - Why: the runner (version in `e2e/package.json`) exits non-zero on timeout, which already fails the flow
  - Evidence: `e2e/flows/01-*.json`
```

## Recurring Errors & Fixes

❌ `- Module not found error on startup, reinstalled stuff`

✅
```markdown
- **2026-09-17** · `Error [ERR_MODULE_NOT_FOUND]: Cannot find package` on `npm run dev` in api/
  - Cause: api imports the sibling `core/` package as RAW source; `core/node_modules` is missing
  - Fix: install dependencies inside `core/` with its own package manager
  - Evidence: `api/tsconfig.json` path alias to `../core/src`
```

## Session Notes

❌ `### 2026-09-17 — Worked on stuff, fixed some bugs, learned a lot`

✅
```markdown
### 2026-09-17 — Add review duration to detail page
- Done: duration shown in the page header; api + web contracts updated
- Added: Tool & Library Notes, What Doesn't Work
- Open: duration missing for records created before the change
```

## Open Questions

❌ `- Requests are probably slow because of the LLM`

✅
```markdown
- **2026-09-17** · Should flows 02/04/05 target the seeded project explicitly instead of relying on the first-project redirect?
  - Known: they pass only on the hermetic DB; on a dev DB with >1 project they open the wrong one
  - Matters because: flows cannot be run against a developer's own data
```
