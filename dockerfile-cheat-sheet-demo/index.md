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

## ADD

## COPY

## ENTRYPOINT

## VOLUME

## USER

## WORKDIR

## ARG

## ONBUILD

## STOPSIGNAL

## HEALTHCHECK

## SHELL

## 示例

## 参考

- [Docker reference](https://docs.docker.com/reference/)
- [understand-how-arg-and-from-interact](https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact)
- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
- **[dockerfile_best-practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices)**

