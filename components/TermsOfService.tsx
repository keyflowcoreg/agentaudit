// ---------------------------------------------------------------------------
// TermsOfService  (Server Component)
// ---------------------------------------------------------------------------

interface TermsOfServiceProps {
  companyName: string;
  productName: string;
  contactEmail: string;
  websiteUrl: string;
  lastUpdated: string;
  governingLaw?: string;
  jurisdiction?: string;
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

export function TermsOfService({
  companyName,
  productName,
  contactEmail,
  websiteUrl,
  lastUpdated,
  governingLaw = "the laws of Italy",
  jurisdiction = "the courts of Cagliari, Italy",
}: TermsOfServiceProps) {
  return (
    <article className="prose-invert mx-auto max-w-3xl space-y-12 px-4 py-16 text-zinc-300 sm:px-6 lg:px-0">
      {/* ------ Header ------ */}
      <header className="space-y-3 border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500">
          Last updated: {lastUpdated}
        </p>
        <p className="leading-relaxed">
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of <strong className="text-white">{productName}</strong> (the
          &quot;Service&quot;), operated by{" "}
          <strong className="text-white">{companyName}</strong> (&quot;we&quot;,
          &quot;us&quot;, &quot;our&quot;). By accessing or using the Service,
          you agree to be bound by these Terms. If you do not agree, do not use
          the Service.
        </p>
      </header>

      {/* ------ 1. Acceptance ------ */}
      <Section id="acceptance" title="1. Acceptance of Terms">
        <p>
          By creating an account, making a purchase, or otherwise using the
          Service, you confirm that you are at least 16 years of age and have
          the legal capacity to enter into a binding agreement. If you are using
          the Service on behalf of an organisation, you represent that you have
          authority to bind that organisation to these Terms.
        </p>
        <p>
          We reserve the right to modify these Terms at any time. Material
          changes will be communicated via email or a prominent notice on the
          website. Your continued use of the Service after such notice
          constitutes acceptance of the updated Terms.
        </p>
      </Section>

      {/* ------ 2. Account ------ */}
      <Section id="account" title="2. Account Registration">
        <p>
          You may be required to create an account to use certain features. You
          are responsible for maintaining the confidentiality of your account
          credentials and for all activities that occur under your account. You
          must notify us immediately of any unauthorised use.
        </p>
      </Section>

      {/* ------ 3. License ------ */}
      <Section id="license" title="3. License and Access">
        <p>
          Subject to these Terms, we grant you a limited, non-exclusive,
          non-transferable, revocable licence to access and use the Service for
          your personal or internal business purposes.
        </p>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Copy, modify, distribute, or create derivative works of the Service.
          </li>
          <li>
            Reverse engineer, decompile, or disassemble any part of the Service.
          </li>
          <li>
            Use the Service for any unlawful purpose or in violation of any
            applicable laws or regulations.
          </li>
          <li>
            Attempt to gain unauthorised access to the Service, other accounts,
            or related systems.
          </li>
          <li>
            Use automated means (bots, scrapers) to access the Service without
            our written permission.
          </li>
          <li>
            Resell, sublicense, or commercially exploit the Service without
            prior written consent.
          </li>
        </ul>
      </Section>

      {/* ------ 4. Payments & Refunds ------ */}
      <Section id="payments" title="4. Payments and Refunds">
        <p>
          The Service may include paid plans, subscriptions, or one-time
          purchases for digital products and services.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-white">Pricing.</strong> All prices are
            displayed in the applicable currency at checkout. We reserve the
            right to change pricing at any time; existing subscriptions will be
            honoured at the price in effect at the time of purchase until the
            current billing cycle ends.
          </li>
          <li>
            <strong className="text-white">Payment processing.</strong> Payments
            are handled by Stripe (credit/debit cards) and Coinbase Commerce
            (cryptocurrency). Your use of these payment processors is subject to
            their respective terms of service.
          </li>
          <li>
            <strong className="text-white">Digital products &mdash; no refunds.</strong>{" "}
            Due to the nature of digital products, all sales are final. No
            refunds will be issued once a digital product has been delivered or a
            subscription activated, except where required by applicable law.
          </li>
          <li>
            <strong className="text-white">Subscriptions.</strong> Subscriptions
            renew automatically. You may cancel at any time through your account
            settings; cancellation takes effect at the end of the current billing
            period.
          </li>
        </ul>
      </Section>

      {/* ------ 5. Intellectual Property ------ */}
      <Section id="ip" title="5. Intellectual Property">
        <p>
          All content, features, and functionality of the Service &mdash;
          including but not limited to text, graphics, logos, code, and software
          &mdash; are and remain the exclusive property of {companyName} or its
          licensors and are protected by copyright, trademark, and other
          intellectual property laws.
        </p>
        <p>
          You retain ownership of any content you submit to the Service
          (&quot;User Content&quot;). By submitting User Content, you grant us a
          worldwide, non-exclusive, royalty-free licence to use, reproduce, and
          display such content solely for the purpose of operating and improving
          the Service.
        </p>
      </Section>

      {/* ------ 6. Disclaimer & Limitations ------ */}
      <Section id="limitations" title="6. Disclaimer and Limitation of Liability">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
          AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
          INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
          FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, {companyName.toUpperCase()}{" "}
          SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
          USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE
          SERVICE.
        </p>
        <p>
          OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIMS RELATED TO THE SERVICE
          SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID US IN THE TWELVE (12) MONTHS
          PRECEDING THE CLAIM.
        </p>
      </Section>

      {/* ------ 7. Indemnification ------ */}
      <Section id="indemnification" title="7. Indemnification">
        <p>
          You agree to indemnify and hold harmless {companyName}, its officers,
          directors, employees, and agents from any claims, damages, losses, or
          expenses (including reasonable legal fees) arising from your use of the
          Service, your User Content, or your violation of these Terms.
        </p>
      </Section>

      {/* ------ 8. Termination ------ */}
      <Section id="termination" title="8. Termination">
        <p>
          We may suspend or terminate your access to the Service at any time,
          with or without cause, and with or without notice. Upon termination:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your licence to use the Service ceases immediately.</li>
          <li>
            You remain liable for any outstanding payments due prior to
            termination.
          </li>
          <li>
            We may delete your account data after a reasonable retention period
            (typically 30 days), unless we are required by law to retain it.
          </li>
        </ul>
        <p>
          You may terminate your account at any time by contacting us at{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="text-white underline underline-offset-4 hover:text-zinc-200"
          >
            {contactEmail}
          </a>{" "}
          or through your account settings.
        </p>
      </Section>

      {/* ------ 9. Governing Law ------ */}
      <Section id="governing-law" title="9. Governing Law and Jurisdiction">
        <p>
          These Terms shall be governed by and construed in accordance with{" "}
          {governingLaw}, without regard to conflict-of-law principles.
        </p>
        <p>
          Any disputes arising under or in connection with these Terms shall be
          subject to the exclusive jurisdiction of {jurisdiction}.
        </p>
      </Section>

      {/* ------ 10. Severability ------ */}
      <Section id="severability" title="10. Severability">
        <p>
          If any provision of these Terms is held to be invalid or
          unenforceable, the remaining provisions shall continue in full force
          and effect. The invalid or unenforceable provision will be modified to
          the minimum extent necessary to make it valid and enforceable.
        </p>
      </Section>

      {/* ------ 11. Entire Agreement ------ */}
      <Section id="entire-agreement" title="11. Entire Agreement">
        <p>
          These Terms, together with our{" "}
          <a
            href="/privacy"
            className="text-white underline underline-offset-4 hover:text-zinc-200"
          >
            Privacy Policy
          </a>
          , constitute the entire agreement between you and {companyName}{" "}
          regarding the Service and supersede all prior agreements and
          understandings.
        </p>
      </Section>

      {/* ------ 12. Contact ------ */}
      <Section id="contact" title="12. Contact Us">
        <p>
          If you have any questions about these Terms, please contact us:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-white">Email:</strong>{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-white underline underline-offset-4 hover:text-zinc-200"
            >
              {contactEmail}
            </a>
          </li>
          <li>
            <strong className="text-white">Website:</strong>{" "}
            <a
              href={websiteUrl}
              className="text-white underline underline-offset-4 hover:text-zinc-200"
            >
              {websiteUrl}
            </a>
          </li>
        </ul>
      </Section>
    </article>
  );
}
