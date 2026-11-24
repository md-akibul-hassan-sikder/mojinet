import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import ProductCatalog from '../components/ProductCatalog';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    api.get('/products')
      .then((r) => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* unique categories from the fetched products */
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const c = (p.category || '').trim();
      if (c) set.add(c);
    });
    return set.size > 0 ? ['All', ...Array.from(set).sort()] : [];
  }, [products]);

  /* filter + sort */
  const filtered = useMemo(() => {
    let list = [...products];

    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      list = list.filter((p) => (p.category || '').trim() === category);
    }

    if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    else list.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return list;
  }, [products, search, category, sort]);

  const filtersActive = search.trim() || (category && category !== 'All');

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('newest');
  };

  return (
    <div className="container page">
      {/* ── Page head ── */}
      <div className="page-head products-head">
        <div>
          <nav className="products-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>Products</span>
          </nav>
          <h1 className="page-head__title">Our All Plans for You</h1>
          <p className="page-head__sub">
            Pick a plan, pay with WeChat or Alipay, and your access is released within 5 to 10 minutes.
          </p>
        </div>
        {!loading && (
          <span className="products-count">
            {filtered.length} of {products.length} product
            {products.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="products-toolbar">
        {/* Row 1 — search */}
        <div className="products-toolbar__search">
          <span className="products-toolbar__search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>

        {/* Row 2 — chips + sort */}
        <div className="products-toolbar__row2">
          {categories.length > 1 && (
            <div className="products-toolbar__chips" role="tablist">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={category === c}
                  className={`products-chip ${category === c ? 'products-chip--active' : ''
                    }`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <select
            className="input products-toolbar__sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <Loader label="Loading products…" />
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">📦</div>
          <h3 className="empty__title">No products yet</h3>
          <p className="empty__text">Check back soon — new products are added regularly.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">🔍</div>
          <h3 className="empty__title">No products match your filters</h3>
          <p className="empty__text">Try a different search term or category.</p>
          <button
            type="button"
            className="btn btn--secondary"
            style={{ marginTop: 20 }}
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {filtersActive && (
            <div className="products-active-filters">
              <span>
                Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                className="products-active-filters__clear"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
          <ProductCatalog products={filtered} />
        </>
      )}
    </div>
  );
}