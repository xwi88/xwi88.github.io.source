# Self-Hosting a ChatGPT Web UI


ChatGPT is an AI-powered interactive bot that chats with users and helps them — answering questions, translating between Chinese and English, and offering jokes, philosophy, maxims and more. It can also learn and remember your preferences and habits to serve you in a more personalized, professional way. This post covers the relevant principles, a few competitors, environment setup, and use cases.

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

## History

ChatGPT was first developed by the OpenAI team. The series of language-generation models it spawned (GPT-2, GPT-3, …) has drawn wide attention since 2018. ChatGPT's own history began in 2019, when AI researchers found the GPT model could generate natural conversation. Building on that, they ran a series of studies and adjustments that gradually shaped today's ChatGPT.

### GPT versions at a glance

{{< admonition info >}}
ChatGPT is based on GPT-3.5; when calling the API, pick a model no older than this.
{{< /admonition >}}

|Version|Open/Closed|Release|Usage limit|Params|
|:---|:---|:---|:---|:---|
|GPT-1|Open|2018-06||117M|
|GPT-2|Open|2019-02||1.5B|
|GPT-3|Closed|2020-06||175B|
|GPT-3.5|Closed|2022-11||200B|
|GPT-4|Closed|2023-03|Plus|1000B|

## Principle

ChatGPT is built on GPT (Generative Pre-training Transformer) — a deep-neural-network natural-language generation model. The GPT model, developed by OpenAI, is pre-trained on a large corpus so it can produce high-quality natural language. ChatGPT is trained and tuned on top of GPT; its core is recognizing the user's topic and intent through context, then generating a suitable answer.

### Model principle

1. Architecture: OpenAI ChatGPT is a deep-learning model based on the transformer architecture. Through multi-head self-attention and feed-forward networks it encodes and decodes sequential data, with strong representational and generalization power.
2. Pre-training: OpenAI ChatGPT is pre-trained on a large corpus, mainly in two steps: a masked language model and a next-sentence prediction model.
   1. Masked Language Model (MLM): some words in the input sequence are randomly masked and the model predicts them — like cloze — which helps it learn grammar, semantics and vocabulary from context.
   2. Next Sentence Prediction (NSP): given two sentences, the model predicts whether the second follows the first, which helps it understand context and produce coherent text.
3. Fine-tuning: after pre-training, OpenAI ChatGPT is fine-tuned for specific tasks (e.g. dialogue generation) to further improve performance.
4. Sequence-to-sequence generation: in use, it takes the user's question as an input sequence, processes it, and returns an output sequence that is fine-tuned into natural language. Through supervised learning it keeps optimizing its parameters and structure to improve answer quality and relevance.

### How it works

1. Input encoding: when the user sends a message, ChatGPT's transformer encoder encodes it into a semantic vector.
2. Decoder initialization: it then initializes the transformer decoder to maximize the probability of generating the next reply.
3. Greedy search: during decoding it generates output tokens step by step with greedy search — at each step picking the highest-probability next word. Simple and fast, but can produce incoherent output.
4. Attention: the decoder attends to the encoded input to model input–output dependencies, yielding more relevant replies.
5. Repetition check: to avoid meaningless repetition, it checks whether the reply is too close to the input and regenerates if so.
6. Reply output: once a satisfying reply is produced, it's returned to the user.
7. Continual learning: as a pre-trained model, it keeps learning across interactions, refining its expression and generation.

So in short, ChatGPT relies on the transformer encoder–decoder framework, generates sequences with attention and greedy search, and keeps learning from large dialogue datasets — which makes it one of the most effective open-domain chatbot systems today.

## Competitors

>Analysis below reflects the state at the time of writing; forgive any inaccuracy.

|Competitor|Recommend|Proxy|Fee|Access|
|:---|:---|:---|:---|:---|
|ChatGPT|★★★★★|Y|Pay|Official or API|
|Claude|★★★★★|N|Free|Slack APP: Claude|
|Tongyi Qianwen|★★★★|N|Free|Official or API|
|Wenxin Yige|★★★|N|Free|Official or API|

{{< admonition note >}}
"Free" above refers only to the official web access at this time; always refer to the official pricing.
{{< /admonition >}}

### ChatGPT API billing

