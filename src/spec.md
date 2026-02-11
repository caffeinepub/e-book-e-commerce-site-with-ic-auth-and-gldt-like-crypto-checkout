# Specification

## Summary
**Goal:** Restore public catalog visibility for available books and add an admin-only tool to re-enable availability for a specific uploaded book by identifier.

**Planned changes:**
- Add an admin-only backend method to set `available=true` for books whose title/filename matches an admin-provided identifier (case-insensitive exact match), returning counts plus updated book IDs/titles and skipped matches.
- Ensure the re-enable operation does not re-list sold-out single-copy books by skipping matches that are `singleCopy=true` and already have a purchase/ownership record.
- Add an Admin Settings section to paste a book identifier and run the re-enable operation, showing updated/skipped results and English error messages.
- Fix the public catalog page to query and display only available books using the existing available-books query/hook.

**User-visible outcome:** Admins can re-enable availability for a specific uploaded book by pasting its identifier and seeing which books were updated or skipped, and the public catalog reliably shows books marked as available.
