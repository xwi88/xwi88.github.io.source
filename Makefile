# Makefile to build the command lines and tests in this project.
# This Makefile doesn't consider Windows Environment. If you use it in Windows, please be careful.
SHELL := /bin/sh

existBash = $(shell cat /etc/shells|grep -w /bin/bash|grep -v grep)
ifneq (, $(strip ${existBash}))
	SHELL = /bin/bash
endif
$(info shell will use ${SHELL})

#BASEDIR = $(shell pwd)
BASEDIR = $(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# LoveIt 0.2.10 requires Hugo extended <= ~0.119 (newer Hugo removed APIs the
# theme uses). CI pins hugo-version '0.119.0' extended. Override locally, e.g.:
#   make dev HUGO=~/bin/hugo119
HUGO ?= hugo

gitBranch = $(shell git symbolic-ref --short -q HEAD)

ifeq ($(gitBranch),)
gitTag = $(shell git describe --always --tags --abbrev=0)
endif

buildTime = $(shell date "+%FT%T%z")
gitCommit = $(shell git rev-parse HEAD)
gitTreeState = $(shell if git status|grep -q 'clean';then echo clean; else echo dirty; fi)

.PHONY: default submodule submodule-status submodule-update submodule-update-remote submodule-sync submodule-init log \
	publish dev prod run \
	debug uglifyjs local \
	posts post-en posts-zh-cn clean clean-posts clean-public \
	linkcheck

default: dev

publish: clean-public
	@$(HUGO)
local:
	@$(HUGO) server -w  -DF
debug: uglifyjs dev
dev: clean-public
	@$(HUGO) server -w -e production -DF
prod:
	@$(HUGO) server -w -e production
run: prod

# Verify every internal link in the built site resolves (QA). Builds first if needed.
linkcheck:
	@${HUGO} --quiet 2>/dev/null || true
	@bash ${BASEDIR}/scripts/linkcheck.sh ${BASEDIR}/public

# Re-minify the project copy of theme.js (optional dev utility).
# Guarded: no-op unless both `uglifyjs` and src/js/theme.js exist.
# Note: theme JS normally ships via the theme submodule (themes/LoveIt/assets/js),
# so this project has no src/js/theme.js by default.
uglifyjs:
ifeq ($(shell command -v uglifyjs 2>/dev/null),)
	@echo "uglifyjs: tool not installed (npm i -g uglify-js); skipping"
else ifneq ($(wildcard ${BASEDIR}/src/js/theme.js),)
	@mkdir -p ${BASEDIR}/assets/js
	@uglifyjs ${BASEDIR}/src/js/theme.js -o ${BASEDIR}/assets/js/theme.js -c -b
else
	@echo "uglifyjs: src/js/theme.js not found (theme JS ships via themes/LoveIt/assets/js); skipping"
endif

# dev & test use
posts: posts-en posts-zh-cn
posts-en:
	@$(HUGO) new ${BASEDIR}/content/posts/local-test/auto-posts-$(shell date +'%s').en.md
posts-zh-cn:
	@$(HUGO) new ${BASEDIR}/content/posts/local-test/自动生成文档-$(shell date +'%s').zh-cn.md
clean-posts:
	@rm -rf ${BASEDIR}/content/posts/local-test/*
clean-public:
	@rm -rf ${BASEDIR}/public/*
clean: clean-public clean-posts

log:
	@git lg

submodule:
	@echo "show submodule info"
	@git submodule
submodule-status:
	@echo "show submodule status"
	@git submodule status
submodule-update:
	@echo "update submodule"
	@git submodule update --init --recursive
	#git submodule sync --recursive && git submodule update --init --recursive
submodule-update-remote:
	@echo "update submodule"
	@git submodule sync && git submodule update --remote
submodule-sync:
	@echo "sync submodule"
	@git submodule sync --recursive
submodule-init:
	@echo "init submodule"
	@git submodule update --init --recursive
