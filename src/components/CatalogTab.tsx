import { useState, useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import type { Product, TabId, CategoryId } from '../types';

interface CatalogTabProps {
  onNavigate: (tab: TabId, product?: Product) => void;
  searchQuery: string;
  categoryFilter: CategoryId;
  onCategoryFilter: (cat: CategoryId) => void;
}

const PRICE_RANGES = [
  { label: 'Todos los precios', min: 0, max: Infinity },
  { label: 'S/ 0 - S/ 100', min: 0, max: 100 },
  { label: 'S/ 100 - S/ 200', min: 100, max: 200 },
  { label: 'S/ 200 - S/ 500', min: 200, max: 500 },
  { label: 'S/ 500+', min: 500, max: Infinity },
];

export default function CatalogTab({ onNavigate, searchQuery, categoryFilter, onCategoryFilter }: CatalogTabProps) {
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  const range = PRICE_RANGES[priceRange];

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];
    if (categoryFilter !== 'Todos') result = result.filter(p => p.category === categoryFilter);
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    result = result.filter(p => p.price >= range.min && p.price <= range.max);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [categoryFilter, searchQuery, priceRange, sortBy, range.min, range.max]);

  return (
    <div className="catalog-tab">
      {/* Sidebar */}
      <aside className="catalog-sidebar">
        <div className="sidebar-section">
          <h3>Categoría</h3>
          <ul className="sidebar-cat-list">
            {CATEGORIES.map(cat => (
              <li key={cat}>
                <button
                  className={`sidebar-cat-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => onCategoryFilter(cat as CategoryId)}
                >
                  <span>{cat}</span>
                  <span className="cat-count">
                    {cat === 'Todos' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Precio</h3>
          <ul className="sidebar-cat-list">
            {PRICE_RANGES.map((r, i) => (
              <li key={r.label}>
                <button
                  className={`sidebar-cat-btn ${priceRange === i ? 'active' : ''}`}
                  onClick={() => setPriceRange(i)}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Disponibilidad</h3>
          <label className="sidebar-check">
            <input type="checkbox" defaultChecked />
            En stock
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="catalog-main">
        <div className="catalog-toolbar">
          <div className="catalog-results-label">
            <span className="results-count">{filtered.length} productos</span>
            {categoryFilter !== 'Todos' && (
              <span className="filter-tag">
                {categoryFilter}
                <button onClick={() => onCategoryFilter('Todos')}>×</button>
              </span>
            )}
          </div>
          <div className="catalog-sort">
            <label>Ordenar:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
              <option value="default">Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor calificación</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span>🔍</span>
            <p>No se encontraron productos con los filtros aplicados.</p>
            <button className="btn-outline" onClick={() => { onCategoryFilter('Todos'); setPriceRange(0); }}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {filtered.map(product => (
              <div key={product.id} className="product-card" onClick={() => onNavigate('detalle', product)}>
                {product.badge && <span className="product-badge">{product.badge}</span>}
                <div className="product-card-img">
                  <img src={product.mainImage} alt={product.name} />
                </div>
                <div className="product-card-body">
                  <span className="product-card-cat">{product.category}</span>
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-desc">{product.shortDescription}</p>
                  <div className="product-card-rating">
                    {'★'.repeat(Math.floor(product.rating))}
                    <span className="rating-val">{product.rating}</span>
                    <span className="rating-count">({product.reviewCount})</span>
                  </div>
                  <div className="product-card-footer">
                    <div className="product-card-price">
                      <span className="price-main">S/ {product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="price-original">S/ {product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-stock'}`}>
                      {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Últimas ${product.stock}` : 'Agotado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
