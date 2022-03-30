# Pyroscope Go 性能数据持续收集分析


**[Pyroscope](https://pyroscope.io/)** 开放源码的性能持续分析平台。支持多种语言：`Go`, `Python`, `Rust`, `Java` 等，支持**多平台**，**多种部署方式**。具有便捷的可视化分析界面，极致的数据查询、分析与存储能力，可配的数据淘汰策略，`Push` 与 `Pull` 模式。可支持多种数据导出格式： `png`，`json`， `pprof`， `html`，`flamegraph.com`，可接入 [`grafana`](https://grafana.com/grafana/plugins/pyroscope-panel/) 展示。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 为什么使用

- 了解应用程序的哪些部分消耗资源最多
- 持续性分析增加了一个时间维度，允许您随着时间的推移了解系统资源使用情况(如 CPU、内存等) ，并使你能够定位、调试和修复与性能相关的问题。

## 使用场景

- 查找代码中的性能问题
- 解决高 CPU 利用率的问题
- 定位并修复内存泄漏
- 理解应用程序的调用树
- 跟踪指标随时间的变化

## 负载消耗

通过使用采样分析，**Pyroscope** 能够以最小的开销(约为 `2-5%`)收集数据。 特别构建的*存储引擎*能*高效地压缩和存储数据*。

- 由于采样分析技术，CPU 开销较低
- 控制分析数据粒度(`10s` 至多年)
- 高效的压缩，低的磁盘空间需求和成本

## 工作模式

>类似于常见的数据采集处理工具，`Agent-Server` 模式。

- `Pyroscope Server` *记录并聚合应用程序正在执行的操作，然后将该数据发送到 `Pyroscope` 服务器。*
- `Pyroscope Agent` 处理、聚合和存储来自代理的数据，以实现任意时间范围内的快速查询。稍后，你可以查看在任何时间范围内的分析数据。

![pyroscope-agents](/images/go/pyroscope-agents.jpeg)

## Server 安装

### 安装部署方式

- Docker
- K8S
- Direct
  - MacOS
  - Linux
  - Windows

### MacOS 与 Linux 安装示例

- [install-macos](https://pyroscope.io/docs/server-install-macos/)
- [install-linux](https://pyroscope.io/docs/server-install-linux/)

{{< admonition example >}}

>`export pyroscope_version=0.13.0`

```bash
# MacOs
brew install pyroscope-io/brew/pyroscope
brew services start pyroscope-server

# Ubuntu/Debian
wget https://dl.pyroscope.io/release/pyroscope_"${pyroscope_version}"_amd64.deb
sudo apt-get install ./pyroscope_"${pyroscope_version}"_amd64.deb

# CentOS
wget https://dl.pyroscope.io/release/pyroscope-"${pyroscope_version}"-1-x86_64.rpm
sudo yum localinstall pyroscope-"${pyroscope_version}"-1-x86_64.rpm

# Use systemctl to enable boot start and start the service
sudo systemctl enable pyroscope-server
sudo systemctl start pyroscope-server
```

{{< /admonition >}}

### 配置

支持多种[配置](https://pyroscope.io/docs/server-configuration/)，优先级如下：

1. **命令行参数**
2. *环境变量*
3. 配置文件

我们将使用配置文件进行服务端的配置。配置文件默认位置：

- `/etc/pyroscope/server.yml` **on Linux**
- `/usr/local/etc/pyroscope/server.yml` **on Intel macOS**
- `/opt/homebrew/etc/pyroscope/server.yml` *on M1 macOS*

可通过参数指定配置文件路径：

- `pyroscope server -config my-custom-config.yml` `命令行方式指定` **推荐**
- `PYROSCOPE_CONFIG=/tmp/pyroscope-server.yml pyroscope server` 环境变量指定

{{< admonition example >}}

>`pyroscope-server.yml`

```tex
---

auth:
 # Specifies which role will be granted to a newly signed up user.
  # Supported roles: Admin, ReadOnly. Defaults to ReadOnly.
  # The parameter affects all authentication providers.
  signup-default-role: ReadOnly
  # Internal authentication provider configuration.
  internal:
    admin:
      create: true
    enabled: true
    signup-enabled: true
    
# Disables analytics.
analytics-opt-out: "false"

# Log level: debug|info|warn|error.
log-level: "info"

# Log level: debug|info|warn|error.
badger-log-level: "error"

# Directory where pyroscope stores profiling data.
storage-path: "/var/lib/pyroscope"

# Port for the HTTP server used for data ingestion and web UI.
api-bind-addr: ":4040"

# Base URL for when the server is behind a reverse proxy with a different path.
base-url: ""

# Percentage of memory at which cache evictions start.
cache-evict-threshold: "0.25"

# Percentage of cache that is evicted per eviction run.
cache-evict-volume: "0.33"

# Database configuration. By default, Pyroscope Server uses embedded sqlite3 database.
database:
  # Indicates the database type. Supported DB engines: sqlite3.
  type: "sqlite3"
  # Database connection string. Specific to the engine.
  url: "/var/lib/pyroscope/pyroscope.db"

# Indicates whether value log files should be truncated to delete corrupt data, if any.
badger-no-truncate: "false"

# Disables /debug/pprof route.
disable-pprof-endpoint: "false"

# Max number of nodes used when saving profiles to disk.
max-nodes-serialization: "2048"

# Max number of nodes used to display data on the frontend.
max-nodes-render: "8192"

# Please don't use, this will soon be deprecated.
hide-applications: []

# Sets the maximum amount of time the profiling data is stored for. Data before this threshold is deleted. Disabled by default.
# retention: "0s"

retention: "480h"

# Specifies how long the profiling data is stored per aggregation level. Disabled by default.
# retention-levels: {}
# 0: 720h  # 30 days
# 1: 2160h # 90 days

retention-levels:
 0: 480h  # 20 days
 1: 1440h # 60 days

# Metrics export rules.
metrics-export-rules: {}

# A list of scrape configurations.
scrape-configs: []

# Location of TLS Certificate file (.crt).
tls-certificate-file: ""

# Location of TLS Private key file (.key).
tls-key-file: ""
```

{{< /admonition >}}

### 启动

`pyroscope server -config pyroscope-server.yml.yml`

## Go Agent 使用

>采用 `Push 模式`，简单高效。

### 依赖导入

`go get github.com/pyroscope-io/client/pyroscope`

### Agent Push 示例

```go
package main

import "github.com/pyroscope-io/client/pyroscope"

func main() {
  pyroscope.Start(pyroscope.Config{
    ApplicationName: "simple.golang.app",

    // replace this with the address of pyroscope server
    ServerAddress:   "http://pyroscope-server:4040",

    // you can disable logging by setting this to nil
    Logger:          pyroscope.StandardLogger,

    // optionally, if authentication is enabled, specify the API key:
    // AuthToken: os.Getenv("PYROSCOPE_AUTH_TOKEN"),

    // by default all profilers are enabled,
    // but you can select the ones you want to use:
    ProfileTypes: []pyroscope.ProfileType{
      pyroscope.ProfileCPU,
      pyroscope.ProfileAllocObjects,
      pyroscope.ProfileAllocSpace,
      pyroscope.ProfileInuseObjects,
      pyroscope.ProfileInuseSpace,
    },
  })

  // your code goes here
}
```

## 认证登录

>默认用户及密码为: `admin`:`admin`

- [api-key-authentication](https://pyroscope.io/docs/api-key-authentication/)
- [内部身份验证](https://pyroscope.io/docs/auth-internal)

`pyroscope admin user reset-password --username {admin-username} --password {new-password}`

## 数据查询导出

- [grafana](https://pyroscope.io/docs/grafana-plugins/)
- [API](https://pyroscope.io/docs/server-api-reference/)
- **UI 界面操作**
  - `png`
  - `json`
  - `pprof`
  - `html`
  - `flamegraph.com`

![proscope-server-table-flamegraph](/images/go/proscope-server-table-flamegraph.png)

## 参考

- [pyroscope docs](https://pyroscope.io/docs/)
- [pyroscope-io](https://github.com/pyroscope-io/pyroscope)

