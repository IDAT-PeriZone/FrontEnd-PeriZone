import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CUENTA_DEMO_CORREO = 'cliente.prueba@perizone.com';
const CUENTA_DEMO_PASS = 'Perizone123!';

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { login, registrar } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', telefono: '', contrasenia: '', confirmar: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.correo.includes('@')) e.correo = 'Correo inválido';
    if (!form.contrasenia) e.contrasenia = 'Ingresa tu contraseña';
    if (mode === 'register') {
      if (!form.nombre) e.nombre = 'Requerido';
      if (!form.apellido) e.apellido = 'Requerido';
      if (form.contrasenia && form.contrasenia.length < 6) e.contrasenia = 'Mínimo 6 caracteres';
      if (form.contrasenia !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setApiError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.correo, form.contrasenia);
      } else {
        await registrar({
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          contrasenia: form.contrasenia,
          telefono: form.telefono || undefined,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <button className="btn-outline" style={{ alignSelf: 'flex-end', padding: '0.25rem 0.75rem' }} onClick={onClose}>
          ×
        </button>

        <div className={`auth-panel auth-panel--active`} style={{ width: '100%', cursor: 'default' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              className={`nav-link ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setErrors({}); setApiError(''); }}
            >
              Iniciar sesión
            </button>
            <button
              className={`nav-link ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setErrors({}); setApiError(''); }}
            >
              Registrarse
            </button>
          </div>

          <h2 className="auth-panel-title">{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
          <p className="auth-panel-sub">
            {mode === 'login' ? 'Ingresa con tus credenciales para continuar.' : 'Regístrate para agregar productos al carrito y comprar.'}
          </p>

          <div className="auth-fields">
            {mode === 'register' && (
              <div className="field-row">
                <div>
                  <label>Nombres</label>
                  <input
                    type="text"
                    placeholder="María"
                    value={form.nombre}
                    onChange={e => set('nombre', e.target.value)}
                    className={errors.nombre ? 'input-error' : ''}
                  />
                  {errors.nombre && <span className="field-error">{errors.nombre}</span>}
                </div>
                <div>
                  <label>Apellidos</label>
                  <input
                    type="text"
                    placeholder="García Ríos"
                    value={form.apellido}
                    onChange={e => set('apellido', e.target.value)}
                    className={errors.apellido ? 'input-error' : ''}
                  />
                  {errors.apellido && <span className="field-error">{errors.apellido}</span>}
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                <label>Teléfono</label>
                <input type="tel" placeholder="+51 999 888 777" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
              </>
            )}

            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={form.correo}
              onChange={e => set('correo', e.target.value)}
              className={errors.correo ? 'input-error' : ''}
            />
            {errors.correo && <span className="field-error">{errors.correo}</span>}

            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={form.contrasenia}
              onChange={e => set('contrasenia', e.target.value)}
              className={errors.contrasenia ? 'input-error' : ''}
              onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleSubmit()}
            />
            {errors.contrasenia && <span className="field-error">{errors.contrasenia}</span>}

            {mode === 'register' && (
              <>
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={form.confirmar}
                  onChange={e => set('confirmar', e.target.value)}
                  className={errors.confirmar ? 'input-error' : ''}
                />
                {errors.confirmar && <span className="field-error">{errors.confirmar}</span>}
              </>
            )}
          </div>

          {apiError && <p className="field-error" style={{ marginTop: '0.75rem' }}>{apiError}</p>}

          <button className="btn-auth-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Procesando…' : mode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARME'}
          </button>

          {mode === 'login' && (
            <div className="auth-demo-hint">
              <p className="auth-demo-hint-title">Cuenta de prueba (sin compras previas)</p>
              <p>
                <code>{CUENTA_DEMO_CORREO}</code> · <code>{CUENTA_DEMO_PASS}</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
