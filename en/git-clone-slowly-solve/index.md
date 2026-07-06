# Solving Painfully Slow git clone


If you work with GitHub a lot, operations like `clone`, `fetch`, `pull` and `push` often fail with mysterious timeouts or crawl along painfully slowly — a real drain on productivity. This post walks through several working solutions.

<!--more-->

There are many possible causes; the most likely is that your network is being throttled — for example at `github.global.ssl.fastly.net`.

>Using the [docker-compose-resources](https://github.com/v8fg/docker-compose-resources.git) project as an example: `git clone https://github.com/v8fg/docker-compose-resources.git`

## Solutions

### GitHub mirror repositories

- **Search the web for a mirror URL, swap it in, then download**
  - `https://hub.fastgit.org` (availability not guaranteed)
  - `https://github.91chi.fun` (availability not guaranteed)
- Install a browser extension: **GitHub accelerator**, then clone via the accelerated URL it provides
- *Clone through another Git hosting mirror*
- *Download the ZIP directly in the browser*

### Proxy acceleration

- **proxy** *not really recommended*
- [gh-proxy](https://github.com/hunshcn/gh-proxy) (**recommended**)
- [FastGithub](https://github.com/creazyboyone/FastGithub) (**recommended ☆☆☆☆☆☆**)

#### FastGithub

>A miracle tool for GitHub acceleration: fixes GitHub failing to open, avatars not loading, releases failing to upload/download, and git-clone / git-pull / git-push errors.

##### Features

- Clean IP resolution for the relevant domains
- IP speed testing, automatically picking the fastest IP
- Custom TLS connection configuration per domain
- Replaces Google CDN resources, fixing the failure to load JS and CSS on many overseas sites

##### Install & configure

>- [FastGithub](https://github.com/creazyboyone/FastGithub)
>- [github-release](https://github.com/creazyboyone/FastGithub/releases)

```bash
# linux-x64
## terminal start
sudo ./fastgithub
# set the system auto-proxy to http://127.0.0.1:38457, or manually proxy http/https to 127.0.0.1:38457

## service start
sudo ./fastgithub start // install and start as a systemd service
sudo ./fastgithub stop  // uninstall and remove the systemd service
# set the system auto-proxy to http://127.0.0.1:38457, or manually proxy http/https to 127.0.0.1:38457

# macOS-x64
## 1. start fastgithub
## 2. install cacert/fastgithub.cer and set it as trusted
# set the system auto-proxy to http://127.0.0.1:38457, or manually proxy http/https to 127.0.0.1:38457

# certificate verification
# if git reports "SSL certificate problem",
# disable git's certificate verification: git config --global http.sslverify false
```

##### Security & legality note

>Excerpted from [FastGithub.README](https://github.com/creazyboyone/FastGithub#readme)

*FastGithub generates a self-signed CA certificate for each host, stored under the cacert folder. Client devices must install and unconditionally trust this self-signed CA certificate. Do not leak the certificate's private key to anyone, to avoid losses.*

*"FastGithub's local proxy only uses the international exit channels provided by the public telecom network. The traffic between overseas GitHub servers and the FastGithub program on a domestic user's machine flows over normal channels, with no extra encryption applied beyond the page's own TLS (unlike the encrypted traffic of a proxy). The entire proxy process after FastGithub retrieves the page data takes place domestically, so the regulations on international internetworking do not apply."*

### Hosts tweak

>The idea is to use `nslookup` or `dig` to find a reachable IP for the domain, then add an `ip -> domain` mapping to your hosts file and flush the DNS cache.

The hosts file is what an OS uses to quickly resolve IP addresses and hostnames. On Linux it is stored in ASCII under `/etc` and named `hosts` (on some distros the path differs — for example Debian also has `/etc/hostname`). It holds IP-to-hostname mappings and host aliases. When no DNS server is available, every network program on the system queries this file to resolve a hostname to an IP; otherwise DNS is used. Mapping frequently visited domains to their IPs in hosts is a handy way to speed up access.

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

