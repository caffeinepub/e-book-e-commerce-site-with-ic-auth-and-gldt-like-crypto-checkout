# Specification

## Summary
**Goal:** Enforce a stricter KYC purchase restriction so that after a verified identity purchases any KYC-restricted book once, that identity is blocked from purchasing any other KYC-restricted books in the future.

**Planned changes:**
- Update backend checkout enforcement to block any future purchases of KYC-restricted books when the same KYC identifier has previously purchased a KYC-restricted book (regardless of which title), while allowing non-KYC-restricted purchases.
- Update backend pre-checks used for cart/checkout validation to detect prior purchases of any KYC-restricted book for the same KYC identifier and reject accordingly with a consistent English error message.
- Update checkout KYC UI explanatory text to reflect the new policy (not “one copy per person” for a specific book).
- Update frontend checkout error mapping to display a user-friendly English message when the backend rejects due to the new KYC restriction.

**User-visible outcome:** Users who have already purchased one KYC-restricted book will see a clear English message and will be unable to buy any other KYC-restricted books, while they can still purchase non-KYC-restricted books normally.
