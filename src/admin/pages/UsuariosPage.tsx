import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import * as usuariosApi from '../../api/usuarios';
import { ApiError } from '../../api/client';
import type { NuevoUsuarioInterno } from '../../api/usuarios';
import type { RolNombre, Usuario } from '../../types';
import { ROL_LABEL, ROLES } from '../roles';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import CsvDownloadButton from '../components/CsvDownloadButton';

interface UsuariosPageProps {
  rol: RolNombre;
}

const ROLES_INTERNOS: RolNombre[] = ['administrador', 'finanzas', 'almacen', 'marketing'];

function rolDeUsuario(u: Usuario): RolNombre {
  return ROLES[u.id_rol] ?? 'cliente';
}

const FORM_VACIO: NuevoUsuarioInterno = {
  nombre: '',
  apellido: '',
  correo: '',
  contrasenia: '',
  telefono: '',
  rol: 'almacen',
};

export default function UsuariosPage({ rol }: UsuariosPageProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [creando, setCreando] = useState(false);
  const [formNuevo, setFormNuevo] = useState<NuevoUsuarioInterno>(FORM_VACIO);
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [editando, setEditando] = useState<Usuario | null>(null);
  const [formEdit, setFormEdit] = useState({ nombre: '', apellido: '', telefono: '', activo: true });

  const [desactivando, setDesactivando] = useState<Usuario | null>(null);

  const puedeCrear = rol === 'administrador';
  const puedeDesactivar = rol === 'administrador';

  const fetchUsuarios = () => {
    usuariosApi
      .listar()
      .then(setUsuarios)
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const cargar = () => {
    setLoading(true);
    setError('');
    fetchUsuarios();
  };

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      u => `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
    );
  }, [usuarios, busqueda]);

  const abrirCrear = () => {
    setFormNuevo(FORM_VACIO);
    setFormError('');
    setCreando(true);
  };

  const handleCrear = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      await usuariosApi.crearInterno(formNuevo);
      setCreando(false);
      cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo crear el usuario');
    } finally {
      setGuardando(false);
    }
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setFormEdit({ nombre: u.nombre, apellido: u.apellido, telefono: u.telefono ?? '', activo: !!u.activo });
    setFormError('');
  };

  const handleEditar = async (e: FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setFormError('');
    setGuardando(true);
    try {
      await usuariosApi.actualizar(editando.id, formEdit);
      setEditando(null);
      cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo actualizar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async () => {
    if (!desactivando) return;
    setGuardando(true);
    try {
      await usuariosApi.desactivar(desactivando.id);
      setDesactivando(null);
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo desactivar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="adm-page-header">
        <h1>Usuarios</h1>
        <div className="adm-page-actions">
          <CsvDownloadButton onDownload={usuariosApi.descargarCsv} />
          {puedeCrear && (
            <button className="adm-btn adm-btn-primary" onClick={abrirCrear}>
              + Nuevo usuario interno
            </button>
          )}
        </div>
      </div>

      <div className="adm-field" style={{ maxWidth: 320 }}>
        <input
          className="adm-input"
          placeholder="Buscar por nombre o correo…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {loading && <p className="adm-loading">Cargando usuarios…</p>}
      {error && <p className="adm-field-error">{error}</p>}

      {!loading && !error && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.id}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.correo}</td>
                  <td><span className="adm-badge adm-badge-accent">{ROL_LABEL[rolDeUsuario(u)]}</span></td>
                  <td>{u.telefono ?? '—'}</td>
                  <td>
                    {u.activo ? (
                      <span className="adm-badge adm-badge-success">Activo</span>
                    ) : (
                      <span className="adm-badge adm-badge-danger">Inactivo</span>
                    )}
                  </td>
                  <td>{new Date(u.fecha_creacion).toLocaleDateString('es-PE')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => abrirEditar(u)}>
                        Editar
                      </button>
                      {puedeDesactivar && u.activo === 1 && (
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setDesactivando(u)}>
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="adm-empty">Sin resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {creando && (
        <Modal
          title="Nuevo usuario interno"
          onClose={() => setCreando(false)}
          footer={
            <>
              <button className="adm-btn adm-btn-outline" onClick={() => setCreando(false)} disabled={guardando}>
                Cancelar
              </button>
              <button className="adm-btn adm-btn-primary" form="form-nuevo-usuario" type="submit" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Crear usuario'}
              </button>
            </>
          }
        >
          <form id="form-nuevo-usuario" onSubmit={handleCrear}>
            <div className="adm-field-row">
              <div className="adm-field">
                <label>Nombre</label>
                <input
                  className="adm-input"
                  value={formNuevo.nombre}
                  onChange={e => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="adm-field">
                <label>Apellido</label>
                <input
                  className="adm-input"
                  value={formNuevo.apellido}
                  onChange={e => setFormNuevo({ ...formNuevo, apellido: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="adm-field">
              <label>Correo</label>
              <input
                className="adm-input"
                type="email"
                value={formNuevo.correo}
                onChange={e => setFormNuevo({ ...formNuevo, correo: e.target.value })}
                required
              />
            </div>
            <div className="adm-field-row">
              <div className="adm-field">
                <label>Contraseña</label>
                <input
                  className="adm-input"
                  type="password"
                  value={formNuevo.contrasenia}
                  onChange={e => setFormNuevo({ ...formNuevo, contrasenia: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="adm-field">
                <label>Teléfono</label>
                <input
                  className="adm-input"
                  value={formNuevo.telefono}
                  onChange={e => setFormNuevo({ ...formNuevo, telefono: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-field">
              <label>Rol</label>
              <select
                className="adm-select"
                value={formNuevo.rol}
                onChange={e => setFormNuevo({ ...formNuevo, rol: e.target.value as RolNombre })}
              >
                {ROLES_INTERNOS.map(r => (
                  <option key={r} value={r}>{ROL_LABEL[r]}</option>
                ))}
              </select>
            </div>
            {formError && <p className="adm-field-error">{formError}</p>}
          </form>
        </Modal>
      )}

      {editando && (
        <Modal
          title={`Editar: ${editando.nombre} ${editando.apellido}`}
          onClose={() => setEditando(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-outline" onClick={() => setEditando(null)} disabled={guardando}>
                Cancelar
              </button>
              <button className="adm-btn adm-btn-primary" form="form-editar-usuario" type="submit" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </>
          }
        >
          <form id="form-editar-usuario" onSubmit={handleEditar}>
            <div className="adm-field-row">
              <div className="adm-field">
                <label>Nombre</label>
                <input
                  className="adm-input"
                  value={formEdit.nombre}
                  onChange={e => setFormEdit({ ...formEdit, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="adm-field">
                <label>Apellido</label>
                <input
                  className="adm-input"
                  value={formEdit.apellido}
                  onChange={e => setFormEdit({ ...formEdit, apellido: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="adm-field">
              <label>Teléfono</label>
              <input
                className="adm-input"
                value={formEdit.telefono}
                onChange={e => setFormEdit({ ...formEdit, telefono: e.target.value })}
              />
            </div>
            {puedeDesactivar && (
              <div className="adm-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formEdit.activo}
                    onChange={e => setFormEdit({ ...formEdit, activo: e.target.checked })}
                  />
                  Cuenta activa
                </label>
              </div>
            )}
            {formError && <p className="adm-field-error">{formError}</p>}
          </form>
        </Modal>
      )}

      {desactivando && (
        <ConfirmDialog
          title="Desactivar usuario"
          message={`¿Seguro que quieres desactivar a ${desactivando.nombre} ${desactivando.apellido}? Podrá reactivarse editando su cuenta.`}
          confirmLabel="Desactivar"
          danger
          loading={guardando}
          onConfirm={handleDesactivar}
          onCancel={() => setDesactivando(null)}
        />
      )}
    </>
  );
}
