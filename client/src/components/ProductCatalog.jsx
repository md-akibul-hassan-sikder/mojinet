import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from './Loader';
import { formatPrice, discountPercent } from '../utils/currency';

export default function ProductCatalog({ limit, products: externalProducts }) {
  const [fetched, setFetched] = useState([]);
  const [loading, setLoading] = useState(!externalProducts);

  useEffect(() => {
    if (externalProducts) return;
    api.get('/products')
      .then((res) => setFetched(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [externalProducts]);

  const products = externalProducts || fetched;
  const items = typeof limit === 'number' ? products.slice(0, limit) : products;

  if (loading) return <Loader label="Loading products…" />;

  if (items.length === 0) {
    return (
      <div className="empty">
        <div className="empty__icon">📦</div>
        <h3 className="empty__title">No products yet</h3>
        <p className="empty__text">Check back soon — new products are added regularly.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {items.map((p) => {
        const off = discountPercent(p.price, p.originalPrice);
        const hasOffer = off > 0;

        return (
          <Link
            key={p._id}
            to={`/product/${p._id}`}
            className="product-card"
            style={{ color: 'inherit' }}
          >
            <div className="product-card__thumb">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                p.title?.charAt(0)?.toUpperCase() || '★'
              )}
              {hasOffer && (
                <span className="product-card__ribbon">-{off}% OFF</span>
              )}
              {p.isLifetime && (
                <span className="product-card__lifetime">♾ Lifetime</span>
              )}
            </div>

            <div className="product-card__body">
              <h3 className="product-card__title">{p.title}</h3>
              <p className="product-card__desc">{p.description}</p>

              <div className="product-card__foot">
                <div className="product-card__price-block">
                  {hasOffer && (
                    <div className="price-stack__row">
                      <span className="price-stack__original">
                        {formatPrice(p.originalPrice)}
                      </span>
                      <span className="price-stack__off">-{off}%</span>
                    </div>
                  )}
                  <div className="product-card__price">
                    {formatPrice(p.price)} <small>CNY</small>
                  </div>
                  <div className="product-card__meta">
                    {p.isLifetime ? '♾ Lifetime' : `${p.durationDays}d`}
                    {' · '}
                    {p.deviceInfo || 'Unlimited'}
                  </div>
                </div>
                <span className="btn btn--primary btn--sm">Buy</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}