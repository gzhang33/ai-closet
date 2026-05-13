#!/usr/bin/env bash
set -euo pipefail

port="${REMBG_PORT:-7001}"
default_iface="$(route get default 2>/dev/null | awk '/interface:/{print $2; exit}')"
local_ip=""
curl_bin="${CURL_BIN:-/usr/bin/curl}"

if [ -n "$default_iface" ]; then
  local_ip="$(ipconfig getifaddr "$default_iface" 2>/dev/null || true)"
fi

echo "Checking rembg localhost..."
status_code="$("$curl_bin" -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/api/remove" || true)"
[ "$status_code" = "405" ] || [ "$status_code" = "422" ]
echo "localhost_ok"

if [ -n "$local_ip" ]; then
  echo "Checking rembg LAN IP: $local_ip..."
  status_code="$("$curl_bin" -s -o /dev/null -w '%{http_code}' "http://$local_ip:$port/api/remove" || true)"
  [ "$status_code" = "405" ] || [ "$status_code" = "422" ]
  echo "lan_ip_ok"
else
  echo "Skipping LAN IP check because no default-interface address was found."
fi

echo "Checking Docker path: http://host.docker.internal:$port..."
docker run --rm curlimages/curl:8.12.1 /bin/sh -lc "
  code=\$(curl -s -o /dev/null -w '%{http_code}' 'http://host.docker.internal:$port/api/remove' || true)
  [ \"\$code\" = '405' ] || [ \"\$code\" = '422' ]
" >/dev/null
echo "docker_host_internal_ok"

echo
echo "Listener summary:"
lsof -nP -iTCP:"$port" -sTCP:LISTEN
