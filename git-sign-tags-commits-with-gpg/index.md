# Git 使用 GPG 对提交进行签名认证


使用 *[GPG](https://gnupg.org/)* 或 *[S/MIME](https://docs.microsoft.com/en-us/exchange/security-and-compliance/smime-exo/smime-exo)*，可以在本地对 *tag* 或 *commit* 进行签名。这些 *tag* 或 *commit* 在 *GitHub* 上被标记为可信的，这样其他人就可以确信这些更改来自一个可信的来源。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 开启 vigilant 模式

开启 **[vigilant](https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits#about-vigilant-mode)** *警惕*模式后，属于你的未签名提交将被标记为 **Unverified** 标记。这可以**提醒你和其他人关于真实性的潜在问题**。Git 提交的作者和提交者很容易被欺骗。例如，有人可以推送一个声明是你的提交，但实际上不是。

>设置路径: **Settings**->**[SSH and GPG keys](https://github.com/settings/keys)**>**Vigilant mode**->select **Flag unsigned commits as unverified**

## GPG Command

### **man gpg**

```bash
gpg (GnuPG) 2.2.34
libgcrypt 1.9.4
Copyright (C) 2022 g10 Code GmbH
License GNU GPL-3.0-or-later <https://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: ~/.gnupg
Supported algorithms:
Pubkey: RSA, ELG, DSA, ECDH, ECDSA, EDDSA
Cipher: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
        CAMELLIA128, CAMELLIA192, CAMELLIA256
Hash: SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
Compression: Uncompressed, ZIP, ZLIB, BZIP2

Syntax: gpg [options] [files]
Sign, check, encrypt or decrypt
Default operation depends on the input data

Commands:
 
 -s, --sign                         make a signature
     --clear-sign                   make a clear text signature
 -b, --detach-sign                  make a detached signature
 -e, --encrypt                      encrypt data
 -c, --symmetric                    encryption only with symmetric cipher
 -d, --decrypt                      decrypt data (default)
     --verify                       verify a signature
 -k, --list-keys                    list keys
     --list-signatures              list keys and signatures
     --check-signatures             list and check key signatures
     --fingerprint                  list keys and fingerprints
 -K, --list-secret-keys             list secret keys
     --generate-key                 generate a new key pair
     --quick-generate-key           quickly generate a new key pair
     --quick-add-uid                quickly add a new user-id
     --quick-revoke-uid             quickly revoke a user-id
     --quick-set-expire             quickly set a new expiration date
     --full-generate-key            full featured key pair generation
     --generate-revocation          generate a revocation certificate
     --delete-keys                  remove keys from the public keyring
     --delete-secret-keys           remove keys from the secret keyring
     --quick-sign-key               quickly sign a key
     --quick-lsign-key              quickly sign a key locally
     --quick-revoke-sig             quickly revoke a key signature
     --sign-key                     sign a key
     --lsign-key                    sign a key locally
     --edit-key                     sign or edit a key
     --change-passphrase            change a passphrase
     --export                       export keys
     --send-keys                    export keys to a keyserver
     --receive-keys                 import keys from a keyserver
     --search-keys                  search for keys on a keyserver
     --refresh-keys                 update all keys from a keyserver
     --import                       import/merge keys
     --card-status                  print the card status
     --edit-card                    change data on a card
     --change-pin                   change a card's PIN
     --update-trustdb               update the trust database
     --print-md                     print message digests
     --server                       run in server mode
     --tofu-policy VALUE            set the TOFU policy for a key

Options controlling the diagnostic output:
 -v, --verbose                      verbose
 -q, --quiet                        be somewhat more quiet
     --options FILE                 read options from FILE
     --log-file FILE                write server mode logs to FILE

Options controlling the configuration:
     --default-key NAME             use NAME as default secret key
     --encrypt-to NAME              encrypt to user ID NAME as well
     --group SPEC                   set up email aliases
     --openpgp                      use strict OpenPGP behavior
 -n, --dry-run                      do not make any changes
 -i, --interactive                  prompt before overwriting

Options controlling the output:
 -a, --armor                        create ascii armored output
 -o, --output FILE                  write output to FILE
     --textmode                     use canonical text mode
 -z N                               set compress level to N (0 disables)

Options controlling key import and export:
     --auto-key-locate MECHANISMS   use MECHANISMS to locate keys by mail address
     --disable-dirmngr              disable all access to the dirmngr

Options to specify keys:
 -r, --recipient USER-ID            encrypt for USER-ID
 -u, --local-user USER-ID           use USER-ID to sign or decrypt

(See the man page for a complete listing of all commands and options)

Examples:

 -se -r Bob [file]          sign and encrypt for user Bob
 --clear-sign [file]        make a clear text signature
 --detach-sign [file]       make a detached signature
 --list-keys [names]        show keys
 --fingerprint [names]      show fingerprints

Please report bugs to <https://bugs.gnupg.org>.
```

### **gpg shell command**

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

- `gpg --armor --export FE47519758053257`
- 或 `gpg -a -o --export FE47519758053257`

```tex
-----BEGIN PGP PUBLIC KEY BLOCK-----

xxxxxxxxxxxxxxx

-----END PGP PUBLIC KEY BLOCK-----
```

导出 *gpg public key* 到指定位置:

- `gpg --export --armor [uid] > gpgkey.pub.asc` **导出到文件** *uid: keyID/name/email*
- `gpg --keyserver [keyserverAddress] --send-keys keyIDs` *导出到指定 key server*
- `gpg --send-keys keyIDs` **导出到默认 key server**

>**导出到默认 key server 输出**

```tex
output: gpg: sending key 90684042688CB9BE to hkps://keyserver.ubuntu.com
```

### 查找 *GPG key*

>**keyIDs** 可以为: *name*, **keyID**, *email*

- `gpg --keyserver keyserverAddress --search-keys keyIDs`
- `gpg --search-keys keyIDs` **默认 key server 查找**

{{< admonition example >}}

>`gpg --search-keys xwi88`

```tex
gpg: data source: https://162.213.33.8:443
(1)	xwi88 <278810732@qq.com>
	  4096 bit RSA key 90684042688CB9BE, created: 2022-03-09
Keys 1-1 of 1 for "xwi88".  Enter number(s), N)ext, or Q)uit > q
```

>`gpg --search-keys 90684042688CB9BE`

```tex
gpg: data source: https://162.213.33.8:443
(1)	xwi88 <278810732@qq.com>
	  4096 bit RSA key 90684042688CB9BE, created: 2022-03-09
Keys 1-1 of 1 for "90684042688CB9BE".  Enter number(s), N)ext, or Q)uit > q
```

>`gpg --search-keys 278810732@qq.com`

```tex
gpg: data source: https://162.213.33.8:443
(1)	xwi88 <278810732@qq.com>
	  4096 bit RSA key 90684042688CB9BE, created: 2022-03-09
Keys 1-1 of 1 for "278810732@qq.com".  Enter number(s), N)ext, or Q)uit > y
```

{{< /admonition >}}

### 导入 *GPG key*

>**key server 导入** 如果不指定地址则默认从 `hkps://keyserver.ubuntu.com` 导入, **地址可能会不同，此为本机输出**

- `gpg --import [GPG public key]` *文件导入*
- `gpg --keyserver [keyserverAddress] --recv-keys keyIDs`  *key server 导入*
- `gpg --recv-keys keyIDs` **默认 key server 导入**
- `gpg --refresh-keys` *从 key server 更新所有 keys*

{{< admonition example >}}
>`gpg --recv-keys 90684042688CB9BE`

```tex
gpg: key 90684042688CB9BE: "xwi88 <278810732@qq.com>" not changed
gpg: Total number processed: 1
gpg:              unchanged: 1
```

{{< /admonition >}}

### 私钥备份导出与导入

>主要用于: **个人多机共享**

{{< admonition warning >}}

- **私钥禁止上传 key server**
- **请通过安全的方式备份存储私钥文件**
- *私钥文件权限*: `600`
- *公钥文件权限*: `644`

{{< /admonition >}}

#### 私钥导出

`gpg -a -o test_secKey.asc --export-secret-keys keyID`

{{< admonition example >}}
>`gpg -K` 本机私钥查看
>
>`gpg -a -o test_secKey.asc --export-secret-keys 1F11E9A019E23C53C11C8D4C325ACD1FD3B6AA80` 私钥导出

{{< /admonition >}}

#### 私钥导入

`gpg --import secKeyFile`

{{< admonition example >}}
>`gpg --import test_secKey.asc` 私钥导入，与公钥导入一样操作

```tex
gpg: key 325ACD1FD3B6AA80: "xwi88 <278810732@qq.com>" not changed
gpg: Total number processed: 1
gpg:              unchanged: 1
```

>`gpg -K` 本机私钥查看

{{< /admonition >}}

### **秘钥回收**

*当重新生成秘钥对后，如果其他的秘钥对不再使用，需要立即发布秘钥回收证书，声明以前的公钥不再生效，防止被恶意使用。*

>`gpg --output test_revoke.asc --gen-revoke keyID`
>
>`gpg --import test_revoke.asc` 导入回收证书
>
>`gpg --send-keys keyID` 发送回收证书到服务器，声明原 *GPG Key* 作废

{{< admonition example >}}
>`gpg --output test_revoke.asc --gen-revoke 325ACD1FD3B6AA80`
>
>或 `gpg --output test_revoke.asc --generate-revocation 325ACD1FD3B6AA80`

```tex
sec  rsa4096/325ACD1FD3B6AA80 2022-03-07 xwi88 <278810732@qq.com>

Create a revocation certificate for this key? (y/N) y
Please select the reason for the revocation:
  0 = No reason specified
  1 = Key has been compromised
  2 = Key is superseded
  3 = Key is no longer used
  Q = Cancel
(Probably you want to select 1 here)
Your decision? 3
Enter an optional description; end it with an empty line:
> 
Reason for revocation: Key is no longer used
(No description given)
Is this okay? (y/N) y
ASCII armored output forced.
Revocation certificate created.

Please move it to a medium which you can hide away; if Mallory gets
access to this certificate he can use it to make your key unusable.
It is smart to print this certificate and store it away, just in case
your media become unreadable.  But have some caution:  The print system of
your machine might store the data and make it available to others!
```

>`gpg --import test_revoke.asc`

```tex
gpg: key 325ACD1FD3B6AA80: "xwi88 <278810732@qq.com>" revocation certificate imported
gpg: Total number processed: 1
gpg:    new key revocations: 1
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   3  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 3u
gpg: next trustdb check due at 2024-03-06
```

>`gpg --send-keys 325ACD1FD3B6AA80`
>
>`gpg --search-keys 325ACD1FD3B6AA80`

```tex

gpg: data source: https://162.213.33.8:443
gpg: key "325ACD1FD3B6AA80" not found on keyserver
gpg: keyserver search failed: Not found
```

{{< /admonition >}}

### 秘钥删除

- `gpg --delete-secret-keys keyID` **需要先删除**
- `gpg --delete-keys keyID`

## 重启 GPG Agent

>GPG会在需要时重新启动它

`gpgconf --kill gpg-agent`

## Git 配置使用 GPG

### 设置 **GPG key**

>- 复制你要使用的 **GPG key**, *beginning with* **-----BEGIN PGP PUBLIC KEY BLOCK-----** and *ending with* **-----END PGP PUBLIC KEY BLOCK-----**
>
>- 粘贴到 *github* 相应位置: **Settings**->**SSH and GPG keys**->**GPG keys**，如已经存在相应 *key* 可忽略，不存在新建后粘贴即可!

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

### **本地签名校验问题**

通过命令 `git log --show-signature` 查看提交签名信息时可能会出现如下信息:

```tex
commit e39e0920b68648b0751b7f91fffdd07080391945 (HEAD -> main, origin/main, origin/HEAD)
gpg: Signature made Thu Mar 10 00:19:37 2022 CST
gpg:                using RSA key 7E7F28C4EFFD7721E0133ED490684042688CB9BE
gpg: Can't check signature: No public key
```

>也可通过命令 `git verify-commit e39e0920b68648b0751b7f91fffdd07080391945` 校验指定提交签名是否合法

**出现上述现象原因是因为你当前代码不存在对应 `commits` 使用的 `gpg public key`。我们可以通过导入对应提交者 `gpg public keys` 的方法解决。**

### **缺失 gpg keys** 导入认证

为了准确获取完整提交的签名校验信息，我们需要对缺失 **public keys** 进行导入。我们的实验导入源参考如下：

- `https://github.com/<username>.gpg` *需要你在 github 进行 GPG keys 上传配置*
- `hkps://keyserver.ubuntu.com` *需要你进行了 keys 上传*

>对导入的 *public key* 进行认证

- `gpg --list-keys --keyid-format=long` 找到你要认证的 key
- `gpg --lsign-key [GPG key ID]` *local sign*
- `gpg --edit-key [GPG key ID]` *local sign 与此处理选择一个即可*

{{< admonition example >}}
>**从 github 导入我们本地缺失的 public key** `gpg --keyserver https://github.com/xwi88.gpg --recv-keys 7E7F28C4EFFD7721E0133ED490684042688CB9BE`
>
>**认证 key** `gpg --lsign-key 7E7F28C4EFFD7721E0133ED490684042688CB9BE`
>
>**查看认证key状态** `gpg --list-keys --keyid-format=long`

```tex
pub   rsa4096/90684042688CB9BE 2022-03-09 [SC] [expires: 2024-03-08]
      7E7F28C4EFFD7721E0133ED490684042688CB9BE
uid                 [  full  ] xwi88 <278810732@qq.com>
```

>再次校验我们的提交 `git verify-commit e39e0920b68648b0751b7f91fffdd07080391945`

```tex
gpg: Signature made Thu Mar 10 00:19:37 2022 CST
gpg:                using RSA key 7E7F28C4EFFD7721E0133ED490684042688CB9BE
gpg: Good signature from "xwi88 <278810732@qq.com>" [full]
```

{{< /admonition >}}

## Github GPG public key 导入

>[github public GPG key for web-flow](https://github.com/web-flow.gpg)

1. `curl https://github.com/web-flow.gpg | gpg --import` **import github public gpg key**
2. `gpg --edit-key noreply@github.com trust quit` **trust and save, you choose: `4`**
3. `gpg --lsign-key noreply@github.com` *sign selected user IDs locally*

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

## GPG sign key 重新绑定

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

*tmp_gpg 对应的 uid* 输入， 可以是以下任一个，请使用 *GPG key ID*:

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

