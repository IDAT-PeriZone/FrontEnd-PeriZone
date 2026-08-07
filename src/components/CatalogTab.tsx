import { useState, useMemo } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
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
  const { categories } = useCategories();
  const { products, loading, error } = useProducts();
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const categoryName = (id: number) => categories.find(c => c.id === id)?.nombre ?? '';
  const range = PRICE_RANGES[priceRange];

  const filtered = useMemo(() => {
    let result = [...products];
    if (categoryFilter !== 'Todos') result = result.filter(p => p.id_categoria === categoryFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => p.nombre.toLowerCase().includes(q) || (p.descripcion ?? '').toLowerCase().includes(q)
      );
    }
    result = result.filter(p => p.precio >= range.min && p.precio <= range.max);
    if (sortBy === 'price-asc') result.sort((a, b) => a.precio - b.precio);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.precio - a.precio);
    return result;
  }, [products, categoryFilter, searchQuery, sortBy, range.min, range.max]);

  return (
    <div className="catalog-tab">
      {/* Sidebar */}
      <aside className="catalog-sidebar">
        <div className="sidebar-section">
          <h3>Categoría</h3>
          <ul className="sidebar-cat-list">
            <li>
              <button
                className={`sidebar-cat-btn ${categoryFilter === 'Todos' ? 'active' : ''}`}
                onClick={() => onCategoryFilter('Todos')}
              >
                <span>Todos</span>
                <span className="cat-count">{products.length}</span>
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <button
                  className={`sidebar-cat-btn ${categoryFilter === cat.id ? 'active' : ''}`}
                  onClick={() => onCategoryFilter(cat.id)}
                >
                  <span>{cat.nombre}</span>
                  <span className="cat-count">{products.filter(p => p.id_categoria === cat.id).length}</span>
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
      </aside>

      {/* Main Content */}
      <main className="catalog-main">
        <div className="catalog-toolbar">
          <div className="catalog-results-label">
            <span className="results-count">{filtered.length} productos</span>
            {categoryFilter !== 'Todos' && (
              <span className="filter-tag">
                {categoryName(categoryFilter)}
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
            </select>
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        {loading ? (
          <div className="empty-state">
            <p>Cargando productos…</p>
          </div>
        ) : filtered.length === 0 ? (
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
                <div className="product-card-img">
                  <img src={product.imagen_url ?? undefined} alt={product.nombre} />
                </div>
                <div className="product-card-body">
                  <span className="product-card-cat">{categoryName(product.id_categoria)}</span>
                  <h3 className="product-card-name">{product.nombre}</h3>
                  <p className="product-card-desc">{product.descripcion}</p>
                  <div className="product-card-footer">
                    <div className="product-card-price">
                      <span className="price-main">S/ {product.precio.toFixed(2)}</span>
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
