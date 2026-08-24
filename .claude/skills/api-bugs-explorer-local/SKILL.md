---
name: api-bugs-explorer-local
description: Investigates and fixes API bugs on the local Pismo stack by tracing across both /back (Kotlin/Spring Boot/GraphQL/jOOQ) and /front (React/TypeScript) code, using the local Docker containers (postgres, app, front from the root docker-compose.yml) to reproduce the bug, read logs, and re-verify the fix. Use this whenever the user reports something broken while testing locally — a pasted error message or stack trace, a GraphQL/curl request+response showing an error, a screenshot of a browser console or network tab, or a plain description like "wallet top-up returns 500" or "the forum page shows nothing after I post" — even if they don't explicitly say "debug", "investigate", or "bug". Also use this whenever the user names a bug to investigate by its title instead of describing it inline (e.g. "investigate the bug 'Wallet top-up returns 500'", "fix the forum bug from the todo list", "pick up the next bug") — the real report lives in the "Todo List" Notion database and needs to be pulled before any investigation starts. Always check container health/logs and try to reproduce the request directly against localhost before diagnosing; present the root cause and proposed fix and wait for the user to confirm before editing any code, then rebuild the affected container and re-run the reproduction to prove the fix actually works, not just that it compiles.
---

# API Bugs Explorer (Local)

Debugs a real, currently-reproducible bug on the local stack — not a code
review and not a feature request. The point of the extra rigor below
(reproduce independently, read container logs, confirm before fixing,
re-verify after) is that a live system with real state in the postgres
volume punishes guessing far more than a normal feature task does: a wrong
guess here means editing the wrong file while the actual bug ships, or
"fixing" something that re-verification would have shown was already fine.

## Take the report as given

The user's report can arrive as pasted error text or a stack trace, raw
curl/GraphQL request+response output, a screenshot of a browser console or
network tab, or just a plain description ("wallet top-up returns 500").
Don't insist on a particular format — pull out what's identifiable: which
endpoint/query/mutation, what request was sent, what response or error came
back, and roughly which page/flow triggered it if it looks frontend-shaped.
If a screenshot truncates the actual error text, ask the user to expand or
paste it rather than guessing at what's cut off.

## Or pull the report from Notion

If you were given a bug's **name/title** instead of an inline report (e.g.
"investigate the bug 'Wallet top-up returns 500'", "fix the next bug in the
list"), a title alone isn't enough to reproduce or diagnose anything — the
real report lives in the **Todo List** database in Notion, the same
database the backend/frontend task-implementor skills pull from. Fetch it
before doing anything else. Skip this section entirely if you were already
given a full report inline.

Notion is reached through an MCP connector, so its tools won't be in your
toolset by default — use ToolSearch (query: `notion`) to find and load
them. Typical shapes to expect (exact names vary by connector version): a
search or query-database call to find the page in the Todo List database
whose title matches, and a get-page/get-page-content call to read its body.

- Match on title. If nothing matches exactly, look for close matches
  (typos, partial names) and confirm with the user which one they meant
  rather than guessing — investigating the wrong bug wastes a full
  reproduce/diagnose cycle.
- Read the full page content, not just the title — the actual repro steps,
  expected vs. actual behavior, error text, or screenshots usually live in
  the body, not a summary property. Treat that body as the report and feed
  it into the rest of this workflow exactly as you would a pasted report.
- If the page links to other pages (a related feature spec, a linked
  screenshot), pull in whatever's needed to reproduce the bug, but don't
  wander further than the bug itself needs.
- This lookup is read-only for now — don't change status, add comments, or
  edit the page yet. Hold onto its id/url; if you end up applying a fix
  (see "Diagnose, then stop and confirm" below), close the task out
  afterward the same way frontend-task-implementor does: once the fix is
  verified, set Status to **Done** on this page (Todo List's options are
  "Not started" / "In progress" / "Done"). Don't mark it Done if you
  couldn't reproduce the bug, the fix isn't verified, or you're still
  waiting on the user to confirm something.

## Check the containers are actually up

The compose file lives at the repo root (`docker-compose.yml`) with three
services: `postgres`, `app` (the Spring Boot backend, port 8080), and
`front` (the built React app served via nginx, port 80). Before digging
into code:

```
docker compose ps
```

If a service isn't `Up`/healthy, that might *be* the bug, or a symptom of
it — check `docker compose logs <service> --tail=100` for why before
assuming the report describes an application-code bug. If nothing is
running, start it: `docker compose up -d --build` (rebuild, in case local
code has changed since the images were last built).

