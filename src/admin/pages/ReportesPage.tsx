import { useEffect, useState } from 'react';
import * as reportesApi from '../../api/reportes';
import { ApiError } from '../../api/client';
import type { ProductoMasVendido, VentaPorDia } from '../../types';
import BarChart from '../components/BarChart';
import CsvDownloadButton from '../components/CsvDownloadButton';

function fechaISO(offsetDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toISOString().slice(0, 10);
}

export default function ReportesPage() {
  const [desde, setDesde] = useState(fechaISO(-6));
  const [hasta, setHasta] = useState(fechaISO());
  const [ventas, setVentas] = useState<VentaPorDia[]>([]);
  const [topProductos, setTopProductos] = useState<ProductoMasVendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportes = () => {
    Promise.all([reportesApi.ventas(desde, hasta), reportesApi.productosMasVendidos(10)])
      .then(([v, p]) => {
        setVentas(v);
        setTopProductos(p);
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los reportes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar; "Consultar" recarga manualmente
  }, []);

  const cargar = () => {
    setLoading(true);
    setError('');
    fetchReportes();
  };

  const totalPeriodo = ventas.reduce((acc, v) => acc + v.total_vendido, 0);
  const ordenesPeriodo = ventas.reduce((acc, v) => acc + v.cantidad_ordenes, 0);

  return (
    <>
      <div className="adm-page-header">
        <h1>Reportes</h1>
      </div>

      <div className="adm-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Ventas por período</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div className="adm-field" style={{ marginBottom: 0 }}>
            <label>Desde</label>
            <input className="adm-input" type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div className="adm-field" style={{ marginBottom: 0 }}>
            <label>Hasta</label>
            <input className="adm-input" type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
          <button className="adm-btn adm-btn-primary" onClick={cargar} disabled={loading}>
            {loading ? 'Cargando…' : 'Consultar'}
          </button>
          <CsvDownloadButton onDownload={() => reportesApi.descargarVentasCsv(desde, hasta)} label="Exportar ventas CSV" />
        </div>

        {error && <p className="adm-field-error">{error}</p>}

        {!loading && !error && (
          <>
            <p style={{ color: 'var(--adm-text-dim)', marginBottom: '1rem' }}>
              Total del período: <strong style={{ color: 'var(--adm-text)' }}>S/ {totalPeriodo.toFixed(2)}</strong> en {ordenesPeriodo} orden{ordenesPeriodo === 1 ? '' : 'es'}
            </p>
            <BarChart
              data={ventas.map(v => ({ label: v.fecha.slice(5, 10), value: v.total_vendido }))}
              formatValue={v => `S/${v.toFixed(0)}`}
            />
          </>
        )}
      </div>

      <div className="adm-card">
        <h3 style={{ marginBottom: '1rem' }}>Productos más vendidos</h3>
        {!loading && topProductos.length === 0 && <p className="adm-empty">Sin ventas registradas.</p>}
        {topProductos.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Unidades vendidas</th>
                  <th>Total generado</th>
                </tr>
              </thead>
              <tbody>
                {topProductos.map((p, i) => (
                  <tr key={p.id_producto}>
                    <td>{i + 1}</td>
                    <td>{p.nombre}</td>
                    <td>{p.unidades_vendidas}</td>
                    <td>S/ {p.total_generado.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
