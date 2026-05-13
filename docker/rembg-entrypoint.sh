#!/bin/sh
set -eu

port="${REMBG_PORT:-7001}"

exec rembg s --host 0.0.0.0 --port "$port"
