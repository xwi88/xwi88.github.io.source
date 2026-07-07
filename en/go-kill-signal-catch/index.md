# Common kill Signals and How to Catch Them in Go


Common kill signals for Go programs and how to catch them. Verified on *MacOS*, based on `go1.17.7`.

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

## Common signals

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

>For a more convenient wrapper, see [signal](https://github.com/love-wheel/signal)

## kill testing

>Run `kill` on the host to stop the `app`. There are two runtime environments: **host** and **docker**.

### Host

`kill -<signal_number | signal_name> <pid>`

{{< admonition tip >}}
linux/unix `kill` defaults to `signal_number=15` **TERM**
{{< /admonition >}}

Tested — **signals that can be caught normally and return 0**:

- `1, 2, 3, 6, 14, 15`, **`30, 31`**
- `HUP, INT, QUIT, ABRT, ALRM, TERM, USR1, USR2`
  - **case-insensitive**
  - **`SIG` prefix allowed**, also **case-insensitive**

### docker

> `docker kill -<signal_number | signal_name> <container_id>`

{{< admonition tip >}}
`docker kill` defaults to `signal_number=9` **KILL**
{{< /admonition >}}

Tested — **signals that can be caught normally and return 0**:

- `1, 2, 3, 6, 14, 15`, **`10, 12`**
  - **In testing, `docker kill` only recognizes `10` and `12` as `USR1` and `USR2`**
  - Reason unclear; **`USR1` / `USR2` not recommended**
- `HUP, INT, QUIT, ABRT, ALRM, TERM, USR1, USR2`
  - **case-insensitive**
  - **`SIG` prefix allowed**, also **case-insensitive**

## Conclusion

>From the tests above, the **commonly catchable, no-difference, return-0 signals** are: `1, 2, 3, 6, 14, 15`

By signal semantics, we recommend using:

- 2 **SIGINT** — trigger: `CTRL+C` or `kill -2`
- 15 **SIGTERM**

## Graceful shutdown

1. Send `kill` with `-15/-TERM/-SIGTERM`
2. After the program catches the signal: **remove the node from discovery**, **release resources**, *stop the program*
3. After a configured interval, check whether it stopped; if not, fall back to `kill -9/-KILL/-SIGKILL` per your policy

## k8s graceful shutdown

1. **Remove the node**
2. `preStop hook` *optional delay, to drain in-flight traffic*
3. Send `kill` with `-15/-TERM/-SIGTERM`
4. The program catches the signal, **releases resources**, *stops*
5. Force-killed on timeout via `kill -9/-KILL/-SIGKILL`
    - default 30s
    - pod: `terminationGracePeriodSeconds` to change it

## Docker-compose kill issue

- Current `Docker Compose version 2.2.2`

`docker-compose` may fail to stop on `CTRL+C`; force quit with `CTRL+\`

