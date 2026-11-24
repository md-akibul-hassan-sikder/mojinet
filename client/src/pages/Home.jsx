import { Link } from 'react-router-dom';
import ProductCatalog from '../components/ProductCatalog';

/* ─────────────────────────────────────────────────────────────
   Content
   ───────────────────────────────────────────────────────────── */
const SUPPORTED_SERVICES = [
  { name: 'Google',     emoji: '🔍', color: '#4285F4' },
  { name: 'YouTube',    emoji: '▶️', color: '#FF0000' },
  { name: 'Gmail',      emoji: '📧', color: '#EA4335' },
  { name: 'ChatGPT',    emoji: '💬', color: '#10A37F' },
  { name: 'Telegram',   emoji: '✈️', color: '#0088CC' },
  { name: 'Instagram',  emoji: '📸', color: '#E1306C' },
  { name: 'Netflix',    emoji: '🎬', color: '#E50914' },
  { name: 'X (Twitter)',emoji: '🐦', color: '#000000' },
];

const FEATURES = [
  { icon: '🚀', title: 'First-class network',   text: 'Optimised high-speed routes for Google, YouTube, Gmail and every major service — no buffering, no slowdowns.' },
  { icon: '📱', title: 'Unlimited devices',     text: 'One account works on iPhone, iPad, Mac, Windows, Android and Apple TV. Connect as many devices as you own.' },
  { icon: '⚡', title: 'Easy access',            text: 'Buy, pay, get verified — your access details arrive on your dashboard within hours and you’re online in one tap.' },
  { icon: '🛡️', title: 'Trusted by customers',  text: 'Manual payment verification on every order. Transparent pricing, real support chat, no hidden fees.' },
];

const STATS = [
  { value: '99.9%',  label: 'Network uptime' },
  { value: '50+',    label: 'Countries reached' },
  { value: '∞',      label: 'Devices per account' },
  { value: '24/7',   label: 'Customer support' },
];

/* Speed section */
const SPEED_FACTS = [
  { icon: '⚡', value: '0.3 s',  label: 'Page load time' },
  { icon: '📶', value: '1 Gbps', label: 'Peak throughput' },
  { icon: '🎯', value: '18 ms',  label: 'Lowest ping' },
  { icon: '🌐', value: '50+',    label: 'Countries covered' },
];

const SPEED_NODES = [
  { flag: '🇭🇰', city: 'Hong Kong',   ping: 18, load: 32 },
  { flag: '🇸🇬', city: 'Singapore',   ping: 24, load: 41 },
  { flag: '🇯🇵', city: 'Tokyo',       ping: 32, load: 26 },
  { flag: '🇺🇸', city: 'Los Angeles', ping: 48, load: 58 },
  { flag: '🇩🇪', city: 'Frankfurt',   ping: 56, load: 22 },
  { flag: '🇬🇧', city: 'London',      ping: 62, load: 34 },
];

const SPEED_COMPARE = [
  { label: 'Standard line',   value: 42, color: '#cbd5e1' },
  { label: 'Other providers', value: 68, color: '#a78bfa' },
  { label: 'Mojinet',         value: 98, color: 'var(--primary)' },
];

/* Trusted since 2019 */
const MILESTONES = [
  { year: '2019', title: 'Founded',          text: 'Mojinet launched with our first curated digital products.' },
  { year: '2021', title: '10K customers',    text: 'Crossed 10,000 verified customers across Asia.' },
  { year: '2023', title: '100K orders',      text: 'Delivered our 100,000th order — zero disputes unresolved.' },
  { year: '2026', title: 'Going global',     text: 'Servers in 50+ countries, support in 6 languages.' },
];

const TRUST_STATS = [
  { value: '6+',     label: 'Years in business' },
  { value: '50K+',   label: 'Happy customers' },
  { value: '200K+',  label: 'Orders delivered' },
  { value: '4.9/5',  label: 'Customer rating' },
];

