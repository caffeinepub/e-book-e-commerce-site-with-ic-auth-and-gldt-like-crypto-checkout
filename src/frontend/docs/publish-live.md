# Publishing to Live Environment

## Overview
This document outlines the process for publishing the BookCoin frontend to the Live production environment with strict version control and safety guardrails.

## ⚠️ Critical Version Lock Policy

**ONLY Version 29 can be published to Live.**

This is enforced by:
- `frontend/VERSION` must contain exactly "29"
- `frontend/scripts/enforce-version-29.sh` validates version before any deployment
- `frontend/scripts/publish-live.sh` checks version as the first gating step

**Do NOT attempt to bypass or modify these version checks.**

## When to Use Live Publish vs Rollback/Testing

### Use Live Publish When:
- You are deploying the approved Version 29 to production
- All preflight checks have passed
- You have completed smoke testing on Draft
- You are ready for end-users to access the new version

### Use Rollback/Testing When:
- You need to deploy an older version (e.g., Version 35) for testing or emergency rollback
- You are troubleshooting a regression in a draft build
- You need to restore a previous working version temporarily

**See**: [Rollback to V35 Documentation](./rollback-to-v35.md) for the separate rollback workflow.

## Safety Warnings

**This is a FRONTEND-ONLY deployment:**
- ✅ Deploys frontend canister only
- ❌ Does NOT deploy backend
- ❌ Does NOT reinstall backend
- ❌ Does NOT reset backend state
- ❌ Does NOT stop backend canister

**All backend data is preserved during Live publish.**

## Prerequisites

1. **Version Validation**:
   ```bash
   cat frontend/VERSION
   # Must output exactly: 29
   ```

2. **Environment Configuration**:
   - Verify `frontend/.env.production` contains `VITE_APP_ENV=Live`

3. **Access Requirements**:
   - Admin access to production environment
   - Proper dfx identity configured
   - Network access to Internet Computer mainnet

4. **Pre-Publish Testing**:
   - Draft version has been tested and verified
   - All smoke tests passed on Draft environment
   - No critical bugs or regressions identified

## Live Publish Procedure

### Step 1: Run Preflight Checks

