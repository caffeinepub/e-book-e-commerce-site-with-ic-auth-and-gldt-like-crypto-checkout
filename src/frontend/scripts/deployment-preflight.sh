#!/bin/bash

# Deployment Preflight Script
# Validates build configuration and runs builds before Live deployment

set -e  # Exit on first error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"

echo "=========================================="
echo "Deployment Preflight Check"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 1. Check environment configuration
print_section "1. Environment Configuration Check"

if [ -f "$FRONTEND_DIR/.env.production" ]; then
    if grep -q "VITE_APP_ENV=Live" "$FRONTEND_DIR/.env.production"; then
        print_status 0 ".env.production exists and contains VITE_APP_ENV=Live"
    else
        print_status 1 ".env.production exists but VITE_APP_ENV is not set to Live"
        echo "   Expected: VITE_APP_ENV=Live"
        echo "   Fix: Add 'VITE_APP_ENV=Live' to frontend/.env.production"
    fi
else
    print_status 1 ".env.production file not found"
    echo "   Create frontend/.env.production with content: VITE_APP_ENV=Live"
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

echo "Building backend canister..."
cd "$REPO_ROOT"

if dfx build backend 2>&1 | tee /tmp/backend-build.log; then
    print_status 0 "Backend build successful"
else
    print_status 1 "Backend build failed"
    echo "   Check build log above for errors"
    echo "   Common issues:"
    echo "   - Motoko syntax errors in backend/main.mo"
    echo "   - Missing dependencies in dfx.json"
fi

# 4. Frontend dependency installation
print_section "4. Frontend Dependencies"

cd "$FRONTEND_DIR"

if [ -d "node_modules" ]; then
    echo "node_modules exists, checking if clean install is needed..."
    print_status 0 "Dependencies directory exists"
else
    echo "Installing dependencies..."
    if pnpm install; then
        print_status 0 "Dependencies installed successfully"
    else
        print_status 1 "Dependency installation failed"
        echo "   Try: cd frontend && rm -rf node_modules && pnpm install"
    fi
fi

# 5. Generate backend bindings
print_section "5. Backend Bindings Generation"

if pnpm run prebuild 2>&1 | tee /tmp/prebuild.log; then
    print_status 0 "Backend bindings generated successfully"
else
    print_status 1 "Backend bindings generation failed"
    echo "   Ensure backend canister is built first"
fi

# 6. Frontend build verification
print_section "6. Frontend Build Verification"

echo "Building frontend with production configuration..."

if pnpm run build:skip-bindings 2>&1 | tee /tmp/frontend-build.log; then
    print_status 0 "Frontend build successful"
    
    # Check if dist directory was created
    if [ -d "dist" ]; then
        print_status 0 "Build output directory (dist/) created"
        
        # Verify environment configuration in build
        if grep -r "Live" dist/assets/*.js > /dev/null 2>&1; then
            print_status 0 "Environment 'Live' found in compiled assets"
        else
            print_status 1 "Environment 'Live' NOT found in compiled assets"
            echo "   The build may not have picked up VITE_APP_ENV=Live"
            echo "   Verify frontend/.env.production exists and contains VITE_APP_ENV=Live"
        fi
    else
        print_status 1 "Build output directory (dist/) not created"
    fi
else
    print_status 1 "Frontend build failed"
    echo "   Check build log above for errors"
    echo "   Common issues:"
    echo "   - TypeScript type errors"
    echo "   - Missing imports or modules"
    echo "   - Build configuration issues"
fi

# Final summary
print_section "Preflight Summary"

if [ "$PREFLIGHT_PASSED" = true ]; then
    echo -e "${GREEN}✓ All preflight checks passed!${NC}"
    echo ""
    echo "You are ready to deploy to Live."
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some preflight checks failed.${NC}"
    echo ""
    echo "Please fix the issues above before deploying to Live."
    echo "See frontend/docs/deployment-preflight.md for detailed troubleshooting."
    echo ""
    exit 1
fi
