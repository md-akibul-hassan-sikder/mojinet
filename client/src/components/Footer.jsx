import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SUPPORT_EMAIL = 'mdakibul.swpu.stu@qq.com';

const QUICK_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/guide',    label: 'Installation guide' },
];

const SOCIAL = [
  { name: 'Telegram',  href: 'https://t.me/',        icon: '✈️' },
  { name: 'WhatsApp',  href: 'https://wa.me/',       icon: '💬' },
  { name: 'X',         href: 'https://x.com/',       icon: '𝕏' },
  { name: 'YouTube',   href: 'https://youtube.com/', icon: '▶️' },
];

export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const year = new Date().getFullYear();

  return (
    <footer className="footer-pro">
      <div className="container">
        <div className="footer-pro__grid">
          <div className="footer-pro__brand">
            <Link to="/" className="footer-pro__logo">
              <span className="navbar__logo">M</span>
              <span className="footer-pro__brand-name">Mojinet</span>
            </Link>
            <p className="footer-pro__tagline">
              Premium digital products delivered the moment you pay.
              Trusted by customers worldwide — manual verification on every order.
            </p>
            <div className="footer-pro__socials">
              {SOCIAL.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-pro__social"
                  aria-label={s.name}
                  title={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-pro__col">
            <h4 className="footer-pro__heading">Quick links</h4>
            <ul className="footer-pro__list">
              {QUICK_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-pro__link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-pro__col">
            <h4 className="footer-pro__heading">Your account</h4>
            <ul className="footer-pro__list">
              {user ? (
                <>
                  {!isAdmin && (
                    <li><Link to="/dashboard" className="footer-pro__link">Dashboard</Link></li>
                  )}
                  {isAdmin && (
                    <li><Link to="/admin" className="footer-pro__link">Admin console</Link></li>
                  )}
                  <li><Link to="/" className="footer-pro__link">Browse products</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="footer-pro__link">Sign in</Link></li>
                  <li><Link to="/register" className="footer-pro__link">Create account</Link></li>
                  <li><Link to="/products" className="footer-pro__link">Browse products</Link></li>
                </>
              )}
            </ul>
          </div>

          <div className="footer-pro__col">
            <h4 className="footer-pro__heading">Contact</h4>
            <ul className="footer-pro__list">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="footer-pro__link">
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="footer-pro__muted">Support replies within a few hours</li>
              <li className="footer-pro__muted">WeChat · Alipay accepted</li>
            </ul>
            {!user && (
              <Link to="/register" className="btn btn--primary btn--sm" style={{ marginTop: 12 }}>
                Get started
              </Link>
            )}
          </div>
        </div>

        <div className="footer-pro__divider" />

        <div className="footer-pro__bottom">
          <p className="footer-pro__copyright">
            © {year} <strong>Mojinet</strong>. All rights reserved.
          </p>
          <div className="footer-pro__payments">
            <span className="footer-pro__payment">
              <span className="pay-option__logo pay-option__logo--wechat" style={{ width: 20, height: 20, fontSize: 10 }}>W</span>
              WeChat Pay
            </span>
            <span className="footer-pro__payment">
              <span className="pay-option__logo pay-option__logo--alipay" style={{ width: 20, height: 20, fontSize: 10 }}>A</span>
              Alipay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}