#!/usr/bin/env bash
# Lightweight local server for testing the static site
# Usage: ./scripts/serve.sh [PORT] [DIRECTORY]
# Default: PORT=8000 DIRECTORY=.

set -euo pipefail

PORT=${1:-8000}
DIR=${2:-.}

echo "Serving $DIR at http://localhost:$PORT"

if command -v python3 >/dev/null 2>&1; then
  (cd "$DIR" && exec python3 -m http.server "$PORT")
elif command -v python >/dev/null 2>&1; then
  (cd "$DIR" && exec python -m SimpleHTTPServer "$PORT")
else
  echo "Error: python3 not found. Install Python 3 or use an alternative server." >&2
  exit 1
fi

# In order to shut down the server, press Ctrl+C in the terminal where this script is running.