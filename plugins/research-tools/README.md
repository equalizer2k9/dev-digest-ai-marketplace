# research-tools

A read-only `researcher` agent that answers a question with evidence before anyone plans: how the
code in this repository works today (`file:line`), or what official sources say about a library,
API or standard (URL + quoted sentence). It reports findings, evidence and what it could not find —
no advice, no design.

## Use case

Before writing a spec or plan, you need facts you can trust: "how is auth wired today?", "does
library X support Y in the version we pin?". The researcher returns findings marked `confirmed` or
`inferred`, each with evidence, and a "Not found" list instead of guesses.

## Components

| Component | Type | Tools |
|---|---|---|
| `research-tools:researcher` | agent (sonnet, 30 turns) | Read, Grep, Glob, WebSearch, WebFetch — read-only, no shell |

## Requirements

- Claude Code ≥ 2.1.110 — see [COMPATIBILITY.md](COMPATIBILITY.md).
- **Network:** external research uses WebSearch / WebFetch. Repo research works offline.
- No MCP servers, hooks or credentials.

## Install

```bash
claude plugin marketplace add equalizer2k9/dev-digest-ai-marketplace

claude plugin install research-tools@dev-digest-ai-marketplace                  # user scope
claude plugin install research-tools@dev-digest-ai-marketplace --scope project  # this repository
```

## Quick start

```text
Use research-tools:researcher: how are background jobs scheduled in this repo, and does the
queue library we pin support delayed retries?
```

## Verification

```bash
claude plugin details research-tools   # Agents (1) researcher
```

In a session, `/agents` lists `research-tools:researcher`.

## Support

Owner: [@equalizer2k9](https://github.com/equalizer2k9). Issues:
<https://github.com/equalizer2k9/dev-digest-ai-marketplace/issues>.
