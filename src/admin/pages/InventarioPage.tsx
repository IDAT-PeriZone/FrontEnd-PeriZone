import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import * as inventarioApi from '../../api/inventario';
import * as productosApi from '../../api/productos';
import { ApiError } from '../../api/client';
import type { AjusteManual } from '../../api/inventario';
import type { MovimientoInventario, Product, TipoMovimiento } from '../../types';
import Modal from '../components/Modal';
import CsvDownloadButton from '../components/CsvDownloadButton';

const AJUSTE_VACIO: AjusteManual = { id_producto: 0, tipo: 'entrada', cantidad: 1, motivo: '' };

export default function InventarioPage() {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productoFiltro, setProductoFiltro] = useState<number | ''>('');

  const [ajustando, setAjustando] = useState(false);
  const [form, setForm] = useState<AjusteManual>(AJUSTE_VACIO);
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    productosApi.listarAdmin().then(setProductos).catch(() => {});
  }, []);

  const nombreProducto = useMemo(() => {
    const map = new Map(productos.map(p => [p.id, p.nombre]));
    return (id: number) => map.get(id) ?? `#${id}`;
  }, [productos]);

  const fetchMovimientos = () => {
    inventarioApi
      .listar(productoFiltro || undefined)
      .then(setMovimientos)
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el kardex'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchMovimientos se redefine con "productoFiltro" en cada render
  }, [productoFiltro]);

  const cargar = () => {
    setLoading(true);
    setError('');
    fetchMovimientos();
  };

  const abrirAjuste = () => {
    setForm({ ...AJUSTE_VACIO, id_producto: productos[0]?.id ?? 0 });
    setFormError('');
    setAjustando(true);
  };

  const handleAjuste = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      await inventarioApi.ajusteManual(form);
      setAjustando(false);
      cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo registrar el ajuste');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="adm-page-header">
        <h1>Inventario (Kardex)</h1>
        <div className="adm-page-actions">
          <select
            className="adm-select"
            value={productoFiltro}
            onChange={e => setProductoFiltro(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Todos los productos</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <CsvDownloadButton onDownload={() => inventarioApi.descargarCsv(productoFiltro || undefined)} />
          <button className="adm-btn adm-btn-primary" onClick={abrirAjuste}>+ Ajuste manual</button>
        </div>
      </div>

      {loading && <p className="adm-loading">Cargando movimientos…</p>}
      {error && <p className="adm-field-error">{error}</p>}

      {!loading && !error && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock ant. → result.</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.fecha_creacion).toLocaleString('es-PE')}</td>
                  <td>{m.producto_nombre ?? nombreProducto(m.id_producto)}</td>
                  <td>
                    <span className={`adm-badge ${m.tipo === 'entrada' ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td>{m.cantidad}</td>
                  <td>{m.stock_anterior} → {m.stock_resultante}</td>
                  <td>{m.motivo}</td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={6} className="adm-empty">Sin movimientos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {ajustando && (
        <Modal
          title="Ajuste manual de stock"
          onClose={() => setAjustando(false)}
          footer={
            <>
              <button className="adm-btn adm-btn-outline" onClick={() => setAjustando(false)} disabled={guardando}>
                Cancelar
              </button>
              <button className="adm-btn adm-btn-primary" form="form-ajuste" type="submit" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Registrar ajuste'}
              </button>
            </>
          }
        >
          <form id="form-ajuste" onSubmit={handleAjuste}>
            <div className="adm-field">
              <label>Producto</label>
              <select
                className="adm-select"
                value={form.id_producto}
                onChange={e => setForm({ ...form, id_producto: Number(e.target.value) })}
                required
              >
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} (stock actual: {p.stock})</option>
                ))}
              </select>
            </div>
            <div className="adm-field-row">
              <div className="adm-field">
                <label>Tipo</label>
                <select
                  className="adm-select"
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value as TipoMovimiento })}
                >
                  <option value="entrada">Entrada (reposición)</option>
                  <option value="salida">Salida (merma / ajuste)</option>
                </select>
              </div>
              <div className="adm-field">
                <label>Cantidad</label>
                <input
                  className="adm-input"
                  type="number"
                  min="1"
                  value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="adm-field">
              <label>Motivo</label>
              <input
                className="adm-input"
                placeholder="Ej. reposición de proveedor, conteo físico, producto dañado…"
                value={form.motivo}
                onChange={e => setForm({ ...form, motivo: e.target.value })}
                required
              />
            </div>
            {formError && <p className="adm-field-error">{formError}</p>}
          </form>
        </Modal>
      )}
    </>
  );
}
