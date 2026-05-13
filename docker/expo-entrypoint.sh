#!/bin/sh
set -eu

cd /app

lock_hash="$(sha256sum package-lock.json | awk '{print $1}')"
current_hash=""

if [ -f node_modules/.package-lock.hash ]; then
  current_hash="$(cat node_modules/.package-lock.hash)"
fi

if [ ! -d node_modules ] || [ "$current_hash" != "$lock_hash" ]; then
  npm ci
  printf '%s' "$lock_hash" > node_modules/.package-lock.hash
fi

port="${EXPO_PORT:-8082}"

if [ -n "${HOST_LAN_IP:-}" ]; then
  export REACT_NATIVE_PACKAGER_HOSTNAME="${REACT_NATIVE_PACKAGER_HOSTNAME:-$HOST_LAN_IP}"
  export EXPO_PACKAGER_PROXY_URL="${EXPO_PACKAGER_PROXY_URL:-http://$HOST_LAN_IP:$port}"
  export EXPO_PUBLIC_OLLAMA_BASE_URL="${EXPO_PUBLIC_OLLAMA_BASE_URL:-http://$HOST_LAN_IP:11434}"
  export EXPO_PUBLIC_REMBG_BASE_URL="${EXPO_PUBLIC_REMBG_BASE_URL:-http://$HOST_LAN_IP:${REMBG_PORT:-7001}}"
fi

echo "Expo runtime host: ${REACT_NATIVE_PACKAGER_HOSTNAME:-unset}"
echo "Expo proxy URL: ${EXPO_PACKAGER_PROXY_URL:-unset}"
echo "Ollama base URL: ${EXPO_PUBLIC_OLLAMA_BASE_URL:-unset}"
echo "rembg base URL: ${EXPO_PUBLIC_REMBG_BASE_URL:-unset}"

exec npx expo start --host lan --port "$port" --clear
