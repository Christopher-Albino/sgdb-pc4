import React, { useState } from 'react';
import Login from './Login.jsx';
import { ClientesPanel, SolicitudesPanel, PagosPanel, ConsultasPanel } from './panels/negocio.jsx';
import { ReportesPanel, AdministracionPanel, SeguridadPanel } from './panels/gestion.jsx';

// Registro de secciones. `roles` define qué rol ve cada sección (segregación de acceso).
const SECTIONS = [
  { key: 'clientes',    label: '👤 Clientes',       bloque: 'ADM01',      roles: ['ANALISTA', 'ADMINISTRADOR'], Comp: ClientesPanel },
  { key: 'solicitudes', label: '📝 Solicitudes',    bloque: 'VAL01–03',   roles: ['ANALISTA'],                   Comp: SolicitudesPanel },
  { key: 'pagos',       label: '💸 Pagos',          bloque: 'VAL05',      roles: ['CAJERO'],                     Comp: PagosPanel },
  { key: 'consultas',   label: '🔍 Consultas',      bloque: 'CON01–05',   roles: ['ANALISTA', 'CAJERO', 'SUPERVISOR', 'ADMINISTRADOR'], Comp: ConsultasPanel },
  { key: 'reportes',    label: '📊 Reportes',       bloque: 'REP01–05',   roles: ['GERENTE', 'SUPERVISOR'],      Comp: ReportesPanel },
  { key: 'admin',       label: '⚙️ Administración', bloque: 'ADM02–05',   roles: ['ADMINISTRADOR'],              Comp: AdministracionPanel },
  { key: 'seguridad',   label: '🔐 Seguridad',      bloque: 'SEG02–05',   roles: ['ADMINISTRADOR'],              Comp: SeguridadPanel },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(null);

  if (!user) {
    return <Login onLogin={(u) => {
      setUser(u);
      const first = SECTIONS.find((s) => s.roles.includes(u.rol));
      setActive(first ? first.key : null);
    }} />;
  }

  const visibles = SECTIONS.filter((s) => s.roles.includes(user.rol));
  const current = visibles.find((s) => s.key === active) || visibles[0];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand small">💳 PrestaFácil</div>
        <nav>
          {visibles.map((s) => (
            <button key={s.key}
              className={`nav-item ${current && current.key === s.key ? 'active' : ''}`}
              onClick={() => setActive(s.key)}>
              <span>{s.label}</span>
              <small>{s.bloque}</small>
            </button>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <strong>{current ? current.label : 'Panel'}</strong>
          </div>
          <div className="user-box">
            <span className="badge">{user.rol}</span>
            <span className="muted">{user.username} · id {user.id}</span>
            <button className="btn ghost" onClick={() => { setUser(null); setActive(null); }}>Salir</button>
          </div>
        </header>

        <section className="content">
          {current
            ? <current.Comp user={user} />
            : <p className="muted">Tu rol no tiene secciones asignadas.</p>}
        </section>
      </div>
    </div>
  );
}
