import type { ReactNode } from 'react';
import type { OrdenDetalleCompleto } from '../types';
import { ESTADO_CLASS, METODO_LABEL } from './ordenLabels';

interface OrdenDetalleViewProps {
  detalle: OrdenDetalleCompleto;
  /** Contenido extra (ej. selector de cambio de estado del panel admin), se renderiza al final. */
  children?: ReactNode;
}

/** Detalle completo de una orden: cabecera, items, totales y seguimiento de estados. Usado tanto por "Mis pedidos" (cliente) como por el panel admin. */
export default function OrdenDetalleView({ detalle, children }: OrdenDetalleViewProps) {
  return (
    <>
      <div className="comprobante-header">
        <div className="comprobante-brand">
          <span className="brand-peri">PERI</span><span className="brand-zone">ZONE</span>
        </div>
        <div className="comprobante-title-block">
          <h2>PEDIDO #{detalle.orden.id}</h2>
          <span className="comprobante-ruc">
            {detalle.comprobante ? `${detalle.comprobante.tipo.toUpperCase()} ${detalle.comprobante.numero}` : 'Sin comprobante'}
          </span>
        </div>
        <span className={`stock-badge ${ESTADO_CLASS[detalle.orden.estado]}`}>{detalle.orden.estado}</span>
      </div>

      <div className="comprobante-meta">
        {(detalle.orden.cliente_nombre || detalle.orden.cliente_apellido) && (
          <div className="comprobante-meta-row">
            <span>Cliente</span>
            <strong>{detalle.orden.cliente_nombre} {detalle.orden.cliente_apellido}</strong>
          </div>
        )}
        <div className="comprobante-meta-row">
          <span>Fecha</span>
          <strong>{new Date(detalle.orden.fecha_creacion).toLocaleString('es-PE')}</strong>
        </div>
        <div className="comprobante-meta-row">
          <span>Dirección</span>
          <strong>{detalle.orden.direccion_entrega}</strong>
        </div>
        <div className="comprobante-meta-row">
          <span>Método de pago</span>
          <strong>{METODO_LABEL[detalle.orden.metodo_pago]}</strong>
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
          {detalle.detalle.map(i => (
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
          <span>S/ {detalle.orden.subtotal.toFixed(2)}</span>
        </div>
        <div className="comprobante-total-row">
          <span>IGV (18%)</span>
          <span>S/ {detalle.orden.igv.toFixed(2)}</span>
        </div>
        <div className="comprobante-total-row comprobante-grand-total">
          <span>TOTAL</span>
          <span>S/ {detalle.orden.total.toFixed(2)}</span>
        </div>
      </div>

      {detalle.historial.length > 0 && (
        <div className="comprobante-meta">
          <div className="comprobante-meta-row"><span>Seguimiento</span><span /></div>
          {detalle.historial.map(h => (
            <div key={h.id} className="comprobante-meta-row">
              <span>{new Date(h.fecha_creacion).toLocaleString('es-PE')}</span>
              <strong>{h.estado_anterior ? `${h.estado_anterior} → ${h.estado_nuevo}` : h.estado_nuevo}</strong>
            </div>
          ))}
        </div>
      )}

      {children}
    </>
  );
}
