# Specification

## Summary
**Goal:** Revert the deployed frontend to Version 29 and enforce a hard lock so no other frontend version can be built or published.

**Planned changes:**
- Revert deployment output to the frontend corresponding to Version 29 and remove any remaining Version 30/31/32 references from user-visible labels and deployed artifacts.
- Add fail-fast guards in the build/publish workflow to halt if `frontend/VERSION` is not exactly `29`, with an English error message stating only Version 29 is allowed.
- Ensure Live publish deploys only the frontend canister and does not modify/redeploy the backend canister, preserving existing backend state.

**User-visible outcome:** The live site runs Version 29 with no Version 30/31/32 indicators, and any attempt to build/publish a non-29 frontend version is blocked while backend data remains unchanged.
