import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as ordenesApi from '../../api/ordenes';
import { ApiError } from '../../api/client';
import type { EstadoOrden, OrdenDetalleCompleto, RolNombre } from '../../types';
import OrdenDetalleView from '../../components/OrdenDetalleView';

interface OrdenDetallePageProps {
  rol: RolNombre;
}

/** Debe reflejar TRANSICIONES_VALIDAS de BackEnd-PeriZone/src/controllers/ordenes.controller.ts. */
const TRANSICIONES_VALIDAS: Record<EstadoOrden, EstadoOrden[]> = {
  pendiente: ['procesando', 'cancelado'],
  procesando: ['enviado', 'cancelado'],
  enviado: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
};

export default function OrdenDetallePage({ rol }: OrdenDetallePageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState<OrdenDetalleCompleto | null>(null);
  const [error, setError] = useState('');
  const [cambiando, setCambiando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoOrden | ''>('');

  const puedeCambiarEstado = rol === 'administrador' || rol === 'almacen';

  useEffect(() => {
    if (!id) return;
    ordenesApi
      .obtener(Number(id))
      .then(d => {
        setDetalle(d);
        setNuevoEstado('');
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudo cargar la orden'));
  }, [id]);

  const recargar = () => {
    if (!id) return;
    ordenesApi.obtener(Number(id)).then(d => {
      setDetalle(d);
      setNuevoEstado('');
    });
  };

  const handleCambiarEstado = async () => {
    if (!detalle || !nuevoEstado) return;
    setCambiando(true);
    setError('');
    try {
      await ordenesApi.cambiarEstado(detalle.orden.id, nuevoEstado);
      recargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado');
    } finally {
      setCambiando(false);
    }
  };

  if (error && !detalle) return <p className="adm-field-error">{error}</p>;
  if (!detalle) return <p className="adm-loading">Cargando orden…</p>;

  const opciones = TRANSICIONES_VALIDAS[detalle.orden.estado];

  return (
    <>
      <div className="adm-page-header">
        <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => navigate('/admin/ordenes')}>
          ← Volver a órdenes
        </button>
      </div>

      <div className="comprobante-modal" style={{ margin: '0 auto' }}>
        <OrdenDetalleView detalle={detalle} />
      </div>

      {puedeCambiarEstado && (
        <div className="adm-card" style={{ maxWidth: 640, margin: '1.25rem auto 0' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Cambiar estado</h4>
          {opciones.length === 0 ? (
            <p className="adm-empty">Esta orden ya está en un estado final.</p>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="adm-select"
                value={nuevoEstado}
                onChange={e => setNuevoEstado(e.target.value as EstadoOrden)}
              >
                <option value="">Selecciona un estado…</option>
                {opciones.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <button className="adm-btn adm-btn-primary" disabled={!nuevoEstado || cambiando} onClick={handleCambiarEstado}>
                {cambiando ? 'Actualizando…' : 'Confirmar cambio'}
              </button>
            </div>
          )}
          {error && <p className="adm-field-error">{error}</p>}
        </div>
      )}
    </>
  );
}
