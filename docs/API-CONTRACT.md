# PAYLAK server contract draft

This is an implementation proposal. No API server is included in v0.1.

## Cross-cutting contract

- Every authenticated call derives customer/account ownership from the session, never a client-supplied user ID.
- Money: `{ currency: "USD", minor: 15000 }`; separate asset/network-scaled units for USDT. Reject floats and unsupported currencies.
- State-changing calls use a unique `Idempotency-Key`. Persist key, authenticated principal, normalized payload hash and result. Same key + different payload = 409. Concurrency must be serialized in a database transaction.
- Quotes are server-issued, expiring and bound to source, recipient, asset, fee schedule and eligibility. Client never supplies the fee used for execution.
- Errors: `{ code, messageKey, operationId?, retryable, nextAction }`. No account enumeration or protected compliance details.
- Example price targets from the research are not approved production configuration.

## Endpoints

| Endpoint                                 | Request                                         | Result / constraints                                                                                  |
| ---------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GET /v1/accounts                         | none                                            | Separate wallet/card balances, holds, permissions, limits and currencies                              |
| GET /v1/recipients?query=                | authenticated search                            | Approved lookup, masked identity, no public enumeration                                               |
| POST /v1/quotes                          | kind, sourceId, recipientId or agentId, amount  | quoteId, debit, credit/net cash, rate, fees, known external charges, expiresAt, route and eligibility |
| POST /v1/transfers                       | quoteId, authorizationToken                     | operationId, pending/completed/rejected; never inferred from HTTP timeout                             |
| GET /v1/operations/{id}                  | owned operation                                 | authoritative status, timestamps, fees, related receipts, next update, case reference                 |
| GET /v1/cash/agents                      | location, amount, currency                      | eligible agents, hours, accessibility, availability freshness; not an implicit liquidity guarantee    |
| POST /v1/cash/requests                   | quoteId                                         | awaiting-agent; wallet funds unheld until accepted and reservation atomically created                 |
| POST /v1/cash/reservations/{id}/cancel   | reason                                          | release active uncollected hold once; reject already collected                                        |
| POST /v1/agent/reservations/{id}/accept  | agent session, inventory version, pickup window | inventory and wallet hold transaction; customer eligibility rechecked                                 |
| POST /v1/agent/reservations/{id}/collect | verified collector proof and authorization      | consume hold and post ledger once; teller/customer receipts                                           |
| POST /v1/cards/{id}/loads                | quoteId                                         | separate wallet debit/card credit; pending state if issuer not confirmed                              |
| PATCH /v1/cards/{id}/controls            | freeze, onlineEnabled, spendLimit               | applied issuer state, not just locally requested state                                                |
| GET /v1/services/catalogue               | country, provider                               | actual supported products/denominations, compatibility, validity, prices                              |
| POST /v1/services/orders                 | quoteId, productId, validated destination       | payment/provisioning statuses separate; reconciled refund on final failure                            |
| POST /v1/requests                        | amount, note, expiry, scope                     | signed expiring request link with cancel/paid states                                                  |
| POST /v1/cases                           | operationId?, category, text                    | caseId, owner/team, acknowledgement, next update; no promise until staffed                            |

## Cash reservation transitions

`requested → agent_accepted → reserved → collected`

Alternate exits: `requested → rejected / timed_out`; `reserved → cancelled / expired / agent_failed`.

Only `reserved` has a wallet hold. Collection and release cannot both succeed. Server-side expiry jobs use the same compare-and-set transaction as collection. Agent failures create an owned support case and replacement/release options. A stale device view never grants payout authority.

## Required integration tests before connecting real funds

Duplicate webhook, duplicate confirmation, key-payload mismatch, cross-account access, expired quote, concurrent spends, double collection, collect-vs-expire race, issuer timeout, card-load reversal, partial payroll batch, service paid-but-not-provisioned, refund reconciliation, partner outage, and verified recovery with revoked sessions.
