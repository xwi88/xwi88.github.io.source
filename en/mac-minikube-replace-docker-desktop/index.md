# Replacing Docker Desktop with minikube on Mac


On **[2021-08-31 Docker announced](https://www.docker.com/blog/updating-product-subscriptions/)** that [Docker Desktop](https://www.docker.com/products/docker-desktop) would no longer be free for larger organizations. So we need a convenient replacement for `Docker Desktop` with minimal disruption — such as [minikube](https://minikube.sigs.k8s.io/docs/), [Hyperkit](https://github.com/moby/hyperkit), or [podman](https://podman.io/).

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

## Terminology

- **[Docker Inc](https://en.wikipedia.org/wiki/Docker,_Inc.)** a US-based company that built open-source and closed-source software making it easier to develop, test, and run applications in containers.
- **[Docker Engine](https://github.com/docker/engine)** the core technology behind Docker. Open-source software that runs as a daemon on Linux and makes running containers on the Linux kernel possible. It owns the container lifecycle and the isolation of physical resources (compute, memory, storage) a container can access. It can run on physical or virtual machines, but only on a Linux kernel — i.e. on any Linux-flavored OS. This is important: **the Docker engine runs only on Linux**.
- **[Docker CLI](https://github.com/docker/cli)** *CLI* that developers usually use to interact with the docker engine. Includes the `docker` and `docker-compose` commands. Again, open source.
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** since Docker Engine runs only on Linux, developers on Windows and macOS can only run the engine after starting a Linux VM. That's where Docker Desktop comes in. Docker Desktop is proprietary software that lets Windows/macOS developers use containers seamlessly in dev without managing VMs and all the details that entails (networking, virtualization, Linux knowledge, …). Docker Desktop is designed for use during software development; *it has no place in production-like containers*, where only `Docker Engine` is involved.

{{< admonition tip >}}
The way to keep running and building container apps on **macOS** is to run `Docker Engine` inside a `Linux VM`.
{{< /admonition >}}

## Requirements

- At least 2 CPUs
- At least 2 GB of free memory
- At least 20 GB of free disk space
- A network connection
- A container or VM manager, e.g. **[Docker](https://docs.docker.com/get-docker/)**, **[Hyperkit](https://github.com/moby/hyperkit)**, Hyper-V, KVM, Parallels, **[podman](https://podman.io/)**, *[VirtualBox](https://www.virtualbox.org/)*, or VMware Fusion/Workstation

## Installation

>If you're sure you won't run images in `docker desktop` anymore, remove all `docker` / `docker desktop` related config.

{{< admonition example >}}

>[Homebrew](https://brew.sh/) install recommended

```bash
brew install docker
brew install docker-compose # optional, as needed

brew install hyperkit
brew install minikube
```

{{< admonition tip >}}
If installing `minikube` via *brew* fails, try a manual install

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube
```

{{< /admonition >}}
{{< /admonition >}}

## Verify the install

Run `which minikube`

{{< admonition warning >}}
After a *brew* install, if `which minikube` fails, run:

```bash
brew unlink minikube
brew link minikube
```

*remove the old minikube links and link the newly installed binary*
{{< /admonition >}}

## Drivers

>`minikube` needs a `Linux VM` to start on `mac/windows`; that's the driver we configure. With `--driver=docker` you need the matching `Docker Desktop` installed to reuse its `linux vm`.
Otherwise pick another driver. Supported drivers:

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
If you set `--driver=docker`, distinguish **`standard`** vs **`rootless`** docker

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
>More driver config & usage: [minikube drivers](https://minikube.sigs.k8s.io/docs/drivers/)

## Config commands

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

# insecure-registry didn't take effect in testing; pass it at start time!
minikube config set insecure-registry https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com
# minikube config set kubernetes-version <>

# The name of the minikube VM being used. This can be set to allow having multiple instances of minikube independently. (default "minikube")
minikube config set profile
```

{{< /admonition>}}

## Quick start

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

## Advanced start

>**[commands start](https://minikube.sigs.k8s.io/docs/commands/start/)**

### Start command

- After some config changes you need `minikube delete` then restart

{{< admonition example >}}
`minikube start --driver=hyperkit` or `minikube start --driver=docker` or another driver

A config like the following is recommended so you don't have to enter the `minikube vm` to change things later. Key options:

- **`--insecure-registry`**
- *`--registry-mirror`*
- *`--mount`* **mount a host directory into the `minikube vm`**
  - On MacOS, `/Users:/minikube-host/` is mounted by default
  - **Keep the mount path identical to avoid path-dependent programs failing to start**
  - Use `--mount-string` to mount on demand
- **`--mount-string`** specify the mount directory
- **`--no-kubernetes`**
- **`--cpus`**
- **`--memory`**
- `--image-mirror-country`

`minikube start --no-kubernetes --registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com --mount /var/lib/minikube:/var/lib/docker`

To use the minikube dashboard, start like this:
`minikube start --cpus=2 --memory=2000mb \
    --registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com`

*Tell Docker CLI to talk to minikube's VM:* `eval $(minikube docker-env)`

`eval $(minikube docker-env)` can be added to your shell rc (`~/.zshrc` or `~/.bashrc`) so you don't type it each time.

{{< /admonition >}}

### Possible issues

{{< admonition warning >}}
*If you start `minikube` on top of `Docker Desktop`, it reuses that VM and config. Due to resource limits, `minikube` may fail to start.*

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

>`minikube delete` *after adjusting docker resources, delete and recreate, then restart*

```tex
🔥  Deleting "minikube" in docker ...
🔥  Removing ~/.minikube/machines/minikube ...
💀  Removed all traces of the "minikube" cluster.
```

{{< /admonition >}}

## Post-start environment check

{{< admonition example >}}

>Start command: `minikube start --no-kubernetes --insecure-registry=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com`

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

>`eval $(minikube docker-env)` **lets the Docker CLI talk to minikube's VM**

{{< admonition tip >}}
Add this line to `.bash_profile` or `.zshrc` or ... if you want to *use minikube's daemon* by default (or if you do not want to set this every time you open a new terminal).

{{< /admonition >}}

>`docker info` to see the docker info in this terminal

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

>Open a new terminal and check `docker info` on the host (a machine that still has docker desktop installed — for comparison):

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

## Change image registries

>**Don't make this change inside the minikube environment.** Pass it at start: `minikube start --image-mirror-country='cn'` etc.; see [minikube start](https://minikube.sigs.k8s.io/docs/commands/start/) or [Advanced start](#advanced-start)

{{< admonition example >}}
>`minikube ssh`  connect to the minikube node
>
>`sudo mkdir -p /etc/docker` create the docker directory
>
>`vi /etc/docker/daemon.json` edit the config
>
>`daemon.json` **daemon.json** config

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

## Directory mounting

>This will start the mount daemon and automatically mount files into minikube.

`minikube mount <local directory>:<host directory>`

**Mapping/mount chain**: `host volumes`<->`docker desktop VM volumes`<->`docker container volumes`

### Driver default mount paths

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

## **Running local apps**

>If you use directory mapping you must enable mounting, and mind the mount path — otherwise files or configs won't be found.

### **Files or configs not found**

{{< admonition warning >}}
Cause:

- With `docker desktop`, the mapping is done for you: `host volumes`<->`docker desktop VM volumes`<->`docker container volumes`
- When you run `docker run` or `docker-compose up` locally via `minikube`, it actually runs inside the `minikube vm`, but the `minikube vm` has **no mapping of your host source code**

{{< /admonition >}}

### **Solution**

>**Map/mount your working directory on the host**:
>
>- `minikube mount $HOME/workspace:$HOME/workspace`
>- **Mind the mapping path inside the minikube vm: the mount path must match the real path**
>- *Watch directory permissions — mounting under your own user dir usually has no permission issues*
>- You can mount multiple directories

{{< admonition tip >}}
Put your source under one unified working directory for easy mounting and search, e.g.:

- `$HOME/workspace` **source workspace; can be mounted as a whole**
- `$HOME/workspace/git.company.com` *company source workspace; company code only*
- `$HOME/workspace/github.com` *github source workspace*
- `$HOME/workspace/gitee.com`
{{< /admonition >}}

## Start on boot

>`--mount --mount-string=$HOME/workspace:$HOME/workspace` *may have issues; mounting via `minikube mount` after start is recommended*

### **Mount only the current project directory**

- Pro: fewer mount dirs, less space
- Con: switching projects means re-mounting — tedious

> **Prefer mounting the whole working directory (mind the size) — no extra steps when switching projects**

```bash
# --mount --mount-string=$HOME/workspace:$HOME/workspace

#minikube delete
minikube start --no-kubernetes --driver=hyperkit --cpus=2 --memory=2gb --disk-size=20gb \
--image-mirror-country=cn \
--registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com
eval $(minikube docker-env)
minikube mount ${PWD}:${PWD}
```

### **Mount the whole working directory**

```bash
# issues here {a lone --mount will mount: /Users:/minikube-host/; --mount-string mounts only the given dir, no --mount needed then — recommended}
# --mount --mount-string=$HOME/workspace:$HOME/workspace

#minikube delete
minikube start --no-kubernetes --driver=hyperkit --cpus=2 --memory=2gb --disk-size=20gb \
--image-mirror-country=cn \
--registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com
eval $(minikube docker-env)
minikube mount ${HOME}/workspace:${HOME}/workspace
```

### *Mount the whole working directory and run in the background*

```bash
# --mount --mount-string=$HOME/workspace:$HOME/workspace

#minikube delete
minikube start --no-kubernetes --driver=hyperkit --cpus=2 --memory=2gb --disk-size=40gb \
--image-mirror-country=cn \
--registry-mirror=https://docker.mirrors.ustc.edu.cn,https://reg-mirror.qiniu.com,https://mirror.ccs.tencentyun.com
eval $(minikube docker-env)
nohup minikube mount ${HOME}/workspace:${HOME}/workspace &
```

## **Caveats**

- After minikube starts, run `eval $(minikube docker-env)`
- *Mount directories after minikube starts* — see [Running local apps](#running-local-apps)
- Pass `--driver` at start; if it's `docker`, make sure the `docker daemon` is running
- If the mount flag is wrong, run `minikube mount --kill` and remove the dir from the `minikube vm`
- `minikube delete — you don't need to run it every time`

## More

- **[Using minikube as Docker Desktop Replacement](https://minikube.sigs.k8s.io/docs/tutorials/docker_desktop_replacement/)**
- [How to interact with registries](https://minikube.sigs.k8s.io/docs/handbook/registry/)
- [minikube-image-build](https://minikube.sigs.k8s.io/docs/commands/image/#minikube-image-build)
- [containerd](https://github.com/containerd/containerd)

## References

- [run-docker-without-docker-desktop-on-macos](https://dhwaneetbhatt.com/blog/run-docker-without-docker-desktop-on-macos)
- [minikube docs](https://minikube.sigs.k8s.io/docs/)

