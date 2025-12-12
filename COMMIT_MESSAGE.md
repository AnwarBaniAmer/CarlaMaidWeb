# Commit Message

```
feat: enhance service detail pages with image backgrounds and fix language switching

- Replace gradient backgrounds with high-quality image backgrounds for all service detail pages
- Reduce hero overlay opacity from 0.85 to 0.6 for better image visibility
- Fix language switching bug causing 404 errors on service pages
- Update build budget to accommodate enhanced service-detail component styles

BREAKING CHANGES: None

The language switching fix replaces location.reload() with Angular Router navigation
to prevent server-side 404 errors when switching languages on client-side routes.
All 12 service detail pages now feature beautiful, relevant background images
from Unsplash that enhance the visual appeal while maintaining text readability.
```

