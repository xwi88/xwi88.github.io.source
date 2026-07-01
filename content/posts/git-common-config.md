---
url: "git-common-config"
title: "Git 常用命令及配置"
date: 2022-03-10T21:31:19+08:00
lastmod: 2022-03-11T07:44:00+08:00
draft: false

description: "我的常用 git 命令及配置"

tags: ["env"]
categories: ["git"]

toc:
  auto: false
---

分享一下这些年我常用的 [git](https://git-scm.com/) [gɪt] 配置。以下内容基于当前版本 [`2.34.1`](https://git-scm.com/docs/git/2.34.0)，如出现不一致可先升级自己的版本！

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 账户基本配置

>`--global` *表示全局配置*，**非全局配置需要在具体 git 项目目录下面设置**

- `git config --global user.name [your_name]`
- `git config --global user.email [your_email]`
- `git config --global --list` **全局 git 配置查看**
- `git config --list` *项目 git 配置查看*

### 签名提交设置

>configure your Git client to sign commits by default for a local repository, in Git versions 2.0.0 and above

- `git config --global user.signingkey [KeyID]`
- `git config --global commit.gpgsign true`
  
可参考: [Git 使用 GPG 对提交进行签名认证](/git-sign-tags-commits-with-gpg/) 进行设置

## 密码存储

>为了避免每次都要输入密码，我们需要让机器记住密码。*MacOS* 会借助 **keychain Access** 存储你的密码及其他凭证。

- `git config --global credential.helper store` **设置本机永久保存你的密码或凭证**
- `git config --global credential.helper 'cache --timeout=300'` *保存密码 300s*

>**更多内容见**:
>
>- [gitcredentials](https://git-scm.com/docs/gitcredentials)
>- [git-credential-cache](https://git-scm.com/docs/git-credential-cache)

{{< admonition warning >}}

>如果你开启了多因素认证，则需要使用 **Personal Token** 之类的代替密码输入。
>
>- github 设置路径: [Settings Developer settings](https://github.com/settings/tokens)->**Personal access tokens**->*Generate new token*

**Personal access tokens** 📢

- **只有生成的时候可见，注意保存**
- **务必注意权限及过期时间设置**

{{< /admonition >}}

## 密码清除

>密码改变或过期后请务必清除存储的密码，否则可能造成`登录失败`，`无权限登录`等问题

- `git config --system --unset credential.helper`
- `git config --global credential.helper 'cache --timeout=5'` *或设置一个极短的过期时间，清除缓存密码*
- `git config --global credential.helper store` **重新开启密码存储**

## 日志输出美化

>原始的 [`git log`](https://git-scm.com/docs/git-log) 太过简陋不方便查看更具体的信息，我们需要对其进行格式化，借助 `git alias` 可以很方便的定义我们自己的 *git log* 命令，**请务必不要覆盖掉 `git` 自带的命令**。

{{< admonition tip >}}
我常用的 *git log* 配置如下

>`git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset | %C(red)%cs%Creset' --abbrev-commit"`

`git lg -4`

```bash
* 16074ef - (HEAD -> main, origin/main) update posts git-sign-tag-commit-with-gpg (2 hours ago) <xwi88> | 2022-03-10
* e39e092 - support l2d widget (23 hours ago) <xwi88> | 2022-03-10
* 11605af - close cookie tip and update posts (24 hours ago) <xwi88> | 2022-03-09
* 9b548b6 - update posts git sign with gpg (25 hours ago) <xwi88> | 2022-03-09
```

如果你需要查看 **gpg** 签名信息可以如下配置:

>`git config --global alias.lsg "log --color --graph --pretty=format:'%C(cyan)%G?%Creset %Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset | %C(red)%cs%Creset' --abbrev-commit"`

`git lsg -4`

```bash
* G 16074ef - (HEAD -> main, origin/main) update posts git-sign-tag-commit-with-gpg (2 hours ago) <xwi88> | 2022-03-10
* G e39e092 - support l2d widget (23 hours ago) <xwi88> | 2022-03-10
* G 11605af - close cookie tip and update posts (24 hours ago) <xwi88> | 2022-03-09
* G 9b548b6 - update posts git sign with gpg (25 hours ago) <xwi88> | 2022-03-09
```

更详细签名信息可如下配置：

>`git config --global alias.llsg "log --color --graph --pretty=format:'%C(cyan)%G?%Creset %Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset | %C(red)%cs%Creset [%GK trust:%GT] %C(yellow)%GS%Creset' --abbrev-commit"`

`git llsg -4`

```bash
* G 16074ef - (HEAD -> main, origin/main) update posts git-sign-tag-commit-with-gpg (2 hours ago) <xwi88> | 2022-03-10 [C739E6A64E102CD0 trust:ultimate] xwi88 <278810732@qq.com>
* G e39e092 - support l2d widget (23 hours ago) <xwi88> | 2022-03-10 [90684042688CB9BE trust:ultimate] xwi88 <278810732@qq.com>
* G 11605af - close cookie tip and update posts (24 hours ago) <xwi88> | 2022-03-09 [90684042688CB9BE trust:ultimate] xwi88 <278810732@qq.com>
* G 9b548b6 - update posts git sign with gpg (25 hours ago) <xwi88> | 2022-03-09 [90684042688CB9BE trust:ultimate] xwi88 <278810732@qq.com>
```

{{< /admonition >}}

{{< admonition warning >}}

- **务必指定输出日志条数**
- **务必不要配置的过于复杂，可能会导致输出较慢**
- **如果使用 `gpg 签名`，务必保证你不要有太多个 `gpg key`**

{{< /admonition >}}

## 基本命令

>关于命令更多细节，可通过 `git <command> --help` 查看

- `git add [<path_spec>...]`  **添加文件到 `Index`**
  - `git add [<path_spec>...] -n` **显示命令执行后结果，不真正执行**
- `git status -s` 当前分支状态查看，显示文件在工作目录与暂存区不同状态：`修改`，`未添加 Index`，`暂存但未提交`
- `git diff`
  - `git diff [<path>...]` 比较工作目录文件和暂存区文件差异
  - `git diff <commit>...<commit> [<path>...]` 比较 commits 之间差异
  - `git diff --cached [<commit>] [<path>...]` 比较暂存区和版本库差异
- `git commit` 暂存区变动提交到本地仓库
  - `git commit -m <message>` 提交到本地仓库
  - `git commit -S -m <message>` **签名**并提交到本地仓库，需要配置你的签名 **GPG key**
  - `git commit -a -m` 添加并提交全部变动到本地仓库，跳过了 `git add`，一般请勿执行此操作
  - `git commit --amend` 重新提交最近的提交，用于最近提交的**提交日志信息修改**或变动追加，**请勿连续此操作**，**已推送远程仓库提交请避免此操作**
- `git reset` 变更撤销，具体见 [checkout 与 reset](#checkout-与-reset)
- `git rm` 从暂存区和工作目录删除文件
- `git mv <old> <new>` *文件的重定向*，相当于：`mv old new` , `git add` 新文件 和 `git rm` 旧文件

## 分支操作

### 远程分支地址设置

- `git remote -v`
- `git remote add <name> <url>` 远程仓库地址配置
- `git remote rename <old> <new>` 远程仓库地址名修改
- `git remote set-url <name> <new_url>` 远程仓库地址修改

### 代码下载 clone

- `git clone -b branch_name --single-branch <url>` 单分支下载
- `git clone <url> [dir]`

### 代码拉取与同步

- `git fetch --all` || `git merge` 仅拉取代码到**本地远程分支** 如 `origin/main`, `upstream/main` 等，不直接合并到相应本地分支，在需要时同步合并
- `git pull` 拉取并合并远程分支代码到当前分支，一般情况不建议直接此操作，除非你很明确可能产生的后果
- `git push -u <repo_name> <branch_name>` 主要用于本地新建分支与指定远程分支间的跟踪，**一般用于新分支首次推送**

### checkout 与 reset

- `git chekout`
- `git reset`
- `git revert` **cli 不常用**

|Git Command|Scope|Common use cases|
|:---|:---|:---|
|reset|Commit|Discard commits in a private branch or throw away uncommited changes|
|reset|File |Unstage a file|
|checkout|Commit|Switch between branches or inspect old snapshots|
|checkout|File|Discard changes in the working directory|
|revert|Commit|Undo commits in a public branch|
|revert|File|(N/A)|

{{< admonition info >}}
> `--soft` The staged snapshot and working directory are not altered in any way.
>
> `--mixed` The staged snapshot is updated to match the specified commit, but the working directory is not affected. This is the default option.
>
> `--hard` The staged snapshot and the working directory are both updated to match the specified commit.
{{< /admonition >}}

### 代码合并提交

>多人或大规模团队协作情况下，请务必掌握并使用 `git rebase` 进行操作，且要保证各自分支相比 **base** 分支有**最小的 commits 数量**，便于各自 **rebase** 及冲突解决。
>
>如果你提交了 `PR` 或 `MR`，**reviewers** 审查前，请务必保证你提交的分支相较 **base** 是 `Fast-Forward` 的，禁止在界面直接进行 **Rebase**

- `git rebase` **慎重操作** [演示，请点击](https://mp.weixin.qq.com/s?__biz=MzIzODY3NjQ0OA==&mid=2247483733&idx=1&sn=5adc1d9d1a241ffc3565c47d7f924125&chksm=e934f1dade4378cc630dca0d1655db42418e983e08e9e6779d2f0895189ec85ae45f4751bae0&token=281138563&lang=zh_CN#rd)
- `git merge` ~~**不建议此操作**~~

### 分支推送与删除

- `git push` 当前分支推送，需要与远程分支建立追踪；首次推送，请使用 `git push -u <name> <branch>`
- `git push -f` 强制推送当前分支到对应远程仓库
- `git push -f <name> :<remote_branch>` 推送空分支到远程仓库，即**删除远程仓库对应分支**
- `git branch -d` 本地分支删除

## 撤销设置项

>**Remove the line matching the key from config file.**

- `git config --global --unset [key]` 全局配置中删除
- `git config --unset [key]` 项目配置中删除

{{< admonition example >}}
*全局配种中删除误操作创建项*

`git config --global --unset alias.llg`
{{< /admonition >}}

## 配置文件编辑

- `git config --global -e` 全局配置文件编辑，文件位置: `~/.gitconfig`
- `git config -e` 项目配置文件编辑，文件位置: `.git/config`

## 参考

- [git docs](https://git-scm.com/docs)
- [Git-Basics-Git-Aliases](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases)
- [Git-Commands-Basic-Snapshotting](https://git-scm.com/book/en/v2/Appendix-C:-Git-Commands-Basic-Snapshotting)
- [Git 使用 GPG 对提交进行签名认证](/git-sign-tags-commits-with-gpg/)
