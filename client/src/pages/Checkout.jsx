import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import CameraCapture from '../components/CameraCapture';
import { formatPrice } from '../utils/currency';

/**
 * True when a value looks like a full URL (Cloudinary or any http(s) asset).
 * Anything else (a bare public_id, empty string, null) → false,
 * which triggers the local fallback image.
 */
const isUrl = (v) => typeof v === 'string' && /^https?:\/\//i.test(v);

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState('wechat');
  const [proofMode, setProofMode] = useState('upload'); // 'upload' | 'code'

  // upload state
  const [proof, setProof] = useState(null);
  const [preview, setPreview] = useState('');

  // code state — user fills ONLY ONE of these two
  const [reference, setReference] = useState('');
  const [remark, setRemark] = useState('');

  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const setProofFile = (file) => {
    if (!file) return;
    setProof(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const onFilePicked = (e) => setProofFile(e.target.files?.[0]);

  const clearProof = () => {
    setProof(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFilePicker = () => fileInputRef.current?.click();
  const openCamera = () => setShowCamera(true);
  const cameraFallback = () => { setShowCamera(false); setTimeout(openFilePicker, 120); };

  // switching modes clears the *other* mode's data
  const switchMode = (mode) => {
    if (mode === proofMode) return;
    if (mode === 'upload') {
      setReference('');
      setRemark('');
    } else {
      clearProof();
    }
    setProofMode(mode);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (proofMode === 'upload') {
      if (!proof) return setError('Please choose a screenshot or take a photo.');
    } else {
      const hasRef = /^\d{4}$/.test(reference.trim());
      const hasRemark = !!remark.trim();

      if (!hasRef && !hasRemark) {
        return setError('Enter either the last 4 digits OR a payment remark.');
      }
      if (hasRef && hasRemark) {
        return setError('Please provide only one of the two fields — last 4 digits OR payment remark, not both.');
      }
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('productId', id);
      fd.append('paymentMethod', method);

      if (proofMode === 'upload') {
        fd.append('paymentProof', proof);
      } else {
        if (reference.trim()) fd.append('paymentReference', reference.trim());
        if (remark.trim())    fd.append('paymentRemark',    remark.trim());
      }

      await api.post('/orders', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <p className="container page">Product not found.</p>;

  /* Resolve QR image src.
     Cloudinary URLs are absolute and used directly; anything else
     falls back to a bundled static image. */
  const qrSrc =
    method === 'wechat'
      ? (isUrl(product.wechatQr) ? product.wechatQr : '/wechat-qr.png')
      : (isUrl(product.alipayQr) ? product.alipayQr : '/alipay-qr.png');

  return (
    <div className="container page" style={{ maxWidth: 900 }}>
      <Link to={`/product/${id}`} style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Back to product</Link>

      <div style={{ marginTop: 16 }}>
        <h1 className="page-head__title">Checkout</h1>
        <p className="page-head__sub">Complete your payment in three simple steps.</p>
      </div>

      <div className="steps" style={{ marginTop: 28 }}>
        <div className="step step--active">
          <span className="step__dot">1</span>
          <span className="step__label">Choose method</span>
        </div>
        <span className="step__bar" />
        <div className="step step--active">
          <span className="step__dot">2</span>
          <span className="step__label">Pay &amp; verify</span>
        </div>
        <span className="step__bar" />
        <div className="step">
          <span className="step__dot">3</span>
          <span className="step__label">Admin verifies</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }} className="checkout-grid">
        <form onSubmit={onSubmit} className="card">
          <div className="card__body">
            <h3 className="card__title">1. Choose payment method</h3>
            <div className="pay-methods">
              <label className={`pay-option ${method === 'wechat' ? 'pay-option--active' : ''}`}>
                <input type="radio" checked={method === 'wechat'} onChange={() => setMethod('wechat')} />
                <span className="pay-option__logo pay-option__logo--wechat">W</span>
                <div>
                  <div className="pay-option__name">WeChat Pay</div>
                  <div className="pay-option__sub">Scan QR in WeChat</div>
                </div>
              </label>
              <label className={`pay-option ${method === 'alipay' ? 'pay-option--active' : ''}`}>
                <input type="radio" checked={method === 'alipay'} onChange={() => setMethod('alipay')} />
                <span className="pay-option__logo pay-option__logo--alipay">A</span>
                <div>
                  <div className="pay-option__name">Alipay</div>
                  <div className="pay-option__sub">Scan QR in Alipay</div>
                </div>
              </label>
            </div>

            <h3 className="card__title" style={{ marginTop: 28 }}>
              2. Scan the QR and pay {formatPrice(product.price)}
            </h3>
            <div className="qr-block">
              <img
                src={qrSrc}
                alt={`${method} QR`}
                onError={(e) => {
                  e.currentTarget.onerror = null; // prevent infinite loop
                  e.currentTarget.src = method === 'wechat' ? '/wechat-qr.png' : '/alipay-qr.png';
                }}
              />
              <p className="qr-block__hint">
                Open {method === 'wechat' ? 'WeChat' : 'Alipay'} → scan → pay{' '}
                <b>{formatPrice(product.price, { withCode: true })}</b>.
              </p>
            </div>

            <h3 className="card__title" style={{ marginTop: 28 }}>3. Provide payment proof</h3>

            <div className="notice notice--pending" style={{ marginTop: 8 }}>
              <span>⚠️</span>
              <span>
                <b>Choose only ONE option below</b> — either upload a screenshot
                <b> or </b>provide transaction details.
              </span>
            </div>

            <div className="proof-mode" style={{ marginTop: 14 }}>
              <button
                type="button"
                className={`proof-mode__btn ${proofMode === 'upload' ? 'proof-mode__btn--active' : ''}`}
                onClick={() => switchMode('upload')}
              >
                📸 Upload proof
              </button>
              <button
                type="button"
                className={`proof-mode__btn ${proofMode === 'code' ? 'proof-mode__btn--active' : ''}`}
                onClick={() => switchMode('code')}
              >
                🔢 Transaction details
              </button>
            </div>

            {proofMode === 'upload' && (
              <div className="proof-panel">
                {!proof && (
                  <div className="proof-actions">
                    <button type="button" className="proof-action" onClick={openFilePicker}>
                      <span className="proof-action__icon">📁</span>
                      <span className="proof-action__title">Choose file</span>
                      <span className="proof-action__sub">From your device</span>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFilePicked}
                  style={{ display: 'none' }}
                />

                {proof && (
                  <div className="proof-preview">
                    <img src={preview} alt="Payment proof" />
                    <div className="proof-preview__info">
                      <div className="proof-preview__name">{proof.name}</div>
                      <div className="proof-preview__size">
                        {(proof.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={clearProof}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}

                <p className="field__hint" style={{ marginTop: 12 }}>
                  JPG or PNG, max 5 MB. Screenshot or photo of the successful transaction.
                </p>
              </div>
            )}

            {proofMode === 'code' && (
              <div className="proof-panel">
                <div className="notice notice--pending" style={{ marginBottom: 16 }}>
                  <span>ℹ️</span>
                  <span>
                    Fill <b>only ONE</b> of the two fields below — either the last 4 digits
                    <b> or </b>the payment remark. Not both.
                  </span>
                </div>

                <label className="field">
                  <span className="field__label">
                    Last 4 digits of the transaction number
                    <span className="field__optional"> — optional</span>
                  </span>
                  <input
                    className="input"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    placeholder="e.g. 6789"
                    value={reference}
                    onChange={(e) =>
                      setReference(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    style={{
                      fontSize: 22,
                      letterSpacing: 12,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  />
                  <span className="field__hint">
                    You’ll find this in the payment confirmation screen inside{' '}
                    {method === 'wechat' ? 'WeChat' : 'Alipay'} (e.g. order number{' '}
                    <b>20241111…6789</b> → enter <b>6789</b>).
                  </span>
                </label>

                <div className="or-divider">
                  <span>OR</span>
                </div>

                <label className="field">
                  <span className="field__label">
                    Payment remark
                    <span className="field__optional"> — optional</span>
                  </span>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="The remark you typed when paying (e.g. your name, phone, order note)"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value.slice(0, 500))}
                    maxLength={500}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  <span className="field__hint">
                    Must match the remark in your payment record. {' '}
                    <b>{remark.length}/500</b>
                  </span>
                </label>
              </div>
            )}

            {error && <div className="alert alert--error" style={{ marginTop: 16 }}>{error}</div>}

            <button
              type="submit"
              className="btn btn--primary btn--lg btn--block"
              disabled={busy}
              style={{ marginTop: 24 }}
            >
              {busy ? 'Submitting…' : 'Submit for verification'}
            </button>
          </div>
        </form>

        <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: 92 }}>
          <div className="card__body">
            <h3 className="card__title">Order summary</h3>
            <div style={{ marginTop: 16 }}>
              <div className="summary-row">
                <span className="summary-row__label">Product</span>
                <span className="summary-row__value" style={{ textAlign: 'right', maxWidth: 160 }}>{product.title}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row__label">Method</span>
                <span className="summary-row__value">{method === 'wechat' ? 'WeChat Pay' : 'Alipay'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row__label">Proof</span>
                <span className="summary-row__value">
                  {proofMode === 'upload'
                    ? (proof ? 'Screenshot' : '—')
                    : reference
                      ? `****${reference}`
                      : remark
                        ? 'Remark'
                        : '—'}
                </span>
              </div>
              {proofMode === 'code' && remark && !reference && (
                <div className="summary-row">
                  <span className="summary-row__label">Remark</span>
                  <span
                    className="summary-row__value"
                    style={{ textAlign: 'right', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={remark}
                  >
                    {remark}
                  </span>
                </div>
              )}
              <div className="summary-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <span className="summary-row__label">Total</span>
                <span className="summary-total">{formatPrice(product.price)}</span>
              </div>
            </div>

            <div className="alert alert--success" style={{ marginTop: 20, fontSize: 13 }}>
              <span>🔒</span>
              <span>Your access is released only after an admin verifies your payment.</span>
            </div>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={(file) => { setProofFile(file); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
          onFallback={cameraFallback}
        />
      )}

      <style>{`
        @media (max-width: 860px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}