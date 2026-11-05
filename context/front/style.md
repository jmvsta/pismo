# Frontend conventions

Stack: React 19, Vite, TypeScript, React Router, Zustand, Tailwind CSS.

## Code

- SOLID/DRY/KISS applied where it earns its keep, not by default.
- UI is functions. Every component is a function component using hooks —
  no class components, even though the layer below (services) does use
  classes.
- OOP where it isolates change: API/data-access code is an interface plus
  one implementing class per domain (e.g. `AuthService` /
  `GraphqlAuthService`), so components and stores depend on the interface,
  not a concrete HTTP/GraphQL client. Don't add interfaces to things that
  will only ever have one shape (a single-purpose formatter, a page
  component) — that's ceremony, not SOLID.
- DRY: pull a piece of UI into `src/components/` the moment a second page
  needs it (buttons, inputs, form fields, cards) rather than copy-pasting
  markup and classes across pages.
- KISS: reach for a pattern (strategy, factory, etc.) only when the problem
  actually has more than one variant in play.
- No comments. Names should make the comment unnecessary.
- No tests.

## State

- Zustand for any state shared across components or that outlives a single
  component's lifecycle (auth session, current user, wallet balance, forum
  thread list). Local UI-only state (an input's draft value, a toggle)
  stays as `useState` in the component — don't lift it into a store just
  because a store exists.
- One store per domain under `src/store/<domain>Store.ts`, not one giant
  global store. A store may depend on a service interface (see OOP above)
  to fetch/mutate data — depend on the interface type, and construct the
  concrete implementation once at the store's definition site rather than
  scattering `new Concrete...()` through components.

## Styling

- Tailwind CSS utility classes in JSX. Avoid writing new per-component
  `.css` files — the existing `pages/*/*.css` files predate this
  convention; don't feel obligated to rewrite them just because you touched
  a neighboring component, but any new component should be Tailwind-only.
- If Tailwind isn't installed/configured yet in `/front`, set it up first
  (`@tailwindcss/vite` plugin + `tailwind.config` content globs covering
  `src/**/*.tsx`) before writing utility classes that would otherwise do
  nothing.
- Reach for a shared component (see DRY above) before reaching for a
  one-off utility combination that's really "the app's button" again.

## Text fit

- Font size must never exceed the element it sits in. Text in a button,
  badge, tab, input or any other fixed-size control must fit inside that
  control's width and height at every viewport size — no clipped glyphs, no
  overflow, no text taller than its box.
- Size the font from the element, not the other way round: scale it with the
  container (container query units like `cqw`, or `clamp()` with a ceiling),
  or grow the element to fit the text. Never pick a font size first and let
  the control overflow.
- When checking a change, look at the narrowest supported viewport (phone
  width), not just desktop — that is where text outgrows its box first.

## About page

- A text block fills its full height: the text stretches to use the whole
  block rather than leaving empty space at the bottom.
- Exception: a text block that has a "show more" / "show less" toggle is
  collapsed to a fixed height by default. Once the user presses "show more",
  it also takes its full (expanded) height, and "show less" returns it to the
  collapsed height.
- Blocks without a toggle never get one just to meet the full-height rule —
  size the text to the block instead (see Text fit above).

## Layout

- `src/pages/<Page>/<Page>.tsx` — route-level components (existing
  pattern, keep it).
- `src/components/<Component>/` — reusable, multi-page UI components.
- `src/store/<domain>Store.ts` — Zustand stores, one per domain.
- `src/services/<domain>/` — interface + implementation for API access,
  one pair per domain (mirrors the backend's Service/ServiceImpl split).
- `src/types/` or a colocated `types.ts` — plain TS interfaces for domain
  models shared across a domain's components/store/service.

## Verification

From `/front`: `npm run build` (runs `tsc -b && vite build`) must pass
clean, and `npm run lint` should be clean too — both are fast enough to
run on every task.
