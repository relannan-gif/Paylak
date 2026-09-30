# PAYLAK — product design specification

Design development v0.1 · 30 September 2026 · Direction 2: Global precision

## Product promise

Know what is available, what a transaction costs and what happens next. A broad everyday money app for Lebanon, with cash, transfers and cards at its centre. The experience should scale globally without pretending Lebanon is a predominantly cashless market.

The source strategy is the revised Lebanon Money Transfer and Wallet Strategy dated 30 September 2026. Its proposed prices are hypotheses, not live tariffs. This design does not establish regulatory permission, partner acceptance or competitor exclusivity.

## Identity

- Master name: PAYLAK. Arabic: بايلاك. Never translate Paylak into a literal Arabic word.
- Direction: midnight, royal blue, porcelain and silver; quiet confidence; direct, friendly language.
- Symbol development: a squared P with an open lower stem and an offset terminal. The terminal gives the mark a recognisable detail beyond an ordinary PL monogram. Editable vector master: `brand/symbol.svg`. This is a development mark, not a cleared trademark.
- Wordmark: uppercase with controlled spacing. The current implementation uses a system sans; final custom outlines and Arabic lettering require another identity refinement pass.
- Palette: midnight #101C31, blue #315DDB, porcelain #F2F5F9, silver #BBC5D2. Blue is for action, not ordinary body text on dark surfaces. Dark-mode text uses a lighter accessible accent #88AAFF.
- Clear space: at least one stem width around the symbol, half the cap height around the wordmark. Minimum symbol 20px in UI; app icon master 1024px.
- Never use money signs, cedar emblems, coin renders, luminous gradients, AI sparkles, metallic gold, random abstract waves or an exchange-rate chart as decoration.
- Voice: “Review transfer”, “Nothing was debited”, “Waiting for confirmation”. Avoid “Success!” without an actual outcome. Explain what a customer can do next.
- Photography direction for future campaigns: real local errands, travel and working life. Commission or license authentic photography. No generated customer testimonials or fabricated operating locations.

## Design system

Token source: `brand/tokens.json`; application theme source: `src/theme.ts`.

Spacing follows 4/8/12/16/20/24/32/40/48. Screen gutters 24px; content width at most 480px for the phone preview. Control radius 12px, panels 20px. Use dividers for lists rather than boxing every row. A single strong primary action per decision.

Type hierarchy: 44px main balance; 30px page titles; 18px section headings; 15–16px body; 12–13px supporting copy. Do not shrink prices or fees into footnotes. Production must support text enlargement without fixed-height clipping. All controls target at least 48px where practical; narrow prototype utility buttons need an accessibility pass before native release.

Component inventory: Symbol, wordmark, page header, main tab bar, balance display, currency row, quick action, list cell, review summary, money input, recipient selector, agent selector, status tag, card artwork, toggles, notification, receipt, error message, empty state and primary/secondary buttons. Each component has light and dark colours. RTL mirrors layout and directional navigation; logos, card artwork, references and money amounts remain LTR.

Native type defaults to SF/Roboto and the device Arabic font. Arabic system text is authored, not transliterated. Proper sample names and imported merchant names can remain in their source language. The final Arabic copy, truncation, screen reader order and real-device scaling need native-language QA.

## Navigation

1. Home: available wallet balance, LBP balance, separate card balance; Send/Add/Get cash/Request; activity; pockets.
2. Payments: people, requests, local and approved international routes, bills and history.
3. Cards: virtual/physical card, separate funds, freeze, online toggle, limits, activity and disputes.
4. Cash: eligible locations, quotes, availability requests, confirmed windows, holds and collection history.
5. Services: top-ups, eSIM, supported bills, digital purchases and business entry.

Profile and human help are visible from every screen. Activity remains a searchable destination. The main navigation is consistent in English and Arabic. Partner-dependent services display honest availability rather than fake transaction buttons.

## Customer journeys and full target states

### Registration and account recovery

