#!/bin/bash

# Live Smoke Test Helper - Version 22
# Displays the smoke test checklist and key URLs for manual verification

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "Live Smoke Test - Version 22"
echo "=========================================="
echo ""
echo -e "${BLUE}This helper displays the manual verification checklist.${NC}"
echo -e "${BLUE}Follow each step to verify your Live deployment.${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 Key URLs${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Live Site:     https://radicaleconomist101-h78.caffeine.xyz"
echo "Catalog:       https://radicaleconomist101-h78.caffeine.xyz/catalog"
echo "My Library:    https://radicaleconomist101-h78.caffeine.xyz/library"
echo "Admin:         https://radicaleconomist101-h78.caffeine.xyz/admin"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}✓ Smoke Test Checklist${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}1. Environment Badge Verification${NC}"
echo "   [ ] Visit https://radicaleconomist101-h78.caffeine.xyz"
echo "   [ ] Check header shows 'Live' badge (not 'Draft')"
echo "   [ ] Badge should have default variant styling"
echo ""

echo -e "${YELLOW}2. Catalog Verification${NC}"
echo "   [ ] Navigate to /catalog"
echo "   [ ] Verify books from Version 22 are visible"
echo "   [ ] Check book count matches expected count"
echo "   [ ] Verify book titles and authors display correctly"
echo "   [ ] Check book cover images render (not broken/placeholder)"
echo ""

echo -e "${YELLOW}3. Book Details & Media Rendering${NC}"
echo "   [ ] Click on a book to view details"
echo "   [ ] Verify cover image displays using ExternalBlob direct URL"
echo "   [ ] Check price and description are correct"
echo "   [ ] Verify 'Add to Cart' button is functional"
echo "   [ ] Test with multiple books"
echo ""

echo -e "${YELLOW}4. Purchase Flow (End-to-End)${NC}"
echo "   [ ] Log in with Internet Identity"
echo "   [ ] Add a book to cart"
echo "   [ ] Navigate to /cart"
echo "   [ ] Verify cart shows correct book and quantity"
echo "   [ ] Click 'Proceed to Checkout'"
echo "   [ ] Complete checkout (ensure sufficient GLDT balance)"
echo "   [ ] Verify redirect to purchase confirmation page"
echo "   [ ] Check confirmation message displays"
echo ""

echo -e "${YELLOW}5. Library & PDF Download${NC}"
echo "   [ ] Navigate to /library (My Library)"
echo "   [ ] Verify purchased book appears in library"
echo "   [ ] Check book cover renders correctly"
echo "   [ ] Click 'Read' button to open book content dialog"
echo "   [ ] Verify PDF download button is visible"
echo "   [ ] Click PDF download and verify file downloads"
echo "   [ ] Open downloaded PDF and verify it's correct"
echo ""

echo -e "${YELLOW}6. Admin Functions (if applicable)${NC}"
echo "   [ ] Navigate to /admin"
echo "   [ ] Check catalog tab shows all books"
echo "   [ ] Verify orders tab shows recent test order"
echo "   [ ] Test Settings → Import Catalog (if needed)"
echo ""

echo -e "${YELLOW}7. ExternalBlob Direct URL Validation${NC}"
echo "   [ ] Open browser DevTools → Network tab"
echo "   [ ] Navigate to a book detail page"
echo "   [ ] Verify cover image loads via direct URL (not base64)"
echo "   [ ] Check URL format matches ExternalBlob.getDirectURL() pattern"
echo "   [ ] Verify images load quickly (streaming, not full download)"
echo ""

echo -e "${YELLOW}8. Cross-Browser Testing (Optional)${NC}"
echo "   [ ] Test in Chrome/Edge"
echo "   [ ] Test in Firefox"
echo "   [ ] Test in Safari (if available)"
echo "   [ ] Test on mobile device"
echo ""

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📝 Notes${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "- If environment badge shows 'Draft', check frontend/.env.production"
echo "- If books are missing, import Version 22 catalog via Admin → Settings"
echo "- If covers don't display, verify ExternalBlob URLs are accessible"
echo "- If PDF download fails, check browser console for errors"
echo ""
echo "For detailed instructions, see:"
echo "  frontend/docs/live-smoke-test-v22.md"
echo ""
echo -e "${BLUE}Happy testing! 🎉${NC}"
echo ""
