# Deployment Preflight Checklist

## Overview
This document outlines the comprehensive preflight validation procedures required before deploying the BookCoin frontend to any environment (Draft or Live).

## Version Enforcement

### Live Publish: Version 29 Lock
**For Live production deployments, ONLY Version 29 is permitted.**

This is enforced by:
- `frontend/VERSION` must contain exactly "29"
- `frontend/scripts/enforce-version-29.sh` validates version
- `frontend/scripts/publish-live.sh` checks version as first gating step

**Do NOT bypass or modify these version checks for Live publish.**

### Rollback/Testing: Separate Workflow
**For deploying older versions (e.g., Version 35) for testing or emergency rollback:**

Use the dedicated rollback/testing workflow:
- See [Rollback to V35 Documentation](./rollback-to-v35.md)
- Run `frontend/scripts/rollback-frontend-v35.sh`
- Follow rollback-specific preflight checks in `frontend/scripts/rollback-preflight.sh`

**The rollback workflow is frontend-only and does NOT modify backend state.**

## Preflight Validation Script

Run the automated preflight script before any deployment:

