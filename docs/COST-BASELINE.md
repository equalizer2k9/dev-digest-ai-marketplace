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
