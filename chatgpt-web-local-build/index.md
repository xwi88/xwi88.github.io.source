# ChatGPT Web 本地化使用配置


ChatGPT 是一个基于人工智能的社交互动机器人，能够与用户进行聊天交互和提供帮助，包括但不限于回答各种问题、提供中英文翻译、提供丰富的笑话、哲理、格言等内容。它还能学习和记忆用户的喜好和使用习惯，从而更好地为用户提供个性化、专业化的服务。本文主要介绍相关原理、部分竞品、环境配置及使用场景。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 历史

ChatGPT最早由OpenAI团队开发，它在2018年由此带来的一系列语言生成模型（如GPT-2、GPT-3等）都备受关注。ChatGPT的历史始于2019年，当时AI开发人员在研究中发现，GPT模型可以用于生成自然对话。基于这一发现，AI开发人员进行了一系列的研究和调整，逐渐形成了今天的ChatGPT。

### GPT 各版本简介

{{< admonition info >}}
ChatGPT 基于 GPT-3.5，调用时可选不低于此版本的 model
{{< /admonition >}}

|版本|开闭源|发布时间|使用限制|参数|
|:---|:---|:---|:---|:---|
|GPT-1|开源|2018-06||117M|
|GPT-2|开源|2019-02||1.5B|
|GPT-3|闭源|2020-06||175B|
|GPT-3.5|闭源|2022-11||200B|
|GPT-4|闭源|2023-03|Plus|1000B|

## 原理

ChatGPT基于GPT（Generative Pre-training Transformer）技术，是一种基于深层神经网络的自然语言生成模型。GPT模型是由OpenAI团队开发的，它基于深度学习技术，通过预先训练一个大规模的语料库，从而使得该模型可以为用户提供高质量的自然语言生成服务。ChatGPT是基于GPT模型进行训练和调整的，其核心是通过上下文理解识别用户的话题和意图，从而生成合适的答案和回答。

### 模型原理

1. 架构：OpenAI ChatGPT是基于transformer架构的深度学习模型。该架构通过多头自注意力机制和前向神经网络对序列数据进行编码和解码，具有高度的表示能力和泛化能力。
2. 预训练：OpenAI ChatGPT使用大规模的语料库进行预训练，训练过程主要包括两个步骤: 遮盖语言模型和下一句预测模型。
   1. 遮盖语言模型 (Masked Language Model, MLM)：在这个阶段，OpenAI ChatGPT通过将输入序列中的某些词随机遮盖并让模型预测这些遮盖部分的内容。这个过程类似于完形填空，它能够帮助模型获取上下文语境中的语法、语义和词汇知识。
   2. 下一句预测模型 (Next Sentence Prediction, NSP)：在这个阶段，OpenAI ChatGPT通过输入两个句子，让模型预测第二个句子是否接在第一个句子的后面。这个过程也能够帮助模型理解上下文信息，从而生成连贯的文本。
3. 微调：在预训练完成后，OpenAI ChatGPT针对特定的任务（如对话生成）进行微调，进一步提升模型性能。
4. 序列到序列生成：在ChatGPT的使用中，它将用户输入的问题作为输入序列，经过处理后得到输出序列，输出序列经过细致的调整后以自然语言的形式呈现给用户。ChatGPT通过监督学习的方式，不断优化模型的参数和结构，提高答案的质量和相关性。

### 工作原理

1. 输入编码：当用户输入一条聊天句子并发送时，ChatGPT 会使用 Transformer 编码器对该输入句子进行编码,得到其语义向量表示。
2. 解码器初始化：然后 ChatGPT 会初始化 Transformer 解码器，以最大化生成下一条回复句子的概率。
3. 贪心搜索：在解码生成回复句子的过程中，ChatGPT 使用贪心搜索算法逐步生成输出词tokens。具体而言，在每一时间步，ChatGPT 都会选择概率最大的下一个词来生成，这种搜索算法简单高效但容易产生不连贯输出。
4. 注意力机制：Transformer 解码器可以通过注意力机制来关注输入句子的编码，以建模输入和输出之间的依赖关系，这可以生成更加相关的回复。
5. 重复判定：为了避免生成重复无意义的回复，ChatGPT 会在解码的过程中判断当前生成的回复是否与输入句子过于接近，如果是则重新生成新的回复。
6. 回复输出：当 ChatGPT 根据以上过程生成了一条满意的回复句子，就会将该回复句子返回给用户。
7. 重复学习：ChatGPT 是一个预训练语言模型，在和用户的每轮交互中，它都会继续学习，并不断优化自身的语言表达和生成能力。

