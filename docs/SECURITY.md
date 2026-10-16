# Security

Plugins run with the user's permissions: hooks and MCP servers execute code, skills and agents steer
what Claude runs. Treat every change in `plugins/` as code that runs on someone else's machine.

## Forbidden

- Secrets of any kind in the repository: tokens, API keys, passwords, private keys, `.env` files,
  credentials in URLs or headers. Use `userConfig` with `"sensitive": true` (stored in the OS credential
  store) or the user's environment.
- Absolute paths and user names (`/Users/…`, `/home/…`, `C:\…`).
- Network calls from hooks or scripts that aren't documented in the plugin README.
- Downloading and executing code at run time (`curl … | sh`, `npx <unpinned>`, remote scripts).
- Hooks that silently change permissions, settings, git config, or files outside the project.
- Prompt text that tells the agent to skip permission prompts, disable hooks, or exfiltrate data.
- A top-level `bin/` directory.
- `command`-source or `headersHelper` entries in `marketplace.json`.

CI (`.github/workflows/validate.yml`) blocks obvious absolute paths and known secret formats in
`plugins/`. It is a safety net, not a review.

## Reviewing scripts and hooks

Every PR that adds or changes `hooks/`, `scripts/`, `.mcp.json`, `.lsp.json` or `monitors/`:

1. Read every line. No minified or generated code.
2. List what it executes, reads, writes and sends over the network; put that list in the PR description
   and the plugin README.
3. Check variable quoting (`"${CLAUDE_PLUGIN_ROOT}"`) and that input from tool payloads isn't passed to
   a shell unescaped.
4. Pin every external tool or package version; no `latest`.
5. Check hook matchers are as narrow as possible (specific tools, not `*`).
6. Run the plugin locally with `claude --plugin-dir plugins/<name>` and observe the hook firing.

Secrets reaching a prompt: skills must not ask the agent to print environment variables, credential
files or `userConfig` sensitive values.

## After a dangerous release

If a released version leaks a secret, runs harmful code, or exposes data:

1. **Stop distribution.** Revert the offending change on `main` with a PR (or remove the entry and map
   its name to `null` under `renames`), and bump `version` so auto-update moves users off it.
2. **Rotate** any leaked secret immediately. Removing it from git does not un-leak it — history, forks
   and users' plugin caches keep it.
3. **Pin users to a safe version.** Point users and admins at the stable ref procedure in
   [RELEASES.md](RELEASES.md#rollback) (marketplace pinned to a ref/SHA).
4. **Notify** users: open a GitHub issue / security advisory with the affected versions, what ran,
   and what to do (`claude plugin update <plugin>@dev-digest-ai-marketplace`, or
   `claude plugin uninstall <plugin>@dev-digest-ai-marketplace`).
5. **Do not delete or move release tags** of other plugins; leave the bad tag in place and document it
   as affected, so dependency ranges stay reproducible.
6. Write a short post-mortem in the PR that fixes it.

## Reporting

Report vulnerabilities privately through GitHub Security Advisories on this repository, not public issues.
