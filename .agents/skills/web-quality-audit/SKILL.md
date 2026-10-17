---
name: web-quality-audit
description: "Web quality, accessibility, Core Web Vitals (LCP, INP, CLS), and responsive auditing skill based on Google web.dev standards. Use for auditing semantic HTML, WCAG 2.1 contrast ratios, keyboard focus states, tap targets (min 44x44px), and runtime layout shifts."
version: 1.0.0
---

# Web Quality, A11y & Performance Audit

Comprehensive technical quality checks for modern web applications.

## 1. Accessibility (WCAG 2.1 AA Checklist)
- **Color Contrast**: Normal text minimum contrast 4.5:1 against background; large text (18pt+) minimum 3:1.
- **Interactive Targets**: Minimum 44x44px touch tap target on mobile viewports.
- **Keyboard Traversal**: Visible focus rings (`focus-visible:ring-2 focus-visible:outline-none`).
- **Semantic HTML**: Descriptive button labels, aria-labels for icon-only buttons, proper `<dialog>` or `role="dialog"` attributes with backdrop trapping.

## 2. Core Web Vitals (CWV)
- **Largest Contentful Paint (LCP)**: Preload hero assets, prioritize primary heading rendering.
- **Interaction to Next Paint (INP)**: Ensure event handlers complete under 50ms; defer heavy state computations with `useTransition` or `requestIdleCallback`.
- **Cumulative Layout Shift (CLS)**: Explicit aspect ratios on containers (`aspect-[16/9]`, `aspect-square`), reserved placeholder sizes for dynamic content.

## 3. Responsive Edge Cases
- Test extreme viewport boundaries:
  - Small mobile: 320px–390px (ensure no horizontal overflow or clipped text).
  - Tablet portrait & landscape: 768px–1024px.
  - Safe-area insets: `pb-safe` / `env(safe-area-inset-bottom)` for mobile bottom bars.
