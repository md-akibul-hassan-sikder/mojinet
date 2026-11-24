import { Link } from 'react-router-dom';

const UPDATED = 'January 1, 2026';
const CONTACT_EMAIL = 'mdakibul.swpu.stu@qq.com';

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview',
    body: (
      <>
        <p>
          This Privacy Policy explains what personal information Mojinet
          collects, why we collect it, how we use it, and the choices you
          have. It applies to this website and to every interaction you have
          with the Service — including orders, dashboard access and support
          chat.
        </p>
        <p>
          We collect the <b>minimum</b> amount of data needed to run the
          marketplace and to fulfil your orders. We do not sell your personal
          information.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: '2. Information We Collect',
    body: (
      <>
        <p><b>Information you give us:</b></p>
        <ul>
          <li>Name and email address when you register.</li>
          <li>Password — stored only as a bcrypt hash; we never see the plaintext.</li>
          <li>
            Order details: product, amount, payment method, and the payment proof
            you submit (a screenshot image, the last four digits of a transaction
            number, and/or a payment remark you typed in WeChat or Alipay).
          </li>
          <li>Chat messages you send to our team.</li>
        </ul>
        <p><b>Information collected automatically:</b></p>
        <ul>
          <li>Log information (IP address, browser type, page visited, timestamps) for security and troubleshooting.</li>
          <li>Basic session data stored by your browser so you stay logged in.</li>
        </ul>
        <p><b>Information we do not collect:</b></p>
        <ul>
          <li>Card numbers or bank details.</li>
          <li>Full payment transaction IDs (we only ever see the last four digits if you provide them).</li>
          <li>Location data beyond what your IP address reveals.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    body: (
      <>
        <ul>
          <li>To create and authenticate your account.</li>
          <li>To process and manually verify your orders.</li>
          <li>To deliver purchased content to your dashboard and to notify you about your order status.</li>
          <li>To answer your support questions and manage any disputes.</li>
          <li>To send service‑related emails (order confirmations, password resets, safety notices).</li>
          <li>To detect, prevent and investigate fraud, abuse and security incidents.</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p>
          We will <b>never</b> use your email address for third‑party marketing,
          and we will not send you promotional emails unless you have opted in.
        </p>
      </>
    ),
  },
  {
    id: 'legal-basis',
    title: '4. Legal Basis',
    body: (
      <>
        <p>We process your information on the following bases:</p>
        <ul>
          <li><b>Contract</b> — to fulfil orders and provide the Service you signed up for.</li>
          <li><b>Legitimate interests</b> — security, fraud prevention, and basic analytics that help us improve the Service.</li>
          <li><b>Consent</b> — when you tick the Terms checkbox at registration, and when you choose to opt into optional emails.</li>
          <li><b>Legal obligation</b> — where we are required to keep records under Chinese law.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'sharing',
    title: '5. Sharing Your Information',
    body: (
      <>
        <p>We share your information only in these limited cases:</p>
        <ul>
          <li>
            <b>Service providers</b> — an email provider (QQ Mail) to send
            confirmations and password‑reset links. These providers may only use
            the data to deliver our emails.
          </li>
          <li>
            <b>Payment verification</b> — when you provide the last four digits
            of a transaction number or a payment remark, we use it only to
            match your payment inside our payment records. We do not forward
            this information to anyone else.
          </li>
          <li>
            <b>Legal requirements</b> — if required by a valid court order,
            subpoena, or equivalent legal process.
          </li>
          <li>
            <b>Business transfer</b> — if Mojinet is acquired or merged with
            another business, your information may transfer as part of that
            transaction under the same protections.
          </li>
        </ul>
        <p><b>We do not sell your personal information.</b></p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '6. Cookies and Local Storage',
    body: (
      <>
        <p>
          We use your browser's <b>local storage</b> — not tracking cookies —
          for two things only:
        </p>
        <ul>
          <li>Storing your login token so you stay signed in between visits.</li>
          <li>
            Storing your email address if you ticked <b>Remember me</b> on the login
            page (you can clear it at any time by signing in without ticking the
            box, or by clearing your browser's local storage).
          </li>
        </ul>
        <p>
          We do not use third‑party advertising cookies, remarketing pixels,
          or analytics services that fingerprint you across sites.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: '7. Security',
    body: (
      <>
        <p>We take the security of your information seriously:</p>
        <ul>
          <li>Passwords are hashed with bcrypt and cannot be reversed.</li>
          <li>Password‑reset tokens are stored only as SHA‑256 hashes and expire after 15 minutes.</li>
          <li>The site is served over HTTPS; payment screenshots are stored on our own server, not on public CDNs.</li>
          <li>Access to production systems is restricted to authorised staff only.</li>
        </ul>
        <p>
          No system is perfectly secure. If you suspect your account has been
          compromised, contact us immediately at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: '8. Data Retention',
    body: (
      <>
        <ul>
          <li>
            <b>Account information</b> — retained for as long as your account
            exists, plus a short period afterwards to satisfy legal and
            accounting obligations.
          </li>
          <li>
            <b>Order and payment information</b> — retained for at least the
            periods required by applicable Chinese tax and accounting laws.
          </li>
          <li>
            <b>Chat messages</b> — retained for up to 12 months so we can
            resolve disputes, then deleted.
          </li>
          <li>
            <b>Password reset tokens</b> — deleted automatically after 15 minutes
            or as soon as they are used.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'rights',
    title: '9. Your Rights',
    body: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li><b>Access</b> the personal information we hold about you.</li>
          <li><b>Correct</b> inaccurate information (from your dashboard, or by emailing us).</li>
          <li><b>Delete</b> your account and the personal information associated with it, subject to legal retention requirements.</li>
          <li><b>Export</b> a copy of your order history on request.</li>
          <li><b>Object</b> to our use of your data for security analytics.</li>
          <li><b>Withdraw consent</b> at any time for anything based on consent, without affecting past lawful processing.</li>
        </ul>
        <p>
          To exercise any of these, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to
          respond within 7 days.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: '10. Children',
    body: (
      <>
        <p>
          The Service is not directed at anyone under 18. We do not knowingly
          collect personal information from children. If you believe a child
          has registered, please email us so we can delete the account.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    body: (
      <>
        <p>
          We may update this Privacy Policy from time to time. When we do, we
          will update the "Last updated" date at the top and, for material
          changes, notify you by email or by a prominent notice on the Service.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: '12. Contact',
    body: (
      <>
        <p>
          If you have any questions about this Privacy Policy or how your data is
          handled, email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We read every
          message.
        </p>
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="container page">
      <div className="legal-head">
        <Link to="/" className="legal-head__back">← Back to home</Link>
        <h1 className="legal-head__title">Privacy Policy</h1>
        <p className="legal-head__updated">Last updated: {UPDATED}</p>
        <p className="legal-head__lead">
          We collect the minimum amount of information needed to run Mojinet.
          This page explains what we collect, why we collect it, and the
          choices you have.
        </p>
      </div>

      <div className="legal-layout">
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

        <article className="legal-content">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="legal-section">
              <h2 className="legal-section__title">{s.title}</h2>
              <div className="legal-section__body">{s.body}</div>
            </section>
          ))}

          <div className="legal-footer">
            <p>
              Questions about your data? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> — or read
              our <Link to="/terms">Terms of Service</Link>.
            </p>
            <Link to="/" className="btn btn--primary btn--sm">
              Back to home
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}