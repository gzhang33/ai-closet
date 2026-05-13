#!/usr/bin/env bash
set -euo pipefail

label="com.codex.rembg-host"
port="${REMBG_PORT:-7001}"
host_target="${REMBG_HOST_TARGET:-0.0.0.0}"
state_dir="${REMBG_STATE_DIR:-$HOME/.ai-closet/rembg}"
venv_dir="${REMBG_VENV_DIR:-$state_dir/venv}"
models_dir="${REMBG_MODELS_DIR:-$state_dir/models}"
logs_dir="${REMBG_LOG_DIR:-$state_dir/logs}"
plist_path="$HOME/Library/LaunchAgents/$label.plist"
curl_bin="${CURL_BIN:-/usr/bin/curl}"

find_python() {
  local candidate=""

  for candidate in \
    "${PYTHON_BIN:-}" \
    /opt/homebrew/bin/python3.12 \
    /opt/homebrew/bin/python3.11 \
    "$(command -v python3.12 2>/dev/null || true)" \
    "$(command -v python3.11 2>/dev/null || true)"
  do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
      if "$candidate" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)' 2>/dev/null; then
        printf '%s\n' "$candidate"
        return 0
      fi
    fi
  done

  return 1
}

ensure_port_available() {
  local listener_pid
  listener_pid="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -z "$listener_pid" ]; then
    return 0
  fi

  local command
  command="$(ps -p "$listener_pid" -o command= 2>/dev/null || true)"
  if printf '%s\n' "$command" | grep -qi 'rembg'; then
    return 0
  fi

  echo "Port $port is already in use by: $command" >&2
  exit 1
}

python_bin="$(find_python || true)"
if [ -z "$python_bin" ]; then
  echo "Python 3.11+ is required to install rembg. Install python3.11 or set PYTHON_BIN." >&2
  exit 1
fi

ensure_port_available

mkdir -p "$state_dir" "$models_dir" "$logs_dir" "$(dirname "$plist_path")"

if [ ! -d "$venv_dir" ]; then
  "$python_bin" -m venv "$venv_dir"
fi

"$venv_dir/bin/python" -m pip install --upgrade pip setuptools wheel
"$venv_dir/bin/python" -m pip install --upgrade "rembg[cpu,cli]"

cat >"$plist_path" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>$label</string>
    <key>ProgramArguments</key>
    <array>
      <string>$venv_dir/bin/rembg</string>
      <string>s</string>
      <string>--host</string>
      <string>$host_target</string>
      <string>--port</string>
      <string>$port</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
      <key>HOME</key>
      <string>$HOME</string>
      <key>PATH</key>
      <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
      <key>U2NET_HOME</key>
      <string>$models_dir</string>
      <key>OMP_NUM_THREADS</key>
      <string>4</string>
    </dict>
    <key>KeepAlive</key>
    <true/>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$logs_dir/rembg-host.out.log</string>
    <key>StandardErrorPath</key>
    <string>$logs_dir/rembg-host.err.log</string>
    <key>WorkingDirectory</key>
    <string>$state_dir</string>
  </dict>
</plist>
PLIST

uid="$(id -u)"
launchctl bootout "gui/$uid" "$plist_path" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$uid" "$plist_path"
launchctl enable "gui/$uid/$label" >/dev/null 2>&1 || true

deadline=$((SECONDS + 120))
while [ "$SECONDS" -lt "$deadline" ]; do
  status_code="$("$curl_bin" -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/api/remove" || true)"
  if [ "$status_code" = "405" ] || [ "$status_code" = "422" ]; then
    break
  fi
  sleep 1
done

status_code="$("$curl_bin" -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/api/remove" || true)"
if [ "$status_code" != "405" ] && [ "$status_code" != "422" ]; then
  echo "rembg did not become ready on port $port" >&2
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
