import React, { useState } from 'react';
import { api } from '../api.js';
import { Card, Field, Msg, ResultTable, useAction } from '../ui.jsx';

// Tipos de préstamo sembrados en los datos de prueba (ADM02).
const TIPOS = [
  { id: 1, nombre: 'Personal (2.5%) · S/1000–30000 · 6–36m' },
  { id: 2, nombre: 'Emprendedor (3%) · S/5000–50000 · 12–48m' },
  { id: 3, nombre: 'Express (4%) · S/500–5000 · 3–12m' },
];

// ================= VAL01–VAL03: SOLICITUDES (Analista) =================
export function SolicitudesPanel({ user }) {
  const [f, setF] = useState({ id_cliente: '', id_tipo_prestamo: 1, monto: '', plazo_meses: '' });
  const [idSol, setIdSol] = useState('');
  const [dec, setDec] = useState('APROBAR');
  const a1 = useAction(); const a2 = useAction(); const a3 = useAction();
  const set = (k) => (v) => setF({ ...f, [k]: v });

  return (
    <>
      <Card code="VAL01" title="Registrar solicitud de préstamo">
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
        <button className="btn primary" disabled={a1.loading} onClick={() => a1.runAction(async () => {
          const r = await api.registrarSolicitud({
            id_cliente: Number(f.id_cliente), id_tipo_prestamo: f.id_tipo_prestamo,
            monto: Number(f.monto), plazo_meses: Number(f.plazo_meses), id_analista: user.id,
          });
          setIdSol(String(r.id_solicitud));
          return `${r.mensaje}. ID solicitud = ${r.id_solicitud}`;
        })}>Registrar</button>
        <Msg result={a1.result} />
      </Card>

      <Card code="VAL02" title="Evaluar capacidad de pago y calificar (A/B/C/D)">
        <div className="grid">
          <Field label="ID Solicitud" type="number" value={idSol} onChange={setIdSol} />
        </div>
        <button className="btn" disabled={a2.loading} onClick={() => a2.runAction(async () => {
          const r = await api.evaluarSolicitud(Number(idSol));
          return `Calificación asignada: ${r.calificacion}`;
        })}>Evaluar</button>
        <Msg result={a2.result} />
      </Card>

      <Card code="VAL03" title="Aprobar / rechazar solicitud (D se rechaza; genera cronograma)">
        <div className="grid">
          <Field label="ID Solicitud" type="number" value={idSol} onChange={setIdSol} />
          <label className="field">
            <span>Decisión</span>
            <select value={dec} onChange={(e) => setDec(e.target.value)}>
              <option value="APROBAR">APROBAR</option>
              <option value="RECHAZAR">RECHAZAR</option>
            </select>
          </label>
        </div>
        <button className="btn primary" disabled={a3.loading} onClick={() => a3.runAction(async () => {
          const r = await api.decidirSolicitud(Number(idSol), dec, user.id);
          return r.mensaje;
        })}>Decidir</button>
        <Msg result={a3.result} />
      </Card>
    </>
  );
}

// ================= VAL05: PAGOS (Cajero) =================
export function PagosPanel({ user }) {
  const [f, setF] = useState({ id_cuota: '', monto: '', medio_pago: 'EFECTIVO' });
  const act = useAction();
  const set = (k) => (v) => setF({ ...f, [k]: v });
  return (
    <Card code="VAL05" title="Registrar pago de cuota">
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
      <p className="hint">💡 El ID de cuota lo obtienes en Consultas → Cronograma (CON01) de un préstamo aprobado.</p>
    </Card>
  );
}

// ================= ADM01: CLIENTES (Analista / Admin) =================
export function ClientesPanel({ user }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({
    dni: '', nombres: '', apellidos: '', fecha_nac: '1990-01-01',
    telefono: '', email: '', direccion: '', ingreso: '',
  });
  const act = useAction();
  const set = (k) => (v) => setF({ ...f, [k]: v });
  return (
    <Card code="ADM01" title="Registrar cliente (valida DNI 8 dígitos, mayoría de edad, ingreso > 0)">
      <div className="grid">
        <Field label="DNI" value={f.dni} onChange={set('dni')} maxLength={8} />
        <Field label="Nombres" value={f.nombres} onChange={set('nombres')} />
        <Field label="Apellidos" value={f.apellidos} onChange={set('apellidos')} />
        <Field label="Fecha nacimiento" type="date" value={f.fecha_nac} onChange={set('fecha_nac')} max={hoy} />
        <Field label="Teléfono" value={f.telefono} onChange={set('telefono')} />
        <Field label="Email" value={f.email} onChange={set('email')} />
        <Field label="Dirección" value={f.direccion} onChange={set('direccion')} />
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

// ================= CON01–CON05: CONSULTAS OPERATIVAS =================
export function ConsultasPanel() {
  return (
    <>
      <QueryCard code="CON01" title="Cronograma de un préstamo"
        inputs={[{ key: 'id', label: 'ID Préstamo', type: 'number' }]}
        run={(v) => api.cronograma(Number(v.id))} />
      <QueryCard code="CON02" title="Saldo y estado de un préstamo"
        inputs={[{ key: 'id', label: 'ID Préstamo', type: 'number' }]}
        run={(v) => api.estadoPrestamo(Number(v.id))} />
      <QueryCard code="CON03" title="Historial de pagos de un cliente"
        inputs={[{ key: 'id', label: 'ID Cliente', type: 'number' }]}
        run={(v) => api.historialPagos(Number(v.id))} />
      <QueryCard code="CON04" title="Buscar clientes por nombre / apellido / DNI"
        inputs={[{ key: 'c', label: 'Criterio' }]}
        run={(v) => api.buscarClientes(v.c || '')} />
      <QueryCard code="CON05" title="Cuotas vencidas / morosas (opcional por cliente)"
        inputs={[{ key: 'id', label: 'ID Cliente (vacío = todas)', type: 'number', optional: true }]}
        run={(v) => api.cuotasMorosas(v.id ? Number(v.id) : null)} />
    </>
  );
}

// Tarjeta genérica de consulta: inputs -> botón -> tabla de resultados.
export function QueryCard({ code, title, inputs, run }) {
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
  return (
    <Card code={code} title={title}>
      <div className="grid">
        {inputs.map((inp) => (
          <Field key={inp.key} label={inp.label} type={inp.type || 'text'}
            value={vals[inp.key] || ''} onChange={(v) => setVals({ ...vals, [inp.key]: v })} />
        ))}
      </div>
      <button className="btn" disabled={loading} onClick={exec}>{loading ? 'Consultando…' : 'Consultar'}</button>
      {err && <Msg result={{ type: 'error', text: err }} />}
      {data !== null && <ResultTable rows={data} />}
    </Card>
  );
}
