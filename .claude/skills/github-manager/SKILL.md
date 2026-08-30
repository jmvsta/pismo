---
name: github-manager
description: Uses the GitHub MCP server (mcp__plugin_github_github__*) to operate directly on the jmvsta/pismo GitHub repo from Claude Code — creating/updating issues and sub-issues, opening/reviewing/merging pull requests, requesting Copilot reviews, resolving review threads, checking CI/check-run status, creating branches, and committing or pushing files (including .github/workflows/*.yml, CODEOWNERS, issue/PR templates, dependabot config) straight to GitHub. Also covers read-only lookups: releases, tags, commits, teams, collaborators, code/issue/PR search. Use this whenever the user wants to open a PR, file or triage an issue, review or merge a PR, push a branch/commit straight to GitHub, edit a workflow or repo config file via the API, check whether CI passed on a PR, or otherwise "do something on GitHub" for this repo — even if they just say "open a PR for this" or "make an issue for that bug" without naming GitHub explicitly. Also use this whenever the user names a GitHub-flavored task by its code/title instead of describing it inline (e.g. "implement P-D-0", "do the next devops task", "pick up the CI task from the todo list") — the task's real description lives in the "Todo List" Notion database and needs to be pulled before any GitHub changes get made. Does NOT cover GitHub Projects (boards), branch protection/rulesets, repository settings (visibility, default branch, merge options), Actions workflow runs/secrets/dispatch, creating releases/tags, managing collaborators, or creating new labels — the MCP server has no tools for those; this skill says so plainly instead of improvising a workaround.
---

# GitHub Manager (jmvsta/pismo)

This wraps the GitHub MCP server tools (all prefixed `mcp__plugin_github_github__`),
which call the real GitHub API directly — not local git. There's no staging
step and no dry run: a write call here (a comment, an issue, a merge, a
pushed file) lands on the live repo the moment you make it. Treat these
differently from local `git`/`gh` commands run through Bash, which at least
stay local until pushed.

## Getting the task's real content

If you were given a task **name/code** rather than a description (e.g.
"implement P-D-0", "do the next devops task", "pick up the CI task"), the
actual scope lives in the **Todo List** database in Notion — the same
database the backend/frontend-task-implementor skills pull from. A code
alone isn't enough to know what to actually do on GitHub, so fetch the real
content before touching anything. Skip this section entirely if you were
already given a full description inline.

Notion is reached through an MCP connector, so its tools won't be in your
toolset by default — use ToolSearch (query: `notion`) to find and load them.
Typical shapes to expect: a search or query-database call to find the page
in the Todo List database whose title/code matches, and a get-page call to
read its full body once found.

- Match on the code/title. If nothing matches exactly, look for close
  matches and confirm with the user which one they meant rather than
  guessing — implementing the wrong GitHub change (a workflow file, a PR, an
  issue) is live the moment it's made, so a wrong guess isn't cheap to undo.
- Read the full page content, not just the title — the actual scope
  (which files, which repo behavior, acceptance criteria) usually lives in
  the body.
- This lookup is read-only. Don't change the task's status, add comments, or
  edit the Notion page while fetching it — only after the GitHub-side work
  below is actually done and verified, the same way backend/frontend-task-
  implementor close out their tasks.

## Load the tools you need

The github MCP tools are deferred — not preloaded — so load them with
`ToolSearch` before calling them, batched in one call for the task at hand
rather than one at a time. Common groupings:

- **Issues**: `select:mcp__plugin_github_github__issue_write,mcp__plugin_github_github__issue_read,mcp__plugin_github_github__list_issues,mcp__plugin_github_github__search_issues,mcp__plugin_github_github__add_issue_comment,mcp__plugin_github_github__sub_issue_write,mcp__plugin_github_github__list_issue_fields,mcp__plugin_github_github__list_issue_types,mcp__plugin_github_github__get_label`
- **Pull requests**: `select:mcp__plugin_github_github__create_pull_request,mcp__plugin_github_github__pull_request_read,mcp__plugin_github_github__update_pull_request,mcp__plugin_github_github__update_pull_request_branch,mcp__plugin_github_github__merge_pull_request,mcp__plugin_github_github__pull_request_review_write,mcp__plugin_github_github__add_comment_to_pending_review,mcp__plugin_github_github__add_reply_to_pull_request_comment,mcp__plugin_github_github__request_copilot_review,mcp__plugin_github_github__list_pull_requests,mcp__plugin_github_github__search_pull_requests`
- **Files/branches/commits**: `select:mcp__plugin_github_github__create_branch,mcp__plugin_github_github__get_file_contents,mcp__plugin_github_github__create_or_update_file,mcp__plugin_github_github__push_files,mcp__plugin_github_github__delete_file,mcp__plugin_github_github__list_branches,mcp__plugin_github_github__list_commits,mcp__plugin_github_github__get_commit,mcp__plugin_github_github__search_code,mcp__plugin_github_github__search_commits`
- **Repo/org info (read-only)**: `select:mcp__plugin_github_github__list_releases,mcp__plugin_github_github__get_latest_release,mcp__plugin_github_github__get_release_by_tag,mcp__plugin_github_github__list_tags,mcp__plugin_github_github__get_tag,mcp__plugin_github_github__list_repository_collaborators,mcp__plugin_github_github__get_teams,mcp__plugin_github_github__get_team_members,mcp__plugin_github_github__get_me,mcp__plugin_github_github__search_repositories`
- **Secret scanning**: `select:mcp__plugin_github_github__run_secret_scanning`

## Which repo

Default `owner=jmvsta`, `repo=pismo` — this is the `origin` remote for this
checkout. If a task ever seems to be about a different repo (a fork, a
different project entirely), confirm with `git remote get-url origin` rather
than assuming.

## What you can actually do here

**Issues** — `issue_write` (create/update: title, body, labels, assignees,
milestone, state/state_reason, parent_issue_number to create directly under
a parent). `issue_read` for details/comments/sub-issues/parent/labels.
`sub_issue_write` to add/remove/reprioritize hierarchy. `list_issue_types` /
`list_issue_fields` show the org's custom issue types and fields (if any are
configured) so you can pass valid `type` / `issue_fields` values into
`issue_write` — but there's no tool to *define* new types or fields, only to
use ones that already exist. Same asymmetry for labels: `get_label` looks up
an existing label, and `issue_write`'s `labels` array applies existing
labels by name, but there is no create/update/delete-label tool — if the
user wants a brand-new label that doesn't exist yet, say so rather than
quietly failing or inventing a name that won't apply.

**Pull requests** — `create_pull_request`, `update_pull_request`,
`update_pull_request_branch` (sync with base), `merge_pull_request`
(merge/squash/rebase). `pull_request_read` covers get/diff/status/files/
commits/check_runs/comments/reviews/review_comments — `get_check_runs` is
how you answer "did CI pass on this PR." `pull_request_review_write` creates
a review (immediate if `event` is set, pending otherwise), submits or
deletes a pending review, and resolves/unresolves review threads by node ID
(get thread IDs from `get_review_comments`). `add_comment_to_pending_review`
attaches an inline comment before submitting; `add_reply_to_pull_request_comment`
replies on an existing thread. `request_copilot_review` is a good automated
first pass before pulling in a human reviewer.

**Files, branches, commits — this is the real lever for "project config"** —
`create_branch`, `create_or_update_file` (needs the file's blob `sha` when
updating something that already exists — get it via `get_file_contents`
first), `push_files` for several files in one commit, `delete_file`. Use
these for anything GitHub treats as *a file in the repo*: workflow YAML
under `.github/workflows/`, `CODEOWNERS`, issue/PR templates,
`dependabot.yml`/`renovate.json`, `.editorconfig`. `search_code` helps find
where something already lives before editing blind; `list_commits` /
`get_commit` / `search_commits` for history.

**Read-only lookups** — `list_releases` / `get_latest_release` /
`get_release_by_tag` / `list_tags` / `get_tag` (no creation tool exists —
you can report on releases, not cut one), `list_repository_collaborators` /
`get_teams` / `get_team_members` (no add/remove), `search_repositories`,
`get_me`.

**Secret scanning** — `run_secret_scanning` scans raw content or a diff you
pass in directly, not the whole repo. Good to run over a file's new content
before pushing it.

## What this can't do — say so, don't improvise

There are no tools for: **GitHub Projects** (boards/ProjectV2 — nothing at
all), **branch protection or rulesets**, **repository settings** (visibility,
default branch, merge-strategy toggles — `create_repository` and
`delete_repository` exist but nothing updates an existing repo's settings),
**Actions workflow runs, dispatch, secrets, or variables** (you can edit the
workflow *YAML file* through the file tools above, but you can't list runs,
trigger one, or manage secrets — `get_check_runs` shows check results, which
is adjacent but not the same as the Actions tab), **creating releases or
tags**, **adding/removing collaborators or changing permissions**, and
**creating new labels**.

This machine also has no `gh` CLI installed, so there's no fallback path for
any of the above. If the user asks for one of these, say plainly that
current tooling can't do it and point them at the GitHub web UI — don't fake
it with a file edit that wouldn't actually take effect, and don't silently
skip the request.

## Before you act

Confirm with the user before: `merge_pull_request`, `delete_repository`,
`delete_file`, `update_pull_request_branch`, closing an issue/PR via a state
change, and anything with real written content going out publicly (an issue
body, a PR description, a review comment) that the user hasn't seen yet.
Plain `get_*`/`list_*`/`search_*` reads don't need confirmation. This is the
same "hard to reverse or visible to others" judgment call as anywhere else —
it just applies more often here because every write is already live on the
real repo, not a local draft.
