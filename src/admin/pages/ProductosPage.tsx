import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import * as productosApi from '../../api/productos';
import * as categoriasApi from '../../api/categorias';
import { ApiError } from '../../api/client';
import type { DatosProducto } from '../../api/productos';
import type { DatosCategoria } from '../../api/categorias';
import type { Category, Product } from '../../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import CsvDownloadButton from '../components/CsvDownloadButton';

const IMAGENES_DISPONIBLES = [
  { valor: '/keyboard.png', label: 'Teclado' },
  { valor: '/mouse.png', label: 'Mouse' },
  { valor: '/headset.png', label: 'Headset' },
  { valor: '/webcam.png', label: 'Webcam' },
  { valor: '/monitor.png', label: 'Monitor' },
  { valor: '/mousepad.png', label: 'Mousepad' },
];

const PRODUCTO_VACIO: DatosProducto = {
  id_categoria: 0,
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  stock_minimo: 5,
  imagen_url: IMAGENES_DISPONIBLES[0].valor,
};

type Tab = 'productos' | 'categorias';

export default function ProductosPage() {
  const [tab, setTab] = useState<Tab>('productos');
  const [categorias, setCategorias] = useState<Category[]>([]);

  useEffect(() => {
    categoriasApi.listar().then(setCategorias).catch(() => {});
  }, []);

  return (
    <>
      <div className="adm-page-header">
        <h1>Productos</h1>
      </div>
      <div className="adm-tabs">
        <button className={`adm-tab${tab === 'productos' ? ' active' : ''}`} onClick={() => setTab('productos')}>
          Productos
        </button>
        <button className={`adm-tab${tab === 'categorias' ? ' active' : ''}`} onClick={() => setTab('categorias')}>
          Categorías
        </button>
      </div>

      {tab === 'productos' ? (
        <ProductosTab categorias={categorias} />
      ) : (
        <CategoriasTab categorias={categorias} onChange={setCategorias} />
      )}
    </>
  );
}