- OpenAI pricing: [pricing#language-models](https://openai.com/pricing#language-models)
- OpenAI charges by token; 1000 tokens ≈ 750 English words or 500 Chinese characters.
- Input (Prompt) and output (Completion) are billed separately.

|Model|Prompt|Completion|Max tokens per interaction|
|:---|:---|:---|:---|
|gpt-3.5|$0.002 / 1K tokens|$0.002 / 1K tokens|4096|
|gpt-4|$0.03 / 1K tokens|$0.06 / 1K tokens|8192|
|gpt-4-32K|$0.06 / 1K tokens|$0.12 / 1K tokens|32768|

{{< admonition warning >}}

- Mind the security of your API key
- Mind the context length you send each time — too much context burns tokens faster
- Mind the model version — costs differ across versions

{{< /admonition >}}

## Access environment setup

{{< admonition warning >}}
We use ChatGPT as the example for setting up access for personal research only. For commercial use, stay lawful and compliant.
{{< /admonition >}}

### Options

|Access Way|Proxy|Risk|
|:---|:---|:---|
|Official Web|local overseas proxy|ban|
|API|local overseas proxy|ban|
|API|server overseas proxy||
|API|overseas cloud function||

{{< admonition note >}}
To call it through your own domain, reverse-proxy via Nginx or similar on your server.
{{< /admonition >}}

### Recommended approach

{{< admonition info >}}
Create and test a cloud function in a suitable region. Currently usable: Tencent Cloud, Alibaba Cloud; explore other providers yourself.
{{< /admonition >}}

#### Creation steps

>More at: [openai-scf-proxy](https://github.com/Ice-Hazymoon/openai-scf-proxy) or [openai-scf-goproxy](https://github.com/riba2534/openai-scf-goproxy)

1. Log in to your cloud provider and find the *cloud function console*
2. Create & configure the function
    - New
      - Tencent Cloud: create from scratch
      - Alibaba Cloud: custom runtime, handling HTTP requests
    - Choose a web function
    - Pick a region that meets your needs (one that can reach the service you call)
    - Runtime:
      - NodeJS
        - Env: Nodejs 16.13 (or newer)
        - zip: [download the zip for your version](https://github.com/Ice-Hazymoon/openai-scf-proxy/releases)
      - GO
        - Env: *Go1*
        - zip: [download the zip for your version](https://github.com/riba2534/openai-scf-goproxy/releases)
    - Upload the zip you downloaded
    - Set the timezone as needed
    - Configure logging as needed
    - Trigger:
      - Method: Any
      - Auth: No
    - Advanced:
      - Memory: 64M+
      - Execution timeout: 900s
      - Concurrency: 2 (tune to a sane value to avoid frequent calls getting you banned or rate-limited)
3. Once created, find the access path / public URL
    - On Tencent Cloud, strip the trailing `/release` from the generated URL

## API testing

### Balance

```bash
# Check balance — browser request only
curl ${YOUR_PROXY_URL}/v1/dashboard/billing/credit_grants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPENAI_API_KEY}"
```

{{< admonition example >}}

```bash
curl https://api.openai-proxy.com/v1/dashboard/billing/credit_grants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxx"
```

{{< /admonition >}}

### Subscription

```bash
# Subscription query
curl ${YOUR_PROXY_URL}/v1/dashboard/billing/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPENAI_API_KEY}"
```

{{< admonition example >}}

```bash
# Subscription query
curl https://api.openai-proxy.com/v1/dashboard/billing/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxx"
```

```json
{
  "object": "billing_subscription",
  "has_payment_method": false,
  "canceled": false,
  "canceled_at": null,
  "delinquent": null,
  "access_until": 1688169600,
  "soft_limit": 66667,
  "hard_limit": 83334,
  "system_hard_limit": 83334,
  "soft_limit_usd": 4.00002,
  "hard_limit_usd": 5.00004,
  "system_hard_limit_usd": 5.00004,
  "plan": {
    "title": "Explore",
    "id": "free"
  },
  "account_name": "xyz",
  "po_number": null,
  "billing_email": null,
  "tax_ids": null,
  "billing_address": null,
  "business_address": null
}
```

{{< /admonition >}}

### Chat

```bash
# Chat test
curl ${YOUR_PROXY_URL}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPENAI_API_KEY}" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Benefits and usage of Astragalus"}]
  }'
```

{{< admonition example >}}

```bash
curl https://api.openai-proxy.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxx" \
  -d '{
    "model": "gpt-3.5-turbo",
    "max_tokens": 2000,
    "temperature": 1.0,
    "messages": [{"role": "user", "content": "Benefits and usage of Astragalus"}]
  }'
```

```json
{
  "id": "chatcmpl-75sXKeiaLI75HtMXgXsulhlQFeXpA",
  "object": "chat.completion",
  "created": 1681635634,
  "model": "gpt-3.5-turbo-0301",
  "usage": {
    "prompt_tokens": 17,
    "completion_tokens": 632,
    "total_tokens": 649
  },
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Astragalus (Huang Qi) is a well-known herb in traditional Chinese medicine, widely used to support health. Its main benefits and uses include:\n\n1. Immune support: Astragalus helps strengthen the body's resistance and immunity, and is useful for people with weak constitution, frequent colds, or chronic fatigue.\n\n2. Antioxidant: rich in antioxidants, it helps neutralize free radicals and protects cells from oxidative damage.\n\n3. Anti-inflammatory: it modulates the immune system and helps restrain inflammation, benefiting chronic inflammatory conditions.\n\n4. Spleen & qi tonic: it tonifies spleen qi, supports digestion, and helps with poor appetite and digestive discomfort.\n\n5. Anti-fatigue: it supports energy metabolism and helps relieve tiredness, weakness and poor sleep.\n\nCommon ways to use it:\n1. Tea: simmer dried slices and drink the water — for daily conditioning and cold prevention.\n2. In soups or congee: pair with other herbs to flavor food while keeping the benefit.\n3. Syrup/paste: decoct with other herbs into a paste for respiratory support.\n4. External use: pound and mix into an oil-based paste for skin issues."
      },
      "finish_reason": "stop",
      "index": 0
    }
  ]
}
```

{{< /admonition >}}

## Building the ChatGPT Web UI

Using the open-source ChatGPT Web project as a container, I've set up a domain-accessible **ChatGPT UI**. Chain: `(Domain -> DNS -> Nginx ->) Cloud Function Proxy -> OpenAI`

### Container config

```yaml
version: '3.8'
services:
  chatgpt-next-web:
    build: .
    container_name: chatgpt-next-web-latest
    image: v8fg/chatgpt-next-web:latest
    environment:
      TZ: Asia/Shanghai
      OPENAI_API_KEY: # Your openai api key.
      CODE: # Access passsword, separated by comma.
      BASE_URL: # proxy api URL, default: api.openai.com, without scheme
      # PROTOCOL: https # http | https
    restart: always
    ports:
      - 3690:3000
```

### Environment variables

- OPENAI_API_KEY: Your openai api key
  - If not set server-side, configure it in the web UI per session
- CODE: access code
  - If `OPENAI_API_KEY` is set server-side AND `CODE` is set, the access code is required
  - If `OPENAI_API_KEY` is set in the web UI, the code is not required
- BASE_URL: Proxy URL, domain only
  - default: `api.openai.com`
  - example: `api.openai-proxy.com`

## More Web / App projects

|Name|Type|Link|Language|Stars|
|:---|:---|:---|:---|:---|
|ChatGPT-Next-Web|Web UI|[Code](https://github.com/Yidadaa/ChatGPT-Next-Web)|TypeScript|☆☆☆☆☆|
|chatgpt-web|Web UI|[Code](https://github.com/Chanzhaoyu/chatgpt-web)|Vue3|☆☆☆☆☆|
|chatgpt-demo|Web UI|[Code](https://github.com/ddiu8081/chatgpt-demo)|TypeScript|☆☆☆☆|
|chatbot-ui|Web UI|[Code](https://github.com/mckaywrigley/chatbot-ui)|TypeScript|☆☆☆☆|
|whatsapp-chatgpt|Web UI|[Code](https://github.com/askrella/whatsapp-chatgpt)|TypeScript|☆☆☆|
|lencx/ChatGPT|Desktop App|[Code](https://github.com/lencx/ChatGPT)|TypeScript|☆☆☆☆☆☆|
|chat-ai-desktop|Desktop App|[Code](https://github.com/sonnylazuardi/chat-ai-desktop)|TypeScript|☆☆☆|

## Nginx config notes

{{< admonition note>}}

>If you use Nginx as a reverse proxy, add the following to the config

```bash
# No caching, support streaming output
proxy_cache off;  # disable cache
proxy_buffering off;  # disable proxy buffering
chunked_transfer_encoding on;  # enable chunked transfer encoding
tcp_nopush on;  # enable TCP NOPUSH, disable Nagle
tcp_nodelay on;  # enable TCP NODELAY, disable delayed ACK
keepalive_timeout 300;  # keep-alive timeout
```

{{< /admonition >}}

