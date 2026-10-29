import type { Metadata } from "next";
import { ContactLine, InfoPage } from "@/components/info-page";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles your data: JSON you enter is processed locally in your browser and never uploaded.`,
  alternates: { canonical: `${SITE_URL}/privacy/` },
};

export default function Privacy() {
  return (
    <InfoPage title="Privacy Policy" updated="October 2026">
      <h2>The JSON you enter</h2>
      <p>
        {SITE_NAME} is a client-side application. Any JSON, files or text you enter, paste, open or drop into the tools is processed only inside your
        browser. It is not transmitted to, stored on or logged by our servers.
      </p>
      <h2>Data stored in your browser</h2>
      <p>The site stores a single preference, your light or dark theme choice, in your browser&apos;s local storage. It never leaves your device.</p>
      <h2>Server logs</h2>
      <p>
        The site is delivered by a static hosting provider. Like any web host, it may keep standard technical request logs (for example IP address, requested
        URL and user agent) for security and operations. These logs do not contain the content you enter in the tools.
      </p>
      <h2>Advertising and cookies</h2>
      <p>
        We may show advertisements to keep the service free. If advertising is enabled, third-party vendors, including Google, may use cookies to serve ads
        based on your visits to this and other websites, and you can opt out of personalized advertising in Google&apos;s Ads Settings. Where required, we
        ask for your consent before using non-essential cookies. Advertisers never receive the JSON you enter.
      </p>
      <h2>Analytics</h2>
      <p>
        We use Cloudflare Web Analytics, a privacy-friendly service that does not use cookies and does not track individual visitors across sites. It
        measures page views and page performance (for example load times). It never receives the content you enter in the tools.
      </p>
      <h2>Changes</h2>
      <p>We may update this policy and will change the date above when we do.</p>
      <ContactLine />
    </InfoPage>
  );
}
