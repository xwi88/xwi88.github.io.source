# Go Kafka Consumer Group Usage


Based on `Go 1.18` and `Kafka 2.4.1`, this post consumes messages via a `Kafka Consumer Group`, provides a best-practice example and configuration tips, and reduces `timeout` issues caused by `Rebalance`.

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

## Consumer Group

A `consumer group` is Kafka's scalable, fault-tolerant consumer mechanism. A few properties:

- A `consumer group` is made up of **one or more** `consumer`s that together consume messages from **one or more** `topic`s
- A `consumer group` is uniquely identified by its `group ID`; consumers in the group share that `group ID`
- Each partition of a `topic` can be consumed by only one `consumer` within the same group, but can be consumed by consumers in different groups

{{< admonition tip >}}

- The partition count should exceed the number of consumers; if throughput is insufficient, consider adding consumers
- When simply adding consumers no longer boosts throughput notably, optimize your consumption logic
- The number of consumers must be bounded to avoid excessively long `rebalance`s
{{< /admonition >}}

## Rebalance

Partition rebalancing (`Rebalance`) is a key Kafka feature that guarantees high availability and horizontal scaling. The following trigger a Kafka rebalance:

- Consumer-group membership changes:
  - **A new consumer joins**
  - *An existing consumer leaves*: voluntary leave → voluntary `rebalance`
  - *An existing consumer fails or crashes*: if it stops sending heartbeats beyond a threshold it's considered dead; detection takes one `session.timeout` cycle → involuntary `rebalance`
- The number of subscribed `topic`s changes (e.g. regex subscription where matching `topic`s change)
- The partition count of a subscribed `topic` changes

{{< admonition note >}}

- Pros: guarantees high availability and scalability
- Cons: during a rebalance the whole consumer group is unavailable; rebalancing forces consumers to refresh state, and old consumer state expires, lowering consumer capacity
{{< /admonition >}}

## Go Consumer Group

### ConsumerGroup interface & notes

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

## Selected config parameters

- `Net.ReadTimeout`: **How long to wait for a response.**
- `Group.Rebalance.Timeout`: The maximum allowed time for each worker to join the group once a rebalance has begun.This is basically a limit on the amount of time needed for all tasks to flush any pending data and commit offsets. If the timeout is exceeded, then the worker will be removed from the group, which will cause offset commit failures (default 60s).
- `Group.Session.Timeout`: The timeout used to detect consumer failures when using Kafka's group management facility. The consumer sends periodic heartbeats to indicate its liveness to the broker. If no heartbeats are received by the broker before the expiration of this session timeout, then the broker will remove this consumer from the group and initiate a rebalance. Note that the value must be in the allowable range as configured in the broker configuration by `group.min.session.timeout.ms` and `group.max.session.timeout.ms` (default 10s)
- `Group.Heartbeat.Interval`: The expected time between heartbeats to the consumer coordinator when using Kafka's group management facilities. Heartbeats are used to ensure that the consumer's session stays active and to facilitate rebalancing when new consumers join or leave the group. The value must be set lower than Consumer.Group.Session.Timeout, but typically should be set no higher than 1/3 of that value.
- `Group.Rebalance.Strategy`: Strategy for allocating topic partitions to members (default BalanceStrategyRange), ["range", "roundrobin", "sticky"]
- `MaxWaitTime`:The maximum amount of time the broker will wait for Consumer.Fetch.Min bytes to become available before it returns fewer than that anyways.
- `Retry.Backoff`: How long to wait after a failing to read from a partition before trying again.

## Configuration recommendations

- `Net.ReadTimeout`: default `30s`; if consumers often hit `read tcp xxx i/o timeout`, consider raising it
  - `> session.timeout`
  - `> rebalance.timeout`
- `Group.Rebalance.Timeout`: default `60s`; with many consumers, consider raising it; for low-`TPS` topics it can be lowered
- `Group.Session.Timeout`: default `10s`; if a consumer stops sending heartbeats beyond this, it's considered dead and a `rebalance` is triggered
  - `shall >= 1/3 * Group.Heartbeat.Interval`
- `Group.Heartbeat.Interval`: default `3s`, the consumer's heartbeat interval
- `Group.Rebalance.Strategy`: the rebalance strategy
  - `range`: default; *per topic, n = partitions/consumers, m = partitions % consumers; the first m consumers each get n+1 partitions, the remaining (consumers − m) each get n*
  - `roundrobin`: sort all consumers in the group and all partitions of their subscribed `topic`s lexicographically, then assign partitions to consumers round-robin
  - `sticky`: **sticky strategy**; keeps consumption as balanced as possible
    - partition allocation should be as even as possible — the partition counts assigned to any two consumers differ by at most one
    - the allocation should stay as close to the previous one as possible
- `MaxWaitTime`: default `250ms`; data is sent to the consumer after at most this long, or once `fetch.min.bytes` is reached
- `Retry.Backoff`: default `2s`

