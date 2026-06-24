#!/bin/bash
# Unpack icon zips from vendor/ into top-level aws-icons/, azure-icons/, gcp-icons/.
# Idempotent: skips a target that already contains PNGs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT/vendor"

command -v unzip >/dev/null || { echo "fetch-icons: 'unzip' not found on PATH" >&2; exit 1; }

extract() {
  local name="$1" target="$ROOT/$1"
  [ -d "$target" ] && [ -n "$(find "$target" -maxdepth 3 -name '*.png' -print -quit 2>/dev/null)" ] && return 0
  echo "extracting $name..."
  rm -rf "$target"
  mkdir -p "$target"
  unzip -q "$VENDOR/$name.zip" -d "$target"
}

extract aws-icons
extract azure-icons
extract gcp-icons

echo "icons: aws=$(find "$ROOT/aws-icons" -name '*.png' | wc -l), azure=$(find "$ROOT/azure-icons" -name '*.png' | wc -l), gcp=$(find "$ROOT/gcp-icons" -name '*.png' | wc -l)"
