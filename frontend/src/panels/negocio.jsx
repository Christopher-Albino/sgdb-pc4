import React, { useState } from 'react';
import { api } from '../api.js';
import { ActionHub, Card, Field, Msg, ResultTable, useAction } from '../ui.jsx';

// Tipos de préstamo sembrados en los datos de prueba (ADM02).
const TIPOS = [
  { id: 1, nombre: 'Personal (2.5%) · S/1000–30000 · 6–36m' },
  { id: 2, nombre: 'Emprendedor (3%) · S/5000–50000 · 12–48m' },
  { id: 3, nombre: 'Express (4%) · S/500–5000 · 3–12m' },
];

// ================= SOLICITUDES (Analista) =================
function RegistrarSolicitudForm({ user }) {
  const [f, setF] = useState({ id_cliente: '', id_tipo_prestamo: 1, monto: '', plazo_meses: '' });
  const act = useAction();
  const set = (k) => (v) => setF({ ...f, [k]: v });
  return (
    <Card title="Registrar solicitud de préstamo">
      <div className="grid">
        <Field label="ID Cliente" type="number" value={f.id_cliente} onChange={set('id_cliente')} />
        <label className="field">
          <span>Tipo de préstamo</span>
          <select value={f.id_tipo_prestamo} onChange={(e) => set('id_tipo_prestamo')(Number(e.target.value))}>
            {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </label>
        <Field label="Monto (S/)" type="number" value={f.monto} onChange={set('monto')} />
        <Field label="Plazo (meses)" type="number" value={f.plazo_meses} onChange={set('plazo_meses')} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.registrarSolicitud({
          id_cliente: Number(f.id_cliente), id_tipo_prestamo: f.id_tipo_prestamo,
          monto: Number(f.monto), plazo_meses: Number(f.plazo_meses), id_analista: user.id,
        });
        return `${r.mensaje}. ID solicitud = ${r.id_solicitud}`;
      })}>Registrar</button>
      <Msg result={act.result} />
    </Card>
  );
}

function EvaluarSolicitudForm() {
  const [idSol, setIdSol] = useState('');
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="ID Solicitud" type="number" value={idSol} onChange={setIdSol} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.evaluarSolicitud(Number(idSol));
        return `Calificación asignada: ${r.calificacion}`;
      })}>Evaluar</button>
      <Msg result={act.result} />
      <p className="hint">Calcula automáticamente la calificación crediticia (A/B/C/D). La D se rechaza sola al decidir.</p>
    </>
  );
}

function AprobarSolicitudForm({ user }) {
  const [idSol, setIdSol] = useState('');
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="ID Solicitud" type="number" value={idSol} onChange={setIdSol} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.decidirSolicitud(Number(idSol), 'APROBAR', user.id);
        return r.mensaje;
      })}>Aprobar</button>
      <Msg result={act.result} />
      <p className="hint">Al aprobar se genera automáticamente el cronograma de cuotas.</p>
    </>
  );
}

function RechazarSolicitudForm({ user }) {
  const [idSol, setIdSol] = useState('');
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="ID Solicitud" type="number" value={idSol} onChange={setIdSol} />
      </div>
      <button className="btn danger" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.decidirSolicitud(Number(idSol), 'RECHAZAR', user.id);
        return r.mensaje;
      })}>Rechazar</button>
      <Msg result={act.result} />
    </>
  );
}

const SOLICITUDES_ACCIONES = [
  { key: 'registrar', title: 'Registrar solicitud', icon: 'plus', color: 'green', Comp: RegistrarSolicitudForm },
  { key: 'evaluar', title: 'Evaluar capacidad', icon: 'chart', color: 'blue', mode: 'modal', desc: 'Calcula la calificación crediticia (A/B/C/D)', Comp: EvaluarSolicitudForm },
  { key: 'aprobar', title: 'Aprobar solicitud', icon: 'check', color: 'green', mode: 'modal', desc: 'Aprueba una solicitud ya evaluada', Comp: AprobarSolicitudForm },
  { key: 'rechazar', title: 'Rechazar solicitud', icon: 'x', color: 'red', mode: 'modal', desc: 'Rechaza una solicitud ya evaluada', Comp: RechazarSolicitudForm },
];

export function SolicitudesPanel({ user }) {
  return <ActionHub items={SOLICITUDES_ACCIONES} user={user} backLabel="Solicitudes" />;
}

// ================= PAGOS (Cajero) =================
function RegistrarPagoForm({ user }) {
  const [f, setF] = useState({ id_cuota: '', monto: '', medio_pago: 'EFECTIVO' });
  const act = useAction();
  const set = (k) => (v) => setF({ ...f, [k]: v });
  return (
    <Card title="Registrar pago de cuota">
      <div className="grid">
        <Field label="ID Cuota" type="number" value={f.id_cuota} onChange={set('id_cuota')} />
        <Field label="Monto (S/)" type="number" value={f.monto} onChange={set('monto')} />
        <label className="field">
          <span>Medio de pago</span>
          <select value={f.medio_pago} onChange={(e) => set('medio_pago')(e.target.value)}>
            <option>EFECTIVO</option><option>TRANSFERENCIA</option><option>TARJETA</option>
          </select>
        </label>
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.registrarPago({
          id_cuota: Number(f.id_cuota), monto: Number(f.monto),
          medio_pago: f.medio_pago, id_cajero: user.id,
        });
        return r.mensaje;
      })}>Registrar pago</button>
      <Msg result={act.result} />
      <p className="hint">El ID de cuota lo obtienes en Consultas → Cronograma de un préstamo aprobado.</p>
    </Card>
  );
}

