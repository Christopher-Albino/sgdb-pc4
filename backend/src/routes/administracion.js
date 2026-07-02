import { Router } from 'express';
import oracledb from 'oracledb';
import { run, SCHEMA } from '../db.js';

const router = Router();
const PKG = `${SCHEMA.NEGOCIO}.PKG_ADMINISTRACION`;

// ADM01 — Registrar cliente (valida DNI 8 dígitos único, mayoría de edad, ingreso > 0)
//   POST /api/admin/clientes
router.post('/clientes', async (req, res) => {
  const { dni, nombres, apellidos, fecha_nac, telefono, email, direccion, ingreso, id_usuario_reg } = req.body;
  try {
    const r = await run(
      `BEGIN ${PKG}.registrar_cliente(:dni, :nom, :ape, TO_DATE(:fn,'YYYY-MM-DD'),
              :tel, :em, :dir, :ing, :ureg, :id); END;`,
      {
        dni, nom: nombres, ape: apellidos, fn: fecha_nac, tel: telefono, em: email,
        dir: direccion, ing: ingreso, ureg: id_usuario_reg,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.json({ ok: true, id_cliente: r.outBinds.id, mensaje: 'Cliente registrado' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ADM01 (variante) — Actualizar cliente
//   PUT /api/admin/clientes/:id
router.put('/clientes/:id', async (req, res) => {
  const { telefono, email, direccion, ingreso, estado } = req.body;
  try {
    await run(
      `BEGIN ${PKG}.actualizar_cliente(:id, :tel, :em, :dir, :ing, :est); END;`,
      { id: Number(req.params.id), tel: telefono, em: email, dir: direccion, ing: ingreso, est: estado }
    );
    res.json({ ok: true, mensaje: 'Cliente actualizado' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ADM02 — Registrar tipo de préstamo (con su tasa, rangos de monto y plazo)
//   POST /api/admin/tipos-prestamo
router.post('/tipos-prestamo', async (req, res) => {
  const { nombre, tasa, monto_min, monto_max, plazo_min, plazo_max } = req.body;
  try {
    const r = await run(
      `BEGIN ${PKG}.registrar_tipo_prestamo(:n, :t, :mmin, :mmax, :pmin, :pmax, :id); END;`,
      {
        n: nombre, t: tasa, mmin: monto_min, mmax: monto_max, pmin: plazo_min, pmax: plazo_max,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.json({ ok: true, id_tipo: r.outBinds.id, mensaje: 'Tipo de préstamo registrado' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ADM02 (variante) — Actualizar tasa de un tipo de préstamo
//   PUT /api/admin/tipos-prestamo/:id/tasa
router.put('/tipos-prestamo/:id/tasa', async (req, res) => {
  try {
    await run(
      `BEGIN ${PKG}.actualizar_tasa(:id, :t); END;`,
      { id: Number(req.params.id), t: req.body.tasa }
    );
    res.json({ ok: true, mensaje: 'Tasa actualizada' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ADM03 — Gestionar usuario (crea usuario del sistema con su rol; delega en PKG_SEGURIDAD)
//   POST /api/admin/usuarios
router.post('/usuarios', async (req, res) => {
  const { username, password, nombre_rol, nombre, email, id_admin } = req.body;
  try {
    const r = await run(
      `BEGIN ${PKG}.gestionar_usuario(:u, :p, :rol, :n, :em, :adm, :id); END;`,
      {
        u: username, p: password, rol: nombre_rol, n: nombre, em: email, adm: id_admin,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.json({ ok: true, id_usuario: r.outBinds.id, mensaje: 'Usuario creado' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ADM04 — Actualizar un parámetro del sistema (ej. PORC_CAPACIDAD, DIAS_MOROSIDAD)
//   PUT /api/admin/parametros/:codigo
router.put('/parametros/:codigo', async (req, res) => {
  const { valor, id_admin } = req.body;
  try {
    await run(
      `BEGIN ${PKG}.actualizar_parametro(:cod, :val, :adm); END;`,
      { cod: req.params.codigo, val: String(valor), adm: id_admin }
    );
    res.json({ ok: true, mensaje: `Parámetro ${req.params.codigo} actualizado` });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ADM05 — Agregar cliente a lista negra
//   POST /api/admin/lista-negra
router.post('/lista-negra', async (req, res) => {
  const { id_cliente, motivo, id_usuario_reg } = req.body;
  try {
    const r = await run(
      `BEGIN ${PKG}.agregar_lista_negra(:c, :m, :u, :id); END;`,
      {
        c: id_cliente, m: motivo, u: id_usuario_reg,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.json({ ok: true, id_lista: r.outBinds.id, mensaje: 'Cliente agregado a lista negra' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ADM05 (variante) — Quitar cliente de lista negra
//   DELETE /api/admin/lista-negra/:idCliente
router.delete('/lista-negra/:idCliente', async (req, res) => {
  try {
    await run(`BEGIN ${PKG}.quitar_lista_negra(:c); END;`, { c: Number(req.params.idCliente) });
    res.json({ ok: true, mensaje: 'Cliente retirado de lista negra' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
