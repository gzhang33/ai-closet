#!/bin/zsh

set -euo pipefail

LOCAL_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
OLLAMA_CONTAINER_URL="${OLLAMA_CONTAINER_URL:-http://host.docker.internal:11434}"

echo "Checking localhost..."
curl -fsS http://127.0.0.1:11434/api/tags >/dev/null
echo "localhost_ok"

if [[ -n "$LOCAL_IP" ]]; then
  echo "Checking LAN IP: $LOCAL_IP..."
  curl -fsS "http://$LOCAL_IP:11434/api/tags" >/dev/null
  echo "lan_ip_ok"
else
  echo "Skipping LAN IP check because no en0/en1 address was found."
fi

echo "Checking Docker path: $OLLAMA_CONTAINER_URL..."
docker run --rm curlimages/curl:8.8.0 -fsS "$OLLAMA_CONTAINER_URL/api/tags" >/dev/null
echo "docker_host_internal_ok"

echo
echo "Listener summary:"
lsof -nP -iTCP:11434 -sTCP:LISTEN
