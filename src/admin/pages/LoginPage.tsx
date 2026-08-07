import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError, getRolFromToken } from '../../api/client';
import { esRolInterno } from '../roles';

export default function LoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(correo, contrasenia);
      const rol = getRolFromToken();
      if (!esRolInterno(rol)) {
        logout();
        setError('Esta cuenta no tiene acceso al panel administrativo.');
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <span className="brand-peri">PERI</span><span className="brand-zone">ZONE</span>
        </div>
        <p className="adm-login-subtitle">Panel administrativo</p>
        <form onSubmit={handleSubmit}>
          <div className="adm-field">
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              className="adm-input"
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="adm-field">
            <label htmlFor="contrasenia">Contraseña</label>
            <input
              id="contrasenia"
              className="adm-input"
              type="password"
              value={contrasenia}
              onChange={e => setContrasenia(e.target.value)}
              required
            />
          </div>
          {error && <p className="adm-field-error">{error}</p>}
          <button
            className="adm-btn adm-btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
