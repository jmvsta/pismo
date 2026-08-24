---
name: backend-task-implementor
description: Implements backend features/tasks in the /back Kotlin + Spring Boot + GraphQL + jOOQ project — resolvers, services, repositories, GraphQL schema. Use this whenever the user asks to implement, add, or wire up a backend endpoint, GraphQL query/mutation, service, or repository, or describes a feature that needs server-side code (e.g. "implement user registration", "add a mutation to submit questionnaire answers", "wire up the forum endpoints") — even if they don't say "backend" explicitly, as long as the work belongs in /back rather than /front. Also use this whenever the user names a task to implement by its title instead of describing it inline (e.g. "implement 'Add wallet top-up mutation'", "do the next item in the todo list", "pick up the forum task") — the task's real description lives in the "Todo List" Notion database and needs to be pulled before any code gets written.
---

# Backend Task Implementor

Implements a backend task as clean, layered Kotlin — not a quick script,
not a test suite. The style rules below exist because this codebase is
going to accumulate a lot of small features over time, and consistency
across them matters more than any single task being clever.

## Getting the task's real content

If you were given a task **name** rather than a description (e.g. "implement
'Add wallet top-up mutation'", "do the next item in the todo list"), the
actual scope lives in the **Todo List** database in Notion — a name alone
isn't enough to implement correctly, so fetch the real content before doing
anything else. Skip this section entirely if you were already given a full
description inline; there's nothing to look up.

Notion is reached through an MCP connector, so its tools won't be in your
toolset by default — use ToolSearch (query: `notion`) to find and load them.
Typical shapes to expect (exact names vary by connector version): a search
or query-database call to find the page in the Todo List database whose
title matches the given name, and a get-page/get-page-content call to read
its body once found.

- Match on title. If nothing matches exactly, look for close matches (typos,
  partial names) and confirm with the user which one they meant rather than
  guessing — implementing the wrong task is worse than asking.
- Read the full page content, not just the title — acceptance criteria,
  notes, or linked context often live in the body, not a summary property.
- This is read-only. Don't change the task's status, add comments, or edit
  the Notion page — pulling the description is the only thing this step
  does.

## Before writing code

Read `context/back/style.md` — it holds the project's actual conventions
(SOLID/KISS expectations, package layout, jOOQ approach, the verification
command) and is the source of truth if anything here goes stale. What
follows is the reasoning behind those conventions; treat style.md as
authoritative if the two ever disagree.

Identify which domain the task belongs to (user/identity, questionnaire,
matching/pen-pals, letters, forum, badges, wallet/billing — see the Flyway
migrations under `back/src/main/resources/db/migration/`, named
`V00N__<domain>.sql`) and **read the relevant migration file** before
writing any query. There's no jOOQ codegen wired up yet, so table and
column names have to be copied correctly by hand — guessing them compiles
fine and fails at runtime.

## Structure

Package by domain, not by layer: `com.jvmvstv_v.back.<domain>.*`. Within a
domain, three layers:

- **Resolver** (`@Controller` with `@QueryMapping`/`@MutationMapping`) —
  thin. Its job is binding GraphQL arguments to a service call and mapping
  the result back, not decisions.
- **Service** — an interface plus one implementation
  (`FooService` / `FooServiceImpl`). This is where business logic and
  validation live. The interface exists so the resolver (and anything else)
  depends on a contract, not a concrete class — that's what makes the
  service swappable/testable later even though nothing is testing it today.
- **Repository** — same interface/impl split, wrapping jOOQ access. Since
  there's no generated schema yet, declare the tables/fields you need as
  plain jOOQ `DSL.table(...)`/`DSL.field(...)` constants matching the
  migration, scoped to the repository that uses them (don't build a shared
  "all tables" object nobody asked for).

Domain models are plain Kotlin data classes, mapped by hand from jOOQ
`Record`s in the repository layer — keep jOOQ types from leaking past the
repository boundary.

Add or extend a `.graphqls` file per domain under
`back/src/main/resources/graphql/` for whatever queries/mutations/types the
task needs; spring-graphql merges all schema files automatically, so this
never touches another domain's file.

## Style, applied

- **SOLID, in service of change, not ceremony.** The interface/impl split
  above is the main place this shows up. Don't invent additional interfaces
  or abstraction layers beyond that split unless the task genuinely has more
  than one implementation in play.
- **A pattern earns its place by fitting the problem**, not by being added
  because the rules mention patterns. A strategy pattern for a matching
  algorithm with real variants: yes. A factory for a single data class
  constructor: no.
- **No comments.** Push clarity into naming and small methods instead of
  explaining code with prose next to it.
- **No enormous methods.** If a method has more than one distinct
  responsibility (e.g. "validate, then persist, then notify"), split it into
  named methods that each do one of those things.
- **No tests.** Don't write unit or integration tests for the task.

## Verify before finishing

From `/back`, run:

```
./gradlew build -x test
```

Tests are skipped deliberately (see `context/back/style.md` for why — the
existing context-load test needs a live datasource that isn't configured
here). A clean `BUILD SUCCESSFUL` is the bar — don't report a task done on
a build you haven't actually run, and fix anything that fails rather than
noting it as a caveat.

## Summary to the user

Close with: which files were added/changed, the domain/package they live
in, the GraphQL query/mutation signature(s) added (if any), and any
judgment call worth flagging (e.g. a pattern you chose to apply and why, or
a schema detail the migration didn't make obvious). If the task came from
Notion, say which page you matched it to — useful confirmation if the name
was ambiguous.
