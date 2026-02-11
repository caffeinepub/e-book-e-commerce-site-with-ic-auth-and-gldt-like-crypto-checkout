#!/bin/bash

# Deployment Preflight Script
# Validates build configuration and runs builds before Live deployment
# ⚠️  IMPORTANT: This script validates builds for FRONTEND-ONLY deployment
# It does NOT deploy or modify the backend canister

set -e  # Exit on first error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"

echo "=========================================="
echo "Deployment Preflight Check"
echo "=========================================="
echo ""
echo "⚠️  NOTE: This validates builds for FRONTEND-ONLY deployment"
echo "   Backend canister will NOT be deployed or modified"
echo "   This workflow is for Live publish of Version 29 only"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall success
PREFLIGHT_PASSED=true

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        PREFLIGHT_PASSED=false
    fi
}

# Function to print section header
print_section() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
}

# 0. Enforce Version 29 only (FIRST - fail fast)
print_section "0. Version 29 Enforcement (CRITICAL)"

echo "Verifying Version 29 lock before any other checks..."
echo ""

if bash "$SCRIPT_DIR/enforce-version-29.sh"; then
    print_status 0 "Version 29 verified - deployment allowed"
    echo "   ✓ This preflight is for Version 29 Live publish"
    echo "   ✓ Frontend-only deployment workflow"
else
    print_status 1 "Version check failed - Only Version 29 is allowed"
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}PREFLIGHT BLOCKED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Cannot proceed with preflight."
    echo "Only Version 29 may be published to Live."
    exit 1
fi

# 0b. Check displayed version strings in source files
echo ""
echo "Verifying displayed version strings in source files..."
echo ""

if bash "$SCRIPT_DIR/check-displayed-version-29.sh"; then
    print_status 0 "All displayed version strings are Version 29"
    echo "   ✓ Source files contain only Version 29 labels"
else
    print_status 1 "Found non-29 displayed version strings in source files"
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}PREFLIGHT BLOCKED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Cannot proceed with preflight."
    echo "All displayed version strings must be Version 29."
    exit 1
fi

# 1. Check environment configuration
print_section "1. Environment Configuration Check"

ENV_FILE="$FRONTEND_DIR/.env.production"

if [ -f "$ENV_FILE" ]; then
    if grep -q "^VITE_APP_ENV=Live" "$ENV_FILE"; then
        print_status 0 ".env.production exists and contains VITE_APP_ENV=Live"
        echo "   File: $ENV_FILE"
        echo "   Content: $(grep VITE_APP_ENV $ENV_FILE)"
        echo "   ✓ This ensures the production build embeds VITE_APP_ENV=Live"
    else
        print_status 1 ".env.production exists but VITE_APP_ENV is not set to Live"
        echo "   File: $ENV_FILE"
        echo "   Current content: $(cat $ENV_FILE)"
        echo "   Expected: VITE_APP_ENV=Live"
        echo "   Fix: Edit frontend/.env.production and set VITE_APP_ENV=Live"
    fi
else
    print_status 1 ".env.production file not found"
    echo "   Expected location: $ENV_FILE"
    echo "   Fix: Create frontend/.env.production with content:"
    echo "        VITE_APP_ENV=Live"
fi

# Verify environment.ts exists
if [ -f "$FRONTEND_DIR/src/config/environment.ts" ]; then
    print_status 0 "Environment configuration module exists"
else
    print_status 1 "Environment configuration module not found"
    echo "   Expected: frontend/src/config/environment.ts"
fi

# 2. Check Node.js and pnpm
print_section "2. Dependency Check"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js installed: $NODE_VERSION"
else
    print_status 1 "Node.js not found"
    echo "   Install Node.js from https://nodejs.org/"
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    print_status 0 "pnpm installed: $PNPM_VERSION"
else
    print_status 1 "pnpm not found"
    echo "   Install pnpm: npm install -g pnpm"
fi

if command -v dfx &> /dev/null; then
    DFX_VERSION=$(dfx --version)
    print_status 0 "dfx installed: $DFX_VERSION"
else
    print_status 1 "dfx not found"
    echo "   Install dfx from https://internetcomputer.org/docs/current/developer-docs/setup/install/"
fi

# 3. Backend build verification
print_section "3. Backend Build Verification"

echo "Building backend canister (validation only, NOT deploying)..."
echo "⚠️  This is a validation-only build for frontend deployment"
echo "⚠️  Backend canister will NOT be deployed or modified"
echo ""
cd "$REPO_ROOT"

if dfx build backend 2>&1 | tee /tmp/backend-build.log; then
    print_status 0 "Backend build successful (validation only)"
    echo "   ⚠️  Backend was NOT deployed or modified"
    echo "   ⚠️  This is a validation-only build"
    echo "   ✓ Frontend deployment will NOT touch backend"
else
    print_status 1 "Backend build failed"
    echo "   Check build log above for errors"
    echo "   Common issues:"
    echo "   - Motoko syntax errors in backend/main.mo"
    echo "   - Missing dependencies in dfx.json"
    echo "   - Incompatible Motoko version"
fi

# 4. Frontend dependency installation
print_section "4. Frontend Dependencies"

cd "$FRONTEND_DIR"

if [ -d "node_modules" ]; then
    echo "node_modules exists, verifying installation..."
    print_status 0 "Dependencies directory exists"
    
    # Quick sanity check for key dependencies
    if [ -d "node_modules/react" ] && [ -d "node_modules/vite" ]; then
        print_status 0 "Core dependencies present (react, vite)"
    else
        echo -e "${YELLOW}⚠${NC} Core dependencies may be missing, consider reinstalling"
        echo "   Run: cd frontend && rm -rf node_modules && pnpm install"
    fi
