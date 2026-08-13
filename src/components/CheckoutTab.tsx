import { useEffect, useState } from 'react';
import type { CartItem, Direccion, MetodoPago, OrdenDetalleCompleto, TabId } from '../types';
import { useCart } from '../context/CartContext';
import * as direccionesApi from '../api/direcciones';
import * as ordenesApi from '../api/ordenes';
import { ApiError } from '../api/client';

interface CheckoutTabProps {
  onNavigate: (tab: TabId) => void;
}

const METODO_LABEL: Record<MetodoPago, string> = {
  yape: 'Yape',
  tarjeta: 'Tarjeta de Crédito/Débito',
  transferencia: 'Transferencia Bancaria',
};

/* ════════════════════════════════════════════
   STEP INDICATOR
════════════════════════════════════════════ */
function StepIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: 'Dirección' },
    { num: 2, label: 'Pago' },
    { num: 3, label: 'Confirmación' },
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
  items,
  subtotal,
  igv,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
}) {
  return (
    <aside className="checkout-sidebar">
      <h3 className="sidebar-title">Resumen del Pedido</h3>
      <div className="sidebar-items">
        {items.map(item => (
          <div key={item.id_producto} className="sidebar-item">
            <div className="sidebar-item-img">
              <img src={item.imagen_url ?? undefined} alt={item.nombre} />
              <span className="sidebar-item-qty">{item.cantidad}</span>
            </div>
            <div className="sidebar-item-info">
              <span className="sidebar-item-name">{item.nombre}</span>
            </div>
            <span className="sidebar-item-price">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
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
          <span>Impuestos (IGV 18%)</span>
          <span>S/ {igv.toFixed(2)}</span>
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
   STEP 1: DIRECCIÓN DE ENTREGA
════════════════════════════════════════════ */
function Step1Address({
  items,
  subtotal,
  igv,
  total,
  onBack,
  onNext,
}: {
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
  onBack: () => void;
  onNext: (idDireccion: number) => void;
}) {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ direccion: '', distrito: '', provincia: 'Lima', departamento: 'Lima', referencia: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const load = () => {
    setLoading(true);
    direccionesApi
      .listar()
      .then(data => {
        setDirecciones(data);
        const def = data.find(d => d.predeterminada) ?? data[0];
        if (def) setSelected(def.id);
        setShowForm(data.length === 0);
      })
      .catch(() => setApiError('No se pudieron cargar tus direcciones'))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- load saved addresses on mount
  useEffect(load, []);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.direccion) e.direccion = 'Requerido';
    if (!form.distrito) e.distrito = 'Requerido';
    if (!form.provincia) e.provincia = 'Requerido';
    if (!form.departamento) e.departamento = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveDireccion = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const id = await direccionesApi.crear({ ...form, predeterminada: direcciones.length === 0 });
      setForm({ direccion: '', distrito: '', provincia: 'Lima', departamento: 'Lima', referencia: '' });
      const data = await direccionesApi.listar();
      setDirecciones(data);
      setSelected(id);
      setShowForm(false);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'No se pudo guardar la dirección');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="checkout-layout">
      <div className="checkout-form-area">
        <h2 className="step-title">1. Dirección de Entrega</h2>

        {apiError && <p className="field-error">{apiError}</p>}

        {loading ? (
          <p className="catalog-results-label">Cargando direcciones…</p>
        ) : (
          <>
            {direcciones.length > 0 && (
              <div className="shipping-options">
                {direcciones.map(d => (
                  <label
                    key={d.id}
                    className={`shipping-option ${selected === d.id ? 'shipping-option--active' : ''}`}
                    onClick={() => setSelected(d.id)}
                  >
                    <div className="shipping-option-left">
                      <input type="radio" readOnly checked={selected === d.id} />
                      <div>
                        <strong>{d.direccion}</strong>
                        <span className="shipping-sub">
                          {d.distrito}, {d.provincia}, {d.departamento}
                          {d.referencia ? ` — ${d.referencia}` : ''}
                        </span>
                      </div>
                    </div>
                    {!!d.predeterminada && <span className="shipping-price shipping-free">Predeterminada</span>}
                  </label>
                ))}
              </div>
            )}

            {!showForm && (
              <button className="btn-outline" onClick={() => setShowForm(true)}>
                + Agregar nueva dirección
              </button>
            )}

            {showForm && (
              <div className="form-grid" style={{ marginTop: '1rem' }}>
                <div className="form-group form-group--full">
                  <label>Dirección completa *</label>
                  <input
                    value={form.direccion}
                    onChange={e => set('direccion', e.target.value)}
                    placeholder="Av. Las Palmeras 123, Dpto. 4B"
                    className={errors.direccion ? 'input-error' : ''}
                  />
                  {errors.direccion && <span className="field-error">{errors.direccion}</span>}
                </div>
                <div className="form-group">
                  <label>Distrito *</label>
                  <input value={form.distrito} onChange={e => set('distrito', e.target.value)} className={errors.distrito ? 'input-error' : ''} />
                  {errors.distrito && <span className="field-error">{errors.distrito}</span>}
                </div>
                <div className="form-group">
                  <label>Provincia *</label>
                  <input value={form.provincia} onChange={e => set('provincia', e.target.value)} className={errors.provincia ? 'input-error' : ''} />
                  {errors.provincia && <span className="field-error">{errors.provincia}</span>}
                </div>
                <div className="form-group">
                  <label>Departamento *</label>
                  <input
                    value={form.departamento}
                    onChange={e => set('departamento', e.target.value)}
                    className={errors.departamento ? 'input-error' : ''}
                  />
                  {errors.departamento && <span className="field-error">{errors.departamento}</span>}
                </div>
                <div className="form-group form-group--full">
                  <label>Referencia</label>
                  <input value={form.referencia} onChange={e => set('referencia', e.target.value)} placeholder="Ej: Frente al parque" />
                </div>
                <div className="form-group form-group--full" style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-outline" onClick={handleSaveDireccion} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar dirección'}
                  </button>
                  {direcciones.length > 0 && (
                    <button className="btn-outline" onClick={() => setShowForm(false)}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="step-nav">
          <button className="btn-outline" onClick={onBack}>← Volver al carrito</button>
          <button className="btn-checkout" disabled={!selected} onClick={() => selected && onNext(selected)}>
            CONTINUAR
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <OrderSummarySidebar items={items} subtotal={subtotal} igv={igv} total={total} />
    </div>
  );
}

/* ════════════════════════════════════════════
   STEP 2: MÉTODO DE PAGO
════════════════════════════════════════════ */
function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val: string) {
  return val.replace(/\D/g, '').substring(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
}

interface PagoBody {
  metodo_pago: MetodoPago;
  numero_tarjeta?: string;
  cvv?: string;
  fecha_expiracion?: string;
  simular_rechazo?: boolean;
}

function Step2Payment({
  items,
  subtotal,
  igv,
  total,
  onBack,
  onSubmit,
  submitting,
  apiError,
}: {
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
  onBack: () => void;
  onSubmit: (body: PagoBody) => void;
  submitting: boolean;
  apiError: string;
}) {
  const [metodo, setMetodo] = useState<MetodoPago>('yape');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [simularRechazo, setSimularRechazo] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = () => {
    setFormError('');
    if (metodo === 'tarjeta') {
      if (cardNum.replace(/\s/g, '').length < 15 || !expiry || cvv.length < 3) {
        setFormError('Completa el número de tarjeta, vencimiento y CVV.');
        return;
      }
      onSubmit({ metodo_pago: 'tarjeta', numero_tarjeta: cardNum.replace(/\s/g, ''), cvv, fecha_expiracion: expiry });
    } else {
      onSubmit({ metodo_pago: metodo, simular_rechazo: simularRechazo });
    }
  };

  return (
    <div className="checkout-layout">
      <div className="checkout-form-area">
        <h2 className="step-title">2. Método de Pago</h2>

        <div className="payment-tabs">
          {([
            { id: 'yape', icon: '📱', label: 'Yape' },
            { id: 'tarjeta', icon: '💳', label: 'Tarjeta de Crédito / Débito' },
            { id: 'transferencia', icon: '🏦', label: 'Transferencia Bancaria' },
          ] as const).map(m => (
            <button
              key={m.id}
              className={`payment-tab ${metodo === m.id ? 'payment-tab--active' : ''}`}
              onClick={() => setMetodo(m.id)}
            >
              <span className="payment-tab-icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {metodo === 'yape' && (
          <div className="payment-panel">
            <div className="qr-section">
              <div className="qr-wallet-logos">
                <span className="wallet-badge wallet-yape">Yape</span>
              </div>
              <p className="qr-instruction">Escanea el código QR con tu app para pagar</p>
              <div className="qr-container">
                <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
                  <rect width="180" height="180" fill="#fff" rx="8" />
                  <rect x="10" y="10" width="50" height="50" fill="none" stroke="#111" strokeWidth="5" />
                  <rect x="18" y="18" width="34" height="34" fill="#111" />
                  <rect x="120" y="10" width="50" height="50" fill="none" stroke="#111" strokeWidth="5" />
                  <rect x="128" y="18" width="34" height="34" fill="#111" />
                  <rect x="10" y="120" width="50" height="50" fill="none" stroke="#111" strokeWidth="5" />
                  <rect x="18" y="128" width="34" height="34" fill="#111" />
                  <rect x="79" y="79" width="22" height="22" fill="#fff" rx="3" />
                  <text x="90" y="94" textAnchor="middle" fill="#00b4d8" fontSize="8" fontWeight="bold">PZ</text>
                </svg>
              </div>
              <div className="qr-amount">
                <span className="qr-amount-label">Monto a pagar</span>
                <span className="qr-amount-value">S/ {total.toFixed(2)}</span>
              </div>
              <p className="qr-note">
                Es una confirmación simulada: al hacer clic en <strong>"Finalizar Compra"</strong> el pago se aprueba automáticamente.
              </p>
              <label className="sidebar-check" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" checked={simularRechazo} onChange={e => setSimularRechazo(e.target.checked)} />
                Simular pago rechazado (demo)
              </label>
            </div>
          </div>
        )}

        {metodo === 'tarjeta' && (
          <div className="payment-panel">
            <div className="card-visual-wrapper" onMouseEnter={() => setCardFlipped(true)} onMouseLeave={() => setCardFlipped(false)}>
              <div className={`card-visual ${cardFlipped ? 'card-visual--flipped' : ''}`}>
                <div className="card-front">
                  <div className="card-front-top">
                    <div className="card-chip" />
                    <div className="card-type-logo">
                      {cardNum.replace(/\s/g, '').startsWith('4') ? '💳 VISA' : cardNum.replace(/\s/g, '').startsWith('5') ? '💳 MC' : '💳'}
                    </div>
                  </div>
                  <div className="card-number-display">{cardNum || '**** **** **** ****'}</div>
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

            <div className="card-form">
              <div className="form-group form-group--full">
                <label>Número de Tarjeta</label>
                <input value={cardNum} onChange={e => setCardNum(formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} />
              </div>
              <div className="form-group form-group--full">
                <label>Nombre del Titular</label>
                <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder="TAL COMO APARECE EN LA TARJETA" />
              </div>
              <div className="form-group">
                <label>Vencimiento (MM/AA)</label>
                <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" maxLength={5} />
              </div>
              <div className="form-group">
                <label>CVV</label>
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

        {metodo === 'transferencia' && (
          <div className="payment-panel">
            <div className="cash-section">
              <div className="cash-logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
                <span className="cash-brand">Transferencia<strong>Bancaria</strong></span>
              </div>
              <p className="cash-instruction">Transfiere el monto a la cuenta de PERIZONE y confirma tu pedido.</p>
              <div className="cash-amount">
                Monto a transferir: <strong>S/ {total.toFixed(2)}</strong>
              </div>
              <label className="sidebar-check" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input type="checkbox" checked={simularRechazo} onChange={e => setSimularRechazo(e.target.checked)} />
                Simular pago rechazado (demo)
              </label>
            </div>
          </div>
        )}

        {formError && <p className="field-error">{formError}</p>}
        {apiError && <p className="field-error">{apiError}</p>}

        <div className="step-nav">
          <button className="btn-outline" onClick={onBack} disabled={submitting}>← Volver</button>
          <button className="btn-checkout" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Procesando…' : 'FINALIZAR COMPRA Y PAGAR'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <OrderSummarySidebar items={items} subtotal={subtotal} igv={igv} total={total} />
    </div>
  );
}

/* ════════════════════════════════════════════
   COMPROBANTE MODAL
════════════════════════════════════════════ */
function ComprobanteModal({ detalle, onClose }: { detalle: OrdenDetalleCompleto; onClose: () => void }) {
  const { orden, detalle: items, comprobante } = detalle;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="comprobante-modal" onClick={e => e.stopPropagation()}>
        <div className="comprobante-header">
          <div className="comprobante-brand">
            <span className="brand-peri">PERI</span><span className="brand-zone">ZONE</span>
          </div>
          <div className="comprobante-title-block">
            <h2>{comprobante?.tipo === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}</h2>
            <span className="comprobante-ruc">RUC: 20601234567</span>
          </div>
          <div className="comprobante-num">
            <span className="comprobante-num-label">Número</span>
            <strong>{comprobante?.numero ?? '—'}</strong>
          </div>
        </div>

        <div className="comprobante-meta">
          <div className="comprobante-meta-row">
            <span>Fecha de Emisión</span>
            <strong>{new Date(orden.fecha_creacion).toLocaleString('es-PE')}</strong>
          </div>
          <div className="comprobante-meta-row">
            <span>Dirección</span>
            <strong>{orden.direccion_entrega}</strong>
          </div>
          <div className="comprobante-meta-row">
            <span>Estado de la orden</span>
            <strong>{orden.estado}</strong>
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
            {items.map(i => (
              <tr key={i.id}>
                <td>{i.nombre}</td>
                <td>{i.cantidad}</td>
                <td>S/ {i.precio_unitario.toFixed(2)}</td>
                <td>S/ {i.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="comprobante-totals">
          <div className="comprobante-total-row">
            <span>Subtotal</span>
            <span>S/ {orden.subtotal.toFixed(2)}</span>
          </div>
          <div className="comprobante-total-row">
            <span>IGV (18%)</span>
            <span>S/ {orden.igv.toFixed(2)}</span>
          </div>
          <div className="comprobante-total-row comprobante-grand-total">
            <span>TOTAL</span>
            <span>S/ {orden.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="comprobante-payment">
          <span>Método de Pago: <strong>{METODO_LABEL[orden.metodo_pago]}</strong></span>
        </div>

        <div className="comprobante-footer">
          <p>Gracias por su compra en <strong>PERIZONE</strong>. Este documento es una representación impresa de una {comprobante?.tipo === 'factura' ? 'Factura' : 'Boleta'} de Venta Electrónica.</p>
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
   STEP 3: CONFIRMACIÓN
════════════════════════════════════════════ */
function Step3Confirmation({
  result,
  detalle,
  onNavigateHome,
}: {
  result: ordenesApi.CheckoutResponse;
  detalle: OrdenDetalleCompleto | null;
  onNavigateHome: () => void;
}) {
  const [showComprobante, setShowComprobante] = useState(false);

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
          ORDEN #{result.id_orden} — Comprobante {result.comprobante}
        </p>

        {detalle && (
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
                {detalle.detalle.map(d => (
                  <tr key={d.id}>
                    <td colSpan={2} className="conf-table-name">{d.nombre}</td>
                    <td>S/ {d.precio_unitario.toFixed(2)}</td>
                    <td>{d.cantidad}</td>
                    <td>S/ {d.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="confirmation-details-grid">
          <div className="conf-detail-card">
            <h4>Detalles de Pago y Envío</h4>
            <div className="conf-detail-row">
              <span>Método de pago</span>
              <strong>{detalle ? METODO_LABEL[detalle.orden.metodo_pago] : '—'}</strong>
            </div>
            <div className="conf-detail-row">
              <span>Estado</span>
              <strong>{detalle?.orden.estado ?? '—'}</strong>
            </div>
            <div className="conf-detail-row">
              <span>Dirección de envío</span>
              <strong>{detalle?.orden.direccion_entrega ?? '—'}</strong>
            </div>
          </div>
          <div className="conf-detail-card">
            <h4>Totales</h4>
            <div className="conf-detail-row">
              <span>Subtotal</span>
              <strong>S/ {result.subtotal.toFixed(2)}</strong>
            </div>
            <div className="conf-detail-row">
              <span>Impuestos (IGV 18%)</span>
              <strong>S/ {result.igv.toFixed(2)}</strong>
            </div>
            <div className="conf-detail-row conf-total-row">
              <span>Total</span>
              <strong className="conf-total-price">S/ {result.total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn-checkout btn-lime" onClick={() => setShowComprobante(true)} disabled={!detalle}>
            📄 VER COMPROBANTE DE PAGO
          </button>
          <button className="btn-outline" onClick={onNavigateHome}>
            VOLVER AL INICIO
          </button>
        </div>
      </div>

      {showComprobante && detalle && <ComprobanteModal detalle={detalle} onClose={() => setShowComprobante(false)} />}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN CHECKOUT TAB
════════════════════════════════════════════ */
export default function CheckoutTab({ onNavigate }: CheckoutTabProps) {
  const { cart, refresh: refreshCart } = useCart();
  const [step, setStep] = useState(1);
  const [idDireccion, setIdDireccion] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [result, setResult] = useState<ordenesApi.CheckoutResponse | null>(null);
  const [detalle, setDetalle] = useState<OrdenDetalleCompleto | null>(null);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const igv = cart?.igv ?? 0;
  const total = cart?.total ?? 0;

  const handleSubmitPago = async (pago: PagoBody) => {
    if (!idDireccion) return;
    setApiError('');
    setSubmitting(true);
    try {
      const res = await ordenesApi.checkout({ id_direccion: idDireccion, ...pago });
      setResult(res);
      const full = await ordenesApi.obtener(res.id_orden);
      setDetalle(full);
      await refreshCart();
      setStep(3);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'No se pudo procesar el pago');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && step < 3) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos antes de continuar con el pago.</p>
        <button className="btn-primary" onClick={() => onNavigate('catalogo')}>
          Ir al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {step < 3 && <StepIndicator step={step} />}

        {step === 1 && (
          <div className="step-section">
            <Step1Address
              items={items}
              subtotal={subtotal}
              igv={igv}
              total={total}
              onBack={() => onNavigate('carrito')}
              onNext={id => { setIdDireccion(id); setStep(2); }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="step-section">
            <Step2Payment
              items={items}
              subtotal={subtotal}
              igv={igv}
              total={total}
              onBack={() => setStep(1)}
              onSubmit={handleSubmitPago}
              submitting={submitting}
              apiError={apiError}
            />
          </div>
        )}

        {step === 3 && result && <Step3Confirmation result={result} detalle={detalle} onNavigateHome={() => onNavigate('inicio')} />}
      </div>
    </div>
  );
}
