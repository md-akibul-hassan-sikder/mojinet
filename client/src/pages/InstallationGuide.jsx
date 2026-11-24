import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   Platform support — the centrepiece of the guide
   ───────────────────────────────────────────────────────────── */
const PLATFORMS = [
  {
    icon: '🍎',
    name: 'iOS / iPadOS',
    req: 'iOS 15+',
    color: '#007aff',
    note: 'App Store · TestFlight',
  },
  {
    icon: '🤖',
    name: 'Android',
    req: 'Android 8+',
    color: '#3ddc84',
    note: 'Direct · GitHub · APKPure',
  },
  {
    icon: '🪟',
    name: 'Windows',
    req: 'Windows 10+',
    color: '#0078d4',
    note: 'Installer · Portable',
  },
  {
    icon: '💻',
    name: 'macOS',
    req: 'macOS 12+',
    color: '#6e6e73',
    note: 'Universal · Apple Silicon',
  },
  {
    icon: '🐧',
    name: 'Linux',
    req: 'deb / RPM',
    color: '#f9a825',
    note: 'Debian · Fedora',
  },
  {
    icon: '📺',
    name: 'Android TV',
    req: 'TV 8+',
    color: '#0d7d5c',
    note: 'armeabi-v7a',
  },
];

const FEATURES = [
  { icon: '⚡', title: 'One-click takeoff',       text: 'Simple to use, quick to learn — up and running in minutes.' },
  { icon: '🌐', title: 'Multi-core support',      text: 'Clash, Clash.Meta, sing-box, V2Ray, Stash, Shadowsocks.' },
  { icon: '🔐', title: 'Mainstream protocols',    text: 'VMess, VLess, Trojan, Hysteria2, Wireguard, AnyTLS, and more.' },
  { icon: '🎯', title: 'Smart routing',           text: 'Auto-selects the fastest node across multiple subscription sources.' },
  { icon: '🚀', title: 'Optimised core',          text: 'Modified sing-box build for superior performance on every device.' },
  { icon: '🔄', title: 'Multi-device sync',       text: 'Configure once, sync everything across all your devices.' },
];

const DOWNLOADS = [
  {
    icon: '🍎', name: 'iOS / iPadOS', req: 'iOS ≥ 15',
    links: [
      { label: 'App Store',  href: 'https://karing.app' },
      { label: 'TestFlight', href: 'https://karing.app' },
    ],
    note: 'Use an App Store account from outside mainland China if your account can’t download it.',
  },
  {
    icon: '🤖', name: 'Android', req: 'Android ≥ 8',
    links: [
      { label: 'Direct',   href: 'https://karing.app' },
      { label: 'GitHub',   href: 'https://karing.app' },
      { label: 'APKPure',  href: 'https://karing.app' },
    ],
    note: 'Xiaomi/MIUI: if install fails, turn on Airplane Mode, disable Security Guard, then install.',
  },
  {
    icon: '🪟', name: 'Windows', req: 'Windows ≥ 10',
    links: [
      { label: 'Installer', href: 'https://karing.app' },
      { label: 'Portable',  href: 'https://karing.app' },
    ],
    note: 'If Windows Defender blocks the installer, click “Show details” → “Run anyway”.',
  },
  {
    icon: '💻', name: 'macOS', req: 'macOS ≥ 12',
    links: [
      { label: 'Stable', href: 'https://karing.app' },
      { label: 'Beta',   href: 'https://karing.app' },
    ],
    note: 'Universal binary — works on both Apple Silicon and Intel Macs.',
  },
  {
    icon: '🐧', name: 'Linux', req: 'deb / RPM',
    links: [
      { label: '.deb (Debian/Ubuntu)', href: 'https://karing.app' },
      { label: '.rpm (Fedora/RHEL)',   href: 'https://karing.app' },
    ],
    note: 'Full desktop GUI — same feature set as Windows and macOS.',
  },
  {
    icon: '📺', name: 'Android TV', req: 'TV ≥ 8',
    links: [{ label: 'armeabi-v7a', href: 'https://karing.app' }],
    note: 'Sideload via USB or ADB. Works with most Android TV boxes and Google TV.',
  },
];

const STEPS = [
  {
    title: 'Open settings',
    body: 'In the app, tap the settings icon in the upper-left corner → “Add configuration”.',
  },
  {
    title: 'Paste your configuration',
    body: 'Choose “Add config link” (or import / scan). Paste your Clash, sing-box, V2Ray or SS link into the box, then tap “Add” in the top-right corner.',
  },
  {
    title: 'Return home',
    body: 'A server has been selected for you by default. Tap the server name below to pick a different one.',
  },
  {
    title: 'Connect',
    body: 'Flip the switch button to start your connection. You’re online.',
  },
];

const SERVER_STEPS = [
  'Tap the server name at the bottom of the main screen to open “Select server”.',
  'Tap “Delay detection”.',
  'Wait a moment — latency (ms) appears next to every server. Lower is better.',
  'A triangle icon means an error; tap it to see details.',
  'Pick the lowest-latency server, or use the “Auto-select” option.',
];

const ADVANCED = [
  { icon: '🧭', title: 'Built-in traffic rules',  text: 'Preconfigured routing for common scenarios, ready out of the box.' },
  { icon: '⚙️', title: 'Custom rule groups',       text: 'Create your own routing groups and node sets if you need finer control.' },
  { icon: '📲', title: 'Per-app proxy (Android)',  text: 'Choose exactly which apps use the proxy — nothing else is affected.' },
  { icon: '☁️', title: 'Backup & sync',            text: 'Configure once and sync across all your devices via secure backup.' },
];

