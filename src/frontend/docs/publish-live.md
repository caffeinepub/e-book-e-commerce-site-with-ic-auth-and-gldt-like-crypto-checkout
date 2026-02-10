# Live Publish Procedure

This document describes the procedure for publishing Draft Version 25 to the Live production environment at `radicaleconomist101-h78.caffeine.xyz`.

## Overview

The Live publish workflow promotes a validated draft version to production without wiping backend state. All existing books, orders, user profiles, and KYC data are preserved.

## Prerequisites

Before publishing to Live, ensure:

1. **Preflight checks pass**: Run `bash frontend/scripts/deployment-preflight.sh` and verify all checks pass
2. **Draft version validated**: Test Draft Version 25 thoroughly in the draft environment
3. **DFX configured**: Ensure `dfx` is configured with the correct identity and network settings for IC deployment
4. **Sufficient cycles**: Verify the frontend canister has sufficient cycles for deployment

## Publishing to Live

### Automated Method (Recommended)

Use the dedicated publish script:

