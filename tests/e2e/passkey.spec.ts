import { test, expect } from "@playwright/test"

// Browser-interactive SIGNING E2E: a virtual WebAuthn authenticator drives the
// real passkey flow (no hardware). Registering on Meridian calls the live b2b-api
// (/v1/auth/register/begin → navigator.credentials.create → /finish), which
// verifies the attestation, allocates a Canton party, and issues an HMAC session
// token. This exercises the click → passkey-sign → server path end-to-end against
// the running b2b + ledger. Requires the b2b-api up on :8088.

async function addVirtualAuthenticator(page: import("@playwright/test").Page) {
  const client = await page.context().newCDPSession(page)
  await client.send("WebAuthn.enable")
  await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })
}

test("register with a passkey → b2b issues a session + Canton party", async ({ page }) => {
  await addVirtualAuthenticator(page)
  await page.goto("/app") // shows the passkey Login when unauthenticated

  await page.getByRole("button", { name: "Create account" }).click()
  await page.getByPlaceholder("Acme Inc.").fill("E2E Test Co")
  await page.getByPlaceholder("you@acme.com").fill(`e2e-${Date.now()}@example.com`)

  // Assert on the server response — robust against post-register navigation.
  const finish = page.waitForResponse((r) => r.url().includes("/v1/auth/register/finish"), { timeout: 30_000 })
  await page.getByRole("button", { name: /Create with passkey/i }).click()
  const resp = await finish

  expect(resp.status(), "register/finish succeeds").toBe(201)
  const body = await resp.json()
  expect(body.session, "an HMAC session token is issued").toBeTruthy()
  expect(body.account?.party, "a real Canton party is allocated").toBeTruthy()
})
