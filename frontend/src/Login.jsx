import React, { useState } from 'react';
import { api } from './api.js';
import logo from './logo.png';
import banner from './banner login.png';

// Usuarios de prueba: solo autocompletan el formulario, no inician sesión por sí solos.
// El login real (contra el backend) sigue siendo obligatorio al presionar "Ingresar".
const DEMO = [
  { u: 'admin', p: 'admin123', label: 'Administrador' },
  { u: 'ana', p: 'ana123', label: 'Analista' },
  { u: 'caja', p: 'caja123', label: 'Cajero' },
  { u: 'super', p: 'super123', label: 'Supervisor' },
  { u: 'geren', p: 'geren123', label: 'Gerente' },
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
              onClick={() => { setUsername(d.u); setPassword(d.p); }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
