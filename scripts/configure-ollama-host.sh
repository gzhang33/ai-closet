#!/usr/bin/env bash
set -euo pipefail

target_host="${OLLAMA_HOST_TARGET:-0.0.0.0:11434}"
ollama_app_path="${OLLAMA_APP_PATH:-/Applications/Ollama.app}"
ollama_listener_pattern="/Applications/Ollama.app/Contents/Resources/ollama serve"

if ! command -v ollama >/dev/null 2>&1; then
  echo "ollama is not installed or not on PATH" >&2
  exit 1
fi

launchctl setenv OLLAMA_HOST "$target_host"

if pgrep -f "$ollama_listener_pattern" >/dev/null 2>&1; then
  osascript -e 'quit app "Ollama"' >/dev/null 2>&1 || true
  sleep 2
  pkill -f "$ollama_listener_pattern" >/dev/null 2>&1 || true
fi

if [ -d "$ollama_app_path" ]; then
  open -a "$ollama_app_path"
else
  nohup env OLLAMA_HOST="$target_host" ollama serve >/tmp/ollama-serve.log 2>&1 &
fi

deadline=$((SECONDS + 120))

while [ "$SECONDS" -lt "$deadline" ]; do
  if lsof -nP -iTCP:11434 -sTCP:LISTEN 2>/dev/null | awk 'NR > 1 { print $9 }' | grep -Eq '(^|[:*])11434$'; then
    break
  fi
  sleep 1
done

listener_output="$(lsof -nP -iTCP:11434 -sTCP:LISTEN 2>/dev/null || true)"

if [ -z "$listener_output" ]; then
  echo "ollama did not start listening on port 11434" >&2
  exit 1
fi

if ! printf '%s\n' "$listener_output" | awk 'NR > 1 { print $9 }' | grep -Eq '(^\*:11434$|^0\.0\.0\.0:11434$|^\[::\]:11434$)'; then
  echo "ollama is listening, but not on all interfaces yet:" >&2
  printf '%s\n' "$listener_output" >&2
  exit 1
fi

curl -fsS "http://127.0.0.1:11434/api/tags" >/dev/null

default_iface="$(route get default 2>/dev/null | awk '/interface:/{print $2; exit}')"
lan_ip=""
if [ -n "$default_iface" ]; then
  lan_ip="$(ipconfig getifaddr "$default_iface" 2>/dev/null || true)"
fi

echo "OLLAMA_HOST configured to $target_host"
printf '%s\n' "$listener_output"
if [ -n "$lan_ip" ]; then
  echo "LAN endpoint: http://$lan_ip:11434"
fi
