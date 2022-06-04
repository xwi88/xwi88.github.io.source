# Go 对象池使用及优化-理论篇


Go 对象池用于`临时对象`重用，可以`减少对象频繁创建`造成的资源浪费，即`减少GC开销`及内存占用等，在一定程度上提升程序性能，降低服务成本。本文基于 `go1.18.2` ，给出对象池使用场景、**处理流程及注意事项**、开源示例、个人实例(包括`GRPC` 下对象池的使用)及最佳实践。

<!--more-->

## 场景

**需要频繁创建`同一类`对象，且创建成本较高时**

- 单个对象内存占用超过一定阈值，优势越明显
- 占用内存越大，优势越明显
- 并发量越大，优势越明显

## **处理流程及注意事项**

>创建的临时对象放回池中后需尽可能的满足：`无状态`，`无引用`

- 正常处理流: `Get` *`->Reset`* ->`deal`->`Put`，**`Put` 后无归还对象引用**
  - 适用于大部分需要池化的场景
- **特殊处理流**: `Get` *`->Reset`* ->`deal`->`Put`->`deal with ref`，**`Put` 后存在归还对象的引用**
  - 特殊场景，如: `GRPC service call`
  - **如非必要，务必不要使用**
  - *如要使用，请进行容错处理，尽最大可能降低副作用*

{{< admonition warning >}}

- **请尽可能的按照正常处理流进行使用**
- *务必保证: `Get` & `Put` 成对出现*
- **对`Put(归还)`后对象存在引用，若处理不当，可能会导致数据异常**
{{</ >}}

## 对象池数据结构

- `sync.pool`: 适用于大多数场景，易用高效
  - 池中的对象会在没有任何通知的情况下被移出（释放或者重新取出使用）。如果 pool 中持有某个对象的唯一引用，则该对象很可能会被回收。
- `channel`: 具有队列特性；内存占用趋于稳定，且不主动释放
- `ring buffer`: 具有队列特性；内存占用趋于稳定，且不主动释放；无锁 `read & write`

