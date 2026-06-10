// Membership sales toggle.
//
// The business is temporarily paused, so we are not selling Eklektik AF
// memberships right now. While this is `false`:
//   - the "MEMBERSHIP" nav link and all "Join the membership" CTAs are hidden
//   - the /eklektikmamaMembership page shows a "currently closed" message
//     instead of the signup flow
//   - the "Upgrade to Annual" action in the member dashboard is hidden
//
// To start selling memberships again, flip this single value back to `true`.
export const MEMBERSHIPS_ENABLED = false;
