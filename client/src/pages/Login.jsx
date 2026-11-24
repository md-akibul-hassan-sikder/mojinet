import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const REMEMBER_KEY = 'remembered_email';

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

const BENEFITS = [
  { icon: '🔒', text: 'Instant access to your purchases and delivery URLs' },
  { icon: '💬', text: 'Live chat support with the Mojinet team' },
  { icon: '📊', text: 'Full dashboard with purchase history & expiry' },
  { icon: '📱', text: 'Works across all 6 platforms · unlimited devices' },
];

const TRUST_STATS = [
  { value: '50K+',  label: 'Customers' },
  { value: '4.9/5', label: 'Rating' },
  { value: '200K+', label: 'Orders' },
];

const TESTIMONIAL = {
  quote:
    'Mojinet is the only marketplace I trust for digital access. Verified within minutes, and the support team actually replies.',
  name: 'Jason L.',
  role: 'Verified customer since 2022',
  initials: 'JL',
  gradient: 'linear-gradient(135deg,#6366f1,#a855f7)',
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Flash message shown after a successful password reset (passed via route state)
  const flash = location.state?.passwordReset
    ? 'Your password has been reset. Please sign in with your new password.'
    : '';

  // Pre-fill email from "Remember me"
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setForm((prev) => ({ ...prev, email: saved }));
      setRemember(true);
    }
  }, []);

  const redirectTo =
    location.state?.from ||
    (location.state?.role === 'admin' ? '/admin' : null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await login(form.email, form.password, remember);

      if (remember) {
        localStorage.setItem(REMEMBER_KEY, form.email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      const target =
        redirectTo || (data.role === 'admin' ? '/admin' : '/dashboard');
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            Trusted by 50,000+ customers since 2019
          </span>

          <h1 className="auth__headline">
            Welcome back.<br />
            <span className="auth__headline-accent">Pick up where you left off.</span>
          </h1>

          <p className="auth__sub">
            Sign in to access your purchases, dashboard, downloads, and live
            support — all in one place.
          </p>

          <ul className="auth__benefits">
            {BENEFITS.map((b) => (
              <li key={b.text}>
                <span className="auth__benefit-icon">{b.icon}</span>
                <span>{b.text}</span>
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
          RIGHT — login form
         ═══════════════════════════════════════════════════ */}
      <main className="auth__panel">
        <div className="auth__form-wrap">
          <h2 className="auth__title">Sign in</h2>
          <p className="auth__desc">Enter your email and password to continue.</p>

          {flash && (
            <div className="alert alert--success" style={{ marginTop: 20 }}>
              {flash}
            </div>
          )}
          {error && (
            <div className="alert alert--error" style={{ marginTop: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="auth__form" noValidate>
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

            <label className="field">
              <span className="field__label">Password</span>
              <div className="password-field">
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            </label>

            <div className="auth__row-between">
              <label className="auth__check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth__link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block btn--lg"
              disabled={busy}
              style={{ marginTop: 20 }}
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth__switch">
            Don’t have an account? <Link to="/register">Create one</Link>
          </p>

          <div className="auth__trust">
            <span className="auth__trust-badge">
              <span className="auth__trust-dot" /> Secure connection
            </span>
            <span className="auth__trust-badge">🔒 Your data is private</span>
            <span className="auth__trust-badge">⚡ Verified in hours</span>
          </div>
        </div>
      </main>
    </div>
  );
}