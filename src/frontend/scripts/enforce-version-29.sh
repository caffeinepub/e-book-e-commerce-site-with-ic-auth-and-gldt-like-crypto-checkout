#!/bin/bash

# Version 29 Enforcement Guard
# Ensures only Version 29 can be built or published
# This script is called by all deployment workflows to prevent non-29 versions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VERSION_FILE="$REPO_ROOT/frontend/VERSION"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Check if VERSION file exists
if [ ! -f "$VERSION_FILE" ]; then
    echo -e "${RED}✗ VERSION file not found${NC}"
    echo ""
    echo "Expected location: $VERSION_FILE"
    echo ""
    echo "Only Version 29 is allowed."
    echo "Cannot proceed."
    exit 1
fi

# Read and trim version
CURRENT_VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')

# Enforce Version 29 only
if [ "$CURRENT_VERSION" != "29" ]; then
    echo -e "${RED}✗ Version check failed${NC}"
    echo ""
    echo "Expected version: 29"
    echo "Current version:  $CURRENT_VERSION"
    echo ""
    echo -e "${RED}Only Version 29 is allowed.${NC}"
    echo ""
    echo "This deployment workflow is locked to Version 29."
    echo "No other version may be created or published."
    echo ""
    echo "To fix this:"
    echo "  1. Ensure frontend/VERSION contains exactly '29'"
    echo "  2. Do not create or publish any other version"
    echo ""
    echo "Cannot proceed."
    exit 1
fi

# Success
echo -e "${GREEN}✓ Version verified: 29${NC}"
exit 0
