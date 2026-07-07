# Go Object Pool Usage & Optimization — Theory


Go object pools reuse `temporary objects`, which `reduces the waste` from frequently creating them — i.e. `lower GC overhead` and memory usage — improving performance and lowering serving cost to some extent. Based on `go1.18.2`, this post covers use cases, **the processing flow & caveats**, open-source examples, a personal example (incl. pooling under `gRPC`), and best practices.

<!--more-->

## When to use

**When you frequently create the `same kind` of object and creation is expensive**

- The larger each object's memory footprint, the more obvious the benefit
- The bigger the memory footprint, the more obvious the benefit
- The higher the concurrency, the more obvious the benefit

## **Processing flow & caveats**

>After a temporary object is returned to the pool, it should ideally be: `stateless`, `reference-free`

- Normal flow: `Get` *`->Reset`* ->`deal`->`Put`, **no reference to the returned object after `Put`**
  - Fits most scenarios that need pooling
- **Special flow**: `Get` *`->Reset`* ->`deal`->`Put`->`deal with ref`, **a reference to the returned object is kept after `Put`**
  - Special scenarios, e.g. `GRPC service call`
  - **Avoid unless truly necessary**
  - *If you must, add fault-tolerance to minimize side effects*

{{< admonition warning >}}

- **Follow the normal flow whenever possible**
- *Always ensure `Get` & `Put` appear in pairs*
- **Holding a reference to an object after `Put` (return) can corrupt data if handled improperly**
{{</ >}}

## Object-pool data structures

- `sync.pool`: fits most scenarios; easy to use and efficient
  - Objects in the pool may be removed (released or taken for reuse) without any notice. If the pool holds the only reference to an object, that object is very likely to be reclaimed.
- `channel`: queue-like; memory footprint stays stable and it does not release proactively
- `ring buffer`: queue-like; memory footprint stays stable and it does not release proactively; lock-free `read & write`

|Structure|Min capacity|Max capacity|Pros|Cons|
|:---|:---|:---|:---|:---|
|[**sync.pool**](https://pkg.go.dev/sync#Pool)|0|∞|Simple, easy to use|Reclamation is uncontrollable|
|**channel**|0|**cap**|**Can hold references**|QPS bounded by cap; memory cost|
|**ring buffer**|0|**cap**|**Can hold references**, *lock-free*|QPS bounded by cap; memory cost|

{{< admonition tip >}}
*Reference-supporting approach*: add some redundant objects — i.e. initialize `min capacity >= 1*QPS ~ 2*QPS` — to reduce the data-corruption risk that object references can cause.

- **Trade a little memory for the high payoff of pooling**
- **Always estimate your memory footprint**
- **Watch the max lifetime of each object; be careful with long operations** `e.g. > 1s with high QPS`
- `Capacity at init: min capacity = max capacity >= 1*QPS`; allocate once if possible
{{</  >}}

## Source examples

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

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