else
    echo "Installing dependencies..."
    if pnpm install; then
        print_status 0 "Dependencies installed successfully"
    else
        print_status 1 "Dependency installation failed"
        echo "   Try: cd frontend && rm -rf node_modules pnpm-lock.yaml && pnpm install"
    fi
fi

# 5. Generate backend bindings
print_section "5. Backend Bindings Generation"

echo "Generating TypeScript bindings from backend canister..."

if pnpm run prebuild 2>&1 | tee /tmp/prebuild.log; then
    print_status 0 "Backend bindings generated successfully"
    
    # Verify key binding files exist
    if [ -f "src/backend.d.ts" ]; then
        print_status 0 "Backend TypeScript definitions generated"
    else
        print_status 1 "Backend TypeScript definitions not found"
        echo "   Expected: frontend/src/backend.d.ts"
    fi
else
    print_status 1 "Backend bindings generation failed"
    echo "   Ensure backend canister is built first"
    echo "   Try: dfx build backend && cd frontend && pnpm run prebuild"
fi

# 6. Frontend build verification
print_section "6. Frontend Build Verification (Production Mode)"

echo "Building frontend with production configuration..."
echo "This will use frontend/.env.production (VITE_APP_ENV=Live)"
echo "✓ Confirming the production build embeds VITE_APP_ENV=Live"
echo ""

# Clean previous build
if [ -d "dist" ]; then
    echo "Cleaning previous build artifacts..."
    rm -rf dist
fi

if pnpm run build:skip-bindings 2>&1 | tee /tmp/frontend-build.log; then
    print_status 0 "Frontend build successful"
    
    # Check if dist directory was created
    if [ -d "dist" ]; then
        print_status 0 "Build output directory (dist/) created"
        
        # Count assets
        ASSET_COUNT=$(find dist -type f | wc -l)
        echo "   Build artifacts: $ASSET_COUNT files"
        
        # Verify environment configuration in build
        echo ""
        echo "Verifying environment badge configuration in compiled assets..."
        echo "✓ This confirms VITE_APP_ENV=Live is embedded in the production build"
        
        if grep -r "Live" dist/assets/*.js > /dev/null 2>&1; then
            print_status 0 "Environment 'Live' found in compiled assets"
            echo "   ✓ Environment badge will display 'Live' on production"
            echo "   ✓ Production build successfully embeds VITE_APP_ENV=Live"
        else
            print_status 1 "Environment 'Live' NOT found in compiled assets"
            echo "   ✗ Environment badge may display 'Draft' instead of 'Live'"
            echo "   ✗ This indicates the build did not pick up VITE_APP_ENV=Live"
            echo "   ✗ PREFLIGHT FAILURE: Production build must embed VITE_APP_ENV=Live"
            echo ""
            echo "   Troubleshooting:"
            echo "   1. Verify frontend/.env.production exists and contains VITE_APP_ENV=Live"
            echo "   2. Check frontend/src/config/environment.ts reads VITE_APP_ENV correctly"
            echo "   3. Ensure no other .env files override the production config"
            echo "   4. Try: rm -rf dist && pnpm run build:skip-bindings"
            PREFLIGHT_PASSED=false
        fi
        
        # Verify Version 29 in build output
        echo ""
        echo "Verifying Version 29 in compiled assets..."
        
        if grep -r "Version 29" dist/assets/*.js > /dev/null 2>&1; then
            print_status 0 "Version 29 found in compiled assets"
            echo "   ✓ Footer will display 'Version 29'"
        else
            print_status 1 "Version 29 NOT found in compiled assets"
            echo "   ✗ Version label may not display correctly"
            PREFLIGHT_PASSED=false
        fi
        
        # Check for any prohibited version references (35, 36, 37, etc.)
        echo ""
        echo "Checking for prohibited version references (35/36/37)..."
        
        if grep -rE "Version (3[5-9]|[4-9][0-9])" dist/ > /dev/null 2>&1; then
            print_status 1 "Found references to Version 35+ in build output"
            echo "   ✗ Build contains prohibited version references"
            echo "   ✗ Only Version 29 is allowed"
            PREFLIGHT_PASSED=false
        else
            print_status 0 "No prohibited version references found"
            echo "   ✓ Build output contains only Version 29"
        fi
        
        # Verify index.html exists
        if [ -f "dist/index.html" ]; then
            print_status 0 "Entry point (index.html) exists"
        else
            print_status 1 "Entry point (index.html) not found"
        fi
    else
        print_status 1 "Build output directory (dist/) not created"
        echo "   The build may have failed silently"
    fi
else
    print_status 1 "Frontend build failed"
    echo "   Check build log above for errors"
    echo "   Common issues:"
    echo "   - TypeScript type errors"
    echo "   - Missing dependencies"
    echo "   - Vite configuration issues"
fi

# Final summary
print_section "Preflight Summary"

if [ "$PREFLIGHT_PASSED" = true ]; then
    echo -e "${GREEN}✓ All preflight checks passed${NC}"
    echo ""
    echo "Ready to proceed with Live publish:"
    echo "  bash frontend/scripts/publish-live.sh"
    echo ""
    echo "⚠️  REMINDER: This will deploy FRONTEND ONLY"
    echo "   Backend canister will NOT be deployed or modified"
    exit 0
else
    echo -e "${RED}✗ Some preflight checks failed${NC}"
    echo ""
    echo "Cannot proceed with Live publish until all checks pass."
    echo "Review the failures above and fix them."
    echo ""
    echo "See frontend/docs/deployment-preflight.md for troubleshooting."
    exit 1
fi
