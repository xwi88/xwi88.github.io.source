# Git 克隆非常慢问题的解决


对于经常使用 github 的人来说，当我们进行 clone, fetch, pull, push 等等操作时，如果总是出现莫名的超时或者非常慢这是很让人捉急的，会严重影响效率，为此本文给出了几种解决方案。

<!--more-->

造成上述情况的原因是多方面的，最大的可能就是网络被限制了, 如: `github.global.ssl.fastly.net`。

>以项目 [docker-compose-resources](https://github.com/v8fg/docker-compose-resources.git) clone 为例: `git clone https://github.com/v8fg/docker-compose-resources.git`

## 解决方案

### Github 镜像仓库

- **浏览器搜索获取镜像地址替换后下载**
  - `https://hub.fastgit.org` (不保证可用)
  - `https://github.91chi.fun` (不保证可用)
- 浏览器安装插件: **github 加速器**, 通过此插件获取加速地址后 clone
- *通过其他 git 存储库进行镜像 clone*
- *浏览器直接下载 zip*

### 代理加速

- **proxy** *不太推荐*
- [gh-proxy](https://github.com/hunshcn/gh-proxy) (**推荐方案**)
- [FastGithub](https://github.com/dotnetcore/FastGithub) (**推荐方案 ☆☆☆☆☆☆**)

#### FastGithub

>github 加速神器: 解决 github 打不开,用户头像无法加载,releases 无法上传下载, git-clone, git-pull, git-push 失败等问题。

##### 功能

- 提供域名的纯净 IP 解析；
- 提供 IP 测速并选择最快的 IP；
- 提供域名的 tls 连接自定义配置；
- google 的 CDN 资源替换，解决大量国外网站无法加载 js 和 cs s的问题；

##### 安装配置

>- [FastGithub](https://github.com/dotnetcore/FastGithub)
>- [github-release](https://github.com/dotnetcore/fastgithub/releases)

```bash
# linux-x64
## terminal start
sudo ./fastgithub
# 设置系统自动代理为http://127.0.0.1:38457，或手动代理http/https为127.0.0.1:38457

## service start
sudo ./fastgithub start // 以systemd服务安装并启动
sudo ./fastgithub stop  // 以systemd服务卸载并删除
# 设置系统自动代理为http://127.0.0.1:38457，或手动代理http/https为127.0.0.1:38457

# macOS-x64
## 1. start fastgithub
## 2. install cacert/fastgithub.cer and set trustt
# 设置系统自动代理为http://127.0.0.1:38457，或手动代理http/https为127.0.0.1:38457

# 证书验证
# 若 git 操作提示 SSL certificate problem
# 需要关闭 git 的证书验证：git config --global http.sslverify false
```

##### 安全性及合法性说明

>以下内容摘录自 [FastGithub.README](https://github.com/dotnetcore/FastGithub.README.md)

*FastGithub为每台不同的主机生成自颁发CA证书，保存在cacert文件夹下。客户端设备需要安装和无条件信任自颁发的CA证书，请不要将证书私钥泄露给他人，以免造成损失。*

*《国际联网暂行规定》第六条规定：“计算机信息网络直接进行国际联网，必须使用邮电部国家公用电信网提供的国际出入口信道。任何单位和个人不得自行建立或者使用其他信道进行国际联网。” FastGithub本地代理使用的都是“公用电信网提供的国际出入口信道”，从国外Github服务器到国内用户电脑上FastGithub程序的流量，使用的是正常流量通道，其间未对流量进行任何额外加密（仅有网页原有的TLS加密，区别于*proxy*的流量加密），而FastGithub获取到网页数据之后发生的整个代理过程完全在国内，不再适用国际互联网相关之规定。*

### Hosts 修改

>主要是借助 `nslookup` or `dig` 获取域名对应的可访问 ip, 然后在 hosts 文件中加上 `ip–>domain` 的映射，刷新 DNS 缓存便可。

hosts 文件是 Linux 系统中一个负责 IP 地址与域名快速解析的文件,以 ASCII 格式保存在 /etc 目录下,文件名为 hosts (不同的 Linux 版本,这个配置文件也可能不同.比如 Debian 的对应文件是 /etc/hostname) hosts 文件包含了 IP 地址和主机名之间的映射,还包括主机名的别名.在没有域名服务器的情况下,系统上的所有网络程序都通过查询该文件来解析对应于某个主机名的 IP 地址,否则就需要使用 DNS 服务程序来解决.通常可以将常用的域名和 IP 地址映射加入到 hosts 文件中,实现快速方便的访问.

>- `nslookup github.global.ssl.fastly.net`
>- `nslookup github.com`

```bash
# vi /etc/hosts
xxx github.global.ssl.fastly.net
xx github.com 

# refresh DNS cache
# linux
sudo /etc/init.d/networking restart
# or nscd -i hosts
# arch linux
/etc/rc.d/nscd restart
## macos
lookupd -flushcache
# dscacheutil -flushcache
```

