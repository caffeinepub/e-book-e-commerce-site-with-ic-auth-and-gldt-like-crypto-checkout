#!/bin/bash

# Live Publish Script
# Promotes Draft Version 25 to Live production deployment
# This script runs preflight checks first, then performs the Live publish

set -e  # Exit on first error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "Live Publish Procedure"
echo "=========================================="
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will publish to Live (radicaleconomist101-h78.caffeine.xyz)${NC}"
echo ""
echo "This script will:"
echo "  1. Run preflight checks"
echo "  2. Confirm you want to proceed"
echo "  3. Deploy to Live without wiping backend state"
echo ""

# Step 1: Run preflight checks
echo -e "${BLUE}Step 1: Running preflight checks...${NC}"
echo ""

if bash "$SCRIPT_DIR/deployment-preflight.sh"; then
    echo ""
    echo -e "${GREEN}✓ Preflight checks passed${NC}"
else
    echo ""
    echo -e "${RED}✗ Preflight checks failed${NC}"
    echo ""
    echo "Cannot proceed with Live publish until all preflight checks pass."
    echo "See frontend/docs/deployment-preflight.md for troubleshooting."
    exit 1
fi

# Step 2: Confirmation prompt
echo ""
echo "=========================================="
echo "Confirmation Required"
echo "=========================================="
echo ""
echo -e "${YELLOW}You are about to publish Draft Version 25 to Live.${NC}"
echo ""
echo "Target: radicaleconomist101-h78.caffeine.xyz"
echo "Environment: Live"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: This deployment will NOT wipe backend state.${NC}"
echo "   All existing books, orders, users, and KYC data will be preserved."
echo ""
read -p "Do you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo ""
    echo "Live publish cancelled."
    exit 0
fi

# Step 3: Deploy to Live
echo ""
echo "=========================================="
echo "Deploying to Live"
echo "=========================================="
echo ""

cd "$REPO_ROOT"

echo "Deploying frontend canister to Live..."
echo ""

# Deploy frontend only (no reinstall, preserves backend state)
if dfx deploy frontend --network ic 2>&1 | tee /tmp/live-deploy.log; then
    echo ""
    echo -e "${GREEN}✓ Live deployment successful${NC}"
    echo ""
    echo "=========================================="
    echo "Deployment Complete"
    echo "=========================================="
    echo ""
    echo -e "${GREEN}Draft Version 25 is now Live!${NC}"
    echo ""
    echo "Your site is available at:"
    echo "  https://radicaleconomist101-h78.caffeine.xyz"
    echo ""
    echo "Next steps:"
    echo "  1. Visit the site and verify the environment badge shows 'Live'"
    echo "  2. Test critical user flows (browse, cart, checkout)"
    echo "  3. Verify existing data is intact (books, orders, users)"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Live deployment failed${NC}"
    echo ""
    echo "Check the deployment log above for errors."
    echo ""
    echo "Common issues:"
    echo "  - Network connectivity to Internet Computer"
    echo "  - Insufficient cycles in frontend canister"
    echo "  - DFX identity/wallet configuration"
    echo ""
    echo "For help, see frontend/docs/deployment-preflight.md"
    exit 1
fi
