# Draft Version 29 Rebuild Documentation

## Overview

This document describes the procedure for rebuilding Draft Version 29 for preview and testing purposes without publishing to the Live public site.

## Purpose

The Draft rebuild process allows you to:
- Regenerate frontend build artifacts for Version 29
- Test changes in a Draft environment
- Verify functionality before publishing to Live
- Create a clean build without affecting the Live deployment

## Important Safety Notes

⚠️ **CRITICAL SAFETY GUARDRAILS:**
- This rebuild does **NOT** publish or deploy to Live
- This rebuild does **NOT** modify the backend canister
- This rebuild does **NOT** reset or reinstall backend state
- The VERSION file must contain exactly `29` (no Version 30/31)

## Prerequisites

Before rebuilding Draft Version 29:
1. Ensure `dfx` is installed and available
2. Verify you're in the project root directory
3. Confirm `frontend/VERSION` contains exactly `29`
4. Ensure you have npm dependencies installed

## Automated Rebuild Method

### Using the Rebuild Script

The recommended method is to use the automated rebuild script:

