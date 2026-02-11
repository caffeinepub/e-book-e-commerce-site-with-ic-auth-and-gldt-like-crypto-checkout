# Live Smoke Test - Version 22 Verification

This document provides a step-by-step manual verification checklist for validating that Draft Version 22 has been successfully published to Live and that all uploaded media behaves correctly.

## Purpose

After publishing Draft Version 22 to Live, this checklist ensures:
1. The catalog matches what was visible in Draft Version 22
2. Book covers and media render correctly using ExternalBlob direct URLs
3. The purchase flow works end-to-end on Live
4. Purchased PDFs are accessible and downloadable
5. The environment badge displays "Live" (not "Draft")

## Prerequisites

- Draft Version 22 has been published to Live
- You have admin access to the Live site
- Version 22 catalog has been imported via Admin → Settings
- You have a test user account with sufficient GLDT balance

## Key URLs

- **Live Site**: https://radicaleconomist101-h78.caffeine.xyz
- **Catalog**: https://radicaleconomist101-h78.caffeine.xyz/catalog
- **My Library**: https://radicaleconomist101-h78.caffeine.xyz/library
- **Admin Dashboard**: https://radicaleconomist101-h78.caffeine.xyz/admin

## Smoke Test Checklist

### 1. Environment Badge Verification

**Objective**: Confirm the environment badge displays "Live"

- [ ] Visit https://radicaleconomist101-h78.caffeine.xyz
- [ ] Check the header (top-right area)
- [ ] Verify badge shows **"Live"** (not "Draft")
- [ ] Badge should have default variant styling (not secondary/gray)

**Expected Result**: Badge displays "Live" with primary/default styling

**If badge shows "Draft"**:
- Check `frontend/.env.production` contains `VITE_APP_ENV=Live`
- Re-run preflight: `bash frontend/scripts/deployment-preflight.sh`
- Verify preflight output shows "Environment 'Live' found in compiled assets"

---

### 2. Catalog Verification

**Objective**: Verify books from Version 22 are visible on Live

- [ ] Navigate to `/catalog`
- [ ] Count the number of books displayed
- [ ] Compare count with expected Version 22 book count
- [ ] Verify book titles match Version 22 titles
- [ ] Verify book authors match Version 22 authors
- [ ] Check that book covers display (not broken images or placeholders)

**Expected Result**: All Version 22 books appear with correct metadata and covers

**If books are missing**:
- Log into Admin → Settings
- Import Version 22 catalog using Merge Mode
- Refresh catalog page

---

### 3. Book Details & Cover Rendering

**Objective**: Verify book detail pages display correctly with ExternalBlob direct URLs

**For each book** (test at least 3 books):

- [ ] Click on a book card to view details
- [ ] Verify cover image displays correctly
- [ ] Check that cover is not a placeholder or broken image
- [ ] Verify price displays correctly
- [ ] Verify description/content displays (if available)
- [ ] Check "Add to Cart" button is visible and enabled

**ExternalBlob Direct URL Validation**:
- [ ] Open browser DevTools → Network tab
- [ ] Reload the book detail page
- [ ] Find the cover image request in Network tab
- [ ] Verify URL format matches ExternalBlob direct URL pattern (not base64 data URI)
- [ ] Verify image loads quickly (streaming, not full download)

**Expected Result**: Covers display correctly using direct URLs, not base64 or broken links

---

### 4. Purchase Flow (End-to-End)

**Objective**: Test the complete purchase flow on Live

#### 4.1 Add to Cart

- [ ] Log in with Internet Identity (if not already logged in)
- [ ] Navigate to `/catalog`
- [ ] Select a book
- [ ] Click "Add to Cart"
- [ ] Verify success message or feedback
- [ ] Check cart icon in header shows item count

#### 4.2 View Cart

- [ ] Click cart icon in header or navigate to `/cart`
- [ ] Verify book appears in cart
- [ ] Check quantity is correct (default: 1)
- [ ] Verify price displays correctly
- [ ] Check total amount is calculated correctly

#### 4.3 Checkout

- [ ] Click "Proceed to Checkout"
- [ ] Verify redirect to `/checkout`
- [ ] If book is KYC-restricted:
  - [ ] Verify KYC verification card displays
  - [ ] Complete KYC verification (if required)
- [ ] Verify balance is sufficient (if not, mint tokens via Admin)
- [ ] Click "Complete Purchase" or equivalent button
- [ ] Wait for transaction to complete

#### 4.4 Confirmation

