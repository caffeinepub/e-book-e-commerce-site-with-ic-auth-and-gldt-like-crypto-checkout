# Specification

## Summary
**Goal:** Add footer social contact handles and an asynchronous customer service support inbox so visitors can submit questions and admins can reply.

**Planned changes:**
- Update the site footer to include two clickable social/contact items: “X (Twitter): @RadicalEconomist101” and “OpenChat: @RadicalEconomist101”, opening in a new tab and matching existing footer styling while retaining existing copyright and caffeine.ai attribution.
- Add backend support-inbox methods to: submit support messages (no auth required; store text, timestamp, and optional contact fields), allow admin-only listing of all messages and posting replies, and allow authenticated users to view messages/replies associated with their own submissions.
- Add a “Customer Service Chat” entry point in the footer that opens a dialog/panel for submitting a question, including clear UI text for guests that reply tracking is better when logged in.
- Add an admin UI (inside the existing Admin area, guarded by admin auth) to view incoming support messages and send replies.
- Implement non-real-time updates via polling or manual refresh using React Query refetch (no WebSockets/push).

**User-visible outcome:** Users can reach the team via footer links to X (Twitter) and OpenChat, submit customer service questions from a footer “Customer Service Chat” panel, and (when logged in) view replies to their own submissions; admins can manage and reply to all incoming support messages from the Admin area.
