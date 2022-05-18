class Util {
    forEach(elements, handler) {
        elements = elements || [];
        for (let i = 0; i < elements.length; i++) handler(elements[i]);
    }
    getScrollTop() {
        return document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
    }
    isMobile() {
        return window.matchMedia("only screen and (max-width: 680px)").matches;
    }
    isTocStatic() {
        return window.matchMedia("only screen and (max-width: 960px)").matches;
    }
    animateCSS(element, animation, reserved, callback) {
        Array.isArray(animation) || (animation = [ animation ]), element.classList.add("animate__animated", ...animation);
        const handler = () => {
            element.classList.remove("animate__animated", ...animation), element.removeEventListener("animationend", handler), 
            "function" == typeof callback && callback();
        };
        reserved || element.addEventListener("animationend", handler, !1);
    }
}

class Theme {
    constructor() {
        this.config = window.config, this.data = this.config.data, this.isDark = "dark" === document.body.getAttribute("theme"), 
        this.util = new Util(), this.newScrollTop = this.util.getScrollTop(), this.oldScrollTop = this.newScrollTop, 
        this.scrollEventSet = new Set(), this.resizeEventSet = new Set(), this.switchThemeEventSet = new Set(), 
        this.clickMaskEventSet = new Set(), window.objectFitImages && objectFitImages();
    }
    initRaw() {
        this.util.forEach(document.querySelectorAll("[data-raw]"), $raw => {
            $raw.innerHTML = this.data[$raw.id];
        });
    }
    initSVGIcon() {
        this.util.forEach(document.querySelectorAll("[data-svg-src]"), $icon => {
            fetch($icon.getAttribute("data-svg-src")).then(response => response.text()).then(svg => {
                const $temp = document.createElement("div"), $svg = ($temp.insertAdjacentHTML("afterbegin", svg), 
                $temp.firstChild);
                $svg.setAttribute("data-svg-src", $icon.getAttribute("data-svg-src")), 
                $svg.classList.add("icon");
                svg = $svg.getElementsByTagName("title");
                svg.length && $svg.removeChild(svg[0]), $icon.parentElement.replaceChild($svg, $icon);
            }).catch(err => {
                console.error(err);
            });
        });
    }
    initTwemoji() {
        this.config.twemoji && twemoji.parse(document.body);
    }
    initMenuMobile() {
        const $menuToggleMobile = document.getElementById("menu-toggle-mobile"), $menuMobile = document.getElementById("menu-mobile");
        $menuToggleMobile.addEventListener("click", () => {
            document.body.classList.toggle("blur"), $menuToggleMobile.classList.toggle("active"), 
            $menuMobile.classList.toggle("active");
        }, !1), this._menuMobileOnClickMask = this._menuMobileOnClickMask || (() => {
            $menuToggleMobile.classList.remove("active"), $menuMobile.classList.remove("active");
        }), this.clickMaskEventSet.add(this._menuMobileOnClickMask);
    }
    initSwitchTheme() {
        this.util.forEach(document.getElementsByClassName("theme-switch"), $themeSwitch => {
            $themeSwitch.addEventListener("click", () => {
                "dark" === document.body.getAttribute("theme") ? document.body.setAttribute("theme", "light") : document.body.setAttribute("theme", "dark"), 
                this.isDark = !this.isDark, window.localStorage && localStorage.setItem("theme", this.isDark ? "dark" : "light");
                for (var event of this.switchThemeEventSet) event();
            }, !1);
        });
    }
    initSearch() {
        const searchConfig = this.config.search, isMobile = this.util.isMobile();
        if (!(!searchConfig || isMobile && this._searchMobileOnce || !isMobile && this._searchDesktopOnce)) {
            const maxResultLength = searchConfig.maxResultLength || 10, snippetLength = searchConfig.snippetLength || 50, highlightTag = searchConfig.highlightTag || "em", suffix = isMobile ? "mobile" : "desktop", $header = document.getElementById("header-" + suffix), $searchInput = document.getElementById("search-input-" + suffix), $searchToggle = document.getElementById("search-toggle-" + suffix), $searchLoading = document.getElementById("search-loading-" + suffix), $searchClear = document.getElementById("search-clear-" + suffix), initAutosearch = (isMobile ? (this._searchMobileOnce = !0, 
            $searchInput.addEventListener("focus", () => {
                document.body.classList.add("blur"), $header.classList.add("open");
            }, !1), document.getElementById("search-cancel-mobile").addEventListener("click", () => {
                $header.classList.remove("open"), document.body.classList.remove("blur"), 
                document.getElementById("menu-toggle-mobile").classList.remove("active"), 
                document.getElementById("menu-mobile").classList.remove("active"), 
                $searchLoading.style.display = "none", $searchClear.style.display = "none", 
                this._searchMobile && this._searchMobile.autocomplete.setVal("");
            }, !1), $searchClear.addEventListener("click", () => {
                $searchClear.style.display = "none", this._searchMobile && this._searchMobile.autocomplete.setVal("");
            }, !1), this._searchMobileOnClickMask = this._searchMobileOnClickMask || (() => {
                $header.classList.remove("open"), $searchLoading.style.display = "none", 
                $searchClear.style.display = "none", this._searchMobile && this._searchMobile.autocomplete.setVal("");
            }), this.clickMaskEventSet.add(this._searchMobileOnClickMask)) : (this._searchDesktopOnce = !0, 
            $searchToggle.addEventListener("click", () => {
                document.body.classList.add("blur"), $header.classList.add("open"), 
                $searchInput.focus();
            }, !1), $searchClear.addEventListener("click", () => {
                $searchClear.style.display = "none", this._searchDesktop && this._searchDesktop.autocomplete.setVal("");
            }, !1), this._searchDesktopOnClickMask = this._searchDesktopOnClickMask || (() => {
                $header.classList.remove("open"), $searchLoading.style.display = "none", 
                $searchClear.style.display = "none", this._searchDesktop && this._searchDesktop.autocomplete.setVal("");
            }), this.clickMaskEventSet.add(this._searchDesktopOnClickMask)), $searchInput.addEventListener("input", () => {
                "" === $searchInput.value ? $searchClear.style.display = "none" : $searchClear.style.display = "inline";
            }, !1), () => {
                const autosearch = autocomplete("#search-input-" + suffix, {
                    hint: !1,
                    autoselect: !0,
                    dropdownMenuContainer: "#search-dropdown-" + suffix,
                    clearOnSelected: !0,
                    cssClasses: {
                        noPrefix: !0
                    },
                    debug: !0
                }, {
                    name: "search",
                    source: (query, callback) => {
                        $searchLoading.style.display = "inline", $searchClear.style.display = "none";
                        const finish = results => {
                            $searchLoading.style.display = "none", $searchClear.style.display = "inline", 
                            callback(results);
                        };
                        if ("lunr" === searchConfig.type) {
                            const search = () => {
                                lunr.queryHandler && (query = lunr.queryHandler(query));
                                const results = {};
                                return this._index.search(query).forEach(({
                                    ref,
                                    matchData: {
                                        metadata
                                    }
                                }) => {
                                    ref = this._indexData[ref];
                                    let {
                                        uri,
                                        title,
                                        content: context
                                    } = ref;
                                    if (!results[uri]) {
                                        let position = 0;
                                        Object.values(metadata).forEach(({
                                            content
                                        }) => {
                                            content && ((content = content.position[0][0]) < position || 0 === position) && (position = content);
                                        }), position -= snippetLength / 5, context = 0 < position ? (position += context.substr(position, 20).lastIndexOf(" ") + 1, 
                                        "..." + context.substr(position, snippetLength)) : context.substr(0, snippetLength), 
                                        Object.keys(metadata).forEach(key => {
                                            title = title.replace(new RegExp(`(${key})`, "gi"), `<${highlightTag}>$1</${highlightTag}>`), 
                                            context = context.replace(new RegExp(`(${key})`, "gi"), `<${highlightTag}>$1</${highlightTag}>`);
                                        }), results[uri] = {
                                            uri: uri,
                                            title: title,
                                            date: ref.date,
                                            context: context
                                        };
                                    }
                                }), Object.values(results).slice(0, maxResultLength);
                            };
                            this._index ? finish(search()) : fetch(searchConfig.lunrIndexURL).then(response => response.json()).then(data => {
                                const indexData = {};
                                this._index = lunr(function() {
                                    searchConfig.lunrLanguageCode && this.use(lunr[searchConfig.lunrLanguageCode]), 
                                    this.ref("objectID"), this.field("title", {
                                        boost: 50
                                    }), this.field("tags", {
                                        boost: 20
                                    }), this.field("categories", {
                                        boost: 20
                                    }), this.field("content", {
                                        boost: 10
                                    }), this.metadataWhitelist = [ "position" ], 
                                    data.forEach(record => {
                                        indexData[record.objectID] = record, this.add(record);
                                    });
                                }), this._indexData = indexData, finish(search());
                            }).catch(err => {
                                console.error(err), finish([]);
                            });
                        } else "algolia" === searchConfig.type && (this._algoliaIndex = this._algoliaIndex || algoliasearch(searchConfig.algoliaAppID, searchConfig.algoliaSearchKey).initIndex(searchConfig.algoliaIndex), 
                        this._algoliaIndex.search(query, {
                            offset: 0,
                            length: 8 * maxResultLength,
                            attributesToHighlight: [ "title" ],
                            attributesToSnippet: [ "content:" + snippetLength ],
                            highlightPreTag: `<${highlightTag}>`,
                            highlightPostTag: `</${highlightTag}>`
                        }).then(({
                            hits
                        }) => {
                            const results = {};
                            hits.forEach(({
                                uri,
                                date,
                                _highlightResult: {
                                    title
                                },
                                _snippetResult: {
                                    content
                                }
                            }) => {
                                results[uri] && results[uri].context.length > content.value || (results[uri] = {
                                    uri: uri,
                                    title: title.value,
                                    date: date,
                                    context: content.value
                                });
                            }), finish(Object.values(results).slice(0, maxResultLength));
                        }).catch(err => {
                            console.error(err), finish([]);
                        }));
                    },
                    templates: {
                        suggestion: ({
                            title,
                            date,
                            context
                        }) => `<div><span class="suggestion-title">${title}</span><span class="suggestion-date">${date}</span></div><div class="suggestion-context">${context}</div>`,
                        empty: ({
                            query
                        }) => `<div class="search-empty">${searchConfig.noResultsFound}: <span class="search-query">"${query}"</span></div>`,
                        footer: ({}) => {
                            var {
                                searchType,
                                icon,
                                href
                            } = "algolia" === searchConfig.type ? {
                                searchType: "algolia",
                                icon: '<i class="fab fa-algolia fa-fw" aria-hidden="true"></i>',
                                href: "https://www.algolia.com/"
                            } : {
                                searchType: "Lunr.js",
                                icon: "",
                                href: "https://lunrjs.com/"
                            };
                            return `<div class="search-footer">Search by <a href="${href}" rel="noopener noreffer" target="_blank">${icon} ${searchType}</a></div>`;
                        }
                    }
                });
                autosearch.on("autocomplete:selected", (_event, suggestion, _dataset, _context) => {
                    window.location.assign(suggestion.uri);
                }), isMobile ? this._searchMobile = autosearch : this._searchDesktop = autosearch;
            });
            if (searchConfig.lunrSegmentitURL && !document.getElementById("lunr-segmentit")) {
                const script = document.createElement("script");
                script.id = "lunr-segmentit", script.type = "text/javascript", script.src = searchConfig.lunrSegmentitURL, 
                script.async = !0, script.readyState ? script.onreadystatechange = () => {
                    "loaded" != script.readyState && "complete" != script.readyState || (script.onreadystatechange = null, 
                    initAutosearch());
                } : script.onload = () => {
                    initAutosearch();
                }, document.body.appendChild(script);
            } else initAutosearch();
        }
    }
    initDetails() {
        this.util.forEach(document.getElementsByClassName("details"), $details => {
            const $summary = $details.getElementsByClassName("details-summary")[0];
            $summary.addEventListener("click", () => {
                $details.classList.toggle("open");
            }, !1);
        });
    }
    initLightGallery() {
        this.config.lightgallery && lightGallery(document.getElementById("content"), {
            plugins: [ lgThumbnail, lgZoom ],
            selector: ".lightgallery",
            speed: 400,
            hideBarsDelay: 2e3,
            allowMediaOverlap: !0,
            exThumbImage: "data-thumbnail",
            toggleThumb: !0,
            thumbWidth: 80,
            thumbHeight: "60px",
            actualSize: !1,
            showZoomInOutIcons: !0
        });
    }
    initHighlight() {
        this.util.forEach(document.querySelectorAll(".highlight > pre.chroma"), $preChroma => {
            const $chroma = document.createElement("div"), $table = ($chroma.className = $preChroma.className, 
            document.createElement("table")), $tbody = ($chroma.appendChild($table), 
            document.createElement("tbody")), $tr = ($table.appendChild($tbody), 
            document.createElement("tr")), $td = ($tbody.appendChild($tr), document.createElement("td"));
            $tr.appendChild($td), $preChroma.parentElement.replaceChild($chroma, $preChroma), 
            $td.appendChild($preChroma);
        }), this.util.forEach(document.querySelectorAll(".highlight > .chroma"), $chroma => {
            var $codeElements = $chroma.querySelectorAll("pre.chroma > code");
            if ($codeElements.length) {
                const $code = $codeElements[$codeElements.length - 1], $header = document.createElement("div"), $title = ($header.className = "code-header " + $code.className.toLowerCase(), 
                document.createElement("span")), $ellipses = ($title.classList.add("code-title"), 
                $title.insertAdjacentHTML("afterbegin", '<i class="arrow fas fa-chevron-right fa-fw" aria-hidden="true"></i>'), 
                $title.addEventListener("click", () => {
                    $chroma.classList.toggle("open");
                }, !1), $header.appendChild($title), document.createElement("span")), $copy = ($ellipses.insertAdjacentHTML("afterbegin", '<i class="fas fa-ellipsis-h fa-fw" aria-hidden="true"></i>'), 
                $ellipses.classList.add("ellipses"), $ellipses.addEventListener("click", () => {
                    $chroma.classList.add("open");
                }, !1), $header.appendChild($ellipses), document.createElement("span")), code = ($copy.insertAdjacentHTML("afterbegin", '<i class="far fa-copy fa-fw" aria-hidden="true"></i>'), 
                $copy.classList.add("copy"), $code.innerText);
                if ((this.config.code.maxShownLines < 0 || code.split("\n").length < this.config.code.maxShownLines + 2) && $chroma.classList.add("open"), 
                this.config.code.copyTitle) {
                    $copy.setAttribute("data-clipboard-text", code), $copy.title = this.config.code.copyTitle;
                    const clipboard = new ClipboardJS($copy);
                    clipboard.on("success", _e => {
                        this.util.animateCSS($code, "animate__flash");
                    }), $header.appendChild($copy);
                }
                $chroma.insertBefore($header, $chroma.firstChild);
            }
        });
    }
    initTable() {
        this.util.forEach(document.querySelectorAll(".content table"), $table => {
            const $wrapper = document.createElement("div");
            $wrapper.className = "table-wrapper", $table.parentElement.replaceChild($wrapper, $table), 
            $wrapper.appendChild($table);
        });
    }
    initHeaderLink() {
        for (let num = 1; num <= 6; num++) this.util.forEach(document.querySelectorAll(".single .content > h" + num), $header => {
            $header.classList.add("headerLink"), $header.insertAdjacentHTML("afterbegin", `<a href="#${$header.id}" class="header-mark"></a>`);
        });
    }
    initToc() {
        const $tocCore = document.getElementById("TableOfContents");
        if (null !== $tocCore) if (document.getElementById("toc-static").getAttribute("data-kept") || this.util.isTocStatic()) {
            const $tocContentStatic = document.getElementById("toc-content-static");
            $tocCore.parentElement !== $tocContentStatic && ($tocCore.parentElement.removeChild($tocCore), 
            $tocContentStatic.appendChild($tocCore)), this._tocOnScroll && this.scrollEventSet.delete(this._tocOnScroll);
        } else {
            const $tocContentAuto = document.getElementById("toc-content-auto"), $toc = ($tocCore.parentElement !== $tocContentAuto && ($tocCore.parentElement.removeChild($tocCore), 
            $tocContentAuto.appendChild($tocCore)), document.getElementById("toc-auto")), $page = document.getElementsByClassName("page")[0];
            var rect = $page.getBoundingClientRect();
            $toc.style.left = rect.left + rect.width + 20 + "px", $toc.style.maxWidth = $page.getBoundingClientRect().left - 20 + "px", 
            $toc.style.visibility = "visible";
            const $tocLinkElements = $tocCore.querySelectorAll("a:first-child"), $tocLiElements = $tocCore.getElementsByTagName("li"), $headerLinkElements = document.getElementsByClassName("headerLink"), headerIsFixed = "normal" !== document.body.getAttribute("data-header-desktop"), headerHeight = document.getElementById("header-desktop").offsetHeight, TOP_SPACING = 20 + (headerIsFixed ? headerHeight : 0), minTocTop = $toc.offsetTop, minScrollTop = minTocTop - TOP_SPACING + (headerIsFixed ? 0 : headerHeight);
            this._tocOnScroll = this._tocOnScroll || (() => {
                var maxTocTop = document.getElementById("post-footer").offsetTop - $toc.getBoundingClientRect().height, maxScrollTop = maxTocTop - TOP_SPACING + (headerIsFixed ? 0 : headerHeight), INDEX_SPACING = (this.newScrollTop < minScrollTop ? ($toc.style.position = "absolute", 
                $toc.style.top = minTocTop + "px") : this.newScrollTop > maxScrollTop ? ($toc.style.position = "absolute", 
                $toc.style.top = maxTocTop + "px") : ($toc.style.position = "fixed", 
                $toc.style.top = TOP_SPACING + "px"), this.util.forEach($tocLinkElements, $tocLink => {
                    $tocLink.classList.remove("active");
                }), this.util.forEach($tocLiElements, $tocLi => {
                    $tocLi.classList.remove("has-active");
                }), 20 + (headerIsFixed ? headerHeight : 0));
                let activeTocIndex = $headerLinkElements.length - 1;
                for (let i = 0; i < $headerLinkElements.length - 1; i++) {
                    var thisTop = $headerLinkElements[i].getBoundingClientRect().top, nextTop = $headerLinkElements[i + 1].getBoundingClientRect().top;
                    if (0 == i && INDEX_SPACING < thisTop || thisTop <= INDEX_SPACING && INDEX_SPACING < nextTop) {
                        activeTocIndex = i;
                        break;
                    }
                }
                if (-1 !== activeTocIndex) {
                    $tocLinkElements[activeTocIndex].classList.add("active");
                    let $parent = $tocLinkElements[activeTocIndex].parentElement;
                    for (;$parent !== $tocCore; ) $parent.classList.add("has-active"), 
                    $parent = $parent.parentElement.parentElement;
                }
            }), this._tocOnScroll(), this.scrollEventSet.add(this._tocOnScroll);
        }
    }
    initMath() {
        this.config.math && renderMathInElement(document.body, this.config.math);
    }
    initMermaid() {
        this._mermaidOnSwitchTheme = this._mermaidOnSwitchTheme || (() => {
            var $mermaidElements = document.getElementsByClassName("mermaid");
            $mermaidElements.length && (mermaid.initialize({
                startOnLoad: !1,
                theme: this.isDark ? "dark" : "neutral",
                securityLevel: "loose"
            }), this.util.forEach($mermaidElements, $mermaid => {
                mermaid.render("svg-" + $mermaid.id, this.data[$mermaid.id], svgCode => {
                    $mermaid.innerHTML = svgCode;
                }, $mermaid);
            }));
        }), this.switchThemeEventSet.add(this._mermaidOnSwitchTheme), this._mermaidOnSwitchTheme();
    }
    initEcharts() {
        this.config.echarts && (echarts.registerTheme("light", this.config.echarts.lightTheme), 
        echarts.registerTheme("dark", this.config.echarts.darkTheme), this._echartsOnSwitchTheme = this._echartsOnSwitchTheme || (() => {
            this._echartsArr = this._echartsArr || [];
            for (let i = 0; i < this._echartsArr.length; i++) this._echartsArr[i].dispose();
            this._echartsArr = [], this.util.forEach(document.getElementsByClassName("echarts"), $echarts => {
                const chart = echarts.init($echarts, this.isDark ? "dark" : "light", {
                    renderer: "svg"
                });
                chart.setOption(JSON.parse(this.data[$echarts.id])), this._echartsArr.push(chart);
            });
        }), this.switchThemeEventSet.add(this._echartsOnSwitchTheme), this._echartsOnSwitchTheme(), 
        this._echartsOnResize = this._echartsOnResize || (() => {
            for (let i = 0; i < this._echartsArr.length; i++) this._echartsArr[i].resize();
        }), this.resizeEventSet.add(this._echartsOnResize));
    }
    initMapbox() {
        this.config.mapbox && (mapboxgl.accessToken = this.config.mapbox.accessToken, 
        mapboxgl.setRTLTextPlugin(this.config.mapbox.RTLTextPlugin), this._mapboxArr = this._mapboxArr || [], 
        this.util.forEach(document.getElementsByClassName("mapbox"), $mapbox => {
            var {
                lng,
                lat,
                zoom,
                lightStyle,
                darkStyle,
                marked,
                navigation,
                geolocate,
                scale,
                fullscreen
            } = this.data[$mapbox.id];
            const mapbox = new mapboxgl.Map({
                container: $mapbox,
                center: [ lng, lat ],
                zoom: zoom,
                minZoom: .2,
                style: this.isDark ? darkStyle : lightStyle,
                attributionControl: !1
            });
            marked && new mapboxgl.Marker().setLngLat([ lng, lat ]).addTo(mapbox), 
            navigation && mapbox.addControl(new mapboxgl.NavigationControl(), "bottom-right"), 
            geolocate && mapbox.addControl(new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: !0
                },
                showUserLocation: !0,
                trackUserLocation: !0
            }), "bottom-right"), scale && mapbox.addControl(new mapboxgl.ScaleControl()), 
            fullscreen && mapbox.addControl(new mapboxgl.FullscreenControl()), mapbox.addControl(new MapboxLanguage()), 
            this._mapboxArr.push(mapbox);
        }), this._mapboxOnSwitchTheme = this._mapboxOnSwitchTheme || (() => {
            this.util.forEach(this._mapboxArr, mapbox => {
                var $mapbox = mapbox.getContainer(), {
                    lightStyle: $mapbox,
                    darkStyle
                } = this.data[$mapbox.id];
                mapbox.setStyle(this.isDark ? darkStyle : $mapbox), mapbox.addControl(new MapboxLanguage());
            });
        }), this.switchThemeEventSet.add(this._mapboxOnSwitchTheme));
    }
    initTypeit() {
        if (this.config.typeit) {
            const typeitConfig = this.config.typeit, speed = typeitConfig.speed || 100, cursorSpeed = typeitConfig.cursorSpeed || 1e3, cursorChar = typeitConfig.cursorChar || "|";
            Object.values(typeitConfig.data).forEach(group => {
                const typeone = i => {
                    var id = group[i];
                    const instance = new TypeIt("#" + id, {
                        strings: this.data[id],
                        speed: speed,
                        lifeLike: !0,
                        cursorSpeed: cursorSpeed,
                        cursorChar: cursorChar,
                        waitUntilVisible: !0,
                        afterComplete: () => {
                            i === group.length - 1 ? 0 <= typeitConfig.duration && window.setTimeout(() => {
                                instance.destroy();
                            }, typeitConfig.duration) : (instance.destroy(), typeone(i + 1));
                        }
                    }).go();
                };
                typeone(0);
            });
        }
    }
    initComment() {
        if (this.config.comment) {
            if (this.config.comment.gitalk) {
                this.config.comment.gitalk.body = decodeURI(window.location.href);
                const gitalk = new Gitalk(this.config.comment.gitalk);
                gitalk.render("gitalk");
            }
            if (this.config.comment.valine && new Valine(this.config.comment.valine), 
            this.config.comment.utterances) {
                const utterancesConfig = this.config.comment.utterances, script = document.createElement("script");
                script.src = "https://utteranc.es/client.js", script.type = "text/javascript", 
                script.setAttribute("repo", utterancesConfig.repo), script.setAttribute("issue-term", utterancesConfig.issueTerm), 
                utterancesConfig.label && script.setAttribute("label", utterancesConfig.label), 
                script.setAttribute("theme", this.isDark ? utterancesConfig.darkTheme : utterancesConfig.lightTheme), 
                script.crossOrigin = "anonymous", script.async = !0, document.getElementById("utterances").appendChild(script), 
                this._utterancesOnSwitchTheme = this._utterancesOnSwitchTheme || (() => {
                    var message = {
                        type: "set-theme",
                        theme: this.isDark ? utterancesConfig.darkTheme : utterancesConfig.lightTheme
                    };
                    const iframe = document.querySelector(".utterances-frame");
                    iframe.contentWindow.postMessage(message, "https://utteranc.es");
                }), this.switchThemeEventSet.add(this._utterancesOnSwitchTheme);
            }
            if (this.config.comment.giscus) {
                const giscusConfig = this.config.comment.giscus, giscusScript = document.createElement("script");
                let dataTheme = this.isDark ? giscusConfig.darkTheme : giscusConfig.lightTheme;
                giscusScript.src = "https://giscus.app/client.js", giscusScript.type = "text/javascript", 
                giscusScript.setAttribute("data-repo", giscusConfig.repo), giscusScript.setAttribute("data-repo-id", giscusConfig.repo_id), 
                giscusScript.setAttribute("data-category", giscusConfig.category), 
                giscusScript.setAttribute("data-category-id", giscusConfig.category_id), 
                giscusScript.setAttribute("data-mapping", giscusConfig.mapping), 
                giscusScript.setAttribute("data-reactions-enabled", giscusConfig.reactions_enabled), 
                giscusScript.setAttribute("data-emit-metadata", giscusConfig.emit_metadata), 
                giscusScript.setAttribute("data-input-position", giscusConfig.input_position), 
                giscusScript.setAttribute("data-lang", giscusConfig.lang), giscusConfig.label && giscusScript.setAttribute("label", giscusConfig.label), 
                giscusScript.setAttribute("data-theme", dataTheme), giscusScript.crossOrigin = "anonymous", 
                giscusScript.async = !0, document.getElementById("giscus").appendChild(giscusScript), 
                this._giscusOnSwitchTheme = this._giscusOnSwitchTheme || (() => {
                    var message = {
                        setConfig: {
                            theme: dataTheme = this.isDark ? giscusConfig.darkTheme : giscusConfig.lightTheme,
                            reactionsEnabled: !1
                        }
                    };
                    const iframe = document.querySelector("iframe.giscus-frame");
                    iframe && iframe.contentWindow.postMessage({
                        giscus: message
                    }, "https://giscus.app");
                }), this.switchThemeEventSet.add(this._giscusOnSwitchTheme);
            }
        }
    }
    initCookieconsent() {
        this.config.cookieconsent && cookieconsent.initialise(this.config.cookieconsent);
    }
    onScroll() {
        const $headers = [];
        if ("auto" === document.body.getAttribute("data-header-desktop") && $headers.push(document.getElementById("header-desktop")), 
        "auto" === document.body.getAttribute("data-header-mobile") && $headers.push(document.getElementById("header-mobile")), 
        document.getElementById("comments")) {
            const $viewComments = document.getElementById("view-comments");
            $viewComments.href = "#comments", $viewComments.style.display = "block";
        }
        const $fixedButtons = document.getElementById("fixed-buttons");
        window.addEventListener("scroll", () => {
            this.newScrollTop = this.util.getScrollTop();
            const scroll = this.newScrollTop - this.oldScrollTop;
            var event, isMobile = this.util.isMobile();
            this.util.forEach($headers, $header => {
                20 < scroll ? ($header.classList.remove("animate__fadeInDown"), 
                this.util.animateCSS($header, [ "animate__fadeOutUp", "animate__faster" ], !0)) : scroll < -20 && ($header.classList.remove("animate__fadeOutUp"), 
                this.util.animateCSS($header, [ "animate__fadeInDown", "animate__faster" ], !0));
            }), 100 < this.newScrollTop ? isMobile && 20 < scroll ? ($fixedButtons.classList.remove("animate__fadeIn"), 
            this.util.animateCSS($fixedButtons, [ "animate__fadeOut", "animate__faster" ], !0)) : (!isMobile || scroll < -20) && ($fixedButtons.style.display = "block", 
            $fixedButtons.classList.remove("animate__fadeOut"), this.util.animateCSS($fixedButtons, [ "animate__fadeIn", "animate__faster" ], !0)) : (isMobile || ($fixedButtons.classList.remove("animate__fadeIn"), 
            this.util.animateCSS($fixedButtons, [ "animate__fadeOut", "animate__faster" ], !0)), 
            $fixedButtons.style.display = "none");
            for (event of this.scrollEventSet) event();
            this.oldScrollTop = this.newScrollTop;
        }, !1);
    }
    onResize() {
        window.addEventListener("resize", () => {
            this._resizeTimeout || (this._resizeTimeout = window.setTimeout(() => {
                this._resizeTimeout = null;
                for (var event of this.resizeEventSet) event();
                this.initToc(), this.initMermaid(), this.initSearch();
            }, 100));
        }, !1);
    }
    onClickMask() {
        document.getElementById("mask").addEventListener("click", () => {
            for (var event of this.clickMaskEventSet) event();
            document.body.classList.remove("blur");
        }, !1);
    }
    init() {
        try {
            this.initRaw(), this.initSVGIcon(), this.initTwemoji(), this.initMenuMobile(), 
            this.initSwitchTheme(), this.initSearch(), this.initDetails(), this.initLightGallery(), 
            this.initHighlight(), this.initTable(), this.initHeaderLink(), this.initMath(), 
            this.initMermaid(), this.initEcharts(), this.initTypeit(), this.initMapbox(), 
            this.initCookieconsent();
        } catch (err) {
            console.error(err);
        }
        window.setTimeout(() => {
            this.initToc(), this.initComment(), this.onScroll(), this.onResize(), 
            this.onClickMask();
        }, 100);
    }
}

const themeInit = () => {
    const theme = new Theme();
    theme.init();
};

"loading" !== document.readyState ? themeInit() : document.addEventListener("DOMContentLoaded", themeInit, !1);