function ProductosTab({ categorias }: { categorias: Category[] }) {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | ''>('');

  const [editando, setEditando] = useState<Product | 'nuevo' | null>(null);
  const [form, setForm] = useState<DatosProducto>(PRODUCTO_VACIO);
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [bajaObjetivo, setBajaObjetivo] = useState<Product | null>(null);

  const nombreCategoria = useMemo(() => {
    const map = new Map(categorias.map(c => [c.id, c.nombre]));
    return (id: number) => map.get(id) ?? `#${id}`;
  }, [categorias]);

  const filtros = useMemo(
    () => ({ buscar: buscar || undefined, categoria: categoriaFiltro || undefined }),
    [buscar, categoriaFiltro]
  );

  const fetchProductos = () => {
    productosApi
      .listarAdmin(filtros)
      .then(setProductos)
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los productos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchProductos se redefine con "filtros" en cada render
  }, [filtros]);

  const cargar = () => {
    setLoading(true);
    setError('');
    fetchProductos();
  };

  const abrirNuevo = () => {
    setForm({ ...PRODUCTO_VACIO, id_categoria: categorias[0]?.id ?? 0 });
    setFormError('');
    setEditando('nuevo');
  };

  const abrirEditar = (p: Product) => {
    setForm({
      id_categoria: p.id_categoria,
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: p.precio,
      stock: p.stock,
      stock_minimo: p.stock_minimo,
      imagen_url: p.imagen_url ?? IMAGENES_DISPONIBLES[0].valor,
    });
    setFormError('');
    setEditando(p);
  };

  const handleGuardar = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      if (editando === 'nuevo') {
        await productosApi.crear(form);
      } else if (editando) {
        await productosApi.actualizar(editando.id, form);
      }
      setEditando(null);
      cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleBaja = async () => {
    if (!bajaObjetivo) return;
    setGuardando(true);
    try {
      await productosApi.eliminar(bajaObjetivo.id);
      setBajaObjetivo(null);
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo dar de baja el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleReactivar = async (p: Product) => {
    try {
      await productosApi.actualizar(p.id, { activo: true });
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo reactivar el producto');
    }
  };

  return (
    <>
      <div className="adm-page-header">
        <div className="adm-page-actions">
          <input
            className="adm-input"
            placeholder="Buscar por nombre…"
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
          />
          <select
            className="adm-select"
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="adm-page-actions">
          <CsvDownloadButton onDownload={() => productosApi.descargarCsv(filtros)} />
          <button className="adm-btn adm-btn-primary" onClick={abrirNuevo}>+ Nuevo producto</button>
        </div>
      </div>

      {loading && <p className="adm-loading">Cargando productos…</p>}
      {error && <p className="adm-field-error">{error}</p>}

      {!loading && !error && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{nombreCategoria(p.id_categoria)}</td>
                  <td>S/ {p.precio.toFixed(2)}</td>
                  <td>
                    <span className={`adm-badge ${p.stock <= p.stock_minimo ? 'adm-badge-danger' : 'adm-badge-success'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    {p.activo ? (
                      <span className="adm-badge adm-badge-success">Activo</span>
                    ) : (
                      <span className="adm-badge adm-badge-neutral">De baja</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => abrirEditar(p)}>
                        Editar
                      </button>
                      {p.activo ? (
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setBajaObjetivo(p)}>
                          Dar de baja
                        </button>
                      ) : (
                        <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => handleReactivar(p)}>
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={6} className="adm-empty">Sin resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <Modal
          title={editando === 'nuevo' ? 'Nuevo producto' : `Editar: ${editando.nombre}`}
          onClose={() => setEditando(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-outline" onClick={() => setEditando(null)} disabled={guardando}>
                Cancelar
              </button>
              <button className="adm-btn adm-btn-primary" form="form-producto" type="submit" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </>
          }
        >
          <form id="form-producto" onSubmit={handleGuardar}>
            <div className="adm-field">
              <label>Nombre</label>
              <input className="adm-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="adm-field">
              <label>Descripción</label>
              <textarea
                className="adm-textarea"
                rows={2}
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
            <div className="adm-field-row">
              <div className="adm-field">
                <label>Categoría</label>
                <select
                  className="adm-select"
                  value={form.id_categoria}
                  onChange={e => setForm({ ...form, id_categoria: Number(e.target.value) })}
                  required
                >
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="adm-field">
                <label>Imagen</label>
                <select className="adm-select" value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })}>
                  {IMAGENES_DISPONIBLES.map(img => (
                    <option key={img.valor} value={img.valor}>{img.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="adm-field-row">
              <div className="adm-field">
                <label>Precio (S/)</label>
                <input
                  className="adm-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio}
                  onChange={e => setForm({ ...form, precio: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="adm-field">
                <label>Stock</label>
                <input
                  className="adm-input"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="adm-field">
              <label>Stock mínimo</label>
              <input
                className="adm-input"
                type="number"
                min="0"
                value={form.stock_minimo}
                onChange={e => setForm({ ...form, stock_minimo: Number(e.target.value) })}
              />
            </div>
            {formError && <p className="adm-field-error">{formError}</p>}
          </form>
        </Modal>
      )}

      {bajaObjetivo && (
        <ConfirmDialog
          title="Dar de baja producto"
          message={`"${bajaObjetivo.nombre}" dejará de verse en el catálogo público, pero conserva su historial de órdenes y kardex. Puedes reactivarlo luego.`}
          confirmLabel="Dar de baja"
          danger
          loading={guardando}
          onConfirm={handleBaja}
          onCancel={() => setBajaObjetivo(null)}
        />
      )}
    </>
  );
}

function CategoriasTab({ categorias, onChange }: { categorias: Category[]; onChange: (c: Category[]) => void }) {
  const [error, setError] = useState('');
  const [editando, setEditando] = useState<Category | 'nuevo' | null>(null);
  const [form, setForm] = useState<DatosCategoria>({ nombre: '', descripcion: '' });
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<Category | null>(null);

  const recargar = () => {
    categoriasApi
      .listar()
      .then(onChange)
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las categorías'));
  };

  const abrirNueva = () => {
    setForm({ nombre: '', descripcion: '' });
    setFormError('');
    setEditando('nuevo');
  };

  const abrirEditar = (c: Category) => {
    setForm({ nombre: c.nombre, descripcion: c.descripcion ?? '' });
    setFormError('');
    setEditando(c);
  };

  const handleGuardar = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      if (editando === 'nuevo') {
        await categoriasApi.crear(form);
      } else if (editando) {
        await categoriasApi.actualizar(editando.id, form);
      }
      setEditando(null);
      recargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la categoría');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!eliminando) return;
    setGuardando(true);
    try {
      await categoriasApi.eliminar(eliminando.id);
      setEliminando(null);
      recargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la categoría');
      setEliminando(null);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="adm-page-header">
        <div />
        <button className="adm-btn adm-btn-primary" onClick={abrirNueva}>+ Nueva categoría</button>
      </div>

      {error && <p className="adm-field-error">{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Nombre</th><th>Descripción</th><th></th></tr>
          </thead>
          <tbody>
            {categorias.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.descripcion ?? '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => abrirEditar(c)}>Editar</button>
                    <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setEliminando(c)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr><td colSpan={3} className="adm-empty">Sin categorías.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editando && (
        <Modal
          title={editando === 'nuevo' ? 'Nueva categoría' : `Editar: ${editando.nombre}`}
          onClose={() => setEditando(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-outline" onClick={() => setEditando(null)} disabled={guardando}>Cancelar</button>
              <button className="adm-btn adm-btn-primary" form="form-categoria" type="submit" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </>
          }
        >
          <form id="form-categoria" onSubmit={handleGuardar}>
            <div className="adm-field">
              <label>Nombre</label>
              <input className="adm-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="adm-field">
              <label>Descripción</label>
              <textarea
                className="adm-textarea"
                rows={2}
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
            {formError && <p className="adm-field-error">{formError}</p>}
          </form>
        </Modal>
      )}

      {eliminando && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Eliminar "${eliminando.nombre}"? Si tiene productos asociados, el servidor rechazará la operación.`}
          confirmLabel="Eliminar"
          danger
          loading={guardando}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
        />
      )}
    </>
  );
}