const REQUIREMENTS = [
  { platform: 'iOS / iPadOS', req: 'iOS ≥ 15' },
  { platform: 'macOS',        req: 'macOS ≥ 12' },
  { platform: 'tvOS',         req: 'tvOS ≥ 17' },
  { platform: 'Android',      req: 'Android ≥ 8' },
  { platform: 'Windows',      req: 'Windows ≥ 10' },
  { platform: 'Linux',        req: 'deb / RPM' },
];

export default function InstallationGuide() {
  return (
    <div className="container page">
      <Link to="/dashboard" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        ← Back to dashboard
      </Link>

      {/* ═══════════════════════════════════════════════════
          HERO
         ═══════════════════════════════════════════════════ */}
      <div className="guide-hero">
        <div className="guide-hero__badge">Exclusive for approved customers</div>
        <h1 className="guide-hero__title">Clash User Guide</h1>
        <p className="guide-hero__sub">
          The official beginner’s tutorial. One Clash app, one setup — running on every
          platform you own.
        </p>
        <div className="guide-hero__tags">
          <span className="badge badge--info">⚡ One-click</span>
          <span className="badge badge--info">🌍 6 platforms</span>
          <span className="badge badge--info">🆓 Free</span>
          <span className="badge badge--info">🛡️ Built-in rules</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SUPPORTED PLATFORMS — the headline section
         ═══════════════════════════════════════════════════ */}
      <section className="guide-section">
        <h2 className="guide-section__title">Supported on all platforms</h2>
        <p className="guide-section__desc">
          Clash has a native app for every major device. Download once, set up once —
          then use it everywhere.
        </p>

        <div className="clash-platforms" style={{ marginBottom: 0 }}>
          {PLATFORMS.map((p) => (
            <div key={p.name} className="clash-platform">
              <div
                className="clash-platform__icon"
                style={{ background: `${p.color}15`, color: p.color }}
              >
                {p.icon}
              </div>
              <div className="clash-platform__name">{p.name}</div>
              <div className="clash-platform__req">{p.req}</div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-subtle)',
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {p.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          KEY FEATURES
         ═══════════════════════════════════════════════════ */}
      <section className="guide-section">
        <h2 className="guide-section__title">Key features</h2>
        <div className="guide-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="card guide-feature">
              <div className="guide-feature__icon">{f.icon}</div>
              <h3 className="guide-feature__title">{f.title}</h3>
              <p className="guide-feature__text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SYSTEM REQUIREMENTS
         ═══════════════════════════════════════════════════ */}
      <section className="guide-section">
        <h2 className="guide-section__title">System requirements</h2>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="guide-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Minimum version</th>
              </tr>
            </thead>
            <tbody>
              {REQUIREMENTS.map((r) => (
                <tr key={r.platform}>
                  <td>{r.platform}</td>
                  <td>{r.req}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          DOWNLOADS — one card per platform
         ═══════════════════════════════════════════════════ */}
      <section className="guide-section">
        <h2 className="guide-section__title">Download</h2>
        <p className="guide-section__desc">
          Clash is free on all platforms. Official downloads are available at{' '}
          <a href="https://karing.app" target="_blank" rel="noreferrer">karing.app</a>.
        </p>
        <div className="guide-downloads">
          {DOWNLOADS.map((d) => (
            <div key={d.name} className="card guide-download">
              <div className="guide-download__head">
                <span className="guide-download__icon">{d.icon}</span>
                <div>
                  <h3 className="guide-download__name">{d.name}</h3>
                  <p className="guide-download__req">{d.req}</p>
                </div>
              </div>
              <div className="guide-download__links">
                {d.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--secondary btn--sm"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
              {d.note && <p className="guide-download__note">{d.note}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          QUICK START
         ═══════════════════════════════════════════════════ */}
      <section className="guide-section">
        <h2 className="guide-section__title">Quick start</h2>
        <p className="guide-section__desc">
          The same four steps on every platform — iOS, Android, Windows, macOS, Linux
          and Android TV.
        </p>
        <ol className="guide-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="guide-step">
              <span className="guide-step__num">{i + 1}</span>
              <div>
                <h4 className="guide-step__title">{s.title}</h4>
                <p className="guide-step__body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══════════════════════════════════════════════════
          FASTER SERVER
         ═══════════════════════════════════════════════════ */}
      <section className="guide-section">
        <h2 className="guide-section__title">How to pick a faster server</h2>
        <ol className="guide-steps guide-steps--compact">
          {SERVER_STEPS.map((s, i) => (
            <li key={i} className="guide-step">
              <span className="guide-step__num">{i + 1}</span>
              <p className="guide-step__body" style={{ marginTop: 4 }}>{s}</p>
            </li>
          ))}
        </ol>
        <div className="notice notice--pending" style={{ marginTop: 16 }}>
          <span>💡</span>
          <span>
            Tip: the lower the latency number, the better. A triangle icon next to a
            server means it’s unreachable — tap it to see why.
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ADVANCED
         ═══════════════════════════════════════════════════ */}
      <section className="guide-section">
        <h2 className="guide-section__title">Advanced features</h2>
        <div className="guide-grid">
          {ADVANCED.map((a) => (
            <div key={a.title} className="card guide-feature">
              <div className="guide-feature__icon">{a.icon}</div>
              <h3 className="guide-feature__title">{a.title}</h3>
              <p className="guide-feature__text">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER CTA
         ═══════════════════════════════════════════════════ */}
      <div className="guide-footer">
        <p>
          Still stuck? Open a chat from your dashboard and our support team will help
          you finish the setup.
        </p>
        <Link to="/dashboard" className="btn btn--primary btn--sm">Return to dashboard</Link>
      </div>
    </div>
  );
}