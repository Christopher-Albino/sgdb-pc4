import React, { useState } from 'react';
import { api } from './api.js';

// Usuarios de prueba para facilitar la demostración (clic para autocompletar).
const DEMO = [
  { u: 'admin', p: 'admin123', rol: 'Administrador' },
  { u: 'ana', p: 'ana123', rol: 'Analista' },
  { u: 'caja', p: 'caja123', rol: 'Cajero' },
  { u: 'super', p: 'super123', rol: 'Supervisor' },
  { u: 'geren', p: 'geren123', rol: 'Gerente' },
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
      <form className="login-box" onSubmit={submit}>
        <div className="brand">💳 PrestaFácil</div>
        <p className="subtitle">Sistema de Gestión de Préstamos Personales</p>

        <label className="field">
          <span>Usuario</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <div className="msg error">⚠ {error}</div>}

        <button className="btn primary" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>

        <div className="demo">
          <p className="muted">Usuarios de prueba:</p>
          <div className="demo-chips">
            {DEMO.map((d) => (
              <button
                type="button"
                key={d.u}
                className="chip"
                onClick={() => { setUsername(d.u); setPassword(d.p); }}
              >
                {d.rol}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
