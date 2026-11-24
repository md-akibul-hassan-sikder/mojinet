import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── inline eye icons ─────────────────────────────────────── */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── left panel content ───────────────────────────────────── */
const BENEFITS = [
  { icon: '🎯', title: 'Instant access',   text: 'Get your delivery details on your dashboard once payment is verified — usually within hours.' },
  { icon: '🔒', title: 'Secure by default', text: 'Your password is bcrypt‑hashed. We never see or store it in plain text.' },
  { icon: '💬', title: 'Real human support', text: 'Chat with the Mojinet team any time from your dashboard — no bots, no queues.' },
  { icon: '📱', title: 'All your devices',   text: 'One account works on iPhone, iPad, Mac, Windows, Android and Apple TV.' },
];

const TRUST_STATS = [
  { value: '50K+',  label: 'Customers' },
  { value: '4.9/5', label: 'Rating' },
  { value: '200K+', label: 'Orders' },
];

const TESTIMONIAL = {
  quote:
    'Signed up, paid with WeChat, and had my access within the hour. The dashboard keeps everything tidy — no more hunting through emails.',
  name: 'Mei W.',
  role: 'Verified customer since 2023',
  initials: 'MW',
  gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)',
};

/* ── password strength helper ─────────────────────────────── */
function evaluatePassword(pw) {
  const checks = {
    length:  pw.length >= 8,
    lower:   /[a-z]/.test(pw),
    upper:   /[A-Z]/.test(pw),
    digit:   /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const label =
    score <= 1 ? 'Very weak' :
    score === 2 ? 'Weak' :
    score === 3 ? 'Okay' :
    score === 4 ? 'Strong' :
                  'Very strong';
  const level =
    score <= 1 ? 'weak' :
    score === 2 ? 'weak' :
    score === 3 ? 'okay' :
    score === 4 ? 'strong' :
                  'very-strong';
  return { score, checks, label, level };
}

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(
    () => evaluatePassword(form.password),
    [form.password]
  );

  const matches =
    form.password.length > 0 &&
    form.confirm.length > 0 &&
    form.password === form.confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (!agree) {
      return setError('Please accept the Terms of Service to continue.');
    }

    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      {/* ═══════════════════════════════════════════════════
          LEFT — brand panel
         ═══════════════════════════════════════════════════ */}
      <aside className="auth__brand">
        <div className="auth__brand-inner">
          <div className="auth__logo-row">
            <span className="navbar__logo">M</span> Mojinet
          </div>

          <span className="auth__tag">
            <span className="auth__tag-dot" />
            Free to join · 50,000+ customers since 2019
          </span>

          <h1 className="auth__headline">
            Create your account.<br />
            <span className="auth__headline-accent">Start buying in minutes.</span>
          </h1>

          <p className="auth__sub">
            Join Mojinet and get instant access to premium digital products with
            verified delivery, real support, and unlimited devices.
          </p>

          <ul className="auth__benefits">
            {BENEFITS.map((b) => (
              <li key={b.title} className="auth__benefit">
                <span className="auth__benefit-icon">{b.icon}</span>
                <div>
                  <div className="auth__benefit-title">{b.title}</div>
                  <div className="auth__benefit-text">{b.text}</div>
                </div>
              </li>
            ))}
          </ul>

          <figure className="auth__testimonial">
            <blockquote className="auth__testimonial-quote">
              “{TESTIMONIAL.quote}”
            </blockquote>
            <figcaption className="auth__testimonial-meta">
              <span
                className="auth__testimonial-avatar"
                style={{ background: TESTIMONIAL.gradient }}
              >
                {TESTIMONIAL.initials}
              </span>
              <div>
                <div className="auth__testimonial-name">{TESTIMONIAL.name}</div>
                <div className="auth__testimonial-role">{TESTIMONIAL.role}</div>
              </div>
            </figcaption>
          </figure>

          <div className="auth__stats">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="auth__stat">
                <div className="auth__stat-value">{s.value}</div>
                <div className="auth__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth__footnote">
          © {new Date().getFullYear()} Mojinet. All rights reserved.
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          RIGHT — registration form
         ═══════════════════════════════════════════════════ */}
      <main className="auth__panel">
        <div className="auth__form-wrap auth__form-wrap--register">
          <h2 className="auth__title">Create account</h2>
          <p className="auth__desc">
            It’s free and takes less than a minute.
          </p>

          {error && (
            <div className="alert alert--error" style={{ marginTop: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="auth__form" noValidate>
            <label className="field">
              <span className="field__label">Full name</span>
              <input
                className="input"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Email address</span>
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>

            {/* password */}
            <label className="field">
              <span className="field__label">Password</span>
              <div className="password-field">
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* strength meter appears only while typing */}
              {form.password.length > 0 && (
                <div className="pw-meter">
                  <div className="pw-meter__bars" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={`pw-meter__bar ${
                          i <= strength.score ? `pw-meter__bar--${strength.level}` : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className={`pw-meter__label pw-meter__label--${strength.level}`}>
                    {strength.label}
                  </div>
                </div>
              )}
            </label>

            {/* confirm */}
            <label className="field">
              <span className="field__label">Confirm password</span>
              <div className="password-field">
                <input
                  className="input"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Type it again"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  title={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {form.confirm.length > 0 && (
                <span
                  className={`field__hint ${matches ? 'field__hint--ok' : 'field__hint--bad'}`}
                >
                  {matches ? '✓ Passwords match' : '✗ Passwords do not match'}
                </span>
              )}
            </label>

            <label className="auth__check auth__check--terms">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="auth__link">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="auth__link">Privacy Policy</Link>.
              </span>
            </label>

            <button
              type="submit"
              className="btn btn--primary btn--block btn--lg"
              disabled={busy}
              style={{ marginTop: 20 }}
            >
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth__switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <div className="auth__trust">
            <span className="auth__trust-badge">
              <span className="auth__trust-dot" /> Secure connection
            </span>
            <span className="auth__trust-badge">🔒 No spam, ever</span>
            <span className="auth__trust-badge">⚡ Set up in 60 s</span>
          </div>
        </div>
      </main>
    </div>
  );
}