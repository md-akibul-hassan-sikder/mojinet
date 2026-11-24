import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
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
            Forgot your password?<br />
            <span className="auth__headline-accent">No problem.</span>
          </h1>
          <p className="auth__sub">
            Enter the email you used to sign up. We’ll send you a secure, single‑use
            link to choose a new password — it expires in 15 minutes.
          </p>
        </div>
        <div className="auth__footnote">
          © {new Date().getFullYear()} Mojinet. All rights reserved.
        </div>
      </aside>

      <main className="auth__panel">
        <div className="auth__form-wrap">
          {sent ? (
            <>
              <div className="auth-success">
                <div className="auth-success__icon">📧</div>
                <h2 className="auth__title">Check your inbox</h2>
                <p className="auth__desc">
                  If <b>{email}</b> matches an account, a password reset link
                  is on its way. It expires in 15 minutes.
                </p>
                <p className="auth__desc" style={{ marginTop: 12 }}>
                  Didn’t receive it? Check your spam folder, or{' '}
                  <button
                    type="button"
                    className="auth__link"
                    onClick={() => { setSent(false); setEmail(''); }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    try another email
                  </button>
                  .
                </p>
              </div>

              <p className="auth__switch">
                <Link to="/login">← Back to sign in</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="auth__title">Reset your password</h2>
              <p className="auth__desc">
                Enter your account email and we’ll send you a reset link.
              </p>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </label>

                <button
                  type="submit"
                  className="btn btn--primary btn--block btn--lg"
                  disabled={busy}
                  style={{ marginTop: 20 }}
                >
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="auth__switch">
                Remembered it? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}