import { useState } from 'react';
import type { Product, TabId } from '../types';

interface ProductDetailTabProps {
  product: Product;
  onNavigate: (tab: TabId) => void;
  onAddToCart: (product: Product, qty: number) => void;
}

export default function ProductDetailTab({ product, onNavigate, onAddToCart }: ProductDetailTabProps) {
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, qty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const stockStatus = product.stock > 10
    ? { label: 'En stock', cls: 'in-stock' }
    : product.stock > 0
      ? { label: `Solo ${product.stock} disponibles`, cls: 'low-stock' }
      : { label: 'Agotado', cls: 'out-stock' };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => onNavigate('inicio')}>Inicio</button>
        <span>/</span>
        <button onClick={() => onNavigate('catalogo')}>Catálogo</button>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="detail-layout">
        {/* Gallery */}
        <div className="detail-gallery">
          <div className="gallery-main">
            <img src={product.thumbnails[activeThumb] || product.mainImage} alt={product.name} />
            {discount && <span className="gallery-discount">-{discount}%</span>}
          </div>
          <div className="gallery-thumbs">
            {product.thumbnails.map((thumb, i) => (
              <button
                key={i}
                className={`gallery-thumb ${activeThumb === i ? 'active' : ''}`}
                onClick={() => setActiveThumb(i)}
              >
                <img src={thumb} alt={`${product.name} ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <h1 className="detail-title">{product.name}</h1>

          {/* Rating */}
          <div className="detail-rating">
            <span className="stars">{'★'.repeat(Math.floor(product.rating))}</span>
            <span className="rating-num">{product.rating}</span>
            <span className="rating-reviews">({product.reviewCount} reseñas)</span>
          </div>

          {/* Price */}
          <div className="detail-price-block">
            <span className="detail-price">S/ {product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="detail-original">S/ {product.originalPrice.toFixed(2)}</span>
                <span className="detail-save">Ahorras S/ {(product.originalPrice - product.price).toFixed(2)}</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`detail-stock ${stockStatus.cls}`}>
            <span className="stock-dot" />
            {stockStatus.label}
          </div>

          {/* Short Description */}
          <p className="detail-short-desc">{product.shortDescription}</p>

          {/* Quantity + Add to cart */}
          <div className="detail-actions">
            <div className="qty-control">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
            </div>
            <button
              className={`btn-add-cart ${addedFeedback ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={product.stock === 0}
            >
              {addedFeedback ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  ¡Agregado!
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Agregar al carrito
                </>
              )}
            </button>
          </div>

          <button className="btn-back" onClick={() => onNavigate('catalogo')}>
            ← Volver al catálogo
          </button>

          {/* Specs Accordion */}
          <div className="specs-accordion">
            <button className="specs-toggle" onClick={() => setShowSpecs(s => !s)}>
              <span>Descripción detallada y especificaciones</span>
              <span className="toggle-icon">{showSpecs ? '▲' : '▼'}</span>
            </button>
            {showSpecs && (
              <div className="specs-content">
                <p className="specs-long-desc">{product.longDescription}</p>
                <table className="specs-table">
                  <tbody>
                    {product.specs.map(spec => (
                      <tr key={spec.label}>
                        <td className="spec-label">{spec.label}</td>
                        <td className="spec-value">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