- [ ] Verify redirect to purchase confirmation page
- [ ] Check confirmation message displays
- [ ] Verify order ID is shown
- [ ] Check "Go to My Library" button is visible

**Expected Result**: Purchase completes successfully with confirmation

---

### 5. Library & PDF Download

**Objective**: Verify purchased books appear in library and PDFs are downloadable

#### 5.1 Library Display

- [ ] Navigate to `/library` (My Library)
- [ ] Verify purchased book appears in library
- [ ] Check book cover renders correctly
- [ ] Verify book title and author display
- [ ] Check "Read" button is visible

#### 5.2 Book Content Dialog

- [ ] Click "Read" button on purchased book
- [ ] Verify book content dialog opens
- [ ] Check PDF download button is visible
- [ ] If book has images/audio/video, verify they display

#### 5.3 PDF Download

- [ ] Click PDF download button
- [ ] Verify browser download starts
- [ ] Wait for download to complete
- [ ] Open downloaded PDF file
- [ ] Verify PDF opens correctly
- [ ] Check PDF content matches expected book content

**Expected Result**: PDF downloads successfully and opens correctly

---

### 6. Admin Functions (Admin Users Only)

**Objective**: Verify admin functions work on Live

- [ ] Navigate to `/admin`
- [ ] Check **Catalog** tab:
  - [ ] Verify all books display
  - [ ] Check book count matches expected
  - [ ] Verify "Available" and "All Books" filters work
- [ ] Check **Orders** tab:
  - [ ] Verify recent test order appears
  - [ ] Check order details are correct
- [ ] Check **Settings** tab:
  - [ ] Verify Import Catalog section is visible
  - [ ] Test file picker (don't import unless needed)

**Expected Result**: Admin dashboard displays correctly with all data

---

### 7. ExternalBlob Direct URL Deep Dive

**Objective**: Validate ExternalBlob direct URLs work correctly for all media types

#### 7.1 Cover Images

- [ ] Open browser DevTools → Network tab
- [ ] Navigate to a book detail page
- [ ] Find cover image request in Network tab
- [ ] Verify URL format: should be a direct URL (not data URI)
- [ ] Check response headers: should include `Content-Type: image/*`
- [ ] Verify image loads quickly (streaming)

#### 7.2 PDF Files

- [ ] Purchase a book (if not already purchased)
- [ ] Open library and click "Read"
- [ ] Click PDF download button
- [ ] In Network tab, find PDF request
- [ ] Verify URL format: should be a direct URL
- [ ] Check response headers: should include `Content-Type: application/pdf`
- [ ] Verify PDF downloads completely

**Expected Result**: All media uses direct URLs and loads/downloads correctly

---

### 8. Cross-Browser Testing (Optional)

**Objective**: Verify compatibility across browsers

Test in at least 2 browsers:

- [ ] **Chrome/Edge**: Full smoke test
- [ ] **Firefox**: Full smoke test
- [ ] **Safari** (if available): Full smoke test
- [ ] **Mobile browser** (optional): Basic navigation and purchase flow

**Expected Result**: Site works consistently across browsers

---

## Smoke Test Summary

After completing all sections, verify:

- [x] Environment badge shows "Live"
- [x] Catalog displays Version 22 books
- [x] Book covers render correctly
- [x] Purchase flow works end-to-end
- [x] Library shows purchased books
- [x] PDF download works
- [x] ExternalBlob direct URLs work correctly
- [x] Admin functions work (if applicable)

## Troubleshooting

### Environment Badge Shows "Draft"

**Fix**:
1. Check `frontend/.env.production` contains `VITE_APP_ENV=Live`
2. Re-run preflight: `bash frontend/scripts/deployment-preflight.sh`
3. Redeploy if needed: `bash frontend/scripts/publish-live.sh`

### Books Not Appearing

**Fix**:
1. Log into Admin → Settings
2. Import Version 22 catalog (Merge Mode)
3. Refresh catalog page

### Cover Images Not Displaying

**Fix**:
1. Check browser console for errors
2. Verify ExternalBlob URLs are accessible
3. Check Network tab for failed requests
4. Verify books have cover images uploaded

### PDF Download Fails

**Fix**:
1. Check browser console for errors
2. Verify user has purchased the book
3. Check Network tab for failed requests
4. Verify book has PDF uploaded

### Purchase Flow Fails

**Fix**:
1. Check browser console for errors
2. Verify user has sufficient GLDT balance
3. Check KYC verification (if book is KYC-restricted)
4. Verify backend is responding (check Network tab)

## Helper Script

For a quick reference of this checklist, run:

