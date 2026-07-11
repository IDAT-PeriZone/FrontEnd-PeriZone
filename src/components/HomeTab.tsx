import { PRODUCTS, CATEGORIES } from '../data/products';
import type { Product, TabId, CategoryId } from '../types';

interface HomeTabProps {
  onNavigate: (tab: TabId, product?: Product) => void;
  onCategoryFilter: (cat: CategoryId) => void;
}

export default function HomeTab({ onNavigate, onCategoryFilter }: HomeTabProps) {
  const featured = PRODUCTS.slice(0, 4);

  const categoryIcons: Record<string, string> = {
    Todos: '🎮',
    Teclados: '⌨️',
    Mouse: '🖱️',
    Headsets: '🎧',
    Webcams: '📷',
    Monitores: '🖥️',
    Accesorios: '🎛️',
  };

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
              Ver ofertas
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-val">+500</span>
              <span className="stat-lbl">Productos</span>
            </div>
            <div className="hero-stat">
              <span className="stat-val">4.8★</span>
              <span className="stat-lbl">Calificación</span>
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
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className="cat-pill"
              onClick={() => { onCategoryFilter(cat as CategoryId); onNavigate('catalogo'); }}
            >
              <span className="cat-icon">{categoryIcons[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="home-section">
        <div className="section-header">
          <h2>Productos destacados</h2>
          <button className="section-link" onClick={() => onNavigate('catalogo')}>Ver todos →</button>
        </div>
        <div className="featured-grid">
          {featured.map(product => (
            <div key={product.id} className="product-card" onClick={() => onNavigate('detalle', product)}>
              {product.badge && <span className="product-badge">{product.badge}</span>}
              <div className="product-card-img">
                <img src={product.mainImage} alt={product.name} />
              </div>
              <div className="product-card-body">
                <span className="product-card-cat">{product.category}</span>
                <h3 className="product-card-name">{product.name}</h3>
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
                  <button className="btn-card-action" onClick={e => { e.stopPropagation(); onNavigate('detalle', product); }}>
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="promo-banner">
        <div className="promo-inner">
          <div>
            <h2>¿Listo para armar tu setup?</h2>
            <p>Explora más de 500 productos con garantía y envío a todo el país.</p>
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
