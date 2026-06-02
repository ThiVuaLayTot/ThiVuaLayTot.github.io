## 2026-06-02 - [Unused Font Imports and Image Optimization]
**Learning:** Found multiple unused Google Font imports in `css/main.css` and `_includes/head.html` (Poppins, Outfit, Roboto, Raleway) that were adding unnecessary weight to the initial load without being used in the stylesheets. Also identified images below the fold without lazy loading.
**Action:** Always audit font imports against their actual usage in the CSS variables and classes. Use `loading="lazy"` and `decoding="async"` for images that are not part of the initial viewport to prioritize critical content.
