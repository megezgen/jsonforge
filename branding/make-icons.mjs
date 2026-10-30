// Renders PWA icons from src/app/icon.svg. Run: node branding/make-icons.mjs
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const svg = readFileSync("src/app/icon.svg", "utf8");
const browser = await chromium.launch({ channel: "chrome" });
async function render(size, file, pad = 0) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const inner = size - pad * 2;
  await page.setContent(`<style>html,body{margin:0;background:#3794ff;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px}svg{width:${inner}px;height:${inner}px}</style>${svg}`);
  await page.screenshot({ path: file });
  await page.close();
}
await render(192, "public/icons/icon-192.png");
await render(512, "public/icons/icon-512.png");
// Maskable icons need a safe zone: keep the artwork inside the central 80%.
await render(512, "public/icons/maskable-512.png", 51);
await browser.close();
