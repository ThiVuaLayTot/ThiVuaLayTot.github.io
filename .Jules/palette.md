# Palette's Journal

## 2025-05-14 - [Mobile Navigation Accessibility]
**Learning:** Using semantic `<button>` instead of `<div>` for mobile menu toggles improves screen reader interaction by making the element inherently focusable and actionable.
**Action:** Always refactor `div` toggles to `button` and include `aria-expanded` and `aria-label` that update via JavaScript.