## Reproduce it yourself when you can

Don't take the report purely on faith — replaying it independently confirms
the bug is still current and gives you the exact error instead of a
possibly-lossy paraphrase or a partial screenshot.

- **Backend/GraphQL**: POST directly against the running app, e.g.
  `curl -s http://localhost:8080/graphql -H "Content-Type: application/json" -d "{\"query\":\"...\"}"`.
  Check `back/src/main/resources/graphql/*.graphqls` for the real
  query/mutation shape if you're unsure — don't guess field names.
- **DB state**: `docker compose exec postgres psql -U pismo -d pismo -c "..."`
  to check whether a mutation actually persisted what it claims to, or
  whether the data driving the bug looks like what you'd expect.
- **Frontend-originated symptoms** (wrong data displayed, broken
  interaction, nothing network-visible) generally can't be curled — trust
  the user's description/screenshot for those and trace from the relevant
  page/component instead of trying to force a repro that doesn't fit.

If you can't reproduce it (stale report, timing-dependent, needs auth state
you don't have), say so rather than quietly proceeding as if you had — it
changes how much confidence the eventual diagnosis deserves.

## Read the logs

`docker compose logs app --tail=200` (swap `app` for `postgres` or `front`
as relevant) is usually where the real exception and stack trace live,
especially for a 500 the frontend only ever sees as an opaque error. Look
around the timestamp of your repro request, or for the error signature the
user already gave you.

## Trace the bug across the stack

This app is full-stack by construction — GraphQL resolver → service → jOOQ
repository on the backend, API service → Zustand store → component on the
frontend — so the fix isn't necessarily on the side where the symptom
showed up. A frontend "cannot read properties of undefined" can be the
backend returning a null field nothing guarded against; a backend 500 can
be the frontend sending a malformed variable. Follow the actual call path
rather than assuming the layer that surfaced the error is the layer at
fault:

- **Frontend symptom** → check `front/src/services/<domain>/` for the
  GraphQL call, then cross-check it against
  `back/src/main/resources/graphql/<domain>.graphqls` for the real schema —
  the two can drift out of sync.
- **Backend error** → resolver → `<Domain>ServiceImpl` →
  `Jooq<Domain>Repository`, checking the matching Flyway migration under
  `back/src/main/resources/db/migration/` for the actual table/column
  names. There's no jOOQ codegen wired up, so the repository layer targets
  hand-declared table/field constants — a typo'd or renamed column that the
  repository didn't get updated for is a common root cause here.

## Diagnose, then stop and confirm

Once you've found the root cause, present it before touching any code: what
is actually wrong, which file(s), and the fix you're proposing. Wait for
the user to confirm. This is deliberately different from a normal
feature-implementation task — you're working against a live system with
real data sitting in the postgres volume, so a speculative fix is a real
risk, not just wasted effort.

## Apply the fix

Once confirmed, make the change following this project's existing
conventions — `context/back/style.md` and `context/front/style.md` are
authoritative (no comments, SOLID/DRY/KISS where it earns it, no tests).
Keep the change scoped to the actual bug: this is a fix, not an invitation
to refactor the surrounding code or add defensive handling for scenarios
the report never showed you.

## Verify

1. **Static check**: `./gradlew build -x test` from `/back` if backend code
   changed; `npm run build && npm run lint` from `/front` if frontend code
   changed.
2. **Rebuild the affected container(s)**: `docker compose up -d --build <service>`.
3. **Re-run the exact reproduction from earlier** (same curl call, same DB
   check) and confirm the original symptom is actually gone. A clean build
   is necessary but not sufficient — the bug lived in behavior, not syntax,
   so only re-running the repro proves it's fixed.

## Close the Notion bug, if this came from one

Skip this entirely if the report was given inline and you never looked
anything up in Notion. Otherwise, now that verification in the step above
actually passed, set the page's Status to **Done** using the id/url you
held onto earlier. Don't mark it Done — leave it as-is — if verification
failed, the fix is only partial, or you're still waiting on the user for
something.

## Summary to the user

Close with: the root cause in a sentence or two, which file(s) changed, and
confirmation that re-running the original reproduction now succeeds. If you
couldn't reproduce the bug independently, say so explicitly and note that
the build/lint checks are the only verification you were able to do. If the
report came from Notion, say which page you matched it to and whether you
marked it Done.
