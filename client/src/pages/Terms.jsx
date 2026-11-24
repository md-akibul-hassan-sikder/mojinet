import { Link } from 'react-router-dom';

const UPDATED = 'January 1, 2026';
const CONTACT_EMAIL = 'mdakibul.swpu.stu@qq.com';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: (
      <>
        <p>
          These Terms of Service ("Terms") govern your access to and use of
          Mojinet ("we", "us", "our") — including this website, your customer
          dashboard, chat support, and the digital products offered for sale
          (collectively, the "Service").
        </p>
        <p>
          By creating an account, placing an order, or otherwise using the
          Service, you confirm that you have read, understood and agree to be
          bound by these Terms and by our{' '}
          <Link to="/privacy">Privacy Policy</Link>. If you do not agree,
          please do not use the Service.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    body: (
      <>
        <ul>
          <li>You must be at least <b>18 years old</b> to open an account and place orders.</li>
          <li>You must provide accurate, current and complete information when registering.</li>
          <li>You are responsible for keeping your account credentials secure and confidential.</li>
          <li>You must not be barred from using the Service under the laws of your jurisdiction.</li>
        </ul>
        <p>
          We may refuse, suspend or terminate any account that we reasonably
          believe is being used in violation of these Terms.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: '3. Accounts',
    body: (
      <>
        <p>
          You are solely responsible for all activity that occurs under your
          account. Passwords are stored using bcrypt hashing — we never see or
          store them in plain text and cannot recover a forgotten password for
          you; instead, you may use the password‑reset flow.
        </p>
        <p>
          Notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if
          you suspect unauthorised access to your account.
        </p>
      </>
    ),
  },
  {
    id: 'purchases',
    title: '4. Purchases and Payment',
    body: (
      <>
        <p>
          All prices are displayed in <b>Chinese Yuan (CNY)</b> and are inclusive
          of any applicable taxes unless stated otherwise.
        </p>
        <p>
          Payment is accepted via <b>WeChat Pay</b> or <b>Alipay</b>. After you
          place an order, you will be shown a QR code and asked to submit
          either a payment screenshot or the last four digits of your
          transaction number plus a payment remark. This is required because
          payments are verified manually by our team before delivery.
        </p>
        <p>
          Submitting falsified, edited or stolen payment proof is strictly
          prohibited and may result in immediate account termination and
          referral to the relevant authorities.
        </p>
      </>
    ),
  },
  {
    id: 'delivery',
    title: '5. Delivery',
    body: (
      <>
        <p>
          Once your payment is verified, your access details (a URL, access
          code, or written instructions) will be posted to your dashboard and
          remain visible there for the duration of your plan.
        </p>
        <p>
          Verification usually completes within a few hours but may take longer
          during peak periods. If we cannot verify a payment, we will reject
          the order and, where appropriate, provide a reason on your
          dashboard.
        </p>
        <p>
          Product durations are counted from the moment the order is approved,
          not from the moment of payment.
        </p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: '6. Refunds',
    body: (
      <>
        <p>
          Because the products we sell are digital and delivered instantly upon
          approval, <b>all sales are final</b> once delivery details have been
          posted to your dashboard — except in the following circumstances:
        </p>
        <ul>
          <li>You paid for an order that was later rejected by us and not re‑submitted.</li>
          <li>The delivered content is materially defective and we cannot fix or replace it within 7 days.</li>
          <li>A duplicate charge was made in error by you (proof required).</li>
        </ul>
        <p>
          To request a refund, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{' '}
          within <b>7 days</b> of the original purchase, including your order ID and any
          relevant evidence.
        </p>
      </>
    ),
  },
  {
    id: 'prohibited',
    title: '7. Prohibited Use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful or fraudulent purpose.</li>
          <li>Resell, sublicense, share or distribute purchased content without our written permission.</li>
          <li>Attempt to reverse‑engineer, scrape, or overload the Service.</li>
          <li>Upload malware or interfere with the security or availability of the Service.</li>
          <li>Use another person's account or impersonate any person or entity.</li>
        </ul>
        <p>
          We may suspend or terminate accounts that breach these rules without
          prior notice.
        </p>
      </>
    ),
  },
  {
    id: 'ip',
    title: '8. Intellectual Property',
    body: (
      <>
        <p>
          All content on the Service — including the Mojinet name, logo, layout
          and written copy — is owned by us or our licensors and protected by
          copyright and trademark law.
        </p>
        <p>
          Purchased access is for your personal use only, unless a product
          explicitly states otherwise. You may not reproduce, resell or
          publicly redistribute purchased content.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimer',
    title: '9. Disclaimer',
    body: (
      <>
        <p>
          The Service is provided on an <b>"as is"</b> and <b>"as available"</b> basis. We do
          not warrant that the Service will be uninterrupted, error‑free, or
          that any third‑party service (including the platforms or websites
          you access using your purchased access) will remain available,
          unchanged or perform as expected.
        </p>
        <p>
          You are responsible for complying with the terms of any third‑party
          service you access with purchased content.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: '10. Limitation of Liability',
    body: (
      <>
        <p>
          To the maximum extent permitted by law, our total liability to you for
          any claim arising out of or relating to the Service is limited to
          the amount you paid us for the specific order that gave rise to the
          claim.
        </p>
        <p>
          We are not liable for indirect, incidental, special or consequential
          damages, including loss of profits, data or goodwill.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    title: '11. Termination',
    body: (
      <>
        <p>
          You may close your account at any time by contacting us. We may
          suspend or terminate your access if you breach these Terms, if we
          are required to by law, or if continuing the Service would expose us
          or another customer to risk.
        </p>
        <p>
          Upon termination, your right to use the Service ends immediately.
          Sections of these Terms that by their nature should survive
          termination — including Refunds (for outstanding claims),
          Intellectual Property, Disclaimer and Limitation of Liability — will
          continue to apply.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '12. Changes to These Terms',
    body: (
      <>
        <p>
          We may update these Terms from time to time. If the changes are
          material, we will notify you via the email address linked to your
          account or by a prominent notice on the Service.
        </p>
        <p>
          Continued use of the Service after the effective date of updated
          Terms constitutes your acceptance of them.
        </p>
      </>
    ),
  },
  {
    id: 'law',
    title: '13. Governing Law',
    body: (
      <>
        <p>
          These Terms are governed by the laws of the People's Republic of
          China, without regard to its conflict‑of‑laws rules. Any dispute
          that cannot be resolved informally will be brought before the
          competent courts of that jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: '14. Contact',
    body: (
      <>
        <p>
          Questions about these Terms? Email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to
          reply within a few hours.
        </p>
      </>
    ),
  },
];

export default function Terms() {
  return (
    <div className="container page">
      <div className="legal-head">
        <Link to="/" className="legal-head__back">← Back to home</Link>
        <h1 className="legal-head__title">Terms of Service</h1>
        <p className="legal-head__updated">Last updated: {UPDATED}</p>
        <p className="legal-head__lead">
          These Terms explain the rules for buying and using digital products
          on Mojinet. Please read them carefully before placing an order.
        </p>
      </div>

      <div className="legal-layout">
        {/* sticky TOC */}
        <aside className="legal-toc">
          <p className="legal-toc__heading">On this page</p>
          <ul className="legal-toc__list">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="legal-toc__link">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* content */}
        <article className="legal-content">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="legal-section">
              <h2 className="legal-section__title">{s.title}</h2>
              <div className="legal-section__body">{s.body}</div>
            </section>
          ))}

          <div className="legal-footer">
            <p>
              By using Mojinet you confirm that you have read and agree to these
              Terms. See also our{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
            <Link to="/register" className="btn btn--primary btn--sm">
              Create an account
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}