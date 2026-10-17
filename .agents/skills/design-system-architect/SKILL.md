---
name: design-system-architect
description: "Architect comprehensive design token systems: OKLCH wide-gamut color palettes, 4px/8px modular spacing grids, semantic light/dark mode tokens, responsive typography scales, and CSS variable / Tailwind @theme architectures."
version: 1.0.0
---

# Design System Architect

Construct professional, mathematically sound token architectures for web applications.

## 1. OKLCH Color Space & Semantic Tokens
- Use `oklch(L C H)` for perceptual uniformity and wide P3 color gamut support.
- Derive tonal steps predictably:
  - Background surface: `oklch(0.985 0.01 var(--brand-hue))`
  - Elevated card: `oklch(1.0 0 var(--brand-hue))`
  - Border hairline: `oklch(0.88 0.015 var(--brand-hue))`
  - Primary text / ink: `oklch(0.18 0.02 var(--brand-hue))`
  - Secondary muted text: `oklch(0.45 0.02 var(--brand-hue))`

## 2. Spatial & Layout Grid
- Strict 4px/8px base grid units (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- Consistent container padding across viewports (`p-3 sm:p-4 md:p-6 lg:p-8`).

## 3. Elevation & Ambient Shadows
- Multi-stop diffuse shadows rather than single dark drops:
  - `box-shadow: 0 12px 32px -8px rgba(..., 0.08), 0 2px 6px -1px rgba(..., 0.04)`
- Inset hairlines for tactile depth (`inset 0 1px 0 rgba(255, 255, 255, 0.6)`).
