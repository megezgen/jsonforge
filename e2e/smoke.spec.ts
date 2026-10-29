import { expect, test, type Page } from "@playwright/test";

const status = (page: Page) => page.getByRole("status");

async function setEditor(page: Page, text: string) {
  const editor = page.locator(".monaco-editor").first();
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Delete");
  await page.keyboard.insertText(text);
}

test.describe("JSON Forge", () => {
  test("loads the sample and shows stats and tree", async ({ page }) => {
    await page.goto("/");
    await expect(status(page)).toContainText("Valid JSON");
    await expect(status(page)).toContainText("Nodes: 16");
    await expect(page.getByRole("treeitem").first()).toBeVisible();
  });

  test("flags invalid JSON and Fix JSON repairs it", async ({ page }) => {
    await page.goto("/");
    await setEditor(page, "{'a': 1, b: [1,2,],}");
    await expect(status(page)).toContainText("Ln", { timeout: 5000 });
    await page.getByRole("button", { name: "Fix JSON" }).first().click();
    await expect(status(page)).toContainText("Valid JSON");
  });

  test("Ctrl+Enter formats and minify compacts", async ({ page }) => {
    await page.goto("/");
    await setEditor(page, '{"a":1,"b":[1,2]}');
    await expect(status(page)).toContainText("Valid JSON");
    await page.keyboard.press("Control+Enter");
    await expect(page.locator(".monaco-editor").first().locator(".view-line").nth(1)).toContainText('"a": 1');
    await page.getByRole("button", { name: "Minify" }).click();
    await expect(page.locator(".monaco-editor").first().locator(".view-line").first()).toContainText('{"a":1,"b":[1,2]}');
  });

  test("code generator produces a TypeScript interface", async ({ page }) => {
    await page.goto("/json-to-typescript/");
    await expect(page.getByText("export interface Root")).toBeVisible();
  });

  for (const [slug, expected] of [
    ["json-to-zod", "z.object({"],
    ["json-to-rust", "pub struct Root"],
    ["json-to-java", "public record Root("],
    ["json-to-yaml", "name: JSON Forge"],
  ] as const) {
    test(`${slug} generates output`, async ({ page }) => {
      await page.goto(`/${slug}/`);
      await expect(page.locator(".monaco-editor").nth(1)).toContainText(expected, { timeout: 15000 });
    });
  }

  test("json-sorter sorts keys by default", async ({ page }) => {
    await page.goto("/json-sorter/");
    await setEditor(page, '{"b":1,"a":{"d":1,"c":2}}');
    await expect(status(page)).toContainText("Valid JSON");
    await page.keyboard.press("Control+Enter");
    const editor = page.locator(".monaco-editor").first();
    await expect(editor.locator(".view-line").nth(1)).toContainText('"a"');
  });

  test("schema tab reports problems and accepts a generated schema", async ({ page }) => {
    await page.goto("/json-schema-validator/");
    await expect(status(page)).toContainText("Valid JSON");
    await page.getByLabel("Validate the editor content against this JSON Schema:").fill('{"type":"object","required":["missing"],"properties":{"id":{"type":"string"}}}');
    const result = page.getByRole("region", { name: "Schema validation result" });
    await expect(result).toContainText("problems found");
    await expect(result).toContainText("required");
    await expect(result).toContainText("$.id");
    await page.getByRole("button", { name: /Generate from JSON/ }).click();
    await expect(result).toContainText("Valid: the JSON matches the schema");
  });

  test("json-to-json-schema generates a schema", async ({ page }) => {
    await page.goto("/json-to-json-schema/");
    await expect(page.locator(".monaco-editor").nth(1)).toContainText("json-schema.org/draft/2020-12/schema", { timeout: 15000 });
  });

  test("diff highlights changes", async ({ page }) => {
    await page.goto("/json-diff/");
    await page.getByLabel("Compare the editor content against this JSON:").fill('{"id": 2}');
    await expect(page.getByText(/^\+\d+/)).toBeVisible();
  });

  test("tool pages expose SEO metadata", async ({ page }) => {
    await page.goto("/json-to-csv/");
    await expect(page).toHaveTitle(/JSON to CSV/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /json-to-csv\/$/);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("JSON to CSV");
  });

  test("unknown route shows the 404 page", async ({ page }) => {
    const res = await page.goto("/does-not-exist/");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
  });
});
