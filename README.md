# Blog Source Code

## Feature

- [x] busuanzi `pv` `uv` `reading count`
- [x] comment plugin: `utterances`, `giscus`(recommend)
- [x] search plugin: `algolia`
- [x] images tool: `PicGo`
- [x] [live2D](https://github.com/xiazeyu/live2d-widget-models)

## Init and Run

```bash
# Prerequisites — Hugo extended 0.119.0.
# The LoveIt 0.2.10 theme is INCOMPATIBLE with Hugo >= ~0.120 (removed APIs:
# .Site.Author.name, the :filename permalink token, privacy.twitter...).
# CI pins hugo-version '0.119.0' extended. If your default hugo is newer
# (e.g. `brew install hugo` gives 0.16x), install a 0.119.0 extended binary
# and pass it via HUGO= below.

# init and update submodule (themes/LoveIt)
make submodule-update

# dev server (hugo server -e production -DF -w). Override HUGO if your default is too new:
make dev HUGO=~/bin/hugo119        # or: make run HUGO=~/bin/hugo119

# build to ./public (no -D: production does not ship drafts)
make publish HUGO=~/bin/hugo119

# (optional) re-minify the project theme.js copy — guarded, no-ops unless
# both `uglifyjs` and src/js/theme.js exist (theme JS ships via the submodule)
make uglifyjs
```

## Config

>`CNAME` file shall put in dir: `static/` to publish with it.

## Visit

>- all the sites sources from: [xwi88.github.io.source](https://github.com/xwi88/xwi88.github.io.source)
>- others will auto sync by **workflows**, namely *github actions*.

|domain|source from|server|
|:---|:---|:---|
|[xwi88.com](https://xwi88.com/)|[xwi88.github.io.source](https://github.com/xwi88/xwi88.github.io.source)|tencent|
|[blog.xwi88.com](https://blog.xwi88.com/)|[xwi88.github.io](https://github.com/xwi88/xwi88.github.io)|github|
|[xwi88.github.io](https://xwi88.github.io/)|[xwi88.github.io](https://github.com/xwi88/xwi88.github.io)|github|
|[xwi88.gitee.io](https://xwi88.gitee.io/)|[xwi88](https://gitee.com/xwi88/xwi88)|gitee|

## Warn

- H2 in *posts* shall not use link, as if u click sidebar maybe forward the link.
