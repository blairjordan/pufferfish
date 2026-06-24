#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="${ROOT_DIR}/fixtures/manifest.txt"
OUTPUT_DIR="${ROOT_DIR}/output/fixtures"

mkdir -p "${OUTPUT_DIR}"

while IFS='|' read -r name template config
do
  [ -n "${name}" ] || continue

  TEMPLATE_PATH="${ROOT_DIR}/${template}"
  CONFIG_PATH="${ROOT_DIR}/${config}"
  DOT_PATH="${OUTPUT_DIR}/${name}.dot"
  PNG_PATH="${OUTPUT_DIR}/${name}.png"
  WARN_PATH="${OUTPUT_DIR}/${name}.warnings.log"

  node "${ROOT_DIR}/dist/index.js" \
    --template "${TEMPLATE_PATH}" \
    --out "${DOT_PATH}" \
    --config "${CONFIG_PATH}"

  if ! dot -Tpng "${DOT_PATH}" -o "${PNG_PATH}" 2>"${WARN_PATH}"; then
    cat "${WARN_PATH}"
    exit 1
  fi

  if [ -s "${WARN_PATH}" ]; then
    cat "${WARN_PATH}"
    exit 1
  fi
done < "${MANIFEST}"
