# Hugo 网站访问计数插件不蒜子集成


Hugo 网站访问量、文章阅读次数统计插件 **busuanzi** 集成配置使用，基于个人实验验证，旨在为需要的人提供方便，效果见 [我的博客](https://blog.xwi88.com) 或访问 [xwi88.github.io](https://xwi88.github.io)。

<!--more-->

## **busuanzi**

>[busuanzi](http://busuanzi.ibruce.info/)

静态网站建站现在有很多快速的技术和平台，但静态是优点也有缺点，由于是静态的，一些动态的内容如评论、计数等等模块就需要借助外来平台，计数可采用 “不蒜子”，由 Bruce 开发的一款轻量级的网页计数器。使用非常简单：**两行代码可搞定**， *一行脚本*，*一行标签*。

### 统计指标

- **PV** 即 **Page View**，*网站浏览量*
    指页面的浏览次数，用以衡量网站用户访问的网页数量。用户每打开一个页面便记录 1 次 PV，多次打开同一页面累计浏览量
- **UV** 即 **Unique Visitor**，*独立访客数*
    指 1 天内访问某站点的人数，以 cookie 为依据。1 天内同一访客的多次访问只计为 1 个访客。

### 不蒜子与其他统计工具的区别

- **不蒜子** 可直接将访问次数显示在您在网页上（也可不显示）
- 对于已经上线一段时间的网站，**不蒜子**允许您初始化首次数据 **需要注册登录**
- **只提供计数**，样式完全由用户控制

### 简单使用

>**只计数不显示**，*只安装脚本代码，不安装标签代码*。

```js
<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>

<span id="busuanzi_container_site_pv">本站总访问量<span id="busuanzi_value_site_pv"></span>次</span>
<span id="busuanzi_container_site_uv">本站总访客数<span id="busuanzi_value_site_uv"></span>人</span>
<span id="busuanzi_container_page_pv">本文总阅读量<span id="busuanzi_value_page_pv"></span>次</span>
```

### Hugo 集成

>如果你没有开发主题的强烈欲望，且想后续持续更新选用的主题，请采用合理的方式(**模板配置等的覆盖**)进行自定义修改。

#### 修改与变动

我们将对页面进行阅读计数 `PV`，对整站进行 `PV`，`UV` 统计。结合当前使用的主题，需要修改的地方有：

- `footer.html` 页脚模板页
  - **请注意**: 此处分为全局 `footer.html` 与单页 `footer.html`
  - 计数使用全局 **footer.html**
- `single.html` 内容页模板
- `busuanzi.html` 新加的 **busuanzi** 模板
- `config.toml` 或 `config.yaml` 或你指定的配置文件

>需要变动的地方如图所示:

![/images/screen_img/hugo_busuanzi_support.jpeg](/images/screen_img/hugo_busuanzi_support.jpeg "hugo busuanzi support")

##### 自定义配置

```toml
 # xwi88 自定义配置 xwi88Cfg
[params.xwi88Cfg]
  [params.xwi88Cfg.summary]
    update = true # summary 更新日期显示
  [params.xwi88Cfg.page]
    update = true # pages 更新日期显示
  [params.xwi88Cfg.busuanzi]
    enable = true
    # custom uv for the whole site
    site_uv = true
    site_uv_pre = '<i class="fa fa-user"></i>' # 字符或提示语
    site_uv_post = ''
    # custom pv for the whole site
    site_pv = true
    site_pv_pre = '<i class="fa fa-eye"></i>'
    # site_pv_post = '<i class="far fa-eye fa-fw"></i>'
    site_pv_post = ''
    # custom pv span for one page only
    page_pv = true
    page_pv_pre = '<i class="far fa-eye fa-fw"></i>'
    page_pv_post = ''
```

##### 模板添加

> **busuanzi.html**

```html
{{ if .params.enable }}
    {{ if eq .bsz_type "footer" }}
        {{/* 只有 footer 才刷新，防止页面进行多次调用，计数重复; 只要启用就计数，显示与否看具体设置 */}}
        <script async src=" //busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js "></script>
    {{ end }}

    {{ if or (eq .params.site_pv true) (eq .params.site_uv true) (eq .params.page_pv true) }}
        {{ if eq .bsz_type "footer" }}
            <section>
                {{ if eq .params.site_pv true }}
                    <span id="busuanzi_container_value_site_pv">
                        {{- with .params.page_pv_pre -}}
                            {{ . | safeHTML }}
                        {{ end }}
                        <span id="busuanzi_value_site_pv"></span>
                    </span>
                {{ end }}

                {{ if and (eq .params.site_pv true) (eq .params.site_uv true) }}
                    &nbsp;|&nbsp;              
                {{ end }}

                {{ if eq .params.site_uv true }}
                    <span id="busuanzi_container_value_site_uv">
                        {{- with .params.site_uv_pre -}}
                            {{ . | safeHTML }}
                        {{ end }}
                        <span id="busuanzi_value_site_uv"></span>
                    </span>
                {{ end }}
            </section>
        {{ end }}

        {{/*  page pv 只在 page 显示  */}}
        {{ if and (eq .params.page_pv true) (eq .bsz_type "page-reading") }}
            <span id="busuanzi_container_value_page_pv">
                {{- with .params.page_pv_pre -}}
                    {{ . | safeHTML }}
                {{ end }}
                <span id="busuanzi_value_page_pv"></span>&nbsp;
                {{- T "views" -}}
            </span>
        {{ end }}
    {{ end }}
{{ end }}
```

>相应位置引入我们编写的插件: **busuanzi**

```html
# 全局 footer.html
{{- /* busuanzi plugin */ -}}
{{- partial "plugin/busuanzi.html" (dict "params" .Site.Params.xwi88Cfg.busuanzi "bsz_type" "footer") -}}

# 单页面 single.html
{{- /* busuanzi plugin */ -}}
{{- partial "plugin/busuanzi.html" (dict "params" .Site.Params.xwi88Cfg.busuanzi "bsz_type" "page-reading") -}}
```

#### 代码变更详情可参考

- [github.com/xwi88/xwi88.github.io.source](https://github.com/xwi88/xwi88.github.io.source/commit/52ae125ad1b24910c0f3aa61e93a5ab6ef8b2575)
- [gitee.com/xwi88/xwi88](https://gitee.com/xwi88/xwi88/commit/52ae125ad1b24910c0f3aa61e93a5ab6ef8b2575)

