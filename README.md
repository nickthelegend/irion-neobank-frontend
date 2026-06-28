# Meridian

**A reference neobank on the [Irion B2B API](../irion-b2b-api).**

Meridian is part of [**Irion**](../) — private consumer credit and B2B neobank infrastructure on the
[Canton Network](https://www.canton.network/) (Daml smart contracts). _Buy Now, Pay Never._ Privacy
by construction: a Daml contract is visible only to its signatory and observer parties, so balances,
transfers, FX, loans, and payroll are private at the protocol layer — no ZK circuit required.

---

## What it is

Meridian is a complete, fully-working neobank built **entirely on the Irion B2B API** — there is no
custom backend, no database, and nothing faked in the money path. Every screen is a thin client over
the API's `/v1/account/*` surface, and every balance, transfer, swap, loan, and salary settles on a
real **Canton ledger** behind that API.

It exists to show integrators — other businesses and neobanks building on Irion — exactly how to
consume the platform: how to authenticate with passkeys, how to read a treasury, how to run an FX
swap, how to draw working capital, and how to pay a team privately. A built-in **Developer drawer**
makes this concrete by surfacing the actual API calls each screen makes, live, as you click.

In short: if you want to see what an integrator can build on Irion, Meridian _is_ that build.

## Features

The sidebar maps one-to-one onto the API's capabilities. Each section is a working product surface
backed by a real, on-ledger endpoint:

| Section          | What it does                                          | Backed by                                                      |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| **Home**         | Multi-currency balances, yield, and total            | `GET /v1/account/treasury`                                     |
| **Send**         | Atomic transfer to any counterparty or payee          | `POST /v1/account/transfers`                                   |
| **Convert (FX)** | Real on-ledger FX swap across USDC / EURC / GBPC      | `POST /v1/account/treasury/rebalance` · `/rates`              |
| **Earn**         | Sweep idle cash into the yield pool, or redeem it     | `POST /v1/account/treasury/sweep` · `/redeem`                 |
| **Borrow**       | On-ledger underwriting + draw / repay working capital | `POST /v1/account/credit/underwrite` · `/v1/account/loans`    |
| **Pay team**     | Private payroll — each salary is its own contract     | `POST /v1/account/payroll/runs` · `/v1/account/employees`     |

**Developer drawer** — a slide-out panel that shows, live, the exact request and response for every
action you take in the UI. It turns Meridian into self-documenting reference material: an integrator
can watch the API behave in real time instead of reading about it.

## How passkey auth works

Authentication is **passkeys** (WebAuthn / FIDO2 — Touch ID, Windows Hello, or a hardware security
key), via [`@simplewebauthn/browser`](https://simplewebauthn.dev/). There are no passwords, and there
is no spoofable client-supplied identity header. The flow:

1. **Register / sign in** — the browser calls `/v1/auth/register/begin` (or `/login/begin`) to get a
   WebAuthn challenge, prompts the device authenticator, and posts the signed attestation/assertion
   back to `/finish`.
2. **Session** — the b2b-api verifies the passkey, allocates (or looks up) an **operator-custodied
   Canton party** for the account, and returns an **HMAC session token**.
3. **Authorized calls** — that token is sent as `Authorization: Bearer <session>` on every
   subsequent `/v1/account/*` request. The platform custodies the account's party, so automated
   treasury and payroll actions can be signed unattended.

```
Meridian (passkey login)
   │  Authorization: Bearer <session>
   ▼
irion-b2b-api :8088  ──►  Canton JSON Ledger API v2  ──►  Irion Daml protocol
```

This replaces the old, spoofable `x-wallet-address` header: identity is now proven by a passkey
signature and carried by a signed session token. Meridian is a pure client of `/v1/account/*` — the
same passkey-authed surface the merchant `/dashboard` console (in
[`irion-merchant-app-canton`](../irion-merchant-app-canton)) consumes. The two are sibling reference
clients on one API.

## Getting started

**Prerequisite:** the [Irion B2B API](../irion-b2b-api) must be running on **`:8088`** with a Canton
ledger behind it, and it must allow `:3006` as a passkey relying-party origin (add it to the API's
`IRION_RP_ORIGIN`). Passkeys are origin-bound — without `:3006` in that allowlist the browser will
reject the WebAuthn ceremony.

```bash
npm install
npm run dev -- -p 3006      # http://localhost:3006   (Next.js 16)
```

Then open <http://localhost:3006/app> and create an account with your device passkey.

### Environment (`.env.local`)

| Variable                  | Purpose                                                       | Default                 |
| ------------------------- | ------------------------------------------------------------ | ----------------------- |
| `NEXT_PUBLIC_B2B_API_URL` | Base URL of the Irion B2B API that Meridian consumes         | `http://localhost:8088` |

### Production build

```bash
npm run build               # uses --webpack
npm start
```

## Testing

```bash
npm test                    # node:test (tsx) — API-client contract + UI render tests
npm run e2e                 # Playwright — real passkey signing E2E (virtual WebAuthn authenticator)
```

- **`npm test`** runs Node's built-in test runner (via `tsx`, no extra runtime deps) over
  `lib/**/*.test.ts` and `components/**/*.test.tsx`. It covers the `lib/neobank.ts` API-client
  contract (request shapes, headers, the `Bearer` session) and component render output (real
  server-side rendering via `react-dom/server`, no jsdom or browser needed).
- **`npm run e2e`** runs a Playwright end-to-end test that drives the **real passkey flow** using a
  Chrome DevTools **virtual WebAuthn authenticator** — no hardware required. It registers a fresh
  account on a running b2b-api, asserts that `/v1/auth/register/finish` returns `201`, and verifies
  the response carries a valid **HMAC session token** and a real **Canton party**. This proves the
  click → passkey-sign → server → ledger path against the live stack, so the e2e requires the b2b-api
  up on `:8088`.

## Project layout

```
app/
  app/                       Next.js route — the /app entry (renders Login when unauthenticated)
  layout.tsx, globals.css    app shell + brand styling (lime-green #a6f24a on near-black)
components/
  Dashboard.tsx              app shell + per-view screens (Home / Send / Convert / Earn / Borrow / Pay team)
  Sidebar.tsx                navigation
  DevDrawer.tsx              live "here are the API calls" developer panel
  neobank/
    Login.tsx                passkey register / sign-in UI (@simplewebauthn/browser)
    auth.tsx                 session/auth context
    ui.tsx                   shared UI primitives  (+ ui.test.tsx render tests)
lib/
  neobank.ts                 typed client for the b2b-api  (+ neobank.test.ts contract tests)
tests/
  e2e/passkey.spec.ts        Playwright virtual-authenticator passkey signing E2E
```

## Related repositories

| Repo                                                       | Role                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`irion-b2b-api`](../irion-b2b-api)                        | Meridian's only backend — the REST API over the Canton ledger (`:8088`)       |
| [`irion-merchant-app-canton`](../irion-merchant-app-canton)| The merchant / operator console — the other reference client on the same API  |
| [`irion-contracts-canton`](../irion-contracts-canton)      | The Daml protocol (Token, Pool, Bnpl, Credit, Config) the API settles against |
