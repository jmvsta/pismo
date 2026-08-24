---
name: frontend-task-implementor
description: Implements frontend features/tasks in the /front React + Vite + TypeScript project — wiring up state (Zustand), API/data calls, business logic, and reusable components behind pages. Use this whenever the user asks to implement, add, or wire up frontend behavior: connecting a page to the backend GraphQL API, adding state management, building a reusable component, or describes a feature that needs client-side logic (e.g. "wire up the register form to the backend", "add a store for the wallet balance", "make the forum page fetch real threads") — even if they don't say "frontend" explicitly, as long as the work belongs in /front rather than /back. Also use this whenever the user names a task to implement by its title instead of describing it inline (e.g. "implement 'Add wallet top-up mutation'", "do the next item in the todo list", "pick up the forum task") — the task's real description lives in the "Todo List" Notion database and needs to be pulled before any code gets written. Not for turning a claude-design mockup/layout into a page from scratch — that's frontend-layout-maker; this skill picks up from there (or from a plain new-page request) to wire in the actual logic.
---

# Frontend Task Implementor

Implements a frontend task as clean, layered React/TypeScript — not a quick
prototype. The style rules below exist because this codebase is going to
accumulate a lot of small features over time, and consistency across them
matters more than any single task being clever.

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
- Hold onto the matched page's id/url. This lookup step itself stays
  read-only — don't change status, add comments, or edit the page yet —
  but you'll need that id later to close the task out once the work is
  actually done (see "Close the Notion task" below).

## Is this actually a layout conversion?

If the task is really "turn this /layouts mockup into a page" with no
behavior beyond markup/styling, that's `frontend-layout-maker`'s job, not
this skill's — defer to it. This skill is for the layer on top: state, API
wiring, and business logic behind a page, whether that page was just
scaffolded by the layout skill or already exists. A task can legitimately
need both — layout skill first for the shell, this skill after for making
it work — but don't reimplement markup this skill has no reason to touch.

## Before writing code

Read `context/front/style.md` — it holds the project's actual conventions
(SOLID/DRY/KISS expectations, state/service layout, styling approach, the
verification command) and is the source of truth if anything here goes
stale. What follows is the reasoning behind those conventions; treat
style.md as authoritative if the two ever disagree.

Check `back/src/main/resources/graphql/*.graphqls` for the schema of
whatever query/mutation the task needs to call — don't guess field names or
types against the backend. If the task needs a query/mutation that doesn't
exist yet on the backend, say so rather than inventing a shape and hoping.

## Structure

- **Components stay functions.** Every component — page or reusable — is a
  function component using hooks. This holds even where the layer below
  uses classes; the "OOP" part of this skill lives in services, not JSX.
- **Services carry the OOP split.** API/data-access code is an interface
  plus one implementing class per domain (e.g. `AuthService` /
  `GraphqlAuthService`) under `src/services/<domain>/`, mirroring the
  backend's Service/ServiceImpl pattern — components and stores depend on
  the interface, never the concrete client directly. Don't invent an
  interface for something that will only ever have one shape; that's
  ceremony, not SOLID.
- **State lives in Zustand, scoped by domain.** One store per domain under
  `src/store/<domain>Store.ts` (not one giant store), holding state that's
  shared across components or outlives one component's lifecycle — auth
  session, current user, wallet balance, thread lists. Purely local UI
  state (an input's draft value, whether a dropdown is open) stays as
  `useState` in the component; don't lift it into a store just because a
  store exists for the domain.
- **Reusable UI goes in `src/components/`.** The moment a second page needs
  a button/input/card/form-field treatment that already exists elsewhere,
  extract it instead of copy-pasting markup and classes — see the existing
  `pages/*/*.css` files for the kind of duplication (`.btn`, `.input`,
  `.field`) this should replace going forward.
- **Domain models are plain TypeScript interfaces/types**, colocated with
  the domain (`src/services/<domain>/types.ts` or similar), mapped from
  GraphQL responses at the service boundary — don't let raw GraphQL
  response shapes leak into components or stores.

## Style, applied

- **SOLID, in service of change, not ceremony.** The service
  interface/impl split is the main place this shows up. Don't add
  additional interfaces or abstraction layers beyond that unless the task
  genuinely has more than one implementation in play.
- **DRY without over-abstracting.** Extract a shared component or hook once
  something is genuinely reused — not preemptively for a single use site.
- **A pattern earns its place by fitting the problem**, not by being added
  because the rules mention patterns.
- **No comments.** Push clarity into naming and small functions instead of
  explaining code with prose next to it.
- **No enormous components or functions.** If a component is doing more
  than one distinct thing (fetching, deriving, rendering a form, rendering
  a list), split it into smaller named pieces.
- **No tests.** Don't write unit or integration tests for the task.

## Styling

Tailwind CSS utility classes in JSX — see `context/front/style.md` for
setup details if Tailwind isn't wired into `/front` yet. Don't write a new
per-component `.css` file for anything this skill touches; the existing
`pages/*/*.css` files predate this convention and don't need to be
rewritten just because you touched a neighboring component.

## Verify before finishing

From `/front`, run:

```
npm run build
npm run lint
```

Both must pass clean — a failing build or lint error is not a caveat to
mention, it's something to fix before calling the task done.

## Close the Notion task

If the task came from Notion (you did the lookup in "Getting the task's
real content" above), close it out now that build and lint both pass —
skip this section entirely if you were given the task inline and never
looked anything up in Notion. Use the page id/url you held onto earlier;
find/load the Notion update tool via ToolSearch if it isn't already loaded.

Task pages commonly break the work into subtasks as a checklist in the page
**body** (`- [ ] ...` to-do items), not as a separate property or linked
page. Check off (`- [x]`) every item the implementation actually covers —
don't just flip the Status property and leave the checklist stale. If a
checklist item genuinely isn't covered by what you built, leave it
unchecked and treat the task as partially done (see below) rather than
checking it off anyway.

Once every checklist item in the body is checked, set the page's
**Status** property to **Done** (the Todo List database's status options
are "Not started" / "In progress" / "Done"). Checking off body items and
setting Status are the only edits allowed here — don't add comments,
don't touch anything else in the page body, don't rename anything.

Don't mark the task Done — and leave any unchecked subtask unchecked — if
build or lint failed, if the task is only partially done, or if you had to
stop and ask the user something that's still unresolved. An incomplete
task marked Done, or a Done task with unchecked subtasks left behind, is
worse than one left visibly open.

## Summary to the user

Close with: which files were added/changed, the domain/layer they live in
(component/store/service), any GraphQL query/mutation the frontend now
calls, and any judgment call worth flagging (e.g. a service interface added
because a second data source is realistically coming, or a component
extracted because a second page needed it). If the task came from Notion,
say which page you matched it to and confirm you marked it Done.
