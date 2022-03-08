# Go 版本管理工具 gvm


**gvm** 是一个 **Linux**， **MacOS**， **Windows** 下的命令行工具，类似于 **nvm**，*anaconda* 可以为你提供一个便捷的多版本 **go** 环境的管理和切换，强烈推荐使用。

<!--more-->

## 安装

### Mac OS X Requirements

```tex
# Mac OS X Requirements
xcode-select --install
brew update
brew install mercurial
```

### 安装 gvm

>[gvm](https://github.com/moovweb/gvm)

```bash
# zsh
zsh < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)

# bash use, choose one!
# bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
```

>安装成功，会在家目录下增加 **.gvm** 的隐藏目录，并且在 *.bashrc* 或者 *.zshrc* 文件最底部增加一行如下内容

```text
[[ -s "$HOME/.gvm/scripts/gvm" ]] && source "$HOME/.gvm/scripts/gvm"

# shall set GO_SOURCE_URL to speed binary install
export GO_SOURCE_URL=https://github.com/golang/go
```

>如果想同时支持多个 `shell` 环境，可手动复制上述内容到*相应* **shell** 配置文件!

### Go 环境配置

通过 `gvm use <version>` 切换 `go version`, 会改变部分环境变量，如:

- `GOMODCACHE="$HOME/.gvm/pkgsets/go1.17.7/global/pkg/mod"`
- `GOPATH="$HOME/.gvm/pkgsets/go1.17.7/global"`

gvm 与上述环境变量相关的命令有: `linkthis`, `pkgset`, `pkgenv`
为了降低环境变化对开发等的影响可固定`GOPATH` 等

```bash
# shall set GO_SOURCE_URL to speed source install
# default https://go.googlesource.com/go
export GO_SOURCE_URL=https://github.com/golang/go

# if use gvm, shall set some go env after gvm init statements

# export GO111MODULE=on
export GOPATH="$HOME/go"
export GOBIN="$GOPATH/bin"
export PATH="$GOBIN:$PATH"
export GOPROXY=https://goproxy.cn,https://goproxy.io/,https://mirrors.aliyun.com/goproxy/,https://gocenter.io/,https://proxy.golang.org,direct
```

## **gvm** 用法

```bash
Usage: gvm [command]

Description:
  GVM is the Go Version Manager

Commands:
  version    - print the gvm version number
  get        - gets the latest code (for debugging)
  use        - select a go version to use (--default to set permanently)
  diff       - view changes to Go root
  help       - display this usage text
  implode    - completely remove gvm
  install    - install go versions
  uninstall  - uninstall go versions
  cross      - install go cross compilers
  linkthis   - link this directory into GOPATH
  list       - list installed go versions
  listall    - list available versions
  alias      - manage go version aliases
  pkgset     - manage go packages sets
  pkgenv     - edit the environment for a package set
```

### **gvm install**

```bash
Usage: gvm install [version] [options]
    -s,  --source=SOURCE      Install Go from specified source.
    -n,  --name=NAME          Override the default name for this version.
    -pb, --with-protobuf      Install Go protocol buffers.
    -b,  --with-build-tools   Install package build tools.
    -B,  --binary             Only install from binary.
         --prefer-binary      Attempt a binary install, falling back to source.
    -h,  --help               Display this message.
```

### 简单使用

>`gvm use` *- select a go version to use (--default to set permanently)*

- gvm install go1.16.14 -B # 如果机器没有 pre installed go version
- gvm install go1.17.7
- gvm use go1.17.7 [--default]
- gvm uninstall go1.17.7
- *gvm install go1.17.7 --source=https://xxx@github.com/xxx/go*
- *gvm install go1.17.7 -s=https://godoc.org/golang.org/dl/go1.17.7*
- *gvm implode* **卸载 gvm**

## 示例

```bash
# gvm list

gvm gos (installed)

   go1.16.14
=> go1.17.7
   go1.18rc1
   system
```

