# Makefile shell 中绝对路径的正确处理


[Makefile](https://www.gnu.org/software/make/manual/make.html) 与 shell(主要是 [Bash](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/html_node/index.html#SEC_Contents)) 中绝对路径的处理。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## Makefile

>make version: `3.81`

`BASEDIR = $(dir $(realpath $(firstword $(MAKEFILE_LIST))))`

```tex
GNU Make 3.81
Copyright (C) 2006  Free Software Foundation, Inc.
This is free software; see the source for copying conditions.
There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.

This program built for i386-apple-darwin11.3.0
```

## Linux Shell

>Bash version: `5.1`

- `DIR=$(cd $(dirname $0) && pwd)`
- `DIR=$(cd $(dirname $0); pwd)`
- `DIR=$(cd dirname $0; pwd)`
- `DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && pwd)`
- `ROOT_DIR="${DIR##*/}"`
- `FILE_NAME=$(basename "$0")`

{{< admonition warning >}}
`BASH_SOURCE` 只适用于有 **bash** 环境

>`cat /etc/shells` 本机支持 `shell` 查看
{{< /admonition >}}

## 实例

以上使用实例请参考: [docker-compose-resources](https://github.com/v8fg/docker-compose-resources)

- [Makefile](https://github.com/v8fg/docker-compose-resources/blob/release/Makefile)
- [docker-build.sh](https://github.com/v8fg/docker-compose-resources/blob/release/scripts/docker-build.sh)

