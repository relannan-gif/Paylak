# Verification — 30 September 2026

Scope: the client-side design prototype and its responsive website. This is not a production security, financial compliance or native-device certification.

## Results

- TypeScript check: passed.
- ESLint: passed.
- Domain tests: 7 passed. Exact cents and Arabic numeric parsing, rejected inputs, duplicate confirmation, separate card funds, cash holds, cancellation and rejected mutations.
- Browser journeys: 22 passed in headless Chromium. Results are recorded in `qa/browser-results.json`; screenshots are in the same folder.
- Web export: succeeded.
- Browser runtime errors: none captured during the tested journeys.

Browser coverage includes five-tab navigation, recipient preservation, amount validation, send/receipt, cash hold/cancellation, card load/freeze, spending limits, top-up validation, eSIM disclosure, disabled USDT, local support cases, offline/declined/pending scenarios, Arabic amount entry and RTL, light appearance, a 320px viewport, secondary route rendering and the bilingual website.

Screenshots were visually reviewed. App web typography bundles DejaVu Sans regular and bold to avoid platform-dependent font substitution; the font license is included with the assets.

## Reproduce

Run `npm ci`, `npm run check`, `npm run build:web`, `npx playwright install chromium`, then `npm run test:browser`. The browser script starts and stops its own local server. `PAYLAK_CHROMIUM_PATH` can select an existing Chromium executable. The delivery run used Chromium 153 in this environment.

## Outstanding

Native iOS/Android builds and device testing; screen-reader and keyboard accessibility audits; production authentication and secure storage; real backend and ledger concurrency; provider integrations, signed callbacks and reconciliation; stress/security testing; final Arabic editorial review. The website's decorative product artwork still contains English text in Arabic mode. Session data resets on reload. No real money, cards, cash agents or crypto network was used.
