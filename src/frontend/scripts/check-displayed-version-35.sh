#!/bin/bash

# Displayed Version Validation for Version 35 Rollback
# Ensures UI version labels match the rollback target

set -e

echo "=================================================="
echo "  Version 35 Displayed Version Validation"
echo "=================================================="
echo ""

# Check 1: Validate VERSION file is 35
echo "✓ Check 1: Validating VERSION file..."
if [ ! -f "VERSION" ]; then
  echo "❌ FAIL: VERSION file not found"
  exit 1
fi

VERSION=$(cat VERSION | tr -d '[:space:]')
if [ "$VERSION" != "35" ]; then
  echo "❌ FAIL: VERSION must be exactly '35' for this validation"
  echo "  Current VERSION: '$VERSION'"
  exit 1
fi
echo "  ✅ VERSION is 35"
echo ""

# Check 2: Scan for hardcoded version labels in source files
echo "✓ Check 2: Scanning for hardcoded version labels..."
echo "  Searching for 'Version <number>' patterns in source files..."

# Search for hardcoded version strings (excluding Version 35)
HARDCODED_VERSIONS=$(grep -r "Version [0-9]\+" src/ --include="*.tsx" --include="*.ts" | grep -v "Version 35" | grep -v "node_modules" || true)

if [ -n "$HARDCODED_VERSIONS" ]; then
  echo ""
  echo "❌ FAIL: Found hardcoded version labels that are not 'Version 35':"
  echo ""
  echo "$HARDCODED_VERSIONS"
  echo ""
  echo "ERROR: The UI contains hardcoded version labels that do not match Version 35."
  echo "       All displayed version labels must be 'Version 35' for this rollback."
  echo ""
  echo "ACTION REQUIRED:"
  echo "  1. Update Footer.tsx to use build-time version variable (VITE_APP_VERSION)"
  echo "  2. Remove any other hardcoded version strings"
  echo "  3. Re-run this validation"
  exit 1
fi
echo "  ✅ No conflicting hardcoded version labels found"
echo ""

# Check 3: Verify Footer uses build-time version variable
echo "✓ Check 3: Verifying Footer uses build-time version variable..."
if [ ! -f "src/components/layout/Footer.tsx" ]; then
  echo "❌ FAIL: Footer.tsx not found"
  exit 1
fi

# Check if Footer.tsx uses VITE_APP_VERSION
if grep -q "VITE_APP_VERSION" src/components/layout/Footer.tsx; then
  echo "  ✅ Footer.tsx uses VITE_APP_VERSION build-time variable"
else
  echo "❌ FAIL: Footer.tsx does not use VITE_APP_VERSION"
  echo "  The footer must use import.meta.env.VITE_APP_VERSION to display the version"
  echo "  This allows the rollback script to set the version at build time"
  exit 1
fi
echo ""

echo "=================================================="
echo "  ✅ All Displayed Version Checks Passed"
echo "=================================================="
echo ""
echo "The UI is configured to display 'Version 35' after rollback build."
echo ""
