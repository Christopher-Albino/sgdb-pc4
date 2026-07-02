import React, { useState } from 'react';
import { api } from '../api.js';
import { ActionHub, Card, Field, Msg, ResultTable, useAction } from '../ui.jsx';

// ================= REPORTES (Gerente / Supervisor) =================
function ReportCard({ title, run, withTop }) {
  const [top, setTop] = useState(10);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const exec = async () => {
    setLoading(true); setErr(''); setData(null);
    try { const r = await run(top); setData(r.data); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };
  return (
    <Card title={title}>
      {withTop && (
        <div className="grid">
          <Field label="Top N" type="number" value={top} onChange={(v) => setTop(Number(v))} />
        </div>
      )}
      <button className="btn primary" disabled={loading} onClick={exec}>
        {loading ? 'Generando…' : 'Ejecutar reporte'}
      </button>
      {err && <Msg result={{ type: 'error', text: err }} />}
      {data !== null && <ResultTable rows={data} />}
    </Card>
  );
}

const REPORTES_ACCIONES = [
  { key: 'cartera', title: 'Cartera total', icon: 'chart', color: 'blue',
    Comp: () => <ReportCard title="Cartera total de préstamos (por estado)" run={() => api.cartera()} /> },
  { key: 'morosidad', title: 'Índice de morosidad', icon: 'alert', color: 'amber',
    Comp: () => <ReportCard title="Índice de morosidad por mes" run={() => api.morosidad()} /> },
  { key: 'ranking', title: 'Ranking de clientes', icon: 'chart', color: 'blue',
    Comp: () => <ReportCard title="Ranking de clientes por monto (RANK analítico)" withTop run={(top) => api.rankingClientes(top)} /> },
  { key: 'recaudacion', title: 'Recaudación', icon: 'cash', color: 'blue',
    Comp: () => <ReportCard title="Recaudación por período (mes)" run={() => api.recaudacion()} /> },
  { key: 'distribucion', title: 'Distribución', icon: 'chart', color: 'blue',
    Comp: () => <ReportCard title="Distribución por tipo y calificación" run={() => api.distribucion()} /> },
];

export function ReportesPanel() {
  return <ActionHub items={REPORTES_ACCIONES} backLabel="Reportes" />;
}

// ================= ADMINISTRACIÓN =================
const ROLES = ['ADMINISTRADOR', 'ANALISTA', 'CAJERO', 'SUPERVISOR', 'GERENTE'];
const PARAMS = ['PORC_CAPACIDAD', 'DIAS_MOROSIDAD', 'RATIO_A', 'RATIO_B', 'RATIO_C'];

function RegistrarTipoForm() {
  const [tp, setTp] = useState({ nombre: '', tasa: '', monto_min: '', monto_max: '', plazo_min: '', plazo_max: '' });
  const act = useAction();
  const set = (k) => (v) => setTp({ ...tp, [k]: v });
  return (
    <Card title="Registrar tipo de préstamo">
      <div className="grid">
        <Field label="Nombre" value={tp.nombre} onChange={set('nombre')} />
        <Field label="Tasa mensual (ej. 0.025)" type="number" step="0.0001" value={tp.tasa} onChange={set('tasa')} />
        <Field label="Monto mínimo" type="number" value={tp.monto_min} onChange={set('monto_min')} />
        <Field label="Monto máximo" type="number" value={tp.monto_max} onChange={set('monto_max')} />
        <Field label="Plazo mínimo (m)" type="number" value={tp.plazo_min} onChange={set('plazo_min')} />
        <Field label="Plazo máximo (m)" type="number" value={tp.plazo_max} onChange={set('plazo_max')} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.registrarTipoPrestamo({
          nombre: tp.nombre, tasa: Number(tp.tasa), monto_min: Number(tp.monto_min),
          monto_max: Number(tp.monto_max), plazo_min: Number(tp.plazo_min), plazo_max: Number(tp.plazo_max),
        });
        return `${r.mensaje}. ID = ${r.id_tipo}`;
      })}>Registrar tipo</button>
      <Msg result={act.result} />
    </Card>
  );
}

function ActualizarTasaForm() {
  const [tasa, setTasa] = useState({ id: '', valor: '' });
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="ID Tipo" type="number" value={tasa.id} onChange={(v) => setTasa({ ...tasa, id: v })} />
        <Field label="Nueva tasa" type="number" step="0.0001" value={tasa.valor} onChange={(v) => setTasa({ ...tasa, valor: v })} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.actualizarTasa(Number(tasa.id), Number(tasa.valor));
        return r.mensaje;
      })}>Actualizar tasa</button>
      <Msg result={act.result} />
    </>
  );
}

