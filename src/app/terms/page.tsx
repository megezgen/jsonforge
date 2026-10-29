import type { Metadata } from "next";
import { ContactLine, InfoPage } from "@/components/info-page";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of use for ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/terms/` },
};

export default function Terms() {
  return (
    <InfoPage title="Terms of Use" updated="October 2026">
      <p>By using {SITE_NAME} you agree to these terms.</p>
      <h2>Use of the service</h2>
      <p>The tools are provided free of charge for lawful use. Do not attempt to disrupt, overload or reverse engineer the service in a way that harms others.</p>
      <h2>No warranty</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties of any kind. Conversions and generated code are produced automatically and may need
        review; verify results before relying on them in production.
      </p>
      <h2>Limitation of liability</h2>
      <p>To the maximum extent permitted by law, we are not liable for any loss or damage arising from the use of, or inability to use, the service.</p>
      <h2>Your content</h2>
      <p>You keep all rights to the data you process. Because processing happens in your browser, we do not receive or store it.</p>
      <ContactLine />
    </InfoPage>
  );
}
