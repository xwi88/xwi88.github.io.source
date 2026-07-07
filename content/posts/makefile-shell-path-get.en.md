---
url: "makefile-shell-path-get"
title: "Handling Absolute Paths Correctly in Makefile and Shell"
date: 2022-03-12T09:15:14+08:00
lastmod: 2022-03-12T09:52:00+08:00
draft: false

description: "Handling absolute paths correctly in Makefile and shell"

tags: ["shell"]
categories: ["linux"]

toc:
  auto: false
---

Handling absolute paths in [Makefile](https://www.gnu.org/software/make/manual/make.html) and shell (mainly [Bash](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/html_node/index.html#SEC_Contents)).

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

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
`BASH_SOURCE` only works where a **bash** shell is available

>`cat /etc/shells` lists the shells supported on this machine
{{< /admonition >}}

## Example

For working examples of the above, see: [docker-compose-resources](https://github.com/v8fg/docker-compose-resources)

- [Makefile](https://github.com/v8fg/docker-compose-resources/blob/release/Makefile)
- [docker-build.sh](https://github.com/v8fg/docker-compose-resources/blob/release/scripts/docker-build.sh)
