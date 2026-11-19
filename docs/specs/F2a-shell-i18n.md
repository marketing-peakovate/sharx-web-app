# F2a · App shell, design tokens, i18n and RTL
Owner: B (John) · Days 1–2 · Release 1 · Tracker: F2.1, F2.2 · PRD: [F2](../PRD.md#f2)

## Goal
A branded, responsive shell with navigation, project switcher and a three-language, RTL-ready string system that every later screen plugs into.

## Acceptance criteria
- [ ] SHARKX brand (mockup tokens; assets pending), usable at 360 px.
- [ ] EN/AR/FR with full RTL; language saved per user; no hard-coded strings (framework + English here; Arabic/French text in F2c).

## Data model / API / job changes
- users.locale read/written via Alex's auth action (stub session until F1c merges).
- next-intl with `[locale]` route segment, per-module catalogs `messages/<locale>/<module>.json`, `dir="rtl"` for Arabic.
- Tokens from mockup CSS (colours, radius, Manrope + Noto Sans Arabic); rail, topbar, project switcher, page header, empty and error states.

## Files touched
- B (John): src/app/[locale]/layout and (app) shell, src/components/*, src/lib/i18n/*, messages/en/*

## Dependencies
F1a.

## Edge cases
- Arabic strings longer than English; mixed-direction content (phone numbers, Latin names).
- Dates/numbers formatted per locale and project time zone.
- Switcher with zero or one project; agent sees only assigned projects.
- Mobile: rail collapses, no horizontal scroll at 360 px.

## Out of scope
Ctrl+K palette, notifications bell (F14b), final brand assets (swap when SHARKX sends them).

## Test plan
- Visual check of shell in EN and AR at 360 px and desktop.
- CI check that fails on physical-direction Tailwind classes and inline UI strings.
