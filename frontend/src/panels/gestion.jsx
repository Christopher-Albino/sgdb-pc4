import React, { useState } from 'react';
import { api } from '../api.js';
import { Card, Field, Msg, ResultTable, useAction } from '../ui.jsx';

// ================= REP01–REP05: REPORTES (Gerente / Supervisor) =================
export function ReportesPanel() {
  return (
    <>
      <ReportCard code="REP01" title="Cartera total de préstamos (por estado)" run={() => api.cartera()} />
      <ReportCard code="REP02" title="Índice de morosidad por mes" run={() => api.morosidad()} />
      <ReportCard code="REP03" title="Ranking de clientes por monto (RANK analítico)"
        withTop run={(top) => api.rankingClientes(top)} />
      <ReportCard code="REP04" title="Recaudación por período (mes)" run={() => api.recaudacion()} />
      <ReportCard code="REP05" title="Distribución por tipo y calificación" run={() => api.distribucion()} />
    </>
  );
}

function ReportCard({ code, title, run, withTop }) {
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
    <Card code={code} title={title}>
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

// ================= ADM02–ADM05: ADMINISTRACIÓN =================
const ROLES = ['ADMINISTRADOR', 'ANALISTA', 'CAJERO', 'SUPERVISOR', 'GERENTE'];
const PARAMS = ['PORC_CAPACIDAD', 'DIAS_MOROSIDAD', 'RATIO_A', 'RATIO_B', 'RATIO_C'];

export function AdministracionPanel({ user }) {
  const [tp, setTp] = useState({ nombre: '', tasa: '', monto_min: '', monto_max: '', plazo_min: '', plazo_max: '' });
  const [tasa, setTasa] = useState({ id: '', valor: '' });
  const [usr, setUsr] = useState({ username: '', password: '', nombre_rol: 'ANALISTA', nombre: '', email: '' });
  const [par, setPar] = useState({ codigo: 'PORC_CAPACIDAD', valor: '' });
  const [ln, setLn] = useState({ id_cliente: '', motivo: '' });
  const aTp = useAction(); const aTasa = useAction(); const aUsr = useAction();
  const aPar = useAction(); const aLnAdd = useAction(); const aLnDel = useAction();
  const setT = (k) => (v) => setTp({ ...tp, [k]: v });

  return (
    <>
      <Card code="ADM02" title="Registrar tipo de préstamo">
        <div className="grid">
          <Field label="Nombre" value={tp.nombre} onChange={setT('nombre')} />
          <Field label="Tasa mensual (ej. 0.025)" type="number" step="0.0001" value={tp.tasa} onChange={setT('tasa')} />
          <Field label="Monto mínimo" type="number" value={tp.monto_min} onChange={setT('monto_min')} />
          <Field label="Monto máximo" type="number" value={tp.monto_max} onChange={setT('monto_max')} />
          <Field label="Plazo mínimo (m)" type="number" value={tp.plazo_min} onChange={setT('plazo_min')} />
          <Field label="Plazo máximo (m)" type="number" value={tp.plazo_max} onChange={setT('plazo_max')} />
        </div>
        <button className="btn primary" disabled={aTp.loading} onClick={() => aTp.runAction(async () => {
          const r = await api.registrarTipoPrestamo({
            nombre: tp.nombre, tasa: Number(tp.tasa), monto_min: Number(tp.monto_min),
            monto_max: Number(tp.monto_max), plazo_min: Number(tp.plazo_min), plazo_max: Number(tp.plazo_max),
          });
          return `${r.mensaje}. ID = ${r.id_tipo}`;
        })}>Registrar tipo</button>
        <Msg result={aTp.result} />
      </Card>

      <Card code="ADM02" title="Actualizar tasa de un tipo de préstamo">
        <div className="grid">
          <Field label="ID Tipo" type="number" value={tasa.id} onChange={(v) => setTasa({ ...tasa, id: v })} />
          <Field label="Nueva tasa" type="number" step="0.0001" value={tasa.valor} onChange={(v) => setTasa({ ...tasa, valor: v })} />
        </div>
        <button className="btn" disabled={aTasa.loading} onClick={() => aTasa.runAction(async () => {
          const r = await api.actualizarTasa(Number(tasa.id), Number(tasa.valor));
          return r.mensaje;
        })}>Actualizar tasa</button>
        <Msg result={aTasa.result} />
      </Card>

      <Card code="ADM03" title="Crear usuario del sistema (requiere permiso GESTIONAR_USUARIOS)">
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
        <button className="btn primary" disabled={aUsr.loading} onClick={() => aUsr.runAction(async () => {
          const r = await api.crearUsuario({ ...usr, id_admin: user.id });
          return `${r.mensaje}. ID = ${r.id_usuario}`;
        })}>Crear usuario</button>
        <Msg result={aUsr.result} />
      </Card>

      <Card code="ADM04" title="Actualizar parámetro del sistema">
        <div className="grid">
          <label className="field">
            <span>Parámetro</span>
            <select value={par.codigo} onChange={(e) => setPar({ ...par, codigo: e.target.value })}>
              {PARAMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <Field label="Nuevo valor" value={par.valor} onChange={(v) => setPar({ ...par, valor: v })} />
        </div>
        <button className="btn" disabled={aPar.loading} onClick={() => aPar.runAction(async () => {
          const r = await api.actualizarParametro(par.codigo, par.valor, user.id);
          return r.mensaje;
        })}>Actualizar parámetro</button>
        <Msg result={aPar.result} />
      </Card>

      <Card code="ADM05" title="Lista negra de clientes">
        <div className="grid">
          <Field label="ID Cliente" type="number" value={ln.id_cliente} onChange={(v) => setLn({ ...ln, id_cliente: v })} />
          <Field label="Motivo" value={ln.motivo} onChange={(v) => setLn({ ...ln, motivo: v })} />
        </div>
        <div className="row">
          <button className="btn primary" disabled={aLnAdd.loading} onClick={() => aLnAdd.runAction(async () => {
            const r = await api.agregarListaNegra({ id_cliente: Number(ln.id_cliente), motivo: ln.motivo, id_usuario_reg: user.id });
            return `${r.mensaje}. ID = ${r.id_lista}`;
          })}>Agregar a lista negra</button>
          <button className="btn danger" disabled={aLnDel.loading} onClick={() => aLnDel.runAction(async () => {
            const r = await api.quitarListaNegra(Number(ln.id_cliente));
            return r.mensaje;
          })}>Quitar de lista negra</button>
        </div>
        <Msg result={aLnAdd.result} />
        <Msg result={aLnDel.result} />
      </Card>
    </>
  );
}

// ================= SEG02–SEG05: SEGURIDAD =================
const OPERACIONES = [
  'REGISTRAR_SOLICITUD', 'APROBAR_PRESTAMO', 'REGISTRAR_PAGO',
  'GESTIONAR_USUARIOS', 'GESTIONAR_PARAMETROS', 'CONSULTAR_OPERATIVO', 'VER_REPORTES',
];

export function SeguridadPanel({ user }) {
  const [perm, setPerm] = useState({ id_usuario: '', cod: 'APROBAR_PRESTAMO' });
  const [permRes, setPermRes] = useState(null);
  const [permErr, setPermErr] = useState('');
  const [aud, setAud] = useState({ accion: '', entidad: '', id_registro: '', detalle: '' });
  const [idDesb, setIdDesb] = useState('');
  const [texto, setTexto] = useState('');
  const [hex, setHex] = useState('');
  const aAud = useAction(); const aDesb = useAction(); const aEnc = useAction(); const aDec = useAction();

  const verificar = async () => {
    setPermErr(''); setPermRes(null);
    try {
      const r = await api.verificarPermiso(Number(perm.id_usuario), perm.cod);
      setPermRes(r.permitido);
    } catch (e) { setPermErr(e.message); }
  };

  return (
    <>
      <Card code="SEG02" title="Verificar permiso por rol (demuestra que el Gerente NO puede aprobar)">
        <div className="grid">
          <Field label="ID Usuario" type="number" value={perm.id_usuario} onChange={(v) => setPerm({ ...perm, id_usuario: v })} />
          <label className="field">
            <span>Operación</span>
            <select value={perm.cod} onChange={(e) => setPerm({ ...perm, cod: e.target.value })}>
              {OPERACIONES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        </div>
        <button className="btn" onClick={verificar}>Verificar permiso</button>
        {permErr && <Msg result={{ type: 'error', text: permErr }} />}
        {permRes !== null && (
          <div className={`msg ${permRes ? 'ok' : 'error'}`}>
            {permRes ? '✓ PERMITIDO' : '⛔ DENEGADO'} — usuario {perm.id_usuario} / {perm.cod}
          </div>
        )}
        <p className="hint">💡 Prueba usuario 5 (geren) con APROBAR_PRESTAMO → DENEGADO. Con VER_REPORTES → PERMITIDO.</p>
      </Card>

      <Card code="SEG03" title="Registrar auditoría manual (bitácora)">
        <div className="grid">
          <Field label="Acción" value={aud.accion} onChange={(v) => setAud({ ...aud, accion: v })} />
          <Field label="Entidad" value={aud.entidad} onChange={(v) => setAud({ ...aud, entidad: v })} />
          <Field label="ID Registro" type="number" value={aud.id_registro} onChange={(v) => setAud({ ...aud, id_registro: v })} />
          <Field label="Detalle" value={aud.detalle} onChange={(v) => setAud({ ...aud, detalle: v })} />
        </div>
        <button className="btn" disabled={aAud.loading} onClick={() => aAud.runAction(async () => {
          const r = await api.registrarAuditoria({
            id_usuario: user.id, accion: aud.accion, entidad: aud.entidad,
            id_registro: aud.id_registro ? Number(aud.id_registro) : null, detalle: aud.detalle,
          });
          return r.mensaje;
        })}>Registrar auditoría</button>
        <Msg result={aAud.result} />
      </Card>

      <Card code="SEG04" title="Desbloquear usuario (tras 3 intentos fallidos)">
        <div className="grid">
          <Field label="ID Usuario" type="number" value={idDesb} onChange={setIdDesb} />
        </div>
        <button className="btn" disabled={aDesb.loading} onClick={() => aDesb.runAction(async () => {
          const r = await api.desbloquearUsuario(Number(idDesb));
          return r.mensaje;
        })}>Desbloquear</button>
        <Msg result={aDesb.result} />
      </Card>

      <Card code="SEG05" title="Encriptar / desencriptar dato sensible (AES256)">
        <div className="grid">
          <Field label="Texto a encriptar" value={texto} onChange={setTexto} />
        </div>
        <button className="btn primary" disabled={aEnc.loading} onClick={() => aEnc.runAction(async () => {
          const r = await api.encriptar(texto);
          setHex(r.encriptado_hex);
          return `Encriptado (hex): ${r.encriptado_hex}`;
        })}>Encriptar</button>
        <Msg result={aEnc.result} />
        <div className="grid" style={{ marginTop: 12 }}>
          <Field label="Hex a desencriptar" value={hex} onChange={setHex} />
        </div>
        <button className="btn" disabled={aDec.loading} onClick={() => aDec.runAction(async () => {
          const r = await api.desencriptar(hex);
          return `Texto original: ${r.texto}`;
        })}>Desencriptar</button>
        <Msg result={aDec.result} />
      </Card>
    </>
  );
}
