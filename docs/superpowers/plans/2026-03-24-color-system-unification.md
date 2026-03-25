# Color System Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify `src/index.css` to a single color system using shadcn semantic tokens exclusively, with dark mode driven by OS/browser preference (`prefers-color-scheme`).

**Architecture:** Rewire Tailwind v4's `@custom-variant dark` to use `@media (prefers-color-scheme: dark)`, merge the `.dark {}` class block into a single `@media` block, remove all custom app CSS variables, and replace every usage in `index.css` and `App.css` with shadcn semantic tokens.

**Tech Stack:** Tailwind CSS v4, shadcn, React, Vite, TypeScript

---

## File Map

| File | Change |
|---|---|
| `src/index.css` | Rewire dark variant, restructure `:root`, remove custom vars, merge `.dark {}` into `@media`, update base styles |
| `src/App.css` | Replace all custom var usages with shadcn tokens and inline shadow values |

---

### Task 1: Fix `App.css` — replace `var(--accent)` before removing the custom var

This must happen first to avoid the silent naming collision where `var(--accent)` would later resolve to shadcn's surface token instead of the intended primary color.

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Replace `var(--accent)` with `var(--primary)` in App.css**

In `src/App.css`, find and replace both occurrences:

```css
/* line 5 — counter button text color */
color: var(--primary);

/* line 15 — focus-visible outline */
outline: 2px solid var(--primary);
```

- [ ] **Step 2: Verify the build succeeds**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "fix: replace --accent with --primary in App.css before token removal"
```

---

### Task 2: Fix `App.css` — replace remaining custom vars

Replace all other custom var usages in `App.css` with shadcn tokens.

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Replace `var(--accent-bg)`**

```css
/* line 6 — counter button background */
background: color-mix(in oklch, var(--primary) 10%, transparent);
```

- [ ] **Step 2: Replace `var(--accent-border)`**

```css
/* line 12 — counter button hover border */
border-color: color-mix(in oklch, var(--primary) 50%, transparent);
```

- [ ] **Step 3: Replace `var(--text-h)` in the link color**

In `#next-steps ul a`:

```css
/* line 119 */
color: var(--foreground);
```

- [ ] **Step 4: Replace `var(--social-bg)` in the link background**

```css
/* line 122 */
background: color-mix(in oklch, var(--muted) 50%, transparent);
```

- [ ] **Step 5: Replace `var(--shadow)` with light-mode hardcoded value and add dark override**

Replace line 131 (`box-shadow: var(--shadow)`) with:

```css
box-shadow: rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

@media (prefers-color-scheme: dark) {
  box-shadow: rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
}
```

- [ ] **Step 6: Verify the build succeeds**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.css
git commit -m "fix: replace custom CSS vars with shadcn tokens in App.css"
```

---

### Task 3: Rewire `@custom-variant dark` in `index.css`

**Files:**
- Modify: `src/index.css` (line 6)

- [ ] **Step 1: Update the dark variant declaration**

```css
/* Before */
@custom-variant dark (&:is(.dark *));

/* After */
@custom-variant dark (@media (prefers-color-scheme: dark));
```

- [ ] **Step 2: Verify the build succeeds**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "fix: rewire @custom-variant dark to use prefers-color-scheme"
```

---

### Task 4: Merge `.dark {}` into `@media (prefers-color-scheme: dark)` in `index.css`

Remove the `.dark {}` block (lines 223–255) and fold its contents into the `@media (prefers-color-scheme: dark)` block. Also remove the existing `@media (prefers-color-scheme: dark)` block (lines 100–118) — its custom vars will be removed in Task 5, but the non-variable rule `#social .button-icon` must be carried over.

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the existing `@media (prefers-color-scheme: dark)` block (lines 100–118) with the unified block**

The new unified block combines:
- All shadcn dark token overrides (previously in `.dark {}`)
- The `#social .button-icon` filter rule (carried over from the old block)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.205 0 0);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
    --secondary: oklch(0.269 0 0);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --accent: oklch(0.269 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.556 0 0);
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.556 0 0);
  }

  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}
