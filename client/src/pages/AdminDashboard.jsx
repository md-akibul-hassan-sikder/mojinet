import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import AdminMessagesTab from '../components/AdminMessagesTab';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { formatPrice, discountPercent } from '../utils/currency';

/* A stored asset value is either a full URL (Cloudinary) or empty.
   Legacy bare filenames are ignored instead of prefixed with /uploads/. */
const toImageUrl = (v) =>
  typeof v === 'string' && /^https?:\/\//i.test(v) ? v : '';

const emptyProduct = {
  title: '', description: '', price: '', originalPrice: '',
  isLifetime: false, durationDays: 30,
  deviceInfo: 'Unlimited — works on all devices',
  category: '', features: '', image: '', isActive: true,
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

export default function AdminDashboard() {
  const [tab, setTab] = useState('orders');

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1 className="page-head__title">Admin console</h1>
          <p className="page-head__sub">Manage orders, products, users, messages and your account.</p>
        </div>
      </div>

      <div className="tabs">
        <button type="button" className={`tab ${tab === 'orders'   ? 'tab--active' : ''}`} onClick={() => setTab('orders')}>Orders</button>
        <button type="button" className={`tab ${tab === 'products' ? 'tab--active' : ''}`} onClick={() => setTab('products')}>Products</button>
        <button type="button" className={`tab ${tab === 'users'    ? 'tab--active' : ''}`} onClick={() => setTab('users')}>Users</button>
        <button type="button" className={`tab ${tab === 'messages' ? 'tab--active' : ''}`} onClick={() => setTab('messages')}>Messages</button>
        <button type="button" className={`tab ${tab === 'settings' ? 'tab--active' : ''}`} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'orders'   && <OrdersTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'users'    && <UsersTab />}
      {tab === 'messages' && <AdminMessagesTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}

/* ============================================================
   ORDERS TAB
   ============================================================ */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [content, setContent] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalBusy, setModalBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/orders/pending')
      .then((r) => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openApprove = (o) => { setApproveTarget(o); setContent(''); setModalError(''); };
  const closeApprove = () => { setApproveTarget(null); setContent(''); setModalError(''); };

  const confirmApprove = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return setModalError('Please type something to send to the customer.');
    setModalBusy(true); setModalError('');
    try {
      await api.put(`/admin/orders/${approveTarget._id}/approve`, { deliveryContent: text });
      closeApprove(); load();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to approve');
    } finally { setModalBusy(false); }
  };

  const reject = async (id) => {
    const note = window.prompt('Reason for rejection (optional):') || '';
    setBusyId(id);
    try { await api.put(`/admin/orders/${id}/reject`, { note }); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setBusyId(null); }
  };

  return (
    <>
      <div className="stat-grid">
        <div className="stat">
          <div className="stat__label">Pending orders</div>
          <div className="stat__value" style={{ color: 'var(--warning)' }}>{orders.length}</div>
          <div className="stat__hint">Awaiting verification</div>
        </div>
        <div className="stat">
          <div className="stat__label">Queue value</div>
          <div className="stat__value">{formatPrice(orders.reduce((s, o) => s + o.amount, 0))}</div>
          <div className="stat__hint">Total in queue</div>
        </div>
        <div className="stat">
          <div className="stat__label">WeChat</div>
          <div className="stat__value">{orders.filter((o) => o.paymentMethod === 'wechat').length}</div>
          <div className="stat__hint">In this queue</div>
        </div>
        <div className="stat">
          <div className="stat__label">Alipay</div>
          <div className="stat__value">{orders.filter((o) => o.paymentMethod === 'alipay').length}</div>
          <div className="stat__hint">In this queue</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn--secondary btn--sm" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <Loader label="Loading pending orders…" />
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">✅</div>
          <h3 className="empty__title">All caught up</h3>
          <p className="empty__text">No pending payments to review.</p>
        </div>
      ) : (
        <div>
          {orders.map((o) => {
            const proofUrl = toImageUrl(o.paymentProof);
            return (
              <div key={o._id} className="admin-order">
                <div className="admin-order__proof">
                  {proofUrl ? (
                    <a href={proofUrl} target="_blank" rel="noreferrer">
                      <img src={proofUrl} alt="Proof" />
                    </a>
                  ) : o.paymentReference ? (
                    <div className="admin-order__ref">
                      <span className="admin-order__ref-label">Transaction code</span>
                      <span className="admin-order__ref-value">****{o.paymentReference}</span>
                    </div>
                  ) : o.paymentRemark ? (
                    <div className="admin-order__ref">
                      <span className="admin-order__ref-label">Payment remark</span>
                      <span className="admin-order__ref-remark" title={o.paymentRemark}>{o.paymentRemark}</span>
                    </div>
                  ) : <span>No proof</span>}
                </div>
                <div className="admin-order__info">
                  <div className="admin-order__title">
                    {o.product?.title}
                    {o.product?.isLifetime && (
                      <span className="badge badge--lifetime" style={{ marginLeft: 8 }}>♾ Lifetime</span>
                    )}
                  </div>
                  <div className="admin-order__sub">
                    #{o._id.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleString()}
                  </div>
                  <div className="admin-order__kv">
                    <div><b>Customer:</b> <span>{o.user?.name} ({o.user?.email})</span></div>
                    <div><b>Amount:</b> <span>{formatPrice(o.amount)}</span></div>
                    <div><b>Method:</b> <span>{o.paymentMethod === 'wechat' ? 'WeChat Pay' : 'Alipay'}</span></div>
                  </div>
                </div>
                <div className="admin-order__actions">
                  <button className="btn btn--success" disabled={busyId === o._id} onClick={() => openApprove(o)}>Approve &amp; send</button>
                  <button className="btn btn--danger" disabled={busyId === o._id} onClick={() => reject(o._id)}>Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {approveTarget && (
        <div className="modal-overlay" onClick={closeApprove}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Send content to customer</h3>
              <button type="button" className="modal__close" onClick={closeApprove}>×</button>
            </div>
            <form onSubmit={confirmApprove} className="modal__form">
              <div className="modal__body">
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
                  Order <b>#{approveTarget._id.slice(-6).toUpperCase()}</b> — {approveTarget.product?.title} — <b>{formatPrice(approveTarget.amount)}</b><br />
                  Customer: {approveTarget.user?.name} ({approveTarget.user?.email})
                </p>
                <label className="field">
                  <span className="field__label">Message to customer</span>
                  <textarea
                    className="input"
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Link, access code, or instructions…"
                    autoFocus required
                    style={{ resize: 'vertical', minHeight: 120, fontFamily: 'inherit' }}
                  />
                  <span className="field__hint">Free text — URLs become clickable, everything else is shown verbatim.</span>
                </label>
                {modalError && <div className="alert alert--error" style={{ marginTop: 12 }}>{modalError}</div>}
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--secondary" onClick={closeApprove} disabled={modalBusy}>Cancel</button>
                <button type="submit" className="btn btn--success" disabled={modalBusy}>
                  {modalBusy ? 'Sending…' : 'Approve & send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   PRODUCTS TAB
   ============================================================ */
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Banner image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(''); // objectURL when file picked

  // QR codes
  const [wechatQrFile, setWechatQrFile] = useState(null);
  const [alipayQrFile, setAlipayQrFile] = useState(null);
  const [wechatPreview, setWechatPreview] = useState('');
  const [alipayPreview, setAlipayPreview] = useState('');

  const revoke = (url) => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url); };

  const load = () => {
    setLoading(true);
    api.get('/admin/products')
      .then((r) => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetUploadState = () => {
    revoke(imagePreview); revoke(wechatPreview); revoke(alipayPreview);
    setImageFile(null);      setWechatQrFile(null); setAlipayQrFile(null);
    setImagePreview('');     setWechatPreview('');  setAlipayPreview('');
  };

  const openNew = () => {
    setForm(emptyProduct);
    resetUploadState();
    setError('');
    setModal('new');
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || '',
      description: p.description || '',
      price: p.price ?? '',
      originalPrice: p.originalPrice ?? '',
      isLifetime: p.isLifetime === true,
      durationDays: p.durationDays ?? 30,
      deviceInfo: p.deviceInfo || 'Unlimited — works on all devices',
      category: p.category || '',
      features: (p.features || []).join('\n'),
      image: p.image || '',
      isActive: p.isActive !== false,
    });
    revoke(imagePreview); revoke(wechatPreview); revoke(alipayPreview);
    setImageFile(null);      setWechatQrFile(null); setAlipayQrFile(null);
    setImagePreview('');     // banner falls back to form.image (Cloudinary URL)
    setWechatPreview(toImageUrl(p.wechatQr));
    setAlipayPreview(toImageUrl(p.alipayQr));
    setError('');
    setModal(p);
  };

  const close = () => {
    resetUploadState();
    setModal(null);
    setError('');
  };

  const pickImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    revoke(imagePreview);
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    revoke(imagePreview);
    setImageFile(null);
    setImagePreview('');
    setForm({ ...form, image: '' });
  };

  const pickWechat = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    revoke(wechatPreview);
    setWechatQrFile(f);
    setWechatPreview(URL.createObjectURL(f));
  };

  const pickAlipay = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    revoke(alipayPreview);
    setAlipayQrFile(f);
    setAlipayPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (modal === 'new') {
        if (!wechatQrFile) throw { response: { data: { message: 'Please upload the WeChat QR code.' } } };
        if (!alipayQrFile) throw { response: { data: { message: 'Please upload the Alipay QR code.' } } };
      }

      if (!form.isLifetime && (!form.durationDays || Number(form.durationDays) < 1)) {
        throw { response: { data: { message: 'Duration must be at least 1 day for time-limited products.' } } };
      }

      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('price', String(form.price));
      fd.append('originalPrice', form.originalPrice === '' ? '' : String(form.originalPrice));
      fd.append('isLifetime', String(form.isLifetime));
      fd.append('durationDays', form.isLifetime ? '0' : String(form.durationDays));
      fd.append('deviceInfo', form.deviceInfo || '');
      fd.append('category', form.category || '');
      fd.append('isActive', String(form.isActive));
      fd.append(
        'features',
        JSON.stringify(form.features.split('\n').map((s) => s.trim()).filter(Boolean))
      );

      // Banner: file takes precedence, else stored Cloudinary URL / typed URL.
      if (imageFile)        fd.append('image', imageFile);
      else if (form.image)  fd.append('image', form.image);

      if (wechatQrFile) fd.append('wechatQr', wechatQrFile);
      if (alipayQrFile) fd.append('alipayQr', alipayQrFile);

      if (modal === 'new') await api.post('/admin/products', fd);
      else                 await api.put(`/admin/products/${modal._id}`, fd);

      close(); load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setBusy(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try { await api.delete(`/admin/products/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const bannerPreview = imagePreview || toImageUrl(form.image);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {products.length} product{products.length !== 1 ? 's' : ''} in catalog
        </p>
        <button className="btn btn--primary" onClick={openNew} type="button">+ New product</button>
      </div>

      {loading ? (
        <Loader label="Loading products…" />
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">📦</div>
          <h3 className="empty__title">No products yet</h3>
          <p className="empty__text">Create your first product to get started.</p>
          <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={openNew} type="button">
            + New product
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => {
            const off = discountPercent(p.price, p.originalPrice);
            const hasOffer = off > 0;
            const banner = toImageUrl(p.image);

            return (
              <div key={p._id} className="card" style={{ overflow: 'hidden' }}>
                <div className="product-card__thumb" style={{ aspectRatio: '16/7' }}>
                  {banner ? (
                    <img src={banner} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    p.title.charAt(0).toUpperCase()
                  )}
                  {hasOffer && <span className="product-card__ribbon">-{off}% OFF</span>}
                </div>
                <div className="card__body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                    <h3 className="product-card__title" style={{ marginBottom: 4 }}>{p.title}</h3>
                    {!p.isActive && <span className="badge badge--rejected">Inactive</span>}
                  </div>
                  <p className="product-card__desc" style={{ marginBottom: 12, WebkitLineClamp: 2 }}>{p.description}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {p.isLifetime ? (
                      <span className="badge badge--lifetime">♾ Lifetime</span>
                    ) : (
                      <span className="badge badge--info">{p.durationDays} days</span>
                    )}
                    {p.category && <span className="badge badge--info">{p.category}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{p.deviceInfo}</p>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {toImageUrl(p.wechatQr)
                      ? <span className="badge badge--approved">WeChat QR</span>
                      : <span className="badge badge--rejected">No WeChat QR</span>}
                    {toImageUrl(p.alipayQr)
                      ? <span className="badge badge--approved">Alipay QR</span>
                      : <span className="badge badge--rejected">No Alipay QR</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div>
                      {hasOffer && (
                        <div className="price-stack__row">
                          <span className="price-stack__original">{formatPrice(p.originalPrice)}</span>
                          <span className="price-stack__off">-{off}%</span>
                        </div>
                      )}
                      <strong style={{ fontSize: 18, fontWeight: 800 }}>{formatPrice(p.price)}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn--secondary btn--sm" onClick={() => openEdit(p)} type="button">Edit</button>
                      <button className="btn btn--danger btn--sm" onClick={() => del(p._id)} type="button">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">{modal === 'new' ? 'Create product' : 'Edit product'}</h3>
              <button type="button" className="modal__close" onClick={close}>×</button>
            </div>

            <form onSubmit={submit} className="modal__form" encType="multipart/form-data">
              <div className="modal__body">
                <div className="form-grid">
                  <label className="field field--full">
                    <span className="field__label">Product name *</span>
                    <input className="input" value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </label>
                  <label className="field field--full">
                    <span className="field__label">Description *</span>
                    <textarea className="input" rows={3} value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                  </label>
                  <label className="field">
                    <span className="field__label">Original price (CNY)</span>
                    <input className="input" type="number" min="0" step="0.01" value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      placeholder="e.g. 100.00 — leave blank for no discount" />
                    <span className="field__hint">Shown crossed out with a “-N%” badge.</span>
                  </label>
                  <label className="field">
                    <span className="field__label">Offer price (CNY) *</span>
                    <input className="input" type="number" min="0" step="0.01" value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required placeholder="e.g. 68.00" />
                    <span className="field__hint">What the customer actually pays.</span>
                  </label>

                  <div className="field field--full">
                    <label className="lifetime-toggle">
                      <input
                        type="checkbox"
                        checked={form.isLifetime}
                        onChange={(e) => setForm({ ...form, isLifetime: e.target.checked })}
                      />
                      <span className="lifetime-toggle__track" aria-hidden="true">
                        <span className="lifetime-toggle__thumb" />
                      </span>
                      <span className="lifetime-toggle__label">
                        <span className="lifetime-toggle__title">Lifetime product — no expiry</span>
                        <span className="lifetime-toggle__desc">
                          Customers keep access forever. Duration field is ignored when this is on.
                        </span>
                      </span>
                    </label>
                  </div>

                  {!form.isLifetime && (
                    <label className="field">
                      <span className="field__label">Duration (days) *</span>
                      <input className="input" type="number" min="1" value={form.durationDays}
                        onChange={(e) => setForm({ ...form, durationDays: e.target.value })} required />
                      <span className="field__hint">Customer’s access expires this many days after purchase.</span>
                    </label>
                  )}

                  <label className="field">
                    <span className="field__label">Category</span>
                    <input className="input" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Premium, Starter, …" />
                  </label>
                  <label className="field field--full">
                    <span className="field__label">Device support</span>
                    <input className="input" value={form.deviceInfo}
                      onChange={(e) => setForm({ ...form, deviceInfo: e.target.value })}
                      placeholder="Unlimited — works on all devices" />
                  </label>

                  {/* ── PRODUCT BANNER (file upload or URL) ── */}
                  <div className="field field--full">
                    <span className="field__label">Product banner</span>
                    <p className="field__hint" style={{ marginTop: 0, marginBottom: 12 }}>
                      Upload an image (stored on Cloudinary) or paste a URL. The uploaded file takes precedence.
                    </p>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          width: 280, maxWidth: '100%', aspectRatio: '16/7',
                          borderRadius: 10, overflow: 'hidden',
                          background: bannerPreview ? `#000` : 'var(--surface-2)',
                          border: '1px dashed var(--border-strong)',
                          display: 'grid', placeItems: 'center',
                          color: 'var(--text-subtle)', fontSize: 13,
                          position: 'relative',
                        }}
                      >
                        {bannerPreview ? (
                          <img
                            src={bannerPreview}
                            alt="Banner preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : 'No banner'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label className="btn btn--secondary btn--sm" style={{ cursor: 'pointer' }}>
                          {bannerPreview ? 'Replace image' : 'Upload image'}
                          <input type="file" accept="image/*" onChange={pickImage} style={{ display: 'none' }} />
                        </label>
                        {bannerPreview && (
                          <button type="button" className="btn btn--ghost btn--sm" onClick={clearImage}>
                            ✕ Remove banner
                          </button>
                        )}
                        <span className="field__hint">JPG / PNG / WEBP, max 5 MB.</span>
                      </div>
                    </div>
                    <input
                      className="input"
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="…or paste an image URL (https://…)"
                      style={{ marginTop: 12 }}
                    />
                  </div>

                  <label className="field field--full">
                    <span className="field__label">Features (one per line)</span>
                    <textarea className="input" rows={4} value={form.features}
                      onChange={(e) => setForm({ ...form, features: e.target.value })}
                      placeholder={"Instant delivery\nAccess to all content\n24/7 support"}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                  </label>

                  <div className="field field--full">
                    <span className="field__label">Payment QR codes *</span>
                    <p className="field__hint" style={{ marginTop: 0, marginBottom: 12 }}>
                      Each product has its own WeChat &amp; Alipay QR shown to customers at checkout.
                    </p>
                    <div className="qr-upload-row">
                      <div className="qr-upload-col">
                        <span className="qr-upload-label">
                          <span className="pay-option__logo pay-option__logo--wechat" style={{ width: 24, height: 24, fontSize: 11 }}>W</span>
                          WeChat QR {modal === 'new' && <span style={{ color: 'var(--danger)' }}>*</span>}
                        </span>
                        <div className="qr-upload">
                          {wechatPreview ? (
                            <img src={wechatPreview} alt="WeChat QR preview"
                              onError={(e) => { e.currentTarget.src = ''; e.currentTarget.alt = 'QR failed to load'; }} />
                          ) : (
                            <div className="qr-upload__placeholder">No QR uploaded</div>
                          )}
                          <label className="btn btn--secondary btn--sm" style={{ cursor: 'pointer' }}>
                            {wechatPreview ? 'Replace' : 'Upload'}
                            <input type="file" accept="image/*" onChange={pickWechat} style={{ display: 'none' }} />
                          </label>
                        </div>
                      </div>

                      <div className="qr-upload-col">
                        <span className="qr-upload-label">
                          <span className="pay-option__logo pay-option__logo--alipay" style={{ width: 24, height: 24, fontSize: 11 }}>A</span>
                          Alipay QR {modal === 'new' && <span style={{ color: 'var(--danger)' }}>*</span>}
                        </span>
                        <div className="qr-upload">
                          {alipayPreview ? (
                            <img src={alipayPreview} alt="Alipay QR preview"
                              onError={(e) => { e.currentTarget.src = ''; e.currentTarget.alt = 'QR failed to load'; }} />
                          ) : (
                            <div className="qr-upload__placeholder">No QR uploaded</div>
                          )}
                          <label className="btn btn--secondary btn--sm" style={{ cursor: 'pointer' }}>
                            {alipayPreview ? 'Replace' : 'Upload'}
                            <input type="file" accept="image/*" onChange={pickAlipay} style={{ display: 'none' }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <label className="field field--full check">
                    <input type="checkbox" checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    <span>Active — visible to customers on the storefront</span>
                  </label>
                </div>

                {error && <div className="alert alert--error" style={{ marginTop: 16 }}>{error}</div>}
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--secondary" onClick={close} disabled={busy}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={busy}>
                  {busy ? 'Saving…' : modal === 'new' ? 'Create product' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   USERS TAB (unchanged)
   ============================================================ */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showHash, setShowHash] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/users')
      .then((r) => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openUser = async (u) => {
    setSelected(u);
    setDetail(null);
    setShowHash(false);
    setDetailLoading(true);
    try {
      const r = await api.get(`/admin/users/${u._id}`);
      setDetail(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };
  const closeUser = () => { setSelected(null); setDetail(null); };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const totals = users.reduce(
    (acc, u) => ({
      active: acc.active + u.activePurchases,
      spent:  acc.spent  + u.totalSpent,
    }),
    { active: 0, spent: 0 }
  );

  return (
    <>
      <div className="stat-grid">
        <div className="stat">
          <div className="stat__label">Total users</div>
          <div className="stat__value">{users.length}</div>
          <div className="stat__hint">Registered accounts</div>
        </div>
        <div className="stat">
          <div className="stat__label">Active purchases</div>
          <div className="stat__value" style={{ color: 'var(--success)' }}>{totals.active}</div>
          <div className="stat__hint">Approved &amp; not expired</div>
        </div>
        <div className="stat">
          <div className="stat__label">Total revenue</div>
          <div className="stat__value">{formatPrice(totals.spent)}</div>
          <div className="stat__hint">Approved orders only</div>
        </div>
        <div className="stat">
          <div className="stat__label">Admins</div>
          <div className="stat__value">{users.filter((u) => u.role === 'admin').length}</div>
          <div className="stat__hint">With admin role</div>
        </div>
      </div>

      <div className="users-toolbar">
        <input
          className="input users-toolbar__search"
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn btn--secondary btn--sm users-toolbar__refresh"
          onClick={load}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <Loader label="Loading users…" />
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">👥</div>
          <h3 className="empty__title">No users found</h3>
          <p className="empty__text">
            {search ? 'Try a different search term.' : 'No users have registered yet.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="data-table users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Orders</th>
                  <th style={{ textAlign: 'right' }}>Active</th>
                  <th style={{ textAlign: 'right' }}>Expired</th>
                  <th style={{ textAlign: 'right' }}>Pending</th>
                  <th style={{ textAlign: 'right' }}>Spent</th>
                  <th style={{ textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} onClick={() => openUser(u)} style={{ cursor: 'pointer' }}>
                    <td data-label="User">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="avatar-sm">{(u.name || '?').charAt(0).toUpperCase()}</span>
                        <div style={{ minWidth: 0 }}>
                          <div className="data-table__strong">
                            {u.name || 'Unnamed user'}
                            {u.role === 'admin' && (
                              <span className="badge badge--info" style={{ marginLeft: 8 }}>Admin</span>
                            )}
                          </div>
                          <div className="data-table__sub">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Joined" style={{ color: 'var(--text-muted)' }}>{fmtDate(u.createdAt)}</td>
                    <td data-label="Orders" style={{ textAlign: 'right' }}>{u.totalOrders}</td>
                    <td data-label="Active" style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>{u.activePurchases}</td>
                    <td data-label="Expired" style={{ textAlign: 'right', color: 'var(--text-subtle)' }}>{u.expiredCount}</td>
                    <td data-label="Pending" style={{ textAlign: 'right', color: 'var(--warning)' }}>{u.pendingCount}</td>
                    <td data-label="Spent" style={{ textAlign: 'right', fontWeight: 700 }}>{formatPrice(u.totalSpent)}</td>
                    <td data-label="Action" style={{ textAlign: 'right' }}>
                      <span className="btn btn--secondary btn--sm">View</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={closeUser}>
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div style={{ minWidth: 0 }}>
                <h3 className="modal__title">{selected.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, overflowWrap: 'anywhere' }}>
                  {selected.email}
                </p>
              </div>
              <button type="button" className="modal__close" onClick={closeUser}>×</button>
            </div>

            <div className="modal__body">
              {detailLoading ? (
                <Loader label="Loading user…" />
              ) : detail ? (
                <>
                  <div className="user-detail">
                    <div className="user-detail__row">
                      <span className="user-detail__label">Name</span>
                      <span className="user-detail__value">{detail.user.name}</span>
                    </div>
                    <div className="user-detail__row">
                      <span className="user-detail__label">Email</span>
                      <span className="user-detail__value">{detail.user.email}</span>
                    </div>
                    <div className="user-detail__row">
                      <span className="user-detail__label">Role</span>
                      <span className="user-detail__value">
                        <span className={`badge ${detail.user.role === 'admin' ? 'badge--info' : 'badge--approved'}`}>
                          {detail.user.role}
                        </span>
                      </span>
                    </div>
                    <div className="user-detail__row">
                      <span className="user-detail__label">Joined</span>
                      <span className="user-detail__value">{fmtDate(detail.user.createdAt)}</span>
                    </div>
                    <div className="user-detail__row" style={{ gridColumn: '1 / -1' }}>
                      <span className="user-detail__label">Password (bcrypt hash)</span>
                      <span className="user-detail__value user-detail__value--hash">
                        {showHash ? (
                          <>
                            <code className="hash-code">{detail.user.passwordHash}</code>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => setShowHash(false)}
                            >
                              Hide
                            </button>
                          </>
                        ) : (
                          <>
                            <code className="hash-mask">•••••••••••••••</code>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => setShowHash(true)}
                            >
                              Show hash
                            </button>
                          </>
                        )}
                      </span>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }} className="notice notice--pending">
                      <span>🔒</span>
                      <span>
                        Passwords are hashed with <b>bcrypt</b> and cannot be reversed.
                      </span>
                    </div>
                  </div>

                  <h4 className="user-detail__section">Purchase summary</h4>
                  <div className="stat-grid user-detail__stats">
                    <div className="stat">
                      <div className="stat__label">Total orders</div>
                      <div className="stat__value">{detail.summary.totalOrders}</div>
                    </div>
                    <div className="stat">
                      <div className="stat__label">Active</div>
                      <div className="stat__value" style={{ color: 'var(--success)' }}>{detail.summary.activePurchases}</div>
                    </div>
                    <div className="stat">
                      <div className="stat__label">Expired</div>
                      <div className="stat__value" style={{ color: 'var(--text-subtle)' }}>{detail.summary.expiredPurchases}</div>
                    </div>
                    <div className="stat">
                      <div className="stat__label">Spent</div>
                      <div className="stat__value">{formatPrice(detail.summary.totalSpent)}</div>
                    </div>
                  </div>

                  <h4 className="user-detail__section">Order history</h4>
                  {detail.orders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No orders yet.</p>
                  ) : (
                    <div className="user-orders">
                      {detail.orders.map((o) => {
                        const purchase = new Date(o.createdAt);
                        const isLifetime = o.product?.isLifetime === true;
                        const exp = o.expiresAt ? new Date(o.expiresAt) : null;
                        const expired = !isLifetime && o.status === 'approved' && exp && exp <= new Date();
                        const badgeClass =
                          o.status === 'approved'
                            ? expired ? 'badge--rejected' : 'badge--approved'
                            : o.status === 'pending'
                              ? 'badge--pending'
                              : 'badge--rejected';
                        const label =
                          o.status === 'approved'
                            ? expired ? 'Expired' : 'Active'
                            : o.status;
                        return (
                          <div key={o._id} className="user-order-row">
                            <div style={{ minWidth: 0 }}>
                              <div className="data-table__strong">
                                {o.product?.title || 'Product'}
                                {isLifetime && (
                                  <span className="badge badge--lifetime" style={{ marginLeft: 6, fontSize: 10 }}>♾</span>
                                )}
                              </div>
                              <div className="data-table__sub">
                                #{String(o._id).slice(-6).toUpperCase()} · {formatPrice(o.amount)} ·{' '}
                                {o.paymentMethod === 'wechat' ? 'WeChat' : 'Alipay'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 12 }}>
                              <span className={`badge ${badgeClass}`}>{label}</span>
                              <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                                {fmtDate(purchase)}
                                {isLifetime
                                  ? <> · ♾ Never expires</>
                                  : exp && <> · Exp {fmtDate(exp)}</>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--danger)' }}>Could not load user details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   SETTINGS TAB (unchanged)
   ============================================================ */
function SettingsTab() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('New passwords do not match.');
    if (newPassword === currentPassword) return setError('New password must be different from the current one.');

    setBusy(true);
    try {
      const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (data.token) localStorage.setItem('token', data.token);
      setSuccess('Password updated successfully. Other sessions have been signed out.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settings-wrap">
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Change password</h3>
          <p className="card__subtitle">Update the password you use to sign in to the admin console.</p>
        </div>
        <div className="card__body">
          <form onSubmit={onSubmit} className="settings-form">
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
            />
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              minLength={6}
              hint="Use 6 or more characters."
            />
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Type the new password again"
              autoComplete="new-password"
              required
            />
            {confirmPassword.length > 0 && (
              <span className={`field__hint ${newPassword === confirmPassword ? 'field__hint--ok' : 'field__hint--bad'}`}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
            {error && <div className="alert alert--error" style={{ marginTop: 8 }}>{error}</div>}
            {success && <div className="alert alert--success" style={{ marginTop: 8 }}>{success}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn--secondary"
                onClick={() => {
                  setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                  setError(''); setSuccess('');
                }}
                disabled={busy}>
                Clear
              </button>
              <button type="submit" className="btn btn--primary" disabled={busy}>
                {busy ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card__header">
          <h3 className="card__title">Account information</h3>
          <p className="card__subtitle">Your admin account details.</p>
        </div>
        <div className="card__body">
          <dl className="settings-info">
            <div><dt>Name</dt><dd>{user?.name || '—'}</dd></div>
            <div><dt>Email</dt><dd>{user?.email || '—'}</dd></div>
            <div>
              <dt>Role</dt>
              <dd><span className="badge badge--info">{user?.role || 'admin'}</span></dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}