function CrearUsuarioForm({ user }) {
  const [usr, setUsr] = useState({ username: '', password: '', nombre_rol: 'ANALISTA', nombre: '', email: '' });
  const act = useAction();
  return (
    <Card title="Crear usuario del sistema">
      <div className="grid">
        <Field label="Username" value={usr.username} onChange={(v) => setUsr({ ...usr, username: v })} />
        <Field label="Contraseña" value={usr.password} onChange={(v) => setUsr({ ...usr, password: v })} />
        <label className="field">
          <span>Rol</span>
          <select value={usr.nombre_rol} onChange={(e) => setUsr({ ...usr, nombre_rol: e.target.value })}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <Field label="Nombre completo" value={usr.nombre} onChange={(v) => setUsr({ ...usr, nombre: v })} />
        <Field label="Email" value={usr.email} onChange={(v) => setUsr({ ...usr, email: v })} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.crearUsuario({ ...usr, id_admin: user.id });
        return `${r.mensaje}. ID = ${r.id_usuario}`;
      })}>Crear usuario</button>
      <Msg result={act.result} />
      <p className="hint">Requiere el permiso GESTIONAR_USUARIOS.</p>
    </Card>
  );
}

function ActualizarParametroForm({ user }) {
  const [par, setPar] = useState({ codigo: 'PORC_CAPACIDAD', valor: '' });
  const act = useAction();
  return (
    <>
      <div className="grid">
        <label className="field">
          <span>Parámetro</span>
          <select value={par.codigo} onChange={(e) => setPar({ ...par, codigo: e.target.value })}>
            {PARAMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <Field label="Nuevo valor" value={par.valor} onChange={(v) => setPar({ ...par, valor: v })} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.actualizarParametro(par.codigo, par.valor, user.id);
        return r.mensaje;
      })}>Actualizar parámetro</button>
      <Msg result={act.result} />
    </>
  );
}

function AgregarListaNegraForm({ user }) {
  const [ln, setLn] = useState({ id_cliente: '', motivo: '' });
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="ID Cliente" type="number" value={ln.id_cliente} onChange={(v) => setLn({ ...ln, id_cliente: v })} />
        <Field label="Motivo" value={ln.motivo} onChange={(v) => setLn({ ...ln, motivo: v })} />
      </div>
      <button className="btn danger" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.agregarListaNegra({ id_cliente: Number(ln.id_cliente), motivo: ln.motivo, id_usuario_reg: user.id });
        return `${r.mensaje}. ID = ${r.id_lista}`;
      })}>Agregar a lista negra</button>
      <Msg result={act.result} />
    </>
  );
}

function QuitarListaNegraForm() {
  const [idCliente, setIdCliente] = useState('');
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="ID Cliente" type="number" value={idCliente} onChange={setIdCliente} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.quitarListaNegra(Number(idCliente));
        return r.mensaje;
      })}>Quitar de lista negra</button>
      <Msg result={act.result} />
    </>
  );
}

const ADMINISTRACION_ACCIONES = [
  { key: 'tipo', title: 'Registrar tipo de préstamo', icon: 'plus', color: 'green', Comp: RegistrarTipoForm },
  { key: 'tasa', title: 'Actualizar tasa', icon: 'edit', color: 'blue', mode: 'modal', Comp: ActualizarTasaForm },
  { key: 'usuario', title: 'Crear usuario', icon: 'users', color: 'green', Comp: CrearUsuarioForm },
  { key: 'parametro', title: 'Actualizar parámetro', icon: 'edit', color: 'blue', mode: 'modal', Comp: ActualizarParametroForm },
  { key: 'ln-add', title: 'Agregar a lista negra', icon: 'alert', color: 'red', mode: 'modal', Comp: AgregarListaNegraForm },
  { key: 'ln-del', title: 'Quitar de lista negra', icon: 'check', color: 'blue', mode: 'modal', Comp: QuitarListaNegraForm },
];

export function AdministracionPanel({ user }) {
  return <ActionHub items={ADMINISTRACION_ACCIONES} user={user} backLabel="Administración" />;
}

// ================= SEGURIDAD =================
const OPERACIONES = [
  'REGISTRAR_SOLICITUD', 'APROBAR_PRESTAMO', 'REGISTRAR_PAGO',
  'GESTIONAR_USUARIOS', 'GESTIONAR_PARAMETROS', 'CONSULTAR_OPERATIVO', 'VER_REPORTES',
];

