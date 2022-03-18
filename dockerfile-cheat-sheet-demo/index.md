# Dockerfile 指令小抄与构建示例


主要介绍 [`Dockerfile`](https://docs.docker.com/engine/reference/builder/) 文件内容组成，指令，镜像构建示例及操作。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## Dockerfile 简介

`Dockerfile` 是一个用来构建镜像的文本文件，由一条条构建镜像所需的指令（`instruction`）和说明组成。每一条指令构建一层。

默认执行构建命令 `docker build .` 会在当前路径下查找名为 `Dockerfile` 的文件，也可以指定路径及文件名：`docker build -f xxx/path/DockerfileName .`

## `.dockerignore`

{{< admonition warning >}}
为了提高构建的性能，可以通过在上下文目录中添加 `.dockerignore` 文件来排除文件和目录。如果你的项目目录下有较多或较大的不必要参与镜像构建的文件，请将其排除，这对于加快构建速度、减少镜像体积将会非常有用。
{{< /admonition >}}

## 基本组成

>支持以 `#` 开头的注释行，可以放在任意行的开头位置，不建议在 `#` 前保留多余的空格。

- 基础镜像信息
- 维护者信息
- 镜像操作指令
- 容器启动执行指令

### 所有指令

>- [**FROM**](#from)
>- [RUN](#run)
>- [CMD](#cmd)
>- [LABEL](#label)
>- [EXPOSE](#expose)
>- [ENV](#env)
>- [ADD](#add)
>- [COPY](#copy)
>- [ENTRYPOINT](#entrypoint)
>- [VOLUME](#volume)
>- [USER](#user)
>- [WORKDIR](#workdir)
>- [ARG](#arg)
>- [ONBUILD](#onbuild)
>- [STOPSIGNAL](#stopsignal)
>- [HEALTHCHECK](#healthcheck)
>- [SHELL](#shell)

## **FROM**

- `FROM [--platform=<platform>] <image> [AS <name>]`
- `FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]`
- `FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]`

`FROM` 指令**初始化一个新的构建阶段，并为后续指令设置基本镜像**。因此，**有效的 `Dockerfile` 必须以 `FROM` 指令开始**。

- `ARG` 是 `Dockerfile` 中能出现在 `FROM` 之前的唯一指令。
- `FROM` 可以在单个 `Dockerfile` 中出现多次，以*创建多个镜像*，或者**使用一个构建阶段作为另一个构建阶段的依赖项**。只需在每个新的 `FROM` 指令之前记录提交的最后一个镜像 ID 即可。每个 `FROM` 指令都会清除前面指令创建的任何状态。
- 通过向 `FROM` 指令添加 `AS <name>` ，可以为新的构建阶段提供名称。可以在后续的 `FROM` 和 `COPY --from=<name>` 指令中使用该名称来引用在这个阶段构建的镜像。
- 标签 `tag` 或摘要值 `digest` 是可选的。如果省略它们中的任何一个，构建器将默认使用标签 `latest`。如果构建器找不到标记值，则返回一个错误。
- 可以通过 `--platform=<platform>` 指定 `FROM` 引用的是哪个平台的镜像。例如：`linux/amd64`、 `linux/arm64` 或 `windows/amd64`。默认使用构建请求的目标平台。可以在这个标志中使用全局构建参数，如：[全局范围内自动平台参数](https://docs.docker.com/engine/reference/builder/#automatic-platform-args-in-the-global-scope)，允许你强制指定一个阶段的本机构建平台`(--platform=$BUILDPLATFORM)`，并使用它在此构建阶段内交叉编译到目标平台。

### **ARG 参数与 FROM 交互**

> 由 `ARG` 指令声明的变量，可以出现在第一个 `FROM` 指令之前。

```Dockerfile
# FROM instructions support variables that are declared by any ARG instructions that occur before the first FROM.

ARG CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```

### ARG 参数作用域

```Dockerfile
# VERSION outside of a build stage, can`t be used in any instruction after a FROM
ARG VERSION=latest
FROM busybox:$VERSION

# To use the default value of an ARG declared before the first FROM use an ARG instruction without a value inside of a build stage
ARG VERSION
RUN echo $VERSION > image_version

ARG VERSION=old
# guess what? old
RUN echo $VERSION > image_version

ARG VERSION
# guess what? latest, again use ARG VERSION without value will override the before $VERSION
RUN echo $VERSION > image_version
```

## RUN

- `RUN <command>` (以 `shell` 形式运行, *linux* 下默认:  `/bin/sh -c`， *Windows* 下默认: `cmd /S /C`)
- `RUN ["executable", "param1", "param2"]` (*exec* 形式)

`RUN` 指令将在当前镜像顶部的**新层**中执行任何命令并提交结果。生成的提交镜像将用于 `Dockerfile` 中的下一步。

`exec` 形式可以避免 `shell` 字符串转换，并使用不包含 `shell` 可执行文件的基本镜像运行命令。

- 可以使用 `SHELL` 命令更改默认 `shell`
- 可以使用 `\` *backslash* 让单条 `RUN` 指令跨行，适用于指令较长的情况。

>替换默认 `shell`

{{< admonition  example >}}

```bash
RUN /bin/bash -c 'source $HOME/.bashrc; \
echo $HOME'

# equivalent to
RUN /bin/bash -c 'source $HOME/.bashrc; echo $HOME'
```

>The `exec` form is parsed as a **JSON array**, which means that you must use double-quotes (`"`) around words not single-quotes (`'`).

```bash
# To use a different shell, other than '/bin/sh', use the exec form passing in the desired shell. For example:

RUN ["/bin/bash", "-c", "echo hello"]
```

{{< /admonition >}}

### RUN 指令缓存

- `在下一次构建期间，RUN` 指令的缓存不会自动失效
- `RUN apt-get dist-upgrade-y` 这样的指令的缓存将在下一次构建期间重用
- `--no-cache` 标志使 `RUN` 指令的缓存失效，`docker build --no-cache`
- **`ADD`、`COPY` 可以使 `RUN` 指令缓存失效**

## CMD

- `CMD ["executable","param1","param2"]` (*exec* form, this is the preferred form)
- `CMD ["param1","param2"]` (as *default parameters* to **ENTRYPOINT**)
- `CMD command param1 param2` (*shell* form)

### 注意事项

- 一个 `Dockerfile` 只能有一个 `CMD` 指令，如果有多个则只有最后一个会生效。
- `CMD` 的主要目的是为正在执行的容器提供缺省值。这些缺省值可以包括可执行文件，也可以省略可执行文件，在这种情况下，你必须指定 `ENTRYPOINT` 指令。
- 如果使用 `CMD` 为 `ENTRYPOINT` 指令提供默认参数，则应使用 `JSON` 数组格式指定 `CMD` 和 `ENTRYPOINT` 指令。
- **如果希望容器每次都运行相同的可执行文件，那么应该考虑结合使用 `ENTRYPOINT` 和 `CMD`**
- **如果用户指定参数来运行 `docker`，那么它们将覆盖 `CMD` 中指定的缺省值**
- 不要将 `RUN` 与 `CMD` 混淆。`RUN` *实际上运行一个命令并提交结果*; `CMD` *在构建时不执行任何内容，但是为镜像指定预期的命令*。

## LABEL

>`LABEL <key>=<value> <key>=<value> <key>=<value> ...`

{{< admonition example >}}

```bash
LABEL multi.label1="value1" multi.label2="value2" other="value3"

# 等价
LABEL multi.label1="value1" \
      multi.label2="value2" \
      other="value3"
```

{{< /admonition >}}

>image 标签查看: `docker image inspect --format='' <image_id | image_name>`

## EXPOSE

>`EXPOSE <port> [<port>/<protocol>...]`

`EXPOSE` 指令通知 `Docker` 容器在运行时监听指定的网络端口。你可以指定端口侦听 `TCP` 或 `UDP`，如果没有指定协议，则默认为 `TCP`。

`EXPOSE` 指令**实际上并不发布端口**。它介于构建镜像的人和运行容器的人之间的关于发布哪些端口的文档。要在运行容器时实际发布端口，可以使用 `docker run` 上的 `-p` 标志发布和映射一个或多个端口，或使用 `-P` 标志发布所有公开的端口并将它们映射到高阶端口(所有端口一一映射)。

默认情况下，`EXPOSE` 假设为 TCP。您也可以指定 UDP:

```bash
# expose udp
EXPOSE 80/udp

# expose both: tcp and udp
EXPOSE 80/tcp
EXPOSE 80/udp
```

### expose for run

- `P` Publish all exposed ports to the host interfaces
- `p=[]` Publish a container's port or a range of ports to the host

- `docker run -p 80:80/tcp -p 80:80/udp ...`
- `docker run -p 80-81:80-81/tcp`

## ENV

>`ENV <key>=<value> ...`

{{< admonition example >}}

- `ENV MY_NAME="John Doe"`
- `ENV MY_DOG=Rex\ The\ Dog`
- `ENV MY_CAT=fluffy`
- **multiple `<key>=<value> ...`**
- ~~`ENV key value` **避免使用，后续可能移出，容易混淆出错**~~

```tex
ENV MY_NAME="John Doe" MY_DOG=Rex\ The\ Dog \
    MY_CAT=fluffy
```

{{< /admonition >}}

- 构建阶段生效，可被覆盖
- 值将在构建阶段的所有**后续指令**的环境中，并且可以在指令行内被替换。环境变量替换将在整个指令中对每个变量使用相同的值。
- `ENV` 设置的值将会被**持久化**到输出镜像中。
  - 可以通过 `docker inspect` 查看
  - 可以通过运行容器时输入参数覆盖: `docker run --env <key>=<value>`
- **副作用**: 你指定的环境变量可能会影响到后续镜像构建行为，请谨慎处理
  - 可通过 `RUN <key>=<value> [<command>]` 方式，让其只在单行指令生效
  - 可通过 `ARG` 设置参数值，不会持久化到输出镜像中。

```bash
ENV abc=hello # hello
ENV abc=bye def=$abc # abc=bye, def=hello; 
ENV ghi=$abc # ghi=bye
```

## ADD

- `ADD [--chown=<user>:<group>] <src>... <dest>`
- `ADD [--chown=<user>:<group>] ["<src>",... "<dest>"]`  **路径含有空格必须使用此指令**

>说明

- `--chown` 仅适用于 `Linux` 容器
  - `/etc/passwd` `/etc/group` 到 `user`, `group` 转换需要
- 指令用于复制：源支持`文件`、`目录`及`远程地址 URLs`
  - **从外部复制到构建镜像中**
  - `src` 支持多个源复制到指定目标地址
  - `src` 可以包含通配符，也即支持正则匹配
- `dest` 可以是绝对路径或相对路径(相对于 `WORKDIR`)

{{< admonition example >}}

- `ADD hom* /mydir/`
- `ADD hom?.txt /mydir/`
- `ADD test.txt relativeDir/`
- `ADD test.txt /absoluteDir/`
- `ADD arr[[]0].txt /mydir/` **`arr[0].txt`** *following the `Golang rules`*

如果不指定 `--chown`，则默认 `UID=GID=0`；**UID/GID** 支持: `username`, `groupname`, or `UID/GID` 组合

```bash
ADD --chown=55:mygroup files* /somedir/
ADD --chown=bin files* /somedir/
ADD --chown=1 files* /somedir/
ADD --chown=10:11 files* /somedir/
```

{{< admonition warning >}}

- 如果使用了 `username/groupname`，但不存在相应的 `user` 或 `group` 则指令执行会失败
- 使用 `IDs` 将不会检查，不依赖容器根文件系统内容
- `docker build - < somefile` **没有构建上下文，`ADD` 只支持 `URLs` 形式**
- 如果 `URL` 文件使用身份验证来保护，那么你需要使用 `RUN wget`、 `RUN curl` 或者使用容器内的其他工具，因为 **`ADD` 指令不支持身份验证**。
- **`<src>` 路径必须在构建上下文中**，`docker build` 指定上下文路径并发送给 `docker daemon`
- `src` 是 *URL*， `dest` 以 `dir/` 结尾或 `filename` 意义不同
  - `trailing slash`，如：`dir/` 创建文件到目录 `dir/`
  - `no trailing slash`，如：`filename` 创建文件名为 `filename`
- `src` 是 可被识别的 `local tar archive` (`identity`, `gzip`, `bzip2` or `xz`) 文件将作为目录解压
- 如果 `dest` 没有以斜杠结尾，那么它将被视为一个**常规文件**，`src` 的内容将在 `dest` 中写入。
- 如果 `dest` 不存在，则创建该目录并在其路径中创建所有缺少的目录。

{{< /admonition >}}
{{< /admonition >}}

## COPY

- `COPY [--chown=<user>:<group>] <src>... <dest>`
- `COPY [--chown=<user>:<group>] ["<src>",... "<dest>"]` **路径含有空格必须使用此指令**

>说明

- `--chown` 仅适用于 `Linux` 容器
  - `/etc/passwd` `/etc/group` 到 `user`, `group` 转换需要
- **指令用于复制：源支持`文件`、`目录`**
  - **从外部复制到构建镜像中**
  - `src` 支持多个源复制到指定目标地址
  - `src` 可以包含通配符，也即支持正则匹配
  - **与 `ADD` 不同，不支持 `URLs`**
- `dest` 可以是绝对路径或相对路径(相对于 `WORKDIR`)

{{< admonition example >}}

- `ADD hom* /mydir/`
- `ADD hom?.txt /mydir/`
- `ADD test.txt relativeDir/`
- `ADD test.txt /absoluteDir/`
- `ADD arr[[]0].txt /mydir/` **`arr[0].txt`** *following the `Golang rules`*

如果不指定 `--chown`，则默认 `UID=GID=0`；**UID/GID** 支持: `username`, `groupname`, or `UID/GID` 组合

```bash
ADD --chown=55:mygroup files* /somedir/
ADD --chown=bin files* /somedir/
ADD --chown=1 files* /somedir/
ADD --chown=10:11 files* /somedir/
```

{{< admonition warning >}}

- 如果使用了 `username/groupname`，但不存在相应的 `user` 或 `group` 则指令执行会失败
- 使用 `IDs` 将不会检查，不依赖容器根文件系统内容
- 没有构建上下文，`COPY` 不可用
- **支持 `COPY --from=<name>`**
  - **`name` 来自 `FROM .. AS <name>`**
  - **如果找不到构建名为 `name` 的阶段，将会尝试使用同名镜像替代**
- **`<src>` 路径必须在构建上下文中**，`docker build` 指定上下文路径并发送给 `docker daemon`
- 如果 `dest` 没有以斜杠结尾，那么它将被视为一个**常规文件**，`src` 的内容将在 `dest` 中写入。
- 如果 `dest` 不存在，则创建该目录并在其路径中创建所有缺少的目录。

{{< /admonition >}}
{{< /admonition >}}

## ENTRYPOINT

- `ENTRYPOINT ["executable", "param1", "param2"]` `exec 形式` **推荐形式**
- `ENTRYPOINT command param1 param2` `shell 形式` **不能接受命令行参数，`CMD` 或 `run` 传递的**

>说明

- `ENTRYPOINT` 允许你对将运行的容器进行配置
- 只有最后一个 `ENTRYPOINT` 会生效
- `docker run <image>` 的命令行参数将附加在 `exec` 形式的 `ENTRYPOINT` 后，且这些参数会覆盖定义在 `CMD` 中的参数。这允许通过命令行传递参数给 `ENTRYPOINT`。
- 可以通过 `docker run --entrypoint` 来覆盖 `ENTRYPOINT`
- `exec` 形式不会调用 *shell 命令行*，如果想使用 shell，可以在 `ENTRYPOINT` 中指定 `sh -c`：如，`ENTRYPOINT [ "sh", "-c", "echo $HOME" ]`
- `shell` 形式将作为 `/bin/sh-c` 的子命令启动，它不传递信号。这意味着执行程序不会是容器中 `PID 1` 的，也不会接收 `Unix` 信号，因此你的可执行文件不会接收来自 `docker stop <container>` 的 `SIGTERM`

### exec 形式 ENTRYPOINT 示例

>[Exec form ENTRYPOINT example](https://docs.docker.com/engine/reference/builder/#exec-form-entrypoint-example)*

{{< admonition example >}}

```Dockerfile
FROM ubuntu
ENTRYPOINT ["top", "-b"]
CMD ["-c"]
```

>构建镜像 `top`，`docker build -t top .`
>
>启动容器 `docker run -it --rm --name test top -H`

```tex
top - 16:04:58 up  8:38,  0 users,  load average: 0.25, 0.10, 0.04
Threads:   1 total,   1 running,   0 sleeping,   0 stopped,   0 zombie
%Cpu(s): 33.3 us, 33.3 sy,  0.0 ni, 33.3 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   4180.6 total,    560.5 free,    326.4 used,   3293.7 buff/cache
MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.   3242.2 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0    5972   3136   2712 R   0.0   0.1   0:00.03 top
```

To examine the result further, you can use `docker exec`

>`docker exec -it test ps aux`

```tex
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  3.0  0.0   5972  3216 pts/0    Ss+  16:05   0:00 top -b -H
root         8  0.0  0.0   5900  2920 pts/1    Rs+  16:05   0:00 ps aux
```

And you can gracefully request `top` to shut down using `docker stop test`

>`/usr/bin/time docker stop test`

```tex
test
        0.35 real         0.14 user         0.07 sys
```

{{< /admonition >}}

### shell 形式 ENTRYPOINT 示例

>*[Shell form ENTRYPOINT example](https://docs.docker.com/engine/reference/builder/#shell-form-entrypoint-example)*

#### **shell 形式 `exec` 执行**

{{< admonition example >}}

```Dockerfile
FROM ubuntu
ENTRYPOINT exec top -b
```

>`docker run -it --rm --name test top`

```tex
top - 16:37:19 up  9:10,  0 users,  load average: 0.20, 0.08, 0.02
Tasks:   1 total,   1 running,   0 sleeping,   0 stopped,   0 zombie
%Cpu(s): 20.0 us, 40.0 sy,  0.0 ni, 20.0 id, 20.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   4180.6 total,    560.9 free,    323.7 used,   3296.0 buff/cache
MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.   3244.9 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0    5972   3236   2812 R   0.0   0.1   0:00.04 top
```

>`docker exec -it test ps aux`

```tex
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  1.0  0.0   5972  3200 pts/0    Ss+  16:55   0:00 top -b
root         8  0.0  0.0   5900  2924 pts/1    Rs+  16:55   0:00 ps aux
```

>`/usr/bin/time docker stop test`

```tex
test
        0.35 real         0.15 user         0.08 sys
```

{{< /admonition >}}

#### shell 形式执行

{{< admonition example >}}

```Dockerfile
FROM ubuntu
ENTRYPOINT top -b
CMD "param_inner"
```

>`docker run -it --rm --name test top param_outer`

```tex
top - 16:34:25 up  9:08,  0 users,  load average: 0.06, 0.06, 0.02
Tasks:   2 total,   1 running,   1 sleeping,   0 stopped,   0 zombie
%Cpu(s): 50.0 us, 50.0 sy,  0.0 ni,  0.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   4180.6 total,    560.9 free,    324.3 used,   3295.4 buff/cache
MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.   3244.4 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0    2616    592    528 S   0.0   0.0   0:00.03 sh
    8 root      20   0    5972   3188   2772 R   0.0   0.1   0:00.00 top
```

**`docker stop test` 不会直接退出，等待超时后退出，可通过下面命令验证**

>`docker exec -it test ps aux`

```tex
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.3  0.0   2616   600 pts/0    Ss+  16:46   0:00 /bin/sh -c top
root         7  0.0  0.0   5972  3128 pts/0    S+   16:46   0:00 top -b
root        24  0.0  0.0   5900  2836 pts/1    Rs+  16:46   0:00 ps aux
```

>`/usr/bin/time docker stop test`

```tex
test
       10.33 real         0.13 user         0.07 sys
```

{{< /admonition >}}

### **CMD 与 ENTRYPOINT 交互**

>都定义了容器运行时要执行的命令

- `Dockerfile` 至少要有一个 `CMD` 或 `ENTRYPOINT` 指令
- `ENTRYPOINT` 当使用容器作为可执行文件时
- `CMD` 应该用作定义 `ENTRYPOINT` 命令或在容器中执行临时命令的*默认参数*的一种方式
- 当使用其他参数运行容器时，`CMD` 将被重写

#### **CMD 与 ENTRYPOINT 联合作用规则**

>如果基本镜像定义了 `CMD`，那么设置 `ENTRYPOINT` 将会把 `CMD` 重置为空值。

|   | No ENTRYPOINT | ENTRYPOINT exec_entry p1_entry | ENTRYPOINT [“exec_entry”, “p1_entry”] |
|---|---|---|---|
| No CMD | error, not allowed | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry |
| CMD [“exec_cmd”, “p1_cmd”] | exec_cmd p1_cmd | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry exec_cmd p1_cmd |
| CMD [“p1_cmd”, “p2_cmd”] | p1_cmd p2_cmd | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry p1_cmd p2_cmd |
| CMD exec_cmd p1_cmd | /bin/sh -c exec_cmd p1_cmd | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry /bin/sh -c exec_cmd p1_cmd |

## VOLUME

- `VOLUME ["/data"]`

>`VOLUME` 指令创建一个具有指定名称的挂载点，并将其标记为从本机主机或其他容器保存外部挂载的卷。这个值可以是 `JSON` 数组、 `VOLUME [”/var/log/”]` ，或具有多个参数的普通字符串，如 `VOLUME/var/log` 或 `VOLUME/var/log/var/var/db`。
>
>更多请参考: [Share Directories via Volumes](https://docs.docker.com/storage/volumes/)

{{< admonition example >}}

```Dockerfile
FROM ubuntu
RUN mkdir /myvol
RUN echo "hello world" > /myvol/greeting
VOLUME /myvol
```

>将在容器内部生成一个挂载目录 `/myvol`

```tex
root@abef26d10e25:/# ll myvol/*
-rw-r--r-- 1 root root 12 Mar 18 17:21 myvol/greeting
```

{{< /admonition >}}

- 从 Dockerfile 中更改卷: 如果任何构建步骤在声明卷之后更改了卷中的数据，那么这些更改将被丢弃。
  - 在文件最后声明!
- SON 格式化: 列表被解析为 JSON 数组。必须用双引号(”)而不是单引号(’)括住单词。
- 主机目录在容器运行时声明: 主机目录(挂载点)本质上是依赖于主机的。这是为了保持镜像的可移植性，因为不能保证给定的主机目录在所有主机上都可用。由于这个原因，你不能从 Dockerfile 中挂载主机目录。VOLUME 指令不支持指定 `host-dir` 参数。在创建或运行容器时，必须指定挂载点。

## USER

- `USER <user>[:<group>]`
- `USER <UID>[:<GID>]`

`USER` 指令设置运行镜像时要使用的用户名(或 `UID`)和可选的用户组(或 `GID`) ，以及 `Dockerfile` 中跟随它的任何 `RUN`、 `CMD` 和 `ENTRYPOINT` 指令。

>**在为用户指定组时，用户将只具有指定的组成员身份。任何其他配置的组成员关系都将被忽略。**

## WORKDIR

- `WORKDIR /path/to/workdir`

## ARG

## ONBUILD

## STOPSIGNAL

## HEALTHCHECK

## SHELL

## 示例

## 最佳实践

- **`ADD` `COPY`** `src` 引用内容变化将会使之后的 `RUN` 缓存失效
  - 尽量将其放到最后或者使用其他命令代替
  - 尽量保持 `src` 不变
- `RUN` 将多个 `RUN` 指令尽可能的组合在一起，减少镜像层数
- `PID=1` 才能被 `docker stop` 终止，shell 形式的 `sh -c` `PID!=1`
- 执行 `docker stop`， `PID=1` 的容器干净的退出；`stop` 超时后发送 `SIGKILL` 来终止
- [CMD 与 ENTRYPOINT 联合作用规则](#cmd-与-entrypoint-联合作用规则)

## 参考

- [Docker reference](https://docs.docker.com/reference/)
- [understand-how-arg-and-from-interact](https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact)
- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
- **[dockerfile_best-practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices)**

