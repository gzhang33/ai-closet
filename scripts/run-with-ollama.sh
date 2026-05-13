#!/bin/zsh

set -euo pipefail

cd "$(dirname "$0")/.."

if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "Ollama is not reachable on localhost:11434. Run ./scripts/setup-ollama-host-macos.sh first." >&2
  exit 1
fi

if ! ollama list | rg -q '^qwen3-vl:4b\b'; then
  echo "Model qwen3-vl:4b is missing. Run: ollama pull qwen3-vl:4b" >&2
  exit 1
fi

exec npm start
