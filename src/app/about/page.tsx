import type { Metadata } from "next";
import { ContactLine, InfoPage } from "@/components/info-page";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_NAME} is a free, privacy-first JSON viewer, formatter, validator and converter that runs entirely in your browser.`,
  alternates: { canonical: `${SITE_URL}/about/` },
};

export default function About() {
  return (
    <InfoPage title={`About ${SITE_NAME}`}>
      <p>
        {SITE_NAME} is a free set of JSON tools for developers: a fast tree viewer, formatter, validator, diff and converters to TypeScript, Go, Python, YAML,
        CSV and XML.
      </p>
      <h2>Why it exists</h2>
      <p>
        Many online JSON tools upload what you paste to a server and slow down on large files. We built this one the other way around: everything runs
        locally in your browser, and big documents are handled in a background thread with a virtualized tree so the page stays responsive.
      </p>
      <h2>Privacy first</h2>
      <p>
        Your JSON is never sent to our servers. Parsing, formatting, diffing and code generation are done by JavaScript in your own tab. Read the{" "}
        <a href="/privacy/">Privacy Policy</a> for details.
      </p>
      <ContactLine />
    </InfoPage>
  );
}
