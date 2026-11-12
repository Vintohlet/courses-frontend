# Coursework frontend

Vue 3 + TypeScript + Vite, Vue Router, Pinia, Naive UI and Vue I18n. All HTTP requests use native fetch.

## Installation and launch

```sh
npm install
```

Copy `.env.example` to `.env.local`. `VITE_API_URL` defaults to `http://localhost:3000/api`.

```sh
npm run dev -- --host localhost --port 5173
npm run build
```

Start the existing backend separately with `npm run start:dev`. Initialize a disposable demo database with `npm run seed` in courses-backend. Seeding resets demo data. Backend CORS permits `http://localhost:5173`.

If 5173 is occupied, set `VITE_API_URL=/api` in `.env.local` and use another Vite port. The development proxy targets `http://localhost:3000`; override it with `VITE_PROXY_TARGET=http://localhost:3001` when needed. The proxy is development-only; production should use the full API URL and its allowed frontend origin. Restart Vite after environment changes.

## Demonstration

1. Open `/` as a guest: popular courses.
2. Sign in as `john.doe@example.com` / `DemoPass123!`. Open `/recommendations` to inspect similar-learners explanations and linked source courses.
3. Enroll in a recommendation; return to the homepage/recommendations to see a fresh list excluding that course.
4. Register a new account with interests for cold-start recommendations.
5. Complete all lessons, return to the course and save a review. Submitting again updates that review.
6. Open `/me` to edit interests and inspect active/completed courses.

## Load database

Start the prepared performance backend on port 3001 with its `npm run perf:start` command. Set `VITE_API_URL=http://localhost:3001/api` in `.env.local` and restart Vite on port 5173. Sign in as `perf.user.000001@example.com` / `PerfPass123!`.

## Architecture

`src/api`: typed API resources and one fetch wrapper. `src/stores`: Pinia auth and shared topic dictionary. `src/router`: routes and protected-page guards. `src/pages`: catalog, recommendations, course, lessons, auth and profile. `src/components`: reusable cards, recommendation section, ratings, pagination and asynchronous states.

Filters are synchronized with URL query parameters, search is debounced 300 ms, and superseded requests are aborted. Recommendations are fetched on page entry and account/interest changes without a result cache. Numeric recommendation scores are never displayed. Catalog progress is never used; profile progress comes from `/users/me`. Token persistence is guarded with try/catch. Optional-auth endpoints retry once anonymously on 401; protected endpoints redirect to sign-in with a local return path. Lesson completion is optimistic with rollback.

## Report screenshots

Sign-in form; catalog with filters; recommendations with linked “Learners of …” explanations and strategy counts; course overview and reviews; lessons with progress/completion; profile with interests and active/completed courses.

Course titles and descriptions come directly from the backend and may be Russian in the existing seed; interface labels support Russian and English.

## Verification

Run `npm test` for the HTTP regression checks. See [docs/VERIFICATION.md](docs/VERIFICATION.md) for the browser test results and local demo-data changes. The existing dependency tooling expects a newer Node release than this machine's 24.11.0; use Node 24.15+ or another supported version for installation.

## Interface languages

Russian is the default. Use the RU / EN switch in the header to change the language without losing form values or catalog filters. Selection is stored in localStorage (`coursework.locale`) with an in-memory fallback when storage is unavailable. The Naive UI locale, document language/title, dates, numbers, level labels, known topic names and recommendation explanations follow the selected language. Course titles/descriptions, lesson content and user reviews are shown exactly as returned by the API. Unknown future topics use their API name/slug.

Translations are in `src/i18n/messages.ts`; locale setup and API-error translations are in `src/i18n/index.ts`. Add new interface messages to both dictionaries.
