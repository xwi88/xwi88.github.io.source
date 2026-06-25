#!/usr/bin/env bash
# Sync the resume source -> blog copy (static/resume/index.html) and inject a
# "back to blog" button (the resume is a standalone HTML doc with no blog nav,
# so without this users can't return to the blog).
# Idempotent: safe to re-run; won't double-inject.
#
# Usage: scripts/sync_resume.sh [path-to-source-resume.html]
set -euo pipefail
SRC="${1:-/Users/wangxin/projects/personal/advertising/.openclaw/tmp/resume.html}"
DST="static/resume/index.html"

[[ -f "$SRC" ]] || { echo "source not found: $SRC" >&2; exit 1; }
mkdir -p static/resume
cp "$SRC" "$DST"

# inject the back-to-blog button right after <body> (skip if already injected)
if ! grep -q 'id="back-to-blog"' "$DST"; then
    python3 - "$DST" <<'PY'
import re, sys
p = sys.argv[1]
html = open(p, encoding="utf-8").read()
bar = (
    '<div id="back-to-blog" style="position:fixed;top:0;left:0;z-index:9999;'
    'padding:8px 16px;background:rgba(0,0,0,.72);border-radius:0 0 8px 0;'
    'font-family:system-ui,-apple-system,sans-serif;backdrop-filter:blur(4px);">'
    '<a href="/" style="color:#fff;text-decoration:none;font-size:14px;font-weight:600;">'
    '&#8592; 返回博客 / Back to blog</a></div>'
)
html, n = re.subn(r'(<body[^>]*>)', r'\1' + bar, html, count=1)
if n == 0:
    print("warning: no <body> tag found; back-link not injected", file=sys.stderr)
open(p, "w", encoding="utf-8").write(html)
PY
fi

echo "synced resume → $DST (back-to-blog button injected)"
