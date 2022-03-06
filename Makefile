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
	posts post-en posts-zh-cn clean clean-posts clean-public

default: dev

publish: clean-public
	@hugo -D
local:
	@hugo server -w  -DF
debug: uglifyjs dev
dev: clean-public
	@hugo server -w -e production -DF
prod:
	@hugo server -w -e production
run: prod

# uglifyjs 3.15.2, shall not use npx babel will import npm module...
uglifyjs: 
	@uglifyjs ${BASEDIR}/src/js/theme.js -o ${BASEDIR}/assets/js/theme.min.js -c -m --source-map "url=theme.min.js.map,names=false,filename=theme.js,base='${BASEDIR}/assets/js'"
	# @npx babel ${BASEDIR}/src/js/theme.js --out-file ${BASEDIR}/assets/js/theme.min.js --source-maps

# dev & test use
posts: posts-en posts-zh-cn
posts-en:
	@hugo new ${BASEDIR}/content/posts/local-test/auto-posts-$(shell date +'%s').en.md
posts-zh-cn:
	@hugo new ${BASEDIR}/content/posts/local-test/自动生成文档-$(shell date +'%s').zh-cn.md
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
