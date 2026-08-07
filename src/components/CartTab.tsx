import { useState } from 'react';
import { useCart } from '../context/CartContext';
import type { TabId } from '../types';
import { ApiError } from '../api/client';

interface CartTabProps {
  onNavigate: (tab: TabId) => void;
  onCheckout: () => void;
}

export default function CartTab({ onNavigate, onCheckout }: CartTabProps) {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [error, setError] = useState('');
  const [pending, setPending] = useState<number | null>(null);

  const items = cart?.items ?? [];

  const handleQty = async (idProducto: number, cantidad: number) => {
    setError('');
    setPending(idProducto);
    try {
      await updateItem(idProducto, cantidad);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar la cantidad');
    } finally {
      setPending(null);
    }
  };

  const handleRemove = async (idProducto: number) => {
    setError('');
    setPending(idProducto);
    try {
      await removeItem(idProducto);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el producto');
    } finally {
      setPending(null);
    }
  };

  if (loading && !cart) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Cargando carrito…</h2>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos desde el catálogo para comenzar tu compra.</p>
        <button className="btn-primary" onClick={() => onNavigate('catalogo')}>
          Ir al catálogo
        </button>
      </div>
    );
  }

  const { subtotal, igv: tax, total } = cart!;

  return (
    <div className="cart-page">
      <div className="cart-header-bar">
        <h1>Carrito de compras</h1>
        <span className="cart-item-count">{items.length} producto{items.length > 1 ? 's' : ''}</span>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="cart-layout">
        {/* Items List */}
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id_producto} className="cart-item">
              <div className="cart-item-img">
                <img src={item.imagen_url ?? undefined} alt={item.nombre} />
              </div>
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.nombre}</h3>
                <div className="cart-item-bottom">
                  <div className="qty-control small">
                    <button
                      onClick={() => handleQty(item.id_producto, Math.max(1, item.cantidad - 1))}
                      disabled={item.cantidad <= 1 || pending === item.id_producto}
                    >
                      −
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => handleQty(item.id_producto, Math.min(item.stock, item.cantidad + 1))}
                      disabled={item.cantidad >= item.stock || pending === item.id_producto}
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-total">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                  <button
                    className="cart-remove-btn"
                    onClick={() => handleRemove(item.id_producto)}
                    disabled={pending === item.id_producto}
                    title="Eliminar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="cart-item-unit-price">
                <span className="unit-label">Precio unitario</span>
                <span className="unit-price">S/ {item.precio.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="order-summary">
          <h2>Resumen del pedido</h2>
          <div className="summary-lines">
            {items.map(item => (
              <div key={item.id_producto} className="summary-line">
                <span className="summary-line-name">{item.nombre} ×{item.cantidad}</span>
                <span>S/ {(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="summary-divider" />
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Impuestos (IGV 18%)</span>
              <span>S/ {tax.toFixed(2)}</span>
            </div>
          </div>
          <hr className="summary-divider" />
          <div className="summary-total-row">
            <span>TOTAL</span>
            <span className="summary-total-price">S/ {total.toFixed(2)}</span>
          </div>
          <button className="btn-checkout" onClick={onCheckout}>
            FINALIZAR CON LA COMPRA
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="btn-continue" onClick={() => onNavigate('catalogo')}>
            Continuar comprando
          </button>
        </aside>
      </div>
    </div>
  );
}