Welcome → choose language and useful first task → phone → OTP → consent → document → selfie → review → approved, needs-information or rejected → first funding → selected first task. Save only permitted progress. OTP expiry, resend cooldown, device change, duplicate account, camera denial and unreadable document each need a specific recovery action. Do not present pending identity review as completion.

Recovery: lost device → secure identity recovery → revoke old sessions → rebind phone and trusted device → notify prior channels where appropriate → proportionate restrictions with a clear status. Never make support request OTPs or PINs. Current demo has four onboarding preview stages and a recovery/help entry; no capture, SMS or identity integration.

### Send money

Recipient search → verified identity preview → eligibility/recipient limits → amount/currency → source → authoritative quote → review → step-up authorization where required → submit once with idempotency key → pending/completed/failed → receipt and contextual help. Note is optional. Current demo provides sample contacts, integer-cent validation, review, session ledger and receipt; recipient verification and step-up authorization are not implemented.

States: empty contacts, no search result, invalid input, insufficient available funds, recipient unavailable, recipient limit, quote expired, offline before confirmation, ambiguous submission, under review, completed, rejected, reversed and dispute. Reuse the operation reference after a lost response; never invite a second debit. Backend status is authoritative. Current scenario switch covers offline-before-submission, decline and simulated pending; it does not simulate a real uncertain network response.

### Request and split

Amount and purpose → choose recipient or shareable request → review → issue signed expiring request → paid/partial/expired/cancelled → reminders and receipts. Splits: group total → shares → invite → paid status per member; prevent overcollection. Current demo creates a local request reference only, not a live link. Splits are specified, not implemented.

### Add cash

Eligible agent → deposit amount and fee quote → customer reference → teller identifies customer → cash counted → teller confirmation → credit posted → receipt. Never show credit before server confirmation. States include underpayment, wrong currency, reference expiry, agent offline and customer/teller disagreement. Current demo explains the journey and shows sample locations; it cannot credit deposits.

### Get cash and the proposed distinctive experience

Choose net cash amount → supported currency/denominations → eligible nearby agent → complete quote → request availability → agent accepts amount and window → hold posted atomically → customer gets pickup reference → verified collection → debit/hold release + cash-out receipt. An unconfirmed request is not a reservation. The live system must distinguish agent acknowledgement, inventory hold and wallet hold.

Agent rejection → alternatives; acceptance timeout → no hold; expiry → automatic release; customer cancellation → release before collection; collection → consume hold once; failed fulfilment → rebook or release and apply the approved remedy. Race-safe server locks must prevent expiry and collection both winning. Current demo explicitly simulates acceptance, creates an available-balance hold and supports idempotent cancellation. It does not perform pickup, auto-expiry, agent inventory or settlement.

### Cards

Eligibility and fees → select card → issue → activation and 3DS setup → load explicitly from wallet → use → authorisation hold → settlement or reversal. Show wallet and card funds separately. Freeze, online spending and limits are free safety controls, not a paid-plan upsell. Card details require re-authentication and issuer-controlled secure display. Refund tracking distinguishes pending merchant refund from reversal of an authorisation. Physical ordering adds delivery address, pricing, delivery tracking, replacement and lost-card handling.

Current demo has illustrative card artwork, separate balance, simulated loading, freeze, online toggle and personal limit. No PAN/CVV, issuer, network tokenisation, Apple Pay/Google Pay, physical order, credit facility or authorisation integration.

### eSIM / top-up / bill purchase

Top-up: carrier → valid phone → supported denomination → quote → review → payment pending → operator confirmation → receipt; failed provisioning triggers reconciliation/refund, not another unguarded charge. Demo accepts illustrative amounts; the live catalogue must supply fixed supported denominations and country/carrier rules.

eSIM: destination → coverage/carriers → data/validity/start rule → device compatibility and unlocked status → price → confirm → provisioning → installation instructions/QR → usage and support. Do not show “activated” merely because payment completed. Demo shows sample plans and a wallet-debit simulation; no eSIM is provisioned.

