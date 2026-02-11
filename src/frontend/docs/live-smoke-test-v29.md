# Live Smoke Test Checklist - Version 29

This document provides a comprehensive manual verification checklist for Version 29 after publishing to Live production.

**Target URL:** https://radicaleconomist101-h78.caffeine.xyz

**Environment:** Live (not Draft)

**Version:** 29

---

## Pre-Test Setup

Before starting the smoke tests:

1. **Clear browser cache** to ensure you're seeing the latest deployment
2. **Open browser developer tools** (F12) to monitor console for errors
3. **Prepare test accounts** (if needed for purchase testing)
4. **Have this checklist ready** to record results

---

## Critical Verification Steps

### 1. Environment Badge Verification

**Purpose:** Confirm the site is running in Live mode (not Draft)

**Steps:**
1. Visit https://radicaleconomist101-h78.caffeine.xyz
2. Look at the header navigation
3. Locate the environment badge

**Expected Result:**
- ✅ Badge displays "Live" (not "Draft")
- ✅ Badge color matches Live theme (typically green or production color)

**If Failed:**
- ❌ Badge shows "Draft" → Build didn't embed `VITE_APP_ENV=Live`
- ❌ No badge visible → Environment configuration missing
- **Action:** Check `frontend/.env.production` and rebuild

**Record Result:**
- [ ] PASS - Badge shows "Live"
- [ ] FAIL - Badge shows "Draft" or missing

**Failure Capture:**
- URL: https://radicaleconomist101-h78.caffeine.xyz
- Step: Environment badge check
- Expected: Badge displays "Live"
- Observed: ___________________________
- Console Errors: ___________________________

---

### 2. Version Label Verification

**Purpose:** Confirm the footer displays "Version 29"

**Steps:**
1. Scroll to the bottom of the page
2. Locate the footer
3. Check the version label

**Expected Result:**
- ✅ Footer displays "Version 29"
- ✅ Version label is clearly visible

**If Failed:**
- ❌ Wrong version shown → Wrong version deployed
- ❌ No version label → Footer component issue
- **Action:** Verify correct version deployed

**Record Result:**
- [ ] PASS - Footer shows "Version 29"
- [ ] FAIL - Wrong version or missing

**Failure Capture:**
- URL: https://radicaleconomist101-h78.caffeine.xyz
- Step: Version label check
- Expected: "Version 29"
- Observed: ___________________________

---

### 3. Catalog Page Verification

**Purpose:** Verify books display correctly with proper data

**Steps:**
1. Navigate to https://radicaleconomist101-h78.caffeine.xyz/catalog
2. Observe the book grid/list
3. Check individual book cards

**Expected Result:**
- ✅ Books load and display
- ✅ Book titles are correct
- ✅ Book authors are correct
- ✅ Book prices display correctly
- ✅ Cover images load (ExternalBlob direct URLs)
- ✅ Restriction badges show (single-copy, KYC) if applicable
- ✅ Sold-out overlay appears for unavailable single-copy books

**If Failed:**
- ❌ No books display → Backend connection issue or empty catalog
- ❌ Cover images broken → ExternalBlob URL issue
- ❌ Prices wrong → Data mismatch
- **Action:** Check browser console, verify backend connection

**Record Result:**
- [ ] PASS - All books display correctly
- [ ] FAIL - Issues found (describe below)

**Failure Capture:**
- URL: /catalog
- Step: ___________________________
- Expected: Books display with covers, titles, authors, prices
- Observed: ___________________________
- Console Errors: ___________________________

---

### 4. Book Details Page Verification

**Purpose:** Verify individual book pages render correctly with media

**Steps:**
1. Click on a book from the catalog
2. Observe the book details page
3. Check all media elements

**Expected Result:**
- ✅ Book title, author, price display correctly
- ✅ Cover image loads (ExternalBlob direct URL)
- ✅ Book description/content displays
- ✅ Restriction badges show (single-copy, KYC) if applicable
- ✅ "Add to Cart" button is functional
- ✅ Sold-out message appears for unavailable single-copy books

**If Failed:**
- ❌ Cover image broken → ExternalBlob URL issue
- ❌ Add to Cart fails → Backend connection or cart logic issue
- **Action:** Check browser console, test backend connection

**Record Result:**
- [ ] PASS - Book details display correctly
- [ ] FAIL - Issues found (describe below)

