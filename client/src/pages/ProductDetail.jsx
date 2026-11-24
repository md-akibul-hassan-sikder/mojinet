import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/Loader';
import { formatPrice, discountPercent } from '../utils/currency';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const onBuy = () => {
    if (!user) return navigate('/login', { state: { from: `/product/${id}` } });
    navigate(`/checkout/${id}`);
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="container page">
        <div className="empty">
          <div className="empty__icon">❓</div>
          <h3 className="empty__title">Product not found</h3>
          <p className="empty__text">
            This product may have been removed or is no longer available.
          </p>
          <Link to="/products" className="btn btn--secondary" style={{ marginTop: 20 }}>
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const off = discountPercent(product.price, product.originalPrice);
  const hasOffer = off > 0;

  return (
    <div className="container page product-detail-page">
      <nav className="products-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <Link to="/products">Products</Link>
        <span aria-hidden="true">›</span>
        <span className="products-breadcrumb__current">{product.title}</span>
      </nav>

      <div className="detail">
        <div className="detail__thumb">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
            />
          ) : (
            product.title?.charAt(0)?.toUpperCase() || '★'
          )}
          {hasOffer && (
            <span className="detail__ribbon">-{off}% OFF</span>
          )}
        </div>

        <div className="detail__info">
          <span className="badge badge--info">Available</span>

          <h1 className="detail__title">{product.title}</h1>

          <p className="detail__desc">{product.description}</p>

          <div className="product-specs">
            {product.isLifetime ? (
              <span className="badge badge--lifetime">♾ Lifetime access</span>
            ) : (
              <span className="badge badge--info">⏱ {product.durationDays} days</span>
            )}
            <span className="badge badge--info">
              📱 {product.deviceInfo || 'Unlimited — all devices'}
            </span>
            {product.category && (
              <span className="badge badge--info">{product.category}</span>
            )}
          </div>

          {product.features?.length > 0 && (
            <div className="detail__features">
              <h4 className="detail__features-title">What's included</h4>
              <ul>
                {product.features.map((f, i) => (
                  <li key={i}>
                    <span className="detail__features-check" aria-hidden="true">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="price-block">
            {hasOffer && (
              <div className="price-block__original-row">
                <span className="price-block__original">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="price-block__off">-{off}% OFF</span>
              </div>
            )}
            <div className="detail__price">
              {formatPrice(product.price)} <small>CNY</small>
            </div>
            {hasOffer && (
              <p className="price-block__saving">
                You save {formatPrice(product.originalPrice - product.price)}
              </p>
            )}
          </div>

          <button onClick={onBuy} className="btn btn--primary btn--lg btn--block detail__buy">
            {user ? 'Buy now' : 'Sign in to buy'}
          </button>

          <div className="detail__note">
            <span aria-hidden="true">ℹ️</span>
            <span>
              After checkout, pay via WeChat or Alipay and upload your receipt.
              An admin will verify your payment and release the access details
              to your dashboard.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}