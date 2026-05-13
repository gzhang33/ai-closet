#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
runtime_env_file="${TMPDIR:-/tmp}/ai-closet.compose.runtime.env"
host_ip="${HOST_LAN_IP:-$("$root_dir/scripts/resolve-host-lan-ip.sh" 2>/dev/null || true)}"

export EXPO_PORT="${EXPO_PORT:-8082}"
export REMBG_PORT="${REMBG_PORT:-7001}"
export EXPO_PUBLIC_BACKGROUND_REMOVAL_PROVIDER="${EXPO_PUBLIC_BACKGROUND_REMOVAL_PROVIDER:-rembg}"

if [ -z "$host_ip" ]; then
  echo "Unable to determine a LAN IP for this host. Set HOST_LAN_IP manually and retry." >&2
  exit 1
fi

export HOST_LAN_IP="$host_ip"
export REACT_NATIVE_PACKAGER_HOSTNAME="${REACT_NATIVE_PACKAGER_HOSTNAME:-$host_ip}"
export EXPO_PACKAGER_PROXY_URL="${EXPO_PACKAGER_PROXY_URL:-http://$host_ip:${EXPO_PORT}}"
export EXPO_PUBLIC_OLLAMA_BASE_URL="${EXPO_PUBLIC_OLLAMA_BASE_URL:-http://$host_ip:11434}"
export EXPO_PUBLIC_REMBG_BASE_URL="${EXPO_PUBLIC_REMBG_BASE_URL:-http://$host_ip:${REMBG_PORT}}"

if [ "${USE_REMBG_SIDECAR:-0}" = "1" ]; then
  export COMPOSE_PROFILES="${COMPOSE_PROFILES:+$COMPOSE_PROFILES,}rembg-sidecar"
fi

echo "Using HOST_LAN_IP=$HOST_LAN_IP"
echo "Using REACT_NATIVE_PACKAGER_HOSTNAME=$REACT_NATIVE_PACKAGER_HOSTNAME"
echo "Using EXPO_PACKAGER_PROXY_URL=$EXPO_PACKAGER_PROXY_URL"
echo "Using EXPO_PUBLIC_OLLAMA_BASE_URL=$EXPO_PUBLIC_OLLAMA_BASE_URL"
echo "Using EXPO_PUBLIC_REMBG_BASE_URL=$EXPO_PUBLIC_REMBG_BASE_URL"

"$root_dir/scripts/configure-ollama-host.sh"

if [ "$EXPO_PUBLIC_BACKGROUND_REMOVAL_PROVIDER" = "rembg" ] && [ "${USE_REMBG_SIDECAR:-0}" != "1" ]; then
  "$root_dir/scripts/configure-rembg-host.sh"
fi

cat >"$runtime_env_file" <<EOF
EXPO_PORT=$EXPO_PORT
HOST_LAN_IP=$HOST_LAN_IP
REACT_NATIVE_PACKAGER_HOSTNAME=$REACT_NATIVE_PACKAGER_HOSTNAME
EXPO_PACKAGER_PROXY_URL=$EXPO_PACKAGER_PROXY_URL
REMBG_PORT=$REMBG_PORT
EXPO_PUBLIC_OLLAMA_BASE_URL=$EXPO_PUBLIC_OLLAMA_BASE_URL
EXPO_PUBLIC_REMBG_BASE_URL=$EXPO_PUBLIC_REMBG_BASE_URL
EXPO_PUBLIC_BACKGROUND_REMOVAL_PROVIDER=$EXPO_PUBLIC_BACKGROUND_REMOVAL_PROVIDER
COMPOSE_PROFILES=${COMPOSE_PROFILES:-}
EOF

exec docker compose \
  --env-file "$runtime_env_file" \
  -f "$root_dir/docker/compose.dev.yml" \
  up "$@"
