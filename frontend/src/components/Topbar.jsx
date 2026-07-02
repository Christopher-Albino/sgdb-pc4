import React from 'react';
import logo from '../logo.png';

export default function Topbar({ title, user, onHome, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-home" title="Ir al inicio" onClick={onHome}>
          <img src={logo} alt="PrestaFácil" />
        </button>
        {title && <span className="crumb">{title}</span>}
      </div>
      <div className="user-box">
        <span className="badge">{user.rol}</span>
        <span className="muted">{user.username} · id {user.id}</span>
        <button className="btn ghost" onClick={onLogout}>Salir</button>
      </div>
    </header>
  );
}
