# WellWatch — frontend (Person 4)

WellWatch ranks village water sources by **inspection priority** so field teams can visit the right pumps first.
It is an inspection-priority tool, **not** a failure predictor. The demo data are **synthetic** and the groundwater trends are **provisional**; the dashboard says so on every screen.

## What is in the dashboard
- Ranked inspection list (High / Medium / Low, score, plain-language reasons) loaded from `GET /sources`
- Map of the same sources (MapLibre; Amazon Location Service if a key is set, OpenStreetMap otherwise)
- Source detail from `GET /sources/{source_id}`: reasons, score factors, trend, source facts, recent reports
- Filters: priority, district, text search (applied in the browser, so no extra API calls)
- Report form (`POST /reports`) with validation, duplicate-submit protection and clear error handling
- Language switch for reasons: appears only if the API returns translated reasons

Nothing is hardcoded: if the API returns no score, level or reasons, the UI says "Not scored" / "not provided" rather than inventing them.

## Run it
Requires Node.js 18+ (tested on Node 22).
```bash
cd frontend
npm install
cp .env.example .env.local     # optional, see below
npm run dev                    # http://localhost:5173
## Run it
Requires Node.js 18+ (tested on Node 22).
```bash
cd frontend
npm install
cp .env.example .env.local     # optional, see below
npm run dev                    # http://localhost:5173
npm test                       # 51 automated tests across 6 suites
npm run build                  # production build into frontend/dist
```

### Environment variables (public values only)
| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base URL. Defaults to the team's `.../Prod` URL. Use `/api` in local dev to go through the Vite proxy (avoids CORS while it is being set up). |
| `VITE_API_PROXY_TARGET` | Target for the dev proxy (defaults to the same API URL). |
| `VITE_LOCATION_API_KEY` | Optional Amazon Location Service API key, restricted to your site's domain. Empty = OpenStreetMap basemap. |
| `VITE_LOCATION_REGION` | Region for Location Service (default `ap-south-1`). |

**Never** put a Bearer token, AWS access key or secret in a `VITE_` variable: those are bundled into public JavaScript.

## Authentication
Confirmed by Person 3: protected routes use `Authorization: Bearer <token>`, validated by a **single shared secret in the backend authorizer**; there is no per-user token issuance yet.

What the frontend does today:
- sends no token by default;
- if the API answers `401`, shows a token box. The value is kept **in memory only** (gone on refresh) and sent as `Authorization: Bearer <token>`.

**Do not use this for the public demo.** A shared secret that every field user must paste, or that is built into the site, is effectively public, so it cannot protect `POST /reports`. The token box is a development stopgap only. Options for the deployed UI, to agree with Person 3:
1. Leave `GET` routes public and keep `POST /reports` open but strictly validated and throttled (API Gateway throttling), clearly labelled as demo data.
2. Replace the shared secret with Amazon Cognito (plan stretch goal) and a JWT authorizer, then add a login step to the form.
Never put the secret in `VITE_` variables, source code or GitHub.

## Deploy on AWS Amplify Hosting
1. Push this repo to GitHub (keep `frontend/` and `amplify.yml` at the repo layout shown below).
2. Amplify console → *Host web app* → GitHub → pick the repo/branch. Amplify reads `amplify.yml` (monorepo, `appRoot: frontend`).
3. Add environment variables from the table above in *Hosting → Environment variables*.
4. Tell Person 3 the Amplify URL so CORS can allow it (see below).

## What Person 3 needs to confirm / change
1. **API Gateway CORS & Gateway Responses**: In API Gateway -> Gateway Responses, add `Access-Control-Allow-Origin: '*'` (and headers `Authorization,Content-Type`) to `UNAUTHORIZED (401)`, `ACCESS_DENIED (403)`, `DEFAULT_4XX`, and `DEFAULT_5XX`. Currently unauthenticated requests return 401 without CORS headers, which causes browsers to mask the status as a CORS error.
2. **Public Read Routes**: Configure `GET /sources` and `GET /sources/{source_id}` to allow public read access for synthetic demo records without requiring a Bearer token.
3. **Protected Reports Submission**: Decide on authentication model for `POST /reports` (public throttled demo vs Amazon Cognito JWT).
4. **Response shapes**: `GET /sources` returns `{ count: 24, sources: [...] }`; `nearest_station_id`, `matching_method`, and trend slopes are parsed and displayed with provisional status tags.

## Project layout
```
amplify.yml
frontend/
  src/api/        API client + error type (the only place that calls fetch)
  src/lib/        normalize.js (API → UI shapes), validate.js (report rules), format.js
  src/hooks/      useSources, useSourceDetail (cached per source)
  src/components/ Header, Notice, OverviewDashboard, Filters, SourceList, MapView, SourceDetail, ReportForm, Methodology, ProblemImpact, States, LevelBadge
  src/test/       51 tests (data contracts, navigation, normalising, validation, API client, dashboard, report form)
docs/
  REQUIREMENTS.md  requirement checklist with status
  DEMO_SCRIPT.md   5-minute demo script
data/
  sources_seed.csv 24 synthetic demo water source seed records
  source_trends.csv 24 provisional groundwater trend mappings
```

## Design
Palette: Deep Earth `#513229`, Warm Milk `#F4F1E2`, Soft Sky `#D8EBF9`, Warm Amber `#E8B979`. Typography: **Antonio** (tall condensed display), **Playfair Display** (editorial serif), **Source Sans 3** (body and data). Fonts are bundled with the app, no external font requests. Priority is never colour-only: each level also has a word and a bar glyph, and map markers differ in size.
