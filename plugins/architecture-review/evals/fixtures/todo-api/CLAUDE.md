# todo-api

- Specs and plans live in `specs/<feature>/` as `spec.md` and `plan.md`.
- Before finishing, run `npm test` and `npm run typecheck`.
- Only `src/store.ts` may touch the `todos` array; every other module calls its exported functions.
- No runtime dependencies; tests use `node:test`.
