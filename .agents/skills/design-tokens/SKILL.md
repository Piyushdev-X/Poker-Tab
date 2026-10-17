---
name: design-tokens
description: "Single-hue mathematical design tokens generator. Derives complete light and dark mode color palettes (surfaces, borders, text, active states, accents) from a single --brand-hue variable using OKLCH/HSL math."
version: 1.0.0
---

# Design Tokens (Single-Hue Architecture)

Derive your entire product color system from a single `--brand-hue` number. Modifying `--brand-hue` re-themes all backgrounds, borders, cards, text tones, and active states seamlessly.

## Implementation Pattern

```css
@import "tailwindcss";

@theme {
  --brand-hue: 250; /* Adjust this single number (0-360) to recolor */
  
  /* Background surfaces */
  --color-canvas: oklch(0.99 0.005 var(--brand-hue));
  --color-surface: oklch(0.96 0.01 var(--brand-hue));
  --color-surface-raised: oklch(1.0 0 var(--brand-hue));
  
  /* Borders and dividers */
  --color-border: oklch(0.89 0.015 var(--brand-hue));
  --color-border-subtle: oklch(0.93 0.008 var(--brand-hue));
  
  /* Text and ink */
  --color-ink: oklch(0.18 0.025 var(--brand-hue));
  --color-ink-muted: oklch(0.48 0.02 var(--brand-hue));
  --color-ink-faint: oklch(0.68 0.015 var(--brand-hue));
  
  /* Primary & Accent */
  --color-primary: oklch(0.60 0.18 var(--brand-hue));
  --color-primary-hover: oklch(0.54 0.20 var(--brand-hue));
}
```
