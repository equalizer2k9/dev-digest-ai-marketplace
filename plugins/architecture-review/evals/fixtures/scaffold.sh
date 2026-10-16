#!/usr/bin/env bash
# Seeds the empty eval workspace with a todo-api whose src/report.ts reads the `todos` array directly.
# Usage: scaffold.sh [no-rules]   — no-rules drops CLAUDE.md, so the project documents no architecture.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -R "$here/todo-api/." .
if [ "${1:-}" = "no-rules" ]; then rm -f CLAUDE.md; fi
