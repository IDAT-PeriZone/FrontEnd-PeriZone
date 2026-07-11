import type { CartItem, TabId } from '../types';

interface CartTabProps {
  cartItems: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onNavigate: (tab: TabId) => void;
  onCheckout: () => void;
}

const SHIPPING_RATE = 15.00;
const TAX_RATE = 0.18;

export default function CartTab({ cartItems, onUpdateQty, onRemove, onNavigate, onCheckout }: CartTabProps) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? SHIPPING_RATE : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
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

  return (
    <div className="cart-page">
      <div className="cart-header-bar">
        <h1>Carrito de compras</h1>
        <span className="cart-item-count">{cartItems.length} producto{cartItems.length > 1 ? 's' : ''}</span>
      </div>

      <div className="cart-layout">
        {/* Items List */}
        <div className="cart-items">
          {cartItems.map(({ product, quantity }) => (
            <div key={product.id} className="cart-item">
              <div className="cart-item-img">
                <img src={product.mainImage} alt={product.name} />
              </div>
              <div className="cart-item-details">
                <span className="cart-item-cat">{product.category}</span>
                <h3 className="cart-item-name"
                  onClick={() => onNavigate('detalle')}
                  style={{ cursor: 'pointer' }}
                >
                  {product.name}
                </h3>
                <p className="cart-item-desc">{product.shortDescription}</p>
                <div className="cart-item-bottom">
                  <div className="qty-control small">
                    <button onClick={() => onUpdateQty(product.id, Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => onUpdateQty(product.id, Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>+</button>
                  </div>
                  <span className="cart-item-total">S/ {(product.price * quantity).toFixed(2)}</span>
                  <button className="cart-remove-btn" onClick={() => onRemove(product.id)} title="Eliminar">
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
                <span className="unit-price">S/ {product.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="order-summary">
          <h2>Resumen del pedido</h2>
          <div className="summary-lines">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="summary-line">
                <span className="summary-line-name">{product.name} ×{quantity}</span>
                <span>S/ {(product.price * quantity).toFixed(2)}</span>
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
              <span>Envío</span>
              <span>S/ {shipping.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Impuestos (18%)</span>
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
