# Meridian — Irion neobank reference frontend

**A complete reference neobank built entirely on the [Irion B2B API](../irion-b2b-api).**

---

## What it is

Meridian is a working neobank that shows integrators how to build a full banking product on top of
the Irion B2B API — nothing custom on the backend, just the API. Users sign in with a **passkey**
(WebAuthn — Touch ID / Windows Hello / any FIDO2); the Irion platform custodies their
operator-allocated Canton party, so the app can move money on their behalf. Every balance, transfer,
swap, loan and salary settles on the **Canton ledger**.

The sidebar maps one-to-one onto the API's capabilities:

| Nav | Backed by |
|---|---|
| **Home** | `GET /v1/account/treasury` — multi-currency balances + yield + total |
| **Send** | `POST /v1/account/transfers` — atomic settlement to any counterparty / payee |
| **Convert** | `POST /v1/account/treasury/rebalance` — real on-ledger FX swap (USDC/EURC/GBPC) |
| **Earn** | `POST /v1/account/treasury/sweep` · `/redeem` — idle cash into/out of the yield pool |
| **Borrow** | `POST /v1/account/credit/underwrite` + `/v1/account/loans` — real on-ledger underwriting + working capital |
| **Pay team** | `POST /v1/account/payroll/runs` — **private payroll** (each salary its own per-employee contract) |

A built-in **Developer drawer** shows, live, the exact API calls each screen makes — so an integrator
can see the request/response for every action as they click.

## Run

```bash
npm install
npm run dev          # http://localhost:3006   (Next.js 16)
# npm run build && npm start   # build uses --webpack
```

Requires the [Irion B2B API](../irion-b2b-api) running on `:8088` (with a Canton ledger behind it).
The b2b-api allows `:3006` as a passkey/CORS origin.

### Environment (`.env.local`)

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_B2B_API_URL` | the Irion B2B API it consumes — default `http://localhost:8088` |

## How it fits the system

```
Meridian (passkey login)
   │  Authorization: Bearer <session>
   ▼
irion-b2b-api :8088  ──►  Canton JSON Ledger API v2  ──►  Irion Daml protocol
```

Meridian is a pure client of `/v1/account/*` — the same passkey-authed surface the merchant
`/dashboard` console uses. It's the consumer-grade reference next to that operator console.

## Layout

| Path | What |
|---|---|
| `components/Dashboard.tsx` | the app shell + per-view screens |
| `components/Sidebar.tsx` | Home / Send / Convert / Earn / Borrow / Pay team |
| `components/DevDrawer.tsx` | live "here are the API calls" developer panel |
| `components/neobank/Login.tsx`, `auth.tsx` | passkey register/login (`@simplewebauthn/browser`) |
| `lib/neobank.ts` | typed client for the b2b-api |
