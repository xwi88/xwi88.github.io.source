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
	posts post-en posts-zh-cn posts-clean public-clean

default: dev

publish: public-clean
	@hugo -D
dev:
	@hugo server -w -e production -D
prod:
	@hugo server -w -e production
run: prod

# dev & test use
posts: posts-en posts-zh-cn
posts-en:
	@hugo new ${BASEDIR}/content/posts/local-test/auto-posts-$(shell date +'%s').en.md
posts-zh-cn:
	@hugo new ${BASEDIR}/content/posts/local-test/自动生成文档-$(shell date +'%s').zh-cn.md
posts-clean:
	@rm ${BASEDIR}/content/posts/local-test/*
public-clean:
	@rm -r ${BASEDIR}/public/*

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
