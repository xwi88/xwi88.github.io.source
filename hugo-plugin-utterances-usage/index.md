# Hugo 插件 Utterances 用法


Hugo 评论插件 utterances 的配置使用，基于个人实验验证，旨在为需要的人提供方便。

<!--more-->

>*博客主题*: [LoveIt](https://github.com/xwi88/LoveIt.git)

## **utteranc**

>[utteranc](https://utteranc.es/)

### 简介

一款基于 *GitHub issues* 构建的轻量级评论组件。用 *GitHub issues* 来承载博客评论、wiki 页面等！

* 开源。🙌
* 不追踪、无广告、永久免费。📡🚫
* 无锁定。所有数据都存储在 GitHub issues 中。🔓
* 使用 GitHub 的 CSS 工具集 Primer 进行样式渲染。💅
* 支持暗色主题。🌘
* 轻量。纯 TypeScript 实现，无需字体下载、JavaScript 框架，也无需为常青浏览器准备 polyfill。🐦🌲

### 配置

选择 utterances 要连接的**仓库**。

1. 确保仓库是 **public**（公开）的，否则读者将无法查看 **issues/评论**。
2. 确保已在仓库上安装 [utterances app](https://github.com/apps/utterances)，否则用户无法发表评论。
3. 如果你的仓库是 **fork**（派生）来的，请进入它的 settings 标签页，确认 issues 功能已开启。

#### 配置更新

>完成此配置后，基本就能正常工作了。

```toml
## ref https://utteranc.es/
[params.utteranc]
  enable = true
  repo = "owner/repo" # your repo
  issueTerm = "pathname"
  theme = "github-light"
```

#### 博文 ↔ issue 映射

选择博文与 GitHub issues 之间的映射方式。请访问 [utterances app](https://github.com/apps/utterances) 查看并设置该配置。

#### issue 标签

选择由 Utterances 创建的 issues 所使用的标签。

>默认：**Comment**

标签名称区分大小写。该标签必须已存在于你的仓库中——Utterances 无法添加不存在的标签。标签名称支持 emoji。✨💬✨

#### 主题

*选择一个与你的博客相匹配的 Utterances 主题。*

### 启用 utterances

将以下 script 标签添加到博客模板中，放在你希望评论出现的位置。可使用 `.utterances` 和 `.utterances-frame` 选择器自定义布局。

```js
<script src="https://utteranc.es/client.js"
        repo="[ENTER REPO HERE]"
        issue-term="pathname"
        theme="github-light"
        crossorigin="anonymous"
        async>
</script>
```

