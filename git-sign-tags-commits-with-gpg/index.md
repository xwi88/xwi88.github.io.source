# Git 使用 GPG 对提交进行签名认证


使用 *[GPG](https://gnupg.org/)* 或 *[S/MIME](https://docs.microsoft.com/en-us/exchange/security-and-compliance/smime-exo/smime-exo)*，可以在本地对 *tag* 或 *commit* 进行签名。这些 *tag* 或 *commit* 在 *GitHub* 上被标记为可信的，这样其他人就可以确信这些更改来自一个可信的来源。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 开启 vigilant 模式

开启 **[vigilant](https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits#about-vigilant-mode)** *警惕*模式后，属于你的未签名提交将被标记为 **Unverified** 标记。这可以**提醒你和其他人关于真实性的潜在问题**。Git 提交的作者和提交者很容易被欺骗。例如，有人可以推送一个声明是你的提交，但实际上不是。

>设置路径: **Settings**->**[SSH and GPG keys](https://github.com/settings/keys)**>**Vigilant mode**->select **Flag unsigned commits as unverified**

## GPG Command

```bash
gpg> help
quit        quit this menu
save        save and quit
help        show this help
fpr         show key fingerprint
grip        show the keygrip
list        list key and user IDs
uid         select user ID N
key         select subkey N
check       check signatures
sign        sign selected user IDs [* see below for related commands]
lsign       sign selected user IDs locally
tsign       sign selected user IDs with a trust signature
nrsign      sign selected user IDs with a non-revocable signature
deluid      delete selected user IDs
delkey      delete selected subkeys
delsig      delete signatures from the selected user IDs
pref        list preferences (expert)
showpref    list preferences (verbose)
trust       change the ownertrust
revsig      revoke signatures on the selected user IDs
enable      enable key
disable     disable key
showphoto   show selected photo IDs
clean       compact unusable user IDs and remove unusable signatures from key
minimize    compact unusable user IDs and remove all signatures from key

* The 'sign' command may be prefixed with an 'l' for local signatures (lsign),
  a 't' for trust signatures (tsign), an 'nr' for non-revocable signatures
  (nrsign), or any combination thereof (ltsign, tnrsign, etc.).
```

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

You selected this **USER-ID**:
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

>注意你是否需要全局配置，如果进行了全局配置，单个项目也可重新配置! **local** 替换 ~~--global~~

```bash
# global config
git config --global user.signingkey 325ACD1FD3B6AA80

# configure your Git client to sign commits by default for a local repository, in Git versions 2.0.0 and above
git config --global commit.gpgsign true
```

### 提交带签名的 commit

`git commit -S -m "your commit message"`

>如果你设置了默认对提交进行签名，也可以如下操作
>
>`git commit -m "your commit message"`

{{< admonition warning >}}
如果你使用的 **GPG key** 使用了 *GPG key passphrase*, 则你进行提交的时候需要输入你的 *passphrase*.

你可以选择存储 **GPG key passphrase** 来避免每次的签名 *passphrase* 输入:

- Mac users, **[GPG Suite](https://gpgtools.org/)** 可以将你的 *GPG key passphrase* 存储在 **Mac OS Keychain**
- Windows users, **[Gpg4win](https://www.gpg4win.org/)**
- Manually 配置 **[gpg-agent](http://linux.die.net/man/1/gpg-agent)** 来存储

{{< /admonition >}}

### sign tag

```bash
# sign a tag
git tag -s my_tag

# verify your signed tag 
git tag -v my_tag
```

### 提交签名查看

>- [git log usage](https://www.git-scm.com/docs/git-log)
>- *git version* **2.34.1**

`git log --show-signature`

{{< admonition tip>}}

> 格式化日志查看签名，可自定义配置查看 log

`git log --color --graph --pretty=format:'%C(cyan)%G?%Creset %Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset | [%GK trust:%GT] %C(yellow)%GS%Creset' --abbrev-commit`

```bash
* G fb56816 - fixed rsync dir (2 days ago) <xwi88> | [325ACD1FD3B6AA80 trust:ultimate] xwi88 <278810732@qq.com>
* G 63d6ec2 - fixed rsync deploy (2 days ago) <xwi88> | [325ACD1FD3B6AA80 trust:ultimate] xwi88 <278810732@qq.com>
* N 1ac5368 - workflow add remote deploy (2 days ago) <xwi88> | [ trust:undefined]
* E 289ae51 - add domain ICP info (2 days ago) <xwi88> | [EEA29F407613E698 trust:]
* E f0e44bd - switch comment store repo:x (2 days ago) <xwi88> | [EEA29F407613E698 trust:]
* E fbd5778 - fixed giscus issue (3 days ago) <xwi88> | [EEA29F407613E698 trust:]
* E 5fa8d41 - replace utterances by giscus (3 days ago) <xwi88> | [EEA29F407613E698 trust:]
```

- **G**: for a good (valid) signature
- B: for a bad signature
- U: for a good signature with unknown validity
- X: for a good signature that has expired
- Y: for a good signature made by an expired key
- R: for a good signature made by a revoked key
- **E**: if the signature cannot be checked (e.g. missing key)
- *N*: for no signature

{{< /admonition >}}

## **GPG keys 更新续期处理**

`gpg --edit-key [GPG key ID]`

{{< admonition example >}}

```tex
sec   rsa4096 2022-03-09 [SC] [expires: 2024-03-08]
      CE70FE5A7EB462DDA68EE86913431F2AC47C4AE0
uid           [ultimate] tmp_gpg_local <278810732@qq.com>
```

>*此处 GPG key 为重新生成的，仅供演示使用*

`gpg --edit-key CE70FE5A7EB462DDA68EE86913431F2AC47C4AE0`

>关键输出如下

```tex
sec  rsa4096/73758EF02856F877
     created: 2022-03-09  expires: 2024-03-08  usage: SC
     trust: ultimate      validity: ultimate
[ultimate] (1). tmp_gpg_local <278810732@qq.com>
```

输入 `expire` 进行过期日期更新

>gpg> `expire`

```tex
Changing expiration time for the primary key.
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
```

>Key is valid for? (0) `180d`

Key expires at Mon Sep  5 21:48:04 2022 CST

>Is this correct? (y/N) `y`

```tex
sec  rsa4096/13431F2AC47C4AE0
     created: 2022-03-09  expires: 2022-09-05  usage: SC
     trust: ultimate      validity: ultimate
[ultimate] (1). tmp_gpg_local <278810732@qq.com>
```

>gpg> `trust`

```tex
sec  rsa4096/13431F2AC47C4AE0
     created: 2022-03-09  expires: 2022-09-05  usage: SC
     trust: ultimate      validity: ultimate
[ultimate] (1). tmp_gpg_local <278810732@qq.com>

Please decide how far you trust this user to correctly verify other users' keys
(by looking at passports, checking fingerprints from different sources, etc.)

  1 = I don't know or won't say
  2 = I do NOT trust
  3 = I trust marginally
  4 = I trust fully
  5 = I trust ultimately
  m = back to the main menu
```

>Your decision? `5`
>
>Do you really want to set this key to ultimate trust? (y/N) `y`

```tex
sec  rsa4096/13431F2AC47C4AE0
     created: 2022-03-09  expires: 2022-09-05  usage: SC
     trust: ultimate      validity: ultimate
[ultimate] (1). tmp_gpg_local <278810732@qq.com>
```

>gpg> `save`
>
>`gpg --list-secret-keys --keyid-format=long` 验证过期时间是否更新

```tex
sec   rsa4096/90684042688CB9BE 2022-03-09 [SC] [expires: 2024-03-08]
      7E7F28C4EFFD7721E0133ED490684042688CB9BE
uid                 [ultimate] xwi88 <278810732@qq.com>

sec   rsa4096/13431F2AC47C4AE0 2022-03-09 [SC] [expires: 2022-09-05]
      CE70FE5A7EB462DDA68EE86913431F2AC47C4AE0
uid                 [ultimate] tmp_gpg_local <278810732@qq.com>
```

{{< /admonition >}}

## GPG key 重新绑定

>**以下设置如无需要，请勿更新**

{{< admonition warning >}}

>- **以下设置如无需要请勿更新**
>
>- *单项目*更新可选 **local** 替换 ~~--global~~

- `git config --global commit.gpgSign true`
- `git config --global user.signingKey 13431F2AC47C4AE0`

如有变动，请同步更新你的 **git** 仓库 **GPG key**

{{< /admonition >}}

## *GPG keys 删除*

- `gpg --delete-secret-key [uid]`
- `gpg --delete-secret-key [uid1] [uid2]`

{{< admonition warning >}}
**非必要不删除**，如果是因为过期则直接选择进行**续期操作**即可

*tmp_gpg 对应的 uid* 输入， 可以是以下任一个，请尽量使用 GPG key ID:

- *tmp_gpg*
- **13431F2AC47C4AE0**
- *CE70FE5A7EB462DDA68EE86913431F2AC47C4AE0*
{{< /admonition >}}

{{< admonition example >}}
>`gpg --delete-secret-key 13431F2AC47C4AE0`

```tex
sec  rsa4096/13431F2AC47C4AE0 2022-03-09 tmp_gpg_local <278810732@qq.com>
```

>Delete this key from the keyring? (y/N) `y`
>
>This is a secret key! - really delete? (y/N) `y`

验证删除是否成功：`gpg --list-secret-keys`

```tex
sec   rsa4096 2022-03-09 [SC] [expires: 2024-03-08]
      7E7F28C4EFFD7721E0133ED490684042688CB9BE
uid           [ultimate] xwi88 <278810732@qq.com>
```

{{< /admonition >}}

## 参考

- [managing-commit-signature-verification](https://docs.github.com/en/authentication/managing-commit-signature-verification)
- [S/MIME commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification#smime-commit-signature-verification)
- [smime-signing-git-commits](https://www.hifis.net/tutorial/2020/04/15/smime-signing-git-commits.html)

