# Membership Sales — Paused (How to Turn Back On)

**Date paused:** 2026-06-10
**Reason:** Business temporarily paused — client does not want anyone buying Eklektik AF memberships for now.

All membership purchase paths were disabled behind a **single feature flag**. To re-enable
everything, you only need to flip one value (see "How to turn it back on" below).

---

## How to turn it back on

Open **`app/config/membership.js`** and change:

```js
export const MEMBERSHIPS_ENABLED = false;
```

to:

```js
export const MEMBERSHIPS_ENABLED = true;
```

Then redeploy. That single change restores every item in the table below — nothing else
needs to be touched.

---

## What the flag controls

When `MEMBERSHIPS_ENABLED` is `false`, the following happen automatically:

| # | Entry point | File | Behaviour while paused |
|---|---|---|---|
| 1 | "MEMBERSHIP" nav link | `app/components/Navbar.jsx` | Removed from desktop + mobile menus |
| 2 | "JOIN THE MEMBERSHIP" CTA (desktop carousel) | `app/(home)/page.js` | Hidden |
| 3 | "JOIN THE MEMBERSHIP" CTA (mobile carousel) | `app/(home)/page.js` | Hidden |
| 4 | Membership page itself | `app/eklektikmamaMembership/page.js` | Shows a "Memberships Are Currently Closed" message instead of the signup flow, plan list, and Stripe modal |
| 5 | "Join Now" + "Pay Via Stripe" buttons | `app/components/MembershipOptions.jsx` | Never render (component only lives inside the gated page above) |
| 6 | "Join Eklektik AF" dashboard CTA | `app/member-dashboard/page.js` | Hidden |
| 7 | "Upgrade to Annual" (paid upgrade for existing monthly members) | `app/member-dashboard/page.js` | Hidden |
| 8 | "Join EKLEKTIK AF" discount nudge | `app/events/[id]/book/components/DynamicForm.jsx` | Hidden for non-members |
| 9 | Members-only event redirect (membership validation) | `app/events/[id]/book/page.js` | No longer redirects to the closed page; shows "memberships are currently closed" alert instead |
| 10 | Members-only event redirect (server response handler) | `app/events/[id]/book/page.js` | Same as above |
| 11 | "Try Again" button on failed payment | `app/membership-success/page.js` | Becomes "Back to Home" → `/` |

---

## Files changed

### New file
- **`app/config/membership.js`** — the single feature flag. Delete or set to `true` to re-enable.

### Edited files
1. **`app/components/Navbar.jsx`**
   - Imported `MEMBERSHIPS_ENABLED`.
   - The `MEMBERSHIP` entry in `NAV_LINKS` is conditionally spread in only when the flag is `true`.

2. **`app/(home)/page.js`**
   - Imported `MEMBERSHIPS_ENABLED`.
   - Both "JOIN THE MEMBERSHIP" `<Link>` CTAs wrapped in `{MEMBERSHIPS_ENABLED && (...)}`.

3. **`app/eklektikmamaMembership/page.js`**
   - Imported `MEMBERSHIPS_ENABLED`.
   - Added a `MembershipClosed` component (the "currently closed" screen).
   - `MembershipPage` returns `<MembershipClosed />` early when the flag is `false`, so the
     whole signup flow (`MembershipContent`, `MembershipOptions`, Stripe modal) never renders.

4. **`app/member-dashboard/page.js`**
   - Imported `MEMBERSHIPS_ENABLED`.
   - "Upgrade to Annual" section gated with `MEMBERSHIPS_ENABLED && ...`.
   - "Not a Member Yet? / Join Eklektik AF" CTA gated with `MEMBERSHIPS_ENABLED && ...`.

5. **`app/membership-success/page.js`**
   - Imported `MEMBERSHIPS_ENABLED`.
   - "Try Again" button: navigates to `/eklektikmamaMembership` when enabled, otherwise `/`
     (and label switches to "Back to Home").

6. **`app/events/[id]/book/components/DynamicForm.jsx`**
   - Imported `MEMBERSHIPS_ENABLED`.
   - The membership discount box now renders only when `isMember || MEMBERSHIPS_ENABLED`,
     so the "Join today to save" prompt is hidden for non-members while paused.

7. **`app/events/[id]/book/page.js`**
   - Imported `MEMBERSHIPS_ENABLED`.
   - Both members-only redirects to `/eklektikmamaMembership` now only fire when the flag is
     `true`; otherwise they show a "memberships are currently closed" alert and do not redirect.

---

## Important notes

- **The Stripe checkout API was intentionally left untouched** (`app/api/membership/checkout/route.js`).
  The UI no longer reaches it, but a hand-crafted POST request could still create a Stripe
  checkout session. If a hard backend block is ever wanted, add a guard there too. Nothing in
  this pause prevents the API from working on its own.

- **Not gated** (harmless, left as-is — these are not purchase buttons):
  - `app/sitemap.xml/route.js` — still lists the membership URL.
  - `app/eklektikmamaMembership/layout.js` — SEO/canonical metadata for the page.
  - `app/api/membership/checkout/route.js` `cancel_url` — internal Stripe redirect.

- **Upgrades are blocked too:** the decision was to stop ALL new payments, including existing
  monthly members upgrading to annual (item #7 above).
