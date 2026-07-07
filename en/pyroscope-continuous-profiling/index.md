# Pyroscope: Continuous Profiling for Go


**[Pyroscope](https://pyroscope.io/)** is an open-source continuous-profiling platform. It supports many languages (`Go`, `Python`, `Rust`, `Java`, …), runs on **multiple platforms** with **multiple deployment options**, ships a handy visual-analysis UI, powerful data querying/analysis/storage, configurable data-eviction policies, and both `Push` and `Pull` modes. It can export to several formats (`png`, `json`, `pprof`, `html`, `flamegraph.com`) and can be displayed inside [`grafana`](https://grafana.com/grafana/plugins/pyroscope-panel/).

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

## Why use it

- Understand which parts of your application consume the most resources
- Continuous profiling adds a time dimension, letting you track resource usage (CPU, memory, …) over time and locate, debug and fix performance issues

## Use cases

- Find performance problems in your code
- Resolve high CPU utilization
- Locate and fix memory leaks
- Understand your application's call tree
- Track how metrics change over time

## Overhead

By using sampling-based profiling, **Pyroscope** collects data with minimal overhead (around `2-5%`). Its purpose-built *storage engine* *compresses and stores data efficiently*.

- Low CPU overhead thanks to sampling
- Control the granularity of profiling data (`10s` up to multiple years)
- Efficient compression, low disk-space needs and cost

## Working mode

>Similar to common data-collection tools: an `Agent-Server` model.

- `Pyroscope Server` *records and aggregates what the application is doing, then sends that data to the Pyroscope server.*
- `Pyroscope Agent` processes, aggregates and stores the data from the agent to enable fast queries over arbitrary time ranges. You can then view profiling data over any time window.

![pyroscope-agents](/images/go/pyroscope-agents.jpeg "pyroscope agents")

## Server installation

### Install methods

- Docker
- K8S
- Direct
  - MacOS
  - Linux
  - Windows

### MacOS & Linux install example

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

### Configuration

Multiple [configuration](https://pyroscope.io/docs/server-configuration/) sources are supported, with this precedence:

1. **CLI flags**
2. *Environment variables*
3. Config file

We'll configure the server via a config file. Default locations:

- `/etc/pyroscope/server.yml` **on Linux**
- `/usr/local/etc/pyroscope/server.yml` **on Intel macOS**
- `/opt/homebrew/etc/pyroscope/server.yml` *on M1 macOS*

You can point to a config file explicitly:

- `pyroscope server -config my-custom-config.yml` `via CLI` **recommended**
- `PYROSCOPE_CONFIG=/tmp/pyroscope-server.yml pyroscope server` via env var

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

### Start

`pyroscope server -config pyroscope-server.yml.yml`

## Using the Go agent

>Uses `Push` mode — simple and efficient.

### Import the dependency

`go get github.com/pyroscope-io/client/pyroscope`

### Agent Push example

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

## Authentication

>Default username/password: `admin`:`admin`

- [api-key-authentication](https://pyroscope.io/docs/api-key-authentication/)
- [Internal authentication](https://pyroscope.io/docs/auth-internal)

`pyroscope admin user reset-password --username {admin-username} --password {new-password}`

## Query & export

- [grafana](https://pyroscope.io/docs/grafana-plugins/) [config](https://pyroscope.io/docs/api-key-authentication/)
- [API](https://pyroscope.io/docs/server-api-reference/)
- **UI operations**
  - `png`
  - `json`
  - `pprof`
  - `html`
  - `flamegraph.com`

![proscope-server-table-flamegraph](/images/go/proscope-server-table-flamegraph.png "proscope server table flamegraph")

## References

- [pyroscope docs](https://pyroscope.io/docs/)
- [pyroscope-io](https://github.com/pyroscope-io/pyroscope)

