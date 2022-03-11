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

**Uninstall** `Docker Desktop` by removing `/Applications/Docker.app`。

## minikube

### 环境要求

- 最少 2核
- 最少 2GB 可用内存
- 最少 20GB 可用磁盘空间
- 网络连接
- 容器或虚拟机管理器, 如: **[Docker](https://docs.docker.com/get-docker/)**, **[Hyperkit](https://github.com/moby/hyperkit)**, Hyper-V, KVM, Parallels, **[podman](https://podman.io/)**, *[VirtualBox](https://www.virtualbox.org/)*, or VMware Fusion/Workstation

### 安装

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

### 检查安装

执行 `which minikube`

{{< admonition warning >}}
brew 方式安装后执行 `which minikube`，如果失败可执行以下命令

```bash
brew unlink minikube
brew link minikube
```

*remove the old minikube links and link the newly installed binary*
{{< /admonition >}}

## 启动

```bash
minikube start

# Tell Docker CLI to talk to minikube's VM
# Add this line to .bash_profile or .zshrc or ... if you want to use minikube's daemon by default (or if you do not want to set this every time you open a new terminal).

eval $(minikube docker-env)

# Save IP to a hostname
# echo "`minikube ip` docker.local" | sudo tee -a /etc/hosts > /dev/null

# Test
docker run hello-world
```

## 镜像源修改

>也可以在启动时指定: `minikube start --image-mirror-country='cn'` 见 [minikube start](https://minikube.sigs.k8s.io/docs/commands/start/)

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

## 更多

- **[Using minikube as Docker Desktop Replacement](https://minikube.sigs.k8s.io/docs/tutorials/docker_desktop_replacement/)**
- [How to interact with registries](https://minikube.sigs.k8s.io/docs/handbook/registry/)
- [minikube-image-build](https://minikube.sigs.k8s.io/docs/commands/image/#minikube-image-build)
- [containerd](https://github.com/containerd/containerd)

## 参考

- [run-docker-without-docker-desktop-on-macos](https://dhwaneetbhatt.com/blog/run-docker-without-docker-desktop-on-macos)
- [minikube docs](https://minikube.sigs.k8s.io/docs/)

