import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as reportesApi from '../../api/reportes';
import { ApiError } from '../../api/client';
import type { Product, ResumenDashboard, RolNombre } from '../../types';

interface DashboardPageProps {
  rol: RolNombre;
}

export default function DashboardPage({ rol }: DashboardPageProps) {
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [critico, setCritico] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const puedeVerStockCritico = rol === 'administrador' || rol === 'almacen';

  useEffect(() => {
    Promise.all([reportesApi.dashboard(), puedeVerStockCritico ? reportesApi.stockCritico() : Promise.resolve([])])
      .then(([r, c]) => {
        setResumen(r);
        setCritico(c);
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el dashboard'))
      .finally(() => setLoading(false));
  }, [puedeVerStockCritico]);

  if (loading) return <p className="adm-loading">Cargando dashboard…</p>;
  if (error) return <p className="adm-field-error">{error}</p>;
  if (!resumen) return null;

  return (
    <>
      <div className="adm-page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="adm-stat-grid">
        <div className="adm-card adm-stat-card">
          <div className="adm-stat-label">Órdenes hoy</div>
          <div className="adm-stat-value">{resumen.ordenes_hoy}</div>
        </div>
        <div className="adm-card adm-stat-card">
          <div className="adm-stat-label">Ingresos hoy</div>
          <div className="adm-stat-value">S/ {resumen.ingresos_hoy.toFixed(2)}</div>
        </div>
        <div className={`adm-card adm-stat-card${resumen.productos_stock_bajo > 0 ? ' warn' : ''}`}>
          <div className="adm-stat-label">Productos con stock bajo</div>
          <div className="adm-stat-value">{resumen.productos_stock_bajo}</div>
        </div>
      </div>

      {puedeVerStockCritico && (
        <div className="adm-card">
          <h3 style={{ marginBottom: '1rem' }}>Alertas de stock crítico</h3>
          {critico.length === 0 ? (
            <p className="adm-empty">No hay productos por debajo de su stock mínimo.</p>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock actual</th>
                    <th>Stock mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {critico.map(p => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td><span className="adm-badge adm-badge-danger">{p.stock}</span></td>
                      <td>{p.stock_minimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: '1rem' }}>
            <Link to="/admin/inventario" className="adm-btn adm-btn-outline">Ir a Inventario</Link>
          </div>
        </div>
      )}
    </>
  );
}
