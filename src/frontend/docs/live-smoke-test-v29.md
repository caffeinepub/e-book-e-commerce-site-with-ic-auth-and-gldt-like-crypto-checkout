# Live Smoke Test - Version 29

## Overview
This document provides a comprehensive manual verification checklist for validating the BookCoin frontend after deploying Version 29 to the Live production environment.

## Purpose
Ensure that Version 29 functions correctly in the Live environment before announcing to users.

## Prerequisites
- Version 29 has been deployed to Live
- You have access to the Live site URL
- Browser developer tools available (F12)

## Verification Checklist

### 1. Environment Badge Verification ✅

**Goal**: Confirm the Live environment is correctly identified

**Steps**:
1. Navigate to the Live site
2. Check the header for environment badge
3. Verify badge displays "Live" (not "Draft")

**Expected Result**: Environment badge shows "Live"

**If Failed**:
- Check `.env.production` contains `VITE_APP_ENV=Live`
- Rebuild and redeploy frontend
- Clear browser cache

---

### 2. Version Label Verification ✅

**Goal**: Confirm Version 29 is deployed

**Steps**:
1. Scroll to the footer
2. Check version indicator

**Expected Result**: Footer displays "Version 29"

**If Failed**:
- Verify `frontend/VERSION` contains "29"
- Rebuild and redeploy frontend
- Clear browser cache

---

### 3. Catalog Verification ✅

**Goal**: Ensure previously uploaded books are visible

**Steps**:
1. Navigate to Catalog page (`/catalog`)
2. Verify books are displayed
3. Check that book covers render correctly
4. Confirm book titles and authors are visible
5. Test search functionality

**Expected Result**: All previously uploaded books appear in catalog

**If Failed**:
- Check browser console for errors
- Verify backend is running: `dfx canister status backend`
- Test backend directly: `dfx canister call backend getAllBooks`
- Clear browser cache and hard refresh

**Failure Capture**:
- Screenshot of empty catalog
- Browser console errors
- Network tab showing failed requests
- Backend canister status

---

### 4. Book Details Verification ✅

**Goal**: Ensure book details pages load correctly

**Steps**:
1. From catalog, click on a book
2. Verify book details page loads
3. Check all information displays:
   - Title
   - Author
   - Price
   - Cover image
   - Description
   - Add to Cart button

**Expected Result**: Book details page loads with complete information

**If Failed**:
- Check routing configuration
- Verify book ID is passed correctly
- Check console for errors

---

### 5. Purchase Flow Testing ✅

**Goal**: Verify core purchase functionality works

**Steps**:
1. Add a book to cart
2. Navigate to cart page
3. Verify cart displays correctly
4. Proceed to checkout (if balance available)
5. Complete purchase (if testing with test account)

**Expected Result**: Purchase flow completes without errors

**If Failed**:
- Check cart state management
- Verify checkout API calls
- Check balance and token minting

---

### 6. Library and PDF Download Validation ✅

**Goal**: Ensure purchased books are accessible

**Steps**:
1. Navigate to My Library
2. Verify purchased books appear
3. Click on a book to view content
4. Test PDF download (if applicable)
5. Verify media content displays

**Expected Result**: Library shows purchased books, content is accessible

**If Failed**:
- Check order history
- Verify media fetching API
- Check ExternalBlob URL generation

---

### 7. Admin Functions Testing ✅

**Goal**: Verify admin features work (if admin access available)

**Steps**:
1. Log in as admin
2. Navigate to Admin Dashboard
3. Test catalog management
4. Test order viewing
5. Test token minting
6. Test support inbox

**Expected Result**: All admin functions work correctly

**If Failed**:
- Check admin role assignment
- Verify admin API calls
- Check authorization logic

---

### 8. Cross-Browser Testing ✅

**Goal**: Ensure compatibility across browsers

**Test Browsers**:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

**Steps**:
1. Open Live site in each browser
2. Navigate through key pages
3. Test core functionality
4. Check for console errors

**Expected Result**: Site works consistently across browsers

**If Failed**:
- Note browser-specific issues
- Check for polyfill requirements
- Review browser console errors

---

### 9. Console Error Check ✅

**Goal**: Ensure no critical errors in production

**Steps**:
1. Open browser developer console (F12)
2. Navigate through all key pages
3. Check for errors, warnings, or failed requests

**Expected Result**: No critical errors in console

**If Failed**:
- Document all errors
- Categorize by severity
- Create bug reports for critical issues

---

## Failure Capture Template

If any test fails, capture the following:

