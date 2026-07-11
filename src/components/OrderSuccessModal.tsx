import type { TabId } from '../types';

interface OrderSuccessModalProps {
  onClose: () => void;
  onNavigate: (tab: TabId) => void;
  orderTotal: number;
}

export default function OrderSuccessModal({ onClose, onNavigate, orderTotal }: OrderSuccessModalProps) {
  const orderNum = `PZ-${Date.now().toString().slice(-6)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="modal-title">¡Compra realizada!</h2>
        <p className="modal-subtitle">Tu pedido ha sido procesado exitosamente.</p>
        <div className="modal-order-info">
          <div className="modal-info-row">
            <span>Número de pedido</span>
            <strong>{orderNum}</strong>
          </div>
          <div className="modal-info-row">
            <span>Total pagado</span>
            <strong className="modal-total">S/ {orderTotal.toFixed(2)}</strong>
          </div>
          <div className="modal-info-row">
            <span>Estado</span>
            <strong className="modal-status">Procesando</strong>
          </div>
          <div className="modal-info-row">
            <span>Envío estimado</span>
            <strong>2-3 días hábiles</strong>
          </div>
        </div>
        <p className="modal-note">
          Recibirás un correo de confirmación con los detalles de tu pedido.
        </p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={() => { onClose(); onNavigate('inicio'); }}>
            Volver al inicio
          </button>
          <button className="btn-outline" onClick={() => { onClose(); onNavigate('catalogo'); }}>
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}