**Failure Capture:**
- URL: /book/:id
- Step: ___________________________
- Expected: Complete book details with functional Add to Cart
- Observed: ___________________________
- Console Errors: ___________________________

---

### 5. Purchase Flow Verification

**Purpose:** Verify the complete purchase workflow without runtime errors

**Steps:**
1. Add a book to cart
2. Navigate to cart page
3. Proceed to checkout
4. Complete purchase (if test account has balance)
5. View order confirmation

**Expected Result:**
- ✅ Add to cart succeeds
- ✅ Cart page shows correct items and quantities
- ✅ Cart total calculates correctly
- ✅ Checkout page loads
- ✅ KYC verification card appears for restricted books
- ✅ Purchase completes successfully
- ✅ Order confirmation displays with order ID
- ✅ Thank-you icon animates on confirmation page
- ✅ No runtime errors in console

**If Failed:**
- ❌ Add to cart fails → Backend connection issue
- ❌ Cart total wrong → Calculation logic issue
- ❌ Checkout fails → Payment or backend issue
- **Action:** Check browser console, verify backend connection

**Record Result:**
- [ ] PASS - Purchase flow works end-to-end without errors
- [ ] FAIL - Issues found (describe below)

**Failure Capture:**
- URL: ___________________________
- Step: ___________________________
- Expected: Smooth purchase flow without runtime errors
- Observed: ___________________________
- Console Errors: ___________________________

---

### 6. My Library Verification

**Purpose:** Verify purchased books appear in user library

**Steps:**
1. Navigate to https://radicaleconomist101-h78.caffeine.xyz/library
2. Observe purchased books
3. Check library cards

**Expected Result:**
- ✅ Purchased books display in library
- ✅ Cover images load (ExternalBlob direct URLs)
- ✅ "Read" buttons are functional
- ✅ PDF download icons appear
- ✅ Media count badges show (images/audio/video)

**If Failed:**
- ❌ No books in library → Order not processed or query issue
- ❌ Cover images broken → ExternalBlob URL issue
- **Action:** Check browser console, verify order was created

**Record Result:**
- [ ] PASS - Library displays purchased books correctly
- [ ] FAIL - Issues found (describe below)

**Failure Capture:**
- URL: /library
- Step: ___________________________
- Expected: Purchased books with covers and download options
- Observed: ___________________________
- Console Errors: ___________________________

---

### 7. PDF Download Verification

**Purpose:** Verify PDF downloads work from library

**Steps:**
1. In My Library, locate a purchased book with PDF
2. Click the PDF download icon
3. Observe download behavior

**Expected Result:**
- ✅ PDF download initiates
- ✅ File downloads successfully
- ✅ PDF opens and displays correctly
- ✅ No authorization errors

**If Failed:**
- ❌ Download fails → Backend authorization or media fetch issue
- ❌ PDF corrupted → ExternalBlob data issue
- **Action:** Check browser console, verify backend media endpoint

**Record Result:**
- [ ] PASS - PDF downloads successfully
- [ ] FAIL - Issues found (describe below)

**Failure Capture:**
- URL: /library
- Step: PDF download
- Expected: Successful download and PDF opens
- Observed: ___________________________
- Console Errors: ___________________________

---

### 8. Admin Dashboard Verification (Admin Only)

**Purpose:** Verify admin functions work correctly

**Steps:**
1. Log in as admin
2. Navigate to https://radicaleconomist101-h78.caffeine.xyz/admin
3. Check all admin tabs

**Expected Result:**
- ✅ Admin dashboard loads
- ✅ Catalog tab shows all books
- ✅ Orders tab shows all orders
- ✅ Token minting tab is functional
- ✅ Support inbox tab shows messages
- ✅ Settings tab loads with store reset option

**If Failed:**
- ❌ Access denied → Admin role not assigned
- ❌ Tabs don't load → Backend connection issue
- **Action:** Check admin role, verify backend connection

**Record Result:**
- [ ] PASS - Admin dashboard fully functional
- [ ] FAIL - Issues found (describe below)
- [ ] N/A - Not an admin user

**Failure Capture:**
- URL: /admin
- Step: ___________________________
- Expected: All admin tabs functional
- Observed: ___________________________
- Console Errors: ___________________________

---

### 9. ExternalBlob Direct URL Validation

**Purpose:** Verify uploaded media uses direct URLs (not byte conversion)

