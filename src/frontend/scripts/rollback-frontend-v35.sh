#!/bin/bash

# Rollback to Version 35 - Frontend Only (Draft Mode)
# This script performs an emergency rollback to Version 35 without touching the backend

set -e

echo "=================================================="
echo "  BookCoin Frontend Rollback to Version 35 (Draft)"
echo "=================================================="
echo ""
echo "⚠️  CRITICAL SAFETY WARNINGS:"
echo ""
echo "This script will:"
echo "  ✓ Update VERSION file to 35"
echo "  ✓ Rebuild frontend with Version 35 and Draft environment"
echo "  ✓ Deploy ONLY the frontend canister"
echo ""
echo "This script will NOT:"
echo "  ✗ Deploy, reinstall, stop, or reset the backend"
echo "  ✗ Modify any backend state or data"
echo "  ✗ Run any backend migrations"
echo "  ✗ Publish to Live (this is a Draft rollback)"
echo ""
echo "All previously uploaded books and user data will be preserved."
echo ""

# Validate we're in the frontend directory
if [ ! -f "VERSION" ]; then
  echo "❌ ERROR: VERSION file not found. Are you in the frontend directory?"
  exit 1
fi

# Check current version
CURRENT_VERSION=$(cat VERSION | tr -d '[:space:]')
echo "Current version: $CURRENT_VERSION"
echo "Target version: 35"
echo "Target environment: Draft"
echo ""

# Require explicit confirmation
read -p "Do you want to proceed with rollback to Version 35 (Draft)? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Rollback cancelled by user."
  exit 1
fi

echo ""
echo "Starting rollback process..."
echo ""

# Step 1: Update VERSION file
echo "📝 Step 1: Updating VERSION file to 35..."
echo "35" > VERSION
NEW_VERSION=$(cat VERSION | tr -d '[:space:]')

if [ "$NEW_VERSION" != "35" ]; then
  echo "❌ ERROR: Failed to update VERSION file to 35"
  exit 1
fi
echo "✅ VERSION file updated to 35"
echo ""

# Step 2: Run rollback preflight checks
echo "🔍 Step 2: Running rollback preflight checks..."
if [ -f "scripts/rollback-preflight.sh" ]; then
  chmod +x scripts/rollback-preflight.sh
  ./scripts/rollback-preflight.sh
  echo "✅ Preflight checks passed"
else
  echo "⚠️  Warning: rollback-preflight.sh not found, skipping preflight checks"
fi
echo ""

# Step 3: Clean build artifacts
echo "🧹 Step 3: Cleaning build artifacts..."
rm -rf dist/
rm -rf .vite/
echo "✅ Build artifacts cleaned"
echo ""

# Step 4: Rebuild frontend with Draft environment and Version 35
echo "🔨 Step 4: Building frontend with Version 35 and Draft configuration..."
echo "  Setting VITE_APP_ENV=Draft"
echo "  Setting VITE_APP_VERSION=35"
VITE_APP_ENV=Draft VITE_APP_VERSION=35 npm run build
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Frontend build failed"
  exit 1
fi
echo "✅ Frontend build completed"
echo ""

# Step 5: Verify build output
echo "🔍 Step 5: Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ ERROR: dist/ directory not found after build"
  exit 1
fi
echo "✅ Build output verified"
echo ""

# Step 6: Deploy frontend only
echo "🚀 Step 6: Deploying frontend canister (FRONTEND ONLY)..."
echo ""
echo "⚠️  REMINDER: This deploys ONLY the frontend canister."
echo "    The backend canister will NOT be touched."
echo ""
dfx deploy frontend
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Frontend deployment failed"
  exit 1
fi
echo "✅ Frontend deployed successfully"
echo ""

# Step 7: Print verification steps
echo "=================================================="
echo "  ✅ Rollback to Version 35 (Draft) Complete"
echo "=================================================="
echo ""
echo "📋 POST-ROLLBACK VERIFICATION CHECKLIST:"
echo ""
echo "1. Environment Badge:"
echo "   - Check the header badge displays 'Draft'"
echo "   - Confirm it is NOT showing 'Live'"
echo ""
echo "2. Version Indicator:"
echo "   - Scroll to the footer"
echo "   - Confirm 'Version 35' is displayed"
echo ""
echo "3. Catalog Visibility:"
echo "   - Navigate to the Catalog page"
echo "   - Confirm previously uploaded books are visible"
echo "   - Check that book covers display correctly"
echo ""
echo "4. Book Details:"
echo "   - Click on at least one book"
echo "   - Confirm the book details page loads successfully"
echo ""
echo "5. Console Errors:"
echo "   - Open browser developer console (F12)"
echo "   - Check for any errors related to book fetching"
echo "   - If errors exist, note them for troubleshooting"
echo ""
echo "📖 For detailed verification steps, see:"
echo "   frontend/docs/rollback-to-v35.md"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "   - This is a DRAFT deployment, not Live"
echo "   - Live publish remains locked to Version 29"
echo "   - To publish to Live, use the Live publish workflow"
echo ""
echo "⚠️  If catalog is still empty:"
echo "   - Check browser console for errors"
echo "   - Verify backend is running: dfx canister status backend"
echo "   - Clear browser cache and hard refresh"
echo "   - See troubleshooting section in rollback-to-v35.md"
echo ""
echo "=================================================="
