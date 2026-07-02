import React, { useState } from 'react';
import Login from './Login.jsx';
import Home from './components/Home.jsx';
import Topbar from './components/Topbar.jsx';
import { ClientesPanel, SolicitudesPanel, PagosPanel, ConsultasPanel } from './panels/negocio.jsx';
import { ReportesPanel, AdministracionPanel, SeguridadPanel } from './panels/gestion.jsx';

// Registro de secciones. `roles` define qué rol ve cada sección (segregación de acceso).
const SECTIONS = [
  { key: 'clientes',    title: 'Clientes',       icon: 'users',     roles: ['ANALISTA', 'ADMINISTRADOR'],                          Comp: ClientesPanel },
  { key: 'solicitudes', title: 'Solicitudes',    icon: 'file',      roles: ['ANALISTA'],                                           Comp: SolicitudesPanel },
  { key: 'pagos',       title: 'Pagos',          icon: 'wallet',    roles: ['CAJERO'],                                             Comp: PagosPanel },
  { key: 'consultas',   title: 'Consultas',      icon: 'search',    roles: ['ANALISTA', 'CAJERO', 'SUPERVISOR', 'ADMINISTRADOR'],  Comp: ConsultasPanel },
  { key: 'reportes',    title: 'Reportes',       icon: 'chart',     roles: ['GERENTE', 'SUPERVISOR'],                              Comp: ReportesPanel },
  { key: 'admin',       title: 'Administración', icon: 'briefcase', roles: ['ADMINISTRADOR'],                                      Comp: AdministracionPanel },
  { key: 'seguridad',   title: 'Seguridad',      icon: 'shield',    roles: ['ADMINISTRADOR'],                                      Comp: SeguridadPanel },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(null);

  if (!user) {
    return <Login onLogin={(u) => {
      setUser(u);
      const vis = SECTIONS.filter((s) => s.roles.includes(u.rol));
      // Si el rol solo tiene una sección, nos la saltamos directo (mismo caso que Clientes/Pagos).
      setActive(vis.length === 1 ? vis[0].key : null);
    }} />;
  }

  const visibles = SECTIONS.filter((s) => s.roles.includes(user.rol));
  const current = visibles.find((s) => s.key === active)
    || (visibles.length === 1 ? visibles[0] : null);

  return (
    <div className="app">
      <Topbar
        title={current ? current.title : null}
        user={user}
        onHome={() => setActive(null)}
        onLogout={() => { setUser(null); setActive(null); }}
      />

      <section className="content">
        {current
          ? <current.Comp user={user} />
          : visibles.length
            ? <Home user={user} sections={visibles.map((s) => ({ ...s, color: 'blue' }))} onSelect={setActive} />
            : <p className="muted">Tu rol no tiene secciones asignadas.</p>}
      </section>
    </div>
  );
}
