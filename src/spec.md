# Specification

## Summary
**Goal:** Publish the current Draft (Version 25) to the Live deployment at radicaleconomist101-h78.caffeine.xyz after successfully running preflight checks, without wiping backend state.

**Planned changes:**
- Run the existing deployment preflight script and complete a Live publish that deploys the frontend without reinstalling/wiping backend canister state.
- Update user-facing version references in Live publish documentation and script console output to show Version 25 instead of Version 22, keeping the target domain unchanged.

**User-visible outcome:** Visiting https://radicaleconomist101-h78.caffeine.xyz loads the latest (Version 25) Live build, and the UI indicates the environment is Live.
