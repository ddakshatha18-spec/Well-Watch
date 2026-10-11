# Person 4 requirement checklist

Source: `WellWatch_Plan_AWS.docx`, section 6 ("Person 4: Frontend, Demo and Presentation"), plus sections 5.2, 8, 9, 10, 11, 12.
Status key: **Done** = built and covered by tests here. **Built, unverified live** = built, but needs the real AWS API to confirm. **Not done** = not built.

| # | Requirement (from the plan) | Where | How tested | Status |
|---|---|---|---|---|
| 1 | Dashboard: ranked inspection list | `SourceList.jsx`, `lib/normalize.js` (`rankSources`) | `App.test.jsx` ranking; browser check with stubbed 24-record API | Built, unverified live |
| 2 | Map view of ranked sources (Amazon Location Service, fallback Leaflet/OSM) | `MapView.jsx` (MapLibre) | Browser check: markers, selection ring, legend. Not unit-tested (WebGL). | Built, unverified live. Uses OpenStreetMap by default; Location Service path untested without a key. Library is MapLibre, not Leaflet. |
| 3 | Source detail with reasons | `SourceDetail.jsx` | `App.test.jsx` select/detail/caching/failure | Built, unverified live |
| 4 | Filters: district, priority | `Filters.jsx`, `filterSources` | `normalize.test.js`, `App.test.jsx` | Done (client-side, plus search box) |
| 5 | Language switch if translations are ready | `Header.jsx`, `SourceList.jsx` | `normalize.test.js` (field pickup) | Built, depends on backend sending `reasons_hi/te` |
| 6 | Simple report form, few taps, works on a phone | `ReportForm.jsx`, `validate.js` | `validate.test.js`, `App.test.jsx` (validation, payload, double-submit, 401, 500) | Built, unverified live |
| 7 | POST /reports payload: source_id, yield_level, failure_flag, date | `api/client.js` `buildReportPayload` | `client.test.js` | Done against the contract; server behaviour unverified |
| 8 | Priority visibly changes after a report | `App.jsx` `saved()` refetches list and detail; form shows new level | `App.test.jsx` (refresh call) | Built, depends on backend re-scoring and returning score/level |
| 9 | README with honest framing | `README.md` | n/a | Done |
| 10 | Demo script | `docs/DEMO_SCRIPT.md` | n/a | Done |
| 11 | Slides | n/a | n/a | **Not done** |
| 12 | Host on Amplify (GitHub-connected) | `amplify.yml` | Local `npm run build` passes | Config done; **deployment not done** (needs your GitHub repo and AWS access) |
| 13 | Point app at Person 3's API URL; make sure CORS works | `config.js`, dev proxy in `vite.config.js` | `client.test.js` (URL) | URL set. **CORS unverified**: the API was unreachable from the build environment |
| 14 | Lead end-to-end testing on Day 2 | 42 automated tests + browser smoke test with a stubbed API | Commands in README | Partly. **No live end-to-end run.** |
| 15 | Honest-limits statement shown in the UI | `Notice.jsx`, footer | `App.test.jsx` | Done |
| 16 | Label synthetic data; show provisional status | `Notice.jsx`, tags, measurement status | `App.test.jsx` | Done (driven by the API's `synthetic` flag) |
| 17 | Stretch: Cognito login for the report form | n/a | n/a | **Not done** (token-in-memory fallback instead) |
| 18 | Cut-list item: sensitivity analysis, SNS, Translate | Not Person 4 | n/a | n/a |

## Open dependencies
- Exact shapes of `priority.factors`, `priority.data_completeness`, the detail's trend/recent_reports fields, and the successful `POST /reports` response (list shape `{count, sources:[{..., priority:{...}}]}` is reported by Person 3 but not seen by me).
- Auth for the deployed UI: the backend uses one shared secret, which a public frontend cannot hold safely (see README). Needs a decision (open/throttled reports or Cognito).
- Browser preflight from `http://localhost:5173` and the Amplify domain (headers reported, preflight not yet verified).
- Unit and sign convention of `weighted_slope`.
