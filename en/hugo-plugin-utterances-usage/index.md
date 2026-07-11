# Hugo Plugin Utterances Usage


Configuration and usage of the Hugo comments plugin utterances, based on personal experimentation — shared to help anyone who needs it.

<!--more-->

>*blog theme*: [LoveIt](https://github.com/xwi88/LoveIt.git)

## **utteranc**

>[utteranc](https://utteranc.es/)

### introduction

A lightweight comments widget built on *GitHub issues*. Use *GitHub issues* for blog comments, wiki pages and more!

* Open source. 🙌
* No tracking, no ads, always free. 📡🚫
* No lock-in. All data stored in GitHub issues. 🔓
* Styled with Primer, the css toolkit that powers GitHub. 💅
* Dark theme. 🌘
* Lightweight. Vanilla TypeScript. No font downloads, JavaScript frameworks or polyfills for evergreen browsers. 🐦🌲

### configuration

Choose the **repository** utterances will connect to.

1. Make sure the repo is **public**, otherwise your readers will not be able to view the **issues/comments**.
2. Make sure the [utterances app](https://github.com/apps/utterances) is installed on the repo, otherwise users will not be able to post comments.
3. If your repo is a **fork**, navigate to its settings tab and confirm the issues feature is turned on.

#### config update

>after this config, maybe work well.

```toml
## ref https://utteranc.es/
[params.utteranc]
  enable = true
  repo = "owner/repo" # your repo
  issueTerm = "pathname"
  theme = "github-light"
```

#### blog post ↔ issue mapping

Choose the mapping between blog posts and GitHub issues. Pls visit [utterances app](https://github.com/apps/utterances) to check and set the config.

#### issue label

Choose the label that will be assigned to issues created by Utterances.

>default: **Comment**

Label names are case sensitive. The label must exist in your repo- Utterances cannot attach labels that do not exist. Emoji are supported in label names.✨💬✨

#### theme

*Choose an Utterances theme that matches your blog.*

### enable utterances

Add the following script tag to your blog's template. Position it where you want the comments to appear. Customize the layout using the .utterances and .utterances-frame selectors.

```js
<script src="https://utteranc.es/client.js"
        repo="[ENTER REPO HERE]"
        issue-term="pathname"
        theme="github-light"
        crossorigin="anonymous"
        async>
</script>
```

