# Deployment Preflight Checklist

This document outlines the preflight procedure to validate builds before deploying to Live.

## Purpose

The preflight procedure catches build failures and configuration issues before attempting a Live deployment, preventing deployment errors and ensuring the environment badge displays correctly.

## Prerequisites

- Node.js and pnpm installed
- DFX installed and configured
- Clean working directory (no uncommitted changes recommended)

## Preflight Steps

### 1. Environment Configuration Check

**Required for Live deployment:**
- Ensure `VITE_APP_ENV=Live` is set in `frontend/.env.production`
- Verify `frontend/src/config/environment.ts` correctly reads this variable

**Verification:**
