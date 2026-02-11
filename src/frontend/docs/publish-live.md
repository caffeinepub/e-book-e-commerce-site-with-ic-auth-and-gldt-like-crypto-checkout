# Live Publish Documentation - Version 29 ONLY

This document describes how to publish Version 29 to the Live production site at `https://radicaleconomist101-h78.caffeine.xyz`.

**🔒 VERSION LOCK**: This workflow is locked to Version 29 only. Any attempt to publish a different version will be blocked immediately.

## ⚠️ CRITICAL SAFETY NOTICE

**This is a FRONTEND-ONLY deployment workflow.**

### ✅ What This Workflow Does:
- Deploys the frontend canister to Live
- Updates the UI to Version 29
- Changes environment badge from "Draft" to "Live"
- Displays "Version 29" in footer
- Preserves all backend state (books, orders, users, KYC)

### ❌ What This Workflow Does NOT Do:
- Does NOT deploy or modify the backend canister
- Does NOT reset or wipe any data
- Does NOT reinstall canisters
- Does NOT publish Version 30/31/32 (only Version 29)

### 🔒 Version Enforcement:
- Only Version 29 can be published
- `frontend/VERSION` must contain exactly `29`
- Any other version will fail immediately before any deployment action
- No bypass or override mechanism

### 🚫 Commands This Workflow Does NOT Execute:

The Live publish workflow explicitly does NOT run any of these commands:
- `dfx deploy backend`
- `dfx deploy --reinstall`
- `dfx deploy backend --mode reinstall`
- `dfx canister install backend --mode reinstall`
- `dfx canister stop backend`
- Any command that modifies the backend canister

**The ONLY deployment command executed is:**
