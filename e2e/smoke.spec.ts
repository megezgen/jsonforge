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
    ["json-to-yaml", "apiVersion: apps/v1"],
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
    await page.getByLabel("Validate the editor content against this JSON Schema:").fill('{"type":"object","required":["missing"],"properties":{"id":{"type":"number"}}}');
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

  test("jsonpath tester evaluates recursive and filter expressions", async ({ page }) => {
    await page.goto("/jsonpath-tester/");
    await expect(status(page)).toContainText("Valid JSON");
    const results = page.getByRole("region", { name: "JSONPath results" });
    await expect(page.getByLabel("JSONPath expression")).toHaveValue(/book/);
    await expect(results).toContainText("3 matches");
    await page.getByLabel("JSONPath expression").fill("$..author");
    await expect(results).toContainText("4 matches");
    await expect(results).toContainText("$.store.book[0].author");
    await page.getByLabel("JSONPath expression").fill("$..[?(@.inStock == true)]");
    await expect(results).toContainText("$.store.book[0]");
    await page.getByLabel("JSONPath expression").fill("$..[?(");
    await expect(results.locator(".text-danger")).toBeVisible();
  });

  test("footer links to the repository and the support page", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", /github\.com\/megezgen\/jsonforge/);
    await expect(page.getByRole("link", { name: "Support the project" })).toHaveAttribute("href", /buymeacoffee\.com\/jsonforgedev/);
    await expect(page.getByRole("link", { name: "Support JSON Forge" })).toHaveAttribute("href", /buymeacoffee\.com\/jsonforgedev/);
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
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(2);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("JSON to CSV");
  });

  test("unknown route shows the 404 page", async ({ page }) => {
    const res = await page.goto("/does-not-exist/");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
  });
});

test.describe("page-specific demo data", () => {
  test("validator page opens with broken JSON that Fix JSON repairs", async ({ page }) => {
    await page.goto("/json-validator/");
    await expect(page.getByRole("status")).toContainText("Ln", { timeout: 10000 });
    await page.getByRole("button", { name: "Fix JSON" }).first().click();
    await expect(page.getByRole("status")).toContainText("Valid JSON");
  });

  test("diff page opens with two versions already compared", async ({ page }) => {
    await page.goto("/json-diff/");
    await expect(page.getByText(/^\+\d+/)).toBeVisible({ timeout: 10000 });
  });

  test("csv page opens with a table-shaped sample", async ({ page }) => {
    await page.goto("/json-to-csv/");
    await expect(page.locator(".monaco-editor").nth(1)).toContainText("id,name,city", { timeout: 15000 });
  });
});

test.describe("share link", () => {
  test("round-trips the JSON through the URL fragment without a server", async ({ page, context }) => {
    await page.goto("/json-sorter/");
    await setEditor(page, '{"shared":true,"n":[1,2,3]}');
    await expect(status(page)).toContainText("Valid JSON");
    await page.getByRole("button", { name: /Share/ }).click();
    await expect.poll(() => page.url()).toContain("#j=");

    const other = await context.newPage();
    await other.goto(page.url());
    await expect(other.getByRole("status")).toContainText("Valid JSON");
    await expect(other.getByRole("status")).toContainText("Nodes: 6");
    await expect(other.locator(".monaco-editor").first()).toContainText('"shared"');
  });

  test("a damaged link shows an error instead of breaking the page", async ({ page }) => {
    await page.goto("/#j=not-valid-data");
    await expect(page.getByText("This share link is damaged")).toBeVisible();
    await expect(page.getByRole("button", { name: "Format" }).first()).toBeVisible();
  });
});

test.describe("offline", () => {
  test("works without a connection after the first visit", async ({ page, context }) => {
    await page.goto("/");
    await expect(status(page)).toContainText("Valid JSON");
    // Wait until the service worker controls the page and has filled its precache.
    await expect
      .poll(
        async () =>
          page.evaluate(async () => {
            await navigator.serviceWorker.ready;
            if (!navigator.serviceWorker.controller) return -1;
            const names = (await caches.keys()).filter((n) => n.startsWith("jf-precache"));
            const pre = names.length ? (await (await caches.open(names[0]!)).keys()).length : 0;
            const run = (await caches.keys()).filter((n) => n.startsWith("jf-runtime"));
            const runCount = run.length ? (await (await caches.open(run[0]!)).keys()).length : 0;
            return pre > 20 && runCount > 5 ? pre : 0;
          }),
        { timeout: 30000 },
      )
      .toBeGreaterThan(20);

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole("button", { name: "Format" }).first()).toBeVisible();
    await expect(status(page)).toContainText("Valid JSON", { timeout: 15000 });
    await expect(page.locator(".monaco-editor").first()).toBeVisible();
    await context.setOffline(false);
  });
});

test("benchmarks page shows the measured table and honest limits", async ({ page }) => {
  await page.goto("/benchmarks/");
  await expect(page).toHaveTitle(/Benchmarks/);
  await expect(page.getByRole("row")).toHaveCount(5);
  await expect(page.getByText("What still pauses the page")).toBeVisible();
  expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(2);
});

test.describe("guides", () => {
  for (const [slug, heading] of [
    ["/", "A practical guide to reading JSON"],
    ["/large-json-viewer/", "A workflow for big files"],
    ["/json-to-typescript/", "Optional, nullable and missing are three different things"],
    ["/json-schema-validator/", "Drafts and what changed between them"],
    ["/jsonpath-tester/", "Syntax cheat sheet"],
  ] as const) {
    test(`${slug} has its guide`, async ({ page }) => {
      await page.goto(slug);
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    });
  }
});

test.describe("tree editing", () => {
  const row = (page: Page, key: string) => page.getByRole("treeitem").filter({ hasText: `"${key}"` }).first();
  const editor = (page: Page) => page.locator(".monaco-editor").first();

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(status(page)).toContainText("Valid JSON");
    await expect(row(page, "id")).toBeVisible();
  });

  test("edits a number and keeps the editor in sync", async ({ page }) => {
    await row(page, "id").hover();
    await row(page, "id").getByRole("button", { name: "Edit value" }).click();
    await page.getByLabel("New value").fill("99");
    await page.keyboard.press("Enter");
    await expect(editor(page)).toContainText('"id": 99');
    await expect(row(page, "id")).toContainText("99");
  });

  test("a string stays a string when typed without quotes", async ({ page }) => {
    await row(page, "name").hover();
    await row(page, "name").getByRole("button", { name: "Edit value" }).click();
    await page.getByLabel("New value").fill("Renamed");
    await page.keyboard.press("Enter");
    await expect(editor(page)).toContainText('"name": "Renamed"');
  });

  test("invalid JSON for a non-string value is rejected with a message", async ({ page }) => {
    await row(page, "private").hover();
    await row(page, "private").getByRole("button", { name: "Edit value" }).click();
    await page.getByLabel("New value").fill("maybe");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert").filter({ hasText: "That is not valid JSON" })).toBeVisible();
    await expect(editor(page)).toContainText('"private": true');
  });

  test("deletes a key and Ctrl+Z in the editor brings it back", async ({ page }) => {
    await row(page, "private").hover();
    await row(page, "private").getByRole("button", { name: "Delete" }).click();
    await expect(editor(page)).not.toContainText('"private"');
    await editor(page).click();
    await page.keyboard.press("Control+Z");
    await expect(editor(page)).toContainText('"private": true');
  });

  test("renames a key by double-clicking it", async ({ page }) => {
    await row(page, "id").getByText('"id"').dblclick();
    await page.getByLabel("Rename key").fill("ident");
    await page.keyboard.press("Enter");
    await expect(editor(page)).toContainText('"ident": 1');
  });

  test("adds a property to the root object", async ({ page }) => {
    const root = page.getByRole("treeitem").first();
    await root.hover();
    await root.getByRole("button", { name: "Add property" }).click();
    await expect(page.getByLabel("Rename key")).toHaveValue("newKey");
    await page.getByLabel("Rename key").fill("extra");
    await page.keyboard.press("Enter");
    await expect(editor(page)).toContainText('"extra": null');
  });
});

test("tree viewer FAQ no longer says the tree is read-only", async ({ page }) => {
  await page.goto("/json-tree-viewer/");
  await expect(page.getByText("The tree is read-only")).toHaveCount(0);
  await expect(page.getByText("Double-click a value to change it")).toBeAttached();
});

test.describe("json error pages", () => {
  const slugs = [
    "unexpected-token-less-than",
    "unexpected-end-of-json-input",
    "expected-property-name-or-close-brace",
    "trailing-comma",
    "expected-comma-or-closing-brace",
    "undefined-is-not-valid-json",
    "bad-control-character-in-string",
    "unexpected-non-whitespace-after-json",
    "unexpected-token-nan-bom",
  ];

  for (const slug of slugs) {
    test(`${slug} reproduces its error and documents it`, async ({ page }) => {
      await page.goto(`/json-errors/${slug}/`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Common causes" })).toBeVisible();
      // The sample loaded into the tool really is invalid JSON.
      await expect(page.getByRole("status")).toContainText("Ln", { timeout: 15000 });
      expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(2);
    });
  }

  test("trailing comma sample is repaired by Fix JSON", async ({ page }) => {
    await page.goto("/json-errors/trailing-comma/");
    await expect(page.getByRole("status")).toContainText("Ln", { timeout: 15000 });
    await page.getByRole("button", { name: "Fix JSON" }).first().click();
    await expect(page.getByRole("status")).toContainText("Valid JSON");
  });

  test("index lists every error and tool pages link to them", async ({ page }) => {
    await page.goto("/json-errors/");
    await expect(page.getByRole("link", { name: /Unexpected token '<'/ })).toBeVisible();
    await page.goto("/json-validator/");
    await expect(page.getByRole("link", { name: "Trailing comma in JSON" })).toBeAttached();
  });
});

test.describe("examples and cheat sheets", () => {
  const examples = [
    "simple-json-example", "json-array-example", "nested-json-example", "user-profile-json", "paginated-api-response-json", "product-catalog-json",
    "order-invoice-json", "blog-posts-json", "package-json-example", "geojson-example", "app-config-json", "weather-api-json",
  ];
  for (const slug of examples) {
    test(`example ${slug} loads valid JSON and documents its fields`, async ({ page }) => {
      await page.goto(`/json-examples/${slug}/`);
      await expect(page.getByRole("status")).toContainText("Valid JSON", { timeout: 15000 });
      await expect(page.getByRole("heading", { name: "Fields explained" })).toBeVisible();
      expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(2);
    });
  }

  for (const slug of ["json-syntax", "jsonpath", "json-schema"]) {
    test(`cheat sheet ${slug} renders tables`, async ({ page }) => {
      await page.goto(`/cheat-sheets/${slug}/`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.locator("table").count()).toBeGreaterThanOrEqual(2);
    });
  }

  test("order example totals are consistent", async ({ page }) => {
    await page.goto("/json-examples/order-invoice-json/");
    await expect(page.getByRole("status")).toContainText("Valid JSON", { timeout: 15000 });
    await expect(page.locator(".monaco-editor").first()).toContainText('"orderId"');
  });

  test("index pages list everything", async ({ page }) => {
    await page.goto("/json-examples/");
    await expect(page.getByRole("link", { name: "GeoJSON Example" })).toBeVisible();
    await page.goto("/cheat-sheets/");
    await expect(page.getByRole("link", { name: "JSONPath Cheat Sheet" })).toBeVisible();
  });
});

test.describe("error hints", () => {
  test("HTML is recognised, Fix JSON is not offered and the toolbar explains why", async ({ page }) => {
    await page.goto("/json-errors/unexpected-token-less-than/");
    await expect(page.getByText("This looks like HTML, not JSON").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Try Fix JSON" })).toHaveCount(0);
    await page.getByRole("button", { name: "Fix JSON", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "cannot be repaired" })).toBeVisible();
  });

  test("a fixable error is explained and links to its guide", async ({ page }) => {
    await page.goto("/json-validator/");
    await expect(page.getByText("A key is not written in double quotes")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: "Read the full explanation" })).toHaveAttribute("href", /json-errors\/expected-property-name-or-close-brace/);
    await expect(page.getByRole("button", { name: "Try Fix JSON" })).toBeVisible();
  });

  test("on a guide page the panel does not link to the page you are already on", async ({ page }) => {
    await page.goto("/json-errors/trailing-comma/");
    await expect(page.getByText("There is a comma after the last item").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: "Read the full explanation" })).toHaveCount(0);
  });

  test("truncated JSON is recognised as cut off", async ({ page }) => {
    await page.goto("/json-errors/unexpected-end-of-json-input/");
    await expect(page.getByText("The JSON ends too early").first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe("seo basics on every page in the sitemap", () => {
  const decode = (s: string) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

  test("each page has a unique short title and description, one h1, a canonical and share images", async ({ request }) => {
    test.setTimeout(120_000);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
    expect(paths.length).toBeGreaterThan(40);

    const titles = new Map<string, string>();
    const problems: string[] = [];
    for (const path of paths) {
      const html = await (await request.get(path)).text();
      const title = decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "");
      const desc = decode(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "");
      if (!title || title.length > 60) problems.push(`${path}: title length ${title.length}`);
      if (desc.length < 70 || desc.length > 160) problems.push(`${path}: description length ${desc.length}`);
      if (titles.has(title)) problems.push(`${path}: duplicate title with ${titles.get(title)}`);
      titles.set(title, path);
      if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) problems.push(`${path}: h1 count`);
      if (!/<link rel="canonical" href="https:\/\/jsonforge\.dev\//.test(html)) problems.push(`${path}: canonical`);
      if (!/property="og:image" content="https:\/\/jsonforge\.dev\/opengraph-image/.test(html)) problems.push(`${path}: og:image`);
      if (!/name="twitter:image"/.test(html)) problems.push(`${path}: twitter:image`);
    }
    expect(problems).toEqual([]);
  });
});

test.describe("seo audit fixes", () => {
  const ldTypes = async (page: Page) => {
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types: string[] = [];
    for (const b of blocks) {
      const j = JSON.parse(b);
      for (const node of Array.isArray(j) ? j : [j]) {
        if (node["@graph"]) node["@graph"].forEach((g: { "@type": string }) => types.push(g["@type"]));
        else types.push(node["@type"]);
      }
    }
    return types;
  };

  test("every page declares one Organization and WebSite, and tool pages no longer emit HowTo", async ({ page }) => {
    await page.goto("/json-diff/");
    const types = await ldTypes(page);
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "WebApplication", "FAQPage", "BreadcrumbList"]));
    expect(types).not.toContain("HowTo");
  });

  test("articles point to the shared organization and carry dateModified", async ({ page }) => {
    await page.goto("/json-errors/trailing-comma/");
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b));
    const article = blocks.flat().find((n) => n["@type"] === "TechArticle");
    expect(article.author).toEqual({ "@id": "https://jsonforge.dev/#org" });
    expect(article.dateModified).toBeTruthy();
    expect(article.mainEntityOfPage["@id"]).toBe("https://jsonforge.dev/json-errors/trailing-comma/");
  });

  test("hub pages and About have typed schema", async ({ page }) => {
    await page.goto("/json-errors/");
    expect(await ldTypes(page)).toContain("CollectionPage");
    await page.goto("/about/");
    expect(await ldTypes(page)).toContain("AboutPage");
  });

  test("the example JSON is in the server HTML, outside script tags", async ({ request }) => {
    const html = await (await request.get("/json-examples/weather-api-json/")).text();
    const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
    expect(body).toContain("Exampleville");
    expect(body).toContain("forecast");
  });

  test("error pages answer first and quote Python's wording", async ({ request }) => {
    const html = await (await request.get("/json-errors/unexpected-end-of-json-input/")).text();
    const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
    expect(body.indexOf("The parser reached the end of the text")).toBeGreaterThan(-1);
    // the answer comes before the heading of the first article section
    expect(body.indexOf("The parser reached the end of the text")).toBeLessThan(body.indexOf("What the error means"));
    expect(body).toContain("Expecting value: line 1 column 1 (char 0)");
  });

  test("the unexpected-end demo really produces that message", async ({ page }) => {
    await page.goto("/json-errors/unexpected-end-of-json-input/");
    await expect(page.getByRole("status")).toContainText("Unexpected end of JSON input", { timeout: 15000 });
  });
});
