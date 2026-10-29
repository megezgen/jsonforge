import { defineConfig } from "@playwright/test";

// Set BASE_URL (for example https://jsonforge.dev) to run the suite against a deployed site,
// including its real security headers. Without it the suite serves the local ./out folder.
const remote = process.env.BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: { channel: "chrome", baseURL: remote ?? "http://localhost:3100", trace: "retain-on-failure" },
  webServer: remote
    ? undefined
    : {
        // Serves the static export, exactly what gets deployed. Run `npm run build` first.
        command: "npx serve out -l 3100 --no-clipboard",
        url: "http://localhost:3100",
        reuseExistingServer: true,
      },
});
