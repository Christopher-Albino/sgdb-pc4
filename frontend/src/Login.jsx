import React, { useState } from 'react';
import { api } from './api.js';
import logo from './logo.png';
import banner from './banner login.png';

// Usuarios de prueba para facilitar la demostración (clic para autocompletar).
// Los `id`/`rol` en mayúscula coinciden con la carga de 08_datos_prueba.sql
// y con lo que devuelve /api/auth/login (usados por el bypass temporal de abajo).
const DEMO = [
  { id: 1, u: 'admin', p: 'admin123', rol: 'ADMINISTRADOR', label: 'Administrador' },
  { id: 2, u: 'ana', p: 'ana123', rol: 'ANALISTA', label: 'Analista' },
  { id: 3, u: 'caja', p: 'caja123', rol: 'CAJERO', label: 'Cajero' },
  { id: 4, u: 'super', p: 'super123', rol: 'SUPERVISOR', label: 'Supervisor' },
  { id: 5, u: 'geren', p: 'geren123', rol: 'GERENTE', label: 'Gerente' },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(username, password);
      onLogin(res.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-banner" style={{ backgroundImage: `url(${banner})` }} />
      <form className="login-box" onSubmit={submit}>
        <img className="brand-logo" src={logo} alt="PrestaFácil" />
        <p className="subtitle">Sistema de Gestión de Préstamos Personales</p>

        <label className="field">
          <span>Usuario</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <div className="msg error">{error}</div>}

        <button className="btn primary" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <div className="demo-floating">
        <p className="muted">Usuarios de prueba:</p>
        <div className="demo-chips">
          {DEMO.map((d) => (
            <button
              type="button"
              key={d.u}
              className="chip"
              onClick={() => {
                setUsername(d.u);
                setPassword(d.p);
                // TEMPORAL: entra directo sin llamar al backend, para poder
                // navegar la app mientras no hay conexión a Oracle. Cuando el
                // backend esté listo para producción, quitar esta línea y dejar
                // que el usuario presione "Ingresar" (llama a api.login arriba).
                onLogin({ id: d.id, username: d.u, rol: d.rol });
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