所以总的来说，ChatGPT 的工作原理主要依靠 Transformer 编码器-解码器框架，利用注意力机制和贪心搜索算法进行序列生成，并借助大规模聊天数据集不断学习和优化，以实现人机开放领域对话。这也使其成为目前效果最为显著的聊天机器人系统之一。

## 竞品

>相关内容及分析，基于文章发布时间，如有不准确的地方，见谅。

|竞品|推荐度|Proxy|Fee|访问放式|
|:---|:---|:---|:---|:---|
|ChatGPT|★★★★★|Y|Pay|Official or API|
|Claude|★★★★★|N|Free|Slack APP: Claude|
|通义千问|★★★★|N|Free|Official or API|
|文心一格|★★★|N|Free|Official or API|

{{< admonition note >}}
以上标注免费的产品仅限于当前官方页面访问，具体计费请以官方为准。
{{< /admonition >}}

### ChatGPT API 计费

- OpenAI网站计费说明：[pricing#language-models](https://openai.com/pricing#language-models)
- OpenAI根据token数收费，1000个token通常可代表750个英文单词，或500个汉字。
- 输入（Prompt）和输出（Completion）分别统计费用。

|模型|Prompt|Completion|每次交互最大token数|
|:---|:---|:---|:---|
|gpt-3.5|$0.002 / 1千tokens|$0.002 / 1千tokens|4096|
|gpt-4|$0.03 / 1千tokens|$0.06 / 1千tokens|8192|
|gpt-4-32K|$0.06 / 1千tokens|$0.12 / 1千tokens|32768|

{{< admonition warning >}}

- 注意 api key 安全性
- 注意每次交互携带的上下文长度，携带过多的上下文会加速token消耗
- 注意使用的模型版本，不同版本成本差异

{{< /admonition >}}

## 访问环境配置

{{< admonition warning >}}
我们主要以 ChatGPT 为例来进行科学访问的配置，仅限于个人研究使用，商业使用请务必合法合规。
{{< /admonition >}}

### 可选方式

|Access Way|Proxy|Risk|
|:---|:---|:---|
|Official Web|local overseas proxy|ban|
|API|local overseas proxy|ban|
|API|server overseas proxy||
|API|overseas cloud function||

{{< admonition note >}}
如果你需要通过自己域名进行调用，需要通过Nginx或其他工具在你的服务端进行反代处理。
{{< /admonition >}}

### 推荐方式

{{< admonition info >}}
选择合适地区通过云函数方式创建并测试，当前可用: 腾讯云，阿里云，其他云服务商请自行探索。
{{< /admonition >}}

#### 创建步骤如下

>更多请参考: [openai-scf-proxy](https://github.com/Ice-Hazymoon/openai-scf-proxy) 或 [openai-scf-goproxy](https://github.com/riba2534/openai-scf-goproxy)

1. 登录你的云服务商，并找到 *云函数控制台*
2. 云函数创建及配置
    - 新建
      - 腾讯云: 从头开始新建
      - 阿里云: 使用自定义运行时创建，处理HTTP请求
    - 选择 web 函数
    - 选择符合你要求的地域(可直接访问你调用服务的地域)
    - 运行环境选择(根据你的云函数需求选择)
      - NodeJS
        - 环境: Nodejs 16.13（或者更高的版本）
        - zip: [请选择你需要版本的zip进行下载](https://github.com/Ice-Hazymoon/openai-scf-proxy/releases)
      - GO
        - 环境: *Go1*
        - zip: [请选择你需要版本的zip进行下载](https://github.com/riba2534/openai-scf-goproxy/releases)
    - 将上一步下载的zip包上传
    - 时区配置请根据需要设置
    - 日志配置请根据需要设置
    - 触发器配置
      - 请求方法： Any
      - 鉴权或认证: 否
    - 高级配置
      - 内存: 64M+
      - 执行超时时间：900s
      - 并发: 2 (请根据实际情况调，设置合理值，避免频繁调用被封禁或触发限流)
3. 创建完成后找到访问路径或公网地址
    - 腾讯云需要去掉生成url中附带的 `/release`

## API 测试

### 余额

```bash
# 查余额，只能通过浏览器请求
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

### 订阅

```bash
# 订阅查询
curl ${YOUR_PROXY_URL}/v1/dashboard/billing/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPENAI_API_KEY}"
```

{{< admonition example >}}

```bash
# 订阅查询
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

### 交互

```bash
# 交互测试
curl ${YOUR_PROXY_URL}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPENAI_API_KEY}" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "黄芪功效及用法"}]
  }'
```

{{< admonition example >}}

```bash
curl https://api.openai-proxy.com/v1/chat/completions/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxx" \
  -d '{
    "model": "gpt-3.5-turbo",
    "max_tokens": 2000,
    "temperature": 1.0,
    "messages": [{"role": "user", "content": "黄芪功效及用法"}]
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
        "content": "黄芪，又名黄耆，是一种中药材，被广泛用于中医治疗多种疾病。其主要功效和用法如下：\n\n1. 增强人体免疫力：黄芪可以提高机体抗病能力，增强人体免疫力，对于体质虚弱、易感冒、慢性疲劳等人群有很好的调理作用。\n\n2. 抗氧化：黄芪中富含多种抗氧化物质，可以抑制自由基的生成和氧化反应，保护细胞和组织免受氧化损伤。\n\n3. 具有抗炎作用：黄芪能够调节免疫系统，抑制炎症反应，对于慢性炎症引起的各种疾病具有较好的治疗作用。\n\n4. 健脾益气：黄芪可补益脾气、益气健脾、改善消化不良、食欲不振等症状。\n\n5. 抗疲劳：黄芪可以提高人体能量代谢，改善疲劳状态，对于劳累、乏力、失眠等症状具有缓解作用。\n\n黄芪的用法有多种，常见的方式有：\n1. 泡水饮用：将干黄芪煮沸后，加入水中泡服，常用于调理身体、预防感冒等。\n2. 煮汤煮饭：黄芪可以与其他中草药搭配煮汤或煮饭，增强味道的同时也能保持药效。\n3. 熬糖膏：将黄芪与其他中草药熬制成糖膏，用于治疗呼吸系统疾病等。\n4. 外敷：将黄芪捣碎后加入油中制成膏剂，外敷治疗皮肤病等。"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ]
}
```

{{< /admonition >}}

## ChatGPT Web 搭建

借助开源的ChatGPT Web项目，以容器方式，已成功搭建可通过域名访问的 **ChatGPT UI**，链路: `(Domain -> DNS -> Nginx ->) Cloud Function Proxy -> OpenAI`

### 容器相关配置

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

### 环境变量说明

- OPENAI_API_KEY: Your openai api key
  - 若服务端不配置，则需要在web page进行单独配置
- CODE: 访问码
  - 如果服务端配置了 `OPENAI_API_KEY`，且进行了CODE设置，则必须填写
  - 如果在web page配置了`OPENAI_API_KEY`，则不需要填写
- BASE_URL: Proxy URL，仅包含域名部分
  - default: `api.openai.com`
  - example: `api.openai-proxy.com`

## 更多 Web Or APP 项目

|Name|Type|Link|Language|Stars|
|:---|:---|:---|:---|:---|
|ChatGPT-Next-Web|Web UI|[Code](https://github.com/Yidadaa/ChatGPT-Next-Web)|TypeScript|☆☆☆☆☆|
|chatgpt-web|Web UI|[Code](https://github.com/Chanzhaoyu/chatgpt-web)|Vue3|☆☆☆☆☆|
|chatgpt-demo|Web UI|[Code](https://github.com/ddiu8081/chatgpt-demo)|TypeScript|☆☆☆☆|
|chatbot-ui|Web UI|[Code](https://github.com/mckaywrigley/chatbot-ui)|TypeScript|☆☆☆☆|
|whatsapp-chatgpt|Web UI|[Code](https://github.com/askrella/whatsapp-chatgpt)|TypeScript|☆☆☆|
|lencx/ChatGPT|Desktop App|[Code](https://github.com/lencx/ChatGPT)|TypeScript|☆☆☆☆☆☆|
|chat-ai-desktop|Desktop App|[Code](https://github.com/sonnylazuardi/chat-ai-desktop)|TypeScript|☆☆☆|

## Nginx 配置注意事项

{{< admonition note>}}

>如果你使用 Nginx 作为reverse proxy，需要在配置文件中增加下列代码

```bash
# 不缓存，支持流式输出
proxy_cache off;  # 关闭缓存
proxy_buffering off;  # 关闭代理缓冲
chunked_transfer_encoding on;  # 开启分块传输编码
tcp_nopush on;  # 开启TCP NOPUSH选项，禁止Nagle算法
tcp_nodelay on;  # 开启TCP NODELAY选项，禁止延迟ACK算法
keepalive_timeout 300;  # 设定keep-alive超时时间为65秒
```

{{< /admonition >}}

