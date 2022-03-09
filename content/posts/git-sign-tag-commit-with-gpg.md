---
url: "git-sign-tags-commits-with-gpg"
title: "Git 使用 GPG 对提交进行签名认证"
date: 2022-03-09T12:31:34+08:00
lastmod: 2022-03-09T12:50:34+08:00
draft: false

description: "Git sign tags or commits with gpg"

tags: ["git", "gpg"]
categories: ["git"]

lightgallery: true
toc:
  auto: false
---

使用 *GPG* 或 *S/MIME*，可以在本地对 *tag* 或 *commit* 进行签名。这些 *tag* 或 *commit* 在 *GitHub* 上被标记为可信的，这样其他人就可以确信这些更改来自一个可信的来源。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 开启 vigilant 模式

开启 **[vigilant](https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits#about-vigilant-mode)** *警惕*模式后，属于你的未签名提交将被标记为 **Unverified** 标记。这可以**提醒你和其他人关于真实性的潜在问题**。Git 提交的作者和提交者很容易被欺骗。例如，有人可以推动一个声称是你的承诺，但实际上不是。

>设置路径: **Settings**->**[SSH and GPG keys](https://github.com/settings/keys)**>**Vigilant mode**->select **Flag unsigned commits as unverified**

## GPG Key 生成与配置

{{< admonition note >}} GPG does not come installed by default on macOS or Windows. To install GPG command line tools, see [GnuPG's Download page](https://www.gnupg.org/download/).{{< /admonition >}}

### *已存在 GPG keys*

`gpg --list-secret-keys --keyid-format=long`

{{< admonition example >}}

```text
~/.gnupg/pubring.kbx
-----------------------------------
sec   rsa4096/325ACD1FD3B6AA80 2022-03-07 [SC] [expires: 2024-03-06]
      1F11E9A019E23C53C11C8D4C325ACD1FD3B6AA80
uid                 [ultimate] xwi88 <278810732@qq.com>

```

- *the GPG key ID*: **325ACD1FD3B6AA80**

{{< /admonition >}}

### 新生成 *GPG key*

>如果当前已存在旧的 GPG key 可不必重新生成!

`gpg --default-new-key-algo rsa4096 --gen-key`

{{< admonition tip >}}
*github* 支持的用于生成 *gpg key* 的算法

- **RSA**
- ElGamal
- DSA
- ECDH
- ECDSA
- EdDSA

{{< /admonition >}}

{{< admonition example >}}
`gpg --default-new-key-algo rsa4096 --gen-key`

- Real name: `tmp_gpg`
- Email address: `278810732@qq.com`

You selected this USER-ID:
    "tmp_gpg <278810732@qq.com>"

- Change (N)ame, (E)mail, or (O)kay/(Q)uit? `O`

We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

Note that this key cannot be used for encryption.  You may want to use
the command "--edit-key" to generate a subkey for this purpose.

```text
pub   rsa4096 2022-03-09 [SC] [expires: 2024-03-08]
      F09FC9FB34FA457ED2F7090AFE47519758053257
uid                      tmp_gpg <278810732@qq.com>
```

{{< /admonition >}}

### 最新 *GPG keys*

`gpg --list-secret-keys --keyid-format=long`

```tex
-----------------------------------
sec   rsa4096/325ACD1FD3B6AA80 2022-03-07 [SC] [expires: 2024-03-06]
      1F11E9A019E23C53C11C8D4C325ACD1FD3B6AA80
uid                 [ultimate] xwi88 <278810732@qq.com>

sec   rsa4096/FE47519758053257 2022-03-09 [SC] [expires: 2024-03-08]
      F09FC9FB34FA457ED2F7090AFE47519758053257
uid                 [ultimate] tmp_gpg <278810732@qq.com>
```

### 导出 *GPG key*

`gpg --armor --export FE47519758053257`

```tex
-----BEGIN PGP PUBLIC KEY BLOCK-----

xxxxxxxxxxxxxxx

-----END PGP PUBLIC KEY BLOCK-----
```

### 设置 **GPG key**

>- 复制你要使用的 **GPG key**, *beginning with* **-----BEGIN PGP PUBLIC KEY BLOCK-----** and *ending with* **-----END PGP PUBLIC KEY BLOCK-----**
>
>- 粘贴到 *github* 相应位置: **Settings**->**SSH and GPG keys**->**GPG keys**，如已经存在相应 *key* 可忽略，不存在新建后粘贴即可!

## Git 配置使用 GPG

### 配置 sign 使用的 *GPG key*

>注意你是否需要全局配置，如果进行了全局配置，单个项目也可重新配置! ~~--global~~

```bash
# global config
git config --global user.signingkey 325ACD1FD3B6AA80

# configure your Git client to sign commits by default for a local repository, in Git versions 2.0.0 and above
git config --global commit.gpgsign true
```

### 提交带签名的 commit

`git commit -S -m "your commit message`

### sign tag

```bash
# sign a tag
git tag -s my_tag

# Verify your signed tag 
git tag -v my_tag
```
