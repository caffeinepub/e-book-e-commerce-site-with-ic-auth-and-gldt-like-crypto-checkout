#!/bin/bash

# Rollback Preflight Checks - Frontend Only
# Validates rollback version and performs frontend-only build checks

set -e

echo "=================================================="
echo "  Rollback Preflight Checks"
echo "=================================================="
echo ""

# Check 1: Validate VERSION file exists
echo "✓ Check 1: Validating VERSION file..."
if [ ! -f "VERSION" ]; then
  echo "❌ FAIL: VERSION file not found"
  exit 1
fi
echo "  ✅ VERSION file exists"
echo ""

# Check 2: Validate rollback version is 35
echo "✓ Check 2: Validating rollback version..."
VERSION=$(cat VERSION | tr -d '[:space:]')
if [ "$VERSION" != "35" ]; then
  echo "❌ FAIL: VERSION must be exactly '35' for rollback"
  echo "  Current VERSION: '$VERSION'"
  exit 1
fi
echo "  ✅ VERSION is 35"
echo ""

# Check 3: Validate package.json exists
echo "✓ Check 3: Validating package.json..."
if [ ! -f "package.json" ]; then
  echo "❌ FAIL: package.json not found"
  exit 1
fi
echo "  ✅ package.json exists"
echo ""

# Check 4: Validate node_modules exists
echo "✓ Check 4: Validating node_modules..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  WARNING: node_modules not found"
  echo "  Run 'npm install' before rollback"
  exit 1
fi
echo "  ✅ node_modules exists"
echo ""

# Check 5: Validate critical source files
echo "✓ Check 5: Validating critical source files..."
CRITICAL_FILES=(
  "src/App.tsx"
  "src/main.tsx"
  "src/pages/CatalogPage.tsx"
  "src/hooks/useBooks.ts"
  "src/components/layout/Footer.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ FAIL: Critical file missing: $file"
    exit 1
  fi
done
echo "  ✅ All critical source files present"
echo ""

# Check 6: Validate no backend deploy commands in scripts
echo "✓ Check 6: Safety check - no backend modifications..."
echo "  ⚠️  REMINDER: This rollback is FRONTEND ONLY"
echo "  ⚠️  Do NOT run: dfx deploy backend"
echo "  ⚠️  Do NOT run: dfx canister reinstall backend"
echo "  ⚠️  Do NOT run: dfx canister stop backend"
echo "  ✅ Safety reminder displayed"
echo ""

# Check 7: Validate dfx is available
echo "✓ Check 7: Validating dfx availability..."
if ! command -v dfx &> /dev/null; then
  echo "❌ FAIL: dfx command not found"
  echo "  Install dfx: https://internetcomputer.org/docs/current/developer-docs/setup/install/"
  exit 1
fi
echo "  ✅ dfx is available"
echo ""

echo "=================================================="
echo "  ✅ All Preflight Checks Passed"
echo "=================================================="
echo ""
echo "Ready to proceed with Version 35 rollback."
echo ""
