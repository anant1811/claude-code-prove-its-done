// "Prove it" check: open the real app in a real browser and look for the
// things unit tests can't see. Exit 0 = looks right, exit 1 = problems found.
//
//   VERIFY_URL=http://localhost:3000 node verify/verify.mjs
//
// Settings (environment variables):
//   VERIFY_URL    page to check (default http://localhost:3000)
//   VERIFY_START  optional command that starts your app, e.g. "npm run dev".
//                 If set and the URL isn't up yet, it's started and stopped for you.
//
// Checks, on desktop and mobile widths:
//   1. JavaScript errors (console errors, uncaught exceptions)
//   2. Failed requests (404s, 500s)
//   3. Broken values on screen (NaN, undefined, null, [object Object], Infinity)
//   4. Layout spilling off the screen (horizontal overflow)
// Then it saves screenshots so the agent (or you) can actually look.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const url = process.env.VERIFY_URL || "http://localhost:3000";
const shotsDir = join(fileURLToPath(new URL(".", import.meta.url)), "screenshots");
const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];
const BROKEN_VALUES = /\b(NaN|undefined|null|Infinity)\b|\[object Object\]/;

const isUp = () => fetch(url).then(() => true, () => false);

let app;
if (!(await isUp()) && process.env.VERIFY_START) {
  app = spawn(process.env.VERIFY_START, { shell: true, stdio: "ignore", detached: true });
  for (let i = 0; i < 60 && !(await isUp()); i++) await new Promise((r) => setTimeout(r, 500));
}
if (!(await isUp())) {
  console.log(`❌ VERIFY FAILED: nothing is running at ${url}. Start the app (or set VERIFY_START) and try again.`);
  process.exit(1);
}

await mkdir(shotsDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];
const shots = [];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const tag = `[${vp.name}]`;

  page.on("console", (m) => m.type() === "error" && problems.push(`${tag} console error: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`${tag} uncaught exception: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${tag} request failed: ${r.status()} ${r.url()}`));

  await page.goto(url, { waitUntil: "networkidle" });

  // Only check what a user can actually see.
  const visible = await page.evaluate(() => document.body.innerText);
  for (const line of visible.split("\n")) {
    if (BROKEN_VALUES.test(line)) problems.push(`${tag} broken value on screen: "${line.trim()}"`);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) problems.push(`${tag} layout overflows the screen by ${overflow}px`);

  const shot = join(shotsDir, `${vp.name}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  shots.push(shot);
  await page.close();
}

await browser.close();
if (app) process.kill(-app.pid);

console.log(`Screenshots (open these and look):\n${shots.map((s) => `  ${s}`).join("\n")}\n`);
if (problems.length) {
  console.log(`❌ VERIFY FAILED: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log("✅ VERIFY PASSED: no errors, no broken values, no overflow.");
