# Dockerfile Instructions Cheat Sheet & Build Examples


An overview of the [`Dockerfile`](https://docs.docker.com/engine/reference/builder/) format and instructions, plus image-build examples and operations.

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

## Dockerfile overview

A `Dockerfile` is a text file used to build an image, made up of the instructions (`instruction`) and notes needed to build it. Each instruction builds one layer.

By default `docker build .` looks for a file named `Dockerfile` in the current directory; you can also pass a path and filename: `docker build -f xxx/path/DockerfileName .`

## `.dockerignore`

{{< admonition warning >}}
To speed up builds, add a `.dockerignore` file in the build context to exclude files and directories. If your project has many large files that don't need to be in the image, excluding them really helps build speed and image size.
{{< /admonition >}}

## Basic structure

>Lines starting with `#` are comments and may appear anywhere; avoid extra spaces before `#`.

- Base image info
- Maintainer info
- Image-operation instructions
- Container-startup instruction

## All instructions

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

The `FROM` instruction **initializes a new build stage and sets the base image for subsequent instructions**. Therefore **a valid `Dockerfile` must start with a `FROM` instruction**.

- `ARG` is the only instruction that may appear before `FROM`.
- `FROM` may appear multiple times in a single `Dockerfile` to *create multiple images* or to **use one build stage as a dependency of another**. Just record the last image ID committed before each new `FROM`. Each `FROM` clears any state created by previous instructions.
- Adding `AS <name>` to `FROM` names the new build stage. You can reference it in later `FROM` and `COPY --from=<name>` instructions.
- `tag` and `digest` are optional. If omitted, the builder defaults to the `latest` tag. If the builder can't find the tag, it errors.
- `--platform=<platform>` specifies which platform's image `FROM` refers to, e.g. `linux/amd64`, `linux/arm64`, `windows/amd64`. It defaults to the target platform of the build request. You can use global build args in this flag, e.g. [automatic platform args in the global scope](https://docs.docker.com/engine/reference/builder/#automatic-platform-args-in-the-global-scope), letting you force the build stage's native platform `(--platform=$BUILDPLATFORM)` and cross-compile to the target within it.

### **ARG & FROM interaction**

> Variables declared by `ARG` may appear before the first `FROM`.

```Dockerfile
# FROM instructions support variables that are declared by any ARG instructions that occur before the first FROM.

ARG CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```

### ARG scope

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

- `RUN <command>` (shell form; default on *linux*: `/bin/sh -c`, on *Windows*: `cmd /S /C`)
- `RUN ["executable", "param1", "param2"]` (*exec* form)

`RUN` runs any command on top of the current image in a **new layer** and commits the result. The committed image is used for the next step in the `Dockerfile`.

The exec form avoids shell-string munging and lets you run commands in a base image that doesn't contain a shell.

- Use the `SHELL` command to change the default shell
- Use a `\` *backslash* to span a single `RUN` across lines for long commands

>Replacing the default shell

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

### RUN cache

- The `RUN` cache is **not** invalidated automatically on the next build
- A command like `RUN apt-get dist-upgrade -y` has its cache reused on the next build
- `--no-cache` invalidates the `RUN` cache: `docker build --no-cache`
- **`ADD` and `COPY` can invalidate the `RUN` cache**

## CMD

- `CMD ["executable","param1","param2"]` (*exec* form, this is the preferred form)
- `CMD ["param1","param2"]` (as *default parameters* to **ENTRYPOINT**)
- `CMD command param1 param2` (*shell* form)

### Notes

- A `Dockerfile` may have only one `CMD`; if there are several, only the last takes effect.
- `CMD`'s main purpose is to provide defaults for an executing container. The defaults may include an executable, or omit it — in which case you must also specify `ENTRYPOINT`.
- If you use `CMD` to provide default args to `ENTRYPOINT`, both should use the JSON-array form.
- **If you want the container to run the same executable every time, combine `ENTRYPOINT` and `CMD`**
- **If the user passes arguments to `docker run`, they override the `CMD` defaults**
- Don't confuse `RUN` with `CMD`. `RUN` *actually runs a command and commits the result*; `CMD` *does nothing at build time but specifies the intended command for the image*.

## LABEL

>`LABEL <key>=<value> <key>=<value> <key>=<value> ...`

{{< admonition example >}}

```bash
LABEL multi.label1="value1" multi.label2="value2" other="value3"

# equivalent
LABEL multi.label1="value1" \
      multi.label2="value2" \
      other="value3"
```

{{< /admonition >}}

>View image labels: `docker image inspect --format='' <image_id | image_name>`

## EXPOSE

>`EXPOSE <port> [<port>/<protocol>...]`

`EXPOSE` tells Docker the container listens on the specified network ports at runtime. You can specify TCP or UDP; if no protocol is given, TCP is the default.

`EXPOSE` **does not actually publish the port**. It's documentation between the person building the image and the person running the container about which ports to publish. To actually publish at runtime, use `-p` on `docker run` to publish and map one or more ports, or `-P` to publish all exposed ports to high ports.

By default `EXPOSE` assumes TCP. You can also specify UDP:

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
- ~~`ENV key value` **avoid — may be removed later; error-prone**~~

```tex
ENV MY_NAME="John Doe" MY_DOG=Rex\ The\ Dog \
    MY_CAT=fluffy
```

{{< /admonition >}}

- Takes effect during the build stage; can be overridden
- The value is in the environment of all **subsequent instructions** in the build stage and can be substituted inline. Substitution uses the same value for each variable across the whole instruction.
- Values set by `ENV` are **persisted** into the output image.
  - Viewable via `docker inspect`
  - Overridable at run time: `docker run --env <key>=<value>`
- **Side effect**: env vars you set may affect later build behavior — use carefully.
  - Use `RUN <key>=<value> [<command>]` to scope a value to a single instruction
  - Use `ARG` for build-time values that are not persisted into the image

```bash
ENV abc=hello # hello
ENV abc=bye def=$abc # abc=bye, def=hello;
ENV ghi=$abc # ghi=bye
```

## ADD

- `ADD [--chown=<user>:<group>] <src>... <dest>`
- `ADD [--chown=<user>:<group>] ["<src>",... "<dest>"]`  **required when paths contain spaces**

>Notes

- `--chown` applies only to `Linux` containers
  - needs `/etc/passwd` / `/etc/group` to resolve `user`, `group`
- Copies from sources that may be `files`, `directories`, or remote `URLs`
  - **Copies from outside into the image being built**
  - `src` supports multiple sources into one target
  - `src` may contain wildcards (regex matching)
- `dest` may be absolute or relative to `WORKDIR`

{{< admonition example >}}

- `ADD hom* /mydir/`
- `ADD hom?.txt /mydir/`
- `ADD test.txt relativeDir/`
- `ADD test.txt /absoluteDir/`
- `ADD arr[[]0].txt /mydir/` **`arr[0].txt`** *following the `Golang rules`*

Without `--chown`, `UID=GID=0` by default; **UID/GID** may be `username`, `groupname`, or a `UID/GID` combo

```bash
ADD --chown=55:mygroup files* /somedir/
ADD --chown=bin files* /somedir/
ADD --chown=1 files* /somedir/
ADD --chown=10:11 files* /somedir/
```

{{< admonition warning >}}

- If you use `username/groupname` and no matching `user`/`group` exists, the instruction fails
- Numeric `IDs` are not checked and don't depend on the container's rootfs contents
- `docker build - < somefile` **has no build context; `ADD` only supports URLs in this mode**
- If the `URL` file requires auth, use `RUN wget`, `RUN curl` or another in-container tool — **`ADD` does not support authentication**
- **`<src>` paths must be inside the build context**; `docker build` sends the context path to the docker daemon
- When `src` is a *URL*, a trailing slash on `dest` (`dir/`) vs no slash (`filename`) behaves differently
  - `trailing slash`, e.g. `dir/` creates the file inside directory `dir/`
  - `no trailing slash`, e.g. `filename` creates a file named `filename`
- A recognized `local tar archive` (`identity`, `gzip`, `bzip2` or `xz`) is extracted as a directory
- If `dest` does not end with a slash, it's treated as a **regular file** and `src`'s contents are written into it
- If `dest` doesn't exist, it's created along with any missing directories in its path

{{< /admonition >}}
{{< /admonition >}}

## COPY

- `COPY [--chown=<user>:<group>] <src>... <dest>`
- `COPY [--chown=<user>:<group>] ["<src>",... "<dest>"]` **required when paths contain spaces**

>Notes

- `--chown` applies only to `Linux` containers
  - needs `/etc/passwd` / `/etc/group` to resolve `user`, `group`
- **Copies from sources that may be `files` or `directories`**
  - **Copies from outside into the image being built**
  - `src` supports multiple sources into one target
  - `src` may contain wildcards (regex matching)
  - **Unlike `ADD`, URLs are not supported**
- `dest` may be absolute or relative to `WORKDIR`

{{< admonition example >}}

- `ADD hom* /mydir/`
- `ADD hom?.txt /mydir/`
- `ADD test.txt relativeDir/`
- `ADD test.txt /absoluteDir/`
- `ADD arr[[]0].txt /mydir/` **`arr[0].txt`** *following the `Golang rules`*

Without `--chown`, `UID=GID=0` by default; **UID/GID** may be `username`, `groupname`, or a `UID/GID` combo

```bash
ADD --chown=55:mygroup files* /somedir/
ADD --chown=bin files* /somedir/
ADD --chown=1 files* /somedir/
ADD --chown=10:11 files* /somedir/
```

{{< admonition warning >}}

- If you use `username/groupname` and no matching `user`/`group` exists, the instruction fails
- Numeric `IDs` are not checked and don't depend on the container's rootfs contents
- Without a build context, `COPY` is unavailable
- **Supports `COPY --from=<name>`**
  - **`name` comes from `FROM .. AS <name>`**
  - **If no build stage named `name` is found, an image of the same name is tried instead**
- **`<src>` paths must be inside the build context**; `docker build` sends the context path to the docker daemon
- If `dest` does not end with a slash, it's treated as a **regular file** and `src`'s contents are written into it
- If `dest` doesn't exist, it's created along with any missing directories in its path

{{< /admonition >}}
{{< /admonition >}}

## ENTRYPOINT

- `ENTRYPOINT ["executable", "param1", "param2"]` `exec form` **recommended**
- `ENTRYPOINT command param1 param2` `shell form` **cannot accept args passed via CLI, `CMD`, or `run`**

>Notes

- `ENTRYPOINT` lets you configure the container as an executable
- Only the last `ENTRYPOINT` takes effect
- `docker run <image>` args are appended to the exec-form `ENTRYPOINT` and override `CMD` args, so you can pass args to `ENTRYPOINT` from the CLI
- Override with `docker run --entrypoint`
- The exec form does not invoke a *shell*; if you need one, specify `sh -c` in `ENTRYPOINT`, e.g. `ENTRYPOINT [ "sh", "-c", "echo $HOME" ]`
- The shell form runs as a subcommand of `/bin/sh -c` and doesn't pass signals. The executable won't be `PID 1` and won't receive `Unix` signals, so it won't receive `SIGTERM` from `docker stop <container>`

### exec form ENTRYPOINT example

>[Exec form ENTRYPOINT example](https://docs.docker.com/engine/reference/builder/#exec-form-entrypoint-example)*

{{< admonition example >}}

```Dockerfile
FROM ubuntu
ENTRYPOINT ["top", "-b"]
CMD ["-c"]
```

>Build the `top` image: `docker build -t top .`
>
>Start the container: `docker run -it --rm --name test top -H`

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

### shell form ENTRYPOINT example

>*[Shell form ENTRYPOINT example](https://docs.docker.com/engine/reference/builder/#shell-form-entrypoint-example)*

#### **shell form with `exec`**

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

#### shell form (no exec)

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

**`docker stop test` doesn't exit immediately — it exits after the timeout; verify with**

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

### **CMD and ENTRYPOINT interaction**

>Both define the command to run when the container starts.

- A `Dockerfile` must have at least one `CMD` or `ENTRYPOINT`
- `ENTRYPOINT` when using the container as an executable
- `CMD` should be the way to define *default parameters* for the `ENTRYPOINT` command, or a transient command to run in the container
- When the container is run with other args, `CMD` is overridden

#### **CMD and ENTRYPOINT interaction rules**

>If the base image defines a `CMD`, setting `ENTRYPOINT` resets `CMD` to empty.

|   | No ENTRYPOINT | ENTRYPOINT exec_entry p1_entry | ENTRYPOINT [“exec_entry”, “p1_entry”] |
|---|---|---|---|
| No CMD | error, not allowed | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry |
| CMD [“exec_cmd”, “p1_cmd”] | exec_cmd p1_cmd | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry exec_cmd p1_cmd |
| CMD [“p1_cmd”, “p2_cmd”] | p1_cmd p2_cmd | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry p1_cmd p2_cmd |
| CMD exec_cmd p1_cmd | /bin/sh -c exec_cmd p1_cmd | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry /bin/sh -c exec_cmd p1_cmd |

## VOLUME

- `VOLUME ["/data"]`

>The `VOLUME` instruction creates a mount point with the specified name and marks it as holding externally-mounted volumes from the host or other containers. The value may be a `JSON` array, `VOLUME [”/var/log/”]`, or a plain string with multiple args, e.g. `VOLUME /var/log` or `VOLUME /var/log /var/db`.
>
>See [Share Directories via Volumes](https://docs.docker.com/storage/volumes/)

{{< admonition example >}}

```Dockerfile
FROM ubuntu
RUN mkdir /myvol
RUN echo "hello world" > /myvol/greeting
VOLUME /myvol
```

>This creates a mount directory `/myvol` inside the container

```tex
root@abef26d10e25:/# ll myvol/*
-rw-r--r-- 1 root root 12 Mar 18 17:21 myvol/greeting
```

{{< /admonition >}}

- Changing a volume from the Dockerfile: if any build step changes data in a volume after it's declared, those changes are discarded.
  - Declare volumes at the end of the file!
- JSON formatting: the list is parsed as a JSON array. You must use double-quotes (`"`) not single-quotes (`'`).
- Host directories at runtime: host directories (mount points) are inherently host-dependent. This keeps images portable, since a given host directory isn't guaranteed on every host. For this reason you cannot mount a host directory from the Dockerfile. `VOLUME` does not support a `host-dir` argument. You must specify the mount point when creating/running the container.

## USER

- `USER <user>[:<group>]`
- `USER <UID>[:<GID>]`

`USER` sets the username (or `UID`) and optional group (or `GID`) to use when running the image, and for any `RUN`, `CMD`, and `ENTRYPOINT` that follow it in the `Dockerfile`.

>**When you specify a group for the user, the user has only that group's membership. Any other configured group memberships are ignored.**

## WORKDIR

- `WORKDIR /path/to/workdir`

- Sets the **working directory** for any `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, and `ADD` that follow it. If `WORKDIR` doesn't exist, it's created — even if it's not used in any later instruction.
- `WORKDIR` can be used multiple times. A relative path is relative to the previous `WORKDIR`.
- `WORKDIR` resolves `ENV` variables set before it
- If unset, `WORKDIR` defaults to `/`

```bash
WORKDIR /a
WORKDIR b
WORKDIR c
RUN pwd
# output /a/b/c

ENV DIRPATH=/path
WORKDIR $DIRPATH/$DIRNAME
RUN pwd
# output /path/$DIRNAME
```

## ARG

- `ARG <name>[=<default value>]`

- `ARG` defines a variable users can pass at build time with the **`--build-arg <varname>=<value>`** flag of `docker build`. *If a user passes a build arg not defined in the `Dockerfile`, the build prints a warning.*
- Don't use build-time variables to pass secrets like `github keys` or `user credentials`. With `docker history`, build-time values are visible to anyone with the image.

```bash
FROM busybox
ARG user1
ARG buildno
# ...
```

### Default values

```bash
FROM busybox
ARG user1=someuser
ARG buildno=1
# ..
```

### Scope

- An `ARG` variable is in effect **from the line it's declared on, downward** in the `Dockerfile`; nowhere else.
- `docker build --build-arg <name>=<value>` **overrides `<arg-name>`**
- An `ARG` goes out of scope at the end of the build stage that declares it. To use an `ARG` across stages, each stage must declare it.
  - Each `FROM` starts a build stage

```bash
FROM busybox
USER ${user:-some_user}
ARG user
USER $user
# ...

# -------multi build stage 1 -----------
FROM busybox
ARG SETTINGS # declare it to use next
RUN ./run/setup $SETTINGS

# -------multi build stage 2 -----------
FROM busybox
ARG SETTINGS  # declare it to use next
RUN ./run/other $SETTINGS
```

### **Using ARG variables**

- For the same-named `ARG` and `ENV`, an `ENV` defined after the `ARG` overrides the nearest preceding `ARG` value.
- `ARG VAR_NAME` may be repeated; each acts as a reset and can be overridden by the nearest following same-named `ENV`.
- Avoid:
  - declaring `ARG VAR_NAME` multiple times
  - using the same name for an ARG and an ENV
  - naming a variable the same as a system one, unless you mean to

```Dockerfile
FROM ubuntu
ARG CONT_IMG_VER
ENV CONT_IMG_VER=v1.0.0
RUN echo $CONT_IMG_VER
```

>`docker build --build-arg CONT_IMG_VER=v2.0.1 .` *outputs v1.0.0*

See [environment replacement](https://docs.docker.com/engine/reference/builder/#environment-replacement)

### Built-in args

>`docker build --build-arg HTTPS_PROXY=https://my-proxy.example.com .`

- HTTP_PROXY
- http_proxy
- HTTPS_PROXY
- https_proxy
- FTP_PROXY
- ftp_proxy
- NO_PROXY
- no_proxy

### Platform-related global args

- `docker build --platform=`

>- Requires [BuildKit](https://github.com/moby/buildkit) `18.09+`
>- `DOCKER_BUILDKIT=1`

- TARGETPLATFORM - platform of the build result. Eg linux/amd64, linux/arm/v7, windows/amd64.
- TARGETOS - OS component of TARGETPLATFORM
- TARGETARCH - architecture component of TARGETPLATFORM
- TARGETVARIANT - variant component of TARGETPLATFORM
- BUILDPLATFORM - platform of the node performing the build.
- BUILDOS - OS component of BUILDPLATFORM
- BUILDARCH - architecture component of BUILDPLATFORM
- BUILDVARIANT - variant component of BUILDPLATFORM

### Cache invalidation by ARG

>`docker build --build-arg CONT_IMG_VER=v2.0.1 .`

```bashFROM ubuntu
RUN echo 123
ARG CONT_IMG_VER
ENV CONT_IMG_VER=$CONT_IMG_VER
RUN echo $CONT_IMG_VER
RUN echo 456
RUN echo 789
```

- exec count 1: no use cache
- exec count 2: use cache
- exec count 3, but change `CONT_IMG_VER=v2.0.2`: everything before `ARG CONT_IMG_VER` used cache; everything after is cache-invalidated

## **ONBUILD**

- `ONBUILD <INSTRUCTION>`

>Notes

- Any build instruction may be registered as a trigger except `FROM`, `MAINTAINER`, `ONBUILD`
- Standardize the base-image build flow; downstream users just follow your trigger setup
- Example: copy source/files into a given dir by default `ONBUILD ADD . /app/src` or `ONBUILD COPY . /app/src`
  - Note the `Dockerfile` must then be at your project root or beside your resource files
  - Exclude files that don't need to be in the build via `.dockerignore`

`ONBUILD` adds a trigger instruction to the image, to run later when this image is used as the base for another build. The trigger runs in the downstream build context as if inserted right after the downstream `Dockerfile`'s `FROM`.

This is very useful when you're building an image meant to be a base for others — e.g. an app build environment or a daemon customizable with user-specific config.

For example, if your image is a reusable `Python` app builder, you need to *add the app source to a specific directory* and maybe call a build script afterwards. You can't just call `ADD` and `RUN` now because you don't have the app source yet, and it differs per app build. You could hand app developers a boilerplate `Dockerfile` to copy-paste, but that's **inefficient, error-prone, and hard to update**, since it's mixed into app-specific code.

**The solution** is `ONBUILD` to **register pre-run instructions** for the next build stage.

### How `ONBUILD` works

- 1. On encountering `ONBUILD`, the builder adds a trigger to the image's metadata. Otherwise it doesn't affect the current build.
- 2. At the end of the build, all triggers are stored under the `OnBuild` key in the image manifest. They can be inspected via `docker inspect`.
- 3. Later, that image can be used as a base via `FROM`. As part of `FROM`, the downstream builder looks up the `ONBUILD` **triggers** and runs them **in registration order**. If any trigger fails, `FROM` aborts, which aborts the build. If all succeed, `FROM` completes and the build continues.
- 4. **Triggers are cleared from the final image after execution** — they are not inherited by "child" builds.

## STOPSIGNAL

> `STOPSIGNAL signal`

`STOPSIGNAL` sets the system-call signal sent to the container to exit. It may be a signal name in `SIG<name>` form (e.g. `SIGKILL`) or an unsigned number matching a position in the kernel's syscall table (e.g. `9`). If unset, defaults to `SIGTERM`.

The `--stop-signal` flag on `docker run` and `docker create` overrides the image's default stop signal per container.

## **HEALTHCHECK**

- `HEALTHCHECK [OPTIONS] CMD command` (check container health by running a command inside the container)
- `HEALTHCHECK NONE` (disable any healthcheck inherited from the base image)

>Used to detect whether the service in the container is healthy — e.g. stuck in an infinite loop unable to handle new requests while the service still appears "up".

**`OPTIONS`** (all optional):

- `--interval=DURATION (default: 30s)`
- `--timeout=DURATION (default: 30s)`
- `--start-period=DURATION (default: 0s)`
- `--retries=N (default: 3)`

>The command's `exit status` indicates health. Values:

- **0**: `success` - the container is healthy and ready for use
- **1**: `unhealthy` - the container is not working correctly
- **2**: `reserved` - do not use this exit code

### `HEALTHCHECK` example

```Dockerfile
HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

## SHELL

>`SHELL ["executable", "parameters"]`

- `SHELL` overrides the default shell used for shell-form commands
  - Default shell on Linux is `["/bin/sh", "-c"]`
  - Default shell on Windows is `["cmd", "/s", "/c"]`
  - `SHELL` must be written as JSON in the `Dockerfile`
- `SHELL` is especially useful on Windows, which has two common, quite different native shells: `cmd` and `powershell`, plus optional shells including `sh`
- `SHELL` may appear multiple times. **Each `SHELL` overrides all previous ones and affects all later instructions**
- If you need another shell — `zsh`, `csh`, `tcsh`, etc. — you can use `SHELL` on Linux too

{{< admonition example >}}

```Dockerfile
FROM microsoft/windowsservercore

# Executed as cmd /S /C echo default
RUN echo default

# Executed as cmd /S /C powershell -command Write-Host default
RUN powershell -command Write-Host default

# Executed as powershell -command Write-Host hello
SHELL ["powershell", "-command"]
RUN Write-Host hello

# Executed as cmd /S /C echo hello
SHELL ["cmd", "/S", "/C"]
RUN echo hello
```

{{< /admonition >}}

## Example

>`go1.18` base-image build; for more base images see [docker-compose-resources](https://github.com/v8fg/docker-compose-resources.git)

```Dockerfile
FROM v8fg/golang:official-1.18-alpine3.13

LABEL maintainer="278810732@qq.com" github="https://github.com/xwi88" group="https://github.com/v8fg"

# Version of upx to be used(without the 'v' prefix)
# For all releases, see https://github.com/upx/upx/releases
ARG UPX_VERSION=3.96

# Fetch upx, decompress it, make it executable.
ADD https://github.com/upx/upx/releases/download/v${UPX_VERSION}/upx-${UPX_VERSION}-amd64_linux.tar.xz /tmp/upx.tar.xy

RUN apk add --no-cache tzdata git make bash && \
tar -xJOf /tmp/upx.tar.xy upx-${UPX_VERSION}-amd64_linux/upx > /bin/upx \
&& chmod +x /bin/upx && rm /tmp/upx.tar.xy
```

## Best practices

- Each instruction creates a layer. For downstream images the upstream image is a read-only layer; the current build just **appends layers** on top.
- Prefer `COPY` over `ADD` — more transparent and direct
- `docker build [OPTIONS] -f PATH`; for stdin input use `docker build [OPTIONS] -f- PATH`
- `.dockerignore` excludes files that don't need to be in the build — see [dockerignore-file](https://docs.docker.com/engine/reference/builder/#dockerignore-file)
- Optimize image size
  - **Use [multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/)** to **shrink the final image**
    - You can target a specific stage: `docker build --target builder -t xxxx .`
    - A stage can copy from earlier stages or existing images: `COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf`
  - *Don't install unnecessary packages*
  - *Copy only the files you need (pair with .dockerignore)*
  - One container, one concern — avoid running multiple services in one container
  - **Compress executables** when you can
  - **Minimize the layer count**
    - **Only `RUN`, `COPY`, `ADD` create layers — merge/trim related instructions into one or a few lines**
    - **Merge and reorder instructions**; use a backslash for multi-line; *clean up temp files afterwards*
    - For pipes, use them directly: `RUN set -o pipefail && wget -O - https://some.site | wc -l > /number`
- Build-cache invalidation
  - **`ADD`/`COPY`** `src` changes invalidate later `RUN` caches
  - `ARG`/`ENV` changes invalidate the first instruction that uses them `and everything after`
- Cache-invalidation tips
  - Push such steps to the end, or replace with other commands
  - Keep `src` and other references stable
- Only `PID=1` can be terminated by `docker stop`; the `sh -c` of shell form has `PID!=1`
- On `docker stop`, a `PID=1` container exits cleanly; after the stop timeout, `SIGKILL` is sent
- [CMD and ENTRYPOINT interaction rules](#cmd-and-entrypoint-interaction-rules)

## References

- [Docker reference](https://docs.docker.com/reference/)
- [understand-how-arg-and-from-interact](https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact)
- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
- **[dockerfile_best-practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices)**
- [storage driver](https://docs.docker.com/storage/storagedriver/)
- [multistage-build](https://docs.docker.com/develop/develop-images/multistage-build/)

