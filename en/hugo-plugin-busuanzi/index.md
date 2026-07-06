# Hugo Site Visitor Counter Plugin: busuanzi Integration


Integrating the **busuanzi** visitor-counting plugin into Hugo — for site-wide traffic and per-article read counts. Verified on my own site and shared here for anyone who needs it. See it live on [my blog](https://blog.xwi88.com) or visit [xwi88.github.io](https://xwi88.github.io).

<!--more-->

## **busuanzi**

>[busuanzi](http://busuanzi.ibruce.info/)

There are many fast technologies and platforms for building static sites today, but "static" is both a strength and a weakness. Because the site is static, dynamic features such as comments and counters have to rely on external services. For counting you can use "busuanzi", a lightweight page counter developed by Bruce. It is extremely easy to use: **two lines do the job** — *one script* and *one tag*.

### Metrics

- **PV** stands for **Page View**, *page views*
    The number of times a page is viewed, used to measure how many pages users visit. Each time a user opens a page, 1 PV is recorded; opening the same page repeatedly accumulates views.
- **UV** stands for **Unique Visitor**, *unique visitors*
    The number of people who visit a site within a day, identified by cookie. Multiple visits from the same visitor within a day count as a single visitor.

### How busuanzi differs from other analytics tools

- **busuanzi** can display the visit count directly on your page (or keep it hidden)
- For a site that has already been online for a while, **busuanzi** lets you seed the initial count **(sign-in required)**
- **Counting only** — the styling is entirely under your control

### Quick start

>**Count without displaying**: *install only the script, skip the display tags.*

```html
<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>

<span id="busuanzi_container_site_pv">site views: <span id="busuanzi_value_site_pv"></span></span>
<span id="busuanzi_container_site_uv">visitors: <span id="busuanzi_value_site_uv"></span></span>
<span id="busuanzi_container_page_pv">this page: <span id="busuanzi_value_page_pv"></span></span>
```

### Hugo integration

>If you don't have a strong urge to develop your own theme and want to keep updating the theme you've chosen, customize it the sensible way (**override templates and config**).

#### What to change

We will count per-page read `PV`, and track site-wide `PV` and `UV`. Combined with the theme in use, the files to modify are:

- `footer.html` — the footer template
  - **Note**: there is a global `footer.html` and a per-page `footer.html`
  - Counting uses the global **footer.html**
- `single.html` — the content page template
- `busuanzi.html` — the new **busuanzi** partial
- `config.toml` or `config.yaml`, whichever config file you use

>The files that need changes are shown below:

![busuanzi integration files to modify](/images/screen_img/hugo_busuanzi_support.jpeg "hugo busuanzi support")

##### Custom config

```toml
 # xwi88 custom config: xwi88Cfg
[params.xwi88Cfg]
  [params.xwi88Cfg.summary]
    update = true # show the updated date for summaries
  [params.xwi88Cfg.page]
    update = true # show the updated date for pages
  [params.xwi88Cfg.busuanzi]
    enable = true
    # custom uv for the whole site
    site_uv = true
    site_uv_pre = '<i class="fa fa-user"></i>' # a character or hint text
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

##### Add the partial

> **busuanzi.html**

```html
{{ if .params.enable }}
    {{ if eq .bsz_type "footer" }}
        {{/* only refresh in the footer to avoid repeated calls and double counting; counting runs whenever enabled, display depends on the settings */}}
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

        {{/*  page pv shows on the page only  */}}
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

>Include the partial we wrote at the right places: **busuanzi**

```html
# global footer.html
{{- /* busuanzi plugin */ -}}
{{- partial "plugin/busuanzi.html" (dict "params" .Site.Params.xwi88Cfg.busuanzi "bsz_type" "footer") -}}

# single page single.html
{{- /* busuanzi plugin */ -}}
{{- partial "plugin/busuanzi.html" (dict "params" .Site.Params.xwi88Cfg.busuanzi "bsz_type" "page-reading") -}}
```

#### Full code changes

- [github.com/xwi88/xwi88.github.io.source](https://github.com/xwi88/xwi88.github.io.source/commit/52ae125ad1b24910c0f3aa61e93a5ab6ef8b2575)
- [gitee.com/xwi88/xwi88](https://gitee.com/xwi88/xwi88/commit/52ae125ad1b24910c0f3aa61e93a5ab6ef8b2575)

