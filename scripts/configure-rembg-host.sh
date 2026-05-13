#!/usr/bin/env bash
set -euo pipefail

label="com.codex.rembg-host"
port="${REMBG_PORT:-7001}"
plist_path="$HOME/Library/LaunchAgents/$label.plist"
venv_dir="${REMBG_VENV_DIR:-$HOME/.ai-closet/rembg/venv}"
curl_bin="${CURL_BIN:-/usr/bin/curl}"

listener_is_rembg() {
  local listener_pid command
  listener_pid="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -z "$listener_pid" ]; then
    return 1
  fi

  command="$(ps -p "$listener_pid" -o command= 2>/dev/null || true)"
  printf '%s\n' "$command" | grep -qi 'rembg'
}

if [ ! -f "$plist_path" ] || [ ! -x "$venv_dir/bin/rembg" ]; then
  exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/setup-rembg-host-macos.sh"
fi

if ! listener_is_rembg; then
  uid="$(id -u)"
  launchctl print "gui/$uid/$label" >/dev/null 2>&1 || launchctl bootstrap "gui/$uid" "$plist_path"
  launchctl enable "gui/$uid/$label" >/dev/null 2>&1 || true
  launchctl kickstart "gui/$uid/$label"
fi

deadline=$((SECONDS + 120))
while [ "$SECONDS" -lt "$deadline" ]; do
  status_code="$("$curl_bin" -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/api/remove" || true)"
  if listener_is_rembg && { [ "$status_code" = "405" ] || [ "$status_code" = "422" ]; }; then
    break
  fi
  sleep 1
done

if ! listener_is_rembg; then
  echo "rembg did not start listening on port $port" >&2
  exit 1
fi

status_code="$("$curl_bin" -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/api/remove" || true)"
if [ "$status_code" != "405" ] && [ "$status_code" != "422" ]; then
  echo "rembg is listening but /api/remove did not respond as expected (status $status_code)" >&2
  exit 1
fi

default_iface="$(route get default 2>/dev/null | awk '/interface:/{print $2; exit}')"
lan_ip=""
if [ -n "$default_iface" ]; then
  lan_ip="$(ipconfig getifaddr "$default_iface" 2>/dev/null || true)"
fi

echo "rembg configured on port $port"
lsof -nP -iTCP:"$port" -sTCP:LISTEN
if [ -n "$lan_ip" ]; then
  echo "LAN endpoint: http://$lan_ip:$port"
fi
