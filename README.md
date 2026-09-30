# PAYLAK

Direction 2 / Global precision — design and interactive app foundation v0.1.

**Demonstration only. No real account, KYC, payment, card, cash pickup, eSIM or USDT integration.** The demo ledger lives in memory and resets on reload. No backend is included. This is the start of the build, not a launch-ready financial platform.

## Run

Node 24 recommended (minimum matching Expo SDK 57). After cloning:

```sh
npm ci
npm run web
```

For native development, use `npm run ios` or `npm run android` with a compatible Expo environment. A real-device development build and EAS project association are still required before claiming native validation. `eas.json` contains development/preview profiles; no store identifiers or signing credentials have been invented.

```sh
npm run check
npm run build:web
npm run website
```

The exported app is at `/`; the companion website is at `/website/`. The local preview server supports route fallback. GitHub Pages deep-link refresh handling is included in the export.

## What works in the demo

- Home, Payments, Cards, Cash and Services navigation.
- Sample USD/LBP overview and distinct card funds.
- Recipient selection, amount validation, review, example fees, expiring quote, simulated send and receipt.
- Cash request, explicit simulated agent acceptance, held available balance and cancellation.
- Card loading, freeze/unfreeze, online control and monthly spending limit.
- Activity search/filter, receipt detail, sample request and support case creation.
- Top-up simulation with number validation; illustrative eSIM plan selection.
- Travel pocket funding; profile, light/dark, Arabic/English; sample onboarding.
- Demo controls in Profile for offline, declined and pending scenarios.
- Responsive bilingual marketing website and editable vector identity.

## Designed but not connected

Bank/card/cash deposits, KYC/OTP, biometrics, international routes, issuer servicing, physical cards, real eSIM provisioning, bill retrieval, live support, merchant collections/payroll and USDT. Some are honest scope-preview screens. Full target journeys and failure states are documented in `docs/PRODUCT-DESIGN.md`; do not mistake the document for implemented functionality.

## Repository map

| Path | Purpose |
|---|---|
| src/app | Expo Router entry and screen routes |
| src/screens.tsx | Initial interactive screen implementation; split by feature as production work begins |
| src/ui.tsx | Shared components, icon paths and card artwork |
| src/store.tsx | In-memory demonstration state |
| src/domain.ts | Exact-cent demo transactions and hold rules; never use client-side ledger for real money |
| src/theme.ts / brand/tokens.json | Theme and design tokens |
| brand | Editable SVG identity and review materials |
| website | Responsive English/Arabic landing page |
| docs | Product design, API proposal, implementation status and QA |
| tests | Domain tests and browser journey checks |
| .github/workflows | CI verification and manually triggered Pages preview |

## GitHub handoff

Repository: https://github.com/relannan-gif/Paylak. The initial repository was empty. This project is the first design and app foundation import. The earlier delivery ZIP includes source and the exported preview; local Git history is not included. Website publishing is a separate manual action.

To publish the demo after importing, enable GitHub Pages with GitHub Actions and manually run `Publish design preview (manual)`. This publishes a clearly marked demo only. Production deployment is a separate milestone.

## Product constraints

No real credentials or financial identifiers in source. Final tariffs, card/wallet limits and partner capabilities must be server-configured after approval. Wallet and card funds remain distinct. USDT is disabled. Client confirmation is never evidence that a real payment settled. Trademark/domain clearance is outstanding.
