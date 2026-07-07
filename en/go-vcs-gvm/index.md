# gvm: Go Version Manager


**gvm** is a CLI tool for **Linux**, **MacOS** and **Windows** — similar to **nvm** / *anaconda* — that lets you conveniently manage and switch between multiple **go** environments. Highly recommended.

<!--more-->

## Installation

### Mac OS X Requirements

```bash
# Mac OS X Requirements
xcode-select --install
brew update
brew install mercurial
```

### Install gvm

>[gvm](https://github.com/moovweb/gvm)

```bash
# zsh
zsh < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)

# bash use, choose one!
# bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
```

>On success, a hidden **.gvm** directory is created under your home folder, and the following line is appended to the bottom of your *.bashrc* or *.zshrc*:

```text
[[ -s "$HOME/.gvm/scripts/gvm" ]] && source "$HOME/.gvm/scripts/gvm"

# shall set GO_SOURCE_URL to speed binary install
export GO_SOURCE_URL=https://github.com/golang/go
```

>To support multiple shells at the same time, copy the snippet above into each shell's config file manually.

### Go environment config

Switching go versions with `gvm use <version>` changes several environment variables, such as:

- `GOMODCACHE="$HOME/.gvm/pkgsets/go1.17.7/global/pkg/mod"`
- `GOPATH="$HOME/.gvm/pkgsets/go1.17.7/global"`

The related gvm commands are: `linkthis`, `pkgset`, `pkgenv`. To reduce the impact of these env changes on development, you can pin `GOPATH` and friends:

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

## **gvm** usage

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

### Quick start

>`gvm use` *- select a go version to use (--default to set permanently)*

- gvm install go1.16.14 -B # if the machine has no go pre-installed
- gvm install go1.17.7
- gvm use go1.17.7 [--default]
- gvm uninstall go1.17.7
- *gvm install go1.17.7 --source=https://xxx@github.com/xxx/go*
- *gvm install go1.17.7 -s=https://godoc.org/golang.org/dl/go1.17.7*
- *gvm implode* **uninstall gvm**

## Example

```bash
# gvm list

gvm gos (installed)

   go1.16.14
=> go1.17.7
   go1.18rc1
   system
```