```

- [ ] **Step 2: Delete the `.dark {}` block (lines 223–255)**

Remove the entire `.dark { ... }` block from `index.css`.

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "fix: merge .dark class block into prefers-color-scheme media query"
```

---

### Task 5: Remove custom app variables from `:root` in `index.css`

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Remove custom vars from `:root`**

Remove **only** these lines from the `:root` block (lines 8–23 in the original file). Do NOT remove `--border` — it is also a shadcn token with the correct value and must remain.

```css
--text: #6b6375;
--text-h: #08060d;
--bg: #fff;
--code-bg: #f4f3ec;
--accent: oklch(0.97 0 0);
--accent-bg: rgba(170, 59, 255, 0.1);
--accent-border: rgba(170, 59, 255, 0.5);
--social-bg: rgba(244, 243, 236, 0.5);
--shadow: rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
--sans: system-ui, 'Segoe UI', Roboto, sans-serif;
--heading: system-ui, 'Segoe UI', Roboto, sans-serif;
--mono: ui-monospace, Consolas, monospace;
```

`--border: oklch(0.922 0 0)` stays in `:root`.

- [ ] **Step 2: Verify the build succeeds**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "fix: remove custom app CSS variables from :root"
```

---

### Task 6: Update base element styles in `index.css` to use shadcn tokens

Replace all remaining custom var usages in the base styles section of `index.css`.

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Update `font` declaration in `:root`**

```css
/* Before */
font: 18px/145% var(--sans);

/* After */
font: 18px/145% var(--font-sans);
```

- [ ] **Step 2: Update `color` and `background` in `:root`**

```css
/* Before */
color: var(--text);
background: var(--bg);

/* After */
color: var(--muted-foreground);
background: var(--background);
```

- [ ] **Step 3: Update `h1`, `h2` font-family**

```css
/* Before */
font-family: var(--heading);

/* After */
font-family: var(--font-sans);
```

- [ ] **Step 4: Update `h1`, `h2` color**

```css
/* Before */
color: var(--text-h);

/* After */
color: var(--foreground);
```

- [ ] **Step 5: Update `code`, `.counter` font-family**

```css
/* Before */
font-family: var(--mono);

/* After */
font-family: ui-monospace, Consolas, monospace;
```

- [ ] **Step 6: Update `code`, `.counter` color (separate rule from h1/h2)**

In `index.css`, the `code, .counter` block (around line 170) also uses `var(--text-h)`:

```css
/* Before */
code,
.counter {
  font-family: var(--mono);
  ...
  color: var(--text-h);
}

/* After */
code,
.counter {
  font-family: ui-monospace, Consolas, monospace;
  ...
  color: var(--foreground);
}
```

- [ ] **Step 7: Update `code` background**

```css
/* Before */
background: var(--code-bg);

/* After */
background: var(--muted);
```

- [ ] **Step 8: Verify the build succeeds**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/index.css
git commit -m "fix: update base element styles to use shadcn semantic tokens"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify light mode**

Open the browser. Set OS/browser to light mode. Check:
- Page background is white/light
- Text is readable
- Counter button has visible accent styling
- Social links have subtle background
- Borders are visible

- [ ] **Step 3: Verify dark mode**

Switch OS/browser to dark mode. Check:
- Page background switches to dark
- Text is readable
- Counter button accent styling updates
- Social link icons invert correctly (`#social .button-icon`)
- Borders are visible

- [ ] **Step 4: Confirm no `var(--text)`, `var(--bg)`, `var(--accent-bg)` etc. remain**

```bash
grep -n "var(--text)\|var(--bg)\|var(--code-bg)\|var(--social-bg)\|var(--accent-bg)\|var(--accent-border)\|var(--shadow)\|var(--sans)\|var(--heading)\|var(--mono)" src/index.css src/App.css
```

Expected: no output.

- [ ] **Step 5: Confirm `.dark {` class no longer exists**

```bash
grep -n "\.dark {" src/index.css
```

Expected: no output.

- [ ] **Step 6: Final commit**

```bash
git add src/index.css src/App.css
git commit -m "chore: verify color system unification complete"
```
