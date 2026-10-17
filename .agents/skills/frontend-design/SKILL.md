---
name: frontend-design
description: "Core frontend design skill to eliminate generic AI-generated aesthetics. Requires deliberate aesthetic direction (brutalist, editorial, retro-futuristic, etc.), real typography pairings, cohesive CSS variables/color systems, and bespoke component composition before coding."
version: 1.0.0
---

# Frontend Design Skill

Avoid the "AI slop" default look (Inter font + generic purple/blue gradients + rounded card containers). Apply production-grade visual design thinking to every frontend implementation.

## Core Directives

1. **Pick an Aesthetic Direction First:**
   - Before writing any code, declare a distinct aesthetic world:
     - **Editorial / High Fashion**: Serif typography, broad negative space, structured grid, pull quotes, muted organic palette.
     - **Swiss Minimalism**: Pure Helvetica/Inter, rigid grid structure, black & white contrast, stark informational hierarchy.
     - **Retro-Futurism / Cyberpunk**: High-contrast dark backgrounds, neon borders, monospace data telemetry, CRT/scanline accents.
     - **Industrial Brutalism**: Raw monospace typography, exposed borders, utilitarian status badges, sharp 0px radius corners.
     - **Tactile Clay / Tabletop**: Soft warm beige & sand surfaces, matte clay keycaps, ambient diffuse shadows.

2. **Typography Pairing:**
   - Never default to standard browser sans-serif alone.
   - Pair an expressive display typeface (`Outfit`, `Playfair Display`, `Cabinet Grotesk`, `Syne`) with a disciplined body font and a tabular monospace (`JetBrains Mono`, `Space Mono`) for data/numerical metrics.

3. **Color Systems & Tokens:**
   - Use cohesive token architectures (`oklch` or calibrated HSL).
   - Never use pure black (`#000000`) or harsh uncalibrated primaries; use warm espresso, deep slate, rich obsidian, or tinted neutrals.
   - Define semantic roles: `surface`, `surface-elevated`, `surface-recessed`, `border`, `accent`, and `muted`.

4. **Component Hierarchy & Restraint:**
   - Avoid "cards inside cards inside cards" nesting loops.
   - Vary container weights: use hairlines, subtle background tone shifts, and whitespace separation rather than heavy borders on everything.
