# Specification

## Summary
**Goal:** Revert the homepage hero image to the previously used static asset.

**Planned changes:**
- Update `frontend/src/pages/HomePage.tsx` so the hero `<img>` uses `/assets/generated/phoenix-1988-image-3.dim_564x483.png` instead of `/assets/generated/home-hero-replacement.dim_564x483.png`.
- Keep the hero image rendered at 564x483 and ensure the homepage loads without broken-image/missing-asset errors.

**User-visible outcome:** The homepage displays the previous hero image (564x483) and loads normally without any broken image icon.
