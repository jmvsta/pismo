---
name: frontend-layout-maker
description: Converts claude-design mockup exports (the .dc.html / .html files dropped in /layouts) into real React + TypeScript pages inside /front. Use this whenever the user asks to turn a layout, mockup, or design export into a frontend page or component, references a file in /layouts, mentions "claude-design", "the mockup", "the canvas export", or wants a screen from a design turned into working React code — even if they don't say "convert" explicitly (e.g. "build the registration screen", "wire up the wallet page", "make this mockup real"). Also use it to scaffold /front itself the first time it's needed.
---

# Frontend Layout Maker

Turns a design-canvas mockup into an idiomatic React page: real JSX, real CSS,
real component structure — not a pasted HTML blob. Two phases: unbundle the
export into readable markup, then rewrite it as a proper React page wired
into `/front`.

## Phase 1 — Get readable markup out of the layout file

Files in `/layouts` are almost always exports from claude-design ("download
as HTML" from a design canvas), which ship as a **self-executing bundle**:
the actual markup/CSS lives compressed inside a `<script type="__bundler/manifest">`
blob and gets reconstructed by JS at load time. Opening the file with Read
will not show you the real content — you'll just see the unpacking
bootstrap code.

Render it instead:

```
node .claude/skills/frontend-layout-maker/scripts/unbundle-layout.js "layouts/<file>"
```

This drives headless Chrome/Edge (already installed on this machine — no
download needed) to load the file, let it fully unpack, and dump the final
DOM to a temp file, stripped of the canvas runtime's own `<script>` tags and
`data-dc-tpl` markers. It prints the output path — read *that* file, not the
original. The script auto-detects plain (non-bundled) HTML too, so it's
always safe to run first regardless of what kind of file you were handed.

If the render times out or looks incomplete (still shows a loading/blank
state), re-run with a longer budget: the third arg is the virtual time
budget in ms, e.g. `... unbundle-layout.js input.html "" 15000`.

## Phase 2 — Turn the markup into a React page

**Before writing anything**, read `context/front/style.md` for this
project's frontend conventions. If it's empty or missing, fall back to the
defaults below and say so in your final summary — that file is the place to
lock in real conventions once they exist, so flagging it nudges toward
filling it in. Also check `context/layout/` for any product/design notes
(screen-to-route mapping, terminology, flow descriptions) — read what's
there if non-empty, but don't treat it as required.

### Defaults (used when style.md doesn't say otherwise)

- Stack: Vite + React + TypeScript, plain `.css` files (no CSS modules,
  no Tailwind) — one stylesheet per page component, imported directly.
- One folder per page: `front/src/pages/<PageName>/<PageName>.tsx` +
  `<PageName>.css`. `<PageName>` is PascalCase, derived from the screen's
  purpose (e.g. a registration screen → `Register`).
- Routing: `react-router-dom`, routes declared in `front/src/App.tsx` (or
  wherever the existing router lives once one exists).

### If `/front` isn't scaffolded yet

Check for `front/package.json`. If it's missing, this is the first run —
scaffold before doing anything else:

```
npm create vite@latest . -- --template react-ts   # run inside /front
npm install
npm install react-router-dom
```

Then set up a minimal router shell: `src/main.tsx` wrapping `<App />` in
`<BrowserRouter>`, and `src/App.tsx` holding a `<Routes>` block. Keep it
minimal — just enough for the first page to have somewhere to live. Later
runs will find this already in place and just add a route.

### Converting the markup

Read the unbundled HTML and rewrite it as a real component — don't wrap the
raw markup in `dangerouslySetInnerHTML`. That means:

- `class` → `className`, self-close void elements, fix up anything else
  needed to make it valid JSX.
- **Extract the inline `style="..."` attributes** the canvas tool stamps on
  nearly every element into real CSS rules in `<PageName>.css`, under
  sensible class names. Keep genuine semantic classes already present in the
  markup (e.g. `btn`, `btn-secondary`, `text-muted`) rather than renaming
  them for no reason.
- Drop canvas-tool furniture that isn't part of the actual design: things
  like a trailing "Try next: ..." suggestions line, `sc-*`/`dv-oid`-style
  scaffolding, or placeholder shimmer CSS. Use judgment — some `dv-*` or
  similarly short classes may be intentional design classes rather than tool
  chrome; skim the mockup's visible content to tell the difference rather
  than stripping by pattern alone.
- Look at what the mockup implies about behavior and rebuild it as real
  React state/handlers where it's obviously interactive (a multi-step form,
  a toggle, tabs) — don't leave it as static markup pretending to be
  interactive. Don't invent behavior the mockup doesn't suggest.
- If the layout bundle contains what's clearly **multiple distinct app
  pages** (different URLs a user would navigate between), split into
  multiple page components, each with its own route. If it's **steps within
  one flow** (a wizard, a form with progress), keep it as a single page
  component with internal step state instead of manufacturing routes for
  each step. This is a judgment call — say which way you went and why in
  your summary.
- Don't invent a component-splitting hierarchy beyond what the page
  actually reuses. A repeated card/list-item pattern used 3+ times in the
  markup is worth its own component; a one-off section isn't.

### Placing and wiring the output

Write to `front/src/pages/<PageName>/<PageName>.tsx` and `.css`. Add a route
for it in the app's router — pick a path that matches what `context/layout`
says if it says anything, otherwise a reasonable slug based on the screen's
purpose (mention the path you chose in your summary so it can be corrected).

Leave the source file in `/layouts` untouched — it's the reference to check
the conversion against later, not a temp file to clean up.

If you're converting layouts in bulk (e.g. "convert everything pending in
/layouts") rather than one named file, treat the existence of
`front/src/pages/<PageName>/` as the signal that a layout's already been
done and skip it, rather than re-deriving state some other way.

### Verify before finishing

Run the frontend's typecheck/build (`npm run build`, or `tsc --noEmit` if
build is slow) inside `/front` and fix anything that doesn't compile. Don't
report the page as done without doing this.

## Summary to the user

Close with: which page(s) you created and where, the route(s) you wired up,
whether style.md defaults were used (and thus worth filling in), and any
judgment calls you made (multi-page vs. single-flow split, dropped canvas
furniture you weren't 100% sure about, etc.).
