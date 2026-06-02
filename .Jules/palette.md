## 2025-05-14 - [Semantic Toggles & Chess-Themed UX]
**Learning:** For hobbyist/community sites, iconography is a powerful tool for delight, but it must be paired with semantic HTML. Replacing generic FontAwesome icons with theme-specific Boxicons (e.g., `bxs-chess`) improves the "flavor" of the site. More importantly, non-semantic interactive elements (like `div` or `span` used as buttons) are common accessibility pitfalls that must be refactored into `<button>` elements with `aria-expanded` and `aria-label` to support screen readers.

**Action:** Always audit mobile menu toggles and "back-to-top" elements for semantic correctness. Use theme-appropriate icon sets (like Boxicons) to enhance the UI while ensuring every icon-only interaction has a descriptive `aria-label`.