Bills: biller → customer reference → bill retrieval → amount/due date/fees → confirm → biller acknowledgement → receipt. Gift cards are one-off vouchers; card-funded subscriptions are recurring payments. Keep these products distinct. Both are scope previews today.

### USDT (disabled)

Eligibility gate → supported token and network → custody disclosure → deposit address from partner → detected → confirmations → screening review → usable USDT. Explicit conversion: amount → executable rate and every fee → expiry → consent → USDT debit → USD wallet/card credit. Cash route adds its own quote and agent acknowledgement. External withdrawal is a separate permission with network validation, address checks and appropriate approvals.

States include wrong network, wrong asset, insufficient confirmations, under review, below minimum, liquidity unavailable, peg movement, expired quote and provider suspension. No deposit address, balance equivalence or live service promise exists in the demo. A normal merchant card transaction settles under the issuer arrangement; the merchant is not being promised direct USDT acceptance.

### Merchant and employer journeys

Business KYC and controller verification → staff roles → payment link / QR / invoice → payer completes approved payment → server credit confirmation on merchant device → wallet/card/supplier/payroll/cash-settlement choice → reconciliation. Do not accept payer screenshots as evidence. Partial refunds and voids follow the original ledger reference.

Payroll: upload/prepare → validate recipients/amounts → preview errors and net totals → maker/checker approval → funded batch → per-recipient status → exceptions and export. A partially completed batch is never marked fully paid. Demo offers a business scope preview and cash flow entry only.

### Pockets, family and rewards

Pockets: named purpose, move in/out, available versus reserved, no interest implication. Demo has one travel pocket and move-in only. Family: guardian consent/eligibility, child permissions, allowance, spend limits, visibility and revocation require their own approved architecture. Rewards: only eligible, settled, merchant-funded rewards; handle refunds and reversals. Full family and rewards designs are backlog specifications, not implemented screens.

## Website design

Responsive landing page in `website/index.html`: identity/navigation → everyday-money hero and editable product illustration → balance/price/language principles → cash reservation explanation → transfer/card/service sections → merchant proposition → FAQ → footer. English/Arabic toggle mirrors layout. Product artwork remains English in this first website preview; localized artwork remains outstanding. No fabricated app-store badges, regulatory badges, live customer numbers, testimonials or final tariffs. CTAs open the interactive demo.

## Launch architecture (target, not implemented)

The current frontend is not a financial backend. Use a server-authoritative double-entry ledger with separate wallet/card/USDT books, safeguarded funds reconciliation, idempotent commands, expiring quotes, role-based access and immutable audit records. Integer minor units for fiat; decimal-safe token units plus explicit asset/network identity for crypto. Persist no real ledger, secrets or sensitive KYC in browser storage.

Service boundaries: identity/auth, customer eligibility, wallets/ledger, quotes/tariffs, payment orchestration, agent liquidity/reservations, issuing, remittance, biller/eSIM catalogue, conditional crypto, cases/notifications, merchant/payroll, reconciliation and compliance. Provider adapters normalize references and statuses while preserving raw event evidence. Webhooks must be authenticated, replay-resistant and ordered/idempotent; every external event has a reconciliation owner.

## Release gates

Complete native device testing, accessibility, RTL language QA, secure authentication, business/provider approvals, account and card limit controls, compliance screening, database recovery, reconciliation, agent operations and support staffing before a live release. No frontend or visual demo check substitutes for these gates.

## Implementation phases

1. Design foundation (this package): brand development, tokens, broad journey specification, interactive Expo demo, responsive website, local QA evidence.
2. Product completion: final logo/type, all catalogued states, production navigation decomposition, secure login/onboarding, backend contracts and test harness, real-device design validation.
3. Connected fiat pilot: contracted KYC, cash, issuer, P2P, services and reconciliation; limited operational pilot.
4. Approved expansion: selected international routes, merchant/payroll tools, family features and any explicitly authorized USDT programme.
