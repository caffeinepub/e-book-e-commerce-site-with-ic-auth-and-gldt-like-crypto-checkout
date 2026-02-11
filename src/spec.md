# Specification

## Summary
**Goal:** Restore visibility of previously uploaded books by enabling an emergency rollback to the known-good Version 35 frontend, while fixing the Draft v36 regression and keeping Live publishing safeguards intact.

**Planned changes:**
- Document and provide a repeatable, frontend-only rollback workflow to deploy the Version 35 frontend build without any backend deploy/reinstall/reset actions.
- Update deployment guardrails to keep the existing Live publish lock unchanged, while adding a separate controlled rollback/testing flow for deploying older frontend versions (e.g., v35) in Draft or a designated rollback path.
- Identify and fix the Draft Version 36 regression that causes previously uploaded books to be missing from the Catalog/library UI, and add a minimal regression check plus a documented manual verification checklist (catalog loads, previously uploaded books appear, details pages open).
- Ensure failure states in the Catalog are user-visible and actionable in English (e.g., show an error instead of an empty catalog when fetch fails).

**User-visible outcome:** Users can roll back to Version 35 to see their previously uploaded books without changing backend state, and the latest Draft build again shows previously uploaded books with clear errors if loading fails.
