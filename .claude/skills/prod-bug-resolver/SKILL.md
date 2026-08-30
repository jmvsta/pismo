---
name: prod-bug-resolver
description: Resolves bugs reported from the deployed production Pismo site (the Contabo VPS running docker-compose.prod.yml) end-to-end — diagnose, fix, verify with a real build, record what was learned, and ship the fix as its own pull request. Use this whenever the user reports something broken in production or on the live/deployed site ("prod is throwing 500s on X", "customers can't log in on the live site", "this is broken after the last deploy"), or names a production bug task by title/code instead of describing it inline — the real report and any subtasks live in the "Todo List" Notion database and need to be pulled first. Also use this whenever the user asks to open a PR that fixes a bug, wants a bug's Notion task (and its subtasks) closed out once fixed, or wants prod bugs handled "one PR per bug." Differs from api-bugs-explorer-local, which only debugs against the local docker stack and never touches git/Notion task-closing/PRs: reach for this skill instead whenever git, a pull request, or a Notion task with subtasks is part of what "done" means. Never merges the resulting PR itself — the finished, building, verified PR is the deliverable, and a human merges it.
---

# Prod Bug Resolver

Turns a production bug report into a merge-ready pull request: diagnose,
fix, verify with an actual build, write down anything non-obvious that was
learned, and open one PR per bug — never merging it. The extra process here
(compared to just editing code) exists because a prod bug report is further
from the code than a local repro: there's no SSH access to the Contabo VPS
from this environment, no direct read on production logs, and any fix has
to survive review and an automatic deploy before it's actually live. That
distance is exactly why diagnosis needs to be justified before code changes,
why "the build passed" is the bar rather than "it compiles," and why the
task only closes once a PR embodying the fix actually exists.

## Get the real report

The report can arrive inline (pasted error text, a stack trace, a
description like "wallet top-up returns 500 in prod") or as a **task
name/code** instead ("fix the prod bug about registration", "pick up
PROD-4"). A bare name isn't enough to diagnose anything — the real report,
and any subtasks, live in the **Todo List** database in Notion, the same
one the task-implementor and api-bugs-explorer-local skills read from.

Notion is reached through an MCP connector, not preloaded — use ToolSearch
(query: `notion`) to find and load it. Typical shapes: a search/query-database
call to find the page whose title/code matches, then a get-page call for the
full body.

- Match on title/code; if nothing matches exactly, confirm with the user
  before proceeding rather than guessing — this skill ends in a pushed
  branch and an open PR, which is a lot more to undo than a wrong local
  edit.
- Read the full body, not just the title — repro steps, expected/actual
  behavior, and error text usually live there.
- **Look for subtasks.** Todo List entries can carry children as a
  sub-items/sub-tasks relation property (linked child pages) and/or as
  checklist items inside the page body itself. Note every one you find now
  — you'll need to check them off individually once the fix is verified, not
  just flip the parent to Done. The exact property name varies by workspace,
  so inspect the page's actual schema rather than assuming a name.
- This lookup is read-only for now. Don't touch status or checkboxes until
  the fix is verified and the PR exists (see "Close the task" below).

If you were handed a full report inline and never touched Notion, skip
straight to diagnosing — there's nothing to close later either.

## Reproduce against the local stack (prod itself is out of reach)

There's no SSH/API access to the Contabo VPS from here, so treat the local
docker stack (`docker compose ps`, `docker compose logs <service>`, direct
`curl`/GraphQL calls against `localhost:8080`) as the closest available
stand-in for what's actually running in production — the same
`back`/`front` Dockerfiles ship to both. `docker compose up -d --build` if
nothing is running.

- Reproduce the reported symptom locally before diagnosing anything. If you
  can't — the bug depends on prod-only data, timing, or config the local
  stack doesn't have — say so plainly and note it in the eventual PR
  description; don't fake confidence you don't have.
- If the user can paste actual production log lines or a prod
  request/response, treat those as higher-signal than the local repro and
  use them to sanity-check whatever you find locally.

## Diagnose, then stop and confirm

Trace the bug across the stack the same way any full-stack bug requires —
GraphQL resolver → service → jOOQ repository on the backend, API service →
Zustand store → component on the frontend — since the layer where the
symptom shows up often isn't the layer at fault. Check the relevant Flyway
migration under `back/src/main/resources/db/migration/` before trusting any
table/column name; there's no jOOQ codegen, so a stale hand-written constant
is a common root cause.

Once you have a root cause, present it — what's wrong, which file(s), the
fix you're proposing — and wait for the user to confirm before touching
code. This matters more here than for a purely local bug: the diagnosis is
built on a local stand-in for prod plus whatever the report contained, so
it deserves a sanity check before you commit to a branch and a PR around it.

## Start a clean branch for this task

Each bug gets its own branch cut from an up-to-date `master`, even if
you're working through several bugs in the same conversation — don't stack
one bug's fix on top of another's uncommitted branch:

```
git fetch origin
git checkout master && git pull
git checkout -b <branch-name>
```

Name the branch after the task's code if Notion gave you one (matching the
existing convention, e.g. `prod-0-register-security-fix`), or a short
kebab-case slug of the bug if not (e.g. `prod-fix-wallet-topup-500`).

