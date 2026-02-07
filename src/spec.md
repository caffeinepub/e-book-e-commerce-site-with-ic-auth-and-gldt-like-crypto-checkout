# Specification

## Summary
**Goal:** Restore admin access via a one-time owner recovery flow and allow the recovered admin to reset/relaunch the store to a clean state.

**Planned changes:**
- Add a backend admin recovery mechanism that allows a logged-in user to claim admin only when no admin is configured, and permanently blocks recovery after admin is set.
- Add a frontend admin recovery route (e.g., `/admin/recover`) linked from the Admin “Access Denied” state, showing the current principal, login CTA when logged out, and success/error messaging in English.
- Add an admin-only reset/relaunch control in the Admin area with an explicit confirmation step that invokes the existing backend reset capability and updates the UI to reflect an empty/clean store state.

**User-visible outcome:** If the app has no admin configured, a logged-in user can self-serve admin recovery and then access `/admin`. An admin can reset/relaunch the store from the Admin UI (with confirmation), and non-admin users remain unable to access admin features or trigger resets.
