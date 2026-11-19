# F1c · Auth, emailed-code 2FA, roles
Owner: A (Alex) · Days 4–5 · Release 1 · Tracker: F1.3, F1.4, F1.5 · PRD: [F1](../PRD.md#f1)

## Goal
SHARKX staff sign in with password + emailed code, are invited by email, and every action is gated by `can()`.

## Acceptance criteria
- [ ] Invite by email → single-use set-password link (72 h) → sign in with password + 6-digit emailed code (10 min, 5 tries). Reset by link (1 h).
- [ ] Roles per matrix.

## Data model / API / job changes
- Tables: users, sessions, auth_tokens (F1b).
- Session per ARCHITECTURE §6 (opaque token, `__Host-` cookie, idle 12 h, absolute 7 d, rotate on login and code). `pending_2fa` until the code is verified.
- `can()` exactly as CONTRACTS §1. Server Actions: invite, acceptInvite, login, verifyCode, requestReset, resetPassword, changeRole, logout.
- Emails via `email.send` (templates: invite, code, reset; EN now, AR/FR in F2c).

## Files touched
- A (Alex): src/modules/auth/*, src/lib/email/*, src/lib/crypto/*
- B (John): src/app/[locale]/(auth)/* screens (login, code, reset, accept invite), built by Alex as a PR that John reviews

## Dependencies
F1b. (Resend domain may not be verified yet: use Conalytic's sending domain on staging.)

## Edge cases
- Expired, used or forged invite/reset link → generic "link expired" page.
- 5 wrong codes → code invalidated, new code required.
- Password change or role removal revokes all sessions.
- Email case-insensitive; disabled user cannot sign in.
- `pending_2fa` session cannot reach any app route or action.

## Out of scope
Authenticator-app TOTP, SSO, client logins, login rate limits (F1d).

## Test plan
- Unit: token expiry, single use, attempt counter, session rotation.
- `can()` table test covering every action × role.
- Login-with-code e2e lives in F15b.
