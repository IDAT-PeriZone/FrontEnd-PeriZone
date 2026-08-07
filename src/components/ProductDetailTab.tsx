import { useEffect, useState } from 'react';
import type { Product, TabId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCategories } from '../hooks/useCategories';
import * as productosApi from '../api/productos';
import { ApiError, getToken } from '../api/client';
import AuthModal from './AuthModal';

interface ProductDetailTabProps {
  product: Product;
  onNavigate: (tab: TabId) => void;
}

export default function ProductDetailTab({ product: initialProduct, onNavigate }: ProductDetailTabProps) {
  const { usuario } = useAuth();
  const { addItem } = useCart();
  const { categories } = useCategories();

  const [product, setProduct] = useState<Product>(initialProduct);
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset local UI state when navigating to a different product
    setQty(1);
    setActiveThumb(0);
    setProduct(initialProduct);
    productosApi.obtener(initialProduct.id).then(setProduct).catch(() => {});
  }, [initialProduct]);

  const categoryName = categories.find(c => c.id === product.id_categoria)?.nombre ?? '';
  const gallery = product.imagenes?.length
    ? [product.imagen_url, ...product.imagenes.map(i => i.imagen_url)].filter((v): v is string => !!v)
    : [product.imagen_url].filter((v): v is string => !!v);

  const handleAdd = async () => {
    if (!getToken()) {
      setShowAuthModal(true);
      return;
    }
    setAddError('');
    setAdding(true);
    try {
      await addItem(product.id, qty);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : 'No se pudo agregar el producto al carrito');
    } finally {
      setAdding(false);
    }
  };

  const stockStatus = product.stock > 10
    ? { label: 'En stock', cls: 'in-stock' }
    : product.stock > 0
      ? { label: `Solo ${product.stock} disponibles`, cls: 'low-stock' }
      : { label: 'Agotado', cls: 'out-stock' };

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => onNavigate('inicio')}>Inicio</button>
        <span>/</span>
        <button onClick={() => onNavigate('catalogo')}>Catálogo</button>
        <span>/</span>
        <span>{categoryName}</span>
        <span>/</span>
        <span className="breadcrumb-current">{product.nombre}</span>
      </div>

      <div className="detail-layout">
        {/* Gallery */}
        <div className="detail-gallery">
          <div className="gallery-main">
            <img src={gallery[activeThumb] ?? gallery[0]} alt={product.nombre} />
          </div>
          {gallery.length > 1 && (
            <div className="gallery-thumbs">
              {gallery.map((thumb, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${activeThumb === i ? 'active' : ''}`}
                  onClick={() => setActiveThumb(i)}
                >
                  <img src={thumb} alt={`${product.nombre} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="detail-info">
          <span className="detail-category">{categoryName}</span>
          <h1 className="detail-title">{product.nombre}</h1>

          {/* Price */}
          <div className="detail-price-block">
            <span className="detail-price">S/ {product.precio.toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div className={`detail-stock ${stockStatus.cls}`}>
            <span className="stock-dot" />
            {stockStatus.label}
          </div>

          {/* Description */}
          <p className="detail-short-desc">{product.descripcion}</p>

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
              disabled={product.stock === 0 || adding}
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
                  {adding ? 'Agregando…' : 'Agregar al carrito'}
                </>
              )}
            </button>
          </div>
          {addError && <p className="field-error">{addError}</p>}
          {!usuario && <p className="catalog-results-label">Inicia sesión para agregar productos al carrito.</p>}

          <button className="btn-back" onClick={() => onNavigate('catalogo')}>
            ← Volver al catálogo
          </button>

          {/* Specs Accordion */}
          <div className="specs-accordion">
            <button className="specs-toggle" onClick={() => setShowSpecs(s => !s)}>
              <span>Detalles del producto</span>
              <span className="toggle-icon">{showSpecs ? '▲' : '▼'}</span>
            </button>
            {showSpecs && (
              <div className="specs-content">
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <td className="spec-label">Categoría</td>
                      <td className="spec-value">{categoryName}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Stock disponible</td>
                      <td className="spec-value">{product.stock} unidades</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={handleAdd} />
      )}
    </div>
  );
}
