# Draft Regression Checks

## Overview
This document provides a minimal manual verification checklist to prevent shipping draft versions with catalog visibility regressions or other critical issues.

## Purpose
Before promoting any draft to Live, perform these checks to ensure:
1. Previously uploaded books remain visible
2. Core user flows work correctly
3. No silent failures or empty states

## Pre-Deployment Checklist

### 1. Catalog Visibility ✅
**Goal**: Ensure all previously uploaded books are visible in the catalog

**Steps**:
1. Navigate to the Catalog page (`/catalog`)
2. Verify that books uploaded in previous versions are displayed
3. Check that the catalog is NOT empty (unless truly no books exist)
4. Verify book covers render correctly
5. Confirm book titles and authors are visible

**Expected Result**: All books that exist in backend state appear in the catalog

**Failure Indicators**:
- Empty catalog when books exist in backend
- Missing book covers or placeholder images only
- Console errors related to book fetching
- Blank or loading state that never resolves

**If Failed**:
- Check browser console for errors
- Verify `useGetAllBooks()` is being used (not `useGetAvailableBooks()`)
- Ensure error states are properly rendered
- Test with different browsers

---

### 2. Book Details Page ✅
**Goal**: Ensure individual book pages load successfully

**Steps**:
1. From the catalog, click on at least one book
2. Verify the book details page loads
3. Check that all book information displays:
   - Title
   - Author
   - Price
   - Cover image
   - Description/content preview
   - Add to Cart button (if applicable)

**Expected Result**: Book details page loads with complete information

**Failure Indicators**:
- 404 or blank page
- Missing book information
- Broken images
- Console errors

**If Failed**:
- Check routing configuration
- Verify book ID is passed correctly
- Ensure `useGetBook()` hook works properly

---

### 3. Error State Rendering ✅
**Goal**: Ensure fetch failures show user-friendly error messages

**Steps**:
1. Simulate a network error (disconnect internet or block API calls)
2. Navigate to the Catalog page
3. Verify an error message is displayed (not a silent empty state)
4. Check that the error message is in English and actionable

**Expected Result**: Clear error message displayed when fetching fails

**Failure Indicators**:
- Empty catalog with no error message
- Generic or technical error messages
- Infinite loading state
- Console errors but no UI feedback

**If Failed**:
- Add error state handling to queries
- Use `isError` and `error` from React Query
- Display user-friendly error messages with `Alert` component

---

### 4. Console Error Check ✅
**Goal**: Ensure no critical console errors during normal operation

**Steps**:
1. Open browser developer console (F12)
2. Navigate through key pages:
   - Home
   - Catalog
   - Book Details
   - Cart (if applicable)
3. Check for errors in console

**Expected Result**: No critical errors in console during normal navigation

**Failure Indicators**:
- React errors or warnings
- Failed API calls (4xx, 5xx errors)
- Uncaught exceptions
- CORS errors

**If Failed**:
- Fix React errors immediately
- Investigate failed API calls
- Ensure proper error boundaries

---

## Quick Verification Script

For rapid verification, run through this abbreviated checklist:

