import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: { channel: "chrome", baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  webServer: {
    // Serves the static export, exactly what gets deployed. Run `npm run build` first.
    command: "npx serve out -l 3100 --no-clipboard",
    url: "http://localhost:3100",
    reuseExistingServer: true,
  },
});
