# Specification

## Summary
**Goal:** Add a lightweight post-purchase confirmation screen that appears immediately after a successful checkout, before the full order details page.

**Planned changes:**
- Create a new purchase confirmation page/route that displays success messaging and three actions: “Go to My Library”, “View Order Details”, and “Continue Shopping”.
- Register the new route in the app router and update Checkout success navigation to route to it, passing the generated `orderId` via route params.
- Keep the existing `/order/$orderId` page intact and reachable from the new confirmation screen via “View Order Details”.

**User-visible outcome:** After completing a purchase, users see a concise success screen with quick next-step buttons, and can still open the full order details page when desired.
