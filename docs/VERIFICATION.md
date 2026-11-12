# Verification — 2026-11-12

- `npm run build`: passed, including vue-tsc. No build/type warnings.
- `npm test`: five HTTP-wrapper checks passed (optional 401 on all three endpoint shapes, one retry maximum, protected logout/redirect callback, message arrays and disabled storage, abort preservation).
- Real Swagger checked at localhost:3000/docs-json. Course GET has no detailed response schema; fields verified against live API and read-only backend service inspection.
- Existing database had 15 courses, so seed was not repeated.
- Browser demo: guest popularity, John login, six collaborative suggestions with source links, enrollment in graphic-design course, removal from fresh recommendations, four lesson completions, 100% completion, review creation and update, completed course visible in profile.
- Browser registration: frontend.demo.20261112@example.com, interests: machine-learning. Result: three content-based plus three popular-fallback recommendations. Test account remains in the local database.
- Demo mutations: John completed graphic-design course 65200001000000000000000d and saved a five-star demonstration review. Existing seed data was preserved.
- Mobile check at 360 × 800: document scrollWidth equals clientWidth (345 after scrollbar), no horizontal overflow.
- Port 5173 was occupied by a different local application. Browser QA used Vite 5175 with VITE_API_URL=/api and the development proxy; backend source/config was not edited.
- Saved recommendation screenshot: docs/screenshots/recommendations.jpg.
- Performance backend on 3001 was not started/tested; configuration and credentials are documented in README.
- npm install reported engine warnings for the installed Node 24.11.0 and existing tooling requirements. Build and checks passed; use a Node version satisfying package.json and dependency requirements for a fresh installation.

## Bilingual interface

Added vue-i18n with Russian default and persistent RU / EN switch. Browser checks confirmed translated recommendation explanations, preserved catalog search query and form values while switching languages, and Russian document lang/title. Known API errors and Naive UI controls are localized. Both dictionaries and interpolation are checked by npm test (six checks total).