## Apply the fix

Follow this project's existing conventions — `context/back/style.md` and
`context/front/style.md` are authoritative (interface+impl split, package
by domain, no comments, no tests). Keep the change scoped to the actual
bug: this is a fix landing in a reviewable PR, not an invitation to refactor
what you're passing through.

## Verify with a real build

A production-bound fix needs more confidence than "it compiles against my
guess" — this is the gate before anything gets pushed:

1. Backend changed: `./gradlew build -x test` from `/back`.
2. Frontend changed: `npm run build && npm run lint` from `/front`.
3. Rebuild the affected local container(s) (`docker compose up -d --build
   <service>`) and re-run the exact reproduction from earlier — a clean
   build is necessary but doesn't by itself prove the symptom is gone.

Don't move on to committing/pushing on a build you haven't actually run, and
fix anything that fails rather than noting it as a caveat in the PR.

## Record anything worth remembering

Once the fix is verified, check whether what you just learned is worth
keeping for next time — a non-obvious root cause, a schema/config drift
between local and prod, a gotcha in how the two stacks diverge. Most
one-line typo fixes aren't; a "the frontend and GraphQL schema had drifted
on this field" or "prod's compose file sets an env var local doesn't" is.

Append an entry to `context/prod-bugs-findings.md` (create it with a
one-line header if it doesn't exist yet) in this shape:

```
### <bug title> — <branch name>
- Symptom: ...
- Root cause: ...
- Fix: `path/to/file` — one-line description
- Worth remembering: ... (only if there's a real gotcha; omit otherwise)
```

Skip this step entirely if there's genuinely nothing beyond "found a typo,
fixed it" — the file is only useful if it stays a list of things that
would otherwise get rediscovered the hard way.

## Commit, push, and open the PR — one per task

Commit only once the build in the step above actually passed:

```
git add <changed files>
git commit -m "..."
git push -u origin <branch-name>
```

There's no `gh` CLI on this machine, so the pull request itself goes
through the GitHub MCP tools (same ones the github-manager skill uses,
prefixed `mcp__plugin_github_github__`) — load
`mcp__plugin_github_github__create_pull_request` via ToolSearch if it's not
already loaded, then open the PR against `master` with:

- A title naming the bug (and its task code, if any).
- A body summarizing: symptom, root cause, files changed, how it was
  verified (local repro + which build command passed), and a link back to
  the Notion task if there was one. Flag plainly if you couldn't reproduce
  locally and are relying on the report/logs alone.

If `git push` fails because this checkout has no push credentials to
`origin`, fall back to the GitHub MCP file tools (`create_branch` +
`push_files`/`create_or_update_file`) to get the branch and commit onto
GitHub directly, then open the PR the same way.

**Never merge the PR, approve it, or update its branch** — the open,
building, verified PR is the deliverable. A human reviews and merges it,
which is also what actually triggers the deploy (CI only builds/deploys on
push to `master`).

Handling more than one bug in this conversation means repeating this whole
loop per bug — its own branch, its own PR — not batching several fixes into
one.

## Close the task and its subtasks

Only if the report came from Notion. Now that the PR is open and the build
passed, set Status to **Done** on the task page, and do the same on every
subtask you found earlier (each linked sub-item page, and/or each checklist
item inside the body) — a parent marked Done with unchecked children just
moves the confusion instead of resolving it. Don't close anything if the
build failed, you couldn't verify the fix, or the user hasn't confirmed the
diagnosis yet.

## Summary to the user

Close with: root cause, files changed, which build/verification commands
passed, the PR (branch name / link if the tool returned one), and whether
you closed a Notion task (and how many subtasks). If you couldn't reproduce
the bug locally, say so explicitly rather than letting the PR speak for
overall confidence it doesn't have.
