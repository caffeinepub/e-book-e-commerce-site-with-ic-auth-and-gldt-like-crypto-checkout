# Specification

## Summary
**Goal:** Roll back the frontend to Draft Version 35 with a documented, executable frontend-only deployment workflow that preserves backend state.

**Planned changes:**
- Add/adjust a documented and executable frontend-only rollback procedure to deploy Draft Version 35, explicitly excluding any backend canister deploy/install/reinstall/stop/delete actions.
- Update the UI footer version indicator so it displays “Version 35” after the Draft rollback and ensure no other UI location shows a conflicting version label.
- Ensure the rollback build sets build-time environment configuration so the environment badge displays “Draft” (leaving Live configuration and Version 29 Live enforcement unchanged).
- Extend the Version 35 rollback preflight checks to validate the UI’s displayed version label matches the rollback target (“Version 35”) and fail with an English error message if it does not.

**User-visible outcome:** After deploying the Draft rollback, users see “Draft” in the environment badge and “Version 35” in the footer, while the backend remains untouched and Live publish guardrails continue to enforce Version 29.
