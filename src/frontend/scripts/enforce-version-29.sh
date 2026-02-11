#!/bin/bash

# Version 29 Enforcement Script
# This script is the Live publish guardrail - it blocks immediately if VERSION is not exactly '29'

set -e

echo "=================================================="
echo "  Version 29 Enforcement Check"
echo "=================================================="
echo ""
echo "This script enforces that ONLY Version 29 can be published to Live."
echo ""

# Check if VERSION file exists
if [ ! -f "VERSION" ]; then
  echo "❌ FAIL: VERSION file not found"
  echo ""
  echo "The VERSION file must exist in the frontend directory."
  exit 1
fi

# Read VERSION and strip all whitespace
VERSION=$(cat VERSION | tr -d '[:space:]')

echo "Current VERSION: '$VERSION'"
echo "Required VERSION: '29'"
echo ""

# Strict version check
if [ "$VERSION" != "29" ]; then
  echo "❌ FAIL: VERSION must be exactly '29' for Live publish"
  echo ""
  echo "Current VERSION is '$VERSION', which is not permitted for Live deployment."
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  IMPORTANT: This is intentional version control."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "If you need to deploy a different version (e.g., Version 35):"
  echo "  → Use the separate rollback/testing workflow"
  echo "  → See: frontend/docs/rollback-to-v35.md"
  echo "  → Run: frontend/scripts/rollback-frontend-v35.sh"
  echo ""
  echo "Do NOT modify this version check to bypass the safeguard."
  echo ""
  exit 1
fi

echo "✅ PASS: VERSION is exactly '29'"
echo ""
echo "Version 29 is approved for Live publish."
echo "Proceeding with deployment..."
echo ""
