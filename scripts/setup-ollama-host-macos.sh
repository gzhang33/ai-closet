#!/bin/zsh

set -euo pipefail

PLIST_PATH="/Users/apple/Library/LaunchAgents/com.codex.ollama-host.plist"
OLLAMA_BIN="/Applications/Ollama.app/Contents/Resources/ollama"
STDOUT_LOG="/Users/apple/Library/Logs/ollama-host.stdout.log"
STDERR_LOG="/Users/apple/Library/Logs/ollama-host.stderr.log"
USER_ID="$(id -u)"

if [[ ! -x "$OLLAMA_BIN" ]]; then
  echo "Ollama binary not found at $OLLAMA_BIN" >&2
  exit 1
fi

mkdir -p "$(dirname "$PLIST_PATH")" "$(dirname "$STDOUT_LOG")"

cat >"$PLIST_PATH" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.codex.ollama-host</string>
    <key>ProgramArguments</key>
    <array>
      <string>$OLLAMA_BIN</string>
      <string>serve</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
      <key>HOME</key>
      <string>/Users/apple</string>
      <key>OLLAMA_HOST</key>
      <string>0.0.0.0:11434</string>
      <key>OLLAMA_MODELS</key>
      <string>/Users/apple/.ollama/models</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/Users/apple</string>
    <key>StandardOutPath</key>
    <string>$STDOUT_LOG</string>
    <key>StandardErrorPath</key>
    <string>$STDERR_LOG</string>
  </dict>
</plist>
PLIST

launchctl bootout "gui/$USER_ID" "$PLIST_PATH" 2>/dev/null || true
pkill -f '/Applications/Ollama.app/Contents/MacOS/Ollama' || true
pkill -f '/Applications/Ollama.app/Contents/Resources/ollama serve' || true
sleep 2
launchctl bootstrap "gui/$USER_ID" "$PLIST_PATH"
launchctl kickstart -k "gui/$USER_ID/com.codex.ollama-host"
sleep 3

echo "Configured LaunchAgent:"
launchctl print "gui/$USER_ID/com.codex.ollama-host" | sed -n '1,40p'

echo
echo "Active listener:"
lsof -nP -iTCP:11434 -sTCP:LISTEN