/* Clash on all platforms */
const CLASH_PLATFORMS = [
  { icon: '🍎', name: 'iOS / iPadOS', req: 'iOS 15+' },
  { icon: '🤖', name: 'Android',      req: 'Android 8+' },
  { icon: '🪟', name: 'Windows',      req: 'Windows 10+' },
  { icon: '💻', name: 'macOS',        req: 'macOS 12+' },
  { icon: '🐧', name: 'Linux',        req: 'deb / RPM' },
  { icon: '📺', name: 'Android TV',   req: 'TV 8+' },
];

const CLASH_FEATURES = [
  { icon: '🔄', title: 'One‑tap sync',        text: 'Configure once, sync to every device you own — no manual setup.' },
  { icon: '☁️', title: 'Cloud backup',        text: 'Your rules and subscriptions backed up safely across devices.' },
  { icon: '🎛️', title: 'Native performance',  text: 'Each platform uses its native client — smooth, low‑battery, fast.' },
];

const RING_CIRCUMFERENCE = 326.73;

export default function Home() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — PROFESSIONAL HERO
         ═══════════════════════════════════════════════════════════ */}
      <section className="hero-pro">
        <div className="container">
          <div className="hero-pro__grid">
            {/* ─── LEFT ─── */}
            <div className="hero-pro__left">
              <span className="hero-pro__badge">
                <span className="hero-pro__badge-dot" />
                Trusted by 50,000+ customers since 2019
              </span>

              <h1 className="hero-pro__title">
                Premium digital products,<br />
                <span className="hero-pro__title-accent">delivered instantly.</span>
              </h1>

              <p className="hero-pro__subtitle">
                Buy verified digital access with WeChat or Alipay. Fast delivery,
                unlimited devices, and human support you can actually reach.
              </p>

              <ul className="hero-pro__bullets">
                <li><span className="hero-pro__check">✓</span> Manual verification on every order</li>
                <li><span className="hero-pro__check">✓</span> Works on 6 platforms · unlimited devices</li>
                <li><span className="hero-pro__check">✓</span> Live chat support · avg. reply under 2 h</li>
              </ul>

              <div className="hero-pro__ctas">
                <Link to="/products" className="btn btn--primary btn--lg">
                  Choose your plan →
                </Link>
                <a href="#superfast" className="btn btn--secondary btn--lg">
                  Why so fast?
                </a>
              </div>

              <div className="hero-pro__trust">
                <div className="hero-pro__avatars">
                  <span className="hero-pro__avatar" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>J</span>
                  <span className="hero-pro__avatar" style={{ background: 'linear-gradient(135deg,#ec4899,#f43f5e)' }}>M</span>
                  <span className="hero-pro__avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>S</span>
                  <span className="hero-pro__avatar" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>L</span>
                  <span className="hero-pro__avatar hero-pro__avatar--more">+</span>
                </div>
                <div className="hero-pro__trust-text">
                  <div className="hero-pro__stars">★★★★★</div>
                  <div className="hero-pro__trust-label">
                    4.9/5 · based on 12,000+ verified orders
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: floating visual ─── */}
            <div className="hero-pro__right" aria-hidden="true">
              <div className="hero-pro__visual">
                {/* main card */}
                <div className="hero-card hero-card--main">
                  <span className="hero-card__badge">✓ Instant delivery</span>
                  <div className="hero-card__thumb">🚀</div>
                  <div className="hero-card__title">Premium Access Plan 600GB</div>
                  <div className="hero-card__row">
                    <span className="hero-card__price">¥46.90</span>
                    <span className="hero-card__orig">¥79.00</span>
                    <span className="hero-card__discount">-41%</span>
                  </div>
                  <div className="hero-card__foot">
                    <span className="hero-card__foot-item">⏱ 6 months</span>
                    <span className="hero-card__foot-item">📱 Unlimited devices</span>
                  </div>
                </div>

                {/* floating notification 1 */}
                <div className="hero-card hero-card--small hero-card--floating-1">
                  <span className="hero-card__small-icon">✓</span>
                  <div>
                    <div className="hero-card__small-title">Order verified</div>
                    <div className="hero-card__small-sub">Delivered in 2 minutes</div>
                  </div>
                </div>

                {/* floating notification 2 */}
                <div className="hero-card hero-card--small hero-card--floating-2">
                  <span className="hero-card__small-icon">⚡</span>
                  <div>
                    <div className="hero-card__small-title">0.3 s load time</div>
                    <div className="hero-card__small-sub">Across all apps</div>
                  </div>
                </div>

                {/* floating notification 3 */}
                <div className="hero-card hero-card--small hero-card--floating-3">
                  <span className="hero-card__small-icon">🌍</span>
                  <div>
                    <div className="hero-card__small-title">50+ countries</div>
                    <div className="hero-card__small-sub">Global coverage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — PRODUCT CATALOG
         ═══════════════════════════════════════════════════════════ */}
      <div className="container" style={{ paddingTop: 32 }}>
        <div className="section-head" style={{ marginTop: 0 }}>
          <div>
            <h2 className="section-head__title">Buy a product</h2>
            <p className="section-head__desc">
              Choose a plan, pay with WeChat or Alipay, and your access is released within hours.
            </p>
          </div>
          <Link to="/products" className="btn btn--secondary btn--sm">View all</Link>
        </div>

        <ProductCatalog limit={6} />

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/products" className="btn btn--primary">Browse the full catalog</Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — SUPER FAST CONNECTION
         ═══════════════════════════════════════════════════════════ */}
      <section className="speed-section" id="superfast">
        <div className="container">
          <div className="speed-section__head">
            <span className="speed-section__badge">⚡ Super fast connection</span>
            <h2 className="speed-section__title">Blazing speed for every app you love</h2>
            <p className="speed-section__sub">
              Our premium network routes traffic through the fastest nodes worldwide —
              Google, YouTube, Gmail and every other service load instantly, even at peak hours.
            </p>
          </div>

          <div className="speed-section__grid">
            <div className="speed-stats">
              {SPEED_FACTS.map((f) => (
                <div key={f.label} className="speed-stat">
                  <span className="speed-stat__icon">{f.icon}</span>
                  <span className="speed-stat__value">{f.value}</span>
                  <span className="speed-stat__label">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="speed-live">
              <div className="speed-live__head">
                <span className="speed-live__title">Live connection speed</span>
                <span className="speed-live__indicator">LIVE</span>
              </div>

              <div className="speed-gauge">
                <div className="speed-gauge__ring">
                  <svg viewBox="0 0 120 120" className="speed-gauge__svg" aria-hidden="true">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke="url(#speedGrad)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset="6.54"
                      transform="rotate(-90 60 60)"
                      className="speed-gauge__arc"
                    />
                    <defs>
                      <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="speed-gauge__center">
                    <span className="speed-gauge__num">98</span>
                    <span className="speed-gauge__unit">Mbps</span>
                  </div>
                </div>
              </div>

              <div className="speed-compare">
                {SPEED_COMPARE.map((row) => (
                  <div key={row.label} className="speed-compare__row">
                    <span className="speed-compare__label">{row.label}</span>
                    <div className="speed-compare__bar">
                      <span className="speed-compare__fill" style={{ width: `${row.value}%`, background: row.color }} />
                    </div>
                    <span className="speed-compare__num">{row.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="speed-nodes">
            <div className="speed-nodes__head">
              <h3 className="speed-nodes__title">Global server locations</h3>
              <span className="speed-nodes__meta">Real-time latency · 6 regions</span>
            </div>
            <div className="speed-nodes__grid">
              {SPEED_NODES.map((n) => (
                <div key={n.city} className="speed-node">
                  <span className="speed-node__flag">{n.flag}</span>
                  <div className="speed-node__info">
                    <div className="speed-node__row">
                      <span className="speed-node__city">{n.city}</span>
                      <span className="speed-node__ping">{n.ping} ms</span>
                    </div>
                    <div className="speed-node__load">
                      <span className="speed-node__load-fill" style={{ width: `${n.load}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="speed-highlights">
            <div className="speed-highlight">
              <span className="speed-highlight__icon">⚡</span>
              <div>
                <div className="speed-highlight__title">Instant routing</div>
                <div className="speed-highlight__desc">Smart protocol picks the fastest path in under 50 ms.</div>
              </div>
            </div>
            <div className="speed-highlight">
              <span className="speed-highlight__icon">🌍</span>
              <div>
                <div className="speed-highlight__title">Global backbone</div>
                <div className="speed-highlight__desc">Premium transit in 50+ countries with no throttling.</div>
              </div>
            </div>
            <div className="speed-highlight">
              <span className="speed-highlight__icon">🔒</span>
              <div>
                <div className="speed-highlight__title">Encrypted tunnel</div>
                <div className="speed-highlight__desc">TLS 1.3 end-to-end — speed without compromise.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — TRUST STRIP (apps)
         ═══════════════════════════════════════════════════════════ */}
      <section className="container" style={{ paddingTop: 64 }}>
        <div className="trust-strip">
          <p className="trust-strip__headline">Works flawlessly with the apps you use every day</p>
          <div className="trust-strip__services">
            {SUPPORTED_SERVICES.map((s) => (
              <div key={s.name} className="trust-service" title={s.name}>
                <span className="trust-service__emoji" style={{ color: s.color }}>{s.emoji}</span>
                <span className="trust-service__name">{s.name}</span>
              </div>
            ))}
          </div>
          <p className="trust-strip__footnote">
            Google · YouTube · Gmail · ChatGPT · Telegram · Instagram · Netflix · X — and every
            other major service, streaming site and app store.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — WHY CHOOSE MOJINET
         ═══════════════════════════════════════════════════════════ */}
      <section className="container" style={{ paddingTop: 48 }}>
        <div className="section-head" style={{ marginTop: 0 }}>
          <div>
            <h2 className="section-head__title">Why choose Mojinet</h2>
            <p className="section-head__desc">
              Built for speed, simplicity and trust — from your first purchase onwards.
            </p>
          </div>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="card feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6 — TRUSTED SINCE 2019
         ═══════════════════════════════════════════════════════════ */}
      <section className="trusted-section">
        <div className="container">
          <div className="trusted-section__head">
            <span className="trusted-section__badge">🛡 Trusted since 2019</span>
            <h2 className="trusted-section__title">Six years of serving customers worldwide</h2>
            <p className="trusted-section__sub">
              From a small operation to a global marketplace — our track record speaks for itself.
            </p>
          </div>

          <div className="trusted-timeline">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="trusted-milestone">
                <div className="trusted-milestone__year">{m.year}</div>
                <div className="trusted-milestone__line">
                  <span className="trusted-milestone__dot" />
                  {i < MILESTONES.length - 1 && <span className="trusted-milestone__bar" />}
                </div>
                <div className="trusted-milestone__card">
                  <div className="trusted-milestone__title">{m.title}</div>
                  <div className="trusted-milestone__text">{m.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="trusted-stats">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="trusted-stat">
                <div className="trusted-stat__value">{s.value}</div>
                <div className="trusted-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7 — CLASH ON ALL PLATFORMS
         ═══════════════════════════════════════════════════════════ */}
      <section className="clash-section">
        <div className="container">
          <div className="clash-section__head">
            <span className="clash-section__badge">📱 Clash on every platform</span>
            <h2 className="clash-section__title">One Clash app. Every device you own.</h2>
            <p className="clash-section__sub">
              Native clients for every major platform — set up once, sync everywhere.
              Install once and you’re online on all your screens in minutes.
            </p>
          </div>

          <div className="clash-platforms">
            {CLASH_PLATFORMS.map((p) => (
              <div key={p.name} className="clash-platform">
                <div className="clash-platform__icon">{p.icon}</div>
                <div className="clash-platform__name">{p.name}</div>
                <div className="clash-platform__req">{p.req}</div>
              </div>
            ))}
          </div>

          <div className="clash-features">
            {CLASH_FEATURES.map((f) => (
              <div key={f.title} className="clash-feature">
                <div className="clash-feature__icon">{f.icon}</div>
                <div className="clash-feature__title">{f.title}</div>
                <div className="clash-feature__desc">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8 — STATS BAND
         ═══════════════════════════════════════════════════════════ */}
      <section className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className="stats-band">
          {STATS.map((s) => (
            <div key={s.label} className="stats-band__item">
              <div className="stats-band__value">{s.value}</div>
              <div className="stats-band__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}