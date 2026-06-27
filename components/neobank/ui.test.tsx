import { test } from "node:test"
import assert from "node:assert/strict"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { fmt, short, PageHeader, Card, Stat } from "./ui.tsx"

// Real component rendering (react-dom/server executes the components) — catches
// render crashes, prop bugs, and conditional-render regressions without a browser.

test("fmt: money with 2 decimals + thousands separators; null-safe", () => {
  assert.equal(fmt(1234.5), "1,234.50")
  assert.equal(fmt(undefined), "0.00")
  assert.equal(fmt(0), "0.00")
})

test("short: truncates long ids with an ellipsis, keeps short ones", () => {
  assert.equal(short("abc"), "abc")
  assert.equal(short(undefined), "")
  const s = short("party-1234567890abcdef0000")
  assert.ok(s.includes("…"))
  assert.ok(s.length < "party-1234567890abcdef0000".length)
})

test("PageHeader renders an <h1> title + the subtitle", () => {
  const html = renderToStaticMarkup(<PageHeader title="Treasury" subtitle="Multi-currency" />)
  assert.match(html, /<h1[^>]*>Treasury<\/h1>/)
  assert.match(html, /Multi-currency/)
})

test("PageHeader omits the subtitle node when not given", () => {
  const html = renderToStaticMarkup(<PageHeader title="Only" />)
  assert.match(html, /Only/)
  assert.doesNotMatch(html, /text-white\/40 mt-1/) // the subtitle <p> class
})

test("Card renders its children inside the card shell", () => {
  const html = renderToStaticMarkup(<Card>Hello</Card>)
  assert.match(html, /Hello/)
  assert.match(html, /rounded-2xl/)
})

test("Stat renders label + value + optional sub", () => {
  const html = renderToStaticMarkup(<Stat label="Balance" value="$100.00" sub="USDC" />)
  assert.match(html, /Balance/)
  assert.match(html, /\$100\.00/)
  assert.match(html, /USDC/)
})
