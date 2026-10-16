#!/usr/bin/env bash
# Seeds the empty eval workspace with the todo-api fixture.
# Usage (from a case's scaffold script): scaffold.sh [spec] [plan]
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -R "$here/todo-api/." .
for part in "$@"; do
  mkdir -p specs/due-date
  cp "$here/due-date/$part.md" "specs/due-date/$part.md"
done
