import { defineConfig, devices } from "@playwright/test"

// E2E config for Meridian. Runs the real Next app on :3006 (an allowed passkey
// origin in the b2b-api's IRION_RP_ORIGIN) and drives Chromium with a VIRTUAL
// WebAuthn authenticator — so the passkey register/login signing flow runs
// headlessly against the live b2b-api + Canton ledger. Requires the b2b-api up on
// :8088. Kept separate from `npm test` (node:test). Run with `npm run e2e`.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  reporter: "list",
  use: { baseURL: "http://localhost:3006", trace: "on-first-retry" },
  webServer: {
    command: "npm run dev -- -p 3006",
    url: "http://localhost:3006",
    timeout: 180_000,
    reuseExistingServer: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
