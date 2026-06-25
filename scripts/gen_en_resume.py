#!/usr/bin/env python3
# Generate an English resume from the Chinese source by translating the text
# content (CSS/structure preserved verbatim). Outputs static/en/resume/index.html.
import re, sys, os

SRC = "/Users/wangxin/projects/personal/advertising/.openclaw/tmp/resume.html"
DST = "static/en/resume/index.html"

html = open(SRC, encoding="utf-8").read()

# (chinese, english) — applied as exact string replacements
R = [
    ('<html lang="zh-CN">', '<html lang="en">'),
    ('<title>王鑫 - Go高级研发工程师</title>',
     '<title>Wang Xin - Senior Go Engineer (AdTech / AI)</title>'),
    # theme button titles
    ('商务 (Executive)', 'Executive'), ('黑曜石 (Obsidian)', 'Obsidian'),
    ('极光 (Arctic)', 'Arctic'), ('翡翠 (Emerald)', 'Emerald'),
    ('石板 (Slate)', 'Slate'), ('珊瑚 (Coral)', 'Coral'),
    ('海洋 (Ocean)', 'Ocean'), ('极简 (Minimal)', 'Minimal'),
    # header
    ('<div class="name">王 鑫</div>', '<div class="name">WANG XIN</div>'),
    ('Go 高级研发工程师 · 广告引擎 · AI 工程实践',
     'Senior Go Engineer · AdTech · AI Engineering'),
    # metric labels
    ('年研发经验', 'Years R&amp;D'), ('年 Go', 'Years Go'),
    ('QPS 承载', 'QPS Handled'), ('P99 延迟', 'P99 Latency'),
    ('模型推理', 'Model Inference'), ('资源优化', 'Cost Saved'),
    # section heads
    ('核心优势', 'Core Strengths'), ('技术栈', 'Tech Stack'),
    ('工作经历', 'Work Experience'), ('教育背景', 'Education'),
    # hl tags
    ('>广告引擎<', '>AdTech<'),
    ('>性能与算法工程<', '>Performance &amp; Algorithms<'),
    ('>跨领域工程经验<', '>Cross-domain Engineering<'),
    # hl bodies
    ('>5</span> 年广告方向，InMobi 主导投放引擎（召回→排序→竞价→下发），负责频控、预算、回调归因对接、核心组件编写与性能优化；诏兰负责 <abbr data-tip="Demand-Side Platform">DSP</abbr>/<abbr data-tip="Data Management Platform">DMP</abbr>；熟悉 <abbr data-tip="Real-Time Bidding">RTB</abbr> 竞价、<abbr data-tip="optimized Cost Per Action">oCPX</abbr> 出价全链路<',
     '>5</span> yrs in AdTech. At InMobi led the delivery engine (retrieval &rarr; ranking &rarr; bidding &rarr; delivery); owned frequency capping, budgeting, callback/attribution integration, core components and performance tuning. At Zhaolan built DSP/DMP. Deep expertise across the full RTB bidding and oCPX bid pipeline.<'),
    ('广告引擎承载 <strong>100K+ QPS</strong>，P99 优化至 <strong>60ms</strong>，计算资源降低 <strong>50-60%+</strong>，存储集群降低 <strong>40%+</strong>；TensorFlow 部署 <abbr data-tip="Factorization Machines / Field-aware FM">FM/FFM</abbr> 模型，单次推理 <strong>&lt;2ms</strong>；配套 A/B 实验与效果监控',
     'Ad engine handling <strong>100K+ QPS</strong>; optimized P99 to <strong>60ms</strong>, cut compute <strong>50&ndash;60%+</strong> and storage <strong>40%+</strong>. Deployed <abbr data-tip="Factorization Machines / Field-aware FM">FM/FFM</abbr> via TensorFlow at <strong>&lt;2ms</strong> per inference; built A/B experimentation and monitoring'),
    ('2026 年初以 Claude Code + 多模型协作构建 Agentic Engineering 工作流，覆盖编码→测试→Review→PR 全链路，支持 Jira 任务自动创建与任务驱动编码分析，每步由人工确认执行。从 Vibe Coding（自然语言驱动编码）到 Agentic Engineering（质量保障下的效率革命），AI 加速实现，架构决策、业务判断、质量把关始终由人主导——善假于物，不为之所驭',
     'Since early 2026, built Agentic Engineering workflows with Claude Code + multi-model collaboration covering coding &rarr; testing &rarr; review &rarr; PR, with auto Jira task creation and task-driven code analysis (each step human-confirmed). From Vibe Coding to Agentic Engineering &mdash; AI accelerates delivery while architecture, business judgment and quality stay human-led. Master the tools, don&rsquo;t be mastered by them'),
    ('广告引擎、区块链底层（uni-chain/合约/<abbr data-tip="Decentralized Exchange">DEX</abbr>）、金融合规（<abbr data-tip="Know Your Customer / Anti-Money Laundering">KYC/AML</abbr>）；Go 微服务 + Docker + Consul + Prometheus/Grafana 体系搭建',
     'AdTech engines, blockchain core (uni-chain / contracts / <abbr data-tip="Decentralized Exchange">DEX</abbr>), and financial compliance (<abbr data-tip="Know Your Customer / Anti-Money Laundering">KYC/AML</abbr>). Built Go microservice stacks with Docker + Consul + Prometheus/Grafana'),
    # tech categories
    ('>编程语言<', '>Languages<'), ('>服务架构<', '>Architecture<'),
    ('>数据存储<', '>Databases<'), ('>消息 & 中间件<', '>Messaging<'),
    ('>AI & 工具<', '>AI &amp; Tools<'), ('>广告技术<', '>AdTech<'),
    ('>基础设施<', '>Infrastructure<'), ('>其他<', '>Other<'),
    ('OpenRTB · RTB · CTR/CVR · oCPX · 频控 · 预算 · 归因',
     'OpenRTB · RTB · CTR/CVR · oCPX · Freq Cap · Budget · Attribution'),
    # work experience
    ('某金融合规科技公司', 'A FinTech Compliance Company'),
    ('Java 后端开发工程师 · 深圳', 'Java Backend Engineer · Shenzhen'),
    ('2025.12 – 至今', '2025.12 – Present'),
    ('为全球客户提供 <abbr data-tip="Know Your Customer / Anti-Money Laundering">KYC/AML</abbr> 数字化合规解决方案，产品覆盖客户尽职调查全流程。',
     'Provides global clients with <abbr data-tip="Know Your Customer / Anti-Money Laundering">KYC/AML</abbr> digital compliance covering the full customer due-diligence lifecycle.'),
    ('负责 OB-BE 后端核心开发（身份验证、活体检测、企业合规申请 <abbr data-tip="Customer Due Diligence / Entity Due Diligence">COD/EOD</abbr>）',
     'Core backend development for OB-BE (identity verification, liveness detection, corporate compliance applications &mdash; <abbr data-tip="Customer Due Diligence / Entity Due Diligence">COD/EOD</abbr>)'),
    ('对接 Regula OCR、人脸识别 SDK、Kyckr、Dow Jones、CRIF、ScoreChain 等十余个第三方服务，排查修复集成缺陷 50+',
     'Integrated 10+ third-party services (Regula OCR, face-recognition SDK, Kyckr, Dow Jones, CRIF, ScoreChain); triaged and fixed 50+ integration defects'),
    ('参与合规引擎（风险评分、策略配置、自动化审查）；构建 Agentic Engineering 工作流提升跨技术栈交付效率',
     'Contributed to the compliance engine (risk scoring, policy configuration, automated review); built Agentic Engineering workflows to boost cross-stack delivery'),
    ('独立开发者', 'Independent Developer'),
    ('全栈开发', 'Full-stack Development'),
    ('承接技术项目开发与交付，探索 Agentic Engineering 在实际项目中的应用。',
     'Delivered technical projects end-to-end; explored Agentic Engineering applied to real projects.'),
    ('Claude Code + 多模型协作独立完成项目交付；建立 Jira 自动创建→编码分析→人工确认的工作闭环',
     'Delivered projects independently via Claude Code + multi-model collaboration; built a closed loop: auto Jira creation &rarr; code analysis &rarr; human confirmation'),
    ('InMobi（邑盟）', 'InMobi'),
    ('Golang 高级研发工程师 · Demand Team · 北京', 'Senior Golang Engineer · Demand Team · Beijing'),
    ('全球领先移动广告技术平台，业务覆盖亚太、北美、欧洲等多个区域。',
     'A leading global mobile AdTech platform operating across APAC, North America, Europe and beyond.'),
    ('<strong>广告投放引擎：</strong>主导核心模块（请求处理、召回、排序、竞价、下发、频控、预算、回调），线上承载 <strong>100K+ QPS</strong>',
     '<strong>Ad Delivery Engine:</strong> led core modules (request handling, retrieval, ranking, bidding, delivery, frequency capping, budgeting, callbacks); production load <strong>100K+ QPS</strong>'),
    ('<strong>性能优化：</strong>P99 从 80-100ms 降至 <strong>10-60ms</strong>（连接池、内存池、锁优化、GC 调优），计算资源降低 <strong>50-60%+</strong>，存储降低 <strong>40%+</strong>',
     '<strong>Performance:</strong> cut P99 from 80&ndash;100ms to <strong>10&ndash;60ms</strong> (connection/memory pools, lock optimization, GC tuning); reduced compute <strong>50&ndash;60%+</strong> and storage <strong>40%+</strong>'),
    ('<strong>模型推理：</strong>TensorFlow 部署 <abbr data-tip="Factorization Machines / Field-aware FM">FM/FFM</abbr>（CTR/CVR 预估），在线推理+批量预估，单次 <strong>&lt;2ms</strong>；搭建 A/B 实验框架',
     '<strong>Model Inference:</strong> deployed <abbr data-tip="Factorization Machines / Field-aware FM">FM/FFM</abbr> (CTR/CVR prediction) via TensorFlow for online inference + batch estimation at <strong>&lt;2ms</strong> each; built the A/B experimentation framework'),
    ('<strong>基础设施：</strong>Go 微服务体系（Consul + Docker + ELK + Prometheus/Grafana），组织 Code Review 与技术分享',
     '<strong>Infrastructure:</strong> Go microservice stack (Consul + Docker + ELK + Prometheus/Grafana); ran code reviews and tech-sharing sessions'),
    ('好车酷酷二手车', 'Haoche Kuku (Used-Car Platform)'),
    ('高级研发工程师 · 算法部-估价组 · 北京', 'Senior Engineer · Algorithms - Valuation · Beijing'),
    ('多策略估价服务架构，支持市场价、残值法、历史成交等多维度定价模型；从零搭建仿真重放系统（含 Web UI），为算法模型提供效果回测评估能力',
     'Multi-strategy valuation service supporting market-price, residual-value and historical-transaction pricing models; built a simulation/replay system (with web UI) from scratch for model backtesting'),
    ('Go Docker 两阶段构建、Consul 服务发现、ELK 日志、Kafka + Druid 数据管道',
     'Go + Docker two-stage builds, Consul service discovery, ELK logging, Kafka + Druid data pipeline'),
    ('中思博安科技', 'Zhongsiboan Technology'),
    ('专注自主区块链底层平台、智能合约引擎及去中心化应用。',
     'Focused on an in-house blockchain core platform, smart-contract engine and decentralized apps.'),
    ('<strong>uni-chain 底层平台：</strong>参与核心节点服务开发（Python 初期版本 + Go 重构），数据存储（KV + 关系型混合）、共识机制（<abbr data-tip="Practical Byzantine Fault Tolerance / Proof of Work">PBFT/POW</abbr>）、集群部署与监控',
     '<strong>uni-chain core platform:</strong> developed core node services (initial Python + Go rewrite), hybrid storage (KV + relational), consensus (<abbr data-tip="Practical Byzantine Fault Tolerance / Proof of Work">PBFT/POW</abbr>), cluster deployment &amp; monitoring'),
    ('<strong>uni-contract 智能合约平台：</strong>主导架构设计，Go 后端 + Python 合约编译/解析工具链，支持多语言合约编写与部署，提供合约生命周期管理 API',
     '<strong>uni-contract smart-contract platform:</strong> led architecture; Go backend + Python contract compile/parse toolchain; supported multi-language contract authoring &amp; deployment with lifecycle-management APIs'),
    ('<strong>去中心化交易所：</strong>早期参与交易模块开发（撮合引擎、链上资产兑换）',
     '<strong>Decentralized Exchange:</strong> early contributor to trading modules (matching engine, on-chain asset swap)'),
    ('<strong>研发基础设施：</strong>从零搭建 GitLab + Docker 研发平台，CI/CD 流水线，推动团队代码规范',
     '<strong>R&amp;D infrastructure:</strong> built GitLab + Docker dev platform from scratch, CI/CD pipelines, drove team code standards'),
    ('北外在线', 'BFSU Online'),
    ('在线教育平台模块开发，优化附件存储与试卷录入',
     'Online-education platform modules; optimized attachment storage and exam-paper entry'),
    ('北京诏兰信息技术', 'Beijing Zhaolan Information Technology'),
    ('<abbr data-tip="Demand-Side Platform">DSP</abbr> 需求方平台（广告请求、竞价、流量分配）、<abbr data-tip="Data Management Platform">DMP</abbr> 数据管理平台（画像、标签、分群）',
     '<abbr data-tip="Demand-Side Platform">DSP</abbr> (ad requests, bidding, traffic allocation) and <abbr data-tip="Data Management Platform">DMP</abbr> (profiling, tagging, segmentation)'),
    # education
    ('华北电力大学科技学院', 'North China Electric Power University (College of Science &amp; Technology)'),
    ('软件工程 · 本科 · 2009.09 – 2013.07', 'Software Engineering · B.Eng. · 2009.09 – 2013.07'),
    # footer / buttons
    ('[ 打印 ]', '[ Print ]'),
    ('title="回到顶部"', 'title="Back to top"'),
    # JS dynamic Go-years string
    ("'Go（'+goY+'年）'", "'Go ('+goY+' yrs)'"),
]

for zh, en in R:
    if zh in html:
        html = html.replace(zh, en)
    # else: skip (leave as-is; we'll catch leftovers)

os.makedirs(os.path.dirname(DST), exist_ok=True)
open(DST, "w", encoding="utf-8").write(html)

# report any remaining CJK (catch untranslated leftovers)
leftover = re.findall(r'[一-鿿]+', html)
print(f"wrote {DST}")
print(f"remaining CJK segments: {len(leftover)}")
if leftover:
    print("  e.g.:", leftover[:15])
