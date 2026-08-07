import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as ordenesApi from '../../api/ordenes';
import { ApiError } from '../../api/client';
import type { EstadoOrden, Orden } from '../../types';

const ESTADOS: EstadoOrden[] = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

const ESTADO_BADGE: Record<EstadoOrden, string> = {
  pendiente: 'adm-badge-warning',
  procesando: 'adm-badge-warning',
  enviado: 'adm-badge-accent',
  entregado: 'adm-badge-success',
  cancelado: 'adm-badge-danger',
};

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoOrden | ''>('');

  useEffect(() => {
    ordenesApi
      .listarTodas(filtroEstado || undefined)
      .then(setOrdenes)
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las órdenes'))
      .finally(() => setLoading(false));
  }, [filtroEstado]);

  return (
    <>
      <div className="adm-page-header">
        <h1>Órdenes</h1>
        <div className="adm-page-actions">
          <select
            className="adm-select"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value as EstadoOrden | '')}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="adm-loading">Cargando órdenes…</p>}
      {error && <p className="adm-field-error">{error}</p>}

      {!loading && !error && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Método</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.cliente_nombre ? `${o.cliente_nombre} ${o.cliente_apellido ?? ''}` : `Usuario #${o.id_usuario}`}</td>
                  <td>{new Date(o.fecha_creacion).toLocaleDateString('es-PE')}</td>
                  <td style={{ textTransform: 'capitalize' }}>{o.metodo_pago}</td>
                  <td>S/ {o.total.toFixed(2)}</td>
                  <td><span className={`adm-badge ${ESTADO_BADGE[o.estado]}`}>{o.estado}</span></td>
                  <td>
                    <Link className="adm-btn adm-btn-outline adm-btn-sm" to={`/admin/ordenes/${o.id}`}>
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
              {ordenes.length === 0 && (
                <tr>
                  <td colSpan={7} className="adm-empty">No hay órdenes para este filtro.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
