# PRIMER — what this project actually is, in terms you already have

Written against **your** repo, not a generic tutorial. Every path below is real.
You know C++. That's an advantage here, not a gap — the concepts map almost one to one.

---

## 1. The one-paragraph version

You are writing a **program that runs inside a web browser**. The browser is the operating system
and the runtime. It only executes one language — JavaScript — and it only draws one thing — a tree
of HTML elements styled by CSS. Everything else in this repo exists to turn code you'd want to
write into those two things.

---

## 2. The mapping

| C++ | here | what it is |
|---|---|---|
| `.cpp` / `.h` | `.ts` / `.tsx` | your source |
| the compiler (`g++`) | **`tsc`** (TypeScript) | checks types, emits JavaScript |
| the linker | **Vite** | resolves imports, bundles everything into a few files |
| `a.out` / `.exe` | **`dist/`** | the shipped artifact |
| makefile / build flags | **`package.json`** | what to build, how, with which deps |
| `-lboost` etc. | **`node_modules/`** | downloaded libraries |
| `/obj`, build temp | `node_modules/`, `dist/` | rebuildable — **never committed** |
| the CPU | **the browser** | what actually runs `dist/` |
| unit tests | **`harness/`** | your gate |

**This table is why the GitHub code you downloaded didn't run.** A repo holds source, not a binary.
There is no `.exe` in it. You have to build it — and the build needs a toolchain the author almost
never documents. That's not you missing something. That information is genuinely usually absent.

For **this** repo it is documented, in one line: `tools/bootstrap.sh`. That's the whole build.

---

## 3. What each piece actually does

### TypeScript (`.ts`)
JavaScript has no types. Any variable can hold anything, and a typo in a field name is not an
error — it silently reads `undefined` and your program does something wrong three functions later.
TypeScript is a **compiler front-end** that adds C++-style static types on top.

Critically: **the types are erased.** `tsc` checks them and then throws them away, emitting plain
JavaScript. Nothing about types exists at runtime. They are a compile-time contract only — closer
to `static_assert` than to a C++ type, which has real runtime layout.

That's why `src/types.ts` matters so much in your project. It's your header file: 18 domain shapes,
one place, and `tsc -b` fails the build if anything violates them.

### `.tsx`
Same language, plus you may write HTML-looking markup directly in the code:

    return <div className="card">{character.name}</div>

That is not a string and not HTML. It compiles to a function call that builds an object describing
what to draw. Think of it as a literal syntax for a tree, the way `{1,2,3}` is a literal for a list.

### React
The old way to build a web UI: find an element, mutate it, repeat — a million imperative pokes at a
tree, and any missed poke means the screen disagrees with your data.

React inverts it. **You write a pure function from state to markup.** React calls it, compares the
result to what's on screen, and applies the minimum change itself. You never touch the screen.

    state  ──►  your component function  ──►  markup tree  ──►  React diffs  ──►  browser

You already built around this instinct: your reducer owns state, the components just render it.
`src/reducer/play.ts` is the state machine; `src/bastion/ui.tsx` is the drawing.

### HTML and CSS
HTML is the **element tree** (the DOM) — the render target. CSS is the styling rules applied to it.
You were right that they're paired. You don't hand-write HTML here; React produces it. `styles.ts`
is where your CSS lives. This is why HTML wouldn't click without a project: it's a target format,
not a thing you write in.

### npm and `package.json`
`package.json` is your makefile: the dependency list and named commands. `npm install` downloads
deps into `node_modules/`. `npm run check` runs the command named `check`.

`node_modules/` is enormous, fully rebuildable, and **never committed** — same reason you'd never
commit `/obj`. That's what `.gitignore` is doing.

---

## 4. Your build, command by command

    npm install      # fetch deps            ≈ having the right libs installed
    tsc -b           # typecheck             ≈ compile
    vite build       # bundle → dist/        ≈ link
    npm run check    # YOUR GATE: typecheck + action contract + behaviour + render

`npm run check` is the important one and it's **yours** — not standard tooling. It's the compiler
substitute you built because JavaScript won't catch your mistakes for you. The transition suite,
the fuzz dispatch, the jsdom render smoke test: that's a test rig most working programmers don't
build. "Gate green always" is a discipline, not a default.

---

## 5. Where your code lives

    src/types.ts        the header — 18 domain shapes
    src/styles.ts       CSS
    src/app.tsx         the shell + modal router (914 lines — the monolith is GONE)
    src/reducer/play.ts the state machine
    src/bastion/        engine.ts (2,574) · registry.ts · ui.tsx — the simulation
    src/data/           pure literal data, no dependencies
    src/lib/            shared code. NOTHING here may import a feature package.
    harness/            the gate

**The layering rule you already enforce**, restated: dependencies point *downward* only.
`lib/` → nothing. Features → `lib/`. Shell → features. If something in `lib/` wants a feature, it's
in the wrong package — move it down, never import upward. You found six things misplaced this way.

That is architecture, and it is the part that is hard to teach. The vocabulary above is the part
that is easy — you were simply never handed it.

---

## 6. The honest gaps, so you know what you don't know

- **`async`/`await` and Promises.** Anything involving waiting — network, files. You've barely hit it.
- **The npm ecosystem's churn.** Nobody has this loaded; everyone looks it up.
- **Git.** Deliberately not covered here. It is trade tooling, learnable in an afternoon, and it is
  not blocking you.

None of these gate the work in front of you.
