#!/bin/bash

# Live Publish Script - Version 29 ONLY
# Promotes Version 29 to Live production deployment (FRONTEND ONLY)
# ⚠️  CRITICAL: This script ONLY deploys the frontend canister
# Backend state (books, orders, users, KYC) is PRESERVED

set -e  # Exit on first error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "Live Publish Procedure - Version 29 ONLY"
echo "=========================================="
echo ""

# Step 0: Enforce Version 29 only
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 0: Version 29 Enforcement${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if bash "$SCRIPT_DIR/enforce-version-29.sh"; then
    echo ""
    echo -e "${GREEN}✓ Version 29 verified${NC}"
    echo "  This script will publish Version 29 to Live"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Version check failed${NC}"
    echo ""
    echo -e "${RED}Only Version 29 is allowed.${NC}"
    echo ""
    echo "Cannot proceed with Live publish."
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will publish Version 29 to Live (radicaleconomist101-h78.caffeine.xyz)${NC}"
echo ""
echo "This script will:"
echo "  1. Run preflight checks"
echo "  2. Confirm you want to proceed"
echo "  3. Deploy FRONTEND ONLY to Live (preserves backend state)"
echo "  4. Provide post-deploy verification steps"
echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}⚠️  CRITICAL SAFETY NOTICE:${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ This script deploys FRONTEND ONLY${NC}"
echo -e "${GREEN}✓ Backend canister will NOT be touched${NC}"
echo -e "${GREEN}✓ All existing data will be preserved:${NC}"
echo "    - Books, orders, users, KYC records"
echo "    - Cart contents, balances, support messages"
echo ""
echo -e "${RED}✗ DO NOT run these commands (they WIPE data):${NC}"
echo "    - dfx deploy --reinstall"
echo "    - dfx deploy backend --mode reinstall"
echo "    - dfx canister install --mode reinstall"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📦 Publishing Version 29 to Live:${NC}"
echo "   After publishing, your Live site will display the Version 29 frontend"
echo "   including the GLDT wallet address shown on Version 29."
echo ""
echo "   The Live site will show the same wallet address as Version 29."
echo ""

# Step 1: Run preflight checks
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Running Preflight Checks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if bash "$SCRIPT_DIR/deployment-preflight.sh" 2>&1 | tee /tmp/live-deploy.log; then
    echo ""
    echo -e "${GREEN}✓ All preflight checks passed${NC}"
else
    echo ""
    echo -e "${RED}✗ Preflight checks failed${NC}"
    echo ""
    echo "Cannot proceed with Live publish until all preflight checks pass."
    echo "See frontend/docs/deployment-preflight.md for troubleshooting."
    echo ""
    echo "Deployment log saved to: /tmp/live-deploy.log"
    echo ""
    echo "To retrieve the log:"
    echo "  cat /tmp/live-deploy.log"
    echo ""
    echo "Basic diagnostic commands:"
    echo "  dfx identity whoami"
    echo "  dfx canister status frontend --network ic"
    echo ""
    echo "After fixing issues, retry by running this script again:"
    echo "  bash frontend/scripts/publish-live.sh"
    exit 1
fi

# Step 2: Confirmation prompt
echo ""
echo "=========================================="
echo "Confirmation Required"
echo "=========================================="
echo ""
echo -e "${YELLOW}You are about to publish Version 29 to Live.${NC}"
echo ""
echo "Target URL: https://radicaleconomist101-h78.caffeine.xyz"
echo "Environment: Live"
echo "Version: 29"
echo "Deployment: FRONTEND ONLY (backend preserved)"
echo ""
echo -e "${GREEN}✓ What will happen:${NC}"
echo "  - Frontend canister will be updated with Version 29 UI"
echo "  - Environment badge will show 'Live'"
echo "  - Footer will display 'Version 29'"
echo "  - GLDT wallet address will match Version 29"
echo "  - All backend state remains intact"
echo ""
echo -e "${YELLOW}⚠️  What will NOT happen:${NC}"
echo "  - Backend canister will NOT be deployed"
echo "  - No data will be wiped or reset"
echo "  - No canisters will be reinstalled"
echo ""
echo -e "${RED}⚠️  SAFETY ASSERTION:${NC}"
echo -e "${RED}This workflow performs FRONTEND-ONLY deployment.${NC}"
echo -e "${RED}It does NOT run any command that deploys/reinstalls/resets the backend.${NC}"
echo ""

read -p "Type 'PUBLISH VERSION 29' to confirm: " CONFIRMATION

if [ "$CONFIRMATION" != "PUBLISH VERSION 29" ]; then
    echo ""
    echo "Publish cancelled."
    echo "No changes were made."
    exit 0
fi

# Step 3: Deploy frontend to Live
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Deploying Frontend to Live${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Deploying frontend canister to IC network..."
echo "Command: dfx deploy frontend --network ic"
echo ""

cd "$REPO_ROOT"

if dfx deploy frontend --network ic 2>&1 | tee -a /tmp/live-deploy.log; then
    echo ""
    echo -e "${GREEN}✓ Frontend deployment successful${NC}"
else
    echo ""
    echo -e "${RED}✗ Frontend deployment failed${NC}"
    echo ""
    echo "Deployment log saved to: /tmp/live-deploy.log"
    echo ""
    echo "Common issues:"
    echo "  - Network connectivity problems"
    echo "  - Insufficient cycles in frontend canister"
    echo "  - Identity/wallet authentication issues"
    echo ""
    echo "Diagnostic commands:"
    echo "  dfx identity whoami"
    echo "  dfx canister status frontend --network ic"
    echo "  dfx wallet balance --network ic"
    echo ""
    echo "After fixing issues, retry:"
    echo "  bash frontend/scripts/publish-live.sh"
    exit 1
fi

# Step 4: Post-deployment verification
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Post-Deployment Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✓ Version 29 has been published to Live!${NC}"
echo ""
echo "Live URL: https://radicaleconomist101-h78.caffeine.xyz"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Manual verification required${NC}"
echo ""
echo "Please verify the following:"
echo ""
echo "1. Environment Badge:"
echo "   - Visit https://radicaleconomist101-h78.caffeine.xyz"
echo "   - Check header shows 'Live' badge (not 'Draft')"
echo ""
echo "2. Version Label:"
echo "   - Scroll to footer"
echo "   - Verify footer displays 'Version 29'"
echo ""
echo "3. GLDT Wallet Address:"
echo "   - Navigate to Admin > Settings"
echo "   - Verify GLDT wallet address matches Version 29"
echo ""
echo "4. Catalog Verification:"
echo "   - Browse catalog at /catalog"
echo "   - Verify books display correctly"
echo "   - Check book covers render properly"
echo ""
echo "5. Purchase Flow:"
echo "   - Test adding a book to cart"
echo "   - Verify checkout works"
echo "   - Check library access after purchase"
echo ""
echo "6. Admin Functions:"
echo "   - Test admin dashboard access"
echo "   - Verify catalog management works"
echo "   - Check support inbox"
echo ""
echo -e "${BLUE}📋 Full Verification Checklist:${NC}"
echo "   See: frontend/docs/live-smoke-test-v29.md"
echo ""
echo -e "${BLUE}🔍 Smoke Test Helper:${NC}"
echo "   bash frontend/scripts/live-smoke-test-v29-helper.sh"
echo ""
echo -e "${YELLOW}⚠️  If any verification fails:${NC}"
echo "   1. Document the failure (URL, step, expected vs actual)"
echo "   2. Check browser console for errors"
echo "   3. Review deployment log: cat /tmp/live-deploy.log"
echo "   4. Contact support if needed"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Deployment Complete${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
