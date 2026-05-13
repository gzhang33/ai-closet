#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

exec docker compose -f "$root_dir/docker/compose.dev.yml" down --remove-orphans "$@"
