# Specification

## Summary
**Goal:** Restore successful production (Live) deployment for Version 22 by fixing the underlying deployment failure and adding a preflight check to prevent recurrence.

**Planned changes:**
- Investigate and fix the minimal code/config issue causing “Failed to deploy to production: Deployment error” for Version 22.
- Ensure Live build-time environment configuration is correctly set so the deployed site reflects the Live environment (e.g., environment badge shows “Live”).
- Add an in-repo developer-facing deployment preflight procedure (documentation and/or script) that validates frontend and backend builds before attempting Live deployment and reports actionable errors.

**User-visible outcome:** Version 22 can be deployed to Live successfully, serving the latest frontend build and backend canister wasm, and the live site correctly indicates it is running in the Live environment.
