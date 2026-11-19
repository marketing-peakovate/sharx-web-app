# F15a · Security, isolation and adapter fixture suites
Owner: A (Alex) · Days 19–20 · Release none (hardening) · Tracker: F15.2, F15.3 · PRD: [F15](../PRD.md#f15)

## Goal
The isolation, security and integration test suites are complete and gate every merge.

## Acceptance criteria
- [ ] Tests: isolation + permission suite, webhook signature and idempotency, adapter fixtures.
- [ ] Gates: CI green; isolation and security suite pass.

## Data model / API / job changes
- None. Fills gaps left by earlier specs' tests; adds negative tests.

## Files touched
- A (Alex): tests/security/*, tests/fixtures/*, module test files in A-owned paths, .github/workflows/ci.yml

## Dependencies
F1b, F3b, F5, F9b.

## Edge cases
- Every route and Server Action checked for: no session, pending_2fa, wrong role, other project.
- Portal token: revoked, wrong, brute-force rate limit.
- Webhooks: replay, bad signature, oversized payload.

## Out of scope
Load testing, third-party penetration test.

## Test plan
- Coverage report listing every action/route with its permission test.
- All adapter fixture suites run in CI under 5 minutes.
