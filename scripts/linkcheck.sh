#!/usr/bin/env bash
# Internal-link checker for the built site (public/).
# Verifies every same-origin absolute link (href|src="/...") in the generated
# HTML resolves to a file. Exits non-zero if any 404.
#
# Usage: scripts/linkcheck.sh [public-dir]
set -euo pipefail
PUB="${1:-public}"
if [[ ! -d "$PUB" ]]; then
  echo "error: $PUB not found — build first (e.g. 'make publish HUGO=~/bin/hugo119')" >&2
  exit 2
fi

# Same-origin absolute links, deduped, query/fragment stripped.
mapfile -t links < <(grep -rhoe '\(href\|src\)="/[^"]*"' "$PUB" 2>/dev/null \
  | awk -F'"' '{print $2}' | grep -vE '^//' | sed -E 's/[?#].*$//' | sort -u)

missing=0
for l in "${links[@]}"; do
  if [[ "$l" == */ ]]; then t="$PUB${l}index.html"
  elif [[ "$l" == *.* ]]; then t="$PUB${l}"
  else t="$PUB${l}/index.html"; fi
  if [[ ! -e "$t" && ! -e "$PUB${l}" && ! -e "$PUB${l}.html" ]]; then
    # URL-encoded paths (e.g. CJK tags) map to raw UTF-8 dirs on disk — re-check decoded.
    dec="$(printf '%b' "$(printf '%s' "$l" | sed 's/%/\\x/g')" 2>/dev/null || true)"
    if [[ "$dec" != "$l" ]]; then
      if [[ "$l" == */ ]]; then dt="$PUB${dec}index.html"
      elif [[ "$l" == *.* ]]; then dt="$PUB${dec}"
      else dt="$PUB${dec}/index.html"; fi
      [[ -e "$dt" || -e "$PUB${dec}" ]] && continue
    fi
    echo "404: $l"
    missing=$((missing + 1))
  fi
done

echo "checked ${#links[@]} internal links, missing=$missing"
exit $(( missing > 0 ? 1 : 0 ))
