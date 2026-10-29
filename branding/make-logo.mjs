// Renders the site icon to a 512x512 PNG (used for social profiles). Run: node branding/make-logo.mjs
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const svg = readFileSync("src/app/icon.svg", "utf8");
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
await page.setContent(`<style>html,body{margin:0;background:#3794ff}svg{display:block;width:512px;height:512px}</style>${svg}`);
await page.screenshot({ path: "branding/jsonforge-logo-512.png" });
await browser.close();
