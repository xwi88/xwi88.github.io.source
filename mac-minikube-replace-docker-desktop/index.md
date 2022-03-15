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

## *Docker Desktop* 清理

>*不建议直接在 `Docker Desktop` 或其他类似环境上运行 `minikube`*

**Uninstall** `Docker Desktop` by removing `/Applications/Docker.app`。

## 环境要求

- 最少 2核
- 最少 2GB 可用内存
- 最少 20GB 可用磁盘空间
- 网络连接
- 容器或虚拟机管理器, 如: **[Docker](https://docs.docker.com/get-docker/)**, **[Hyperkit](https://github.com/moby/hyperkit)**, Hyper-V, KVM, Parallels, **[podman](https://podman.io/)**, *[VirtualBox](https://www.virtualbox.org/)*, or VMware Fusion/Workstation

## 安装

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

## drivers 说明

>`minikube` 在 mac 下启动需要依赖 `Linux VM`，这里也就是我们配置的 driver，如果你已经启动了 `Docker Desktop`，则可以配置为 `--driver=docker` 借助已经存在的 VM，否则需要选择其他，具体支持的 driver 参考如下：

### *Linux*

- **[Docker](https://minikube.sigs.k8s.io/docs/drivers/docker/)** - container-based (preferred)
- KVM2 - VM-based (preferred)
- VirtualBox - VM
- **[None](https://minikube.sigs.k8s.io/docs/drivers/none/)** - bare-metal
- **[Podman](https://minikube.sigs.k8s.io/docs/drivers/podman/)** - container (experimental)
- SSH - remote ssh

### **macOS**

- **[Docker](https://minikube.sigs.k8s.io/docs/drivers/docker/)** - VM + Container (preferred)
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

>The `--container-runtime` flag must be set to `“containerd”` or “`cri-o`”.
{{< /admonition >}}

>更多 `drivers` 配置及用法请查看: [minikube drivers](https://minikube.sigs.k8s.io/docs/drivers/)

## 启动

```bash
minikube start

# Tell Docker CLI to talk to minikube's VM
eval $(minikube docker-env)

# Save IP to a hostname
# echo "`minikube ip` docker.local" | sudo tee -a /etc/hosts > /dev/null

# control panel, must start minikube with cluster model, without flag --no-kubernetes
minikube dashboard

# test
docker run hello-world
```

## 高级启动

>**[commands start](https://minikube.sigs.k8s.io/docs/commands/start/)**

### 启动命令

{{< admonition example >}}
>`minikube start`
>
>`minikube start --no-kubernetes --driver=docker --cpus=2 --memory=1800mb --image-mirror-country='auto'`
>
>`minikube start --no-kubernetes --driver=docker --cpus=2 --memory=1800mb --image-mirror-country='cn'`
>
>`minikube start --no-kubernetes --driver=docker --cpus=2 --memory=1800mb --insecure-registry=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com` **推荐使用类似配置，后续不用进入环境修改相关配置了**
>
>`minikube start --driver=docker --cpus=2 --memory=1800mb --insecure-registry=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com` *如果要使用 minikube dashboard，可这样启动*

{{< /admonition >}}

### 可能出现的问题

{{< admonition warning >}}
*我们这里仅提供演示，没有卸载掉 `Docker Desktop`，直接使用了它安装的*docker*及其配置。由于*资源限制*导致无法满足正常启动 `minikube` 出现了下面的提示*

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

### 启动后环境检查

>**如果需要使用 `dashboard`，请不要在启动参数添加 `--no-kubernetes`**

{{< admonition example >}}

>`minikube start --no-kubernetes --driver=docker --cpus=2 --memory=1800mb --insecure-registry=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com`

```tex
😄  minikube v1.24.0 on Darwin 12.2.1
✨  Using the docker driver based on user configuration

⛔  Docker Desktop only has 4180MiB available, you may encounter application deployment failures.
💡  Suggestion:

    1. Click on "Docker for Desktop" menu icon
    2. Click "Preferences"
    3. Click "Resources"
    4. Increase "Memory" slider bar to 2.25 GB or higher
    5. Click "Apply & Restart"
📘  Documentation: https://docs.docker.com/docker-for-mac/#resources

👍  Starting minikube without Kubernetes minikube in cluster minikube
🚜  Pulling base image ...
❗  minikube was unable to download gcr.io/k8s-minikube/kicbase:v0.0.28, but successfully downloaded docker.io/kicbase/stable:v0.0.28 as a fallback image
🔥  Creating docker container (CPUs=2, Memory=1800MB) ...
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

>`eval $(minikube docker-env)` 让 Docker CLI 与 minikube's VM 交互

{{< admonition tip >}}
Add this line to `.bash_profile` or `.zshrc` or ... if you want to *use minikube's daemon* by default (or if you do not want to set this every time you open a new terminal).

{{< /admonition >}}

>`docker info` 查看我们现在终端的 docker 信息

```tex
Kernel Version: 5.10.76-linuxkit
Operating System: Ubuntu 20.04.2 LTS
OSType: linux
Architecture: x86_64
CPUs: 3
Total Memory: 4.083GiB
Name: minikube

No Proxy: control-plane.minikube.internal
 Registry: https://index.docker.io/v1/
 Labels:
  provider=docker
 Experimental: false
 Insecure Registries:
  docker.mirrors.ustc.edu.cn
  mirror.ccs.tencentyun.com
  reg-mirror.qiniu.com
  10.96.0.0/12
  127.0.0.0/8
 Live Restore Enabled: false
```

>新打开一个终端查看本机 `docker info`

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

>`minikube start --driver=docker --cpus=2 --memory=1800mb --insecure-registry=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com`

```tex
😄  minikube v1.24.0 on Darwin 12.2.1
    ▪ MINIKUBE_ACTIVE_DOCKERD=minikube
✨  Using the docker driver based on user configuration

⛔  Docker Desktop only has 4180MiB available, you may encounter application deployment failures.
💡  Suggestion:

    1. Click on "Docker for Desktop" menu icon
    2. Click "Preferences"
    3. Click "Resources"
    4. Increase "Memory" slider bar to 2.25 GB or higher
    5. Click "Apply & Restart"
📘  Documentation: https://docs.docker.com/docker-for-mac/#resources

👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
💾  Downloading Kubernetes v1.22.3 preload ...
    > preloaded-images-k8s-v13-v1...: 501.73 MiB / 501.73 MiB  100.00% 21.11 Mi

❗  minikube was unable to download gcr.io/k8s-minikube/kicbase:v0.0.28, but successfully downloaded docker.io/kicbase/stable:v0.0.28 as a fallback image
🔥  Creating docker container (CPUs=2, Memory=1800MB) ...
❗  This container is having trouble accessing https://k8s.gcr.io
💡  To pull new external images, you may need to configure a proxy: https://minikube.sigs.k8s.io/docs/reference/networking/proxy/
🐳  Preparing Kubernetes v1.22.3 on Docker 20.10.8 ...
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

>`minikube dashboard`

```tex
🔌  Enabling dashboard ...
    ▪ Using image kubernetesui/metrics-scraper:v1.0.7
    ▪ Using image kubernetesui/dashboard:v2.3.1
🤔  Verifying dashboard health ...
🚀  Launching proxy ...
🤔  Verifying proxy health ...
🎉  Opening http://127.0.0.1:51816/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/ in your default browser...
```

{{< /admonition >}}

## **注意事项**

>如果你启动时指定 **driver=docker，且本机 `docker daemon`** 未运行，*可能出现以下错误*

```tex
😄  minikube v1.24.0 on Darwin 10.15.7
    ▪ MINIKUBE_ACTIVE_DOCKERD=minikube
✨  Using the docker driver based on user configuration

💣  Exiting due to PROVIDER_DOCKER_NOT_RUNNING: "docker version --format -" exit status 1: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
💡  Suggestion: Start the Docker service
📘  Documentation: https://minikube.sigs.k8s.io/docs/drivers/docker/
```

>使用 `driver=hyperkit` 启动即可

{{< admonition tip >}}
>`minikube start --no-kubernetes --driver=hyperkit --cpus=2 --memory=1800mb --insecure-registry=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com`

```tex
😄  minikube v1.24.0 on Darwin 10.15.7
    ▪ MINIKUBE_ACTIVE_DOCKERD=minikube
✨  Using the hyperkit driver based on user configuration

⛔  Requested memory allocation (1800MB) is less than the recommended minimum 1900MB. Deployments may fail.

👍  Starting minikube without Kubernetes minikube in cluster minikube
🔥  Creating hyperkit VM (CPUs=2, Memory=1800MB, Disk=20000MB) ...
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

{{< /admonition >}}

## 更多

- **[Using minikube as Docker Desktop Replacement](https://minikube.sigs.k8s.io/docs/tutorials/docker_desktop_replacement/)**
- [How to interact with registries](https://minikube.sigs.k8s.io/docs/handbook/registry/)
- [minikube-image-build](https://minikube.sigs.k8s.io/docs/commands/image/#minikube-image-build)
- [containerd](https://github.com/containerd/containerd)

## 参考

- [run-docker-without-docker-desktop-on-macos](https://dhwaneetbhatt.com/blog/run-docker-without-docker-desktop-on-macos)
- [minikube docs](https://minikube.sigs.k8s.io/docs/)

