import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initials = (name = '') =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  /* Close the drawer on route change */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* Lock body scroll while the drawer is open */
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="navbar">
        <div className="container navbar__inner">
          {/* Brand */}
          <Link
            to={isAdmin ? '/admin' : '/'}
            className="navbar__brand"
            title={isAdmin ? 'Mojinet — admin console' : 'Mojinet — home'}
          >
            <span className="navbar__logo">M</span>
            Mojinet
          </Link>

          {/* Desktop nav links */}
          <nav className="navbar__links">
            {!isAdmin && (
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                }
              >
                All Plans
              </NavLink>
            )}
            {user && !isAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                }
              >
                Dashboard
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `navbar__link navbar__link--admin ${isActive ? 'navbar__link--active' : ''}`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          <div className="navbar__spacer" />

          {/* ─── Logged‑in user block (desktop only) ─── */}
          {user && (
            <div className="navbar__user">
              <span className="navbar__avatar">{initials(user.name)}</span>
              <span>{user.name}</span>
              {isAdmin && <span className="badge badge--info">Admin</span>}
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}

          {/* ─── Guest actions (visible on ALL breakpoints) ─── */}
          {!user && (
            <div className="navbar__guest-actions">
              <Link to="/login" className="btn btn--ghost btn--sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Sign up
              </Link>
            </div>
          )}

          {/* ─── Hamburger — only for logged‑in users ─── */}
          {user && (
            <button
              type="button"
              className="navbar__hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          )}
        </div>
      </header>

      {/* ─── Mobile drawer — logged‑in users only ─── */}
      {user && menuOpen && (
        <div className="navbar-mobile" onClick={() => setMenuOpen(false)}>
          <div
            className="navbar-mobile__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="navbar-mobile__head">
              <Link
                to={isAdmin ? '/admin' : '/'}
                className="navbar__brand"
                onClick={() => setMenuOpen(false)}
              >
                <span className="navbar__logo">M</span>
                Mojinet
              </Link>
              <button
                type="button"
                className="navbar-mobile__close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <div className="navbar-mobile__user">
              <span className="navbar__avatar" style={{ width: 40, height: 40, fontSize: 15 }}>
                {initials(user.name)}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="navbar-mobile__user-name">{user.name}</div>
                <div className="navbar-mobile__user-email">{user.email}</div>
              </div>
              {isAdmin && <span className="badge badge--info">Admin</span>}
            </div>

            <nav className="navbar-mobile__nav">
              {!isAdmin && (
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `navbar-mobile__link ${isActive ? 'navbar-mobile__link--active' : ''}`
                  }
                >
                  <span className="navbar-mobile__icon">🛍</span>
                  Products
                </NavLink>
              )}
              {!isAdmin && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `navbar-mobile__link ${isActive ? 'navbar-mobile__link--active' : ''}`
                  }
                >
                  <span className="navbar-mobile__icon">🏠</span>
                  Dashboard
                </NavLink>
              )}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `navbar-mobile__link navbar-mobile__link--admin ${isActive ? 'navbar-mobile__link--active' : ''}`
                  }
                >
                  <span className="navbar-mobile__icon">⚙️</span>
                  Admin console
                </NavLink>
              )}
              {!isAdmin && (
                <NavLink
                  to="/guide"
                  className={({ isActive }) =>
                    `navbar-mobile__link ${isActive ? 'navbar-mobile__link--active' : ''}`
                  }
                >
                  <span className="navbar-mobile__icon">📱</span>
                  Installation guide
                </NavLink>
              )}
            </nav>

            <div className="navbar-mobile__footer">
              <button
                type="button"
                className="btn btn--secondary btn--block"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}