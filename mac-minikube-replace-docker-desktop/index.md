# Mac 使用 minikube 替换 Docker Desktop


**Docker** 公司于 **[2021-08-31 宣布](https://www.docker.com/blog/updating-product-subscriptions/)** [Docker Desktop](https://www.docker.com/products/docker-desktop) 对大型组织来说将不再是一个免费产品。为此我们需要寻找一个可以方便替换 `Docker Desktop` 且对我们工作影响较小的工具，如 [minikube](https://minikube.sigs.k8s.io/docs/)，[Hyperkit](https://github.com/moby/hyperkit)，[podman](https://podman.io/)。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 术语说明

- **[Docker Inc](https://en.wikipedia.org/wiki/Docker,_Inc.)** 一家总部设在美国的公司，开发了一些开源和非开源软件，这让开发、测试和在容器中运行应用更容易。
- **[Docker Engine](https://github.com/docker/engine)** Docker 背后的核心技术。它是一个作为守护进程运行在 Linux 上的开源软件，使在 Linux 内核上运行容器成为可能。它负责容器的生命周期和容器可以访问的物理资源(计算、内存、存储)的隔离。这个引擎可以在物理或者虚拟机上运行，但是它只能在 Linux 内核上运行，也就是说，在任何 Linux 风格的操作系统上。理解这一点很重要。**Docker 引擎只能在 Linux 上运行**。
- **[Docker CLI](https://github.com/docker/cli)** *CLI* 通常被开发人员用来与 docker 引擎交互。这包括 `docker` 和 `docker-compose` 命令。再次强调，这是一款开源软件。
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** 由于 Docker Engine 只能在 Linux 上运行，使用 Windows 和 macOS 进行软件开发的开发人员只有在启动运行 Linux 的虚拟机(VM)之后才能运行该引擎。这就是 Docker Desktop 的用武之地。Docker Desktop 是一个专有软件，它允许 Windows/macOS 开发者在开发环境中无缝地使用容器技术，而无需管理操作 VM 的复杂性和随之而来的所有细节(网络、虚拟化、 linux 知识等)。Docker Desktop 是为了在软件开发过程中使用而设计的，*它在类似于生产环境的容器中不起作用*，在这种环境中只有 `Docker Engine` 参与。

{{< admonition tip >}}
继续在 **macOS** 上运行和构建容器应用程序的方法是在 `Linux VM` 上运行 `Docker Engine`。
{{< /admonition >}}

## 环境要求

- 最少 2核
- 最少 2GB 可用内存
- 最少 20GB 可用磁盘空间
- 网络连接
- 容器或虚拟机管理器, 如: **[Docker](https://docs.docker.com/get-docker/)**, **[Hyperkit](https://github.com/moby/hyperkit)**, Hyper-V, KVM, Parallels, **[podman](https://podman.io/)**, *[VirtualBox](https://www.virtualbox.org/)*, or VMware Fusion/Workstation

## 环境安装

>如果确定以后不需要在 `docker desktop` 中运行 image，请删除所有 `docker` `docker desktop` 相关的配置。

{{< admonition example >}}

>推荐 [Homebrew](https://brew.sh/) 方式安装

```bash
brew install docker
brew install docker-compose # 根据需要，可选安装

brew install hyperkit
brew install minikube
```

{{< admonition tip >}}
如果通过 *brew* 安装 `minikube` 失败，可以尝试手动安装

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube
```

{{< /admonition >}}
{{< /admonition >}}

## 检查安装

执行 `which minikube`

{{< admonition warning >}}
brew 方式安装后执行 `which minikube`，如果失败可执行以下命令

```bash
brew unlink minikube
brew link minikube
```

*remove the old minikube links and link the newly installed binary*
{{< /admonition >}}

## Drivers 说明

>`minikube` 在 `mac/windows` 下启动需要依赖 `Linux VM`，这里也就是我们配置的 driver，如果配置 `--driver=docker` 则需要安装相应版本的 `Docker Desktop` 借助已安装的 `linux vm`。
否则需要选择其他，具体支持的 drivers 参考如下：

### *Linux*

- **[Docker](https://minikube.sigs.k8s.io/docs/drivers/docker/)** - container-based (preferred)
- KVM2 - VM-based (preferred)
- VirtualBox - VM
- **[None](https://minikube.sigs.k8s.io/docs/drivers/none/)** - bare-metal
- **[Podman](https://minikube.sigs.k8s.io/docs/drivers/podman/)** - container (experimental)
- SSH - remote ssh

### **macOS**

- *[Docker](https://minikube.sigs.k8s.io/docs/drivers/docker/)* - VM + Container (preferred)
- **[Hyperkit](https://minikube.sigs.k8s.io/docs/drivers/hyperkit/)** - VM
- VirtualBox - VM
- Parallels - VM
- VMware Fusion - VM
- SSH - remote ssh

### Windows

- **[Hyper-V](https://minikube.sigs.k8s.io/docs/drivers/hyperv/)** - VM (preferred)
- **[Docker](https://minikube.sigs.k8s.io/docs/drivers/docker/)** - VM + Container (preferred)
- VirtualBox - VM
- VMware Workstation - VM
- SSH - remote ssh

{{< admonition warning >}}
如果配置了 `--driver=docker` 需要区分 **`standard`, `rootless`** docker

>**Standard Docker**

```bash
# need: install Docker 18.09 or higher
#       amd64 or arm64 system.

# Start a cluster using the docker driver:
minikube start --driver=docker

# To make docker the default driver:
minikube config set driver docker
```

>**Rootless Docker**

```bash
# Requirements
#    Docker 20.10 or higher, see https://rootlesscontaine.rs/getting-started/docker/
#    Cgroup v2 delegation, see https://rootlesscontaine.rs/getting-started/common/cgroup2/

dockerd-rootless-setuptool.sh install -f
docker context use rootless
minikube start --driver=docker --container-runtime=containerd
```

>The `--container-runtime` flag must be set to `containerd` or `cri-o`.
{{< /admonition >}}
>更多 `drivers` 配置及用法请查看: [minikube drivers](https://minikube.sigs.k8s.io/docs/drivers/)

## 配置命令

`minikube config SUBCOMMAND [flags] [options]`

- `minikube config help`
- `minikube config defaults PROPERTY_NAME [flags]` *list displays all valid default settings for PROPERTY_NAME*
- `minikube config view [flags]` Display values currently set in the minikube config file.
- `minikube config set PROPERTY_NAME PROPERTY_VALUE [flags]` *Sets an individual value in a minikube config file*
- `minikube config get PROPERTY_NAME [flags]` *Returns the value of PROPERTY_NAME from the minikube config file*
- `minikube config unset PROPERTY_NAME [flags]` *unsets PROPERTY_NAME from the minikube config file.*

{{< admonition tip >}}

>`minikube config --help`

```tex
config modifies minikube config files using subcommands like "minikube config set driver kvm2"
Configurable fields:

 * driver
 * vm-driver
 * container-runtime
 * feature-gates
 * v
 * cpus
 * disk-size
 * host-only-cidr
 * memory
 * log_dir
 * kubernetes-version
 * iso-url
 * WantUpdateNotification
 * WantBetaUpdateNotification
 * ReminderWaitPeriodInHours
 * WantNoneDriverWarning
 * WantVirtualBoxDriverWarning
 * profile
 * bootstrapper
 * insecure-registry
 * hyperv-virtual-switch
 * disable-driver-mounts
 * cache
 * EmbedCerts
 * native-ssh

Available Commands:
  defaults    Lists all valid default values for PROPERTY_NAME
  get         Gets the value of PROPERTY_NAME from the minikube config file
  set         Sets an individual value in a minikube config file
  unset       unsets an individual value in a minikube config file
  view        Display values currently set in the minikube config file

Usage:
  minikube config SUBCOMMAND [flags] [options]

Use "minikube <command> --help" for more information about a given command.
Use "minikube options" for a list of global command-line options (applies to all commands).
```

{{< /admonition>}}

{{< admonition example>}}

```bash
minikube config set driver hyperkit
minikube config set cpus 2
minikube config set memory 2000mb
minikube config set disk-size 20gb

# insecure-registry 测试未生效, 启动时指定!
minikube config set insecure-registry https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com
# minikube config set kubernetes-version <>

# The name of the minikube VM being used. This can be set to allow having multiple instances of minikube independently. (default "minikube")
minikube config set profile
```

{{< /admonition>}}

## 快捷启动

```bash
minikube start # minikube start --container-runtime=docker
# Tell Docker CLI to talk to minikube's VM
eval $(minikube docker-env)
# Save IP to a hostname
# echo "`minikube ip` docker.local" | sudo tee -a /etc/hosts > /dev/null
# control panel, must start minikube with cluster model, without flag --no-kubernetes
minikube dashboard
# stop kubernetes related
minikube pause
# test
docker run hello-world
```

## 高级启动

>**[commands start](https://minikube.sigs.k8s.io/docs/commands/start/)**

### 启动命令

- 某些配置更新后需要执行: `minikube delete` 然后重新启动

{{< admonition example >}}
`minikube start --driver=hyperkit`  或 `minikube start --driver=docker` 或其他驱动

推荐使用类似配置，后续不用进入 `minikube vm` 修改相关配置，主要配置：

- **`--insecure-registry`**
- *`--registry-mirror`*
- *`--mount`* **挂载本地主机目录到 `minikube vm`**
  - 当前 MacOS 下，默认将挂载 `/Users:/minikube-host/`
  - **挂载路径最好保持完全一致，避免程序有路径依赖而无法正常启动**
  - 建议使用 `--mount-string` 按需挂载
- **`--mount-string`** 指定挂载目录
- **`--no-kubernetes`**
- **`--cpus`**
- **`--memory`**
- `--image-mirror-country`
  
`minikube start --no-kubernetes --registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com --mount /var/lib/minikube:/var/lib/docker`

如果要使用 minikube dashboard，可这样启动:
`minikube start --cpus=2 --memory=2000mb \
    --registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com`

*Tell Docker CLI to talk to minikube's VM:* `eval $(minikube docker-env)`

`eval $(minikube docker-env)` 可以直接配置到对应 shell 如: `~/.zshrc` 或 `~/.bashrc` 中，以避免每次输入

{{< /admonition >}}

### 可能出现的问题

{{< admonition warning >}}
*如果你在 `Docker Desktop` 基础上启动 `minikube`，直接借助它的 `vm` 及配置。由于资源限制，可能导致无法正常启动 `minikube`*

```tex
😄  minikube v1.24.0 on Darwin 12.2.1
✨  Using the docker driver based on existing profile

⛔  Docker Desktop only has 1986MiB available, you may encounter application deployment failures.
💡  Suggestion:

    1. Click on "Docker for Desktop" menu icon
    2. Click "Preferences"
    3. Click "Resources"
    4. Increase "Memory" slider bar to 2.25 GB or higher
    5. Click "Apply & Restart"
📘  Documentation: https://docs.docker.com/docker-for-mac/#resources

❗  You cannot change the memory size for an existing minikube cluster. Please first delete the cluster.
👍  Starting minikube without Kubernetes minikube in cluster minikube
```

>`minikube delete` *调整 docker 资源后，删除重建，重新启动即可*

```tex
🔥  Deleting "minikube" in docker ...
🔥  Removing ~/.minikube/machines/minikube ...
💀  Removed all traces of the "minikube" cluster.
```

{{< /admonition >}}

## 启动后环境检查

{{< admonition example >}}

>启动命令: `minikube start --no-kubernetes --insecure-registry=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com`

```tex
  minikube v1.24.0 on Darwin 10.15.7
    ▪ MINIKUBE_ACTIVE_DOCKERD=minikube
✨  Using the hyperkit driver based on user configuration
👍  Starting minikube without Kubernetes minikube in cluster minikube
🔥  Creating hyperkit VM (CPUs=2, Memory=2000MB, Disk=20480MB) ...
🏄  Done! minikube is ready without Kubernetes!
╭───────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                       │
│                       💡  Things to try without Kubernetes ...                        │
│                                                                                       │
│    - "minikube ssh" to SSH into minikube's node.                                      │
│    - "minikube docker-env" to point your docker-cli to the docker inside minikube.    │
│    - "minikube image" to build images without docker.                                 │
│                                                                                       │
╰───────────────────────────────────────────────────────────────────────────────────────╯
```

>`eval $(minikube docker-env)` **让 Docker CLI 与 minikube's VM 交互**

{{< admonition tip >}}
Add this line to `.bash_profile` or `.zshrc` or ... if you want to *use minikube's daemon* by default (or if you do not want to set this every time you open a new terminal).

{{< /admonition >}}

>`docker info` 查看我们现在终端的 docker 信息

```tex
Kernel Version: 4.19.202
 Operating System: Buildroot 2021.02.4
 OSType: linux
 Architecture: x86_64
 CPUs: 2
 Total Memory: 1.894GiB
 Name: minikube
 ID: STNM:GBUS:PMHK:ASTU:BZHZ:WIEY:L6F3:YOMH:M432:S5XK:PAT5:IU2D
 Docker Root Dir: /var/lib/docker
 Debug Mode: false
 Registry: https://index.docker.io/v1/
 Labels:
  provider=hyperkit
 Experimental: false
 Insecure Registries:
  reg-mirror.qiniu.com
  docker.mirrors.ustc.edu.cn
  mirror.ccs.tencentyun.com
  10.96.0.0/12
  127.0.0.0/8
 Live Restore Enabled: false
 Product License: Community Engine
```

>新打开一个终端查看本机(未卸载 docker desktop 机器，仅做对比) `docker info`

```tex
Kernel Version: 5.10.76-linuxkit
Operating System: Docker Desktop
OSType: linux
Architecture: x86_64
CPUs: 3
Total Memory: 4.083GiB
Name: docker-desktop

HTTP Proxy: http.docker.internal:3128
 HTTPS Proxy: http.docker.internal:3128
 Registry: https://index.docker.io/v1/
 Labels:
 Experimental: false
 Insecure Registries:
  127.0.0.0/8
 Registry Mirrors:
  https://registry-1.docker.io/
  https://hub-mirror.c.163.com/
  https://mirror.baidubce.com/
  https://registry.cn-hangzhou.aliyuncs.com/
  https://docker.mirrors.ustc.edu.cn/
  https://mirror.ccs.tencentyun.com/
  https://registry.docker-cn.com/
  https://reg-mirror.qiniu.com/
  https://dockerhub.azk8s.cn/
```

{{< /admonition >}}

## 镜像源修改

>**不建议进入 minikube 环境做此修改**，建议在启动时指定参数进行配置: `minikube start --image-mirror-country='cn'` 等参数， 详见 [minikube start](https://minikube.sigs.k8s.io/docs/commands/start/) 或 [高级启动](#高级启动)

{{< admonition example >}}
>`minikube ssh`  连入 minikube node
>
>`sudo mkdir -p /etc/docker` 创建 docker 目录
>
>`vi /etc/docker/daemon.json` 修改配置
>
>`daemon.json` **daemon.json** 配置

```json
{
     "registry-mirrors": [
        "https://registry-1.docker.io",
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com",
        "https://registry.cn-hangzhou.aliyuncs.com",
        "http://f1361db2.m.daocloud.io",
        "https://docker.mirrors.ustc.edu.cn",
        "https://mirror.ccs.tencentyun.com",
        "https://registry.docker-cn.com",
        "https://reg-mirror.qiniu.com",
        "https://dockerhub.azk8s.cn"
  ]
}
```

>`sudo systemctl daemon-reload`
>
>`sudo systemctl restart docker`

{{< /admonition >}}

## Dashboard

`minikube dashboard`

{{< admonition example >}}

>`minikube start --driver=hyperkit --cpus=2 --memory=2000mb --registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com`
>
>`minikube dashboard`

{{< /admonition >}}

## 目录挂载

>This will start the mount daemon and automatically mount files into minikube.

`minikube mount <local directory>:<host directory>`

**映射/挂载关系**: `本地主机 volumes`<->`docker desktop VM volumes`<->`docker container volumes`

### Driver 默认挂载路径

Some hypervisors, have built-in host folder sharing. Driver mounts are reliable with good performance, but the paths are not predictable across operating systems or hypervisors:

|Driver|OS|HostFolder|VM|
|:---|:---|:---|:---|
|VirtualBox|Linux|/home|/hosthome|
|VirtualBox|macOS|/Users|/Users|
|VirtualBox|Windows|C://Users|/c/Users|
|VMware Fusion|macOS|/Users|/mnt/hgfs/Users|
|KVM|Linux|Unsupported||
|HyperKit|Linux|Unsupported (see NFS mounts)|

*These mounts can be disabled by passing --disable-driver-mounts to minikube start.*

## **本机应用启动**

>如果你使用了目录映射，则必须开启挂载，且一定要注意挂载路径，否则会出现文件或者配置找不到问题。

### **文件或配置找不到**

{{< admonition warning >}}
原因：

- 使用 `docker desktop` 时，自动帮我们做了映射：`本地主机 volumes`<->`docker desktop VM volumes`<->`docker container volumes`
- 当我们使用 `minikube` 在本地运行 `docker run` 或 `docker-compose up` 实际相当于在 `minikube vm` 中运行，但是 `minikube vm` 中**无本地本机的源码映射**

{{< /admonition >}}

### **解决方案**

>**在本地本机进行工作目录映射/挂载**:
>
>- `minikube mount $HOME/workspace:$HOME/workspace`
>- **minikube vm 内部映射路径一定要注意: 挂载路径务必与实际路径保持一致**
>- *注意目录权限问题，正常挂载当前用户目录不涉及权限问题*
>- 可设置挂载多个目录

{{< admonition tip >}}
可将你的源码放在一个统一的工作目录，这样方便挂载及代码查找，目录结构参考如下：

- `$HOME/workspace` **源码工作空间，可整个挂载**
- `$HOME/workspace/git.company.com` *公司源码工作空间，仅公司代码*
- `$HOME/workspace/github.com` *github 源码工作空间*
- `$HOME/workspace/gitee.com`
{{< /admonition >}}

## 开机启动

>`--mount --mount-string=$HOME/workspace:$HOME/workspace` *可能存在问题，推荐启动后用命令 `minikube mount` 挂载*

### **仅挂载当前项目目录**

- 优: 挂载目录少，占空间较小
- 缺: 如果切换项目需要重新挂载，太过麻烦

> **尽量挂载整个工作目录(注意控制规模)，切换项目不用额外操作**

```bash
# --mount --mount-string=$HOME/workspace:$HOME/workspace

#minikube delete
minikube start --no-kubernetes --driver=hyperkit --cpus=2 --memory=2gb --disk-size=20gb \
--image-mirror-country=cn \
--registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com
eval $(minikube docker-env)
minikube mount ${PWD}:${PWD}
```

### **挂载整个工作目录**

```bash
# issues here {单独 --mount 将挂载: /Users:/minikube-host/; --mount-string 仅挂载指定目录，此时不需要添加 --mount， 推荐方式}
# --mount --mount-string=$HOME/workspace:$HOME/workspace

#minikube delete
minikube start --no-kubernetes --driver=hyperkit --cpus=2 --memory=2gb --disk-size=20gb \
--image-mirror-country=cn \
--registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com
eval $(minikube docker-env)
minikube mount ${HOME}/workspace:${HOME}/workspace
```

### *挂载整个工作目录且后台运行*

```bash
# --mount --mount-string=$HOME/workspace:$HOME/workspace

#minikube delete
minikube start --no-kubernetes --driver=hyperkit --cpus=2 --memory=2gb --disk-size=40gb \
--image-mirror-country=cn \
--registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com
eval $(minikube docker-env)
nohup minikube mount ${HOME}/workspace:${HOME}/workspace &
```

## **注意事项**

- minikube 启动后配置 `eval $(minikube docker-env)`
- *minikube 启动后挂载目录* [应用启动目录挂载问题](#本机应用启动)
- 启动时指定 `--driver`，如果是 `docker` 务必确保 `docker daemon` 已运行
- 如果启动参数 mount 设置错误，则需要 `minikube mount --kill`，且 `minikube vm` 移出相应目录
- `minikube delete 不用每次都运行`

## 更多

- **[Using minikube as Docker Desktop Replacement](https://minikube.sigs.k8s.io/docs/tutorials/docker_desktop_replacement/)**
- [How to interact with registries](https://minikube.sigs.k8s.io/docs/handbook/registry/)
- [minikube-image-build](https://minikube.sigs.k8s.io/docs/commands/image/#minikube-image-build)
- [containerd](https://github.com/containerd/containerd)

## 参考

- [run-docker-without-docker-desktop-on-macos](https://dhwaneetbhatt.com/blog/run-docker-without-docker-desktop-on-macos)
- [minikube docs](https://minikube.sigs.k8s.io/docs/)

