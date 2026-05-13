#!/usr/bin/env bash
set -euo pipefail

if [ -n "${HOST_LAN_IP:-}" ]; then
  printf '%s\n' "$HOST_LAN_IP"
  exit 0
fi

default_iface="$(route get default 2>/dev/null | awk '/interface:/{print $2; exit}')"

if [ -z "$default_iface" ]; then
  exit 1
fi

ipconfig getifaddr "$default_iface" 2>/dev/null