function VerificarPermisoForm() {
  const [perm, setPerm] = useState({ id_usuario: '', cod: 'APROBAR_PRESTAMO' });
  const [permRes, setPermRes] = useState(null);
  const [permErr, setPermErr] = useState('');
  const verificar = async () => {
    setPermErr(''); setPermRes(null);
    try {
      const r = await api.verificarPermiso(Number(perm.id_usuario), perm.cod);
      setPermRes(r.permitido);
    } catch (e) { setPermErr(e.message); }
  };
  return (
    <>
      <div className="grid">
        <Field label="ID Usuario" type="number" value={perm.id_usuario} onChange={(v) => setPerm({ ...perm, id_usuario: v })} />
        <label className="field">
          <span>Operación</span>
          <select value={perm.cod} onChange={(e) => setPerm({ ...perm, cod: e.target.value })}>
            {OPERACIONES.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
      </div>
      <button className="btn primary" onClick={verificar}>Verificar permiso</button>
      {permErr && <Msg result={{ type: 'error', text: permErr }} />}
      {permRes !== null && (
        <div className={`msg ${permRes ? 'ok' : 'error'}`}>
          {permRes ? 'PERMITIDO' : 'DENEGADO'} — usuario {perm.id_usuario} / {perm.cod}
        </div>
      )}
      <p className="hint">Prueba usuario 5 (geren) con APROBAR_PRESTAMO → DENEGADO. Con VER_REPORTES → PERMITIDO.</p>
    </>
  );
}

function RegistrarAuditoriaForm({ user }) {
  const [aud, setAud] = useState({ accion: '', entidad: '', id_registro: '', detalle: '' });
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="Acción" value={aud.accion} onChange={(v) => setAud({ ...aud, accion: v })} />
        <Field label="Entidad" value={aud.entidad} onChange={(v) => setAud({ ...aud, entidad: v })} />
        <Field label="ID Registro" type="number" value={aud.id_registro} onChange={(v) => setAud({ ...aud, id_registro: v })} />
        <Field label="Detalle" value={aud.detalle} onChange={(v) => setAud({ ...aud, detalle: v })} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.registrarAuditoria({
          id_usuario: user.id, accion: aud.accion, entidad: aud.entidad,
          id_registro: aud.id_registro ? Number(aud.id_registro) : null, detalle: aud.detalle,
        });
        return r.mensaje;
      })}>Registrar auditoría</button>
      <Msg result={act.result} />
    </>
  );
}

function DesbloquearUsuarioForm() {
  const [idDesb, setIdDesb] = useState('');
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="ID Usuario" type="number" value={idDesb} onChange={setIdDesb} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.desbloquearUsuario(Number(idDesb));
        return r.mensaje;
      })}>Desbloquear</button>
      <Msg result={act.result} />
      <p className="hint">Para cuentas bloqueadas tras 3 intentos fallidos.</p>
    </>
  );
}

function EncriptarForm() {
  const [texto, setTexto] = useState('');
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="Texto a encriptar" value={texto} onChange={setTexto} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.encriptar(texto);
        return `Encriptado (hex): ${r.encriptado_hex}`;
      })}>Encriptar</button>
      <Msg result={act.result} />
    </>
  );
}

function DesencriptarForm() {
  const [hex, setHex] = useState('');
  const act = useAction();
  return (
    <>
      <div className="grid">
        <Field label="Hex a desencriptar" value={hex} onChange={setHex} />
      </div>
      <button className="btn primary" disabled={act.loading} onClick={() => act.runAction(async () => {
        const r = await api.desencriptar(hex);
        return `Texto original: ${r.texto}`;
      })}>Desencriptar</button>
      <Msg result={act.result} />
    </>
  );
}

const SEGURIDAD_ACCIONES = [
  { key: 'permiso', title: 'Verificar permiso', icon: 'shield', color: 'blue', mode: 'modal', Comp: VerificarPermisoForm },
  { key: 'auditoria', title: 'Registrar auditoría', icon: 'file', color: 'blue', mode: 'modal', Comp: RegistrarAuditoriaForm },
  { key: 'desbloquear', title: 'Desbloquear usuario', icon: 'unlock', color: 'green', mode: 'modal', Comp: DesbloquearUsuarioForm },
  { key: 'encriptar', title: 'Encriptar dato', icon: 'lock', color: 'blue', mode: 'modal', Comp: EncriptarForm },
  { key: 'desencriptar', title: 'Desencriptar dato', icon: 'lock', color: 'slate', mode: 'modal', Comp: DesencriptarForm },
];

export function SeguridadPanel({ user }) {
  return <ActionHub items={SEGURIDAD_ACCIONES} user={user} backLabel="Seguridad" />;
}