**Steps:**
1. Open browser developer tools (F12)
2. Navigate to a book with uploaded cover image
3. Inspect the image element
4. Check the `src` attribute

**Expected Result:**
- ✅ Image `src` uses a direct URL (not blob: or data:)
- ✅ URL format matches ExternalBlob.getDirectURL() pattern
- ✅ Images load quickly (streaming, not full download)

**If Failed:**
- ❌ Using blob: URLs → Code using getBytes() instead of getDirectURL()
- ❌ Images load slowly → Not using direct URLs
- **Action:** Check CoverImage component implementation

**Record Result:**
- [ ] PASS - Using ExternalBlob direct URLs
- [ ] FAIL - Not using direct URLs

---

### 10. Cross-Browser Testing

**Purpose:** Verify the site works across major browsers

**Browsers to Test:**
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

**For Each Browser:**
1. Visit https://radicaleconomist101-h78.caffeine.xyz
2. Check environment badge shows "Live"
3. Navigate through catalog
4. View a book details page
5. Check for console errors

**Expected Result:**
- ✅ Site loads in all browsers
- ✅ Environment badge shows "Live" in all browsers
- ✅ No critical console errors
- ✅ UI renders correctly

**Record Result:**
- [ ] PASS - Works in all tested browsers
- [ ] FAIL - Issues in specific browsers (list below)

**Browser-Specific Issues:**
- Browser: ___________________________
- Issue: ___________________________
- Console Errors: ___________________________

---

## Failure Capture Template

Use this template to record any failures:

**Failure #1:**
- URL: ___________________________
- Step: ___________________________
- Expected: ___________________________
- Observed: ___________________________
- Console Errors: ___________________________
- Follow-up Action: ___________________________

**Failure #2:**
- URL: ___________________________
- Step: ___________________________
- Expected: ___________________________
- Observed: ___________________________
- Console Errors: ___________________________
- Follow-up Action: ___________________________

**Failure #3:**
- URL: ___________________________
- Step: ___________________________
- Expected: ___________________________
- Observed: ___________________________
- Console Errors: ___________________________
- Follow-up Action: ___________________________

---

## Post-Test Summary

**Overall Result:**
- [ ] All tests passed - Live deployment successful
- [ ] Some tests failed - Issues require attention
- [ ] Critical failures - Rollback recommended

**Critical Issues (if any):**
1. ___________________________
2. ___________________________
3. ___________________________

**Non-Critical Issues (if any):**
1. ___________________________
2. ___________________________
3. ___________________________

**Recommended Actions:**
- ___________________________
- ___________________________
- ___________________________

**Tested By:** ___________________________
**Date:** ___________________________
**Time:** ___________________________

---

## Troubleshooting Guide

### Environment Badge Shows "Draft"

**Cause:** Production build didn't embed `VITE_APP_ENV=Live`

**Fix:**
1. Verify `frontend/.env.production` contains `VITE_APP_ENV=Live`
2. Rebuild and redeploy:
   ```bash
   cd frontend
   rm -rf dist
   pnpm run build:skip-bindings
   cd ..
   dfx deploy frontend --network ic
   ```
3. Clear browser cache and retest

### Cover Images Not Loading

**Cause:** ExternalBlob URL issue or backend connection problem

**Fix:**
1. Check browser console for errors
2. Verify backend canister is running:
   ```bash
   dfx canister status backend --network ic
   ```
3. Check CoverImage component uses `getDirectURL()`
4. Verify blob storage is working

### Purchase Flow Fails

**Cause:** Backend connection issue, insufficient balance, or cart logic error

**Fix:**
1. Check browser console for errors
2. Verify user has sufficient balance
3. Check backend logs for errors
4. Verify cart and checkout backend methods are working

### PDF Download Fails

**Cause:** Authorization error or media fetch issue

**Fix:**
1. Check browser console for errors
2. Verify user purchased the book
3. Check backend `fetchPurchasedBookMedia` method
4. Verify ExternalBlob data is valid

---

## Quick Reference

**Live Site URL:** https://radicaleconomist101-h78.caffeine.xyz

**Key Pages to Test:**
- Home: /
- Catalog: /catalog
- Book Details: /book/:id
- Cart: /cart
- Checkout: /checkout
- Library: /library
- Admin: /admin

**Expected Environment Badge:** "Live" (not "Draft")

**Expected Version Label:** "Version 29"

**Helper Script:**
