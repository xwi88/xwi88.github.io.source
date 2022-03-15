# Go 程序常用 kill 信号及捕获


Go 程序常用 kill 信号及捕获， *MacOS* 下验证，基于 `go1.17.7`。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 常用信号

```tex
Some of the more commonly used signals:

 1       HUP (hang up)
 2       INT (interrupt)
 3       QUIT (quit)
 6       ABRT (abort)
 9       KILL (non-catchable, non-ignorable kill)
 14      ALRM (alarm clock)
 15      TERM (software termination signal)
 
 
 30      USR1 (user defined signal 1)
 31      USR2 (user defined signal 2)
```

## Go Code

```go
done := make(chan struct{})
ch := make(chan os.Signal, 1)
signal.Notify(ch, syscall.SIGHUP, syscall.SIGQUIT, syscall.SIGABRT, syscall.SIGKILL, syscall.SIGALRM, syscall.SIGUSR1, syscall.SIGUSR2, syscall.SIGTERM, syscall.SIGINT)

go func() {
    sgName := <-ch
    fmt.Printf("receive kill signal [%v], ready to exit ...", sgName)
    // resource release and other deals
    done <- struct{}{}
}

<-done
```

>需要更便捷处理可以引入: [signal](https://github.com/love-wheel/signal)

## kill 测试

>*宿主机上执行* `kill` 程序停止 `app` 运行，按照 `app` 运行环境分为：**宿主环境**，**docker 环境**

### 宿主环境

`kill -<signal_number | signal_name> <pid>`

{{< admonition tip >}}
linux/unix kill 默认 `signal_number=15` **TERM**
{{< /admonition >}}

经测试: **可正常捕获且返回 0 的 signal**:

- `1, 2, 3, 6, 14, 15`, **`30, 31`**
- `HUP, INI, QUIT, ABRT, ALRM, TERM, USR1, USR2`
  - **不区分大小写**
  - **可附加前缀 `SIG`**，同样**不区分大小写**

### docker 环境

> `docker kill -<signal_number | signal_name> <container_id>`

{{< admonition tip >}}
docker kill 默认 `signal_number=9` **KILL**
{{< /admonition >}}

经测试: **可正常捕获且返回 0 的 signal**:

- `1, 2, 3, 6, 14, 15`, **`10, 12`**
  - **经测试，docker kill 时 传入 `10, 12` 才可被识别为 `USR1, USR2`**
  - 原因暂时不明，**不建议使用 `USR1`, `USR2`**
- `HUP, INI, QUIT, ABRT, ALRM, TERM, USR1, USR2`
  - **不区分大小写**
  - **可附加前缀 `SIG`**，同样**不区分大小写**

## 结论

>经过以上测试，**常用可正常捕获无差异性且返回 0 的 signal**: `1, 2, 3, 6, 14, 15`

根据信号表示意义，我们推荐程序使用

- 2 **SIGINT**
- 15 **SIGTERM**

## 优雅停止服务

1. 执行 kill 发送信号 `-15/-TERM/-SIGTERM`
2. 程序捕获信号后**节点摘除**, **释放资源**，*停止程序*
3. 间隔指定时间后，检测是否停止成功，未成功可根据设定策略执行 `kill -9/-KILL/-SIGKILL`

### k8s 停机实现

1. **节点摘除**
2. `preStop hook` *可设置延迟时间，用于处理进入流量*
3. 发送 kill 信号 `-15/-TERM/-SIGTERM`
4. 程序捕获信号**释放资源**，*停止程序*
5. 超时强制关闭处理 `kill -9/-KILL/-SIGKILL`
    - 默认 30s
    - pod: `terminationGracePeriodSecond` 修改

