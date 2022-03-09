# Blog Source Code

## Feature

- [x] busuanzi `pv` `uv` `reading count`
- [x] comment plugin: `utterances`, `giscus`(recommend)
- [x] search plugin: `algolia`
- [x] images tool: `PicGo`
- [x] [live2D](https://github.com/xiazeyu/live2d-widget-models)

## Init and Run

```bash
# init and update submodule
make submodule-update

# run with production
make run

# run with dev
make dev

# publish
make publish

# update the copy theme.js and generate the theme.min.js and theme.min.js.map
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
