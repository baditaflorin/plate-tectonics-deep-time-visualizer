#!/usr/bin/env bash
set -euo pipefail

npm run build

PREVIEW_ROOT="tmp/pages-preview"
PORT="${PORT:-$((4300 + RANDOM % 1000))}"
BASE_URL="http://127.0.0.1:${PORT}/plate-tectonics-deep-time-visualizer/"
rm -rf "$PREVIEW_ROOT"
mkdir -p "$PREVIEW_ROOT"
cp -R docs "$PREVIEW_ROOT/plate-tectonics-deep-time-visualizer"

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$PREVIEW_ROOT" >/tmp/plate-tectonics-pages.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

READY=0
for _ in {1..40}; do
  if curl -fsS "$BASE_URL" >/dev/null; then
    READY=1
    break
  fi
  sleep 0.25
done

if [[ "$READY" != "1" ]]; then
  cat /tmp/plate-tectonics-pages.log >&2
  exit 1
fi

PLAYWRIGHT_BASE_URL="$BASE_URL" npx playwright test e2e/smoke.spec.ts
