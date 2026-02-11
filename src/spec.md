# Specification

## Summary
**Goal:** Publish the existing frontend Version 29 build to the Live public site using the Version-29-only workflow, without deploying or modifying the backend canister.

**Planned changes:**
- Run the existing Live publish workflow script (`frontend/scripts/publish-live.sh`) to deploy only the frontend canister to the IC network.
- Ensure the publish workflow blocks immediately unless `frontend/VERSION` is exactly `29`.
- Run preflight checks as part of the publish process (`frontend/scripts/deployment-preflight.sh`).
- After publishing, execute the manual Live smoke test checklist for Version 29 against https://radicaleconomist101-h78.caffeine.xyz and record any failures per `frontend/docs/live-smoke-test-v29.md`.

**User-visible outcome:** The public Live site is updated to frontend Version 29 (showing Live badge and “Version 29” in the footer), with catalog browsing and basic cart/checkout navigation working without runtime errors.
