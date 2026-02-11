# Rollback to Version 35 - Emergency Procedure

## Overview
This document provides a repeatable, frontend-only rollback procedure to deploy Version 35 of the BookCoin application. This rollback is designed to restore catalog visibility for previously uploaded books without modifying backend state.

## ⚠️ Critical Safety Warnings

**DO NOT run any of the following commands during rollback:**
- `dfx deploy backend`
- `dfx canister install backend`
- `dfx canister reinstall backend`
- `dfx canister stop backend`
- `dfx canister delete backend`
- Any backend migration or state reset commands

**This is a FRONTEND-ONLY rollback.** The backend canister must remain untouched to preserve all uploaded books and user data.

## When to Use This Rollback

Use this rollback procedure when:
- Previously uploaded books are not visible in the catalog
- Version 36 (or later) introduced a regression affecting catalog display
- You need to restore the last known working version (35) quickly

## Prerequisites

1. Verify current version is NOT 35:
   ```bash
   cat frontend/VERSION
   ```

2. Ensure you have admin access to the deployment environment

3. Backup current state (optional but recommended):
   ```bash
   git stash save "backup-before-v35-rollback-$(date +%Y%m%d-%H%M%S)"
   ```

## Rollback Procedure

### Step 1: Run the Rollback Script

