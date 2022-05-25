# Go Kafka Consumer Group Usage


本文基于 `Go 1.18`、`Kafka 2.4.1`， 利用 `Kafka Consumer Group` 进行消息消费，提供了最佳范例及部分配置建议，减少因 `Rebalance` 引起的 `timeout` 问题发生。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## Consumer Group

`consumer group` 是 `kafka` 提供的可扩展且具有容错性的消费者机制。具有一些特性:

- `consumer group` 由**一个或多个** `consumer` 组成，它们共同消费**一个或多个** `topic` 中的消息
- `consumer group` 由 `group ID` 唯一标识，组内消费者共享 `group ID`
- 一个 `topic` 的每个分区只能被同一个消费者组中的一个 `consumer` 消费，但可以被不同组中的消费者进行消费

{{< admonition tip >}}

- 分区数应大于消费者个数，消费能力不足时可以考虑增加消费者个数
- 当单纯提升消费者个数不能显著增加消费能力时，考虑优化你的消费处理逻辑
- 消费者个数必须进行限制，避免 `rebalance` 耗时过长
{{< /admonition >}}

## Rebalance

分区的重平衡 (`Rebalance`) 是 `Kafka` 一个很重要特性，它可以保证系统的高可用和系统的水平扩展。以下几种情况会触发 `Kafka` 发生重平衡。

- 消费者组成员变化:
  - **新消费者加入**
  - *老消费者离开*: 主动离开，主动 `rebalance`
  - *老消费者故障离开或崩溃*: 超过一定时间未发送心跳，可被视为宕机，需要在一个 `session.timeout` 周期才能检测到，被动 `rebalance`
- 订阅的 `topic` 数量变化: 如通过正则方式进行订阅，所匹配 `topic` 的数量变化
- 订阅的 `topic` 分区数变化

{{< admonition note >}}

- 优点: 可以保证高可用性和扩展性
- 缺点: 重平衡期间，整个消费者组不可用；重平衡会导致消费者需要更新状态，原消费者状态过期，降低消费者能力
{{< /admonition >}}

## GO Consumer Group

### ConsumerGroup 接口及说明

```go
// ConsumerGroup is responsible for dividing up processing of topics and partitions
// over a collection of processes (the members of the consumer group).
type ConsumerGroup interface {
	// Consume joins a cluster of consumers for a given list of topics and
	// starts a blocking ConsumerGroupSession through the ConsumerGroupHandler.
	//
	// The life-cycle of a session is represented by the following steps:
	//
	// 1. The consumers join the group (as explained in https://kafka.apache.org/documentation/#intro_consumers)
	//    and is assigned their "fair share" of partitions, aka 'claims'.
	// 2. Before processing starts, the handler's Setup() hook is called to notify the user
	//    of the claims and allow any necessary preparation or alteration of state.
	// 3. For each of the assigned claims the handler's ConsumeClaim() function is then called
	//    in a separate goroutine which requires it to be thread-safe. Any state must be carefully protected
	//    from concurrent reads/writes.
	// 4. The session will persist until one of the ConsumeClaim() functions exits. This can be either when the
	//    parent context is canceled or when a server-side rebalance cycle is initiated.
	// 5. Once all the ConsumeClaim() loops have exited, the handler's Cleanup() hook is called
	//    to allow the user to perform any final tasks before a rebalance.
	// 6. Finally, marked offsets are committed one last time before claims are released.
	//
	// Please note, that once a rebalance is triggered, sessions must be completed within
	// Config.Consumer.Group.Rebalance.Timeout. This means that ConsumeClaim() functions must exit
	// as quickly as possible to allow time for Cleanup() and the final offset commit. If the timeout
	// is exceeded, the consumer will be removed from the group by Kafka, which will cause offset
	// commit failures.
	// This method should be called inside an infinite loop, when a
	// server-side rebalance happens, the consumer session will need to be
	// recreated to get the new claims.
	Consume(ctx context.Context, topics []string, handler ConsumerGroupHandler) error

	// Errors returns a read channel of errors that occurred during the consumer life-cycle.
	// By default, errors are logged and not returned over this channel.
	// If you want to implement any custom error handling, set your config's
	// Consumer.Return.Errors setting to true, and read from this channel.
	Errors() <-chan error

	// Close stops the ConsumerGroup and detaches any running sessions. It is required to call
	// this function before the object passes out of scope, as it will otherwise leak memory.
	Close() error
}
```

### ConsumerGroup Demo

```go
package kafka

import (
	"context"
	"log"
	"time"

	"github.com/Shopify/sarama"
	"github.com/pkg/errors"
)

type ConsumerGroup interface {
	Consume(topics []string, handler sarama.ConsumerGroupHandler)
}

type consumerGroup struct {
	ctx           context.Context
	consumerGroup sarama.ConsumerGroup
	groupId       string
	brokers       []string
	done          chan struct{}
	cancel        context.CancelFunc
}

func NewConsumerGroup(ctx context.Context, groupId string, brokers []string) ConsumerGroup {
	config := sarama.NewConfig()
	config.Version = sarama.V2_4_1_0
	config.Consumer.Return.Errors = true
	config.Net.ReadTimeout = time.Second * 75                  // default 30s
	config.Consumer.Group.Rebalance.Timeout = time.Second * 60 // default 60s
	config.Consumer.Group.Session.Timeout = time.Second * 45   // default 10s
	config.Consumer.Group.Heartbeat.Interval = time.Second * 5 // default 3s, must <= 1/3 * Group.Session.Timeout
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategySticky
	config.Consumer.MaxWaitTime = time.Millisecond * 250 // default 250ms
	config.Consumer.Retry.Backoff = time.Second * 2      // default 2s

	cg, err := sarama.NewConsumerGroup(brokers, groupId, config)
	if err != nil {
		panic(errors.Wrap(err, "consumerGroup create err"))
	}

	go func() {
		for err := range cg.Errors() {
			log.Printf("consumerGroup, group_id:%v, err:%v", groupId, err)
		}
	}()

	ctx, cancel := context.WithCancel(ctx)
	return &consumerGroup{
		ctx:           ctx,
		consumerGroup: cg,
		groupId:       groupId,
		brokers:       brokers,
		done:          make(chan struct{}),
		cancel:        cancel,
	}
}
func (c *consumerGroup) Consume(topics []string, handler sarama.ConsumerGroupHandler) {
	go func() {
		defer func(consumerGroup sarama.ConsumerGroup) {
			err := consumerGroup.Close()
			if err != nil {

			}
		}(c.consumerGroup)

	Loop:
		for {
			if err := c.consumerGroup.Consume(c.ctx, topics, handler); err != nil {
				switch err {
				case sarama.ErrClosedClient, sarama.ErrClosedConsumerGroup:
					log.Printf("consumerGroup.Consume() topic:%v, shutdown with err:%v", topics, err)
					break Loop
				case sarama.ErrOutOfBrokers:
					log.Printf("consumerGroup.Consume() topic:%v, err:%v", topics, sarama.ErrOutOfBrokers)
				default:
					log.Printf("consumerGroup.Consume() topic:%v, err:%v", topics, err)
				}
				time.Sleep(time.Second)
			}
			select {
			case <-c.done:
				log.Printf("session exit after close signal")
				break Loop
			default:
				log.Printf("server-side reBalance happens, consumer session exit, will recreated")
			}
		}
	}()
}

func (c *consumerGroup) Close() {
	go func() { c.done <- struct{}{} }()
	c.cancel()
	if err := c.consumerGroup.Close(); err != nil {
		log.Printf("consumerGroup close error, %v", err)
	} else {
		log.Printf("consumerGroup exit gracefully")
	}
}

```

## 部分配置参数说明

- `Net.ReadTimeout`: **How long to wait for a response.**
- `Group.Rebalance.Timeout`: The maximum allowed time for each worker to join the group once a rebalance has begun.This is basically a limit on the amount of time needed for all tasks to flush any pending data and commit offsets. If the timeout is exceeded, then the worker will be removed from the group, which will cause offset commit failures (default 60s).
- `Group.Session.Timeout`: The timeout used to detect consumer failures when using Kafka's group management facility. The consumer sends periodic heartbeats to indicate its liveness to the broker. If no heartbeats are received by the broker before the expiration of this session timeout, then the broker will remove this consumer from the group and initiate a rebalance. Note that the value must be in the allowable range as configured in the broker configuration by `group.min.session.timeout.ms` and `group.max.session.timeout.ms` (default 10s)
- `Group.Heartbeat.Interval`: The expected time between heartbeats to the consumer coordinator when using Kafka's group management facilities. Heartbeats are used to ensure that the consumer's session stays active and to facilitate rebalancing when new consumers join or leave the group. The value must be set lower than Consumer.Group.Session.Timeout, but typically should be set no higher than 1/3 of that value.
- `Group.Rebalance.Strategy`: Strategy for allocating topic partitions to members (default BalanceStrategyRange), ["range", "roundrobin", "sticky"]
- `MaxWaitTime`:The maximum amount of time the broker will wait for Consumer.Fetch.Min bytes to become available before it returns fewer than that anyways.
- `Retry.Backoff`: How long to wait after a failing to read from a partition before trying again.

## 参数配置建议

- `Net.ReadTimeout`: 默认值 `30s`，如果消费者常出现 `read tcp xxx i/o timeout` 可考虑增大此值
  - `> session.timeout`
  - `> rebalance.timeout`
- `Group.Rebalance.Timeout`: 默认值 `60s`，如果消费者较多可考虑增大此值；对于 `TPS` 较低的主题可以适当降低此值
- `Group.Session.Timeout`: 默认值 `10s`，消费者未上报心跳超过此时间则认为宕机，触发 `rebalance`
  - `shall >= 1/3 * Group.Heartbeat.Interval`
- `Group.Heartbeat.Interval`: 默认值 `3s` 消费者心跳上报间隔
- `Group.Rebalance.Strategy`: rebalance 策略
  - `range`: default，*针对每一个 topic，n=分区数/消费者数量, m=分区数%消费者数量，前 m 个消费者每个分配 n+1 个分区，后面的 （消费者数量-m）个消费者每个分配 n 个分区*
  - `roundrobin`: 将消费组内所有消费者以及消费者所订阅的所有 `topic` 的 `partition` 按照字典序排序，然后通过轮询方式逐个将分区以此分配给每个消费者
  - `sticky`: **粘性策略**，尽可能保证消费者消费数据均匀
    - 分区的分配要尽可能的均匀，分配给消费者者的主题分区数最多相差一个
    - 分区的分配尽可能的与上次分配的保持相同
- `MaxWaitTime`: 默认值 `250ms`，最多等待此时间或数据达到 `fetch.min.bytes` 后发送数据给消费者
- `Retry.Backoff`: 默认值 `2s`

