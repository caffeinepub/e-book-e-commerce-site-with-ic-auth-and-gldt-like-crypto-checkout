# Deployment Preflight Documentation

This document describes the preflight validation process that must pass before publishing Version 29 to Live production.

## Overview

The preflight script validates your build configuration and ensures the production build will correctly embed `VITE_APP_ENV=Live`. This is a **required step** before Live deployment.

**⚠️ IMPORTANT**: Preflight does NOT deploy or modify any canisters. It only validates that builds work correctly.

**🔒 VERSION LOCK**: This workflow is locked to Version 29 only. Any attempt to build or publish a different version will be blocked.

## What Preflight Checks

### 0. Version 29 Enforcement

**Validates:**
- `frontend/VERSION` file exists
- Contains exactly `29` (no other version allowed)

**Why this matters:**
- Ensures only Version 29 can be built or published
- Prevents accidental creation of Version 30/31/32
- Hard-blocks any non-29 version from proceeding

**Required pass condition:**
- ✅ `frontend/VERSION` must contain exactly `29`
- ❌ Any other version will fail immediately

### 1. Environment Configuration

**Validates:**
- `frontend/.env.production` exists
- Contains `VITE_APP_ENV=Live`
- `frontend/src/config/environment.ts` exists

**Why this matters:**
- Production builds read `VITE_APP_ENV` from `.env.production`
- This value determines the environment badge ("Live" vs "Draft")
- If missing or incorrect, Live will show "Draft" badge

**Required pass condition:**
- ✅ `.env.production` must contain exactly: `VITE_APP_ENV=Live`

### 2. Dependencies

**Validates:**
- Node.js is installed
- pnpm is installed
- dfx is installed

**Why this matters:**
- These tools are required to build and deploy
- Missing dependencies will cause build failures

### 3. Backend Build

**Validates:**
- Backend canister builds successfully
- Motoko code compiles without errors

**Why this matters:**
- Frontend needs backend type definitions
- Build failures indicate code issues

**⚠️ NOTE**: This is a validation-only build. The backend canister is NOT deployed or modified.

### 4. Frontend Dependencies

**Validates:**
- `node_modules` directory exists
- Core dependencies (react, vite) are present

**Why this matters:**
- Missing dependencies cause build failures
- Ensures all required packages are installed

### 5. Backend Bindings

**Validates:**
- TypeScript bindings generated from backend
- `frontend/src/backend.d.ts` exists

**Why this matters:**
- Frontend needs type definitions to call backend
- Missing bindings cause TypeScript errors

### 6. Frontend Build (Production Mode)

**Validates:**
- Frontend builds successfully with production config
- `dist/` directory created with assets
- Environment "Live" found in compiled assets
- "Version 29" found in compiled assets
- No references to Version 30/31/32 in build output
- `dist/index.html` exists

**Why this matters:**
- Confirms production build works
- Verifies `VITE_APP_ENV=Live` is embedded in compiled code
- Ensures environment badge will show "Live" on production
- Confirms Version 29 label is present in footer
- Prevents any non-29 version artifacts from being deployed

**Required pass conditions:**
- ✅ Production build must embed `VITE_APP_ENV=Live` (verified in compiled assets)
- ✅ Production build must contain "Version 29" (verified in compiled assets)
- ✅ Production build must NOT contain any references to Version 30/31/32
- ✅ If any of these checks fail, deployment is blocked

## Running Preflight

### Automated Script

