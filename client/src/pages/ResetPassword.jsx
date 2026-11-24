import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';

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

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // validate token on mount
  useEffect(() => {
    api.get(`/auth/verify-reset-token/${token}`)
      .then((r) => setEmail(r.data.email))
      .catch(() => setInvalid(true))
      .finally(() => setChecking(false));
  }, [token]);

  // after success, redirect to login with a flash
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      navigate('/login', { state: { passwordReset: true }, replace: true });
    }, 1800);
    return () => clearTimeout(t);
  }, [done, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setBusy(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth__brand">
        <div className="auth__brand-inner">
          <div className="auth__logo-row">
            <span className="navbar__logo">M</span> Mojinet
          </div>
          <h1 className="auth__headline">
            Choose a new password.<br />
            <span className="auth__headline-accent">Then you’re back in.</span>
          </h1>
          <p className="auth__sub">
            Make it at least 6 characters long. Pick something you don’t use
            anywhere else — we never store your password in plain text.
          </p>
        </div>
        <div className="auth__footnote">
          © {new Date().getFullYear()} Mojinet. All rights reserved.
        </div>
      </aside>

      <main className="auth__panel">
        <div className="auth__form-wrap">
          {checking ? (
            <div className="auth-success">
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p className="auth__desc" style={{ textAlign: 'center', marginTop: 16 }}>
                Verifying your reset link…
              </p>
            </div>
          ) : invalid ? (
            <>
              <div className="auth-success">
                <div className="auth-success__icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>⚠️</div>
                <h2 className="auth__title">Link expired or invalid</h2>
                <p className="auth__desc">
                  This reset link is no longer valid. Reset links expire after 15
                  minutes and can only be used once.
                </p>
              </div>
              <p className="auth__switch">
                <Link to="/forgot-password">Request a new reset link</Link>
                {' · '}
                <Link to="/login">Back to sign in</Link>
              </p>
            </>
          ) : done ? (
            <div className="auth-success">
              <div className="auth-success__icon">✓</div>
              <h2 className="auth__title">Password updated</h2>
              <p className="auth__desc">
                Redirecting you to sign in…
              </p>
              <Link
                to="/login"
                state={{ passwordReset: true }}
                replace
                className="btn btn--primary btn--block btn--lg"
                style={{ marginTop: 20 }}
              >
                Go to sign in →
              </Link>
            </div>
          ) : (
            <>
              <h2 className="auth__title">Set a new password</h2>
              <p className="auth__desc">
                Resetting password for <b>{email}</b>.
              </p>

              {error && (
                <div className="alert alert--error" style={{ marginTop: 20 }}>
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="auth__form" noValidate>
                <label className="field">
                  <span className="field__label">New password</span>
                  <div className="password-field">
                    <input
                      className="input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                      autoFocus
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

                <label className="field">
                  <span className="field__label">Confirm new password</span>
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Type it again"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="btn btn--primary btn--block btn--lg"
                  disabled={busy}
                  style={{ marginTop: 20 }}
                >
                  {busy ? 'Updating…' : 'Reset password'}
                </button>
              </form>

              <p className="auth__switch">
                <Link to="/login">Cancel and sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}