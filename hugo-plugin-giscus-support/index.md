# Hugo Plugin Giscus Support


Hugo 评论插件用了几个感觉好用的还是 **utterances** 与 **giscus**，前者功能太过单，最新的基于 *github discussion* 的 **giscus** 使用体验非常不错。本文基于个人实验验证，旨在为需要的人提供方便。

<!--more-->

>- *blog theme*: [LoveIt](https://github.com/xwi88/LoveIt.git)
>- [giscus 体验](https://blog.xwi88.com)

## giscus 集成使用

>- [giscus](https://giscus.app)
>- [giscus zh-CN](https://giscus.app/zh-CN)

### 介绍

由 [GitHub Discussions](https://docs.github.com/en/discussions) 驱动的评论系统。让访客借助 GitHub 在你的网站上留下评论和反应吧！本项目受 [utterances](https://github.com/utterance/utterances) 强烈启发。

- [开源](https://github.com/giscus/giscus)。🌏
- 无跟踪，无广告，永久免费。📡 🚫
- 无需数据库。全部数据均储存在 GitHub Discussions 中。:octocat:
- 支持自定义主题！🌗
- 支持多种语言。🌐
- [高度可配置](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md)。🔧
- 自动从 GitHub 拉取新评论与编辑。🔃
- [可自建服务](https://github.com/giscus/giscus/blob/main/SELF-HOSTING.md)！🤳

>- 注意：
>- giscus 仍处于活跃开发中。GitHub 也还在活跃地开发 **Discussions** 及其 API。因此，一些 giscus 的特性可能随时间损坏或改变。

### 配置

>要求

- 此仓库是**公开的**，否则访客将无法查看 *discussion。*
- **giscus app** 已安装否则访客将无法评论和回应。
- **Discussions** 功能已在你的仓库中*启用*。

>配置内容

```js
<script src="https://giscus.app/client.js"
        data-repo="[在此输入仓库]"
        data-repo-id="[在此输入仓库 ID]"
        data-category="[在此输入分类名]"
        data-category-id="[在此输入分类 ID]"
        data-mapping="pathname"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="light"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
```

>你可以在嵌入的页面中使用 **.giscus** 和 **.giscus-frame** 选择器来自定义容器布局

#### 部分参数获取

- **repo-id**, **category-id** [github graphql api](https://docs.github.com/en/graphql/overview/explorer)
- **category** 一般为 **Announcements**, 或者根据需要选择其他的，务必保证与 **category-id** 一致！
- *mapping* 根据你的需要填写，一般选择 **pathname**

![github-graphql-discussion-query](/images/screen_img/github-graphql-discussion.png "github graphql discussion query")

>经过以上步骤，我们就可以轻松的使用此插件了，但是如果要将其嵌入到当前使用的模板中还需要做一些特殊的处理。

### 主题修改支持 **giscus**

可以通过两种方式进行改造支持:

- **theme.js** *JS 方式* **需要重新编译 theme.js** *具体参考项目文件* `Makefile` `make debug`
- **comment.html** 模板方式

**js** 方式更灵活一些。我们写了两种方式，*注释掉了模板插件方式修改*，对修改感兴趣的可以参考相应变更:

- [replace utterances by giscus](https://github.com/xwi88/xwi88.github.io.source/commit/5fa8d4181406cfbfc440df979145ff18c29ca40c) **github**
- [replace utterances by giscus](https://gitee.com/xwi88/xwi88/commit/5fa8d4181406cfbfc440df979145ff18c29ca40c) **gitee**

>giscus iframe 主题配置异步修改: [isetconfigmessage](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#isetconfigmessage)

### 效果查看

- [blog.xwi88.com](https://blog.xwi88.com/)

![hugo_giscus_demo](/images/screen_img/hugo_giscus_demo.png "hugo giscus demo")

