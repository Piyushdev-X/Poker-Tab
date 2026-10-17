---
name: animation-motion-principles
description: "Advanced animation and motion skill covering GSAP + ScrollTrigger, Framer Motion / Motion.dev, spring physics, layout transitions, exit/enter animations (AnimatePresence), reduced-motion media queries, and performance audits."
version: 1.0.0
---

# Animation & Motion Principles

Work with modern web motion libraries (Framer Motion / Motion.dev, GSAP, CSS scroll-driven animations) to craft purposeful, high-framerate transitions.

## Key Rules & Guidelines

1. **Spring Physics over Linear Easing:**
   - Use damping and stiffness for physical tangibility:
     - Damped spring: `type: "spring", stiffness: 200, damping: 25`
     - Snappy entry: `ease: [0.22, 1, 0.36, 1]`

2. **Always Wrap Dynamic DOM in Exit Handlers:**
   - In React / Framer Motion, never unmount conditional components without `<AnimatePresence>`:
   ```jsx
   <AnimatePresence>
     {isOpen && (
       <motion.div
         initial={{ opacity: 0, y: 10, scale: 0.96 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: -6, scale: 0.98 }}
         transition={{ duration: 0.2 }}
       />
     )}
   </AnimatePresence>
   ```

3. **Accessibility & Reduced Motion:**
   - Always honor `prefers-reduced-motion`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

4. **Performance:**
   - Only animate composite properties (`transform`, `opacity`, `filter`). Avoid animating layout properties (`width`, `height`, `top`, `left`, `margin`) during high-frequency animations.
