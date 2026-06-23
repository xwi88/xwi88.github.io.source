# Deploy Runbook — xwi88.github.io.source

Hugo site → multi-target deploy via GitHub Actions (`.github/workflows/main.yml`).
**Build: Hugo `0.119.0` extended** — the LoveIt 0.2.10 theme is incompatible with newer Hugo
(removed `.Site.Author.name`, `:filename` permalink, `privacy.twitter`). CI pins this version;
locally use `~/bin/hugo119` or `make dev HUGO=~/bin/hugo119`.

## Deploy targets & credentials

| Target | Workflow step | Credential | Status |
|---|---|---|---|
| **blog.xwi88.com** / xwi88.github.io (GitHub Pages) | `Deploy` (gh-pages → external repo `xwi88/xwi88.github.io`) | `DEPLOY_ACCESS_TOKEN` (PAT, cross-repo push) | ✅ live |
| source repo `gh-pages` branch (gitee mirror source) | `Deploy_Gitee` | `DEPLOY_ACCESS_TOKEN` | ✅ |
| gitee **mirror** (`xwi88/xwi88` content) | `sync` (git-mirror over SSH) | `GITEE_RSA_PRIVATE_KEY` + github deploy key | ✅ synced |
| **xwi88.gitee.io** (gitee Pages rebuild) | `gitee-pages` | `GITEE_PASSWORD` | ⚠️ Gitee anti-bot blocks automation → manual deploy |
| **xwi88.com** (tencent server) | `Rsync Deployments` (`continue-on-error`) | `SITE_RSA_PRIVATE_KEY` (SSH) | ⚠️ `xwi88.com:65432` times out from GH Actions |
| **Search** (Pagefind, static) | `Build search index (Pagefind)` (after hugo) | none (no account/key) | ✅ live at `/search/`, Chinese-aware |

> `DEPLOY_ACCESS_TOKEN` is needed because the `Deploy` step pushes to a **different repo**
> (`xwi88.github.io`); the default `GITHUB_TOKEN` can't cross repos. It is unrelated to custom
> domains — it's a cross-repo push credential.

## Open action items (need your external action)

### ✅ Search — fixed (Pagefind; was Algolia)
Algolia apps were deleted (DNS NXDOMAIN), so search was replaced with **Pagefind** — static,
no account/key, Chinese-aware. Live at `blog.xwi88.com/search/` (menu: 搜索/Search). Indexes
post content (`data-pagefind-body` on `layouts/posts/single.html`); built by the CI
`Build search index (Pagefind)` step + `make publish` (PAGEFIND var). **No action needed.**

### ⚠️ xwi88.com (tencent)
`ssh xwi88.com -p 65432` times out from GitHub Actions. The `SITE_RSA_PRIVATE_KEY` loads fine —
it's network. Open port `65432` to GitHub Actions IP ranges, or verify the server is up + sshd
running. (Locally: `ssh -p 65432 app@xwi88.com` to confirm it's reachable from your network.)

### ⚠️ xwi88.gitee.io (gitee Pages rebuild)
Gitee's anti-bot (NOX) blocks `yanglbme/gitee-pages-action` (needs phone-captcha bind). Content
**is** mirrored (sync ✓). To update the live gitee site: gitee → `xwi88/xwi88` → 服务 →
Gitee Pages → **部署** (one manual click after each deploy). No clean CI auto-trigger while
anti-bot is on.

## Local dev
```bash
gh auth switch --user xwi88        # default account is xwi999 (no write access) — switch before push
make dev HUGO=~/bin/hugo119        # Hugo 0.119 extended; brew hugo (0.16x) breaks the theme
make linkcheck HUGO=~/bin/hugo119  # internal-link QA (exit≠0 on any 404)
```

## What this branch hardened (already done)
- `DEPLOY_ACCESS_TOKEN` refreshed → **blog.xwi88.com deploys**.
- Gitee sync: fresh ed25519 keypair + github deploy key + `GITEE_RSA_PRIVATE_KEY` → **mirror syncs**.
- tencent rsync + Algolia: `continue-on-error` (best-effort) → unreachable targets don't block
  blog.xwi88.com.
- Control test (revert workflow → re-run) proved the deploy-token failure was the token, not code.
- Algolia: replaced broken `rxrw/algolia-index-uploader@v1` (algoliasearch v4 removed
  `search_client`) with a pinned `<3` reindex step that IPv4-forces + diagnoses host reachability.
