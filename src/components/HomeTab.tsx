import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import type { Product, TabId, CategoryId } from '../types';

interface HomeTabProps {
  onNavigate: (tab: TabId, product?: Product) => void;
  onCategoryFilter: (cat: CategoryId) => void;
}

function categoryIcon(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes('teclado')) return '⌨️';
  if (n.includes('mouse')) return '🖱️';
  if (n.includes('headset') || n.includes('audíf') || n.includes('audif')) return '🎧';
  if (n.includes('webcam')) return '📷';
  if (n.includes('monitor')) return '🖥️';
  return '🎛️';
}

export default function HomeTab({ onNavigate, onCategoryFilter }: HomeTabProps) {
  const { categories, loading: loadingCats } = useCategories();
  const { products, loading: loadingProducts, error } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <div className="home-tab">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎮 Gaming Peripherals Store</div>
          <h1 className="hero-title">
            Encuentra Los Mejores<br />
            <span className="gradient-text">Periféricos</span> Para Tu Setup
          </h1>
          <p className="hero-subtitle">
            Compra teclados, mouses, headsets, accesorios y monitores<br />
            con stock actualizado y atención personalizada.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => onNavigate('catalogo')}>
              Ver catálogo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn-outline" onClick={() => onNavigate('catalogo')}>
              Ver catálogo completo
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-val">{products.length || '—'}</span>
              <span className="stat-lbl">Productos</span>
            </div>
            <div className="hero-stat">
              <span className="stat-val">{categories.length || '—'}</span>
              <span className="stat-lbl">Categorías</span>
            </div>
            <div className="hero-stat">
              <span className="stat-val">24h</span>
              <span className="stat-lbl">Envío rápido</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow-ring" />
          <img src="/keyboard.png" alt="Gaming Keyboard" className="hero-img" />
        </div>
      </section>

      {/* Categories */}
      <section className="home-section">
        <div className="section-header">
          <h2>Categorías destacadas</h2>
          <button className="section-link" onClick={() => onNavigate('catalogo')}>Ver todas →</button>
        </div>
        {loadingCats ? (
          <p className="catalog-results-label">Cargando categorías…</p>
        ) : (
          <div className="category-pills">
            <button className="cat-pill" onClick={() => { onCategoryFilter('Todos'); onNavigate('catalogo'); }}>
              <span className="cat-icon">🎮</span>
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className="cat-pill"
                onClick={() => { onCategoryFilter(cat.id); onNavigate('catalogo'); }}
              >
                <span className="cat-icon">{categoryIcon(cat.nombre)}</span>
                {cat.nombre}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="home-section">
        <div className="section-header">
          <h2>Productos destacados</h2>
          <button className="section-link" onClick={() => onNavigate('catalogo')}>Ver todos →</button>
        </div>
        {error && <p className="field-error">{error}</p>}
        {loadingProducts ? (
          <p className="catalog-results-label">Cargando productos…</p>
        ) : (
          <div className="featured-grid">
            {featured.map(product => (
              <div key={product.id} className="product-card" onClick={() => onNavigate('detalle', product)}>
                <div className="product-card-img">
                  <img src={product.imagen_url ?? undefined} alt={product.nombre} />
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-name">{product.nombre}</h3>
                  <div className="product-card-footer">
                    <div className="product-card-price">
                      <span className="price-main">S/ {product.precio.toFixed(2)}</span>
                    </div>
                    <button className="btn-card-action" onClick={e => { e.stopPropagation(); onNavigate('detalle', product); }}>
                      Ver detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Banner CTA */}
      <section className="promo-banner">
        <div className="promo-inner">
          <div>
            <h2>¿Listo para armar tu setup?</h2>
            <p>Explora el catálogo completo con stock y precios en tiempo real.</p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('catalogo')}>
            Ir al catálogo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
