#!/bin/bash

# Rebuild Draft Version 29 Script
# Rebuilds the Draft frontend with Version 29 configuration
# ⚠️  IMPORTANT: This script does NOT publish to Live or modify the backend

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
echo "Rebuild Draft Version 29"
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
    echo "  This script will rebuild Version 29 for Draft"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Version check failed${NC}"
    echo ""
    echo -e "${RED}Only Version 29 is allowed.${NC}"
    echo ""
    echo "Cannot proceed with Draft rebuild."
    exit 1
fi

echo -e "${YELLOW}⚠️  NOTE: This script rebuilds Draft only${NC}"
echo ""
echo "This script will:"
echo "  1. Set environment to Draft"
echo "  2. Clean previous build artifacts"
echo "  3. Rebuild frontend with Draft configuration"
echo "  4. Deploy to local/Draft environment"
echo ""
echo -e "${GREEN}✓ What will happen:${NC}"
echo "  - Frontend will be rebuilt with VITE_APP_ENV=Draft"
echo "  - Environment badge will show 'Draft'"
echo "  - Footer will display 'Version 29'"
echo "  - Backend will NOT be modified"
echo ""
echo -e "${RED}✗ What will NOT happen:${NC}"
echo "  - Will NOT publish to Live"
echo "  - Will NOT modify backend canister"
echo "  - Will NOT reset any data"
echo ""

# Step 1: Environment setup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Environment Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$FRONTEND_DIR"

# Ensure .env.development exists for Draft builds
if [ ! -f ".env.development" ]; then
    echo "Creating .env.development for Draft environment..."
    echo "VITE_APP_ENV=Draft" > .env.development
    echo -e "${GREEN}✓ Created .env.development${NC}"
else
    echo -e "${GREEN}✓ .env.development exists${NC}"
fi

# Step 2: Clean build
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Clean Build Artifacts${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -d "dist" ]; then
    echo "Removing previous build artifacts..."
    rm -rf dist
    echo -e "${GREEN}✓ Build artifacts cleaned${NC}"
else
    echo -e "${GREEN}✓ No previous build artifacts to clean${NC}"
fi

# Step 3: Build frontend
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Build Frontend (Draft Mode)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Building frontend with Draft configuration..."
echo "Environment: Draft"
echo "Version: 29"
echo ""

cd "$REPO_ROOT"

# Generate backend bindings
echo "Generating backend bindings..."
if dfx generate backend; then
    echo -e "${GREEN}✓ Backend bindings generated${NC}"
else
    echo -e "${RED}✗ Backend bindings generation failed${NC}"
    exit 1
fi

# Build frontend
cd "$FRONTEND_DIR"
echo ""
echo "Building frontend..."
if pnpm run build:skip-bindings; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

# Verify build output
echo ""
echo "Verifying build output..."

if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Build output directory created${NC}"
    
    # Check for Version 29
    if grep -r "Version 29" dist/assets/*.js > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Version 29 found in build output${NC}"
    else
        echo -e "${YELLOW}⚠ Version 29 not found in build output${NC}"
    fi
    
    # Check for prohibited versions
    if grep -rE "Version (30|31|32)" dist/ > /dev/null 2>&1; then
        echo -e "${RED}✗ Found prohibited version references (30/31/32)${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ No prohibited version references found${NC}"
    fi
else
    echo -e "${RED}✗ Build output directory not created${NC}"
    exit 1
fi

# Step 4: Deploy to Draft
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Deploy to Draft${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$REPO_ROOT"

echo "Deploying frontend to local/Draft environment..."
if dfx deploy frontend; then
    echo -e "${GREEN}✓ Frontend deployed to Draft${NC}"
else
    echo -e "${RED}✗ Frontend deployment failed${NC}"
    exit 1
fi

# Final summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Draft Version 29 Rebuild Complete${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Version 29 has been rebuilt and deployed to Draft."
echo ""
echo "Verification:"
echo "  - Environment badge should show 'Draft'"
echo "  - Footer should display 'Version 29'"
echo "  - Backend state is preserved"
echo ""
echo -e "${YELLOW}⚠️  Remember:${NC}"
echo "  - This is a Draft rebuild only"
echo "  - To publish to Live, use: bash frontend/scripts/publish-live.sh"
echo "  - Only Version 29 can be published"
echo ""
