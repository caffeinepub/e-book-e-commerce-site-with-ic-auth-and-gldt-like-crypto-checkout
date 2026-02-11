#!/bin/bash

# Check Displayed Version 29 Script
# Scans frontend source files for hardcoded displayed version strings
# Fails if any displayed version number is not 29

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=================================================="
echo "  Displayed Version 29 Check"
echo "=================================================="
echo ""
echo "Scanning frontend source files for hardcoded version strings..."
echo ""

# Read VERSION file
if [ ! -f "$FRONTEND_DIR/VERSION" ]; then
  echo "❌ FAIL: VERSION file not found"
  exit 1
fi

VERSION=$(cat "$FRONTEND_DIR/VERSION" | tr -d '[:space:]')

echo "Expected VERSION: '$VERSION'"
echo ""

# Search for "Version <number>" patterns in source files
# Exclude node_modules, dist, and other build artifacts
SEARCH_DIRS="$FRONTEND_DIR/src"

# Find all TypeScript/JavaScript/TSX/JSX files
SOURCE_FILES=$(find "$SEARCH_DIRS" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null || true)

if [ -z "$SOURCE_FILES" ]; then
  echo "⚠️  WARNING: No source files found to scan"
  exit 0
fi

# Track if we found any non-29 version strings
FOUND_INVALID_VERSION=false
INVALID_FILES=""

# Scan each file for "Version <number>" patterns
while IFS= read -r file; do
  # Look for "Version" followed by a space and digits
  # This matches patterns like "Version 35", "Version 30", etc.
  MATCHES=$(grep -n "Version [0-9]\+" "$file" 2>/dev/null || true)
  
  if [ -n "$MATCHES" ]; then
    # Check if any match is NOT "Version 29"
    NON_29_MATCHES=$(echo "$MATCHES" | grep -v "Version 29" || true)
    
    if [ -n "$NON_29_MATCHES" ]; then
      FOUND_INVALID_VERSION=true
      INVALID_FILES="$INVALID_FILES\n  $file"
      echo "❌ Found non-29 version string in: $file"
      echo "$NON_29_MATCHES" | sed 's/^/     /'
      echo ""
    fi
  fi
done <<< "$SOURCE_FILES"

if [ "$FOUND_INVALID_VERSION" = true ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ FAIL: Found hardcoded version strings that are not Version 29"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "The following files contain displayed version strings other than 29:"
  echo -e "$INVALID_FILES"
  echo ""
  echo "To fix:"
  echo "  1. Update all displayed version strings to 'Version 29'"
  echo "  2. Ensure frontend/VERSION contains exactly '29'"
  echo "  3. Re-run this check"
  echo ""
  echo "Only Version 29 is allowed for Live publish."
  echo ""
  exit 1
fi

echo "✅ PASS: All displayed version strings are Version 29"
echo ""
echo "No hardcoded non-29 version strings found in source files."
echo "Proceeding with deployment..."
echo ""
