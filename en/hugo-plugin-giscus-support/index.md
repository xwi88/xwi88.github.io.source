# Hugo Plugin Giscus Support


I've tried several Hugo comment plugins; the best are still **utterances** and **giscus**. The former is a bit too simple, while the newer **giscus**, based on *GitHub Discussions*, feels great to use. This post is verified on my own site and shared here for anyone who needs it.

<!--more-->

>- *blog theme*: [LoveIt](https://github.com/xwi88/LoveIt.git)
>- [giscus demo](https://blog.xwi88.com)

## giscus integration

>- [giscus](https://giscus.app)
>- [giscus zh-CN](https://giscus.app/zh-CN)

### Introduction

A comment system powered by [GitHub Discussions](https://docs.github.com/en/discussions). Let visitors leave comments and reactions on your website via GitHub! This project is heavily inspired by [utterances](https://github.com/utterance/utterances).

- [Open source](https://github.com/giscus/giscus). 🌏
- No tracking, no ads, always free. 📡 🚫
- No database needed. All data is stored in GitHub Discussions. :octocat:
- Custom themes supported! 🌗
- Multiple languages supported. 🌐
- [Highly configurable](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md). 🔧
- Automatically fetches new comments and edits from GitHub. 🔃
- [Self-hostable](https://github.com/giscus/giscus/blob/main/SELF-HOSTING.md)! 🤳

> Note:
>- giscus is still under active development. GitHub is also actively developing **Discussions** and its API. As a result, some giscus features may break or change over time.

### Configuration

>Requirements

- The repository is **public**, otherwise visitors cannot view the *discussion*.
- The **giscus app** is installed, otherwise visitors cannot comment or react.
- The **Discussions** feature is *enabled* on your repository.

>Configuration

```js
<script src="https://giscus.app/client.js"
        data-repo="[ENTER REPO HERE]"
        data-repo-id="[ENTER REPO ID HERE]"
        data-category="[ENTER CATEGORY NAME HERE]"
        data-category-id="[ENTER CATEGORY ID HERE]"
        data-mapping="pathname"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>
```

>You can customize the container layout in the embedded page using the **.giscus** and **.giscus-frame** selectors.

#### Getting some parameters

- **repo-id**, **category-id**: via the [github graphql api](https://docs.github.com/en/graphql/overview/explorer)
- **category** is usually **Announcements**, or pick another as needed — make sure it matches the **category-id**!
- *mapping*: fill in per your needs; **pathname** is the usual choice

![github-graphql-discussion-query](/images/screen_img/github-graphql-discussion.png "github graphql discussion query")

>After the steps above, you can use the plugin easily. Embedding it into your current theme, however, needs some extra handling.

### Theme support for giscus

You can add giscus support in two ways:

- **theme.js** *JS approach* — **requires recompiling theme.js**; see the project's `Makefile`, `make debug`
- **comment.html** *template approach*

The **js** approach is a bit more flexible. We wrote both; the template-plugin approach is *commented out*. See the relevant changes:

- [replace utterances by giscus](https://github.com/xwi88/xwi88.github.io.source/commit/5fa8d4181406cfbfc440df979145ff18c29ca40c) **github**
- [replace utterances by giscus](https://gitee.com/xwi88/xwi88/commit/5fa8d4181406cfbfc440df979145ff18c29ca40c) **gitee**

>giscus iframe async theme config: [isetconfigmessage](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#isetconfigmessage)

### See it in action

- [blog.xwi88.com](https://blog.xwi88.com/)

![hugo_giscus_demo](/images/screen_img/hugo_giscus_demo.png "hugo giscus demo")

