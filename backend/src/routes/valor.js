import { Router } from 'express';
import oracledb from 'oracledb';
import { run, SCHEMA } from '../db.js';

const router = Router();
const PKG = `${SCHEMA.NEGOCIO}.PKG_VALOR`;

// VAL01 — Registrar solicitud de préstamo
//   POST /api/valor/solicitudes
router.post('/solicitudes', async (req, res) => {
  const { id_cliente, id_tipo_prestamo, monto, plazo_meses, id_analista } = req.body;
  try {
    const r = await run(
      `BEGIN ${PKG}.registrar_solicitud(:c, :t, :m, :p, :a, :id); END;`,
      {
        c: id_cliente, t: id_tipo_prestamo, m: monto, p: plazo_meses, a: id_analista,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.json({ ok: true, id_solicitud: r.outBinds.id, mensaje: 'Solicitud registrada (PENDIENTE)' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// VAL02 — Evaluar capacidad de pago y calificar (A/B/C/D)
//   POST /api/valor/solicitudes/:id/evaluar
router.post('/solicitudes/:id/evaluar', async (req, res) => {
  try {
    const r = await run(
      `BEGIN ${PKG}.evaluar_solicitud(:id, :cal); END;`,
      {
        id: Number(req.params.id),
        cal: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 1 },
      }
    );
    res.json({ ok: true, calificacion: r.outBinds.cal, mensaje: 'Solicitud evaluada' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// VAL03 — Aprobar o rechazar (decision: 'APROBAR' | 'RECHAZAR')
//   Si aprueba, el package genera automáticamente el préstamo + cronograma (VAL04).
//   POST /api/valor/solicitudes/:id/decidir
router.post('/solicitudes/:id/decidir', async (req, res) => {
  const { decision, id_analista } = req.body;
  try {
    await run(
      `BEGIN ${PKG}.decidir_solicitud(:id, :dec, :a); END;`,
      { id: Number(req.params.id), dec: decision, a: id_analista }
    );
    res.json({ ok: true, mensaje: `Solicitud ${decision === 'APROBAR' ? 'aprobada' : 'rechazada'}` });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// VAL04 — Generar cronograma (método francés) manualmente para un préstamo
//   POST /api/valor/prestamos/:id/cronograma
router.post('/prestamos/:id/cronograma', async (req, res) => {
  try {
    await run(`BEGIN ${PKG}.generar_cronograma(:id); END;`, { id: Number(req.params.id) });
    res.json({ ok: true, mensaje: 'Cronograma generado' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// VAL05 — Registrar pago de cuota
//   POST /api/valor/pagos
router.post('/pagos', async (req, res) => {
  const { id_cuota, monto, medio_pago, id_cajero } = req.body;
  try {
    await run(
      `BEGIN ${PKG}.registrar_pago(:cu, :m, :med, :caj); END;`,
      { cu: id_cuota, m: monto, med: medio_pago, caj: id_cajero }
    );
    res.json({ ok: true, mensaje: 'Pago registrado' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