const PAGOS_ACCIONES = [
  { key: 'nuevo', title: 'Registrar pago', icon: 'cash', color: 'green', Comp: RegistrarPagoForm },
];

export function PagosPanel({ user }) {
  return <ActionHub items={PAGOS_ACCIONES} user={user} backLabel="Pagos" />;
}

// ================= CLIENTES (Analista / Admin) =================
function NuevoClienteForm({ user }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({
    dni: '', nombres: '', apellidos: '', fecha_nac: '1990-01-01',
    telefono: '', email: '', direccion: '', ingreso: '',
  });
  const act = useAction();
  const set = (k) => (v) => setF({ ...f, [k]: v });
  return (
    <Card title="Registrar cliente">
      <p className="section-label">Identificación</p>
      <div className="grid">
        <Field label="DNI" value={f.dni} onChange={set('dni')} maxLength={8} />
        <Field label="Nombres" value={f.nombres} onChange={set('nombres')} />
        <Field label="Apellidos" value={f.apellidos} onChange={set('apellidos')} />
        <Field label="Fecha nacimiento" type="date" value={f.fecha_nac} onChange={set('fecha_nac')} max={hoy} />
      </div>

      <p className="section-label">Contacto</p>
      <div className="grid">
        <Field label="Teléfono" value={f.telefono} onChange={set('telefono')} />
        <Field label="Email" value={f.email} onChange={set('email')} />
        <Field label="Dirección" value={f.direccion} onChange={set('direccion')} />
      </div>

      <p className="section-label">Datos financieros</p>
      <div className="grid">
        <Field label="Ingreso mensual (S/)" type="number" value={f.ingreso} onChange={set('ingreso')} />
      </div>

      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.registrarCliente({ ...f, ingreso: Number(f.ingreso), id_usuario_reg: user.id });
        return `${r.mensaje}. ID cliente = ${r.id_cliente}`;
      })}>Registrar cliente</button>
      <Msg result={act.result} />
    </Card>
  );
}

const CLIENTES_ACCIONES = [
  { key: 'nuevo', title: 'Añadir cliente', icon: 'plus', color: 'green', desc: 'Registrar un cliente nuevo', Comp: NuevoClienteForm },
];

export function ClientesPanel({ user }) {
  return <ActionHub items={CLIENTES_ACCIONES} user={user} backLabel="Clientes" />;
}

// ================= CONSULTAS OPERATIVAS =================
const CONSULTAS = [
  {
    key: 'cronograma', title: 'Cronograma', icon: 'calendar', color: 'blue',
    desc: 'Ver las cuotas y fechas de vencimiento de un préstamo aprobado',
    Comp: () => <QueryCard title="Cronograma de un préstamo"
      inputs={[{ key: 'id', label: 'ID Préstamo', type: 'number' }]}
      run={(v) => api.cronograma(Number(v.id))} />,
  },
  {
    key: 'estado', title: 'Saldo y estado', icon: 'wallet', color: 'blue', mode: 'modal',
    desc: 'Ver cuánto falta pagar y en qué estado se encuentra',
    Comp: () => <QueryCard bare
      inputs={[{ key: 'id', label: 'ID Préstamo', type: 'number' }]}
      run={(v) => api.estadoPrestamo(Number(v.id))} />,
  },
  {
    key: 'historial', title: 'Historial de pagos', icon: 'clock', color: 'blue',
    desc: 'Ver todos los pagos registrados de un cliente',
    Comp: () => <QueryCard title="Historial de pagos de un cliente"
      inputs={[{ key: 'id', label: 'ID Cliente', type: 'number' }]}
      run={(v) => api.historialPagos(Number(v.id))} />,
  },
  {
    key: 'buscar', title: 'Buscar clientes', icon: 'search', color: 'blue',
    desc: 'Buscar por nombre, apellido o DNI',
    Comp: () => <QueryCard title="Buscar clientes por nombre / apellido / DNI"
      inputs={[{ key: 'c', label: 'Criterio' }]}
      run={(v) => api.buscarClientes(v.c || '')} />,
  },
  {
    key: 'morosos', title: 'Cuotas morosas', icon: 'alert', color: 'amber',
    desc: 'Ver cuotas vencidas, de un cliente o de todos',
    Comp: () => <QueryCard title="Cuotas vencidas / morosas"
      inputs={[{ key: 'id', label: 'ID Cliente (vacío = todas)', type: 'number', optional: true }]}
      run={(v) => api.cuotasMorosas(v.id ? Number(v.id) : null)} />,
  },
];

export function ConsultasPanel() {
  return <ActionHub items={CONSULTAS} backLabel="Consultas" />;
}

// Tarjeta genérica de consulta: inputs -> botón -> tabla de resultados.
// `bare`: sin el envoltorio <Card> (para cuando ya se muestra dentro de un Modal).
export function QueryCard({ title, inputs, run, bare }) {
  const [vals, setVals] = useState({});
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const exec = async () => {
    setLoading(true); setErr(''); setData(null);
    try {
      const r = await run(vals);
      setData(r.data);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };
  const content = (
    <>
      <div className="grid">
        {inputs.map((inp) => (
          <Field key={inp.key} label={inp.label} type={inp.type || 'text'}
            value={vals[inp.key] || ''} onChange={(v) => setVals({ ...vals, [inp.key]: v })} />
        ))}
      </div>
      <button className="btn" disabled={loading} onClick={exec}>{loading ? 'Consultando…' : 'Consultar'}</button>
      {err && <Msg result={{ type: 'error', text: err }} />}
      {data !== null && <ResultTable rows={data} />}
    </>
  );
  return bare ? content : <Card title={title}>{content}</Card>;
}
