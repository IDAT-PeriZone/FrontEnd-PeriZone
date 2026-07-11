import { useState } from 'react';
import type {
  CartItem,
  TabId,
  CheckoutUserInfo,
  ShippingAddressInfo,
  ShippingMethod,
  PaymentMethod,
  OrderDetails,
} from '../types';

/* ── Constants ── */
const SHIPPING_RATE = 15.0;
const TAX_RATE = 0.18;

interface CheckoutTabProps {
  cartItems: CartItem[];
  onNavigate: (tab: TabId) => void;
  onOrderComplete: (order: OrderDetails) => void;
}

/* ════════════════════════════════════════════
   STEP INDICATOR
════════════════════════════════════════════ */
function StepIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: 'Acceso / Registro' },
    { num: 2, label: 'Dirección' },
    { num: 3, label: 'Método de Envío' },
    { num: 4, label: 'Pago' },
    { num: 5, label: 'Confirmación' },
  ];
  return (
    <div className="checkout-steps">
      {steps.map((s, i) => (
        <div key={s.num} className={`step-item ${step >= s.num ? (step === s.num ? 'active' : 'done') : ''}`}>
          <div className="step-circle">
            {step > s.num ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              s.num
            )}
          </div>
          <span className="step-label">{s.label}</span>
          {i < steps.length - 1 && <div className={`step-connector ${step > s.num ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   ORDER SUMMARY SIDEBAR
════════════════════════════════════════════ */
function OrderSummarySidebar({
  cartItems,
  shippingMethod,
}: {
  cartItems: CartItem[];
  shippingMethod: ShippingMethod;
}) {
  const subtotal = cartItems.reduce((a, i) => a + i.product.price * i.quantity, 0);
  const shipping = shippingMethod === 'delivery' ? SHIPPING_RATE : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  return (
    <aside className="checkout-sidebar">
      <h3 className="sidebar-title">Resumen del Pedido</h3>
      <div className="sidebar-items">
        {cartItems.map(({ product, quantity }) => (
          <div key={product.id} className="sidebar-item">
            <div className="sidebar-item-img">
              <img src={product.mainImage} alt={product.name} />
              <span className="sidebar-item-qty">{quantity}</span>
            </div>
            <div className="sidebar-item-info">
              <span className="sidebar-item-name">{product.name}</span>
            </div>
            <span className="sidebar-item-price">S/ {(product.price * quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="sidebar-divider" />
      <div className="sidebar-totals">
        <div className="sidebar-row">
          <span>Subtotal</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>
        <div className="sidebar-row">
          <span>Envío {shippingMethod === 'pickup' ? '(Recojo)' : '(Delivery)'}</span>
          <span>{shippingMethod === 'pickup' ? 'Gratis' : `S/ ${shipping.toFixed(2)}`}</span>
        </div>
        <div className="sidebar-row">
          <span>Impuestos (18%)</span>
          <span>S/ {tax.toFixed(2)}</span>
        </div>
        <div className="sidebar-divider" />
        <div className="sidebar-row total-row">
          <span>Total</span>
          <span className="sidebar-total-price">S/ {total.toFixed(2)}</span>
        </div>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════
   STEP 1: ACCESO / REGISTRO
════════════════════════════════════════════ */
function Step1Login({
  onNext,
}: {
  onNext: (user: CheckoutUserInfo) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', telefono: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.includes('@')) e.email = 'Correo inválido';
    if (!form.password) e.password = 'Ingresa tu contraseña';
    if (mode === 'register') {
      if (!form.nombre) e.nombre = 'Requerido';
      if (!form.apellidos) e.apellidos = 'Requerido';
      if (!form.telefono) e.telefono = 'Requerido';
      if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const nombre = mode === 'register' ? form.nombre : form.email.split('@')[0];
    onNext({ nombre, apellidos: form.apellidos, email: form.email, telefono: form.telefono });
  };

  return (
    <div className="step1-grid">
      {/* Login Panel */}
      <div className={`auth-panel ${mode === 'login' ? 'auth-panel--active' : ''}`} onClick={() => setMode('login')}>
        <h2 className="auth-panel-title">Iniciar Sesión</h2>
        <p className="auth-panel-sub">¿Ya tienes cuenta? Ingresa con tus credenciales.</p>
        <div className="auth-fields">
          <label>Dirección de correo</label>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            onClick={e => { e.stopPropagation(); setMode('login'); }}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••••••"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            onClick={e => { e.stopPropagation(); setMode('login'); }}
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
          <button className="auth-forgot">¿Olvidaste tu contraseña?</button>
        </div>
        {mode === 'login' && (
          <button className="btn-auth-submit" onClick={handleSubmit}>CONTINUAR</button>
        )}
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span>o</span>
      </div>

      {/* Register Panel */}
      <div className={`auth-panel ${mode === 'register' ? 'auth-panel--active' : ''}`} onClick={() => setMode('register')}>
        <h2 className="auth-panel-title">Registrarse</h2>
        <p className="auth-panel-sub">¿Primera vez? Crea tu cuenta en segundos.</p>
        <div className="auth-fields">
          <div className="field-row">
            <div>
              <label>Nombres</label>
              <input
                type="text"
                placeholder="María"
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                onClick={e => { e.stopPropagation(); setMode('register'); }}
                className={errors.nombre ? 'input-error' : ''}
              />
              {errors.nombre && <span className="field-error">{errors.nombre}</span>}
            </div>
            <div>
              <label>Apellidos</label>
              <input
                type="text"
                placeholder="García Ríos"
                value={form.apellidos}
                onChange={e => set('apellidos', e.target.value)}
                onClick={e => { e.stopPropagation(); setMode('register'); }}
                className={errors.apellidos ? 'input-error' : ''}
              />
              {errors.apellidos && <span className="field-error">{errors.apellidos}</span>}
            </div>
          </div>
          <label>Apellido materno</label>
          <input
            type="text"
            placeholder="Ríos"
            onClick={e => { e.stopPropagation(); setMode('register'); }}
          />
          <label>Teléfono</label>
          <input
            type="tel"
            placeholder="+51 999 888 777"
            value={form.telefono}
            onChange={e => set('telefono', e.target.value)}
            onClick={e => { e.stopPropagation(); setMode('register'); }}
            className={errors.telefono ? 'input-error' : ''}
          />
          {errors.telefono && <span className="field-error">{errors.telefono}</span>}
          <div className="field-row">
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onClick={e => { e.stopPropagation(); setMode('register'); }}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div>
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                onClick={e => { e.stopPropagation(); setMode('register'); }}
              />
            </div>
          </div>
          <label>Confirmar Contraseña</label>
          <input
            type="password"
            placeholder="••••••"
            value={form.confirm}
            onChange={e => set('confirm', e.target.value)}
            onClick={e => { e.stopPropagation(); setMode('register'); }}
            className={errors.confirm ? 'input-error' : ''}
          />
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </div>
        {mode === 'register' && (
          <button className="btn-auth-submit" onClick={handleSubmit}>REGISTRAR Y CONTINUAR</button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   STEP 2: DIRECCIÓN DE ENVÍO
════════════════════════════════════════════ */
function Step2Address({
  userInfo,
  initial,
  onNext,
  onBack,
  cartItems,
  shippingMethod,
}: {
  userInfo: CheckoutUserInfo;
  initial: ShippingAddressInfo | null;
  onNext: (a: ShippingAddressInfo) => void;
  onBack: () => void;
  cartItems: CartItem[];
  shippingMethod: ShippingMethod;
}) {
  const [form, setForm] = useState<ShippingAddressInfo>(
    initial ?? {
      nombre: userInfo.nombre,
      apellidos: userInfo.apellidos,
      telefono: userInfo.telefono,
      pais: 'Perú',
      ciudad: 'Lima',
      distrito: 'San Miguel',
      email: userInfo.email,
      direccion: '',
      referencia: '',
      dni: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof ShippingAddressInfo, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre) e.nombre = 'Requerido';
    if (!form.apellidos) e.apellidos = 'Requerido';
    if (!form.telefono) e.telefono = 'Requerido';
    if (!form.direccion) e.direccion = 'Requerido';
    if (!form.distrito) e.distrito = 'Requerido';
    if (!form.dni) e.dni = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const distritos = [
    'Barranco', 'Breña', 'Chorrillos', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos',
    'Magdalena del Mar', 'Miraflores', 'Pueblo Libre', 'San Borja', 'San Isidro',
    'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Miguel', 'Santiago de Surco',
    'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo',
  ];

  return (
    <div className="checkout-layout">
      <div className="checkout-form-area">
        <h2 className="step-title">2. Dirección de Entrega</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombres *</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} className={errors.nombre ? 'input-error' : ''} />
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>
          <div className="form-group">
            <label>País</label>
            <input value={form.pais} onChange={e => set('pais', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Apellidos *</label>
            <input value={form.apellidos} onChange={e => set('apellidos', e.target.value)} className={errors.apellidos ? 'input-error' : ''} />
            {errors.apellidos && <span className="field-error">{errors.apellidos}</span>}
          </div>
          <div className="form-group">
            <label>Ciudad/Provincia</label>
            <input value={form.ciudad} onChange={e => set('ciudad', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Teléfono *</label>
            <input value={form.telefono} onChange={e => set('telefono', e.target.value)} className={errors.telefono ? 'input-error' : ''} />
            {errors.telefono && <span className="field-error">{errors.telefono}</span>}
          </div>
          <div className="form-group">
            <label>Distrito *</label>
            <select value={form.distrito} onChange={e => set('distrito', e.target.value)} className={errors.distrito ? 'input-error' : ''}>
              {distritos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.distrito && <span className="field-error">{errors.distrito}</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Referencia</label>
            <input value={form.referencia} onChange={e => set('referencia', e.target.value)} placeholder="Ej: Frente al parque" />
          </div>
          <div className="form-group form-group--full">
            <label>Dirección Completa *</label>
            <input value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Las Palmeras 123, Dpto. 4B" className={errors.direccion ? 'input-error' : ''} />
            {errors.direccion && <span className="field-error">{errors.direccion}</span>}
          </div>
          <div className="form-group">
            <label>DNI / CE *</label>
            <input value={form.dni} onChange={e => set('dni', e.target.value)} placeholder="12345678" className={errors.dni ? 'input-error' : ''} maxLength={12} />
            {errors.dni && <span className="field-error">{errors.dni}</span>}
          </div>
        </div>
        <div className="step-nav">
          <button className="btn-outline" onClick={onBack}>← Volver</button>
          <button className="btn-checkout" onClick={() => { if (validate()) onNext(form); }}>
            GUARDAR Y CONTINUAR
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <OrderSummarySidebar cartItems={cartItems} shippingMethod={shippingMethod} />
    </div>
  );
}

/* ════════════════════════════════════════════
   STEP 3: MÉTODO DE ENVÍO
════════════════════════════════════════════ */
function Step3Shipping({
  address,
  shippingMethod,
  onMethodChange,
  onNext,
  onBack,
  cartItems,
}: {
  address: ShippingAddressInfo;
  shippingMethod: ShippingMethod;
  onMethodChange: (m: ShippingMethod) => void;
  onNext: () => void;
  onBack: () => void;
  cartItems: CartItem[];
}) {
  return (
    <div className="checkout-layout">
      <div className="checkout-form-area">
        <h2 className="step-title">3. Método de Envío Y Dirección</h2>

        <div className="shipping-options">
          <label className={`shipping-option ${shippingMethod === 'delivery' ? 'shipping-option--active' : ''}`} onClick={() => onMethodChange('delivery')}>
            <div className="shipping-option-left">
              <input type="radio" readOnly checked={shippingMethod === 'delivery'} />
              <div>
                <strong>Delivery Estándar</strong>
                <span className="shipping-sub">(Lima Metropolitana)</span>
              </div>
            </div>
            <div className="shipping-meta">
              <span className="shipping-price">S/ 15.00</span>
              <span className="shipping-eta">2-3 días hábiles</span>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 5v3h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </label>

          <label className={`shipping-option ${shippingMethod === 'pickup' ? 'shipping-option--active' : ''}`} onClick={() => onMethodChange('pickup')}>
            <div className="shipping-option-left">
              <input type="radio" readOnly checked={shippingMethod === 'pickup'} />
              <div>
                <strong>Recojo en Tienda</strong>
                <span className="shipping-sub">(Surco)</span>
              </div>
            </div>
            <div className="shipping-meta">
              <span className="shipping-price shipping-free">GRATIS</span>
              <span className="shipping-eta">Disponible hoy</span>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </label>
        </div>

        <div className="address-confirm-box">
          <div className="address-confirm-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Dirección de Entrega</span>
          </div>
          <p className="address-confirm-text">
            {address.nombre} {address.apellidos}<br />
            {address.direccion}<br />
            {address.distrito}, {address.ciudad} — {address.pais}<br />
            {address.referencia && <>{address.referencia}<br /></>}
            Tel: {address.telefono}
          </p>
        </div>

        {shippingMethod === 'delivery' && (
          <div className="receptor-section">
            <h3 className="receptor-title">Datos del Receptor</h3>
            <div className="receptor-grid">
              <div className="form-group">
                <label>Nombre del Receptor</label>
                <input defaultValue={`${address.nombre} ${address.apellidos}`} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input defaultValue={address.telefono} />
              </div>
              <div className="form-group">
                <label>Distrito</label>
                <input defaultValue={address.distrito} readOnly />
              </div>
              <div className="form-group">
                <label>Referencia / Indicaciones</label>
                <input defaultValue={address.referencia} placeholder="Ej: Timbre 2" />
              </div>
            </div>
          </div>
        )}

        <div className="step-nav">
          <button className="btn-outline" onClick={onBack}>← Volver</button>
          <button className="btn-checkout btn-lime" onClick={onNext}>
            CONFIRMAR DIRECCIÓN Y ENVÍO
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <OrderSummarySidebar cartItems={cartItems} shippingMethod={shippingMethod} />
    </div>
  );
}

/* ════════════════════════════════════════════
   STEP 4: PAGO
════════════════════════════════════════════ */
function formatCardNumber(val: string) {
  return val
    .replace(/\D/g, '')
    .substring(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}
function formatExpiry(val: string) {
  return val
    .replace(/\D/g, '')
    .substring(0, 4)
    .replace(/^(\d{2})(\d)/, '$1/$2');
}

function Step4Payment({
  paymentMethod,
  onMethodChange,
  onNext,
  onBack,
  cartItems,
  shippingMethod,
}: {
  paymentMethod: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
  cartItems: CartItem[];
  shippingMethod: ShippingMethod;
}) {
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);

  const subtotal = cartItems.reduce((a, i) => a + i.product.price * i.quantity, 0);
  const shipping = shippingMethod === 'delivery' ? SHIPPING_RATE : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  return (
    <div className="checkout-layout">
      <div className="checkout-form-area">
        <h2 className="step-title">4. Método de Pago</h2>

        {/* Payment Method Selector */}
        <div className="payment-tabs">
          {[
            { id: 'digital_wallet', icon: '📱', label: 'Billetera Digital (Yape / Plin)' },
            { id: 'card', icon: '💳', label: 'Tarjeta de Crédito / Débito' },
            { id: 'cash', icon: '🏦', label: 'Pago Efectivo' },
          ].map(m => (
            <button
              key={m.id}
              className={`payment-tab ${paymentMethod === m.id ? 'payment-tab--active' : ''}`}
              onClick={() => onMethodChange(m.id as PaymentMethod)}
            >
              <span className="payment-tab-icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Digital Wallet */}
        {paymentMethod === 'digital_wallet' && (
          <div className="payment-panel">
            <div className="qr-section">
              <div className="qr-wallet-logos">
                <span className="wallet-badge wallet-yape">Yape</span>
                <span className="wallet-slash">/</span>
                <span className="wallet-badge wallet-plin">Plin</span>
              </div>
              <p className="qr-instruction">Escanea el código QR con tu app para pagar</p>
              <div className="qr-container">
                {/* SVG QR code simulation */}
                <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
                  <rect width="180" height="180" fill="#fff" rx="8" />
                  {/* Corner squares */}
                  <rect x="10" y="10" width="50" height="50" fill="none" stroke="#111" strokeWidth="5" />
                  <rect x="18" y="18" width="34" height="34" fill="#111" />
                  <rect x="120" y="10" width="50" height="50" fill="none" stroke="#111" strokeWidth="5" />
                  <rect x="128" y="18" width="34" height="34" fill="#111" />
                  <rect x="10" y="120" width="50" height="50" fill="none" stroke="#111" strokeWidth="5" />
                  <rect x="18" y="128" width="34" height="34" fill="#111" />
                  {/* Data modules */}
                  {[70,78,86,94,102,110].map(x => [70,78,86,94,102,110].map(y => (
                    (x + y) % 12 === 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill="#111" /> : null
                  )))}
                  {[70,86,102].map(x => [78,94,110].map(y => (
                    <rect key={`d${x}-${y}`} x={x} y={y} width="6" height="6" fill="#111" />
                  )))}
                  {[76,84,92,100,108].map(x => [76,100].map(y => (
                    <rect key={`e${x}-${y}`} x={x} y={y} width="6" height="6" fill="#111" />
                  )))}
                  {/* PERIZONE center logo */}
                  <rect x="79" y="79" width="22" height="22" fill="#fff" rx="3" />
                  <text x="90" y="94" textAnchor="middle" fill="#00b4d8" fontSize="8" fontWeight="bold">PZ</text>
                </svg>
              </div>
              <div className="qr-amount">
                <span className="qr-amount-label">Monto a pagar</span>
                <span className="qr-amount-value">S/ {total.toFixed(2)}</span>
              </div>
              <p className="qr-note">Una vez realizado el pago, haz clic en <strong>"Finalizar Compra"</strong> para confirmar tu pedido.</p>
            </div>
          </div>
        )}

        {/* Credit Card */}
        {paymentMethod === 'card' && (
          <div className="payment-panel">
            {/* Visual Card */}
            <div className="card-visual-wrapper" onMouseEnter={() => setCardFlipped(true)} onMouseLeave={() => setCardFlipped(false)}>
              <div className={`card-visual ${cardFlipped ? 'card-visual--flipped' : ''}`}>
                {/* Front */}
                <div className="card-front">
                  <div className="card-front-top">
                    <div className="card-chip" />
                    <div className="card-type-logo">
                      {cardNum.replace(/\s/g, '').startsWith('4') ? '💳 VISA' : cardNum.replace(/\s/g, '').startsWith('5') ? '💳 MC' : '💳'}
                    </div>
                  </div>
                  <div className="card-number-display">
                    {(cardNum || '**** **** **** ****')}
                  </div>
                  <div className="card-front-bottom">
                    <div>
                      <span className="card-label">Titular</span>
                      <span className="card-value">{cardName || 'NOMBRE APELLIDO'}</span>
                    </div>
                    <div>
                      <span className="card-label">Vence</span>
                      <span className="card-value">{expiry || 'MM/AA'}</span>
                    </div>
                  </div>
                </div>
                {/* Back */}
                <div className="card-back">
                  <div className="card-stripe" />
                  <div className="card-cvv-area">
                    <span className="card-cvv-label">CVV</span>
                    <span className="card-cvv-value">{cvv ? '•'.repeat(cvv.length) : '•••'}</span>
                  </div>
                  <div className="card-back-logo">PERIZONE</div>
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="security-badges">
              <div className="security-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <strong>Cifrado SSL</strong>
                  <span>256-bit</span>
                </div>
              </div>
              <div className="security-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div>
                  <strong>PCI DSS</strong>
                  <span>Compliant</span>
                </div>
              </div>
            </div>

            {/* Card Form */}
            <div className="card-form">
              <div className="form-group form-group--full">
                <label>Número de Tarjeta</label>
                <input
                  value={cardNum}
                  onChange={e => setCardNum(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div className="form-group form-group--full">
                <label>Nombre del Titular</label>
                <input
                  value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase())}
                  placeholder="TAL COMO APARECE EN LA TARJETA"
                />
              </div>
              <div className="form-group">
                <label>Vencimiento (MM/AA)</label>
                <input
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              <div className="form-group">
                <label>
                  CVV
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ marginLeft: '4px', cursor: 'pointer' }}
                    onMouseEnter={() => setCardFlipped(true)}
                    onMouseLeave={() => setCardFlipped(false)}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </label>
                <input
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  placeholder="•••"
                  maxLength={4}
                  onFocus={() => setCardFlipped(true)}
                  onBlur={() => setCardFlipped(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Pago Efectivo */}
        {paymentMethod === 'cash' && (
          <div className="payment-panel">
            <div className="cash-section">
              <div className="cash-logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
                <span className="cash-brand">Pago<strong>Efectivo</strong></span>
              </div>
              <p className="cash-instruction">Tu código de pago CIP ha sido generado. Realiza el pago en cualquier agente autorizado.</p>
              <div className="cip-container">
                <span className="cip-label">Código CIP</span>
                <div className="cip-code">
                  {`${Math.floor(Math.random() * 9000000000 + 1000000000)}`}
                </div>
              </div>
              <div className="cash-steps">
                <div className="cash-step"><span>1</span><p>Copia tu código CIP único.</p></div>
                <div className="cash-step"><span>2</span><p>Ve a cualquier agente BCP, Interbank, BBVA, Scotiabank u otros.</p></div>
                <div className="cash-step"><span>3</span><p>Indica que deseas pagar con PagoEfectivo y proporciona tu código CIP.</p></div>
                <div className="cash-step"><span>4</span><p>El pedido se procesará automáticamente al recibir el pago.</p></div>
              </div>
              <div className="cash-amount">
                Monto a pagar: <strong>S/ {total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="step-nav">
          <button className="btn-outline" onClick={onBack}>← Volver</button>
          <button className="btn-checkout" onClick={onNext}>
            FINALIZAR COMPRA Y PAGAR
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="checkout-sidebar">
        <h3 className="sidebar-title">Resumen del Pedido</h3>
        <div className="sidebar-items">
          {cartItems.map(({ product, quantity }) => (
            <div key={product.id} className="sidebar-item">
              <div className="sidebar-item-img">
                <img src={product.mainImage} alt={product.name} />
                <span className="sidebar-item-qty">{quantity}</span>
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-name">{product.name}</span>
              </div>
              <span className="sidebar-item-price">S/ {(product.price * quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="sidebar-divider" />
        <div className="sidebar-totals">
          <div className="sidebar-row">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="sidebar-row">
            <span>Envío {shippingMethod === 'pickup' ? '(Recojo)' : '(Delivery)'}</span>
            <span>{shippingMethod === 'pickup' ? 'Gratis' : `S/ ${SHIPPING_RATE.toFixed(2)}`}</span>
          </div>
          <div className="sidebar-row">
            <span>Impuestos (18%)</span>
            <span>S/ {tax.toFixed(2)}</span>
          </div>
          <div className="sidebar-divider" />
          <div className="sidebar-row total-row">
            <span>Total</span>
            <span className="sidebar-total-price">S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ════════════════════════════════════════════
   COMPROBANTE MODAL
════════════════════════════════════════════ */
function ComprobanteModal({ order, onClose }: { order: OrderDetails; onClose: () => void }) {
  const methodLabel = {
    digital_wallet: 'Billetera Digital (Yape/Plin)',
    card: 'Tarjeta de Crédito/Débito',
    cash: 'PagoEfectivo (CIP)',
  };
  const shipLabel = {
    delivery: `Delivery Estándar — Lima Metropolitana`,
    pickup: 'Recojo en Tienda — Surco',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="comprobante-modal" onClick={e => e.stopPropagation()}>
        <div className="comprobante-header">
          <div className="comprobante-brand">
            <span className="brand-peri">PERI</span><span className="brand-zone">ZONE</span>
          </div>
          <div className="comprobante-title-block">
            <h2>BOLETA DE VENTA ELECTRÓNICA</h2>
            <span className="comprobante-ruc">RUC: 20601234567</span>
          </div>
          <div className="comprobante-num">
            <span className="comprobante-num-label">Serie / Número</span>
            <strong>B001 - {order.orderNum}</strong>
          </div>
        </div>

        <div className="comprobante-meta">
          <div className="comprobante-meta-row">
            <span>Fecha de Emisión</span>
            <strong>{order.date}</strong>
          </div>
          <div className="comprobante-meta-row">
            <span>Cliente</span>
            <strong>{order.userInfo.nombre} {order.userInfo.apellidos || ''}</strong>
          </div>
          <div className="comprobante-meta-row">
            <span>DNI</span>
            <strong>{order.shippingAddress.dni}</strong>
          </div>
          <div className="comprobante-meta-row">
            <span>Dirección</span>
            <strong>{order.shippingAddress.direccion}, {order.shippingAddress.distrito}</strong>
          </div>
          <div className="comprobante-meta-row">
            <span>Correo</span>
            <strong>{order.userInfo.email}</strong>
          </div>
        </div>

        <table className="comprobante-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>P. Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(({ product, quantity }) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{quantity}</td>
                <td>S/ {product.price.toFixed(2)}</td>
                <td>S/ {(product.price * quantity).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="comprobante-shipping-row">
              <td>{shipLabel[order.shippingMethod]}</td>
              <td>1</td>
              <td>S/ {order.shipping.toFixed(2)}</td>
              <td>S/ {order.shipping.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="comprobante-totals">
          <div className="comprobante-total-row">
            <span>Subtotal</span>
            <span>S/ {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="comprobante-total-row">
            <span>IGV (18%)</span>
            <span>S/ {order.tax.toFixed(2)}</span>
          </div>
          <div className="comprobante-total-row comprobante-grand-total">
            <span>TOTAL</span>
            <span>S/ {order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="comprobante-payment">
          <span>Método de Pago: <strong>{methodLabel[order.paymentMethod]}</strong></span>
        </div>

        <div className="comprobante-footer">
          <p>Gracias por su compra en <strong>PERIZONE</strong>. Este documento es una representación impresa de una Boleta de Venta Electrónica.</p>
          <p>Consultas: soporte@perizone.com | Lima, Perú</p>
        </div>

        <div className="comprobante-actions">
          <button className="btn-primary" onClick={() => window.print()}>🖨️ Imprimir</button>
          <button className="btn-outline" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   STEP 5: CONFIRMACIÓN
════════════════════════════════════════════ */
function Step5Confirmation({
  order,
  onNavigateHome,
}: {
  order: OrderDetails;
  onNavigateHome: () => void;
}) {
  const [showComprobante, setShowComprobante] = useState(false);
  const methodLabel = {
    digital_wallet: 'Billetera Digital (Yape/Plin)',
    card: 'Tarjeta de Crédito/Débito',
    cash: 'PagoEfectivo (CIP)',
  };
  const shipLabel = {
    delivery: `Delivery Estándar — Lima`,
    pickup: 'Recojo en Tienda — Surco',
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-main">
        <div className="confirmation-icon-wrap">
          <div className="confirmation-icon">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
        <h1 className="confirmation-title">¡PEDIDO CONFIRMADO!</h1>
        <p className="confirmation-subtitle">
          ORDEN # {order.orderNum} — {order.date}
        </p>
        <p className="confirmation-note">Una copia del comprobante ha sido enviada a tu correo: <strong>{order.userInfo.email}</strong></p>

        {/* Products table */}
        <div className="confirmation-products">
          <h3>Resumen de Productos</h3>
          <table className="conf-table">
            <thead>
              <tr>
                <th colSpan={2}>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(({ product, quantity }) => (
                <tr key={product.id}>
                  <td className="conf-table-img">
                    <img src={product.mainImage} alt={product.name} />
                  </td>
                  <td className="conf-table-name">{product.name}</td>
                  <td>S/ {product.price.toFixed(2)}</td>
                  <td>{quantity}</td>
                  <td>S/ {(product.price * quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delivery info */}
        <div className="confirmation-details-grid">
          <div className="conf-detail-card">
            <h4>Detalles de Pago y Envío</h4>
            <div className="conf-detail-row">
              <span>Método de pago</span>
              <strong>{methodLabel[order.paymentMethod]}</strong>
            </div>
            <div className="conf-detail-row">
              <span>Método de envío</span>
              <strong>{shipLabel[order.shippingMethod]}</strong>
            </div>
            <div className="conf-detail-row">
              <span>Dirección de envío</span>
              <strong>{order.shippingAddress.direccion}, {order.shippingAddress.distrito}</strong>
            </div>
          </div>
          <div className="conf-detail-card">
            <h4>Totales</h4>
            <div className="conf-detail-row">
              <span>Subtotal</span>
              <strong>S/ {order.subtotal.toFixed(2)}</strong>
            </div>
            <div className="conf-detail-row">
              <span>Envío {order.shippingMethod === 'pickup' ? '(Recojo)' : '(Delivery)'}</span>
              <strong>{order.shippingMethod === 'pickup' ? 'Gratis' : `S/ ${order.shipping.toFixed(2)}`}</strong>
            </div>
            <div className="conf-detail-row">
              <span>Impuestos (IGV 18%)</span>
              <strong>S/ {order.tax.toFixed(2)}</strong>
            </div>
            <div className="conf-detail-row conf-total-row">
              <span>Total</span>
              <strong className="conf-total-price">S/ {order.total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn-checkout btn-lime" onClick={() => setShowComprobante(true)}>
            📄 VER COMPROBANTE DE PAGO
          </button>
          <button className="btn-outline" onClick={onNavigateHome}>
            VOLVER AL INICIO
          </button>
        </div>
      </div>

      {showComprobante && (
        <ComprobanteModal order={order} onClose={() => setShowComprobante(false)} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN CHECKOUT TAB
════════════════════════════════════════════ */
export default function CheckoutTab({ cartItems, onNavigate, onOrderComplete }: CheckoutTabProps) {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<CheckoutUserInfo | null>(null);
  const [address, setAddress] = useState<ShippingAddressInfo | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('digital_wallet');
  const [order, setOrder] = useState<OrderDetails | null>(null);

  const subtotal = cartItems.reduce((a, i) => a + i.product.price * i.quantity, 0);
  const shipping = shippingMethod === 'delivery' ? SHIPPING_RATE : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const handleFinalize = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-PE', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const orderNum = `PZ-${Date.now().toString().slice(-6)}`;
    const newOrder: OrderDetails = {
      orderNum,
      date: dateStr,
      userInfo: userInfo!,
      shippingAddress: address!,
      shippingMethod,
      paymentMethod,
      items: cartItems,
      subtotal,
      shipping,
      tax,
      total,
    };
    setOrder(newOrder);
    onOrderComplete(newOrder);
    setStep(5);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {step < 5 && <StepIndicator step={step} />}

        {step === 1 && (
          <div className="step-section">
            <h2 className="step-title">1. Acceso / Registro</h2>
            <Step1Login
              onNext={info => { setUserInfo(info); setStep(2); }}
            />
          </div>
        )}

        {step === 2 && userInfo && (
          <div className="step-section">
            <Step2Address
              userInfo={userInfo}
              initial={address}
              onNext={addr => { setAddress(addr); setStep(3); }}
              onBack={() => setStep(1)}
              cartItems={cartItems}
              shippingMethod={shippingMethod}
            />
          </div>
        )}

        {step === 3 && address && (
          <div className="step-section">
            <Step3Shipping
              address={address}
              shippingMethod={shippingMethod}
              onMethodChange={setShippingMethod}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
              cartItems={cartItems}
            />
          </div>
        )}

        {step === 4 && (
          <div className="step-section">
            <Step4Payment
              paymentMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
              onNext={handleFinalize}
              onBack={() => setStep(3)}
              cartItems={cartItems}
              shippingMethod={shippingMethod}
            />
          </div>
        )}

        {step === 5 && order && (
          <Step5Confirmation
            order={order}
            onNavigateHome={() => onNavigate('inicio')}
          />
        )}
      </div>
    </div>
  );
}
