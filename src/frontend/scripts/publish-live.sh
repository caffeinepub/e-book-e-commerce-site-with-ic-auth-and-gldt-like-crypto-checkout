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

# Step 0: Enforce Version 29 only (MUST pass before any other action)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 0: Version 29 Enforcement (CRITICAL)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run version guard FIRST - fail fast if not Version 29
if ! bash "$SCRIPT_DIR/enforce-version-29.sh"; then
    echo ""
    echo -e "${RED}✗ Version check FAILED${NC}"
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}DEPLOYMENT BLOCKED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Only Version 29 is allowed for Live publish."
    echo "No other version may be deployed."
    echo ""
    echo "To fix:"
    echo "  1. Ensure frontend/VERSION contains exactly '29'"
    echo "  2. Do not attempt to publish any other version"
    echo ""
    echo "Cannot proceed with Live publish."
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Version 29 verified${NC}"
echo "  This script will publish Version 29 to Live"
echo ""

# Step 0b: Check displayed version strings
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 0b: Displayed Version Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$FRONTEND_DIR"

if ! bash "$SCRIPT_DIR/check-displayed-version-29.sh"; then
    echo ""
    echo -e "${RED}✗ Displayed version check FAILED${NC}"
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}DEPLOYMENT BLOCKED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Source files contain hardcoded version strings other than Version 29."
    echo "All displayed version strings must be Version 29."
    echo ""
    echo "To fix:"
    echo "  1. Update all displayed version strings in source files to 'Version 29'"
    echo "  2. Re-run this script"
    echo ""
    echo "Cannot proceed with Live publish."
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All displayed version strings are Version 29${NC}"
echo ""

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
echo -e "${RED}✗ This script does NOT run these commands:${NC}"
echo "    - dfx deploy backend"
echo "    - dfx deploy --reinstall"
echo "    - dfx deploy backend --mode reinstall"
echo "    - dfx canister install backend --mode reinstall"
echo ""
echo -e "${RED}✗ The backend canister will NOT be deployed, reinstalled, or reset${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📦 Publishing Version 29 to Live:${NC}"
echo "   After publishing, your Live site will display the Version 29 frontend"
echo "   with the environment badge showing 'Live' and footer showing 'Version 29'."
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
echo ""
echo -e "${GREEN}✓ Frontend will be deployed${NC}"
echo -e "${GREEN}✓ Backend will NOT be modified${NC}"
echo ""
read -p "Do you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo ""
    echo "Deployment cancelled by user."
    echo ""
    exit 0
fi

# Step 3: Deploy frontend to IC
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Deploying Frontend to Live${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$REPO_ROOT"

echo "Deploying frontend canister to IC network..."
echo "⚠️  This deploys FRONTEND ONLY - backend is NOT touched"
echo ""

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
    exit 1
fi

# Step 4: Post-deploy verification
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Post-Deploy Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✓ Version 29 successfully published to Live!${NC}"
echo ""
echo "Live URL: https://radicaleconomist101-h78.caffeine.xyz"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  NEXT STEPS: Manual Verification Required"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please perform the following manual checks:"
echo ""
echo "1. Environment Badge:"
echo "   ✓ Visit https://radicaleconomist101-h78.caffeine.xyz"
echo "   ✓ Verify the header shows 'Live' badge (not 'Draft')"
echo ""
echo "2. Version Label:"
echo "   ✓ Scroll to footer"
echo "   ✓ Verify footer displays 'Version 29'"
echo ""
echo "3. Catalog Verification:"
echo "   ✓ Navigate to Catalog page"
echo "   ✓ Verify all previously uploaded books are visible"
echo "   ✓ Check book details pages load correctly"
echo ""
echo "4. Purchase Flow:"
echo "   ✓ Test adding a book to cart"
echo "   ✓ Verify checkout process works"
echo "   ✓ Confirm purchased books appear in My Library"
echo ""
echo "5. Backend State Preservation:"
echo "   ✓ Verify existing orders are still visible"
echo "   ✓ Check user balances are preserved"
echo "   ✓ Confirm KYC records are intact"
echo ""
echo "For detailed smoke test checklist, see:"
echo "  frontend/docs/live-smoke-test-v29.md"
echo ""
echo "To run the smoke test helper:"
echo "  bash frontend/scripts/live-smoke-test-v29-helper.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
