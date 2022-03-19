# Docker 相关命令备忘参考


Docker 相关命令备忘参考，主要关于 [Docker CLI](https://docs.docker.com/engine/reference/commandline/cli/) 与 [Compose CLI](https://docs.docker.com/compose/compose-file/)。
<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

- Docker version: `Docker version 20.10.12, build e91ed57`
- Compose version: `Docker Compose version 2.2.2`

## Docker 相关参考资源

### 文件格式

|File format|Description|
|:---|:---|
|[Dockerfile](https://docs.docker.com/engine/reference/builder/)|Defines the contents and startup behavior of a single container|
|[Compose file](https://docs.docker.com/compose/compose-file/)|Defines a multi-container application|

### 命令行接口 (CLIs)

|CLI|Description|
|:---|:---|
|[Docker CLI](https://docs.docker.com/engine/reference/commandline/cli/)|The main CLI for Docker, includes all docker commands|
|[Compose CLI](https://docs.docker.com/compose/reference/)|The CLI, which allows you to build and run multi-container applications|
|[dockerd](https://docs.docker.com/engine/reference/commandline/dockerd/)|Persistent process that manages containers|

### 应用程序接口 (APIs)

|API|Description|
|:---|:---|
|[Engine API](https://docs.docker.com/engine/api/)|The main API for Docker, provides programmatic access to a daemon|
|[Registry API](https://docs.docker.com/registry/spec/api/)|Facilitates distribution of images to the engine|
|[Docker Hub API](https://docs.docker.com/docker-hub/api/latest/)|API to interact with Docker Hub|

### 驱动与规范

|Driver|Description|
|:---|:---|
|[Image specification](https://docs.docker.com/registry/spec/manifest-v2-2/)|Describes the various components of a Docker image|
|[Registry token authentication](https://docs.docker.com/registry/spec/auth/)|Outlines the Docker registry authentication scheme|
|[Registry storage drivers](https://docs.docker.com/registry/storage-drivers/)|Enables support for given cloud providers when storing images with Registry|

## Docker CLI 用法

{{< admonition example>}}

```tex
Usage:  docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Options:
      --config string      Location of client config files (default "/Users/wangxin/.docker")
  -c, --context string     Name of the context to use to connect to the daemon (overrides DOCKER_HOST env var and default context set with "docker context use")
  -D, --debug              Enable debug mode
  -H, --host list          Daemon socket(s) to connect to
  -l, --log-level string   Set the logging level ("debug"|"info"|"warn"|"error"|"fatal") (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlscacert string   Trust certs signed only by this CA (default "/Users/wangxin/.docker/ca.pem")
      --tlscert string     Path to TLS certificate file (default "/Users/wangxin/.docker/cert.pem")
      --tlskey string      Path to TLS key file (default "/Users/wangxin/.docker/key.pem")
      --tlsverify          Use TLS and verify the remote
  -v, --version            Print version information and quit

Management Commands:
  builder     Manage builds
  buildx*     Docker Buildx (Docker Inc., v0.7.1)
  compose*    Docker Compose (Docker Inc., 2.2.2)
  config      Manage Docker configs
  container   Manage containers
  context     Manage contexts
  image       Manage images
  manifest    Manage Docker image manifests and manifest lists
  network     Manage networks
  node        Manage Swarm nodes
  plugin      Manage plugins
  scan*       Docker Scan (Docker Inc., v0.17.0)
  secret      Manage Docker secrets
  service     Manage services
  stack       Manage Docker stacks
  swarm       Manage Swarm
  system      Manage Docker
  trust       Manage trust on Docker images
  volume      Manage volumes

Commands:
  attach      Attach local standard input, output, and error streams to a running container
  build       Build an image from a Dockerfile
  commit      Create a new image from a container's changes
  cp          Copy files/folders between a container and the local filesystem
  create      Create a new container
  diff        Inspect changes to files or directories on a container's filesystem
  events      Get real time events from the server
  exec        Run a command in a running container
  export      Export a container's filesystem as a tar archive
  history     Show the history of an image
  images      List images
  import      Import the contents from a tarball to create a filesystem image
  info        Display system-wide information
  inspect     Return low-level information on Docker objects
  kill        Kill one or more running containers
  load        Load an image from a tar archive or STDIN
  login       Log in to a Docker registry
  logout      Log out from a Docker registry
  logs        Fetch the logs of a container
  pause       Pause all processes within one or more containers
  port        List port mappings or a specific mapping for the container
  ps          List containers
  pull        Pull an image or a repository from a registry
  push        Push an image or a repository to a registry
  rename      Rename a container
  restart     Restart one or more containers
  rm          Remove one or more containers
  rmi         Remove one or more images
  run         Run a command in a new container
  save        Save one or more images to a tar archive (streamed to STDOUT by default)
  search      Search the Docker Hub for images
  start       Start one or more stopped containers
  stats       Display a live stream of container(s) resource usage statistics
  stop        Stop one or more running containers
  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE
  top         Display the running processes of a container
  unpause     Unpause all processes within one or more containers
  update      Update configuration of one or more containers
  version     Show the Docker version information
  wait        Block until one or more containers stop, then print their exit codes

Run 'docker COMMAND --help' for more information on a command.

To get more help with docker, check out our guides at https://docs.docker.com/go/guides/
```

{{< /admonition >}}

## Docker Compose CLI 用法

{{< admonition example >}}

```tex
Usage:  docker compose [OPTIONS] COMMAND

Docker Compose

Options:
      --ansi string                Control when to print ANSI control characters ("never"|"always"|"auto") (default "auto")
      --compatibility              Run compose in backward compatibility mode
      --env-file string            Specify an alternate environment file.
  -f, --file stringArray           Compose configuration files
      --profile stringArray        Specify a profile to enable
      --project-directory string   Specify an alternate working directory
                                   (default: the path of the Compose file)
  -p, --project-name string        Project name

Commands:
  build       Build or rebuild services
  convert     Converts the compose file to platform's canonical format
  cp          Copy files/folders between a service container and the local filesystem
  create      Creates containers for a service.
  down        Stop and remove containers, networks
  events      Receive real time events from containers.
  exec        Execute a command in a running container.
  images      List images used by the created containers
  kill        Force stop service containers.
  logs        View output from containers
  ls          List running compose projects
  pause       Pause services
  port        Print the public port for a port binding.
  ps          List containers
  pull        Pull service images
  push        Push service images
  restart     Restart containers
  rm          Removes stopped service containers
  run         Run a one-off command on a service.
  start       Start services
  stop        Stop services
  top         Display the running processes
  unpause     Unpause services
  up          Create and start containers
  version     Show the Docker Compose version information

Run 'docker compose COMMAND --help' for more information on a command.
```

{{< /admonition >}}

## Docker 命令

### Docker 常用管理命令

- `docker context [--help]` **上下文管理**
- `docker compose [--help]` **docker compose 命令** `v2.2.2+`
- `docker container [--help]` **docker 容器命令**
- `docker image [--help]` **docker 镜像命令**
  - `docker image prune` **删除所有未被 `tag` 标记和未被容器使用的镜像，标记为 `<none>` 的**
- `docker volume [--help]` *目录挂载命令*
- `docker network [--help]` *docker 网络命令*
- `docker system [--help]` *docker 系统命令*
  - `docker system df` 磁盘使用查看
  - `docker system info` == `docker info` *Display system-wide information*
- `docker scan [--help]` docker 镜像扫描分析
- `docker manifest [--help]` docker 镜像清单查看，实验特性

### Docker 常用命令

- `docker build [--help]` **镜像构建**
  - `docker build [[-t tag] ...] -f [PATH/Dockerfile] .`
  - `docker build -t tag1 -t tag2 -f [PATH/Dockerfile] .` **可同时生成多个 `tag` 镜像**
- `docker commit [OPTIONS] <container> <REPOSITORY[:TAG]>` *基于容器创建镜像*
- `docker cp` 容器与本地文件之间复制
  - `docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-`
  - `docker cp [OPTIONS] SRC_PATH|- CONTAINER:DEST_PATH`
- *`docker create [OPTIONS] IMAGE [COMMAND] [ARG...]`* 一般使用 `docker run` **直接创建并运行**
- `docker history` = `docker image history` 镜像历史查看
- `docker images` **[查看镜像列表](#docker-镜像过滤查找)**
- `docker login`
- `docker search`
- `docker tag`
- `docker pull`
- `docker build`
- `docker run`
- `docker push`
- `docker stop`
- `docker logs`

### docker 镜像过滤查找

>`docker images -f [filter params]`

- `dangling=(true|false)` **none tag images**
- `label=<key>` or `label=<key>=<value>` *通过 `label` 过滤*
- `before=(<image-name>[:tag]|<image-id>|<image@digest>)`
- `since=(<image-name>[:tag]|<image-id>|<image@digest>)`
- `reference=(pattern of an image reference)`

```bash
docker images -f dangling=true
docker images -f label=author
docker images -f label=author=xwi88
docker images -f reference="v8fg/*"
docker images -f reference="v8fg/alpine"
docker images -f reference="v8fg/alpine:*"
docker images -f reference="v8fg/golang:1.18*"
docker images -f reference="v8fg/golang:*1.18*"
docker images -f reference="[REPOSITORY:TAG]"
docker images -f reference="tes*"
docker images -f reference="test"
docker images -f reference="test*2"
```

{{< admonition warning >}}
测试发现，如果 `REPOSITORY` 中含有 `/` 则通过 reference 正则查询时，必须包含 `/` 否则无法匹配出来，也即 `/` 无法被 filter 正则匹配
{{< /admonition>}}

### docker commit 基于容器创建镜像

>`docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]`

```bash
Usage:  docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]

Create a new image from a container's changes

Options:
  -a, --author string    Author (e.g., "John Hannibal Smith <hannibal@a-team.com>")
  -c, --change list      Apply Dockerfile instruction to the created image
  -m, --message string   Commit message
  -p, --pause            Pause container during commit (default true)
```

### prune 镜像容器等一键删除

- `docker image prune -a` **删除所有未被容器使用的镜像**
- `docker container prune` *删除所有停止运行容器*
- `docker volume prune` *删除所有未被挂载的卷*
- `docker system prune` *删除 docker 所有资源*
- `docker network prune` *删除所有网络*

## Simple Cheat Sheet

- **demo images**: [v8fg/demo](https://github.com/v8fg/docker-compose-resources/tree/release/demo)
- 演示镜像: `v8fg/demo[:latest]`
- 演示容器名: `v8fg-demo`

### Running Containers

|command|note|
|:---|:---|
|docker run -it v8fg/demo bash|Run container and specify command|
|docker run -it v8fg/demo|Run container|
|docker run -tid v8fg/demo|Run container detatched, -tty|
|docker create -ti v8fg/demo|Create a container without starting it|
|`docker run -tid --name v8fg-demo v8fg/demo`|named container|
|docker ps|show running containers|
|docker ps -a|show all containers|
|`docker ps --filter name=v8fg`|show matching containers|
|`docker ps --filter name=demo -q`|show matching container ID|
|docker inspect v8fg-demo|inspect container|

{{< admonition example >}}

>经上面操作后，部分输出如下

```tex
CONTAINER ID   IMAGE       COMMAND     CREATED              STATUS                          PORTS     NAMES
01430cc7b2c0   v8fg/demo   "/bin/sh"   11 seconds ago       Up 11 seconds                             v8fg-demo
83ce7dee0346   v8fg/demo   "/bin/sh"   About a minute ago   Created                                   thirsty_bassi
1bd61cc802f1   v8fg/demo   "/bin/sh"   About a minute ago   Up About a minute                         relaxed_beaver
be104825d061   v8fg/demo   "/bin/sh"   About a minute ago   Exited (0) About a minute ago             flamboyant_beaver
8cfe1c19773f   v8fg/demo   "bash"      About a minute ago   Exited (0) About a minute ago             flamboyant_euclid
```

{{< /admonition>}}

### Container Lifecycle Stuff

|command|note|
|:---|:---|
|docker start v8fg-demo|start|
|docker stop v8fg-demo|stop|
|docker stop v8fg-demo relaxed_beaver|stop mutliple|
|docker restart v8fg-demo|restart container|
|docker pause v8fg-demo|pauses a running container, freeze in place|
|docker unpause v8fg-demo|unpause a container|
|docker wait v8fg-demo|blocks until running container stops|
|docker kill v8fg-demo|sends SIGKILL, faster than stop|
|docker rm v8fg-demo|remove|
|docker rm v8fg-demo relaxed_beaver|remove multiple|
|docker rm -f v8fg-demo|force remove|
|docker container rm -f $(docker ps -aq)|Remove all containers, running or stopped|

### Resource Limits and Controls

|command|note|
|:---|:---|
|docker run -tid -c 512 v8fg/demo|50% cpu|
|`docker run -tid --cpu-shares 2 v8fg/demo`|CPU shares (relative weight)|
|`docker run -tid --cpus 2 v8fg/demo`|number of CPUs|
|`docker run -tid --cpuset-cpus=0,4,6 v8fg/demo`|use these cpus|
|docker run -tid -m 300M v8fg/demo|limit memory|
|`docker create -ti --storage-opt size=5G v8fg/demo`|limit storage, not on aufs|
|`docker run -tid -m 300M --cpus 1 --name v8fg-demo v8fg/demo`|limit memory|

### Stats, Logs, and Events

|command|note|
|:---|:---|
|docker stats|resourse stats for all containers|
|docker stats v8fg-demo|resource stats for one container|
|docker top v8fg-demo|shows processes in a container|
|docker logs v8fg-demo|container logs|
|docker events|watch events in real time|
|docker port v8fg-demo|shows public facing port of container|
|docker diff v8fg-demo|show changes to a container's file system|

### Docker Images

|command|note|
|:---|:---|
|docker images|show images|
|docker history v8fg/demo|show history of image|
|docker image rm v8fg/demo|remove image|
|docker image remove ddd4b27c1c67|remove by id|
|docker image remove v8fg/demo|remove image|
|docker rmi v8fg/demo|remove image|
|docker rmi $(docker images -q)|remove all images
|Commit container to an image:||
|docker commit v8fg-demo|no repo name|
|docker commit v8fg-demo test1|repo name|
|docker commit v8fg-demo v8fg/test1|repo name|
|docker commit v8fg-demo v8fg/test1:my-update|tagged|
|docker commit v8fg-demo v8fg/test1:v1.2.3|tagged|

### Export/Import/Save/Load

- **export, import**: 不保留层历史信息，较小 **制作基础镜像，去除历史**
- *save, load*: 保留层历史信息，较大

|command|note|
|:---|:---|
|docker export|export container to tarball archive stream|
|docker import|create image from tarball, excludes history ( smaller image )|
|docker save|save image to tar archive stream ( includes parent layers )|
|docker load|load an image from tarball, includes history ( larger image )|
|Examples:||
|docker export v8fg-demo \| gzip > v8fg-demo-container-export.tar.gz||
|cat v8fg-demo-container-export.tar.gz \| docker import - v8fg-demo:latest-import||
|docker save v8fg/demo \| gzip > v8fg-demo-image-save.tar.gz||
|docker load < v8fg-demo-image-save.tar.gz||

### Docker Hub/Registry

|command|note|
|:---|:---|
|docker login|Login to Registry|
|docker logout|Logout of Registry|
|docker tag ddd4b27c1c67 v8fg/demo:local-v1|Tag an image|
|docker push v8fg/demo|Push to registry|
|docker search v8fg||Search user or group|
|docker search v8fg/golang||Search for an image|
|docker search golang||Search for an image|
|docker pull v8fg/demo|Pull it down, default latest|
|docker run v8fg/demo:alpine|Will be downloaded if it isn`t here|

### Building Docker Images From A Dockerfile

|command|note|
|:---|:---|
|mkdir mydockerbuild|Create build dir|
|cd mydockerbuild|cd into build dir|
|vi Dockerfile|Edit build instructions|
|docker build -t mydockerimage .||Build the image (note the dot "." )|
|docker images|Show images|
|docker run mydockerimage|Run the new image|

### Simple Dockerfile Example

>`v8fg/demo:latest`

```Dockerfile
ARG FROM_REPOSITORY=alpine FROM_TAG=3.15.1
FROM ${FROM_REPOSITORY}:${FROM_TAG}
LABEL author=xwi88 type=demo name=latest github="https://github.com/xwi88" group="https://github.com/v8fg"
RUN apk add --no-cache tzdata bash
ENV TZ=Asia/Shanghai
```

>`v8fg/demo:ubuntu`

```Dockerfile
FROM ubuntu
LABEL author=xwi88 type=demo name=ubuntu github="https://github.com/xwi88" group="https://github.com/v8fg"
RUN apt-get update && apt-get install nginx -y && apt-get clean && apt-get autoclean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
CMD ["/usr/sbin/nginx"]
```

### Big Dockerfile Example

|command|note|
|:---|:---|
|FROM ubuntu|base image|
|RUN apt update|run commands while building|
|RUN apt install nginx -y|run commands while building|
|`WORKDIR ~/`|working dir that CMD is run from|
|ENTRYPOINT echo|default application|
|CMD "echo" "Hello docker!"|main command / default application|
|`CMD ["--port 27017"]`|params for ENTRYPOINT|
|CMD "Hello docker!"|params for ENTRYPOINT|
|ENV SERVER_WORKS 4|set env variable|
|EXPOSE 8080|expose a port, not published to the host|
|MAINTAINER authors_name|deprecated|
|LABEL version="1.0"|add metadata|
|LABEL author="User One"|add metadata|
|USER 751|UID (or username) to run as|
|VOLUME ["/my_files"]|sets up a volume|
|COPY test relativeDir/|copies "test" to `WORKDIR`/relativeDir/|
|COPY test /absoluteDir/|copies "test" to /absoluteDir/|
|COPY ssh_config /etc/ssh/ssh_config|copy over a vile|
|`COPY --chown=user1:group1 files* /data/`|also changes ownership|
|ADD /dir1 /dir2|like copy but does more ...||

### Volumes/Storage

|command|note|
|:---|:---|
|docker info | grep -i storage|check storage driver||
|docker inspect v8fg-demo|look for "Mounts"|
|docker volume ls|show voluems|
|docker volume create testvol1|create a volume|
|docker volume inspect testvol1|inspect a volume|
|docker volume ls -f dangling=true|find dangling ( unused ) volumes|
|docker volume rm volume1|remove volume|
|Running containers with volumes:||
|`docker run -d --name test1 -v /data v8fg/demo`|unamed volume mounted on /data|
|`docker run -d --name test2 -v vol1:/data v8fg/demo`|named volume|
|`docker run -d --name test3 -v /src/data:/data v8fg/demo`|bind mount|
|`docker run -d --name test4 -v /src/data:/data:ro v8fg/demo`|RO|
|`docker run -d --volumes-from test2 --name test5 v8fg/demo`|storage can be shared|
|`docker rm -v test1`|remove container and unnamed volume|
|Access and sharing parameters:||
|:ro|for read only|
|:z|shared all containers can read/write|
|:Z|private, unshared|
|-||
|`/var/lib/docker/overlay2|`Defalt volume storage location on Ubuntu Linux|

### Expose Ports

|command|note|
|:---|:---|
|`docker run -tid -p 1234:80 nginx`|expose container port 80 on host port 1234|
|`docker run -tid -p 80:5000 ubuntu|`bind port|
|`docker run -tid -p 8000-9000:5000 ubuntu`|bind port to range|
|`docker run -tid -p 80:5000/udp ubuntu|`udp ports|
|`docker run -tid -p 127.0.0.1:80:5000 ubuntu|`bind port on an interface|
|`docker run -tid -p 127.0.0.1::5000 ubuntu`|bind any port, specific interface|
|`docker run -tid -P ubuntu`|exposed ports to random ports|

### Networks

|command|note|
|:---|:---|
|docker network ls|show networks, bridge is default|
|docker network inspect bridge|show network details and connected containers|
|Create Bridge Network, Specify Subnet and Gateway:|
|docker network create -d bridge my-network|
|`docker network create -d bridge --subnet 172.25.0.0/16 my-network`|
|`docker network create --subnet 203.0.113.0/24 --gateway 203.0.113.254 my-network`|
|docker network rm my-network|remove network|
|Run container and specify network:|
|`docker run -tid --net=my-network --name test1 ubuntu`|
|Run container, specify network and IP:|
|`docker run -tid --net=my-network --ip=172.25.3.3 --name=test1 ubuntu`|
|Connect container to network:|
|docker network connect net1 test1|
|`docker network connect net1 test2 --ip 172.25.0.102`|
|Disconnect container from network:
|`docker network disconnect net1 test1|`Disconnect container from this network|
|`docker network disconnect -f test1 test2`|Force disconnect|
|Find container's IP address:|
|`docker inspect -f '{{json .NetworkSettings.Networks}}' container1`|
|`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container1`|

## 参考

- [docker run reference](https://docs.docker.com/engine/reference/run/)
- [compose reference](https://docs.docker.com/compose/reference/)
- [docker-cheat-sheet](https://low-orbit.net/docker-cheat-sheet)