|结构|最小容量|最大容量|优点|缺点|
|:---|:---|:---|:---|:---|
|[**sync.pool**](https://pkg.go.dev/sync#Pool)|0|∞|简单易用|回收不可控|
|**channel**|0|**cap**|**可支持引用**|QPS受限于cap，内存占用|
|**ring buffer**|0|**cap**|**可支持引用**，*无锁*|QPS受限于cap，内存占用|

{{< admonition tip >}}
*支持引用的处理思路*: 适当增加冗余对象数量，即初始化`最少容量>=1*QPS ~ 2*QPS`，以减少对象引用可能造成的数据异常情况

- **以较少的空间占用换区对象池使用带来的高收益**
- **务必预估你的内存占用量**
- **务必注意单个对象的最大声明周期，耗时较长的操作请谨慎使用** `如: 超过 1s 且 QPS 较高`
- `初始化时容量设置: 最小容量=最大容量>=1*QPS`，尽可能只做一次分配
{{</  >}}

## 源码示例

### fmt/print.go

> [src/fmt/print.go](https://github.com/golang/go/blob/master/src/fmt/print.go)

```go
var ppFree = sync.Pool{
	New: func() any { return new(pp) },
}

// newPrinter allocates a new pp struct or grabs a cached one.
func newPrinter() *pp {
	p := ppFree.Get().(*pp)
	p.panicking = false
	p.erroring = false
	p.wrapErrs = false
	p.fmt.init(&p.buf)
	return p
}

// free saves used pp structs in ppFree; avoids an allocation per invocation.
func (p *pp) free() {
	// Proper usage of a sync.Pool requires each entry to have approximately
	// the same memory cost. To obtain this property when the stored type
	// contains a variably-sized buffer, we add a hard limit on the maximum buffer
	// to place back in the pool.
	//
	// See https://golang.org/issue/23199
	if cap(p.buf) > 64<<10 {
		return
	}

	p.buf = p.buf[:0]
	p.arg = nil
	p.value = reflect.Value{}
	p.wrappedErr = nil
	ppFree.Put(p)
}
```

### grpc transport pool

>[google.golang.org/grpc/internal/transport/transport.go](https://github.com/grpc/grpc-go/blob/master/internal/transport/transport.go)

```go
type bufferPool struct {
	pool sync.Pool
}

func newBufferPool() *bufferPool {
	return &bufferPool{
		pool: sync.Pool{
			New: func() interface{} {
				return new(bytes.Buffer)
			},
		},
	}
}

func (p *bufferPool) get() *bytes.Buffer {
	return p.pool.Get().(*bytes.Buffer)
}

func (p *bufferPool) put(b *bytes.Buffer) {
	p.pool.Put(b)
}
```

### gin Context pool

>[github.com/gin-gonic/gin/gin.go](https://github.com/gin-gonic/gin/blob/master/gin.go)

```go
// ServeHTTP conforms to the http.Handler interface.
func (engine *Engine) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	c := engine.pool.Get().(*Context)
	c.writermem.reset(w)
	c.Request = req
	c.reset()

	engine.handleHTTPRequest(c)

	engine.pool.Put(c)
}
```

### sarama compress pool

>[github.com/Shopify/sarama/compress.go](https://github.com/Shopify/sarama/blob/main/compress.go)

```go
var (
	lz4WriterPool = sync.Pool{
		New: func() interface{} {
			return lz4.NewWriter(nil)
		},
	}

	gzipWriterPool = sync.Pool{
		New: func() interface{} {
			return gzip.NewWriter(nil)
		},
	}
	gzipWriterPoolForCompressionLevel1 = sync.Pool{
		New: func() interface{} {
			gz, err := gzip.NewWriterLevel(nil, 1)
			if err != nil {
				panic(err)
			}
			return gz
		},
	}
	// ...
)

func compress(cc CompressionCodec, level int, data []byte) ([]byte, error) {
	switch cc {
	case CompressionNone:
		return data, nil
	case CompressionGZIP:
		var (
			err    error
			buf    bytes.Buffer
			writer *gzip.Writer
		)

		switch level {
		case CompressionLevelDefault:
			writer = gzipWriterPool.Get().(*gzip.Writer)
			defer gzipWriterPool.Put(writer)
			writer.Reset(&buf)
		case 1:
			writer = gzipWriterPoolForCompressionLevel1.Get().(*gzip.Writer)
			defer gzipWriterPoolForCompressionLevel1.Put(writer)
			writer.Reset(&buf)
		// ...
		default:
			writer, err = gzip.NewWriterLevel(&buf, level)
			if err != nil {
				return nil, err
			}
		}
		if _, err := writer.Write(data); err != nil {
			return nil, err
		}
		if err := writer.Close(); err != nil {
			return nil, err
		}
		return buf.Bytes(), nil
	case CompressionSnappy:
		return snappy.Encode(data), nil
	case CompressionLZ4:
		writer := lz4WriterPool.Get().(*lz4.Writer)
		defer lz4WriterPool.Put(writer)

		var buf bytes.Buffer
		writer.Reset(&buf)

		if _, err := writer.Write(data); err != nil {
			return nil, err
		}
		if err := writer.Close(); err != nil {
			return nil, err
		}
		return buf.Bytes(), nil
	case CompressionZSTD:
		return zstdCompress(ZstdEncoderParams{level}, nil, data)
	default:
		return nil, PacketEncodingError{fmt.Sprintf("unsupported compression codec (%d)", cc)}
	}
}
```

### zap json pool

>[go.uber.org/zap/zapcore/json_encoder.go](https://github.com/uber-go/zap/blob/master/zapcore/json_encoder.go)

```go
var _jsonPool = sync.Pool{New: func() interface{} {
	return &jsonEncoder{}
}}

func getJSONEncoder() *jsonEncoder {
	return _jsonPool.Get().(*jsonEncoder)
}

func putJSONEncoder(enc *jsonEncoder) {
	if enc.reflectBuf != nil {
		enc.reflectBuf.Free()
	}
	enc.EncoderConfig = nil
	enc.buf = nil
	enc.spaced = false
	enc.openNamespaces = 0
	enc.reflectBuf = nil
	enc.reflectEnc = nil
	_jsonPool.Put(enc)
}
```

### leakbuf base channel

>[shadowsocks/shadowsocks-go/shadowsocks/leakybuf](https://github.com/shadowsocks/shadowsocks-go/blob/master/shadowsocks/leakybuf.go)

```go
// Provides leaky buffer, based on the example in Effective Go.
package shadowsocks

type LeakyBuf struct {
	bufSize  int // size of each buffer
	freeList chan []byte
}

const leakyBufSize = 4108 // data.len(2) + hmacsha1(10) + data(4096)
const maxNBuf = 2048

var leakyBuf = NewLeakyBuf(maxNBuf, leakyBufSize)

// NewLeakyBuf creates a leaky buffer which can hold at most n buffer, each
// with bufSize bytes.
func NewLeakyBuf(n, bufSize int) *LeakyBuf {
	return &LeakyBuf{
		bufSize:  bufSize,
		freeList: make(chan []byte, n),
	}
}

// Get returns a buffer from the leaky buffer or create a new buffer.
func (lb *LeakyBuf) Get() (b []byte) {
	select {
	case b = <-lb.freeList:
	default:
		b = make([]byte, lb.bufSize)
	}
	return
}

// Put add the buffer into the free buffer pool for reuse. Panic if the buffer
// size is not the same with the leaky buffer's. This is intended to expose
// error usage of leaky buffer.
func (lb *LeakyBuf) Put(b []byte) {
	if len(b) != lb.bufSize {
		panic("invalid buffer size that's put into leaky buffer")
	}
	select {
	case lb.freeList <- b:
	default:
	}
	return
}
```

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

