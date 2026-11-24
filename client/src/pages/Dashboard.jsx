import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import CopyButton from '../components/CopyButton';
import CustomerMessagePanel from '../components/CustomerMessagePanel';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';

const STATUS = {
  pending:  { badge: 'badge--pending',  label: 'Pending verification' },
  approved: { badge: 'badge--approved', label: 'Approved' },
  rejected: { badge: 'badge--rejected', label: 'Rejected' },
};

const isApproved = (s) => s === 'approved';
const isUrl = (s) => /^https?:\/\/\S+$/i.test((s || '').trim());
const DAY_MS = 24 * 60 * 60 * 1000;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const initials = (name = '') =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');

  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const refreshUnread = () => {
      api.get('/messages/unread-count')
        .then((r) => setUnread(r.data.count))
        .catch(() => {});
    };
    refreshUnread();
    const t = setInterval(refreshUnread, 30000);
    return () => clearInterval(t);
  }, []);

  const approvedOrders = orders.filter((o) => isApproved(o.status));
  const totalSpent = approvedOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const hasApproved = approvedOrders.length > 0;

  const NAV = [
    { id: 'overview', label: 'Overview',  icon: '🏠' },
    { id: 'orders',   label: 'My Orders', icon: '📦', badge: orders.length || null },
    { id: 'messages', label: 'Messages',  icon: '💬', badge: unread > 0 ? unread : null },
  ];

  return (
    <div className="dash-shell">
      <div className="dash-container">

        <aside className="dash-sidebar">
          <div className="dash-profile">
            <div className="dash-profile__avatar">{initials(user?.name || 'U')}</div>
            <div className="dash-profile__info">
              <div className="dash-profile__name">{user?.name || 'Customer'}</div>
              <div className="dash-profile__email">{user?.email}</div>
            </div>
          </div>

          <nav className="dash-nav">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`dash-nav__item ${activeTab === item.id ? 'dash-nav__item--active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="dash-nav__icon">{item.icon}</span>
                <span className="dash-nav__label">{item.label}</span>
                {item.badge != null && (
                  <span className="dash-nav__badge">{item.badge}</span>
                )}
              </button>
            ))}

            {hasApproved && (
              <Link to="/guide" className="dash-nav__item">
                <span className="dash-nav__icon">📱</span>
                <span className="dash-nav__label">Installation Guide</span>
              </Link>
            )}
          </nav>

          <div className="dash-sidebar__footer">
            <Link to="/products" className="dash-sidebar__btn">
              <span>🛍</span> Browse products
            </Link>

          </div>
        </aside>

        <main className="dash-main">
          {activeTab === 'overview' && (
            <>
              <div className="dash-main__head">
                <div>
                  <h1 className="dash-main__title">
                    Welcome back, {user?.name?.split(' ')[0] || 'friend'} 👋
                  </h1>
                  <p className="dash-main__sub">
                    Here's an overview of your account activity.
                  </p>
                </div>
                <Link to="/products" className="btn btn--primary btn--sm">
                  + New purchase
                </Link>
              </div>

              <div className="stat-grid">
                <div className="stat">
                  <div className="stat__label">Total orders</div>
                  <div className="stat__value">{orders.length}</div>
                  <div className="stat__hint">All-time purchases</div>
                </div>
                <div className="stat">
                  <div className="stat__label">Approved</div>
                  <div className="stat__value" style={{ color: 'var(--success)' }}>
                    {approvedOrders.length}
                  </div>
                  <div className="stat__hint">Delivered</div>
                </div>
                <div className="stat">
                  <div className="stat__label">Pending</div>
                  <div className="stat__value" style={{ color: 'var(--warning)' }}>
                    {pendingCount}
                  </div>
                  <div className="stat__hint">Awaiting verification</div>
                </div>
                <div className="stat">
                  <div className="stat__label">Total spent</div>
                  <div className="stat__value">{formatPrice(totalSpent)}</div>
                  <div className="stat__hint">Approved orders only</div>
                </div>
              </div>

              <div className="dash-section">
                <div className="dash-section__head">
                  <h2 className="dash-section__title">Recent orders</h2>
                  {orders.length > 0 && (
                    <button
                      type="button"
                      className="dash-section__link"
                      onClick={() => setActiveTab('orders')}
                    >
                      View all →
                    </button>
                  )}
                </div>

                {loading ? (
                  <Loader label="Loading orders…" />
                ) : orders.length === 0 ? (
                  <div className="empty">
                    <div className="empty__icon">🛒</div>
                    <h3 className="empty__title">No orders yet</h3>
                    <p className="empty__text">Browse the catalog to make your first purchase.</p>
                    <Link to="/products" className="btn btn--primary" style={{ marginTop: 20 }}>
                      Explore products
                    </Link>
                  </div>
                ) : (
                  <div className="dash-recent">
                    {orders.slice(0, 3).map((o) => (
                      <MiniOrderCard key={o._id} order={o} />
                    ))}
                  </div>
                )}
              </div>

              <div className="dash-section">
                <div className="dash-section__head">
                  <h2 className="dash-section__title">Quick actions</h2>
                </div>
                <div className="dash-quick-grid">
                  <button
                    type="button"
                    className="dash-quick"
                    onClick={() => setChatOpen(true)}
                  >
                    <span className="dash-quick__icon">💬</span>
                    <div>
                      <div className="dash-quick__title">Message support</div>
                      <div className="dash-quick__desc">
                        {unread > 0
                          ? `${unread} new repl${unread === 1 ? 'y' : 'ies'}`
                          : 'Chat with the team'}
                      </div>
                    </div>
                  </button>

                  {hasApproved && (
                    <Link to="/guide" className="dash-quick">
                      <span className="dash-quick__icon">📱</span>
                      <div>
                        <div className="dash-quick__title">Installation guide</div>
                        <div className="dash-quick__desc">Set up your access</div>
                      </div>
                    </Link>
                  )}

                  <Link to="/products" className="dash-quick">
                    <span className="dash-quick__icon">🛍</span>
                    <div>
                      <div className="dash-quick__title">Browse products</div>
                      <div className="dash-quick__desc">Explore the catalog</div>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <div className="dash-main__head">
                <div>
                  <h1 className="dash-main__title">My orders</h1>
                  <p className="dash-main__sub">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} ·{' '}
                    {approvedOrders.length} approved
                  </p>
                </div>
                <Link to="/products" className="btn btn--primary btn--sm">
                  + New purchase
                </Link>
              </div>

              {loading ? (
                <Loader label="Loading orders…" />
              ) : orders.length === 0 ? (
                <div className="empty">
                  <div className="empty__icon">🛒</div>
                  <h3 className="empty__title">No orders yet</h3>
                  <p className="empty__text">Once you buy a product, it will show up here.</p>
                  <Link to="/products" className="btn btn--primary" style={{ marginTop: 20 }}>
                    Explore products
                  </Link>
                </div>
              ) : (
                <div>
                  {orders.map((o) => (
                    <FullOrderCard
                      key={o._id}
                      order={o}
                      onOpenChat={() => setChatOpen(true)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'messages' && (
            <>
              <div className="dash-main__head">
                <div>
                  <h1 className="dash-main__title">Messages</h1>
                  <p className="dash-main__sub">Chat with the Mojinet support team</p>
                </div>
              </div>
              <div className="dash-chat-embed">
                <CustomerMessagePanel onRead={() => setUnread(0)} />
              </div>
            </>
          )}
        </main>
      </div>

      {activeTab !== 'messages' && (
        <button
          type="button"
          className="chat-fab"
          onClick={() => setChatOpen(true)}
          title="Message support"
        >
          <span className="chat-fab__icon">💬</span>
          <span className="chat-fab__label">Message support</span>
          {unread > 0 && <span className="chat-fab__badge">{unread}</span>}
        </button>
      )}

      {chatOpen && (
        <div className="chat-modal-overlay" onClick={() => setChatOpen(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <CustomerMessagePanel
              onClose={() => setChatOpen(false)}
              onRead={() => setUnread(0)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniOrderCard({ order: o }) {
  const key = STATUS[o.status] ? o.status : 'pending';
  const meta = STATUS[key];
  const isLifetime = o.product?.isLifetime === true;
  const expiryDate = !isLifetime && o.expiresAt ? new Date(o.expiresAt) : null;
  const isExpired = !isLifetime && isApproved(o.status) && expiryDate && expiryDate < new Date();

  return (
    <div className="mini-order">
      <div className="mini-order__thumb">
        {o.product?.title?.charAt(0)?.toUpperCase() || '★'}
      </div>
      <div className="mini-order__body">
        <div className="mini-order__row">
          <div className="mini-order__title">
            {o.product?.title || 'Product'}
            {isLifetime && (
              <span className="badge badge--lifetime" style={{ marginLeft: 6, fontSize: 10 }}>♾</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {isExpired && <span className="badge badge--rejected">Expired</span>}
            <span className={`badge ${meta.badge}`}>{meta.label}</span>
          </div>
        </div>
        <div className="mini-order__meta">
          #{o._id.slice(-6).toUpperCase()} · {fmtDate(o.createdAt)} · {formatPrice(o.amount)}
        </div>
      </div>
    </div>
  );
}

function FullOrderCard({ order: o, onOpenChat }) {
  const key = STATUS[o.status] ? o.status : 'pending';
  const meta = STATUS[key];
  const delivered = o.deliveryContent ?? o.deliveredUrl ?? null;

  const isLifetime = o.product?.isLifetime === true;
  const purchaseDate = new Date(o.createdAt);
  const durationDays = o.product?.durationDays ?? null;
  const expiryDate = isLifetime
    ? null
    : o.expiresAt
      ? new Date(o.expiresAt)
      : durationDays
        ? new Date(purchaseDate.getTime() + durationDays * DAY_MS)
        : null;
  const isExpired = !isLifetime && isApproved(o.status) && expiryDate && expiryDate < new Date();
  const daysLeft =
    !isLifetime && isApproved(o.status) && expiryDate && !isExpired
      ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / DAY_MS))
      : null;

  return (
    <div className="order-card">
      <div className="order-card__top">
        <div>
          <h3 className="order-card__title">
            {o.product?.title || 'Product'}
            {isLifetime && (
              <span className="badge badge--lifetime" style={{ marginLeft: 8 }}>♾ Lifetime</span>
            )}
          </h3>
          <p className="order-card__meta">
            Order #{o._id.slice(-6).toUpperCase()} · {fmtDate(o.createdAt)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {isExpired && <span className="badge badge--rejected">Expired</span>}
          <span className={`badge ${meta.badge}`}>{meta.label}</span>
        </div>
      </div>

      <div className="order-card__body">
        {isApproved(o.status) && delivered && (
          <div className="delivery">
            <div className="delivery__icon">✓</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="delivery__head">
                <span className="delivery__label">Message from the store</span>
                <CopyButton text={delivered} label="Copy" />
              </div>
              {isUrl(delivered) ? (
                <div className="delivery__link">{delivered.trim()}</div>
              ) : (
                <div className="delivery__text">{delivered}</div>
              )}
              <div className="delivery__guide">
                <div className="delivery__guide-icon">📱</div>
                <div className="delivery__guide-text">
                  <div className="delivery__guide-title">Need help setting up?</div>
                  <div className="delivery__guide-desc">
                    Follow our step-by-step installation guide.
                  </div>
                </div>
                <Link to="/guide" className="btn btn--primary btn--sm">
                  View guide →
                </Link>
              </div>
            </div>
          </div>
        )}

        {isApproved(o.status) && !delivered && (
          <div className="notice notice--pending">
            <span>ℹ️</span>
            <span>Approved — the store has not attached any message yet.</span>
          </div>
        )}

        {key === 'pending' && (
          <div className="notice notice--pending">
            <span>⏳</span>
            <span>
              Waiting for admin to verify your payment. This usually takes 5 to 10 minutes (max 1 hour).
            </span>
          </div>
        )}

        {o.status === 'rejected' && (
          <div className="notice notice--rejected">
            <span>⚠️</span>
            <span>Rejected — {o.adminNote || 'Payment could not be verified.'}</span>
          </div>
        )}

        {isExpired && (
          <div className="notice notice--rejected" style={{ marginTop: 10 }}>
            <span>⌛</span>
            <span>
              This purchase expired on {fmtDate(expiryDate)}. Contact the store if you need to renew.
            </span>
          </div>
        )}

        <dl className="order-info">
          <div className="order-info__item">
            <dt className="order-info__label">Purchased</dt>
            <dd className="order-info__value">{fmtDate(purchaseDate)}</dd>
          </div>
          <div className="order-info__item">
            <dt className="order-info__label">Duration</dt>
            <dd className="order-info__value">
              {isLifetime ? 'Lifetime' : durationDays ? `${durationDays} days` : '—'}
            </dd>
          </div>
          <div className="order-info__item">
            <dt className="order-info__label">Expires</dt>
            <dd className="order-info__value">
              {isLifetime
                ? 'Never'
                : expiryDate ? fmtDate(expiryDate) : '—'}
              {daysLeft != null && (
                <span className="order-info__sub">
                  {daysLeft === 0
                    ? 'today'
                    : `in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                </span>
              )}
            </dd>
          </div>
          <div className="order-info__item">
            <dt className="order-info__label">Amount</dt>
            <dd className="order-info__value">
              {formatPrice(o.amount)}
              <span className="order-info__sub">
                {o.paymentMethod === 'wechat' ? 'WeChat Pay' : 'Alipay'}
              </span>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          style={{ marginTop: 14 }}
          onClick={onOpenChat}
        >
          💬 Message store about this order
        </button>
      </div>
    </div>
  );
}