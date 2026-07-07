# Common Git Commands & Config


Sharing the [git](https://git-scm.com/) [gɪt] config I've accumulated over the years. The content below is based on version [`2.34.1`](https://git-scm.com/docs/git/2.34.0); if anything differs, upgrade your git first!

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

## Basic account config

>`--global` *means global config*; **non-global config must be set inside the specific git project directory**

- `git config --global user.name [your_name]`
- `git config --global user.email [your_email]`
- `git config --global --list` **view global git config**
- `git config --list` *view project git config*

### Signed-commit setup

>configure your Git client to sign commits by default for a local repository, in Git versions 2.0.0 and above

- `git config --global user.signingkey [KeyID]`
- `git config --global commit.gpgsign true`

See also: [Signing Git commits/tags with GPG](/git-sign-tags-commits-with-gpg/) for setup.

## Credential storage

>To avoid typing the password every time, let the machine remember it. *MacOS* uses **Keychain Access** to store your password and other credentials.

- `git config --global credential.helper store` **persistently save your password/credentials on this machine**
- `git config --global credential.helper 'cache --timeout=300'` *cache the password for 300s*

>**More**:
>
>- [gitcredentials](https://git-scm.com/docs/gitcredentials)
>- [git-credential-cache](https://git-scm.com/docs/git-credential-cache)

{{< admonition warning >}}

>If you have MFA enabled, you must use a **Personal Token** instead of the password.
>
>- github path: [Settings Developer settings](https://github.com/settings/tokens)->**Personal access tokens**->*Generate new token*

**Personal access tokens** 📢

- **Visible only when generated — save it carefully**
- **Mind the scopes and expiration**

{{< /admonition >}}

## Credential cleanup

>After a password changes or expires, clear the stored one, or you may get `login failed` / `no permission` errors.

- `git config --system --unset credential.helper`
- `git config --global credential.helper 'cache --timeout=5'` *or set a very short expiry to flush the cached password*
- `git config --global credential.helper store` **re-enable credential storage**

## Prettier log output

>The plain [`git log`](https://git-scm.com/docs/git-log) is too bare to inspect details. We can format it, and `git alias` makes it easy to define our own *git log* command — **do not override git's built-in commands**.

{{< admonition tip >}}
My usual *git log* config:

>`git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset | %C(red)%cs%Creset' --abbrev-commit"`

`git lg -4`

```bash
* 16074ef - (HEAD -> main, origin/main) update posts git-sign-tag-commit-with-gpg (2 hours ago) <xwi88> | 2022-03-10
* e39e092 - support l2d widget (23 hours ago) <xwi88> | 2022-03-10
* 11605af - close cookie tip and update posts (24 hours ago) <xwi88> | 2022-03-09
* 9b548b6 - update posts git sign with gpg (25 hours ago) <xwi88> | 2022-03-09
```

To also show **gpg** signature info:

>`git config --global alias.lsg "log --color --graph --pretty=format:'%C(cyan)%G?%Creset %Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset | %C(red)%cs%Creset' --abbrev-commit"`

`git lsg -4`

```bash
* G 16074ef - (HEAD -> main, origin/main) update posts git-sign-tag-commit-with-gpg (2 hours ago) <xwi88> | 2022-03-10
* G e39e092 - support l2d widget (23 hours ago) <xwi88> | 2022-03-10
* G 11605af - close cookie tip and update posts (24 hours ago) <xwi88> | 2022-03-09
* G 9b548b6 - update posts git sign with gpg (25 hours ago) <xwi88> | 2022-03-09
```

For even more detail:

>`git config --global alias.llsg "log --color --graph --pretty=format:'%C(cyan)%G?%Creset %Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset | %C(red)%cs%Creset [%GK trust:%GT] %C(yellow)%GS%Creset' --abbrev-commit"`

`git llsg -4`

```bash
* G 16074ef - (HEAD -> main, origin/main) update posts git-sign-tag-commit-with-gpg (2 hours ago) <xwi88> | 2022-03-10 [C739E6A64E102CD0 trust:ultimate] xwi88 <278810732@qq.com>
* G e39e092 - support l2d widget (23 hours ago) <xwi88> | 2022-03-10 [90684042688CB9BE trust:ultimate] xwi88 <278810732@qq.com>
* G 11605af - close cookie tip and update posts (24 hours ago) <xwi88> | 2022-03-09 [90684042688CB9BE trust:ultimate] xwi88 <278810732@qq.com>
* G 9b548b6 - update posts git sign with gpg (25 hours ago) <xwi88> | 2022-03-09 [90684042688CB9BE trust:ultimate] xwi88 <278810732@qq.com>
```

{{< /admonition >}}

{{< admonition warning >}}

- **Always pass a log entry count**
- **Don't make the format too complex — output may slow down**
- **If you use `gpg signing`, make sure you don't have too many `gpg key`s**

{{< /admonition >}}

## Basic commands

>For more detail on any command, run `git <command> --help`

- `git add [<path_spec>...]` **stage files into the `Index`**
  - `git add [<path_spec>...] -n` **dry-run: show what would happen, without doing it**
- `git status -s` show the current branch status — files differ between working tree and index: `modified`, `not staged`, `staged but not committed`
- `git diff`
  - `git diff [<path>...]` diff working tree vs index
  - `git diff <commit>...<commit> [<path>...]` diff between commits
  - `git diff --cached [<commit>] [<path>...]` diff index vs repository
- `git commit` commit staged changes to the local repo
  - `git commit -m <message>` commit to local repo
  - `git commit -S -m <message>` **sign** and commit; requires your **GPG key**
  - `git commit -a -m` stage and commit all changes, skipping `git add`; generally avoid this
  - `git commit --amend` redo the latest commit — to **edit its message** or append changes; **don't chain this**, and **avoid it for already-pushed commits**
- `git reset` undo changes; see [checkout vs reset](#checkout-vs-reset)
- `git rm` remove files from the index and working tree
- `git mv <old> <new>` *file rename*; equivalent to `mv old new`, `git add` the new file and `git rm` the old

## Branch operations

### Remote branch config

- `git remote -v`
- `git remote add <name> <url>` add a remote
- `git remote rename <old> <new>` rename a remote
- `git remote set-url <name> <new_url>` change a remote URL

### Cloning

- `git clone -b branch_name --single-branch <url>` single-branch clone
- `git clone <url> [dir]`

### Fetch & sync

- `git fetch --all` || `git merge` only fetch into the **local remote-tracking branch** (e.g. `origin/main`, `upstream/main`); merge into the local branch later when needed
- `git pull` fetch and merge the remote branch into the current branch; generally avoid unless you understand the consequences
- `git push -u <repo_name> <branch_name>` set up tracking between a new local branch and a remote branch — **typically for a new branch's first push**

### checkout vs reset

- `git checkout`
- `git reset`
- `git revert` **rarely used on the CLI**

|Git Command|Scope|Common use cases|
|:---|:---|:---|
|reset|Commit|Discard commits in a private branch or throw away uncommited changes|
|reset|File |Unstage a file|
|checkout|Commit|Switch between branches or inspect old snapshots|
|checkout|File|Discard changes in the working directory|
|revert|Commit|Undo commits in a public branch|
|revert|File|(N/A)|

{{< admonition info >}}
> `--soft` The staged snapshot and working directory are not altered in any way.
>
> `--mixed` The staged snapshot is updated to match the specified commit, but the working directory is not affected. This is the default option.
>
> `--hard` The staged snapshot and the working directory are both updated to match the specified commit.
{{< /admonition >}}

### Merging & committing

>For multi-person or large-team collaboration, master and use `git rebase`, and keep each branch's commit count vs the **base** branch **minimal** — easier rebases and conflict resolution for everyone.
>
>If you've opened a `PR`/`MR`, before **reviewers** review, make sure your branch is `Fast-Forward` vs the **base**; do not **Rebase** from the web UI.

- `git rebase` **use with care** [demo](https://mp.weixin.qq.com/s?__biz=MzIzODY3NjQ0OA==&mid=2247483733&idx=1&sn=5adc1d9d1a241ffc3565c47d7f924125&chksm=e934f1dade4378cc630dca0d1655db42418e983e08e9e6779d2f0895189ec85ae45f4751bae0&token=281138563&lang=zh_CN#rd)
- `git merge` ~~**not recommended**~~

### Branch push & delete

- `git push` push the current branch; requires tracking a remote branch; for the first push use `git push -u <name> <branch>`
- `git push -f` force-push the current branch to its remote
- `git push -f <name> :<remote_branch>` push an empty branch to the remote — i.e. **delete the remote branch**
- `git branch -d` delete a local branch

## Unset config

>**Remove the line matching the key from config file.**

- `git config --global --unset [key]` remove from global config
- `git config --unset [key]` remove from project config

{{< admonition example >}}
*Remove a mistakenly-created entry from global config*

`git config --global --unset alias.llg`
{{< /admonition >}}

## Edit config files

- `git config --global -e` edit the global config file at `~/.gitconfig`
- `git config -e` edit the project config file at `.git/config`

## References

- [git docs](https://git-scm.com/docs)
- [Git-Basics-Git-Aliases](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases)
- [Git-Commands-Basic-Snapshotting](https://git-scm.com/book/en/v2/Appendix-C:-Git-Commands-Basic-Snapshotting)
- [Signing Git commits/tags with GPG](/git-sign-tags-commits-with-gpg/)

