#!/usr/bin/env bash
# Seed the workspace: todo-api fixture + specs/due-date/{spec,plan}.md.
set -euo pipefail
exec bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../fixtures/scaffold.sh" spec plan
