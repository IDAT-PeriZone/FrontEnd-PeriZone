import { useEffect, useState } from 'react';
import * as ordenesApi from '../api/ordenes';
import type { Orden, OrdenDetalleCompleto, TabId } from '../types';
import { ApiError } from '../api/client';
import OrdenDetalleView from './OrdenDetalleView';
import { ESTADO_CLASS, METODO_LABEL } from './ordenLabels';

interface MisPedidosTabProps {
  onNavigate: (tab: TabId) => void;
}

function OrderDetailModal({ idOrden, onClose }: { idOrden: number; onClose: () => void }) {
  const [detalle, setDetalle] = useState<OrdenDetalleCompleto | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    ordenesApi
      .obtener(idOrden)
      .then(setDetalle)
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el pedido'));
  }, [idOrden]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="comprobante-modal" onClick={e => e.stopPropagation()}>
        {error && <p className="field-error">{error}</p>}
        {!detalle && !error && <p className="catalog-results-label">Cargando pedido…</p>}
        {detalle && <OrdenDetalleView detalle={detalle} />}
        <div className="comprobante-actions">
          <button className="btn-outline" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function MisPedidosTab({ onNavigate }: MisPedidosTabProps) {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    ordenesApi
      .misOrdenes()
      .then(setOrdenes)
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus pedidos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">📦</div>
        <h2>Cargando tus pedidos…</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">⚠️</div>
        <h2>No se pudieron cargar tus pedidos</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (ordenes.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">📦</div>
        <h2>Todavía no tienes pedidos</h2>
        <p>Cuando completes una compra aparecerá aquí.</p>
        <button className="btn-primary" onClick={() => onNavigate('catalogo')}>
          Ir al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header-bar">
        <h1>Mis pedidos</h1>
        <span className="cart-item-count">{ordenes.length} pedido{ordenes.length > 1 ? 's' : ''}</span>
      </div>

      <div className="cart-items">
        {ordenes.map(o => (
          <div key={o.id} className="cart-item" style={{ cursor: 'pointer' }} onClick={() => setSelected(o.id)}>
            <div className="cart-item-details">
              <span className="cart-item-cat">Pedido #{o.id} — {new Date(o.fecha_creacion).toLocaleDateString('es-PE')}</span>
              <h3 className="cart-item-name">{METODO_LABEL[o.metodo_pago]}</h3>
              <div className="cart-item-bottom">
                <span className={`stock-badge ${ESTADO_CLASS[o.estado]}`}>{o.estado}</span>
                <span className="cart-item-total">S/ {o.total.toFixed(2)}</span>
                <button className="btn-outline" onClick={e => { e.stopPropagation(); setSelected(o.id); }}>
                  Ver detalle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected !== null && <OrderDetailModal idOrden={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
