# Color System Unification Design

**Date:** 2026-03-24
**Status:** Approved

## Problem

`src/index.css` contains two conflicting dark mode systems:

1. **App-level custom vars** (`--text`, `--bg`, `--accent`, `--border`, etc.) toggled via `@media (prefers-color-scheme: dark)`
2. **shadcn semantic tokens** (`--background`, `--foreground`, `--primary`, etc.) toggled via `.dark` CSS class

These two systems respond to different triggers and use different variable names for the same semantic purpose. This creates confusion about which variables to use and makes dark mode behavior inconsistent.

## Goal

A single, unified color system using shadcn semantic tokens exclusively, with dark mode driven by OS/browser preference (`prefers-color-scheme`). No JS required, no `.dark` class toggling.

## Approach: Tailwind v4 native (`@custom-variant`)

Rewire the `@custom-variant dark` declaration to respond to `prefers-color-scheme`, merge all dark overrides into a single `@media` block, and remove all custom app variables. Replace all usages with shadcn tokens.

## Changes

### 1. Fix `@custom-variant dark`

```css
/* Before */
@custom-variant dark (&:is(.dark *));

/* After */
@custom-variant dark (@media (prefers-color-scheme: dark));
```

This makes Tailwind's `dark:` utilities respond to OS preference.

### 2. Merge dark token overrides into `@media`

Move all overrides from `.dark {}` into `@media (prefers-color-scheme: dark) { :root { } }`. Remove the `.dark {}` class block entirely.

The existing `@media (prefers-color-scheme: dark)` block (which held custom app vars) is **replaced** by this unified block. The following non-variable rule that currently lives inside the old `@media` block must be explicitly carried over into the new unified block:

```css
#social .button-icon {
  filter: invert(1) brightness(2);
}
```

### 3. Remove custom app variables

Remove from `:root` and all `@media` blocks:
- `--text`, `--text-h`, `--bg`
- `--code-bg`, `--social-bg`
- `--accent`, `--accent-bg`, `--accent-border`
- `--shadow`
- `--sans`, `--heading`, `--mono`

Note: `--border` already exists as a shadcn token in `:root`. The custom light value (`oklch(0.922 0 0)`) is identical to shadcn's — no change. However, the custom dark override (`#2e303a`) differs from shadcn's dark value (`oklch(1 0 0 / 10%)`). After this change, the dark border will use shadcn's value. This is intentional — we accept shadcn's token as the single source of truth.

### 4. Variable mapping

| Removed var | Replacement | Notes |
|---|---|---|
| `--text` | `var(--muted-foreground)` | Body/subdued text |
| `--text-h` | `var(--foreground)` | Headings, strong text |
| `--bg` | `var(--background)` | Page background |
| `--border` | `var(--border)` | Already a shadcn token |
| `--code-bg` | `var(--muted)` | Subtle surface |
| `--social-bg` | `color-mix(in oklch, var(--muted) 50%, transparent)` | Original value was semi-transparent (`rgba(..., 0.5)`); `var(--muted)` is fully opaque and would lose the transparency. Using `color-mix` preserves the semi-transparent layering effect. |
| `--shadow` | Hardcoded per light/dark context (see below) | No shadcn token for shadows |
| `--accent` | `var(--primary)` | **See naming collision note below** |
| `--accent-bg` | `color-mix(in oklch, var(--primary) 10%, transparent)` | |
| `--accent-border` | `color-mix(in oklch, var(--primary) 50%, transparent)` | |
| `--sans` | `var(--font-sans)` | Tailwind `@theme inline` token |
| `--heading` | `var(--font-sans)` | Tailwind `@theme inline` token |
| `--mono` | `ui-monospace, Consolas, monospace` | Hardcode — no Tailwind font token for mono |

#### `--accent` naming collision

**Important:** The custom `--accent` (used as a brand/purple color for button text and borders) has the same name as shadcn's `--accent` semantic token (a background surface color). After removing the custom var, `var(--accent)` will resolve to shadcn's meaning — which is semantically different.

All usages of `var(--accent)` in `App.css` (lines 5 and 15) **must be replaced with `var(--primary)` before** removal of the custom `--accent`. If left as `var(--accent)`, they will silently resolve to the wrong color.

#### `--shadow` light/dark values

Because shadow values differ between modes, replace the single `var(--shadow)` usage in `App.css` with a direct value and a `@media` override:

- Light: `rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px`
- Dark: `rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px`

#### `var(--primary)` color note

In dark mode, `--primary` resolves to `oklch(0.922 0 0)` (near-white), not purple. The counter button accent color will shift from purple to the primary brand color. This is a deliberate trade-off: we accept shadcn's token semantics rather than preserving the original purple accent. If a custom brand purple is needed in the future, define it as a new token (e.g. `--brand`).

### 5. Update font usage in `index.css` base styles

The base element styles in `index.css` use `var(--sans)`, `var(--heading)`, and `var(--mono)` directly. These must be updated:

- `font: 18px/145% var(--sans)` → `font: 18px/145% var(--font-sans)`
- `font-family: var(--heading)` on `h1`, `h2` → `font-family: var(--font-sans)`
- `font-family: var(--mono)` on `code`, `.counter` → `font-family: ui-monospace, Consolas, monospace`

### 6. Final `index.css` structure

```
@import statements                          (unchanged)
@custom-variant dark (...)                  (updated to @media)
:root { shadcn light tokens only }          (custom vars removed)
@media (prefers-color-scheme: dark) {
  :root { shadcn dark token overrides }     (merged from .dark {})
  #social .button-icon { filter: ... }      (carried over)
}
@theme inline { ... }                       (unchanged)
base element styles                         (updated to use shadcn tokens)
layout styles (#root, .ticks, etc.)         (--border already correct)
```

`.dark {}` class block is **completely removed**.

### 7. Files changed

- `src/index.css` — restructure dark mode wiring, remove custom vars, update base styles
- `src/App.css` — replace all custom var usages with shadcn tokens and inline shadow values
